import React, { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from "recharts";
import "../styles/AnalyticsCSS.css";

// ─── MOCK DATA ───────────────────────────────────────────────
const engagementOverTime = [
  { date: "Apr 1",  likes: 120, comments: 34, shares: 18, total: 172 },
  { date: "Apr 3",  likes: 98,  comments: 21, shares: 12, total: 131 },
  { date: "Apr 5",  likes: 210, comments: 67, shares: 45, total: 322 },
  { date: "Apr 7",  likes: 175, comments: 52, shares: 33, total: 260 },
  { date: "Apr 9",  likes: 310, comments: 88, shares: 61, total: 459 },
  { date: "Apr 11", likes: 280, comments: 74, shares: 55, total: 409 },
  { date: "Apr 13", likes: 390, comments: 110, shares: 78, total: 578 },
  { date: "Apr 15", likes: 420, comments: 128, shares: 92, total: 640 },
  { date: "Apr 17", likes: 365, comments: 95, shares: 70, total: 530 },
  { date: "Apr 19", likes: 480, comments: 145, shares: 105, total: 730 },
];

const platformPerformance = [
  { platform: "LinkedIn", engagement: 4820, posts: 24 },
  { platform: "X",        engagement: 3210, posts: 41 },
  { platform: "Instagram",engagement: 6540, posts: 18 },
];

const engagementBreakdown = [
  { name: "Likes",    value: 58, color: "#FFDC50" },
  { name: "Comments", value: 27, color: "#FF6B6B" },
  { name: "Shares",   value: 15, color: "#60C5FF" },
];

const postingActivity = [
  { day: "Mon", posts: 3 },
  { day: "Tue", posts: 5 },
  { day: "Wed", posts: 2 },
  { day: "Thu", posts: 6 },
  { day: "Fri", posts: 4 },
  { day: "Sat", posts: 1 },
  { day: "Sun", posts: 2 },
];

const topPosts = [
  { id: 1, text: "How we 3x'd our engagement in one week using AI scheduling...", platform: "LinkedIn",  date: "Apr 17", score: 730, max: 730 },
  { id: 2, text: "Stop writing posts manually. Here's what the top 1% do instead 🧵", platform: "X", date: "Apr 15", score: 612, max: 730 },
  { id: 3, text: "Our brand voice is finally consistent. Here's how we did it ✨", platform: "Instagram", date: "Apr 13", score: 578, max: 730 },
  { id: 4, text: "The single metric that predicts content success before you post", platform: "LinkedIn",  date: "Apr 9",  score: 459, max: 730 },
  { id: 5, text: "Tuesday at 10 AM changed everything for our reach. Thread ↓",    platform: "X", date: "Apr 7",  score: 409, max: 730 },
];

const bestPostingTime = [
  { hour: "6AM",  Mon: 12, Tue: 18, Wed: 8,  Thu: 22, Fri: 14, Sat: 5,  Sun: 4  },
  { hour: "8AM",  Mon: 34, Tue: 56, Wed: 29, Thu: 48, Fri: 38, Sat: 12, Sun: 8  },
  { hour: "10AM", Mon: 58, Tue: 92, Wed: 54, Thu: 78, Fri: 62, Sat: 18, Sun: 14 },
  { hour: "12PM", Mon: 44, Tue: 71, Wed: 48, Thu: 65, Fri: 55, Sat: 28, Sun: 22 },
  { hour: "2PM",  Mon: 38, Tue: 60, Wed: 35, Thu: 52, Fri: 45, Sat: 22, Sun: 16 },
  { hour: "5PM",  Mon: 65, Tue: 82, Wed: 58, Thu: 74, Fri: 70, Sat: 35, Sun: 28 },
  { hour: "8PM",  Mon: 42, Tue: 55, Wed: 40, Thu: 48, Fri: 52, Sat: 44, Sun: 38 },
];

const contentTypePerformance = [
  { type: "Text",   engagement: 3420 },
  { type: "Thread", engagement: 5610 },
  { type: "Image",  engagement: 7230 },
  { type: "Video",  engagement: 8940 },
];

const growthMetrics = [
  { date: "Week 1", followers: 1200, engGrowth: 0   },
  { date: "Week 2", followers: 1350, engGrowth: 12  },
  { date: "Week 3", followers: 1480, engGrowth: 23  },
  { date: "Week 4", followers: 1720, engGrowth: 38  },
  { date: "Week 5", followers: 1950, engGrowth: 51  },
  { date: "Week 6", followers: 2310, engGrowth: 67  },
];

const campaigns = [
  { name: "Q1 Launch",    engagement: 4200, posts: 12 },
  { name: "Brand Awareness", engagement: 3100, posts: 9  },
  { name: "Product Drop", engagement: 5800, posts: 15 },
  { name: "Community",    engagement: 2400, posts: 8  },
];

const aiInsights = [
  { icon: "🔥", insight: "Posts with storytelling tone got 32% more engagement than average.", action: "Write more narrative-driven posts." },
  { icon: "⏰", insight: "Your best posting time is Tuesday at 10 AM — 2.4× your average reach.", action: "Schedule priority content for Tue 10AM." },
  { icon: "📸", insight: "Image posts outperform text-only posts by 58% on Instagram.", action: "Pair every caption with a visual." },
  { icon: "🧵", insight: "Threads on X drive 3× more comments than single posts.", action: "Convert your next big idea into a thread." },
  { icon: "📉", insight: "Weekend posts get 40% less engagement — avoid Saturday drops.", action: "Pause weekend posting or go very casual." },
  { icon: "🎯", insight: "Your Product Drop campaign had the highest ROI per post (387 eng/post).", action: "Replicate its tone and format next campaign." },
];

const PLATFORM_COLORS = { LinkedIn: "#0A66C2", X: "#fff", Instagram: "#E1306C" };

// ─── CUSTOM TOOLTIP ──────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="an-tooltip">
      <p className="an-tooltip-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="an-tooltip-row">
          <span>{p.name}</span><span>{p.value?.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

// ─── STAT CARD ───────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, delay }) => (
  <div className="an-stat-card" style={{ animationDelay: delay }}>
    <span className="an-stat-icon">{icon}</span>
    <div className="an-stat-body">
      <span className="an-stat-value">{value}</span>
      <span className="an-stat-label">{label}</span>
      {sub && <span className="an-stat-sub">{sub}</span>}
    </div>
  </div>
);

// ─── CHART CARD ──────────────────────────────────────────────
const ChartCard = ({ title, subtitle, children, className = "" }) => (
  <div className={`an-chart-card ${className}`}>
    <div className="an-chart-card-header">
      <div>
        <h3 className="an-chart-title">{title}</h3>
        {subtitle && <p className="an-chart-sub">{subtitle}</p>}
      </div>
    </div>
    <div className="an-chart-body">{children}</div>
  </div>
);

// ─── HEATMAP ─────────────────────────────────────────────────
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const Heatmap = () => {
  const max = Math.max(...bestPostingTime.flatMap(r => days.map(d => r[d])));
  return (
    <div className="an-heatmap">
      <div className="an-heatmap-grid">
        <div className="an-heatmap-corner" />
        {days.map(d => <div key={d} className="an-heatmap-day-label">{d}</div>)}
        {bestPostingTime.map((row) => (
          <React.Fragment key={row.hour}>
            <div className="an-heatmap-hour-label">{row.hour}</div>
            {days.map(d => {
              const val = row[d];
              const intensity = val / max;
              return (
                <div key={d} className="an-heatmap-cell"
                  style={{ background: `rgba(255,220,80,${0.06 + intensity * 0.88})` }}
                  title={`${row.hour} ${d}: ${val} eng`}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
      <div className="an-heatmap-legend">
        <span>Low</span>
        <div className="an-heatmap-legend-bar" />
        <span>High</span>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────
const Analytics = () => {
  const [timeRange, setTimeRange] = useState("2W");

  return (
    <div className="an-page">

      {/* ── PAGE HEADER ── */}
      <div className="an-header">
        <div>
          <h1 className="an-title">Analytics</h1>
          <p className="an-subtitle">What worked, why it worked, and what to do next.</p>
        </div>
        <div className="an-time-tabs">
          {["1W","2W","1M","3M"].map(t => (
            <button key={t} className={`an-time-tab ${timeRange === t ? "an-time-tab--active" : ""}`}
              onClick={() => setTimeRange(t)}>{t}</button>
          ))}
        </div>
      </div>

      {/* ── TOP STAT CARDS ── */}
      <div className="an-stats-row">
        <StatCard icon="📝" label="Total Posts"       value="83"     sub="+12 this week"  delay="0s"    />
        <StatCard icon="💥" label="Total Engagement"  value="14,570" sub="+23% vs last period" delay="0.05s" />
        <StatCard icon="📊" label="Avg Engagement"    value="175"    sub="per post"       delay="0.10s" />
        <StatCard icon="🚀" label="Best Platform"     value="Instagram" sub="6,540 total" delay="0.15s" />
      </div>

      {/* ── ROW 1: Line + Bar ── */}
      <div className="an-grid an-grid--2">
        <ChartCard title="📈 Engagement Over Time" subtitle="Is my content improving?">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={engagementOverTime} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: "rgba(240,240,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(240,240,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: "rgba(240,240,255,0.5)" }} />
              <Line type="monotone" dataKey="total"    stroke="#FFDC50" strokeWidth={2.5} dot={false} name="Total" />
              <Line type="monotone" dataKey="likes"    stroke="#FF6B6B" strokeWidth={1.5} dot={false} name="Likes" />
              <Line type="monotone" dataKey="comments" stroke="#60C5FF" strokeWidth={1.5} dot={false} name="Comments" />
              <Line type="monotone" dataKey="shares"   stroke="#A78BFA" strokeWidth={1.5} dot={false} name="Shares" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="📊 Platform Performance" subtitle="Which platform works best?">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={platformPerformance} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="platform" tick={{ fill: "rgba(240,240,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(240,240,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="engagement" name="Engagement" radius={[6,6,0,0]}>
                {platformPerformance.map((entry) => (
                  <Cell key={entry.platform} fill={PLATFORM_COLORS[entry.platform] || "#FFDC50"} opacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── ROW 2: Pie + Posting Activity ── */}
      <div className="an-grid an-grid--2">
        <ChartCard title="🥧 Engagement Breakdown" subtitle="What type dominates?">
          <div className="an-pie-wrap">
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie data={engagementBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                  paddingAngle={3} dataKey="value">
                  {engagementBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: "#0D0D20", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="an-pie-legend">
              {engagementBreakdown.map(e => (
                <div key={e.name} className="an-pie-legend-row">
                  <span className="an-pie-dot" style={{ background: e.color }} />
                  <span className="an-pie-legend-label">{e.name}</span>
                  <span className="an-pie-legend-val">{e.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="📅 Posting Activity" subtitle="How consistent am I?">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={postingActivity} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: "rgba(240,240,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(240,240,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="posts" name="Posts" fill="#FFDC50" opacity={0.8} radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── ROW 3: Content Type + Growth ── */}
      <div className="an-grid an-grid--2">
        <ChartCard title="🧵 Content Type Performance" subtitle="What format works best?">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={contentTypePerformance} layout="vertical" margin={{ top: 4, right: 16, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "rgba(240,240,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="type" tick={{ fill: "rgba(240,240,255,0.55)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="engagement" name="Engagement" fill="#FF6B6B" opacity={0.85} radius={[0,6,6,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="📉 Growth Metrics" subtitle="Am I growing?">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={growthMetrics} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: "rgba(240,240,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(240,240,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: "rgba(240,240,255,0.5)" }} />
              <Line type="monotone" dataKey="followers"  stroke="#FFDC50" strokeWidth={2.5} dot={false} name="Followers" />
              <Line type="monotone" dataKey="engGrowth"  stroke="#60C5FF" strokeWidth={2}   dot={false} name="Eng Growth %" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── HEATMAP ── */}
      <ChartCard title="⏰ Best Posting Time" subtitle="When should I post? (darker = more engagement)" className="an-full">
        <Heatmap />
      </ChartCard>

      {/* ── TOP POSTS + CAMPAIGNS ── */}
      <div className="an-grid an-grid--2">
        <ChartCard title="🔥 Top Performing Posts" subtitle="What content worked best?">
          <div className="an-top-posts">
            {topPosts.map((post, i) => (
              <div key={post.id} className="an-post-row">
                <span className="an-post-rank">#{i + 1}</span>
                <div className="an-post-body">
                  <p className="an-post-text">{post.text}</p>
                  <div className="an-post-meta">
                    <span className="an-post-platform" style={{ color: PLATFORM_COLORS[post.platform] || "#FFDC50" }}>
                      {post.platform}
                    </span>
                    <span className="an-post-date">{post.date}</span>
                    <span className="an-post-score">⚡ {post.score}</span>
                  </div>
                  <div className="an-post-bar-track">
                    <div className="an-post-bar-fill" style={{ width: `${(post.score / post.max) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="🎯 Campaign Performance" subtitle="Did this campaign work?">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={campaigns} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: "rgba(240,240,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(240,240,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="engagement" name="Engagement" fill="#A78BFA" opacity={0.85} radius={[6,6,0,0]} />
              <Bar dataKey="posts"      name="Posts ×10"  fill="rgba(255,220,80,0.3)" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── AI INSIGHTS ── */}
      <ChartCard title="🤖 AI Insights" subtitle="What you should do next — powered by Postal AI" className="an-full">
        <div className="an-insights-grid">
          {aiInsights.map((ins, i) => (
            <div key={i} className="an-insight-card" style={{ animationDelay: `${i * 0.07}s` }}>
              <span className="an-insight-icon">{ins.icon}</span>
              <div className="an-insight-body">
                <p className="an-insight-text">{ins.insight}</p>
                <p className="an-insight-action">→ {ins.action}</p>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>

    </div>
  );
};

export default Analytics;