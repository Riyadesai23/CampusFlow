const express = require("express");
const { load } = require("../db");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.get("/mine", authenticate, (req, res) => {
  const data = load();
  const rows = data.marks
    .filter((m) => m.userId === req.user.id)
    .map((m) => {
      const course = data.courses.find((c) => c.id === m.courseId);
      return { ...m, courseName: course ? course.name : "Unknown course" };
    });
  res.json(rows);
});

module.exports = router;
