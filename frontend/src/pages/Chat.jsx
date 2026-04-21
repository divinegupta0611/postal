import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';   // ← shared singleton, fixes "Multiple GoTrueClient"
import '../styles/ChatCSS.css';

// ─── Xenova Transformers (all-MiniLM-L6-v2, runs 100% in browser) ────────────
let _embedder = null;
async function getEmbedder() {
  if (_embedder) return _embedder;
  const { pipeline, env } = await import(
    'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js'
  );
  env.allowLocalModels = false;
  _embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  return _embedder;
}

async function embedText(text) {
  const emb = await getEmbedder();
  const out  = await emb(text, { pooling: 'mean', normalize: true });
  return Array.from(out.data); // float32[] length 384
}

// ─── In-browser vector store (cosine similarity) ─────────────────────────────
class VectorStore {
  constructor() {
    this.docs = [];
    this.vecs = [];
  }

  async addDocuments(docs) {
    for (const doc of docs) {
      const vec = await embedText(doc.pageContent);
      this.docs.push(doc);
      this.vecs.push(vec);
    }
  }

  _cosine(a, b) {
    let dot = 0;
    for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
    return dot;
  }

  async similaritySearch(query, k = 4) {
    const qVec   = await embedText(query);
    const scored = this.vecs.map((v, i) => ({ i, score: this._cosine(qVec, v) }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, k).map(s => ({ ...this.docs[s.i], score: scored.find(x => x.i === s.i).score }));
  }
}

// ─── Pure in-browser answer synthesis (no external API) ──────────────────────
// Extracts relevant sentences from retrieved chunks and formats a clean answer.
function synthesiseAnswer(question, docs) {
  if (!docs || docs.length === 0) {
    return "I couldn't find any relevant information for that question.";
  }

  const q = question.toLowerCase();

  // Pull all key-value pairs out of retrieved docs
  const allPairs = [];
  for (const doc of docs) {
    const segments = doc.pageContent.split(' | ');
    for (const seg of segments) {
      const idx = seg.indexOf(':');
      if (idx === -1) continue;
      const key = seg.slice(0, idx).replace(/^[A-Za-z]+ — /, '').trim();
      const val = seg.slice(idx + 1).trim();
      if (val && val !== 'N/A' && val !== '' && val !== 'undefined') {
        allPairs.push({ key, val, source: doc.pageContent.split(' | ')[0] });
      }
    }
  }

  if (allPairs.length === 0) {
    return "I found some documents but couldn't extract specific details. Try rephrasing your question.";
  }

  // Keyword-based smart routing
  const isBrandQ    = /brand|company|industr|product|audience|platform|tone|style|theme|goal|website|description/i.test(q);
  const isProfileQ  = /profile|user|who|name|email|person|registr/i.test(q);
  const isPostQ     = /post|content|wrote|written|publish|recent/i.test(q);
  const isListQ     = /list|all|show|what are|tell me|overview/i.test(q);
  const isPlatformQ = /platform|linkedin|twitter|instagram|x\b/i.test(q);
  const isIndustryQ = /industr|sector|field|niche/i.test(q);
  const isToneQ     = /tone|style|voice|writ/i.test(q);

  // Build answer lines
  const lines = [];

  if (isProfileQ) {
    const names  = allPairs.filter(p => p.key === 'Full Name').map(p => p.val);
    const emails = allPairs.filter(p => p.key === 'Email').map(p => p.val);
    if (names.length)  lines.push(`**Registered users (${names.length}):** ${names.join(', ')}`);
    if (emails.length) lines.push(`**Emails:** ${emails.join(', ')}`);
  }

  if (isBrandQ || isListQ) {
    const companies = allPairs.filter(p => p.key === 'Company').map(p => p.val);
    if (companies.length) lines.push(`**Brands found (${companies.length}):** ${companies.join(', ')}`);

    if (isBrandQ && !isListQ && companies.length > 0) {
      const descs = allPairs.filter(p => p.key === 'Description' && p.val.length > 10).map(p => p.val);
      if (descs.length) lines.push(`**Descriptions:**\n${descs.map(d => `• ${d}`).join('\n')}`);
    }
  }

  if (isIndustryQ) {
    const industries = allPairs.filter(p => p.key === 'Industry').map(p => p.val);
    if (industries.length) lines.push(`**Industries covered:** ${[...new Set(industries)].join(', ')}`);
  }

  if (isPlatformQ) {
    const platforms = allPairs.filter(p => p.key === 'Platforms').map(p => p.val);
    if (platforms.length) lines.push(`**Platforms in use:** ${[...new Set(platforms.flatMap(p => p.split(', ')))].join(', ')}`);
  }

  if (isToneQ) {
    const tones = allPairs.filter(p => p.key === 'Tones' || p.key === 'Writing Style').map(p => `${p.key}: ${p.val}`);
    if (tones.length) lines.push(`**Tones & styles:**\n${tones.map(t => `• ${t}`).join('\n')}`);
  }

  if (isPostQ) {
    const posts = allPairs.filter(p => p.key === 'Content').map(p => p.val);
    if (posts.length) lines.push(`**Recent post${posts.length > 1 ? 's' : ''}:**\n${posts.slice(0, 3).map(p => `• "${p.slice(0, 120)}${p.length > 120 ? '…' : ''}"`).join('\n')}`);
  }

  // Fallback: surface the most relevant raw values
  if (lines.length === 0) {
    const topPairs = allPairs.slice(0, 6);
    lines.push('Here\'s what I found in the most relevant documents:');
    for (const { key, val } of topPairs) {
      lines.push(`• **${key}:** ${val.slice(0, 150)}${val.length > 150 ? '…' : ''}`);
    }
  }

  return lines.join('\n\n');
}

// ─── RAG chain (no external API — fully in-browser) ──────────────────────────
async function ragChain(question, store) {
  const docs   = await store.similaritySearch(question, 4);
  const answer = synthesiseAnswer(question, docs);
  return answer;
}

// ─── Supabase → Documents ─────────────────────────────────────────────────────
function rowsToDocuments(profiles, brands, posts) {
  const docs = [];

  (profiles || []).forEach(p => {
    docs.push({
      pageContent:
        `Profile — Full Name: ${p.full_name || 'N/A'} | ` +
        `Email: ${p.email || 'N/A'} | ` +
        `Created: ${p.created_at || ''}`,
      metadata: { table: 'profiles', id: p.id },
    });
  });

  (brands || []).forEach(b => {
    docs.push({
      pageContent:
        `Brand — Company: ${b.company_name || 'N/A'} | ` +
        `Industry: ${b.industry || ''} | ` +
        `Description: ${b.short_description || ''} | ` +
        `Detailed: ${b.detailed_description || ''} | ` +
        `Products: ${(b.products || []).join(', ')} | ` +
        `Audience: ${b.primary_audience || ''} | ` +
        `Geography: ${b.geography || ''} | ` +
        `Platforms: ${(b.platforms || []).join(', ')} | ` +
        `Tones: ${(b.tones || []).join(', ')} | ` +
        `Writing Style: ${b.writing_style || ''} | ` +
        `Key Themes: ${(b.key_themes || []).join(', ')} | ` +
        `Goals: ${(b.content_goals || []).join(', ')} | ` +
        `Website: ${b.website_url || ''}`,
      metadata: { table: 'brands', id: b.id },
    });
  });

  (posts || []).forEach(p => {
    docs.push({
      pageContent:
        `Post — Platform: ${p.platform || 'N/A'} | ` +
        `Content: ${p.content || ''} | ` +
        `Created: ${p.created_at || ''}`,
      metadata: { table: 'posts', id: p.id },
    });
  });

  return docs;
}

// ─── Typewriter hook ──────────────────────────────────────────────────────────
function useTypewriter(text, speed = 10) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text]);
  return displayed;
}

