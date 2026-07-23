import React, { useEffect, useMemo, useState } from "react";
import { Layout } from "../components/Layout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api";

function letterGrade(pct) {
  if (pct >= 93) return "A";
  if (pct >= 90) return "A-";
  if (pct >= 87) return "B+";
  if (pct >= 83) return "B";
  if (pct >= 80) return "B-";
  if (pct >= 77) return "C+";
  if (pct >= 70) return "C";
  return "D";
}

export default function Marks() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyMarks(token).then((r) => {
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

  return (
    <Layout>
      <h1 className="page-title">Marks</h1>
      <p className="page-subtitle">Scores recorded so far this term</p>

      {loading && <p className="muted">Loading…</p>}
      {!loading && rows.length === 0 && <p className="muted">No assessments recorded yet.</p>}

      {Object.entries(byCourse).map(([name, list]) => (
        <div className="panel" key={name} style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-header">{name}</div>
          <table className="table">
            <thead>
              <tr><th>Assessment</th><th>Score</th><th>Grade</th></tr>
            </thead>
            <tbody>
              {list.map((m) => {
                const pct = Math.round((m.score / m.max) * 100);
                return (
                  <tr key={m.id}>
                    <td>{m.exam}</td>
                    <td className="mono">{m.score} / {m.max}</td>
                    <td className={`mono grade grade-${pct >= 80 ? "high" : pct >= 70 ? "mid" : "low"}`}>{letterGrade(pct)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </Layout>
  );
}
