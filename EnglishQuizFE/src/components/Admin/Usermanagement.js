import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Badge } from "react-bootstrap";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await axios.delete(`http://localhost:9999/users/${id}`);
        fetchUsers();
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) return <p className="text-center mt-4">Loading users...</p>;

  // Nhóm người dùng theo role
  const usersByRole = users.reduce((acc, user) => {
    const role = user.role || "USER";
    if (!acc[role]) acc[role] = [];
    acc[role].push(user);
    return acc;
  }, {});

  return (
    <div className="p-4">
      <h4 className="fw-bold mb-4 text-primary">👥 User Management</h4>

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
                      <Badge bg={role === "ADMIN" ? "danger" : "primary"}>
                        {role}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(u._id)}
                        disabled={role === "ADMIN"} // Prevent deleting admins for safety
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted">
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
