import React, { useState } from 'react';
import NavigationBar from "../components/NavigationBar";
import Analytics from "./Analytics";
import BrandProfile from "./BrandProfile";
import Studio from "./Studios";
import History from "./History";
import Chat from "./Chat";
import Settings from './Settings';
import "../styles/DashboardCSS.css";

const sidebarLinks = [
  { id: "analytics",     label: "Analytics",     icon: "" },
  { id: "brand-profile", label: "Brand Profile", icon: "" },
  { id: "studio",        label: "Studio",         icon: "" },
  { id: "history",       label: "History",        icon: "" },
  { id: "chat",          label: "Chat",           icon: "" },
  { id: "settings",      label: "Settings",       icon: "" },
];

const Placeholder = ({ icon, label }) => (
  <div className="dashboard__placeholder">
    <span className="dashboard__placeholder-icon">{icon}</span>
    <h2>{label}</h2>
    <p>This section is coming soon.</p>
  </div>
);

const Dashboard = () => {
  const [active, setActive] = useState("analytics");

  const renderContent = () => {
    switch (active) {
      case "analytics":     return <Analytics />;
      case "brand-profile": return <BrandProfile />;
      case "studio":        return <Studio />;
      case "history":       return <History />;
      case "chat":          return <Chat />;
      case "settings":      return <Settings />;
      default:
        const link = sidebarLinks.find(l => l.id === active);
        return <Placeholder icon={link?.icon} label={link?.label} />;
    }
  };

  return (
    <div className="dashboard">
      <NavigationBar />
      <div className="dashboard__body">

        {/* ─── SIDEBAR ─── */}
        <aside className="sidebar">
          <div className="sidebar__logo-row">
            <span className="sidebar__section-label">Menu</span>
          </div>
          <nav className="sidebar__nav">
            {sidebarLinks.map((link, i) => (
              <button
                key={link.id}
                className={`sidebar__item ${active === link.id ? "sidebar__item--active" : ""}`}
                onClick={() => setActive(link.id)}
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <span className="sidebar__icon">{link.icon}</span>
                <span className="sidebar__label">{link.label}</span>
                {active === link.id && <span className="sidebar__indicator" />}
              </button>
            ))}
          </nav>
          <div className="sidebar__footer">
            <div className="sidebar__user-dot" />
            <span className="sidebar__user-label">Active</span>
          </div>
        </aside>

        {/* ─── MAIN CONTENT ─── */}
        <main className="dashboard__main dashboard__main--flush">
          {renderContent()}
        </main>

      </div>
    </div>
  );
};

export default Dashboard;