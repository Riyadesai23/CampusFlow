import React, { useEffect, useMemo, useState } from "react";
import { Layout } from "../components/Layout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api";

export default function Attendance() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.getMyAttendance(token).then((r) => {
      setRows(r);
      setLoading(false);
    });
  }, [token]);

  const byCourse = useMemo(() => {
    const map = {};
    rows.forEach((r) => {
      if (!map[r.courseName]) map[r.courseName] = [];
      map[r.courseName].push(r);
    });
    return map;
  }, [rows]);

  const overallPct = rows.length
    ? Math.round((rows.filter((r) => r.status !== "absent").length / rows.length) * 100)
    : null;

  const courseNames = Object.keys(byCourse);
  const visible = filter === "all" ? courseNames : [filter];

  return (
    <Layout>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">{overallPct !== null ? `Overall ${overallPct}%` : "No records yet"}</p>
        </div>
        {courseNames.length > 0 && (
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="select">
            <option value="all">All courses</option>
            {courseNames.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </div>

      {loading && <p className="muted">Loading…</p>}
      {!loading && rows.length === 0 && <p className="muted">Your admin hasn't recorded any attendance yet.</p>}

      {visible.map((name) => {
        const list = byCourse[name].slice().sort((a, b) => a.date.localeCompare(b.date));
        const present = list.filter((r) => r.status !== "absent").length;
        const pct = Math.round((present / list.length) * 100);
        return (
          <div className="panel" key={name}>
            <div className="panel-header-row">
              <h3>{name}</h3>
              <span className={`pill ${pct >= 85 ? "pill-sage" : "pill-rust"}`}>{pct}%</span>
            </div>
            <div className="dot-row">
              {list.map((r) => (
                <span
                  key={r.id}
                  title={`${r.date} · ${r.status}`}
                  className={`dot dot-${r.status}`}
                />
              ))}
            </div>
            <div className="legend">
              <span><i className="dot-legend dot-present" /> Present</span>
              <span><i className="dot-legend dot-absent" /> Absent</span>
              <span><i className="dot-legend dot-excused" /> Excused</span>
            </div>
          </div>
        );
      })}
    </Layout>
  );
}
