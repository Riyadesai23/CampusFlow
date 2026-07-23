const express = require("express");
const crypto = require("crypto");
const { load, save } = require("../db");
const { authenticate, requireAdmin } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate, requireAdmin);

function publicUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

/* ---------------- Students ---------------- */

router.get("/students", (req, res) => {
  const data = load();
  const students = data.users
    .filter((u) => u.role === "student")
    .map((u) => {
      const attendanceRows = data.attendance.filter((a) => a.userId === u.id);
      const present = attendanceRows.filter((a) => a.status !== "absent").length;
      const attendancePct = attendanceRows.length ? Math.round((present / attendanceRows.length) * 100) : null;
      const courseCount = data.enrollments.filter((e) => e.userId === u.id).length;
      return { ...publicUser(u), attendancePct, courseCount };
    });
  res.json(students);
});

router.get("/students/:id", (req, res) => {
  const data = load();
  const user = data.users.find((u) => u.id === req.params.id && u.role === "student");
  if (!user) return res.status(404).json({ error: "Student not found." });

  const enrolledCourses = data.enrollments
    .filter((e) => e.userId === user.id)
    .map((e) => data.courses.find((c) => c.id === e.courseId))
    .filter(Boolean);

  const attendance = data.attendance
    .filter((a) => a.userId === user.id)
    .map((a) => ({ ...a, courseName: data.courses.find((c) => c.id === a.courseId)?.name || "Unknown" }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const marks = data.marks
    .filter((m) => m.userId === user.id)
    .map((m) => ({ ...m, courseName: data.courses.find((c) => c.id === m.courseId)?.name || "Unknown" }));

  res.json({ ...publicUser(user), enrolledCourses, attendance, marks });
});

router.put("/students/:id", (req, res) => {
  const { name, major, phone, rollNo } = req.body || {};
  const data = load();
  const user = data.users.find((u) => u.id === req.params.id && u.role === "student");
  if (!user) return res.status(404).json({ error: "Student not found." });

  if (name !== undefined) user.name = name;
  if (major !== undefined) user.major = major;
  if (phone !== undefined) user.phone = phone;
  if (rollNo !== undefined) user.rollNo = rollNo;

  save(data);
  res.json(publicUser(user));
});

router.delete("/students/:id", (req, res) => {
  const data = load();
  const exists = data.users.some((u) => u.id === req.params.id && u.role === "student");
  if (!exists) return res.status(404).json({ error: "Student not found." });

  data.users = data.users.filter((u) => u.id !== req.params.id);
  data.enrollments = data.enrollments.filter((e) => e.userId !== req.params.id);
  data.attendance = data.attendance.filter((a) => a.userId !== req.params.id);
  data.marks = data.marks.filter((m) => m.userId !== req.params.id);

  save(data);
  res.json({ ok: true });
});

/* ---------------- Attendance ---------------- */

// Mark or update a single attendance record for a student/course/date
router.post("/attendance", (req, res) => {
  const { studentId, courseId, date, status } = req.body || {};
  if (!studentId || !courseId || !date || !status) {
    return res.status(400).json({ error: "studentId, courseId, date and status are required." });
  }
  if (!["present", "absent", "excused"].includes(status)) {
    return res.status(400).json({ error: "status must be present, absent or excused." });
  }

  const data = load();
  const existing = data.attendance.find(
    (a) => a.userId === studentId && a.courseId === courseId && a.date === date
  );

  if (existing) {
    existing.status = status;
  } else {
    data.attendance.push({ id: crypto.randomUUID(), userId: studentId, courseId, date, status });
  }

  save(data);
  res.status(201).json({ ok: true });
});

router.delete("/attendance/:id", (req, res) => {
  const data = load();
  data.attendance = data.attendance.filter((a) => a.id !== req.params.id);
  save(data);
  res.json({ ok: true });
});

/* ---------------- Marks ---------------- */

router.post("/marks", (req, res) => {
  const { studentId, courseId, exam, score, max } = req.body || {};
  if (!studentId || !courseId || !exam || score === undefined || max === undefined) {
    return res.status(400).json({ error: "studentId, courseId, exam, score and max are required." });
  }

  const data = load();
  data.marks.push({
    id: crypto.randomUUID(),
    userId: studentId,
    courseId,
    exam,
    score: Number(score),
    max: Number(max),
  });
  save(data);
  res.status(201).json({ ok: true });
});

router.put("/marks/:id", (req, res) => {
  const { exam, score, max } = req.body || {};
  const data = load();
  const mark = data.marks.find((m) => m.id === req.params.id);
  if (!mark) return res.status(404).json({ error: "Mark not found." });

  if (exam !== undefined) mark.exam = exam;
  if (score !== undefined) mark.score = Number(score);
  if (max !== undefined) mark.max = Number(max);

  save(data);
  res.json({ ok: true });
});

router.delete("/marks/:id", (req, res) => {
  const data = load();
  data.marks = data.marks.filter((m) => m.id !== req.params.id);
  save(data);
  res.json({ ok: true });
});

/* ---------------- Courses ---------------- */

router.post("/courses", (req, res) => {
  const { name, instructor, schedule, credits } = req.body || {};
  if (!name) return res.status(400).json({ error: "Course name is required." });

  const data = load();
  const course = { id: crypto.randomUUID(), name, instructor: instructor || "", schedule: schedule || "", credits: Number(credits) || 0 };
  data.courses.push(course);
  save(data);
  res.status(201).json(course);
});

router.put("/courses/:id", (req, res) => {
  const { name, instructor, schedule, credits } = req.body || {};
  const data = load();
  const course = data.courses.find((c) => c.id === req.params.id);
  if (!course) return res.status(404).json({ error: "Course not found." });

  if (name !== undefined) course.name = name;
  if (instructor !== undefined) course.instructor = instructor;
  if (schedule !== undefined) course.schedule = schedule;
  if (credits !== undefined) course.credits = Number(credits);

  save(data);
  res.json(course);
});

router.delete("/courses/:id", (req, res) => {
  const data = load();
  data.courses = data.courses.filter((c) => c.id !== req.params.id);
  data.enrollments = data.enrollments.filter((e) => e.courseId !== req.params.id);
  save(data);
  res.json({ ok: true });
});

/* ---------------- Announcements ---------------- */

router.post("/announcements", (req, res) => {
  const { tag, title, body } = req.body || {};
  if (!title || !body) return res.status(400).json({ error: "Title and body are required." });

  const data = load();
  const announcement = {
    id: crypto.randomUUID(),
    tag: tag || "General",
    title,
    body,
    date: new Date().toISOString().slice(0, 10),
  };
  data.announcements.push(announcement);
  save(data);
  res.status(201).json(announcement);
});

router.put("/announcements/:id", (req, res) => {
  const { tag, title, body } = req.body || {};
  const data = load();
  const a = data.announcements.find((x) => x.id === req.params.id);
  if (!a) return res.status(404).json({ error: "Announcement not found." });

  if (tag !== undefined) a.tag = tag;
  if (title !== undefined) a.title = title;
  if (body !== undefined) a.body = body;

  save(data);
  res.json(a);
});

router.delete("/announcements/:id", (req, res) => {
  const data = load();
  data.announcements = data.announcements.filter((a) => a.id !== req.params.id);
  save(data);
  res.json({ ok: true });
});

module.exports = router;
