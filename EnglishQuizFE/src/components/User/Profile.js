import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { Form, Button, Card, Row, Col } from "react-bootstrap";
import { FaUserEdit, FaLock } from "react-icons/fa";

const Profile = () => {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [newName, setName] = useState("");
  const [newEmail, setEmail] = useState("");
  const [newAge, setAge] = useState("");
  const [newAddress, setAddress] = useState("");
  const [newSchool, setSchool] = useState("");

  const userId = localStorage.getItem("id");

  const getUserById = useCallback(async () => {
    try {
      if (!userId) return;
      const response = await axios.get(`http://localhost:9999/users/${userId}`);
      const data = response.data;
      setName(data.name || "");
      setEmail(data.email || "");
      setAge(data.age || "");
      setAddress(data.address || "");
      setSchool(data.school || "");
    } catch (error) {
      console.log("Error fetching user:", error);
    }
  }, [userId]);

  const updateProfile = async () => {
    try {
      await axios.put(`http://localhost:9999/users/${userId}`, {
        name: newName,
        email: newEmail,
        age: newAge,
        address: newAddress,
        school: newSchool,
      });
      alert("Profile updated successfully!");
      getUserById();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile!");
    }
  };

  const updatePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    try {
      await axios.put(`http://localhost:9999/users/change-password/${userId}`, {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      alert("Password changed successfully!");
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to change password!");
    }
  };

  useEffect(() => {
    getUserById();
  }, [getUserById]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "30px 20px" }}>
      <h3
        style={{ fontWeight: "700", marginBottom: "1.5rem", color: "#f97316" }}
      >
        <FaUserEdit className="me-2" />
        Manage Profile
      </h3>

      {/* PROFILE VIEW */}
      <Card
        style={{
          borderRadius: "15px",
          padding: "25px",
          marginBottom: "30px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
          border: "none",
        }}
      >
        <h5 className="mb-4 text-secondary border-bottom pb-2">
          Personal Information
        </h5>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Full Name</Form.Label>
                <Form.Control
                  type="text"
                  value={newName}
                  onChange={(e) => setName(e.target.value)}
                  style={{ borderRadius: "8px" }}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Email Address</Form.Label>
                <Form.Control
                  type="email"
                  value={newEmail}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ borderRadius: "8px" }}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Age</Form.Label>
                <Form.Control
                  type="number"
                  min="5"
                  value={newAge}
                  onChange={(e) => setAge(e.target.value)}
                  style={{ borderRadius: "8px" }}
                  placeholder="e.g. 20"
                />
              </Form.Group>
            </Col>
            <Col md={8}>
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  School/University
                </Form.Label>
                <Form.Control
                  type="text"
                  value={newSchool}
                  onChange={(e) => setSchool(e.target.value)}
                  style={{ borderRadius: "8px" }}
                  placeholder="Enter your school name"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Home Address</Form.Label>
            <Form.Control
              type="text"
              value={newAddress}
              onChange={(e) => setAddress(e.target.value)}
              style={{ borderRadius: "8px" }}
              placeholder="Enter your full address"
            />
          </Form.Group>

          <div className="d-flex justify-content-end mt-2">
            <Button
              variant="primary"
              style={{
                borderRadius: "10px",
                padding: "10px 20px",
                fontWeight: "bold",
              }}
              onClick={updateProfile}
            >
              Update Personal Details
            </Button>
          </div>
        </Form>
      </Card>

      {/* PASSWORD CHANGE */}
      <Card
        style={{
          borderRadius: "15px",
          padding: "25px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
          border: "none",
        }}
      >
        <h5 className="mb-4 text-secondary border-bottom pb-2">
          <FaLock className="me-2" /> Security & Password
        </h5>
        <Form>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  Current Password
                </Form.Label>
                <Form.Control
                  type="password"
                  name="currentPassword"
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  style={{ borderRadius: "8px" }}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">New Password</Form.Label>
                <Form.Control
                  type="password"
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  style={{ borderRadius: "8px" }}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  Confirm New Password
                </Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  style={{ borderRadius: "8px" }}
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end mt-3">
            <Button
              variant="success"
              style={{
                borderRadius: "10px",
                padding: "10px 20px",
                fontWeight: "bold",
              }}
              onClick={updatePassword}
            >
              Change Password
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Profile;
