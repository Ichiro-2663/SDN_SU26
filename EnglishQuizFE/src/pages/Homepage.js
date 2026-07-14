import React, { useContext, useEffect } from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { BookOpen, ClipboardList, BarChart3, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// Define static features outside to avoid recreating on each render
const FEATURES_DATA = [
  {
    icon: <BookOpen size={32} />,
    title: "Practice",
    path: "/login",
  },
  {
    icon: <ClipboardList size={32} />,
    title: "Take Quiz",
    path: "/login",
  },
  {
    icon: <BarChart3 size={32} />,
    title: "Results",
    path: "/login",
  },
  {
    icon: <Award size={32} />,
    title: "Ranking",
    path: "/login",
  },
];

const Homepage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (isAuthenticated && user) {
      const role = (user.role || "").toUpperCase();
      if (role === "ADMIN") {
        navigate("/admin");
      } else if (role === "TEACHER") {
        navigate("/teacher");
      } else {
        navigate("/student");
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f97316 0%, #eab308 100%)",
        padding: "60px 20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {/* HERO */}
      <div className="text-center text-white mb-5 animate-fade-in">
        <h1
          className="display-4 fw-bold mb-3"
          style={{ textShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
        >
          English Quiz System
        </h1>
        <p className="lead mb-4" style={{ opacity: 0.95 }}>
          Practice, test and improve your English skills anytime
        </p>

        <div className="d-flex justify-content-center gap-3">
          <Button
            onClick={() => navigate("/login")}
            className="px-4 py-2 shadow-sm home-btn-primary"
            style={{
              borderRadius: "12px",
              background: "#fff",
              color: "#fff",
              border: "none",
              fontWeight: "600",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
          >
            Start Quiz
          </Button>

          <Button
            onClick={() => navigate("/login")}
            className="px-4 py-2 home-btn-outline"
            style={{
              borderRadius: "12px",
              background: "transparent",
              border: "2px solid #fff",
              color: "#fff",
              fontWeight: "600",
              transition: "background 0.2s, color 0.2s",
            }}
          >
            Login
          </Button>
        </div>
      </div>

      {/* FEATURES */}
      <Container>
        <Row className="g-4 justify-content-center">
          {FEATURES_DATA.map((item, index) => (
            <Col key={index} xs={12} sm={6} md={6} lg={3}>
              <Card
                onClick={() => navigate(item.path)}
                className="feature-card shadow"
                style={{
                  borderRadius: "20px",
                  padding: "30px 20px",
                  cursor: "pointer",
                  textAlign: "center",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                  background: "rgba(255, 255, 255, 0.85)",
                  backdropFilter: "blur(12px)",
                  transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                }}
              >
                <div style={{ marginBottom: "15px", color: "#f97316" }}>
                  {item.icon}
                </div>
                <h5 className="fw-bold text-dark">{item.title}</h5>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* CSS overrides for smooth animations and states */}
      <style>{`
        .feature-card:hover {
          transform: translateY(-8px);
          background: rgba(255, 255, 255, 0.98) !important;
          box-shadow: 0 15px 30px rgba(0,0,0,0.2) !important;
        }
        .home-btn-primary:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 20px rgba(0,0,0,0.2);
        }
        .home-btn-outline:hover {
          background: #fff !important;
          color: #f97316 !important;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Homepage;