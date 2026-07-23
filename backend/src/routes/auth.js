const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { load, save } = require("../db");

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET || "campusflow_dev_secret",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function publicUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

router.post("/register", (req, res) => {
  const { name, email, password, major } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required." });
  }

  const data = load();
  const emailLower = email.trim().toLowerCase();
  if (data.users.some((u) => u.email === emailLower)) {
    return res.status(409).json({ error: "An account with that email already exists." });
  }

  const user = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: emailLower,
    passwordHash: bcrypt.hashSync(password, 10),
    role: "student",
    rollNo: "SR" + Math.floor(10000 + Math.random() * 89999),
    major: major || null,
    phone: "",
    joined: new Date().toISOString().slice(0, 10),
  };

  data.users.push(user);
  save(data);

  const token = signToken(user);
  res.status(201).json({ token, user: publicUser(user) });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const data = load();
  const emailLower = email.trim().toLowerCase();
  const user = data.users.find((u) => u.email === emailLower);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

module.exports = router;
