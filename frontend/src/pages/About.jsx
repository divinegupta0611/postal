import React, { useEffect, useRef, useState } from 'react';
import '../styles/AboutCSS.css';
import NavigationBar from '../components/NavigationBar';
/* ─── DATA ─── */
const FEATURES = [
  {
    icon: '⚡',
    title: 'AI-Powered Content',
    desc: 'Generate platform-native posts for LinkedIn, X, and Instagram in seconds — tailored to your brand voice.',
  },
  {
    icon: '🎯',
    title: 'Brand Intelligence',
    desc: 'Your tone, style, and audience preferences are baked in. Every post sounds unmistakably like you.',
  },
  {
    icon: '📅',
    title: 'Smart Scheduling',
    desc: 'Plan your entire content calendar with intelligent interval suggestions and one-click scheduling.',
  },
  {
    icon: '🔍',
    title: 'RAG-Powered Chat',
    desc: 'Ask anything about your brands, profiles, or posts. Our AI indexes your Supabase data in real time.',
  },
  {
    icon: '✂️',
    title: 'Post Variations',
    desc: 'Get three distinct versions of every post — Original, Bold, and Short — and pick what lands best.',
  },
  {
    icon: '📈',
    title: 'Content Goals',
    desc: 'Align every post to a goal: Awareness, Engagement, Sales, Education, and more.',
  },
];

const STATS = [
  { num: '10×', label: 'Faster content creation' },
  { num: '3',   label: 'Platforms supported' },
  { num: '384', label: 'Vector dimensions' },
  { num: '∞',   label: 'Brand variations' },
];

const STACK = [
  { name: 'React',       tag: 'Frontend' },
  { name: 'Supabase',    tag: 'Database' },
  { name: 'MiniLM-L6',   tag: 'Embeddings' },
  { name: 'Xenova',      tag: 'In-browser ML' },
  { name: 'Anthropic',   tag: 'LLM' },
  { name: 'Syne + DM Sans', tag: 'Typography' },
];

const TIMELINE = [
  { year: '01', label: 'Set up your brand profile with tone, goals, and platforms.' },
  { year: '02', label: 'Drop your idea into the Studio and hit Generate.' },
  { year: '03', label: 'Edit, rewrite, or remix — AI assists at every step.' },
  { year: '04', label: 'Schedule or publish directly to your platforms.' },
];

/* ─── NOISE CANVAS ─── */
function NoiseCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    const W = c.width = 300;
    const H = c.height = 300;
    const img = ctx.createImageData(W, H);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 40;
      img.data[i] = img.data[i+1] = img.data[i+2] = v;
      img.data[i+3] = 18;
    }
    ctx.putImageData(img, 0, 0);
  }, []);
  return <canvas ref={ref} className="about-noise" aria-hidden="true" />;
}

/* ─── ANIMATED COUNTER ─── */
function StatCard({ num, label }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={`about-stat ${visible ? 'about-stat--visible' : ''}`}>
      <span className="about-stat__num">{num}</span>
      <span className="about-stat__label">{label}</span>
    </div>
  );
}

/* ─── FEATURE CARD ─── */
function FeatureCard({ icon, title, desc, index }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`about-feature ${visible ? 'about-feature--visible' : ''}`}
      style={{ transitionDelay: `${index * 0.07}s` }}
    >
      <div className="about-feature__icon">{icon}</div>
      <h3 className="about-feature__title">{title}</h3>
      <p className="about-feature__desc">{desc}</p>
    </div>
  );
}

/* ─── MAIN ─── */
const About = () => {
  return (
    <div className="about">
        <NavigationBar/>
      <NoiseCanvas />

      {/* ══════════════════════════════
          HERO
      ══════════════════════════════ */}
      <section className="about-hero">
        {/* Glow orbs */}
        <div className="about-orb about-orb--1" />
        <div className="about-orb about-orb--2" />

        <div className="about-hero__inner">
          <div className="about-hero__badge">
            <span className="about-hero__badge-dot" />
            Content OS for Modern Brands
          </div>

          <h1 className="about-hero__title">
            Build your brand<br />
            <span className="about-hero__title-accent">at the speed of thought.</span>
          </h1>

          <p className="about-hero__sub">
            An AI-native content studio that learns your voice, indexes your data,
            and ships posts across every platform — without the grind.
          </p>

          <div className="about-hero__ctas">
            <a href="/studio" className="about-btn about-btn--primary">
              Open Studio <span className="about-btn__arrow">→</span>
            </a>
            <a href="/brand-profile" className="about-btn about-btn--ghost">
              Set up brand profile
            </a>
          </div>
        </div>

        {/* Decorative grid lines */}
        <div className="about-hero__grid" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="about-hero__grid-line" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════
          STATS
      ══════════════════════════════ */}
      <section className="about-stats-strip">
        {STATS.map((s, i) => <StatCard key={i} {...s} />)}
      </section>

      {/* ══════════════════════════════
          FEATURES
      ══════════════════════════════ */}
      <section className="about-section">
        <div className="about-section__head">
          <span className="about-label">WHAT IT DOES</span>
          <h2 className="about-section__title">Everything you need.<br />Nothing you don't.</h2>
        </div>
        <div className="about-features-grid">
          {FEATURES.map((f, i) => <FeatureCard key={i} {...f} index={i} />)}
        </div>
      </section>

      {/* ══════════════════════════════
          HOW IT WORKS
      ══════════════════════════════ */}
      <section className="about-section about-section--alt">
        <div className="about-section__head">
          <span className="about-label">HOW IT WORKS</span>
          <h2 className="about-section__title">From idea to published,<br />in four steps.</h2>
        </div>

        <div className="about-timeline">
          {TIMELINE.map((t, i) => (
            <div key={i} className="about-timeline__item">
              <div className="about-timeline__step">
                <span className="about-timeline__num">{t.year}</span>
                {i < TIMELINE.length - 1 && <div className="about-timeline__line" />}
              </div>
              <p className="about-timeline__text">{t.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════
          TECH STACK
      ══════════════════════════════ */}
      <section className="about-section">
        <div className="about-section__head">
          <span className="about-label">BUILT WITH</span>
          <h2 className="about-section__title">Serious tech,<br />zero compromise.</h2>
        </div>

        <div className="about-stack">
          {STACK.map((s, i) => (
            <div key={i} className="about-stack__item">
              <span className="about-stack__name">{s.name}</span>
              <span className="about-stack__tag">{s.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════
          CTA BANNER
      ══════════════════════════════ */}
      <section className="about-cta-banner">
        <div className="about-orb about-orb--3" />
        <div className="about-cta-banner__inner">
          <h2 className="about-cta-banner__title">
            Ready to build<br />your content engine?
          </h2>
          <p className="about-cta-banner__sub">
            Set up your brand profile once. Let AI do the rest.
          </p>
          <div className="about-hero__ctas">
            <a href="/studio" className="about-btn about-btn--primary">
              Start for free <span className="about-btn__arrow">→</span>
            </a>
          </div>
        </div>
        {/* Decorative dashes */}
        <div className="about-cta-banner__deco" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="about-cta-banner__dash" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════
          FOOTER NOTE
      ══════════════════════════════ */}
      <footer className="about-footer">
        <span className="about-footer__dot" />
        <span>Built with RAG · MiniLM · Anthropic · Supabase</span>
        <span className="about-footer__dot" />
      </footer>
    </div>
  );
};

export default About;