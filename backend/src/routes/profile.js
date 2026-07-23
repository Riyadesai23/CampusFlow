const express = require("express");
const { load, save } = require("../db");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

function publicUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

router.get("/me", authenticate, (req, res) => {
  const data = load();
  const user = data.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found." });
  res.json(publicUser(user));
});

router.put("/me", authenticate, (req, res) => {
  const { phone, major, name } = req.body || {};
  const data = load();
  const user = data.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found." });

  if (phone !== undefined) user.phone = phone;
  if (major !== undefined) user.major = major;
  if (name !== undefined && name.trim()) user.name = name.trim();

  save(data);
  res.json(publicUser(user));
});

module.exports = router;
