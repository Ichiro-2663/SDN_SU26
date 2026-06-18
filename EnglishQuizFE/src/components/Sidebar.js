import React, { useState } from "react";
import {
  FaHome,
  FaBookOpen,
  FaPen,
  FaHistory,
  FaUserCircle,
  FaBars,
  FaTachometerAlt,
  FaUsersCog,
  FaQuestionCircle,
  FaFileAlt,
  FaChartPie,
  FaBookmark,
  FaClone,
} from "react-icons/fa";

const Sidebar = ({ onToggle, onSelect, role = "user" }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [active, setActive] = useState(
    role === "admin"
      ? "dashboard"
      : role === "teacher"
        ? "reports"
        : "dashboard",
  );

  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle(newState);
  };

  const menus = {
    user: [
      { key: "dashboard", name: "Dashboard", icon: <FaHome /> },
      { key: "practice", name: "Practice", icon: <FaBookOpen /> },
      { key: "quiz", name: "Take Quiz", icon: <FaPen /> },
      { key: "minitest", name: "Mini Tests", icon: <FaFileAlt /> },
      { key: "flashcards", name: "Flashcards", icon: <FaClone /> },
      { key: "bookmarks", name: "Bookmarks", icon: <FaBookmark /> },
      { key: "history", name: "History", icon: <FaHistory /> },
      { key: "profile", name: "Profile", icon: <FaUserCircle /> },
    ],

    student: [
      { key: "dashboard", name: "Dashboard", icon: <FaHome /> },
      { key: "practice", name: "Practice", icon: <FaBookOpen /> },
      { key: "quiz", name: "Take Quiz", icon: <FaPen /> },
      { key: "minitest", name: "Mini Tests", icon: <FaFileAlt /> },
      { key: "flashcards", name: "Flashcards", icon: <FaClone /> },
      { key: "bookmarks", name: "Bookmarks", icon: <FaBookmark /> },
      { key: "history", name: "History", icon: <FaHistory /> },
      { key: "profile", name: "Profile", icon: <FaUserCircle /> },
    ],

    teacher: [
      { key: "dashboard", name: "Dashboard", icon: <FaTachometerAlt /> },
      { key: "topics", name: "Topic Management", icon: <FaBookOpen /> },
      { key: "questions", name: "Question Bank", icon: <FaQuestionCircle /> },
      { key: "exams", name: "Exam Management", icon: <FaFileAlt /> },
    ],

    admin: [
      { key: "dashboard", name: "Dashboard", icon: <FaTachometerAlt /> },
      { key: "users", name: "User Management", icon: <FaUsersCog /> },
      { key: "reports", name: "System Reports", icon: <FaChartPie /> },
      { key: "system", name: "System Notice", icon: <FaFileAlt /> },
    ],
  };

  const menuItems = menus[role] || menus.user;

  return (
    <div
      style={{
        width: isOpen ? "220px" : "70px",
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(10px)",
        borderRight: "1px solid #e5e7eb",
        minHeight: "100vh",
        transition: "all 0.3s",
        position: "fixed",
        top: 0,
        left: 0,
      }}
      className="d-flex flex-column"
    >
      {/* Header */}
      <div
        className="d-flex align-items-center justify-content-between p-3"
        style={{
          background: "linear-gradient(135deg, #f97316, #eab308)",
          color: "white",
        }}
      >
        {isOpen && (
          <h5 className="fw-bold m-0">
            {role === "admin" ? "Admin Panel" : "English Quiz"}
          </h5>
        )}
        <FaBars style={{ cursor: "pointer" }} onClick={toggleSidebar} />
      </div>

      {/* Menu */}
      <div className="flex-grow-1 mt-3 px-2">
        {menuItems.map((item) => (
          <div
            key={item.key}
            onClick={() => {
              setActive(item.key);
              onSelect(item.key);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px",
              borderRadius: "10px",
              marginBottom: "8px",
              cursor: "pointer",
              background: active === item.key ? "#E0F2FE" : "transparent",
              color: active === item.key ? "#0284C7" : "#334155",
            }}
          >
            <div style={{ width: "30px", fontSize: "18px" }}>{item.icon}</div>
            {isOpen && <span>{item.name}</span>}
          </div>
        ))}
      </div>

      {isOpen && (
        <div className="text-center small p-3 text-muted">
          © {new Date().getFullYear()} English Quiz
        </div>
      )}
    </div>
  );
};

export default Sidebar;
