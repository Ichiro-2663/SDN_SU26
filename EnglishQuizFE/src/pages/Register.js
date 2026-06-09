import React, { useState } from "react";
import { Form, Button, Card, Container } from "react-bootstrap";
import { FcGoogle } from "react-icons/fc";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [role, setRole] = useState("Student");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill all fields");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:9999/auth/register", {
        name,
        email,
        password,
        role,
      });

      sessionStorage.setItem(
        "flash",
        JSON.stringify({
          type: "success",
          message: res.data?.message || "Account created!",
        })
      );

      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Register failed");
    } finally {
      setLoading(false);
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
      {/* Floating Back */}
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
            <h2 style={{ fontWeight: "700" }}>
              Create Account
            </h2>
            <p style={{ color: "#777" }}>
              Start your English journey 🚀
            </p>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your fullname here"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ borderRadius: "10px" }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Register As</Form.Label>
              <Form.Select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ borderRadius: "10px" }}
              >
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
              </Form.Select>
            </Form.Group>

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

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ borderRadius: "10px" }}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                style={{ borderRadius: "10px" }}
              />
            </Form.Group>

            <Button
              type="submit"
              disabled={loading}
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
              {loading ? "Creating..." : "Sign Up"}
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
              Sign up with Google
            </Button>
          </Form>

          <div className="text-center mt-4">
            <small>
              Already have an account?{" "}
              <a href="/login" style={{ color: "#f97316" }}>
                Login
              </a>
            </small>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default Register;