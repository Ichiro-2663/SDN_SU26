import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const Footer = () => {
  return (
    <footer
      style={{
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(10px)",
        padding: "20px 0",
        borderTop: "1px solid #e5e7eb",
      }}
    >
      <Container>
        <Row className="text-center text-md-start">
          <Col md={4}>
            <h5 className="fw-bold text-primary">
              English Quiz
            </h5>
            <p className="text-muted">
              Improve your English with practice and quizzes.
            </p>
          </Col>

          <Col md={4}>
            <h6 className="fw-bold">Features</h6>
            <ul className="list-unstyled">
              <li>Practice</li>
              <li>Quiz</li>
              <li>Results</li>
              <li>History</li>
            </ul>
          </Col>

          <Col md={4}>
            <h6 className="fw-bold">Contact</h6>
            <p className="mb-1">📧 support@englishquiz.com</p>
            <p className="mb-0">📞 +84 123 456 789</p>
          </Col>
        </Row>

        <hr />
        <div className="text-center text-muted small">
          © {new Date().getFullYear()} English Quiz System
        </div>
      </Container>
    </footer>
  );
};

export default Footer;