// ─── Simple markdown renderer (bold + bullet lines) ──────────────────────────
function renderMarkdown(text) {
  return text.split('\n').map((line, i) => {
    // bold **text**
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={j}>{part.slice(2, -2)}</strong>
        : part
    );
    return <span key={i} style={{ display: 'block', marginBottom: line === '' ? '0.5rem' : '0.15rem' }}>{parts}</span>;
  });
}

// ─── Bubble ───────────────────────────────────────────────────────────────────
function Bubble({ msg, animate }) {
  const isBot = msg.role === 'bot';
  const typed = useTypewriter(isBot && animate ? msg.content : '');
  const text  = isBot && animate ? typed : msg.content;

  return (
    <div className={`cp-row ${isBot ? 'cp-row--bot' : 'cp-row--user'}`}>
      {isBot && (
        <div className="cp-avatar cp-avatar--bot">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.18"/>
            <circle cx="8.5"  cy="10" r="1.3" fill="currentColor"/>
            <circle cx="15.5" cy="10" r="1.3" fill="currentColor"/>
            <path d="M9 14s.8 1.5 3 1.5 3-1.5 3-1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </div>
      )}
      <div className={`cp-bubble ${isBot ? 'cp-bubble--bot' : 'cp-bubble--user'}`}>
        <div className="cp-bubble__text">
          {isBot ? renderMarkdown(text) : text}
          {isBot && animate && text.length < msg.content.length && (
            <span className="cp-cursor">▋</span>
          )}
        </div>
        <span className="cp-bubble__time">{msg.time}</span>
      </div>
      {!isBot && (
        <div className="cp-avatar cp-avatar--user">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" fill="currentColor" opacity="0.85"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </div>
      )}
    </div>
  );
}

