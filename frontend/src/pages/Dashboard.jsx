import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api";

export default function Dashboard() {
  const { token, user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [marks, setMarks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [a, m, c, an] = await Promise.all([
        api.getMyAttendance(token),
        api.getMyMarks(token),
        api.getMyCourses(token),
        api.getAnnouncements(token),
      ]);
      setAttendance(a);
      setMarks(m);
      setCourses(c);
      setAnnouncements(an);
      setLoading(false);
    }
    load();
  }, [token]);

  const attendancePct = attendance.length
    ? Math.round((attendance.filter((a) => a.status !== "absent").length / attendance.length) * 100)
    : null;

  const marksPct = marks.length
    ? Math.round((marks.reduce((s, m) => s + m.score, 0) / marks.reduce((s, m) => s + m.max, 0)) * 100)
    : null;

  return (
    <Layout>
      <h1 className="page-title">Welcome back, {user?.name?.split(" ")[0]}</h1>
      <p className="page-subtitle">Roll No. {user?.rollNo || "—"} · {courses.length} courses this term</p>

      {loading ? (
        <p className="muted">Loading your dashboard…</p>
      ) : (
        <>
          <div className="stat-grid">
            <StatCard label="Attendance" value={attendancePct !== null ? `${attendancePct}%` : "—"} tone={attendancePct >= 85 ? "sage" : "rust"} to="/attendance" />
            <StatCard label="Overall marks" value={marksPct !== null ? `${marksPct}%` : "—"} tone="gold" to="/marks" />
            <StatCard label="Enrolled courses" value={courses.length} tone="ink" to="/courses" />
          </div>

          <div className="panel-grid">
            <div className="panel">
              <h3>Your courses</h3>
              {courses.length === 0 && <p className="muted">You're not enrolled in any courses yet.</p>}
              {courses.slice(0, 5).map((c) => (
                <div className="row-item" key={c.id}>
                  <div>
                    <p className="row-title">{c.name}</p>
                    <p className="row-sub mono">{c.schedule}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="panel">
              <h3>Latest announcements</h3>
              {announcements.slice(0, 3).map((a) => (
                <div className="row-item" key={a.id}>
                  <p className="tag-label">{a.tag} · {a.date}</p>
                  <p className="row-title">{a.title}</p>
                </div>
              ))}
              <Link to="/announcements" className="link-more">View all →</Link>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}

function StatCard({ label, value, tone, to }) {
  return (
    <Link to={to} className={`stat-card tone-${tone}`}>
      <p className="stat-label">{label}</p>
      <span className="stat-value">{value}</span>
    </Link>
  );
}
