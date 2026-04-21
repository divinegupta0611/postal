import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/NavigationBarCSS.css";
import { supabase } from "../lib/supabase";

const getStoredUser = () => {
  try {
    const stored = localStorage.getItem("postal_user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const NavigationBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(getStoredUser);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync across tabs if localStorage changes
  useEffect(() => {
    const onStorage = () => setUser(getStoredUser());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    setUser(null);
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="navbar__logo">
        <span className="navbar__logo-icon">✦</span>
        Postal
      </div>

      <button
        className={`navbar__hamburger ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span />
        <span />
        <span />
      </button>

      <ul className={`navbar__links ${menuOpen ? "navbar__links--open" : ""}`}>
        <li><Link to="/home" className="navbar__link" onClick={() => setMenuOpen(false)}>Home</Link></li>
        <li><Link to="/about" className="navbar__link" onClick={() => setMenuOpen(false)}>About</Link></li>
        <li><Link to="/contact" className="navbar__link" onClick={() => setMenuOpen(false)}>Contact Us</Link></li>

        {user ? (
          <>
            <li>
              <Link
                to="/dashboard"
                className="navbar__link navbar__link--dashboard"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <button className="navbar__logout" onClick={handleLogout}>
                Logout
                <span className="navbar__logout-icon">→</span>
              </button>
            </li>
          </>
        ) : (
          <li>
            <Link
              to="/signup"
              className="navbar__signup"
              onClick={() => setMenuOpen(false)}
            >
              Sign Up
              <span className="navbar__signup-arrow">→</span>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default NavigationBar;