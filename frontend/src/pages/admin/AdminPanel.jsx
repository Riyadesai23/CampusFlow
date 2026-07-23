import React, { useEffect, useState } from "react";
import { Layout } from "../../components/Layout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../api";

export default function AdminPanel() {
  const { token } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [catalog, setCatalog] = useState([]);

  async function refreshList() {
    const [s, c] = await Promise.all([api.admin.listStudents(token), api.getCourseCatalog(token)]);
    setStudents(s);
    setCatalog(c);
    setLoading(false);
  }

  async function openStudent(id) {
    setSelectedId(id);
    const d = await api.admin.getStudent(token, id);
    setDetail(d);
  }

  useEffect(() => { refreshList(); }, [token]);

  async function removeStudent(id) {
    if (!confirm("Remove this student and all their records? This cannot be undone.")) return;
    await api.admin.deleteStudent(token, id);
    if (selectedId === id) { setSelectedId(null); setDetail(null); }
    await refreshList();
  }

  async function refreshDetail() {
    if (selectedId) {
      const d = await api.admin.getStudent(token, selectedId);
      setDetail(d);
      await refreshList();
    }
  }

  return (
    <Layout>
      <h1 className="page-title">Admin Panel</h1>
      <p className="page-subtitle">Manage students, attendance and marks</p>

      <div className="admin-grid">
        <div className="panel" style={{ padding: 0 }}>
          <div className="table-header">Students ({students.length})</div>
          {loading ? (
            <p className="muted" style={{ padding: 16 }}>Loading…</p>
          ) : (
            <table className="table">
              <thead>
                <tr><th>Name</th><th>Roll No.</th><th>Attendance</th><th>Courses</th><th></th></tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className={selectedId === s.id ? "row-selected" : ""}>
                    <td>
                      <button className="link-btn" onClick={() => openStudent(s.id)}>{s.name}</button>
                      <div className="muted small">{s.email}</div>
                    </td>
                    <td className="mono">{s.rollNo}</td>
                    <td className="mono">{s.attendancePct !== null ? `${s.attendancePct}%` : "—"}</td>
                    <td className="mono">{s.courseCount}</td>
                    <td><button className="link-btn danger" onClick={() => removeStudent(s.id)}>Remove</button></td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr><td colSpan={5} className="muted" style={{ padding: 16 }}>No students registered yet.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="panel">
          {!detail ? (
            <p className="muted">Select a student to view and edit their records.</p>
          ) : (
            <StudentDetail
              key={detail.id}
              detail={detail}
              catalog={catalog}
              token={token}
              onChange={refreshDetail}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}

function StudentDetail({ detail, catalog, token, onChange }) {
  const [attCourse, setAttCourse] = useState(catalog[0]?.id || "");
  const [attDate, setAttDate] = useState(new Date().toISOString().slice(0, 10));
  const [attStatus, setAttStatus] = useState("present");

  const [markCourse, setMarkCourse] = useState(catalog[0]?.id || "");
  const [markExam, setMarkExam] = useState("");
  const [markScore, setMarkScore] = useState("");
  const [markMax, setMarkMax] = useState("");

  async function submitAttendance(e) {
    e.preventDefault();
    if (!attCourse) return;
    await api.admin.markAttendance(token, { studentId: detail.id, courseId: attCourse, date: attDate, status: attStatus });
    onChange();
  }

  async function deleteAttendance(id) {
    await api.admin.deleteAttendance(token, id);
    onChange();
  }

  async function submitMark(e) {
    e.preventDefault();
    if (!markCourse || !markExam || markScore === "" || markMax === "") return;
    await api.admin.addMark(token, { studentId: detail.id, courseId: markCourse, exam: markExam, score: Number(markScore), max: Number(markMax) });
    setMarkExam(""); setMarkScore(""); setMarkMax("");
    onChange();
  }

  async function deleteMark(id) {
    await api.admin.deleteMark(token, id);
    onChange();
  }

  return (
    <>
      <h3>{detail.name}</h3>
      <p className="muted small mono">{detail.rollNo} · {detail.email}</p>

      <h4 className="sub-heading">Enrolled courses</h4>
      {detail.enrolledCourses.length === 0 && <p className="muted small">Not enrolled in any course.</p>}
      <ul className="plain-list">
        {detail.enrolledCourses.map((c) => <li key={c.id}>{c.name}</li>)}
      </ul>

      <h4 className="sub-heading">Record attendance</h4>
      <form onSubmit={submitAttendance} className="inline-form">
        <select value={attCourse} onChange={(e) => setAttCourse(e.target.value)}>
          {catalog.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="date" value={attDate} onChange={(e) => setAttDate(e.target.value)} />
        <select value={attStatus} onChange={(e) => setAttStatus(e.target.value)}>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="excused">Excused</option>
        </select>
        <button className="btn-primary small" type="submit">Save</button>
      </form>
      <div className="mini-list">
        {detail.attendance.slice(-8).reverse().map((a) => (
          <div className="mini-row" key={a.id}>
            <span className="mono">{a.date}</span>
            <span>{a.courseName}</span>
            <span className={`pill pill-${a.status === "present" ? "sage" : a.status === "absent" ? "rust" : "gold"}`}>{a.status}</span>
            <button className="link-btn danger" onClick={() => deleteAttendance(a.id)}>×</button>
          </div>
        ))}
      </div>

      <h4 className="sub-heading">Record marks</h4>
      <form onSubmit={submitMark} className="inline-form">
        <select value={markCourse} onChange={(e) => setMarkCourse(e.target.value)}>
          {catalog.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input placeholder="Exam name" value={markExam} onChange={(e) => setMarkExam(e.target.value)} />
        <input placeholder="Score" type="number" value={markScore} onChange={(e) => setMarkScore(e.target.value)} style={{ width: 70 }} />
        <input placeholder="Max" type="number" value={markMax} onChange={(e) => setMarkMax(e.target.value)} style={{ width: 70 }} />
        <button className="btn-primary small" type="submit">Save</button>
      </form>
      <div className="mini-list">
        {detail.marks.map((m) => (
          <div className="mini-row" key={m.id}>
            <span>{m.courseName}</span>
            <span>{m.exam}</span>
            <span className="mono">{m.score}/{m.max}</span>
            <button className="link-btn danger" onClick={() => deleteMark(m.id)}>×</button>
          </div>
        ))}
      </div>
    </>
  );
}
