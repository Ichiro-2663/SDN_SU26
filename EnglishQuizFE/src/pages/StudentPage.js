import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import Profile from "../components/User/Profile";
import { Container, Row } from "react-bootstrap";

import Practice from "../components/User/Practice";
import Quiz from "../components/User/Quiz";
import History from "../components/User/History";
import UserDashboard from "../components/User/UserDashboard";
import Flashcards from "../components/User/Flashcards";
import Bookmarks from "../components/User/Bookmarks";

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

      case "minitest":
        return <Quiz type="minitest" />;

      case "history":
        return <History />;

      case "flashcards":
        return <Flashcards />;

      case "bookmarks":
        return <Bookmarks />;

      default:
        return <UserDashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <>
      <Sidebar
        onToggle={setIsSidebarOpen}
        onSelect={setActiveTab}
        role="student"
      />

      <div
        style={{
          marginLeft: isSidebarOpen ? "220px" : "70px",
          transition: "margin-left 0.3s ease",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <Header />

        <Container fluid className="my-5 flex-grow-1">
          <Row>{renderContent()}</Row>
        </Container>

        <Footer />
      </div>
    </>
  );
};

export default StudentPage;