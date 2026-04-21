import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import "../styles/BrandProfileCSS.css";
import { useEffect } from "react";

const TONES = ["Professional", "Casual", "Witty", "Bold", "Inspirational", "Empathetic", "Authoritative", "Friendly"];
const WRITING_STYLES = ["Short & Punchy", "Storytelling", "Data-driven", "Conversational"];
const DESIGN_STYLES = ["Minimal", "Modern", "Corporate", "Fun", "Luxury", "Playful"];
const IMAGE_VIBES = ["Clean & Bright", "Dark & Moody", "Colorful & Vibrant", "Natural & Earthy", "Futuristic", "Vintage"];
const PLATFORMS = [
  { id: "linkedin", label: "LinkedIn", icon: "in" },
  { id: "twitter", label: "X (Twitter)", icon: "𝕏" },
  { id: "instagram", label: "Instagram", icon: "◈" },
];
const CONTENT_GOALS = ["Awareness", "Engagement", "Sales", "Hiring"];
const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Expert"];

const Slider = ({ label, left, right, value, onChange }) => (
  <div className="bp-slider-wrap">
    <div className="bp-slider-header">
      <span className="bp-slider-label">{label}</span>
      <span className="bp-slider-value">{value}%</span>
    </div>
    <div className="bp-slider-track-wrap">
      <span className="bp-slider-edge">{left}</span>
      <div className="bp-slider-track">
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="bp-slider"
          style={{ "--val": `${value}%` }}
        />
        <div className="bp-slider-fill" style={{ width: `${value}%` }} />
      </div>
      <span className="bp-slider-edge">{right}</span>
    </div>
  </div>
);

const TagInput = ({ value, onChange, placeholder }) => {
  const [input, setInput] = useState("");

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
  };

  const remove = (item) => onChange(value.filter((v) => v !== item));

  return (
    <div className="bp-tag-input">
      <div className="bp-tags">
        {value.map((tag) => (
          <span key={tag} className="bp-tag">
            {tag}
            <button onClick={() => remove(tag)} className="bp-tag-remove">×</button>
          </span>
        ))}
      </div>
      <div className="bp-tag-row">
        <input
          className="bp-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={placeholder}
        />
        <button className="bp-add-btn" onClick={add} type="button">+ Add</button>
      </div>
    </div>
  );
};

const Section = ({ icon, title, children }) => (
  <div className="bp-section">
    <div className="bp-section-header">
      <span className="bp-section-icon">{icon}</span>
      <h2 className="bp-section-title">{title}</h2>
    </div>
    <div className="bp-section-body">{children}</div>
  </div>
);

const Field = ({ label, hint, children, optional }) => (
  <div className="bp-field">
    <label className="bp-label">
      {label}
      {optional && <span className="bp-optional">optional</span>}
    </label>
    {hint && <p className="bp-hint">{hint}</p>}
    {children}
  </div>
);

