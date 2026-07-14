import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

// 👉 Admin components
import AdminDashboard from "../components/Admin/Admindashboard";
import UserManagement from "../components/Admin/Usermanagement";
import Reports from "../components/Admin/Reports";
import SystemNotice from "../components/Admin/SystemNotice";

const AdminPage = () => {
  const [selected, setSelected] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderContent = () => {
    switch (selected) {
      case "dashboard":
        return <AdminDashboard onSelect={setSelected} />;

      case "users":
        return <UserManagement />;

      case "reports":
        return <Reports />;

      case "system":
        return <SystemNotice />;

      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar */}
      <Sidebar role="admin" onToggle={setSidebarOpen} onSelect={setSelected} />

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
        <div
          style={{
            padding: "20px",
          }}
        >
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
            <h2 style={{ margin: 0, fontWeight: "700" }}>Admin Dashboard</h2>
            <p style={{ margin: 0, opacity: 0.9 }}>
              Manage user accounts and system permissions
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

export default AdminPage;
