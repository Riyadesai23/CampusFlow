const express = require("express");
const { load, save } = require("../db");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// Full catalog
router.get("/", authenticate, (req, res) => {
  const data = load();
  res.json(data.courses);
});

// Courses the current user is enrolled in
router.get("/mine", authenticate, (req, res) => {
  const data = load();
  const myEnrollments = data.enrollments.filter((e) => e.userId === req.user.id);
  const courses = myEnrollments
    .map((e) => data.courses.find((c) => c.id === e.courseId))
    .filter(Boolean);
  res.json(courses);
});

// Enroll in a course
router.post("/enroll", authenticate, (req, res) => {
  const { courseId } = req.body || {};
  const data = load();

  if (!data.courses.some((c) => c.id === courseId)) {
    return res.status(404).json({ error: "Course not found." });
  }
  if (data.enrollments.some((e) => e.userId === req.user.id && e.courseId === courseId)) {
    return res.status(409).json({ error: "Already enrolled in this course." });
  }

  data.enrollments.push({ id: require("crypto").randomUUID(), userId: req.user.id, courseId });
  save(data);
  res.status(201).json({ ok: true });
});

// Drop a course
router.delete("/enroll/:courseId", authenticate, (req, res) => {
  const data = load();
  data.enrollments = data.enrollments.filter(
    (e) => !(e.userId === req.user.id && e.courseId === req.params.courseId)
  );
  save(data);
  res.json({ ok: true });
});

module.exports = router;
