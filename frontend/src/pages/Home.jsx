import React, { useEffect, useRef, useState } from "react";
import "../styles/HomeCSS.css";
import NavigationBar from "../components/NavigationBar";

const floatingPosts = [
  {
    id: 1,
    platform: "linkedin",
    avatar: "🧑‍💼",
    name: "Sarah K.",
    time: "2h ago",
    content: "Just launched our Q3 campaign using Postal — 3x engagement in one week! 🚀",
    likes: 284,
    comments: 47,
    delay: "0s",
    x: "5%",
    y: "8%",
  },
  {
    id: 2,
    platform: "twitter",
    avatar: "🦊",
    name: "devmark_x",
    time: "45m ago",
    content: "Postal auto-scheduled our entire month of content while I was on vacation. Wild. 🌴",
    likes: 1200,
    comments: 89,
    delay: "0.4s",
    x: "55%",
    y: "5%",
  },
  {
    id: 3,
    platform: "instagram",
    avatar: "🎨",
    name: "designwithlu",
    time: "1d ago",
    content: "Our brand voice is CONSISTENT now. Thank you Postal for finally solving this 🙌✨",
    likes: 3490,
    comments: 203,
    delay: "0.8s",
    x: "20%",
    y: "58%",
  },
  {
    id: 4,
    platform: "linkedin",
    avatar: "🏢",
    name: "TechVenture Co.",
    time: "3h ago",
    content: "From brand setup to auto-posting in under 10 minutes. This is the future of marketing.",
    likes: 512,
    comments: 61,
    delay: "1.2s",
    x: "62%",
    y: "55%",
  },
  {
    id: 5,
    platform: "twitter",
    avatar: "🚀",
    name: "startupwins",
    time: "30m ago",
    content: "Postal's RAG memory means every post sounds exactly like us. Not generic AI fluff.",
    likes: 876,
    comments: 44,
    delay: "1.6s",
    x: "38%",
    y: "30%",
  },
];

const platformColors = {
  linkedin: { bg: "#0A66C2", label: "in" },
  twitter: { bg: "#000", label: "𝕏" },
  instagram: { bg: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)", label: "◈" },
};

const features = [
  { icon: "", title: "Brand Memory", desc: "Upload your docs, pitch decks, blogs — Postal learns your voice and never forgets it." },
  { icon: "", title: "One Idea → 3 Platforms", desc: "From LinkedIn stories to X threads to Instagram captions, all from a single prompt." },
  { icon: "", title: "Smart Scheduling", desc: "Set your cadence once. Postal generates and queues weeks of content automatically." },
  { icon: "", title: "Self-Improving AI", desc: "Every like and comment teaches Postal what works. Your content gets smarter over time." },
];

// Read user synchronously so it's available on first render — no flicker
const getStoredUser = () => {
  try {
    const stored = localStorage.getItem("postal_user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const Home = () => {
  const heroRef = useRef(null);
  const [user, setUser] = useState(getStoredUser);

useEffect(() => {
  const onStorage = () => setUser(getStoredUser());
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".animate-in").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [user]); // re-run when user changes so greeting animates in too

  return (
    <div className="home">
      <NavigationBar user={user} setUser={setUser} />

      {/* ─── HERO ─── */}
      <section className="hero" ref={heroRef} id="home">
        {/* Left */}
        <div className="hero__left">
          <div className="hero__badge animate-in">✦ Your AI Marketing Agent</div>

          {/* Bold welcome — shown immediately above headline when logged in */}
          {user && (
            <div className="hero__welcome">
                Welcome, <span className="hero__welcome--name">{user.fullname}</span>
            </div>
          )}

          <h1 className="hero__headline animate-in" style={{ animationDelay: "0.1s" }}>
            Stop writing posts.<br />
            <span className="hero__headline--accent">Start building brands.</span>
          </h1>

          <p className="hero__sub animate-in" style={{ animationDelay: "0.2s" }}>
            Postal learns your brand, generates platform-perfect content, schedules it automatically,
            and gets smarter with every post. <br />
            <strong>You focus on strategy. We handle the rest.</strong>
          </p>

          <div className="hero__actions animate-in" style={{ animationDelay: "0.3s" }}>
            {user ? (
              <a href="/dashboard" className="btn btn--primary">
                Dashboard <span>→</span>
              </a>
            ) : (
              <a href="/signup" className="btn btn--primary">
                Get Started Free <span>→</span>
              </a>
            )}
            <a href="#about" className="btn btn--ghost">
              See how it works
            </a>
          </div>

          <div className="hero__stats animate-in" style={{ animationDelay: "0.4s" }}>
            <div className="stat">
              <span className="stat__num">3×</span>
              <span className="stat__label">More engagement</span>
            </div>
            <div className="stat__divider" />
            <div className="stat">
              <span className="stat__num">10×</span>
              <span className="stat__label">Faster publishing</span>
            </div>
            <div className="stat__divider" />
            <div className="stat">
              <span className="stat__num">100%</span>
              <span className="stat__label">Your brand voice</span>
            </div>
          </div>
        </div>

        {/* Right — floating posts */}
        <div className="hero__right">
          <div className="posts-field">
            {/* Decorative rings */}
            <div className="ring ring--1" />
            <div className="ring ring--2" />
            <div className="ring ring--3" />

            {/* Central robot mascot */}
            <div className="mascot">
              <div className="mascot__body">
                <div className="mascot__face">
                  <div className="mascot__eye" />
                  <div className="mascot__eye" />
                </div>
                <div className="mascot__mouth" />
              </div>
              <div className="mascot__label">Postal AI</div>
            </div>

            {/* Floating post cards */}
            {floatingPosts.map((post) => (
              <div
                key={post.id}
                className="post-card"
                style={{
                  left: post.x,
                  top: post.y,
                  animationDelay: post.delay,
                }}
              >
                <div className="post-card__header">
                  <span className="post-card__avatar">{post.avatar}</span>
                  <div>
                    <div className="post-card__name">{post.name}</div>
                    <div className="post-card__time">{post.time}</div>
                  </div>
                  <span
                    className="post-card__platform"
                    style={{
                      background: platformColors[post.platform].bg,
                    }}
                  >
                    {platformColors[post.platform].label}
                  </span>
                </div>
                <p className="post-card__content">{post.content}</p>
                <div className="post-card__footer">
                  <span>❤️ {post.likes.toLocaleString()}</span>
                  <span>💬 {post.comments}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="features" id="about">
        <div className="features__header animate-in">
          <h2>Everything your marketing team needs —<br /><em>minus the team.</em></h2>
          <p>Postal is a self-improving AI agent, not just another scheduling tool.</p>
        </div>
        <div className="features__grid">
          {features.map((f, i) => (
            <div
              key={i}
              className="feature-card animate-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="feature-card__icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="cta-banner animate-in" id="contact">
        <div className="cta-banner__content">
          <h2>Ready to put your content on autopilot?</h2>
          <p>Join thousands of brands that let Postal do the heavy lifting.</p>
          <a href={user ? "/dashboard" : "/signup"} className="btn btn--primary btn--large">
            {user ? "Go to Dashboard →" : "Create your free account →"}
          </a>
        </div>
        <div className="cta-banner__decoration">✦</div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="footer">
        <span className="footer__logo">✦ Postal</span>
        <span className="footer__copy">© 2026 Postal. All rights reserved.</span>
      </footer>
    </div>
  );
};

export default Home;