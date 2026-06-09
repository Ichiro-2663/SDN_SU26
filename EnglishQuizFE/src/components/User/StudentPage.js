import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import Profile from "../components/User/Profile";
import UserFeedback from "../components/User/UserFeedback";
import { Container, Row } from "react-bootstrap";

import Practice from "../components/User/Practice";
import Quiz from "../components/User/Quiz";
import History from "../components/User/History";

const StudentPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <Profile />;

      case "practice":
        return <Practice />;

      case "quiz":
        return <Quiz />;

      case "history":
        return <History />;

      case "feedback":
        return <UserFeedback />;

      default:
        return (
          <div
            style={{
              background:
                "linear-gradient(135deg, #f97316, #eab308)",
              color: "white",
              padding: "2.5rem",
              borderRadius: "20px",
              textAlign: "center",
              boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
            }}
          >
            <h1 style={{ fontWeight: "700" }}>
              Welcome to English Quiz Dashboard 🚀
            </h1>
            <p style={{ marginTop: "10px", opacity: 0.9 }}>
              Practice, take quizzes and track your progress easily
            </p>

            <div style={{ marginTop: "20px" }}>
              <button
                onClick={() => setActiveTab("quiz")}
                style={{
                  marginRight: "10px",
                  padding: "10px 20px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#fff",
                  color: "#f97316",
                  fontWeight: "600",
                }}
              >
                Start Quiz
              </button>

              <button
                onClick={() => setActiveTab("practice")}
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  border: "2px solid #fff",
                  background: "transparent",
                  color: "#fff",
                  fontWeight: "600",
                }}
              >
                Practice Now
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <Sidebar
        onToggle={setIsSidebarOpen}
        onSelect={setActiveTab}
        role="user"
      />

      <div
        style={{
          marginLeft: isSidebarOpen ? "220px" : "70px",
          transition: "margin-left 0.3s ease",
        }}
      >
        <Header />

        <Container fluid className="my-5">
          <Row>{renderContent()}</Row>
        </Container>

        <Footer />
      </div>
    </>
  );
};

export default StudentPage;