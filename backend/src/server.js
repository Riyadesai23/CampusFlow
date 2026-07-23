require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const courseRoutes = require("./routes/courses");
const attendanceRoutes = require("./routes/attendance");
const marksRoutes = require("./routes/marks");
const announcementRoutes = require("./routes/announcements");
const adminRoutes = require("./routes/admin");
const { load } = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// Ensure the datastore exists / is seeded on boot
load();

app.get("/api/health", (req, res) => res.json({ ok: true, service: "campusflow-api" }));

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/marks", marksRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => res.status(404).json({ error: "Not found." }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`CampusFlow API listening on http://localhost:${PORT}`);
});
