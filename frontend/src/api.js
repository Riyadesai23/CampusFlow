const BASE = "https://campus-flow-2-bbvj.onrender.com";

async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    // no body
  }

  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),

  getProfile: (token) => request("/profile/me", { token }),
  updateProfile: (token, payload) => request("/profile/me", { method: "PUT", body: payload, token }),

  getCourseCatalog: (token) => request("/courses", { token }),
  getMyCourses: (token) => request("/courses/mine", { token }),
  enroll: (token, courseId) => request("/courses/enroll", { method: "POST", body: { courseId }, token }),
  drop: (token, courseId) => request(`/courses/enroll/${courseId}`, { method: "DELETE", token }),

  getMyAttendance: (token) => request("/attendance/mine", { token }),
  getMyMarks: (token) => request("/marks/mine", { token }),
  getAnnouncements: (token) => request("/announcements", { token }),

  admin: {
    listStudents: (token) => request("/admin/students", { token }),
    getStudent: (token, id) => request(`/admin/students/${id}`, { token }),
    updateStudent: (token, id, payload) => request(`/admin/students/${id}`, { method: "PUT", body: payload, token }),
    deleteStudent: (token, id) => request(`/admin/students/${id}`, { method: "DELETE", token }),

    markAttendance: (token, payload) => request("/admin/attendance", { method: "POST", body: payload, token }),
    deleteAttendance: (token, id) => request(`/admin/attendance/${id}`, { method: "DELETE", token }),

    addMark: (token, payload) => request("/admin/marks", { method: "POST", body: payload, token }),
    updateMark: (token, id, payload) => request(`/admin/marks/${id}`, { method: "PUT", body: payload, token }),
    deleteMark: (token, id) => request(`/admin/marks/${id}`, { method: "DELETE", token }),

    addCourse: (token, payload) => request("/admin/courses", { method: "POST", body: payload, token }),
    updateCourse: (token, id, payload) => request(`/admin/courses/${id}`, { method: "PUT", body: payload, token }),
    deleteCourse: (token, id) => request(`/admin/courses/${id}`, { method: "DELETE", token }),

    addAnnouncement: (token, payload) => request("/admin/announcements", { method: "POST", body: payload, token }),
    deleteAnnouncement: (token, id) => request(`/admin/announcements/${id}`, { method: "DELETE", token }),
  },
};
