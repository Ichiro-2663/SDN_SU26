import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";
import { FaBookOpen, FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";

const TopicManagement = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
  });

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(false);
      const res = await axios.get("http://localhost:9999/topics");
      setTopics(res.data);
    } catch (err) {
      console.error("Failed to fetch topics:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/[^\w-]+/g, "") // Remove all non-word chars
      .replace(/--+/g, "-"); // Replace multiple - with single -
  };

  const handleNameChange = (e) => {
    const nameVal = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: nameVal,
      slug: prev.slug === generateSlug(prev.name) ? generateSlug(nameVal) : prev.slug,
    }));
  };

  const handleShow = (topic = null) => {
    if (topic) {
      setEditingId(topic._id);
      setFormData({
        name: topic.name || "",
        description: topic.description || "",
        slug: topic.slug || "",
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", description: "", slug: "" });
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this topic? This cannot be undone.")) {
      try {
        await axios.delete(`http://localhost:9999/topics/${id}`);
        fetchTopics();
      } catch (err) {
        console.error("Failed to delete topic:", err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalSlug = formData.slug.trim() || generateSlug(formData.name);
    const payload = {
      name: formData.name,
      description: formData.description,
      slug: finalSlug,
    };

    try {
      if (editingId) {
        await axios.put(`http://localhost:9999/topics/${editingId}`, payload);
      } else {
        await axios.post("http://localhost:9999/topics", payload);
      }
      setShowModal(false);
      fetchTopics();
    } catch (err) {
      console.error("Failed to save topic:", err);
      alert(err.response?.data?.message || "Failed to save topic");
    }
  };

  if (loading) return <p className="text-center mt-5">Loading topics...</p>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold m-0 text-primary">
          <FaBookOpen className="me-2" /> Topic Management
        </h4>
        <Button
          style={{
            borderRadius: "20px",
            background: "linear-gradient(135deg, #f97316, #eab308)",
            border: "none",
            fontWeight: "bold",
          }}
          className="shadow-sm"
          onClick={() => handleShow()}
        >
          + Add Topic
        </Button>
      </div>

      <Table striped bordered hover responsive className="bg-white shadow-sm rounded">
        <thead className="table-light">
          <tr>
            <th style={{ width: "60px" }}>#</th>
            <th>Name</th>
            <th>Description</th>
            <th>Slug</th>
            <th style={{ width: "160px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {topics.map((topic, idx) => (
            <tr key={topic._id}>
              <td>{idx + 1}</td>
              <td className="fw-bold">{topic.name}</td>
              <td className="text-muted small">{topic.description || "No description"}</td>
              <td>
                <code className="bg-light px-2 py-1 rounded text-warning small">{topic.slug}</code>
              </td>
              <td>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="me-2"
                  onClick={() => handleShow(topic)}
                >
                  <FaEdit className="me-1" /> Edit
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDelete(topic._id)}
                >
                  <FaTrash className="me-1" /> Delete
                </Button>
              </td>
            </tr>
          ))}
          {topics.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center text-muted p-4">
                No topics found. Click "+ Add Topic" to create one!
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">
            {editingId ? "Edit Topic" : "Create New Topic"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Topic Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Science & Space"
                value={formData.name}
                onChange={handleNameChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Slug (URL identifier)</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. science-space"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
              <Form.Text className="text-muted">
                Leave blank to auto-generate based on topic name.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Describe this topic..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" className="me-2" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button
                style={{
                  background: "linear-gradient(135deg, #f97316, #eab308)",
                  border: "none",
                  fontWeight: "bold",
                }}
                type="submit"
              >
                Save Changes
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TopicManagement;
