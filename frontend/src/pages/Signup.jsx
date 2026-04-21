import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/AuthCSS.css";
import { supabase } from "../lib/supabase";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    companyName: "",
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const validate = () => {
    const e = {};
    if (!form.companyName.trim()) e.companyName = "Company name is required";
    if (!form.fullname.trim()) e.fullname = "Full name is required";
    else if (form.fullname.length < 3) e.fullname = "At least 3 characters";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "At least 6 characters";
    if (!form.confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
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
    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullname,
          company_name: form.companyName,
        },
      },
    });

    if (signUpError) {
      if (signUpError.message.includes("already registered")) {
        throw new Error("An account with this email already exists. Try logging in.");
      }
      throw signUpError;
    }

    // ✅ Save user info to localStorage
    localStorage.setItem("postal_user", JSON.stringify({
      fullname: form.fullname,
      companyName: form.companyName,
      email: form.email,
    }));

    navigate("/login", { state: { message: "Account created! Please log in." } });

  } catch (err) {
    setServerError(err.message || "Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};

  const strength = () => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];
  const strengthClass = ["", "weak", "fair", "good", "strong", "very-strong"];
  const s = strength();

  return (
    <div className="auth-page">
      <div className="auth-page__bg" />
      <Link to="/" className="auth-logo">✦ Postal</Link>

      <div className="auth-card">
        <div className="auth-card__header">
          <h1>Create your account</h1>
          <p>Start building your brand on autopilot</p>
        </div>

        {serverError && (
          <div className="auth-server-error">⚠️ {serverError}</div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          {/* Company Name */}
          <div className={`auth-field ${errors.companyName ? "auth-field--error" : ""}`}>
            <label htmlFor="companyName">Company Name</label>
            <div className="auth-field__input-wrap">
              <span className="auth-field__icon">🏢</span>
              <input
                id="companyName"
                name="companyName"
                type="text"
                placeholder="Acme Corp"
                value={form.companyName}
                onChange={handleChange}
                autoComplete="organization"
              />
            </div>
            {errors.companyName && <span className="auth-field__error">{errors.companyName}</span>}
          </div>

          {/* Full Name */}
          <div className={`auth-field ${errors.fullname ? "auth-field--error" : ""}`}>
            <label htmlFor="fullname">Full Name</label>
            <div className="auth-field__input-wrap">
              <span className="auth-field__icon">👤</span>
              <input
                id="fullname"
                name="fullname"
                type="text"
                placeholder="John Doe"
                value={form.fullname}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>
            {errors.fullname && <span className="auth-field__error">{errors.fullname}</span>}
          </div>

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
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
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
            {form.password && (
              <div className="password-strength">
                <div className="password-strength__bars">
                  {[1,2,3,4,5].map(i => (
                    <div
                      key={i}
                      className={`password-strength__bar ${i <= s ? strengthClass[s] : ""}`}
                    />
                  ))}
                </div>
                <span className={`password-strength__label ${strengthClass[s]}`}>
                  {strengthLabel[s]}
                </span>
              </div>
            )}
            {errors.password && <span className="auth-field__error">{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className={`auth-field ${errors.confirmPassword ? "auth-field--error" : ""}`}>
            <label htmlFor="confirmPassword">Re-enter Password</label>
            <div className="auth-field__input-wrap">
              <span className="auth-field__icon">🔐</span>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth-field__toggle"
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label="Toggle confirm password"
              >
                {showConfirm ? "🙈" : "👁️"}
              </button>
              {form.confirmPassword && form.password === form.confirmPassword && (
                <span className="auth-field__check">✓</span>
              )}
            </div>
            {errors.confirmPassword && (
              <span className="auth-field__error">{errors.confirmPassword}</span>
            )}
          </div>

          <button
            type="submit"
            className={`auth-submit ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? <span className="auth-submit__spinner" /> : "Create Account →"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login" className="auth-switch__link">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;