const BrandProfile = () => {
  const [form, setForm] = useState(() => {
  const saved = localStorage.getItem("brandForm");
  return saved ? JSON.parse(saved) : {
    companyName: "",
    industry: "",
    websiteUrl: "",
    shortDescription: "",
    detailedDescription: "",
    products: [],

    primaryAudience: "",
    experienceLevel: "",
    geography: "",
    painPoints: [],

    tones: [],
    writingStyle: "",
    formalSlider: 50,
    playfulSlider: 50,
    detailSlider: 50,

    keyThemes: [],
    contentGoals: [],

    platforms: [],

    designStyle: "",
    colorPreferences: "",
    imageVibe: "",

    samplePosts: ["", "", ""],
    samplePrompt: "",

    websiteContent: "",
    blogs: "",
  };
});

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const toggleMulti = (key, val) =>
    set(key, form[key].includes(val)
      ? form[key].filter((v) => v !== val)
      : [...form[key], val]);

const handleSubmit = async (e) => {
  e.preventDefault();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    alert("User not logged in");
    return;
  }

  const { error } = await supabase
    .from("brands")
    .upsert(
      {
        user_id: user.id,

        company_name: form.companyName,
        industry: form.industry,
        website_url: form.websiteUrl,
        short_description: form.shortDescription,
        detailed_description: form.detailedDescription,
        products: form.products,

        primary_audience: form.primaryAudience,
        experience_level: form.experienceLevel,
        geography: form.geography,
        pain_points: form.painPoints,

        tones: form.tones,
        writing_style: form.writingStyle,
        formal_slider: form.formalSlider,
        playful_slider: form.playfulSlider,
        detail_slider: form.detailSlider,

        key_themes: form.keyThemes,
        content_goals: form.contentGoals,

        platforms: form.platforms,

        design_style: form.designStyle,
        color_preferences: form.colorPreferences,
        image_vibe: form.imageVibe,

        sample_posts: form.samplePosts,
        sample_prompt: form.samplePrompt,

        website_content: form.websiteContent,
        blogs: form.blogs,
      },
      { onConflict: "user_id" } // 🔥 ensures update not duplicate
    );

  if (error) {
    console.error(error);
    alert("Error saving profile");
  } else {
    alert("Saved successfully!");
  }
};
useEffect(() => {
  localStorage.setItem("brandForm", JSON.stringify(form));
}, [form]);
const fetchBrand = async () => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return;

  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (data) {
    setForm({
      companyName: data.company_name || "",
      industry: data.industry || "",
      websiteUrl: data.website_url || "",
      shortDescription: data.short_description || "",
      detailedDescription: data.detailed_description || "",
      products: data.products || [],

      primaryAudience: data.primary_audience || "",
      experienceLevel: data.experience_level || "",
      geography: data.geography || "",
      painPoints: data.pain_points || [],

      tones: data.tones || [],
      writingStyle: data.writing_style || "",
      formalSlider: data.formal_slider ?? 50,
      playfulSlider: data.playful_slider ?? 50,
      detailSlider: data.detail_slider ?? 50,

      keyThemes: data.key_themes || [],
      contentGoals: data.content_goals || [],

      platforms: data.platforms || [],

      designStyle: data.design_style || "",
      colorPreferences: data.color_preferences || "",
      imageVibe: data.image_vibe || "",

      samplePosts: data.sample_posts || ["", "", ""],
      samplePrompt: data.sample_prompt || "",

      websiteContent: data.website_content || "",
      blogs: data.blogs || "",
    });
  }
};
useEffect(() => {
  fetchBrand();
}, []);

  return (
    <div className="bp-page">
      <div className="bp-header">
        <h1 className="bp-title">Brand Profile</h1>
        <p className="bp-subtitle">Tell Postal everything about your brand — the more you share, the better your content.</p>
      </div>

      <form className="bp-form" onSubmit={handleSubmit} noValidate>

        {/* ── 1. BRAND IDENTITY ── */}
        <Section icon="🏷️" title="Brand Identity">
          <Field label="Company Name">
            <input className="bp-input" placeholder="Acme Corp" value={form.companyName}
              onChange={(e) => set("companyName", e.target.value)} />
          </Field>

          <Field label="Industry">
            <input className="bp-input" placeholder="e.g. SaaS, E-commerce, Healthcare" value={form.industry}
              onChange={(e) => set("industry", e.target.value)} />
          </Field>

          <Field label="Website URL" optional>
            <input className="bp-input" placeholder="https://yourcompany.com" value={form.websiteUrl}
              onChange={(e) => set("websiteUrl", e.target.value)} />
          </Field>

          <Field label="Short Description" hint="1–2 lines. What do you do and who do you serve?">
            <textarea className="bp-textarea bp-textarea--sm" placeholder="We help SaaS startups grow faster through..."
              value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} />
          </Field>

          <Field label="Detailed Description" hint="Dive deeper — your mission, story, what makes you different.">
            <textarea className="bp-textarea" placeholder="Founded in 2022, we set out to..."
              value={form.detailedDescription} onChange={(e) => set("detailedDescription", e.target.value)} />
          </Field>

          <Field label="Products / Services" hint="Press Enter or click Add after each item.">
            <TagInput value={form.products} onChange={(v) => set("products", v)} placeholder="e.g. AI Scheduling Tool" />
          </Field>
        </Section>

        {/* ── 2. TARGET AUDIENCE ── */}
        <Section icon="👥" title="Target Audience">
          <Field label="Primary Audience" hint="Who are you speaking to?">
            <input className="bp-input" placeholder="e.g. Marketing managers at B2B SaaS companies" value={form.primaryAudience}
              onChange={(e) => set("primaryAudience", e.target.value)} />
          </Field>

          <Field label="Experience Level">
            <div className="bp-chip-group">
              {EXPERIENCE_LEVELS.map((lvl) => (
                <button key={lvl} type="button"
                  className={`bp-chip ${form.experienceLevel === lvl ? "bp-chip--active" : ""}`}
                  onClick={() => set("experienceLevel", lvl)}>
                  {lvl}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Geography" optional>
            <input className="bp-input" placeholder="e.g. North America, Global, India" value={form.geography}
              onChange={(e) => set("geography", e.target.value)} />
          </Field>

          <Field label="Pain Points" hint="What problems does your audience face?">
            <TagInput value={form.painPoints} onChange={(v) => set("painPoints", v)} placeholder="e.g. Too much time on content" />
          </Field>
        </Section>

        {/* ── 3. BRAND VOICE ── */}
        <Section icon="🎤" title="Brand Voice">
          <Field label="Tone" hint="Select all that apply.">
            <div className="bp-chip-group bp-chip-group--wrap">
              {TONES.map((tone) => (
                <button key={tone} type="button"
                  className={`bp-chip ${form.tones.includes(tone) ? "bp-chip--active" : ""}`}
                  onClick={() => toggleMulti("tones", tone)}>
                  {tone}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Writing Style">
            <div className="bp-chip-group bp-chip-group--wrap">
              {WRITING_STYLES.map((s) => (
                <button key={s} type="button"
                  className={`bp-chip ${form.writingStyle === s ? "bp-chip--active" : ""}`}
                  onClick={() => set("writingStyle", s)}>
                  {s}
                </button>
              ))}
            </div>
          </Field>

          <div className="bp-sliders">
            <Slider label="Formality" left="Informal" right="Formal"
              value={form.formalSlider} onChange={(v) => set("formalSlider", v)} />
            <Slider label="Personality" left="Serious" right="Playful"
              value={form.playfulSlider} onChange={(v) => set("playfulSlider", v)} />
            <Slider label="Detail Level" left="Minimal" right="Detailed"
              value={form.detailSlider} onChange={(v) => set("detailSlider", v)} />
          </div>
        </Section>

        {/* ── 4. CONTENT STRATEGY ── */}
        <Section icon="📢" title="Content Strategy">
          <Field label="Key Themes" hint="3–5 topics your content will focus on.">
            <TagInput value={form.keyThemes} onChange={(v) => set("keyThemes", v)} placeholder="e.g. AI trends, Startup growth" />
          </Field>

          <Field label="Content Goals" hint="What should your content achieve?">
            <div className="bp-chip-group">
              {CONTENT_GOALS.map((goal) => (
                <button key={goal} type="button"
                  className={`bp-chip ${form.contentGoals.includes(goal) ? "bp-chip--active" : ""}`}
                  onClick={() => toggleMulti("contentGoals", goal)}>
                  {goal}
                </button>
              ))}
            </div>
          </Field>
        </Section>

        {/* ── 5. PLATFORM PREFERENCES ── */}
        <Section icon="🧵" title="Platform Preferences">
          <Field label="Platforms to Focus On">
            <div className="bp-platform-group">
              {PLATFORMS.map((p) => (
                <button key={p.id} type="button"
                  className={`bp-platform-card ${form.platforms.includes(p.id) ? "bp-platform-card--active" : ""}`}
                  onClick={() => toggleMulti("platforms", p.id)}>
                  <span className="bp-platform-icon">{p.icon}</span>
                  <span className="bp-platform-label">{p.label}</span>
                  {form.platforms.includes(p.id) && <span className="bp-platform-check">✓</span>}
                </button>
              ))}
            </div>
          </Field>
        </Section>

        {/* ── 6. VISUAL STYLE ── */}
        <Section icon="🖼️" title="Visual Style">
          <Field label="Design Style" optional>
            <div className="bp-chip-group bp-chip-group--wrap">
              {DESIGN_STYLES.map((s) => (
                <button key={s} type="button"
                  className={`bp-chip ${form.designStyle === s ? "bp-chip--active" : ""}`}
                  onClick={() => set("designStyle", s)}>
                  {s}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Color Preferences" optional hint="Describe your brand colors.">
            <input className="bp-input" placeholder="e.g. Deep navy, electric yellow, white" value={form.colorPreferences}
              onChange={(e) => set("colorPreferences", e.target.value)} />
          </Field>

          <Field label="Image Style / Vibe" optional>
            <div className="bp-chip-group bp-chip-group--wrap">
              {IMAGE_VIBES.map((v) => (
                <button key={v} type="button"
                  className={`bp-chip ${form.imageVibe === v ? "bp-chip--active" : ""}`}
                  onClick={() => set("imageVibe", v)}>
                  {v}
                </button>
              ))}
            </div>
          </Field>
        </Section>

        {/* ── 7. EXAMPLE CONTENT ── */}
        <Section icon="📚" title="Example Content">
          <Field label="Sample Posts" hint="Paste 2–3 real posts that represent your brand voice." optional>
            {form.samplePosts.map((post, i) => (
              <textarea key={i} className="bp-textarea bp-textarea--sm bp-textarea--spaced"
                placeholder={`Sample post ${i + 1}…`}
                value={post}
                onChange={(e) => {
                  const updated = [...form.samplePosts];
                  updated[i] = e.target.value;
                  set("samplePosts", updated);
                }} />
            ))}
          </Field>

          <Field label="Or describe your style" hint='e.g. "Write like a friendly expert who uses short punchy sentences and ends with a question."' optional>
            <textarea className="bp-textarea bp-textarea--sm"
              placeholder="Write a sample post in your style…"
              value={form.samplePrompt}
              onChange={(e) => set("samplePrompt", e.target.value)} />
          </Field>
        </Section>

        {/* ── 8. KNOWLEDGE BASE ── */}
        <Section icon="🧠" title="Knowledge Base">
          <Field label="Upload Documents" hint="PDF, DOCX — pitch decks, case studies, brand guides." optional>
            <label className="bp-upload-zone">
              <input type="file" accept=".pdf,.docx,.doc,.txt" multiple className="bp-upload-input" />
              <span className="bp-upload-icon">📎</span>
              <span className="bp-upload-text">Drop files here or <u>browse</u></span>
              <span className="bp-upload-hint">PDF, DOCX, TXT up to 10MB each</span>
            </label>
          </Field>

          <Field label="Website Content" hint="Paste key pages — About, Services, etc." optional>
            <textarea className="bp-textarea"
              placeholder="Paste content from your website…"
              value={form.websiteContent}
              onChange={(e) => set("websiteContent", e.target.value)} />
          </Field>

          <Field label="Blogs / Articles" hint="Paste your best-performing articles." optional>
            <textarea className="bp-textarea"
              placeholder="Paste blog content here…"
              value={form.blogs}
              onChange={(e) => set("blogs", e.target.value)} />
          </Field>
        </Section>

        {/* ── SUBMIT ── */}
        <div className="bp-submit-row">
          <button type="submit" className="bp-submit">
            Save Brand Profile <span>✦</span>
          </button>
          <p className="bp-submit-hint">Your profile is used by Postal AI to generate content that sounds exactly like you.</p>
        </div>

      </form>
    </div>
  );
};

export default BrandProfile;
