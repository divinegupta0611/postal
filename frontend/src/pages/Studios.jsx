import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabase";
import "../styles/StudiosCSS.css";

/* ─── BACKEND URL ─── */
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

/* ─── CONSTANTS ─── */
const PLATFORMS = [
  { id: "linkedin",  label: "LinkedIn",  icon: "💼" },
  { id: "x",         label: "X",         icon: "✦" },
  { id: "instagram", label: "Instagram", icon: "📸" },
];

const GOALS = [
  "Awareness", "Engagement", "Sales", "Hiring", "Education", "Storytelling",
];

const TONES = [
  "Default (Brand)", "Professional", "Casual", "Bold", "Witty", "Empathetic",
];

const INTERVALS = ["Daily", "Every 2 days", "3× per week", "Weekly", "Custom"];

const CONTENT_TAGS = ["Educational", "Promotional", "Storytelling", "Viral", "News"];

const QUICK_ACTIONS = [
  { icon: "⚡", label: "Generate 5 hooks" },
  { icon: "🔥", label: "Make it viral" },
  { icon: "✂️", label: "Make shorter" },
  { icon: "📈", label: "Add CTA" },
  { icon: "🎯", label: "Rewrite tone" },
];

const AI_SUGGESTIONS = [
  "5 lessons I learned scaling from 0 to 10k users",
  "The uncomfortable truth about productivity advice",
  "Why most founders ignore this growth lever",
  "Hot take: meetings are killing your startup",
  "What I wish someone told me about fundraising",
];

const SAMPLE_DRAFTS = [
  { text: "5 lessons I learned building in public...", time: "2h ago", platform: "linkedin" },
  { text: "Hot take: your product roadmap is lying to you...", time: "Yesterday", platform: "x" },
  { text: "The moment I almost gave up — and what changed...", time: "3d ago", platform: "instagram" },
];

const VARIATION_LABELS = ["V1 — Original", "V2 — Bold", "V3 — Short"];

/* ─── CALENDAR HELPERS ─── */
const MONTH_NAMES = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];
const DAY_NAMES = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

/* ─── SUB-COMPONENTS ─── */

const PanelSectionLabel = ({ icon, label }) => (
  <div className="panel-section__label">
    <span className="panel-section__label-icon">{icon}</span>
    {label}
  </div>
);

const Stepper = ({ value, min = 1, max = 20, onChange }) => (
  <div className="stepper">
    <button className="stepper__btn" onClick={() => onChange(Math.max(min, value - 1))}>−</button>
    <span className="stepper__value">{value}</span>
    <button className="stepper__btn" onClick={() => onChange(Math.min(max, value + 1))}>+</button>
  </div>
);

const Toggle = ({ on, onToggle }) => (
  <button className={`toggle ${on ? "toggle--on" : ""}`} onClick={onToggle} />
);

