import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Badge, Row, Col } from "react-bootstrap";
import axios from "axios";

const ExamManagement = () => {
  const [exams, setExams] = useState([]);
  const [questionsList, setQuestionsList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: "",
    duration: 30,
    type: "quiz",
    level: "Mixed",
    selectedQuestions: [],
    totalCount: 10,
    mixedCounts: { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 }
  });

  useEffect(() => {
    fetchExams();
    fetchQuestions();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await axios.get("http://localhost:9999/exams");
      setExams(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await axios.get("http://localhost:9999/questions");
      setQuestionsList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShow = (exam = null) => {
    if (exam) {
      setEditingId(exam._id);
      setFormData({
        title: exam.title,
        duration: exam.duration,
        type: exam.type || "quiz",
        level: exam.level || "Mixed",
        selectedQuestions: exam.questions ? exam.questions.map(q => q._id) : [],
        totalCount: exam.questions ? exam.questions.length : 10,
        mixedCounts: { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 }
      });
    } else {
      setEditingId(null);
      setFormData({ 
        title: "", duration: 30, type: "quiz", level: "Mixed", selectedQuestions: [],
        totalCount: 10, mixedCounts: { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 }
      });
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this exam completely?")) {
      try {
        await axios.delete(`http://localhost:9999/exams/${id}`);
        fetchExams();
      } catch (err) {
        console.error(err);
      }
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    // Random Generation Logic
    const qsByLevel = { A1: [], A2: [], B1: [], B2: [], C1: [], C2: [] };
    questionsList.forEach(q => {
      if (qsByLevel[q.level]) qsByLevel[q.level].push(q._id);
    });

    let selected = [];
    let totalGenerated = 0;
    if (formData.level === "Mixed") {
      Object.keys(formData.mixedCounts).forEach(lvl => {
        const n = formData.mixedCounts[lvl];
        if (n > 0) {
          const shuffled = [...qsByLevel[lvl]].sort(() => Math.random() - 0.5);
          selected.push(...shuffled.slice(0, n));
          totalGenerated += n;
        }
      });
    } else {
      const lvl = formData.level;
      const n = formData.totalCount;
      if (n > 0) {
        const shuffled = [...qsByLevel[lvl]].sort(() => Math.random() - 0.5);
        selected.push(...shuffled.slice(0, n));
        totalGenerated += n;
      }
    }

    if (totalGenerated === 0 && !editingId) {
       alert("Please configure a number of questions greater than 0 to generate!");
       return;
    }

    let finalQuestions = selected.length > 0 ? selected : formData.selectedQuestions;

    const payload = {
      title: formData.title,
      duration: formData.duration,
      type: formData.type,
      level: formData.level,
      questions: finalQuestions
    };

    try {
      if (editingId) {
        await axios.put(`http://localhost:9999/exams/${editingId}`, payload);
      } else {
        await axios.post("http://localhost:9999/exams", payload);
      }
      setShowModal(false);
      fetchExams();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>📝 Exam Management</h4>
        <Button variant="success" onClick={() => handleShow()}>+ Create Exam</Button>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Exam Title</th>
            <th>Type</th>
            <th>Level</th>
            <th>Duration</th>
            <th>Total Questions</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {exams.map((exam, idx) => (
            <tr key={exam._id}>
              <td>{idx + 1}</td>
              <td className="fw-bold">{exam.title}</td>
              <td><Badge bg={exam.type === 'practice' ? 'info' : exam.type === 'minitest' ? 'success' : 'warning'} className="text-dark">{exam.type?.toUpperCase()}</Badge></td>
              <td><Badge bg="secondary">{exam.level}</Badge></td>
              <td>{exam.duration} mins</td>
              <td>{exam.questions?.length || 0}</td>
              <td>
                <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShow(exam)}>Edit</Button>
                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(exam._id)}>Delete</Button>
              </td>
            </tr>
          ))}
          {exams.length === 0 && (
            <tr><td colSpan="6" className="text-center">No exams found</td></tr>
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? "Edit Exam" : "Create New Exam"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={5}>
                <Form.Group className="mb-3">
                  <Form.Label>Exam Title</Form.Label>
                  <Form.Control type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Duration (Minutes)</Form.Label>
                  <Form.Control type="number" min="1" value={formData.duration} onChange={e => setFormData({...formData, duration: parseInt(e.target.value)})} required />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label>Type</Form.Label>
                  <Form.Select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="quiz">QUIZ</option>
                    <option value="practice">PRACTICE</option>
                    <option value="minitest">MINI TEST</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label>Difficulty Level</Form.Label>
                  <Form.Select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})}>
                    <option value="Mixed">Mixed</option>
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                    <option value="C2">C2</option>
                  </Form.Select>
                </Form.Group>
                
                <AlertSettingsBadge count={formData.selectedQuestions.length} />
              </Col>

              <Col md={7}>
                <div style={{ padding: '15px', borderRadius: '10px', backgroundColor: '#f1f5f9' }}>
                  <h6 className="fw-bold mb-3 text-primary">⚙️ Auto Generate Questions</h6>
                  <p className="text-muted small">
                    Specify the number of questions. The system will randomly pick them from the question bank.
                  </p>
                  
                  {formData.level === "Mixed" ? (
                    <div>
                      <label className="fw-bold mb-3">Number of Questions per Level:</label>
                      <Row>
                        {["A1", "A2", "B1", "B2", "C1", "C2"].map(lvl => (
                           <Col md={4} key={lvl}>
                             <Form.Group className="mb-3 bg-white p-2 rounded shadow-sm">
                               <Form.Label className="small fw-bold text-secondary mb-1">Level {lvl}</Form.Label>
                               <Form.Control 
                                 type="number" 
                                 min="0" 
                                 value={formData.mixedCounts[lvl]}
                                 onChange={(e) => setFormData({...formData, mixedCounts: {...formData.mixedCounts, [lvl]: parseInt(e.target.value) || 0}})}
                               />
                             </Form.Group>
                           </Col>
                        ))}
                      </Row>
                      <div className="mt-2 p-2 bg-info bg-opacity-10 rounded text-center fw-bold text-primary">
                        Total Questions Planned: {Object.values(formData.mixedCounts).reduce((a,b)=>a+b, 0)}
                      </div>
                    </div>
                  ) : (
                    <Form.Group className="mb-3 bg-white p-3 rounded shadow-sm">
                      <Form.Label className="fw-bold">Total Random Questions for Level {formData.level}</Form.Label>
                      <Form.Control 
                        type="number" 
                        min="0" 
                        value={formData.totalCount}
                        onChange={(e) => setFormData({...formData, totalCount: parseInt(e.target.value) || 0})}
                      />
                    </Form.Group>
                  )}

                  {editingId && (
                     <div className="mt-3 alert alert-warning small">
                        <strong>Edit Notice:</strong> If you leave these counts as <strong>0</strong>, the {formData.selectedQuestions.length} originally assigned questions will be kept. If you set counts {" > "} 0, saving will OVERWRITE the old questions with new random ones!
                     </div>
                  )}
                </div>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" className="me-2" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="success" type="submit">Save Exam</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

const AlertSettingsBadge = ({count}) => (
    <div className="alert alert-info py-2">
       <strong>{count}</strong> questions selected.
    </div>
);

export default ExamManagement;
