import React, { useEffect, useState } from "react";
import { Layout } from "../components/Layout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api";

export default function Courses() {
  const { token } = useAuth();
  const [catalog, setCatalog] = useState([]);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  async function refresh() {
    const [c, m] = await Promise.all([api.getCourseCatalog(token), api.getMyCourses(token)]);
    setCatalog(c);
    setMine(m);
    setLoading(false);
  }

  useEffect(() => { refresh(); }, [token]);

  async function toggle(courseId, enrolled) {
    setBusyId(courseId);
    try {
      if (enrolled) await api.drop(token, courseId);
      else await api.enroll(token, courseId);
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  const myIds = new Set(mine.map((c) => c.id));

  return (
    <Layout>
      <h1 className="page-title">Courses</h1>
      <p className="page-subtitle">Manage this term's schedule</p>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <div className="course-grid">
          {catalog.map((c) => {
            const enrolled = myIds.has(c.id);
            return (
              <div key={c.id} className={`course-card ${enrolled ? "enrolled" : ""}`}>
                <div className="course-card-top">
                  <div>
                    <p className="row-title">{c.name}</p>
                    <p className="row-sub">{c.instructor}</p>
                  </div>
                  <span className="credit-pill">{c.credits} cr</span>
                </div>
                <p className="row-sub mono">{c.schedule}</p>
                <button
                  className={enrolled ? "btn-danger-soft" : "btn-primary"}
                  disabled={busyId === c.id}
                  onClick={() => toggle(c.id, enrolled)}
                >
                  {busyId === c.id ? "…" : enrolled ? "Drop course" : "Add course"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