function CalendarPreview({ scheduledDays }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const cells = buildCalendar(year, month);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const isToday = (d) =>
    d && d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const isScheduled = (d) => d && scheduledDays.includes(d);

  return (
    <div className="cal-preview">
      <div className="cal-preview__header">
        <span className="cal-preview__month">{MONTH_NAMES[month].slice(0, 3)} {year}</span>
        <div style={{ display: "flex", gap: "0.3rem" }}>
          <button onClick={prevMonth} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.9rem" }}>‹</button>
          <button onClick={nextMonth} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.9rem" }}>›</button>
        </div>
      </div>
      <div className="cal-grid">
        {DAY_NAMES.map(d => <div className="cal-day-name" key={d}>{d}</div>)}
        {cells.map((d, i) => (
          <div
            key={i}
            className={`cal-day ${isToday(d) ? "cal-day--today" : ""} ${isScheduled(d) ? "cal-day--scheduled" : ""}`}
          >
            {d || ""}
            {isScheduled(d) && <span className="cal-day__dot" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function PostCard({ post, platformLabel, platformIcon, onEdit, onAction, variationIdx, setVariationIdx }) {
  return (
    <div className="post-card" style={{ animationDelay: `${post.delay || 0}s` }}>
      {/* Header */}
      <div className="post-card__header">
        <div className="post-card__platform">
          <span className="post-card__platform-icon">{platformIcon}</span>
          {platformLabel}
        </div>
        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
          {post.tag && (
            <span className={`post-card__tag ${post.tag === "Viral" ? "post-card__tag--red" : ""}`}>
              {post.tag}
            </span>
          )}
          <span className="post-card__word-count">
            {post.wordCount} words
          </span>
        </div>
      </div>

      {/* Variations strip */}
      <div className="variations-strip">
        {VARIATION_LABELS.map((v, i) => (
          <button
            key={i}
            className={`variation-pill ${variationIdx === i ? "variation-pill--active" : ""}`}
            onClick={() => setVariationIdx(i)}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="post-card__body">
        <textarea
          className="post-card__textarea"
          value={post.text}
          onChange={(e) => onEdit(e.target.value)}
        />
      </div>

      {/* Footer */}
      <div className="post-card__footer">
        <div className="post-card__actions">
          <button className="post-action-btn" onClick={() => onAction("shorter")}>↓ Shorter</button>
          <button className="post-action-btn" onClick={() => onAction("longer")}>↑ Longer</button>
          <button className="post-action-btn" onClick={() => onAction("regenerate")}>↺ Rewrite</button>
          <button className="post-action-btn" onClick={() => onAction("emoji")}>😄 Emojis</button>
          <button className="post-action-btn" onClick={() => onAction("hashtags")}># Tags</button>
        </div>
        <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
            <button className="post-action-btn post-action-btn--accent" onClick={() => onAction("save")}>⬇ Save</button>
            <button className="post-action-btn post-action-btn--danger" onClick={() => onAction("delete")}>🗑 Delete</button>
            <button className="post-action-btn post-action-btn--accent" onClick={() => onAction("schedule")}>📅 Schedule</button>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN STUDIO COMPONENT ─── */
const Studio = () => {
  /* ── Brand from Supabase ── */
  const [brand, setBrand] = useState(null);
  const [brandLoading, setBrandLoading] = useState(true);

  /* ── Prompt state ── */
  const [prompt, setPrompt] = useState("");
  const [goal, setGoal] = useState(GOALS[0]);
  const [tone, setTone] = useState(TONES[0]);
  const [postCount, setPostCount] = useState(3);
  const [selectedPlatforms, setSelectedPlatforms] = useState(["linkedin", "x"]);
  const [bulkMode, setBulkMode] = useState(false);
  const [addEmojis, setAddEmojis] = useState(true);
  const [addHashtags, setAddHashtags] = useState(true);

  /* ── Generation state ── */
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activePlatformTab, setActivePlatformTab] = useState(null);
  const [variationIdxes, setVariationIdxes] = useState({});

  /* ── Schedule state ── */
  const [interval, setInterval] = useState(INTERVALS[0]);
  const [startDate, setStartDate] = useState("");
  const [postTime, setPostTime] = useState("09:00");
  const [scheduledDays, setScheduledDays] = useState([]);

  /* ── Drafts ── */
  const [drafts, setDrafts] = useState(SAMPLE_DRAFTS);

  const centerBodyRef = useRef(null);

  /* ── Fetch brand profile from Supabase on mount ── */
  useEffect(() => {
    const fetchBrand = async () => {
      setBrandLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setBrandLoading(false); return; }

        const { data, error } = await supabase
          .from("brands")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (data && !error) {
          setBrand(data);
          if (data.platforms && data.platforms.length > 0) {
            const mapped = data.platforms.map(p => p === "twitter" ? "x" : p);
            setSelectedPlatforms(mapped);
          }
        }
      } catch (err) {
        console.error("Error fetching brand:", err);
      } finally {
        setBrandLoading(false);
      }
    };
    fetchBrand();
  }, []);
/* ✅ ADD HERE — BELOW BRAND FETCH */
useEffect(() => {
  const savedPosts = localStorage.getItem("studio_posts");
  const savedVariations = localStorage.getItem("studio_variations");

  if (savedPosts) {
    setPosts(JSON.parse(savedPosts));
  }

  if (savedVariations) {
    setVariationIdxes(JSON.parse(savedVariations));
  }
}, []);

useEffect(() => {
  localStorage.setItem("studio_posts", JSON.stringify(posts));
}, [posts]);

useEffect(() => {
  localStorage.setItem("studio_variations", JSON.stringify(variationIdxes));
}, [variationIdxes]);
  const togglePlatform = (id) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSuggestion = (s) => setPrompt(s);

  /* ── MAIN GENERATE FUNCTION ── */
  const handleGenerate = async () => {
    if (!prompt.trim() || selectedPlatforms.length === 0) return;

    setIsGenerating(true);
    setGenerationError(null);
    setPosts([]);

    try {
      const response = await fetch(`${BACKEND_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand,
          userPrompt: prompt,
          platforms: selectedPlatforms,
          goal,
          tone,
          addEmojis,
          addHashtags,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Backend error");
      }

      const data = await response.json();

      const enriched = data.posts.map((p, i) => {
        const plat = PLATFORMS.find(pl => pl.id === p.platform);
        return {
          id: `${p.platform}-${Date.now()}-${i}`,
          platform: p.platform,
          platformLabel: plat?.label || p.platform,
          platformIcon: plat?.icon || "🌐",
          text: p.text,
          wordCount: p.wordCount,
          tag: i === 0 ? goal : i === 1 ? "Viral" : null,
          delay: i * 0.08,
        };
      });

      setPosts(enriched);
      setActivePlatformTab(selectedPlatforms[0]);
      setVariationIdxes(Object.fromEntries(enriched.map(p => [p.id, 0])));

      const today = new Date();
      const days = [];
      for (let i = 0; i < postCount && i < enriched.length * 2; i++) {
        days.push(today.getDate() + (i * (interval === "Daily" ? 1 : interval === "Every 2 days" ? 2 : 3)));
      }
      setScheduledDays(days.filter(d => d <= 31));

      setTimeout(() => {
        if (centerBodyRef.current) centerBodyRef.current.scrollTop = 0;
      }, 100);

    } catch (err) {
      console.error("Generation error:", err);
      setGenerationError(err.message || "Failed to generate content. Make sure your backend is running.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePostEdit = (postId, newText) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, text: newText, wordCount: newText.trim().split(/\s+/).filter(Boolean).length } : p
    ));
  };

const handlePostAction = async (postId, action) => {
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  // 🗑 DELETE (frontend only)
  if (action === "delete") {
    setPosts(prev => prev.filter(p => p.id !== postId));
    return;
  }

  // 💾 SAVE TO SUPABASE
  if (action === "save") {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not logged in");

      const { error } = await supabase
        .from("posts")
        .insert([
          {
            user_id: user.id,
            content: post.text,
            platform: post.platform,
          }
        ]);

      if (error) throw error;

      // Update drafts UI
      setDrafts(prev => [
        {
          text: post.text.slice(0, 60) + "...",
          time: "Just now",
          platform: post.platform
        },
        ...prev.slice(0, 4)
      ]);

    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save post");
    }
    return;
  }

  if (action === "schedule") return;

  // ✨ AI Actions
  setPosts(prev => prev.map(p =>
    p.id === postId ? { ...p, isLoading: true } : p
  ));

  try {
    const response = await fetch(`${BACKEND_URL}/api/post-action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: post.text,
        platform: post.platform,
        action
      }),
    });

    if (!response.ok) throw new Error("Action failed");

    const data = await response.json();

    setPosts(prev => prev.map(p =>
      p.id === postId
        ? {
            ...p,
            text: data.text,
            wordCount: data.text.trim().split(/\s+/).length,
            isLoading: false
          }
        : p
    ));

  } catch (err) {
    console.error("Action error:", err);
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, isLoading: false } : p
    ));
  }
};

  const setVariationIdx = (postId, idx) => {
    setVariationIdxes(prev => ({ ...prev, [postId]: idx }));
  };

  const visiblePosts = activePlatformTab
    ? posts.filter(p => p.platform === activePlatformTab)
    : posts;

  return (
    <div className="studio">

      {/* ═══ LEFT PANEL ═══ */}
      <aside className="studio__left">

        {/* BRAND BADGE */}
        {!brandLoading && brand && (
          <div className="panel-section">
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "0.5rem 0.75rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}>
              <span style={{ fontSize: "0.75rem" }}>🏷️</span>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text)" }}>
                  {brand.company_name || "Your Brand"}
                </div>
                <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
                  {brand.industry || "Brand profile loaded"} · AI-aware
                </div>
              </div>
              <span style={{ marginLeft: "auto", fontSize: "0.65rem", color: "var(--accent)", background: "rgba(255,220,80,0.1)", padding: "2px 6px", borderRadius: "4px" }}>
                ✓ Connected
              </span>
            </div>
          </div>
        )}

        {!brandLoading && !brand && (
          <div className="panel-section">
            <div style={{
              background: "rgba(255,180,0,0.06)",
              border: "1px solid rgba(255,180,0,0.2)",
              borderRadius: "8px",
              padding: "0.5rem 0.75rem",
              fontSize: "0.72rem",
              color: "var(--text-muted)",
            }}>
              ⚠️ No brand profile found.{" "}
              <a href="/brand-profile" style={{ color: "var(--accent)" }}>Set one up</a> for better results.
            </div>
          </div>
        )}

        {/* PROMPT */}
        <div className="panel-section">
          <PanelSectionLabel icon="✍️" label="Your Idea" />
          <div className="prompt-box">
            <textarea
              placeholder="What do you want to post about? A lesson, insight, story, product update..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              maxLength={400}
            />
            <div className="prompt-box__footer">
              <span className="prompt-box__char">{prompt.length}/400</span>
              {bulkMode && (
                <span className="bulk-badge" onClick={() => setBulkMode(false)}>
                  ⚡ Bulk mode
                </span>
              )}
            </div>
          </div>
        </div>

        {/* GOAL */}
        <div className="panel-section">
          <PanelSectionLabel icon="🎯" label="Content Goal" />
          <select className="studio-select" value={goal} onChange={e => setGoal(e.target.value)}>
            {GOALS.map(g => <option key={g}>{g}</option>)}
          </select>
        </div>

        {/* TONE */}
        <div className="panel-section">
          <PanelSectionLabel icon="🎙️" label="Tone Override" />
          <select className="studio-select" value={tone} onChange={e => setTone(e.target.value)}>
            {TONES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* PLATFORMS */}
        <div className="panel-section">
          <PanelSectionLabel icon="🌐" label="Platforms" />
          <div className="platform-chips">
            {PLATFORMS.map(p => (
              <button
                key={p.id}
                className={`platform-chip ${selectedPlatforms.includes(p.id) ? "platform-chip--active" : ""}`}
                onClick={() => togglePlatform(p.id)}
              >
                <span className="platform-chip__icon">{p.icon}</span>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* NUMBER OF POSTS */}
        <div className="panel-section">
          <PanelSectionLabel icon="📦" label="Posts to Generate" />
          <Stepper value={postCount} onChange={setPostCount} min={1} max={10} />
        </div>

        {/* TOGGLES */}
        <div className="panel-section">
          <PanelSectionLabel icon="⚙️" label="Options" />
          <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
            <div className="toggle-row">
              <span className="toggle-row__label">Add emojis</span>
              <Toggle on={addEmojis} onToggle={() => setAddEmojis(v => !v)} />
            </div>
            <div className="toggle-row">
              <span className="toggle-row__label">Add hashtags</span>
              <Toggle on={addHashtags} onToggle={() => setAddHashtags(v => !v)} />
            </div>
            <div className="toggle-row">
              <span className="toggle-row__label">Bulk mode</span>
              <Toggle on={bulkMode} onToggle={() => setBulkMode(v => !v)} />
            </div>
          </div>
        </div>

        <div className="studio-divider" />

        {/* GENERATE */}
        <button
          className="btn-generate"
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim() || selectedPlatforms.length === 0}
        >
          {isGenerating ? (
            <><div className="btn-generate__spinner" /> Generating...</>
          ) : (
            <><span>⚡</span> Generate Content</>
          )}
        </button>

        {/* QUICK ACTIONS */}
        <div className="panel-section">
          <PanelSectionLabel icon="🚀" label="Quick Actions" />
          <div className="quick-actions">
            {QUICK_ACTIONS.map(a => (
              <button key={a.label} className="quick-action-btn" onClick={() => {
                if (a.label.includes("hooks")) setPrompt(prev => prev + " — give me 5 hooks");
                if (a.label.includes("viral")) setTone("Bold");
              }}>
                <span style={{ fontSize: "0.9rem" }}>{a.icon}</span>
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* AI SUGGESTIONS */}
        <div className="panel-section">
          <PanelSectionLabel icon="🧠" label="AI Suggestions" />
          <div className="suggestion-chips">
            {AI_SUGGESTIONS.map(s => (
              <button key={s} className="suggestion-chip" onClick={() => handleSuggestion(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>

      </aside>

      {/* ═══ CENTER PANEL ═══ */}
      <main className="studio__center">
        <div className="studio__center-header">
          <span className="studio__center-title">
            {posts.length > 0 ? `${posts.length} post${posts.length > 1 ? "s" : ""} generated` : "Content Studio"}
          </span>
          <div className="platform-tabs">
            {posts.length > 0 && (
              <>
                <button
                  className={`platform-tab ${activePlatformTab === null ? "platform-tab--active" : ""}`}
                  onClick={() => setActivePlatformTab(null)}
                >
                  All
                </button>
                {selectedPlatforms.filter(p => posts.some(post => post.platform === p)).map(pid => {
                  const plat = PLATFORMS.find(p => p.id === pid);
                  return (
                    <button
                      key={pid}
                      className={`platform-tab ${activePlatformTab === pid ? "platform-tab--active" : ""}`}
                      onClick={() => setActivePlatformTab(pid)}
                    >
                      {plat.icon} {plat.label}
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>

        <div className="studio__center-body" ref={centerBodyRef}>

          {/* GENERATING STATE */}
          {isGenerating && (
            <div className="studio__empty">
              <div className="studio__empty-icon">✨</div>
              <h3>Crafting your content...</h3>
              <p>
                Generating brand-aware posts for {selectedPlatforms.length} platform{selectedPlatforms.length > 1 ? "s" : ""}
                {brand ? ` using ${brand.company_name || "your brand"}'s voice` : ""}.
              </p>
            </div>
          )}

          {/* ERROR STATE */}
          {!isGenerating && generationError && (
            <div className="studio__empty">
              <div className="studio__empty-icon">⚠️</div>
              <h3>Generation failed</h3>
              <p style={{ color: "var(--text-muted)" }}>{generationError}</p>
              <button className="btn-generate" style={{ marginTop: "1rem", maxWidth: "200px" }} onClick={handleGenerate}>
                Try Again
              </button>
            </div>
          )}

          {/* EMPTY STATE */}
          {!isGenerating && !generationError && posts.length === 0 && (
            <div className="studio__empty">
              <div className="studio__empty-icon">⚡</div>
              <h3>Your content engine</h3>
              <p>
                {brand
                  ? `Write an idea, and AI will generate posts in ${brand.company_name || "your brand"}'s voice across your platforms.`
                  : "Write an idea on the left, pick your platforms, and generate brand-aware posts in seconds."}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center", marginTop: "0.5rem" }}>
                {CONTENT_TAGS.map(tag => (
                  <span key={tag} style={{
                    fontSize: "0.75rem", padding: "0.3rem 0.7rem", borderRadius: "20px",
                    border: "1px solid var(--border)", color: "var(--text-muted)"
                  }}>{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* GENERATED POSTS */}
          {!isGenerating && visiblePosts.map((post) => (
            <div key={post.id} style={{ position: "relative" }}>
              {post.isLoading && (
                <div className="post-card__overlay">
                  <div className="btn-generate__spinner" style={{ borderColor: "rgba(240,240,255,0.2)", borderTopColor: "var(--text-muted)" }} />
                  Rewriting...
                </div>
              )}
              <PostCard
                post={post}
                platformLabel={post.platformLabel}
                platformIcon={post.platformIcon}
                onEdit={(text) => handlePostEdit(post.id, text)}
                onAction={(action) => handlePostAction(post.id, action)}
                variationIdx={variationIdxes[post.id] || 0}
                setVariationIdx={(idx) => setVariationIdx(post.id, idx)}
              />
            </div>
          ))}
        </div>
      </main>

      {/* ═══ RIGHT PANEL ═══ */}
      <aside className="studio__right">

        {/* SCHEDULING */}
        <div className="panel-section">
          <PanelSectionLabel icon="📅" label="Scheduling" />
          <div className="schedule-block">
            <div className="schedule-row">
              <div className="schedule-row__label">Start date</div>
              <input
                type="date"
                className="studio-input"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div className="schedule-row">
              <div className="schedule-row__label">Post time</div>
              <input
                type="time"
                className="studio-input"
                value={postTime}
                onChange={e => setPostTime(e.target.value)}
              />
            </div>
            <div className="schedule-row">
              <div className="schedule-row__label">Interval</div>
              <select className="studio-select" value={interval} onChange={e => setInterval(e.target.value)}>
                {INTERVALS.map(i => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div className="schedule-row">
              <div className="schedule-row__label">Platform per post</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {PLATFORMS.map(p => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div className={`platform-dot platform-dot--${p.id}`} />
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{p.icon} {p.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CALENDAR PREVIEW */}
        <div className="panel-section">
          <PanelSectionLabel icon="🗓️" label="Calendar Preview" />
          <CalendarPreview scheduledDays={scheduledDays} />
        </div>

        {/* PUBLISH ACTIONS */}
        {posts.length > 0 && (
          <div className="panel-section">
            <PanelSectionLabel icon="🚀" label="Publish" />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <button className="btn-schedule-confirm">📅 Schedule All Posts</button>
              <button className="btn-publish">⚡ Publish Now</button>
              <button className="btn-publish" onClick={() => {
                const newDrafts = posts.map(p => ({ text: p.text.slice(0, 60) + "...", time: "Just now", platform: p.platform }));
                setDrafts(prev => [...newDrafts, ...prev].slice(0, 6));
              }}>💾 Save All as Drafts</button>
            </div>
          </div>
        )}

        <div className="studio-divider" />

        {/* DRAFTS */}
        <div className="panel-section">
          <PanelSectionLabel icon="📂" label="Drafts & History" />
          <div className="draft-list">
            {drafts.map((d, i) => {
              const plat = PLATFORMS.find(p => p.id === d.platform);
              return (
                <div key={i} className="draft-item" onClick={() => setPrompt(d.text.replace("...", ""))}>
                  <span className="draft-item__text">{plat?.icon} {d.text}</span>
                  <span className="draft-item__meta">{d.time}</span>
                </div>
              );
            })}
          </div>
        </div>

      </aside>
    </div>
  );
};

export default Studio;