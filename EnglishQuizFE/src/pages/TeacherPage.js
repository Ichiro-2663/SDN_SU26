import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

import QuestionBank from "../components/Admin/QuestionBank";
import ExamManagement from "../components/Admin/ExamManagement";
import Reports from "../components/Admin/Reports";

const TeacherPage = () => {
  const [selected, setSelected] = useState("reports");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderContent = () => {
    switch (selected) {
      case "reports":
        return <Reports />;

      case "questions":
        return <QuestionBank />;

      case "exams":
        return <ExamManagement />;

      default:
        return <Reports />;
    }
  };

  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar */}
      <Sidebar
        role="teacher"
        onToggle={setSidebarOpen}
        onSelect={setSelected}
      />

      {/* Main Content */}
      <div
        style={{
          marginLeft: sidebarOpen ? "220px" : "70px",
          transition: "margin-left 0.3s ease",
          width: "100%",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #fff7ed, #f9fafb)",
        }}
      >
        <Header />

        {/* Content Wrapper */}
        <div style={{ padding: "20px" }}>
          {/* Page Title */}
          <div
            style={{
              marginBottom: "20px",
              padding: "20px",
              borderRadius: "15px",
              background: "linear-gradient(135deg, #f97316, #eab308)",
              color: "white",
              boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
            }}
          >
            <h2 style={{ margin: 0, fontWeight: "700" }}>
              Teacher Panel
            </h2>
            <p style={{ margin: 0, opacity: 0.9 }}>
              Manage curriculum questions, compile tests, and review student progress reports
            </p>
          </div>

          {/* Actual Content */}
          <div
            style={{
              background: "white",
              borderRadius: "15px",
              padding: "20px",
              boxShadow: "0 5px 20px rgba(0,0,0,0.05)",
            }}
          >
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherPage;
