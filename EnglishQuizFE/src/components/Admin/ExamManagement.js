import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Badge, Row, Col, InputGroup, Card } from "react-bootstrap";
import { FaSearch, FaListUl, FaRandom, FaRegCheckSquare } from "react-icons/fa";
import axios from "axios";

const ExamManagement = () => {
  const [exams, setExams] = useState([]);
  const [questionsList, setQuestionsList] = useState([]);
  const [topicsList, setTopicsList] = useState([]);
  const [skillsList, setSkillsList] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: "",
    duration: 30,
    type: "quiz",
    level: "Mixed",
    topic: "",
    selectedQuestions: [],
    totalCount: 10,
    mixedCounts: { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 },
    selectionMode: "auto", // "auto" or "manual"
  });

  const [manualFilters, setManualFilters] = useState({
    search: "",
    topicId: "All",
    skillId: "All",
    level: "All",
  });

  useEffect(() => {
    fetchExams();
    fetchQuestions();
    fetchTopics();
    fetchSkills();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await axios.get("http://localhost:9999/exams");
      setExams(res.data);
    } catch (err) {
      console.error("Failed to load exams:", err);
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await axios.get("http://localhost:9999/questions");
      setQuestionsList(res.data);
    } catch (err) {
      console.error("Failed to load questions:", err);
    }
  };

  const fetchTopics = async () => {
    try {
      const res = await axios.get("http://localhost:9999/topics");
      setTopicsList(res.data);
    } catch (err) {
      console.error("Failed to load topics:", err);
    }
  };

  const fetchSkills = async () => {
    try {
      const res = await axios.get("http://localhost:9999/skills");
      setSkillsList(res.data);
    } catch (err) {
      console.error("Failed to load skills:", err);
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
        topic: exam.topic?._id || exam.topic || "",
        selectedQuestions: exam.questions ? exam.questions.map(q => typeof q === 'object' ? q._id : q) : [],
        totalCount: exam.questions ? exam.questions.length : 10,
        mixedCounts: { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 },
        selectionMode: exam.questions && exam.questions.length > 0 ? "manual" : "auto",
      });
    } else {
      setEditingId(null);
      setFormData({ 
        title: "", duration: 30, type: "quiz", level: "Mixed", topic: "", selectedQuestions: [],
        totalCount: 10, mixedCounts: { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 },
        selectionMode: "auto",
      });
    }
    // Reset selection filters
    setManualFilters({
      search: "",
      topicId: "All",
      skillId: "All",
      level: "All",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this exam completely?")) {
      try {
        await axios.delete(`http://localhost:9999/exams/${id}`);
        fetchExams();
      } catch (err) {
        console.error("Delete exam error:", err);
      }
    }
  };

  const handleToggleQuestion = (id) => {
    const isSelected = formData.selectedQuestions.includes(id);
    if (isSelected) {
      setFormData(prev => ({
        ...prev,
        selectedQuestions: prev.selectedQuestions.filter(qid => qid !== id)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        selectedQuestions: [...prev.selectedQuestions, id]
      }));
    }
  };

  const handleSelectFilteredAll = () => {
    const currentFilteredIds = filteredQuestionsForSelection.map(q => q._id);
    const allSelected = currentFilteredIds.every(id => formData.selectedQuestions.includes(id));
    
    if (allSelected) {
      // Uncheck all in current filtered view
      setFormData(prev => ({
        ...prev,
        selectedQuestions: prev.selectedQuestions.filter(id => !currentFilteredIds.includes(id))
      }));
    } else {
      // Check all in current filtered view (avoiding duplicates)
      setFormData(prev => {
        const union = Array.from(new Set([...prev.selectedQuestions, ...currentFilteredIds]));
        return { ...prev, selectedQuestions: union };
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let finalQuestions = [];

    if (formData.selectionMode === "auto") {
      // Filter the question bank pool by topic if the exam specifies a topic
      let pool = [...questionsList];
      if (formData.topic) {
        pool = pool.filter(q => {
          const qTopicId = q.topic?._id || q.topic;
          return qTopicId === formData.topic;
        });
      }

      const qsByLevel = { A1: [], A2: [], B1: [], B2: [], C1: [], C2: [] };
      pool.forEach(q => {
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

      finalQuestions = selected.length > 0 ? selected : formData.selectedQuestions;
    } else {
      // Manual mode
      if (formData.selectedQuestions.length === 0) {
        alert("Please select at least 1 question manually for this exam!");
        return;
      }
      finalQuestions = formData.selectedQuestions;
    }

    const payload = {
      title: formData.title,
      duration: formData.duration,
      type: formData.type,
      level: formData.level,
      topic: formData.topic || null,
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
      console.error("Save exam error:", err);
    }
  };

  // --- FILTER QUESTIONS IN MANUAL CHECKLIST ---
  const filteredQuestionsForSelection = questionsList.filter((q) => {
    // Search filter
    if (manualFilters.search && !q.content?.toLowerCase().includes(manualFilters.search.toLowerCase())) {
      return false;
    }
    // Topic filter
    if (manualFilters.topicId !== "All") {
      const qTopicId = q.topic?._id || q.topic;
      if (qTopicId !== manualFilters.topicId) return false;
    }
    // Skill filter
    if (manualFilters.skillId !== "All") {
      const qSkillId = q.skill?._id || q.skill;
      if (qSkillId !== manualFilters.skillId) return false;
    }
    // Level filter
    if (manualFilters.level !== "All" && q.level !== manualFilters.level) {
      return false;
    }
    return true;
  });

  const allFilteredSelected = filteredQuestionsForSelection.length > 0 && 
    filteredQuestionsForSelection.map(q => q._id).every(id => formData.selectedQuestions.includes(id));

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold text-dark m-0">📝 Exam & Tests Management</h4>
        <Button variant="success" onClick={() => handleShow()} className="rounded-pill px-4 fw-bold shadow-sm">+ Create Exam</Button>
      </div>

      <Table striped bordered hover responsive className="bg-white shadow-sm align-middle">
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>Exam Title</th>
            <th>Type</th>
            <th>Topic</th>
            <th>Level</th>
            <th>Duration</th>
            <th>Questions</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {exams.map((exam, idx) => (
            <tr key={exam._id}>
              <td>{idx + 1}</td>
              <td className="fw-bold text-dark">{exam.title}</td>
              <td>
                <Badge bg={exam.type === 'practice' ? 'info' : exam.type === 'minitest' ? 'success' : 'warning'} className="px-3 py-1">
                  {exam.type?.toUpperCase()}
                </Badge>
              </td>
              <td>
                <Badge bg="secondary" className="bg-opacity-10 text-secondary border px-2 py-1">
                  {exam.topic?.name || "General"}
                </Badge>
              </td>
              <td>
                <Badge bg="secondary" className="px-2 py-1">{exam.level}</Badge>
              </td>
              <td className="text-muted font-monospace">{exam.duration} mins</td>
              <td className="fw-bold text-center">{exam.questions?.length || 0}</td>
              <td>
                <Button variant="outline-primary" size="sm" className="me-2 rounded-pill px-3" onClick={() => handleShow(exam)}>Edit</Button>
                <Button variant="outline-danger" size="sm" className="rounded-pill px-3" onClick={() => handleDelete(exam._id)}>Delete</Button>
              </td>
            </tr>
          ))}
          {exams.length === 0 && (
            <tr><td colSpan="8" className="text-center text-muted py-4">No exams found. Click '+ Create Exam' above to begin!</td></tr>
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" scrollable>
        <Modal.Header closeButton style={{ background: "linear-gradient(135deg, #f97316, #eab308)", color: "white" }}>
          <Modal.Title className="fw-bold">{editingId ? "Edit Exam Settings" : "Create New Exam"}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-light">
          <Form onSubmit={handleSubmit}>
            <Row>
              {/* LEFT COLUMN - METADATA */}
              <Col lg={5} className="mb-4">
                <Card className="border-0 shadow-sm p-4 h-100" style={{ borderRadius: "15px" }}>
                  <h5 className="fw-bold text-primary mb-3">⚙️ Exam Settings</h5>
                  
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-secondary">Exam Title</Form.Label>
                    <Form.Control 
                      type="text" 
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})} 
                      placeholder="e.g., Midterm Vocabulary Quiz" 
                      required 
                      className="rounded-pill shadow-sm"
                    />
                  </Form.Group>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold text-secondary">Duration (Minutes)</Form.Label>
                        <Form.Control 
                          type="number" 
                          min="1" 
                          value={formData.duration} 
                          onChange={e => setFormData({...formData, duration: parseInt(e.target.value) || 30})} 
                          required 
                          className="rounded-pill shadow-sm font-monospace"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold text-secondary">Test Type</Form.Label>
                        <Form.Select 
                          value={formData.type} 
                          onChange={e => setFormData({...formData, type: e.target.value})}
                          className="rounded-pill shadow-sm"
                        >
                          <option value="quiz">QUIZ</option>
                          <option value="practice">PRACTICE</option>
                          <option value="minitest">MINI TEST</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-secondary">Topic Category</Form.Label>
                    <Form.Select 
                      value={formData.topic} 
                      onChange={e => setFormData({...formData, topic: e.target.value})}
                      className="rounded-pill shadow-sm"
                    >
                      <option value="">General (No specific Topic)</option>
                      {topicsList.map(t => (
                        <option key={t._id} value={t._id}>{t.name}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-secondary">Difficulty Level Target</Form.Label>
                    <Form.Select 
                      value={formData.level} 
                      onChange={e => setFormData({...formData, level: e.target.value})}
                      className="rounded-pill shadow-sm"
                    >
                      <option value="Mixed">Mixed Levels</option>
                      <option value="A1">Level A1</option>
                      <option value="A2">Level A2</option>
                      <option value="B1">Level B1</option>
                      <option value="B2">Level B2</option>
                      <option value="C1">Level C1</option>
                      <option value="C2">Level C2</option>
                    </Form.Select>
                  </Form.Group>
                  
                  <div className="mt-auto">
                    <AlertSettingsBadge count={formData.selectedQuestions.length} />
                  </div>
                </Card>
              </Col>

              {/* RIGHT COLUMN - QUESTION SELECTION */}
              <Col lg={7} className="mb-4">
                <Card className="border-0 shadow-sm p-4 h-100" style={{ borderRadius: "15px" }}>
                  <h5 className="fw-bold text-dark mb-3">❓ Question Selection</h5>
                  
                  {/* MODE SELECTOR */}
                  <div className="d-flex mb-4 gap-2 bg-light p-2 rounded-pill" style={{ border: "1px solid #e2e8f0" }}>
                    <Button 
                      variant={formData.selectionMode === "auto" ? "primary" : "light"}
                      className="flex-grow-1 rounded-pill fw-bold border-0 shadow-sm d-flex align-items-center justify-content-center gap-2"
                      onClick={() => setFormData({ ...formData, selectionMode: "auto" })}
                    >
                      <FaRandom /> Auto Generate
                    </Button>
                    <Button 
                      variant={formData.selectionMode === "manual" ? "primary" : "light"}
                      className="flex-grow-1 rounded-pill fw-bold border-0 shadow-sm d-flex align-items-center justify-content-center gap-2"
                      onClick={() => setFormData({ ...formData, selectionMode: "manual" })}
                    >
                      <FaListUl /> Select Manually
                    </Button>
                  </div>

                  {/* AUTO GENERATE MODULE */}
                  {formData.selectionMode === "auto" ? (
                    <div className="p-3 rounded-4" style={{ backgroundColor: "#f8fafc", border: "1px solid #f1f5f9" }}>
                      <h6 className="fw-bold text-primary mb-2">🎲 Auto Generation Configuration</h6>
                      <p className="text-muted small mb-4">
                        Specify details below. The system will randomly pick matching questions from the bank.
                        {formData.topic && (
                          <span className="d-block text-success fw-bold mt-1">
                            ✓ Selection is filtered to include only topic: {topicsList.find(t => t._id === formData.topic)?.name}
                          </span>
                        )}
                      </p>
                      
                      {formData.level === "Mixed" ? (
                        <div>
                          <label className="fw-semibold text-secondary small mb-2">Configure Level Quantities:</label>
                          <Row className="g-3">
                            {["A1", "A2", "B1", "B2", "C1", "C2"].map(lvl => (
                               <Col xs={4} key={lvl}>
                                 <Form.Group className="bg-white p-2 rounded-3 shadow-sm border border-light-subtle text-center">
                                   <Form.Label className="small fw-bold text-muted mb-1">{lvl}</Form.Label>
                                   <Form.Control 
                                     type="number" 
                                     min="0" 
                                     value={formData.mixedCounts[lvl]}
                                     onChange={(e) => setFormData({...formData, mixedCounts: {...formData.mixedCounts, [lvl]: parseInt(e.target.value) || 0}})}
                                     className="text-center font-monospace border-0 fw-bold"
                                     style={{ fontSize: "15px" }}
                                   />
                                 </Form.Group>
                               </Col>
                            ))}
                          </Row>
                          <div className="mt-4 p-3 bg-primary bg-opacity-10 rounded-pill text-center fw-bold text-primary shadow-sm" style={{ fontSize: "14px" }}>
                            Total Scheduled Questions: {Object.values(formData.mixedCounts).reduce((a,b)=>a+b, 0)}
                          </div>
                        </div>
                      ) : (
                        <Form.Group className="bg-white p-3 rounded-3 shadow-sm border border-light-subtle">
                          <Form.Label className="fw-semibold text-secondary">Number of random questions for Level {formData.level}</Form.Label>
                          <Form.Control 
                            type="number" 
                            min="1" 
                            value={formData.totalCount}
                            onChange={(e) => setFormData({...formData, totalCount: parseInt(e.target.value) || 0})}
                            className="font-monospace fw-bold"
                            style={{ fontSize: "16px" }}
                          />
                        </Form.Group>
                      )}

                      {editingId && (
                         <div className="mt-3 alert alert-warning small border-0 p-3 rounded-3 shadow-sm">
                            <strong>Notice:</strong> If counts are left as <strong>0</strong>, the exam's existing {formData.selectedQuestions.length} questions are preserved. Modifying values will generate a new set of questions.
                         </div>
                      )}
                    </div>
                  ) : (
                    /* MANUAL SELECT MODULE */
                    <div>
                      {/* FILTER PANEL */}
                      <Card className="border-0 bg-light p-3 mb-3" style={{ borderRadius: "12px" }}>
                        <Row className="g-2">
                          <Col md={12}>
                            <InputGroup size="sm">
                              <InputGroup.Text className="bg-white border-end-0 border-light-subtle"><FaSearch className="text-muted" /></InputGroup.Text>
                              <Form.Control
                                placeholder="Search by question text content..."
                                value={manualFilters.search}
                                onChange={e => setManualFilters({...manualFilters, search: e.target.value})}
                                className="border-start-0 border-light-subtle rounded-end-pill shadow-none"
                              />
                            </InputGroup>
                          </Col>
                          <Col md={4} xs={6}>
                            <Form.Select 
                              size="sm"
                              value={manualFilters.topicId}
                              onChange={e => setManualFilters({...manualFilters, topicId: e.target.value})}
                              className="rounded-pill shadow-none"
                            >
                              <option value="All">All Topics</option>
                              {topicsList.map(t => (
                                <option key={t._id} value={t._id}>{t.name}</option>
                              ))}
                            </Form.Select>
                          </Col>
                          <Col md={4} xs={6}>
                            <Form.Select 
                              size="sm"
                              value={manualFilters.skillId}
                              onChange={e => setManualFilters({...manualFilters, skillId: e.target.value})}
                              className="rounded-pill shadow-none"
                            >
                              <option value="All">All Skills</option>
                              {skillsList.map(s => (
                                <option key={s._id} value={s._id}>{s.name}</option>
                              ))}
                            </Form.Select>
                          </Col>
                          <Col md={4} xs={12}>
                            <Form.Select 
                              size="sm"
                              value={manualFilters.level}
                              onChange={e => setManualFilters({...manualFilters, level: e.target.value})}
                              className="rounded-pill shadow-none"
                            >
                              <option value="All">All Levels</option>
                              <option value="A1">A1</option>
                              <option value="A2">A2</option>
                              <option value="B1">B1</option>
                              <option value="B2">B2</option>
                              <option value="C1">C1</option>
                              <option value="C2">C2</option>
                            </Form.Select>
                          </Col>
                        </Row>
                      </Card>

                      <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                        <small className="text-secondary fw-semibold">
                          Showing {filteredQuestionsForSelection.length} matching questions
                        </small>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="text-decoration-none fw-bold p-0" 
                          onClick={handleSelectFilteredAll}
                          disabled={filteredQuestionsForSelection.length === 0}
                        >
                          {allFilteredSelected ? "Uncheck All Filtered" : "Check All Filtered"}
                        </Button>
                      </div>

                      {/* SCROLLABLE LIST */}
                      <div 
                        style={{ 
                          height: "300px", 
                          overflowY: "auto", 
                          border: "1px solid #e2e8f0", 
                          borderRadius: "12px", 
                          backgroundColor: "#ffffff",
                          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)"
                        }}
                      >
                        {filteredQuestionsForSelection.map((q) => {
                          const isChecked = formData.selectedQuestions.includes(q._id);
                          const topicName = q.topic?.name || topicsList.find(t => t._id === q.topic)?.name || "";
                          const skillName = q.skill?.name || skillsList.find(s => s._id === q.skill)?.name || "";
                          return (
                            <div 
                              key={q._id} 
                              className="d-flex align-items-start gap-3 p-3 border-bottom hover-bg" 
                              style={{ 
                                cursor: "pointer",
                                transition: "background-color 0.15s",
                                backgroundColor: isChecked ? "#f8fafc" : "transparent"
                              }} 
                              onClick={() => handleToggleQuestion(q._id)}
                            >
                              <Form.Check 
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}} 
                                className="mt-1 flex-shrink-0"
                              />
                              <div className="flex-grow-1">
                                <div className="fw-semibold text-dark" style={{ fontSize: "13.5px", lineHeight: "1.5" }}>
                                  {q.content}
                                </div>
                                <div className="d-flex gap-2 mt-2 flex-wrap">
                                  <Badge bg="secondary" style={{ fontSize: "9px" }}>{q.level}</Badge>
                                  {topicName && <Badge bg="info" style={{ fontSize: "9px" }} className="text-dark">{topicName}</Badge>}
                                  {skillName && <Badge bg="success" style={{ fontSize: "9px" }}>{skillName}</Badge>}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {filteredQuestionsForSelection.length === 0 && (
                          <div className="text-center text-muted py-5 small">
                            No questions match the selected search filters.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-4 pt-3 border-top">
              <Button variant="secondary" className="me-2 rounded-pill px-4" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="success" type="submit" className="rounded-pill px-4 fw-bold">Save Exam</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

const AlertSettingsBadge = ({ count }) => (
  <div className="alert alert-info py-2 d-flex align-items-center gap-2 rounded-3 border-0 shadow-sm m-0">
    <FaRegCheckSquare className="text-info" />
    <span className="small font-monospace"><strong>{count}</strong> questions selected for this exam.</span>
  </div>
);

export default ExamManagement;
