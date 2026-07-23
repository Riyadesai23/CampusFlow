import React, { useState } from "react";
import { Layout } from "../components/Layout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api";

export default function Profile() {
  const { token, user, updateLocalUser } = useAuth();
  const [phone, setPhone] = useState(user?.phone || "");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      const updated = await api.updateProfile(token, { phone });
      updateLocalUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Layout>
      <h1 className="page-title">Profile</h1>

      <div className="id-card">
        <p className="id-eyebrow">CampusFlow · Student ID</p>
        <p className="id-name">{user?.name}</p>
        <p className="id-roll mono">{user?.rollNo || "—"}</p>
        <div className="id-grid">
          <div><span className="id-label">Email</span><p className="mono">{user?.email}</p></div>
          <div><span className="id-label">Major</span><p className="mono">{user?.major || "—"}</p></div>
          <div><span className="id-label">Joined</span><p className="mono">{user?.joined}</p></div>
          <div><span className="id-label">Status</span><p className="mono">Active</p></div>
        </div>
      </div>

      <div className="panel" style={{ maxWidth: 480 }}>
        <h3>Contact details</h3>
        <label className="field">
          <span>Phone number</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 1234" />
        </label>
        <button className="btn-primary" onClick={save} disabled={busy} style={{ marginTop: 12 }}>
          {busy ? "Saving…" : "Save changes"}
        </button>
        {saved && <span className="saved-tag">Saved</span>}
      </div>
    </Layout>
  );
}
