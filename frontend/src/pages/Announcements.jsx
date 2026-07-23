import React, { useEffect, useState } from "react";
import { Layout } from "../components/Layout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api";

export default function Announcements() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnnouncements(token).then((r) => {
      setRows(r);
      setLoading(false);
    });
  }, [token]);

  return (
    <Layout>
      <h1 className="page-title">Announcements</h1>
      <p className="page-subtitle">Campus-wide notices</p>

      {loading && <p className="muted">Loading…</p>}

      <div className="announce-list">
        {rows.map((a) => (
          <div className="announce-item" key={a.id}>
            <div className="announce-meta">
              <span className="tag-label">{a.tag}</span>
              <span className="muted small">{a.date}</span>
            </div>
            <p className="row-title">{a.title}</p>
            <p className="row-sub">{a.body}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
}
