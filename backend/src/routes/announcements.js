const express = require("express");
const { load } = require("../db");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, (req, res) => {
  const data = load();
  const rows = data.announcements.slice().sort((a, b) => b.date.localeCompare(a.date));
  res.json(rows);
});

module.exports = router;