// ─── Typing dots ──────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="cp-row cp-row--bot">
      <div className="cp-avatar cp-avatar--bot">
        <svg viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.18"/>
          <circle cx="8.5"  cy="10" r="1.3" fill="currentColor"/>
          <circle cx="15.5" cy="10" r="1.3" fill="currentColor"/>
          <path d="M9 14s.8 1.5 3 1.5 3-1.5 3-1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="cp-bubble cp-bubble--bot cp-bubble--typing">
        <span className="cp-dot"/><span className="cp-dot"/><span className="cp-dot"/>
      </div>
    </div>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────
const SUGGESTIONS = [
  { icon: '🏢', text: 'Tell me about the brands here' },
  { icon: '👤', text: 'Who are the registered profiles?' },
  { icon: '📝', text: 'Show me recent posts' },
  { icon: '🎯', text: 'What industries are covered?' },
  { icon: '📍', text: 'What platforms are brands on?' },
  { icon: '✍️', text: 'What writing styles are used?' },
];

function nowStr() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const Chat = () => {
  const [messages, setMessages] = useState([{
    role: 'bot',
    content: "Hi! 👋 I'm your AI assistant. I'm loading your Supabase data — one moment…",
    time: nowStr(),
  }]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);

  const [stage,     setStage]     = useState('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [docCount,  setDocCount]  = useState(0);

  const storeRef   = useRef(null);
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);

  // ── Pipeline ────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function buildIndex() {
      try {
        // Step 1: load embedding model
        setStage('loading_model');
        setStatusMsg('Loading MiniLM model…');
        await getEmbedder();
        if (cancelled) return;

        // Step 2: fetch Supabase tables using the SHARED client
        setStage('fetching_data');

        setStatusMsg('Fetching profiles…');
        const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
        if (pErr) throw new Error(`profiles: ${pErr.message}`);

        setStatusMsg('Fetching brands…');
        const { data: brands, error: bErr } = await supabase.from('brands').select('*');
        if (bErr) throw new Error(`brands: ${bErr.message}`);

        setStatusMsg('Fetching posts…');
        const { data: posts, error: postErr } = await supabase.from('posts').select('*');
        if (postErr) throw new Error(`posts: ${postErr.message}`);

        if (cancelled) return;

        // Step 3: build vector index
        const docs = rowsToDocuments(profiles, brands, posts);
        if (docs.length === 0) {
          setStage('error');
          setStatusMsg('⚠ No data found in your tables.');
          return;
        }

        setStage('building_index');
        setStatusMsg(`Embedding ${docs.length} documents…`);
        const store = new VectorStore();
        await store.addDocuments(docs);
        if (cancelled) return;

        storeRef.current = store;
        setDocCount(docs.length);
        setStage('ready');
        setStatusMsg(`${docs.length} docs indexed`);

        // Update welcome message
        setMessages(prev => [{
          ...prev[0],
          content: `Hi! 👋 I'm ready. I've indexed **${docs.length} documents** from your Supabase — brands, profiles, and posts. Ask me anything!`,
        }, ...prev.slice(1)]);

      } catch (err) {
        console.error('RAG pipeline error:', err);
        if (!cancelled) {
          setStage('error');
          setStatusMsg(`❌ ${err.message}`);
          setMessages(prev => [{
            ...prev[0],
            content: `⚠ Setup failed: ${err.message}. Check your Supabase connection and table permissions.`,
          }, ...prev.slice(1)]);
        }
      }
    }

    buildIndex();
    return () => { cancelled = true; };
  }, []);  // runs once on mount

  // ── Auto-scroll ─────────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // ── Send ────────────────────────────────────────────────────────────────────
  const send = useCallback(async (override) => {
    const q = (override !== undefined ? override : input).trim();
    if (!q || loading || stage !== 'ready') return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: q, time: nowStr() }]);
    setLoading(true);

    try {
      const answer = await ragChain(q, storeRef.current);
      setMessages(prev => [...prev, { role: 'bot', content: answer, time: nowStr() }]);
    } catch (err) {
      console.error('RAG error:', err);
      setMessages(prev => [...prev, {
        role: 'bot',
        content: `⚠ Error: ${err.message}`,
        time: nowStr(),
      }]);
    }
    setLoading(false);
  }, [input, loading, stage]);

  const onKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  // Last bot message index (for typewriter)
  const lastBotIdx = (() => {
    for (let i = messages.length - 1; i >= 0; i--)
      if (messages[i].role === 'bot') return i;
    return -1;
  })();

  const isReady   = stage === 'ready';
  const isError   = stage === 'error';
  const showWelcome = messages.length <= 1 && !loading;

  const stageLabel = {
    idle:           '',
    loading_model:  'Loading model…',
    fetching_data:  'Fetching data…',
    building_index: 'Building index…',
    ready:          statusMsg,
    error:          statusMsg,
  }[stage] || statusMsg;

  return (
    <div className="cp-page">

      {/* ─── SIDEBAR ─── */}
      <aside className="cp-sidebar">
        <div className="cp-sidebar__brand">
          <div className="cp-sidebar__brand-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15"/>
              <circle cx="8.5"  cy="10" r="1.3" fill="currentColor"/>
              <circle cx="15.5" cy="10" r="1.3" fill="currentColor"/>
              <path d="M9 14s.8 1.5 3 1.5 3-1.5 3-1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <h2 className="cp-sidebar__name">AI Assistant</h2>
            <span className="cp-sidebar__tagline">RAG · MiniLM · Supabase</span>
          </div>
        </div>

        {/* Pipeline status */}
        <div className={`cp-status cp-status--${isReady ? 'ready' : isError ? 'error' : 'loading'}`}>
          {!isReady && !isError && <span className="cp-status__spinner" />}
          {(isReady || isError) && <span className="cp-status__dot" />}
          <span className="cp-status__text">{stageLabel}</span>
        </div>

        {/* Progress steps */}
        <div className="cp-pipeline">
          {[
            { key: 'loading_model',  label: 'Load MiniLM model' },
            { key: 'fetching_data',  label: 'Fetch Supabase data' },
            { key: 'building_index', label: 'Build vector index' },
            { key: 'ready',          label: 'RAG chain ready' },
          ].map((step) => {
            const order  = ['loading_model','fetching_data','building_index','ready'];
            const curIdx = order.indexOf(stage);
            const sIdx   = order.indexOf(step.key);
            const done   = curIdx > sIdx || stage === 'ready';
            const active = curIdx === sIdx && !isError;
            return (
              <div key={step.key} className={`cp-step ${done ? 'cp-step--done' : active ? 'cp-step--active' : ''}`}>
                <span className="cp-step__dot" />
                <span className="cp-step__label">{step.label}</span>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        {isReady && (
          <div className="cp-stats">
            <div className="cp-stat">
              <span className="cp-stat__num">{docCount}</span>
              <span className="cp-stat__lbl">Docs</span>
            </div>
            <div className="cp-stat">
              <span className="cp-stat__num">384</span>
              <span className="cp-stat__lbl">Dims</span>
            </div>
            <div className="cp-stat">
              <span className="cp-stat__num">{messages.filter(m => m.role === 'user').length}</span>
              <span className="cp-stat__lbl">Asked</span>
            </div>
          </div>
        )}

        <div className="cp-divider" />

        {/* Data sources */}
        <p className="cp-section-label">DATA SOURCES</p>
        {[
          { icon: '👤', name: 'profiles', cols: 'id · email · full_name' },
          { icon: '🎨', name: 'brands',   cols: 'company · industry · description' },
          { icon: '📝', name: 'posts',    cols: 'content · platform · created_at' },
        ].map(s => (
          <div key={s.name} className="cp-source">
            <span className="cp-source__icon">{s.icon}</span>
            <div className="cp-source__info">
              <span className="cp-source__name">{s.name}</span>
              <span className="cp-source__cols">{s.cols}</span>
            </div>
            <span className={`cp-source__led ${isReady ? 'cp-source__led--on' : ''}`} />
          </div>
        ))}

        <div className="cp-divider" />

        {/* Quick prompts */}
        <p className="cp-section-label">QUICK PROMPTS</p>
        <div className="cp-quick-prompts">
          {SUGGESTIONS.map((s, i) => (
            <button key={i} className="cp-quick-btn"
              disabled={!isReady || loading}
              onClick={() => send(s.text)}>
              <span className="cp-quick-btn__icon">{s.icon}</span>
              <span className="cp-quick-btn__text">{s.text}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* ─── CHAT ─── */}
      <div className="cp-chat">
        <div className="cp-messages">

          {/* Welcome / progress */}
          {showWelcome && !isReady && !isError && (
            <div className="cp-welcome">
              <p className="cp-welcome__label">Initialising RAG pipeline…</p>
              <div className="cp-init-progress">
                <div className="cp-init-bar">
                  <div className={`cp-init-fill cp-init-fill--${stage}`} />
                </div>
                <p className="cp-init-label">{stageLabel}</p>
              </div>
            </div>
          )}

          {showWelcome && isReady && (
            <div className="cp-welcome">
              <p className="cp-welcome__label">Suggested questions</p>
              <div className="cp-welcome__grid">
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} className="cp-welcome__chip" onClick={() => send(s.text)}>
                    <span className="cp-welcome__chip-icon">{s.icon}</span>
                    <span>{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <Bubble key={i} msg={msg} animate={i === lastBotIdx && !loading} />
          ))}
          {loading && <TypingDots />}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="cp-bar">
          <div className="cp-bar__inner">
            <textarea
              ref={inputRef}
              className="cp-bar__input"
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder={
                isError       ? 'Initialisation failed — check console' :
                !isReady      ? stageLabel :
                               'Ask anything about your brands, profiles, or posts…'
              }
              disabled={!isReady || loading}
            />
            <button
              className={`cp-bar__send ${(!input.trim() || !isReady || loading) ? 'cp-bar__send--off' : ''}`}
              onClick={() => send()}
              disabled={!input.trim() || !isReady || loading}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
          <p className="cp-bar__hint">Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
};

export default Chat;