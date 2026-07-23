import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/profile", label: "Profile" },
  { to: "/attendance", label: "Attendance" },
  { to: "/marks", label: "Marks" },
  { to: "/courses", label: "Courses" },
  { to: "/announcements", label: "Announcements" },
];

export function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">CampusFlow</div>
        <nav className="nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
            >
              {item.label}
            </NavLink>
          ))}
          {user?.role === "admin" && (
            <NavLink to="/admin" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
              Admin Panel
            </NavLink>
          )}
        </nav>
        <button className="btn-ghost logout" onClick={handleLogout}>Log out</button>
      </aside>
      <main className="main">
        <div className="topbar">
          <span className="user-chip">{user?.name}</span>
        </div>
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
