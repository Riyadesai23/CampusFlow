const express = require("express");
const { load } = require("../db");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.get("/mine", authenticate, (req, res) => {
  const data = load();
  const rows = data.attendance
    .filter((a) => a.userId === req.user.id)
    .map((a) => {
      const course = data.courses.find((c) => c.id === a.courseId);
      return { ...a, courseName: course ? course.name : "Unknown course" };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
  res.json(rows);
});

module.exports = router;
