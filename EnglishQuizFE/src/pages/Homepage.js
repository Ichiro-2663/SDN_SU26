import React, { useContext, useEffect } from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { BookOpen, ClipboardList, BarChart3, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Homepage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/student");
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f97316 0%, #eab308 100%)",
        padding: "40px 20px",
      }}
    >
      {/* HERO */}
      <div className="text-center text-white mb-5">
        <h1 style={{ fontWeight: "700", fontSize: "2.8rem" }}>
          English Quiz System
        </h1>
        <p style={{ fontSize: "1.1rem", opacity: 0.9 }}>
          Practice, test and improve your English skills anytime
        </p>

        <div className="mt-4">
          <Button
            onClick={() => navigate("/login")}
            style={{
              borderRadius: "12px",
              padding: "10px 24px",
              marginRight: "10px",
              background: "#fff",
              color: "#f97316",
              border: "none",
              fontWeight: "600",
            }}
          >
            Start Quiz
          </Button>

          <Button
            onClick={() => navigate("/login")}
            style={{
              borderRadius: "12px",
              padding: "10px 24px",
              background: "transparent",
              border: "2px solid #fff",
              color: "#fff",
              fontWeight: "600",
            }}
          >
            Login
          </Button>
        </div>
      </div>

      {/* FEATURES */}
      <Container>
        <Row className="g-4 justify-content-center">
          {[
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
          ].map((item, index) => (
            <Col key={index} xs={12} md={6} lg={3}>
              <Card
                onClick={() => navigate(item.path)}
                style={{
                  borderRadius: "20px",
                  padding: "25px",
                  cursor: "pointer",
                  textAlign: "center",
                  border: "none",
                  background: "rgba(255,255,255,0.9)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                  transition: "0.3s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-8px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                <div style={{ marginBottom: "10px", color: "#f97316" }}>
                  {item.icon}
                </div>
                <h5 style={{ fontWeight: "600" }}>{item.title}</h5>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default Homepage;