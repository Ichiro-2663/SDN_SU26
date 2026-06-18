import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Badge, Form, Row, Col } from "react-bootstrap";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:9999/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, targetStatus) => {
    const action = targetStatus === "Disabled" ? "disable" : "enable";
    if (window.confirm(`Are you sure you want to ${action} this user?`)) {
      try {
        if (targetStatus === "Disabled") {
          await axios.delete(`http://localhost:9999/users/${id}`);
        } else {
          await axios.put(`http://localhost:9999/users/${id}`, { status: "Active" });
        }
        fetchUsers();
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) return <p className="text-center mt-4">Loading users...</p>;

  // Áp filter role + ngày tạo (client-side)
  const filteredUsers = users.filter((user) => {
    // role
    if (roleFilter !== "All" && user.role !== roleFilter) return false;

    // createdAt
    if (dateFrom) {
      const from = new Date(dateFrom);
      if (new Date(user.createdAt) < from) return false;
    }
    if (dateTo) {
      const to = new Date(dateTo);
      // include whole day
      to.setHours(23, 59, 59, 999);
      if (new Date(user.createdAt) > to) return false;
    }

    return true;
  });

  // Nhóm người dùng theo role từ danh sách đã lọc
  const usersByRole = filteredUsers.reduce((acc, user) => {
    const role = user.role || "Student";
    if (!acc[role]) acc[role] = [];
    acc[role].push(user);
    return acc;
  }, {});

  return (
    <div className="p-4">
      <h4 className="fw-bold mb-4 text-primary">👥 User Management</h4>
      <Form className="mb-4">
        <Row className="g-2 align-items-end">
          <Col md={3}>
            <Form.Group>
              <Form.Label>Role</Form.Label>
              <Form.Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option>All</option>
                <option>Admin</option>
                <option>Teacher</option>
                <option>Student</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>From</Form.Label>
              <Form.Control type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>To</Form.Label>
              <Form.Control type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </Form.Group>
          </Col>
          <Col md={3} className="d-flex gap-2">
            <Button variant="secondary" onClick={() => { setRoleFilter("All"); setDateFrom(""); setDateTo(""); }}>
              Reset
            </Button>
            <Button variant="primary" onClick={() => fetchUsers()}>
              Refresh
            </Button>
          </Col>
        </Row>
      </Form>

      {Object.keys(usersByRole).map((role) => (
        <div key={role} className="mb-4">
          <h5 className="text-secondary mb-3">{role}s</h5>
          <Table striped bordered hover responsive className="bg-white shadow-sm">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersByRole[role].length > 0 ? (
                usersByRole[role].map((u, index) => (
                  <tr key={u._id}>
                    <td>{index + 1}</td>
                    <td className="fw-bold">{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <Badge bg={role === "Admin" ? "danger" : role === "Teacher" ? "info" : "primary"}>
                        {role}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={u.status === "Disabled" ? "secondary" : "success"}>
                        {u.status || "Active"}
                      </Badge>
                    </td>
                    <td>
                      {u.status === "Disabled" ? (
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => handleToggleStatus(u._id, "Active")}
                          disabled={role === "Admin"}
                        >
                          Enable
                        </Button>
                      ) : (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleToggleStatus(u._id, "Disabled")}
                          disabled={role === "Admin"}
                        >
                          Disable
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      ))}
    </div>
  );
};

export default UserManagement;
