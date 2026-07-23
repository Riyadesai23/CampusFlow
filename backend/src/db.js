const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const DB_PATH = path.join(__dirname, "..", "data", "db.json");

function defaultData() {
  return {
    users: [],
    courses: [],
    enrollments: [],
    attendance: [],
    marks: [],
    announcements: [],
  };
}

function seed(data) {
  const adminId = crypto.randomUUID();
  data.users.push({
    id: adminId,
    name: "System Admin",
    email: "admin@campusflow.edu",
    passwordHash: bcrypt.hashSync("admin123", 10),
    role: "admin",
    rollNo: null,
    major: null,
    phone: "",
    joined: new Date().toISOString().slice(0, 10),
  });

  const courseSeeds = [
    { name: "Intro to Computer Science", instructor: "Dr. Elena Marsh", schedule: "Mon / Wed 9:00-10:30", credits: 4 },
    { name: "Linear Algebra", instructor: "Prof. Amit Rao", schedule: "Tue / Thu 11:00-12:30", credits: 3 },
    { name: "Academic Writing", instructor: "Dr. Sarah Klein", schedule: "Mon / Fri 13:00-14:00", credits: 2 },
    { name: "Classical Mechanics", instructor: "Prof. Daniel Osei", schedule: "Wed / Fri 10:00-11:30", credits: 4 },
    { name: "Principles of Economics", instructor: "Dr. Maria Lopez", schedule: "Tue / Thu 14:00-15:30", credits: 3 },
    { name: "Data Structures", instructor: "Prof. Wen Chao", schedule: "Mon / Wed 14:00-15:30", credits: 4 },
  ];
  data.courses = courseSeeds.map((c) => ({ id: crypto.randomUUID(), ...c }));

  data.announcements = [
    { id: crypto.randomUUID(), tag: "Registrar", title: "Fall semester registration opens July 20", body: "Students may add or drop electives through the Courses tab until August 5. Late changes require advisor approval.", date: "2026-07-10" },
    { id: crypto.randomUUID(), tag: "Exams", title: "Midterm schedule posted", body: "Midterm exams run August 18-22. Check the Marks tab after each exam for your recorded score.", date: "2026-07-08" },
    { id: crypto.randomUUID(), tag: "Library", title: "Extended library hours during finals", body: "The main library will stay open until 1am starting the last week of the term.", date: "2026-07-05" },
    { id: crypto.randomUUID(), tag: "IT Services", title: "Portal maintenance window", body: "This portal will be briefly unavailable Sunday 2am-3am for scheduled maintenance.", date: "2026-06-28" },
  ];

  return data;
}

function load() {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    const seeded = seed(defaultData());
    fs.writeFileSync(DB_PATH, JSON.stringify(seeded, null, 2));
    return seeded;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

function save(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = { load, save };
