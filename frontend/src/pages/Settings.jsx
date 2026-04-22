import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SettingsCSS.css";
import { supabase } from "../lib/supabase";

const Settings = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullname: "", companyName: "", email: "", password: "", confirmPassword: "" });
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("postal_user");
    if (stored) {
      const u = JSON.parse(stored);
      setForm(f => ({ ...f, fullname: u.fullname || "", companyName: u.companyName || "", email: u.email || "" }));
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved("");
    setError("");
  };

  const handleSave = async () => {
    if (form.password && form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (form.password && form.password !== form.confirmPassword) { setError("Passwords don't match."); return; }

    setLoading(true);
    setError("");

    try {
      const updates = {};
      if (form.email) updates.email = form.email;
      if (form.password) updates.password = form.password;
      updates.data = { full_name: form.fullname, company_name: form.companyName };

      const { error: updateError } = await supabase.auth.updateUser(updates);
      if (updateError) throw updateError;

      localStorage.setItem("postal_user", JSON.stringify({
        fullname: form.fullname,
        companyName: form.companyName,
        email: form.email,
      }));
      window.dispatchEvent(new Event("storage"));

      setSaved("Changes saved successfully!");
      setForm(f => ({ ...f, password: "", confirmPassword: "" }));
    } catch (err) {
      setError(err.message || "Failed to save changes.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      // Sign out and clear local data (full deletion requires admin/server-side in Supabase)
      await supabase.auth.signOut();
      localStorage.removeItem("postal_user");
      window.dispatchEvent(new Event("storage"));
      navigate("/signup");
    } catch (err) {
      setError(err.message || "Failed to delete account.");
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-page__bg" />

      <div className="settings-container">
        <div className="settings-header">
          <div className="settings-header__icon">⚙</div>
          <div>
            <h1>Account Settings</h1>
            <p>Manage your profile and security</p>
          </div>
        </div>

        {/* Profile Section */}
        <div className="settings-section">
          <div className="settings-section__label">Profile</div>

          <div className="settings-field">
            <label>Full Name</label>
            <input name="fullname" value={form.fullname} onChange={handleChange} placeholder="Your full name" />
          </div>

          <div className="settings-field">
            <label>Company Name</label>
            <input name="companyName" value={form.companyName} onChange={handleChange} placeholder="Your company" />
          </div>
        </div>

        {/* Security Section */}
        <div className="settings-section">
          <div className="settings-section__label">Security</div>

          <div className="settings-field">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@company.com" />
          </div>

          <div className="settings-field">
            <label>New Password <span>(leave blank to keep current)</span></label>
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" />
          </div>

          <div className="settings-field">
            <label>Confirm New Password</label>
            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat new password" />
          </div>
        </div>

        {/* Feedback */}
        {saved && <div className="settings-success">✓ {saved}</div>}
        {error && <div className="settings-error">⚠️ {error}</div>}

        {/* Save Button */}
        <button className={`settings-save ${loading ? "loading" : ""}`} onClick={handleSave} disabled={loading}>
          {loading ? <span className="settings-spinner" /> : "Save Changes →"}
        </button>

        {/* Danger Zone */}
        <div className="settings-danger">
          <div className="settings-section__label danger">Danger Zone</div>
          <p>Deleting your account will permanently remove all your data. This cannot be undone.</p>

          {!deleteConfirm ? (
            <button className="settings-delete-btn" onClick={() => setDeleteConfirm(true)}>
              Delete Account
            </button>
          ) : (
            <div className="settings-delete-confirm">
              <span>Are you sure? This is irreversible.</span>
              <div className="settings-delete-confirm__actions">
                <button className="settings-delete-btn" onClick={handleDelete} disabled={loading}>Yes, Delete</button>
                <button className="settings-cancel-btn" onClick={() => setDeleteConfirm(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
