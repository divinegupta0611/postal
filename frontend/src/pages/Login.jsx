import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/AuthCSS.css";
import { supabase } from "../lib/supabase";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMsg(location.state.message);
    }
  }, [location.state]);

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    return e;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
    if (serverError) setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setServerError("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) throw error;

      navigate("/");

    } catch (err) {
      setServerError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__bg" />
      <Link to="/" className="auth-logo">✦ Postal</Link>

      <div className="auth-card">
        <div className="auth-card__header">
          <h1>Welcome back</h1>
          <p>Log in to continue building your brand</p>
        </div>

        {successMsg && (
          <div className="auth-server-success">✓ {successMsg}</div>
        )}

        {serverError && (
          <div className="auth-server-error">⚠️ {serverError}</div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          {/* Email */}
          <div className={`auth-field ${errors.email ? "auth-field--error" : ""}`}>
            <label htmlFor="email">Email</label>
            <div className="auth-field__input-wrap">
              <span className="auth-field__icon">@</span>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="auth-field__error">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className={`auth-field ${errors.password ? "auth-field--error" : ""}`}>
            <label htmlFor="password">Password</label>
            <div className="auth-field__input-wrap">
              <span className="auth-field__icon">🔒</span>
              <input
                id="password"
                name="password"
                type={showPass ? "text" : "password"}
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="auth-field__toggle"
                onClick={() => setShowPass(!showPass)}
                aria-label="Toggle password"
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.password && <span className="auth-field__error">{errors.password}</span>}
          </div>

          <div className="auth-forgot">
            <Link to="/forgot-password" className="auth-forgot__link">Forgot password?</Link>
          </div>

          <button
            type="submit"
            className={`auth-submit ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? <span className="auth-submit__spinner" /> : "Login →"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/signup" className="auth-switch__link">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;