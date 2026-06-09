import React, { useState, useContext, useEffect } from "react";
import { Form, Button, Card, Container } from "react-bootstrap";
import { FcGoogle } from "react-icons/fc";
import { ArrowLeft } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const [flash, setFlash] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const f = sessionStorage.getItem("flash");
      if (f) {
        setFlash(JSON.parse(f));
        sessionStorage.removeItem("flash");
        setTimeout(() => setFlash(null), 3000);
      }
    } catch {
      sessionStorage.removeItem("flash");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f97316, #eab308)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {/* Floating Back Button */}
      <Button
        onClick={() => navigate("/")}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          borderRadius: "50px",
          padding: "8px 14px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "rgba(255,255,255,0.9)",
          border: "none",
          backdropFilter: "blur(10px)",
          boxShadow: "0 5px 15px rgba(0,0,0,0.15)",
          transition: "0.3s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.transform = "translateX(-4px)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.transform = "translateX(0)")
        }
      >
        <ArrowLeft size={16} />
        Home
      </Button>

      <Container className="d-flex justify-content-center">
        <Card
          style={{
            width: "100%",
            maxWidth: "420px",
            borderRadius: "20px",
            padding: "30px",
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            border: "none",
          }}
        >
          <div className="text-center mb-4">
            <h2 style={{ fontWeight: "700" }}>Welcome Back</h2>
            <p style={{ color: "#777" }}>
              Continue your English journey 🚀
            </p>
          </div>

          {flash && (
            <div className={`alert alert-${flash.type}`}>
              {flash.message}
            </div>
          )}

          {error && <div className="alert alert-danger">{error}</div>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ borderRadius: "10px" }}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ borderRadius: "10px" }}
              />
            </Form.Group>

            <Button
              type="submit"
              className="w-100"
              style={{
                borderRadius: "12px",
                padding: "12px",
                fontWeight: "600",
                background:
                  "linear-gradient(135deg, #f97316, #eab308)",
                border: "none",
              }}
            >
              Login
            </Button>

            <div className="text-center my-3 text-muted">or</div>

            <Button
              variant="light"
              className="w-100 d-flex align-items-center justify-content-center"
              style={{
                borderRadius: "12px",
                padding: "10px",
                border: "1px solid #ddd",
              }}
            >
              <FcGoogle size={20} className="me-2" />
              Login with Google
            </Button>
          </Form>

          <div className="text-center mt-4">
            <small>
              Don't have an account?{" "}
              <a href="/register" style={{ color: "#f97316" }}>
                Sign up
              </a>
            </small>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default Login;