import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Badge, Row, Col } from "react-bootstrap";
import axios from "axios";

const QuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [skills, setSkills] = useState([]);
  const [certificates, setCertificates] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    content: "",
    option1: "", option2: "", option3: "", option4: "",
    correctAnswer: "0",
    level: "easy",
    questionType: "MultipleChoice",
    topic: "",
    skill: "",
    certificate: "",
    pair1Left: "", pair1Right: "",
    pair2Left: "", pair2Right: "",
    pair3Left: "", pair3Right: "",
    passage: "",
    audioUrl: "",
    explanation: ""
  });

  const levels = ["easy", "medium", "hard"];
  const questionTypes = ["MultipleChoice", "FillInBlank", "TrueFalse", "Matching"];

  useEffect(() => {
    fetchQuestions();
    fetchMetadata();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get("http://localhost:9999/questions");
      setQuestions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [tRes, sRes, cRes] = await Promise.all([
        axios.get("http://localhost:9999/topics"),
        axios.get("http://localhost:9999/skills"),
        axios.get("http://localhost:9999/certificates")
      ]);
      setTopics(tRes.data);
      setSkills(sRes.data);
      setCertificates(cRes.data);
    } catch (err) {
      console.error("Metadata loading failed:", err);
    }
  };

  const handleShow = (q = null) => {
    if (q) {
      setEditingId(q._id);
      setFormData({
        content: q.content,
        option1: q.options?.[0] || "",
        option2: q.options?.[1] || "",
        option3: q.options?.[2] || "",
        option4: q.options?.[3] || "",
        correctAnswer: String(q.correctAnswer ?? "0"),
        level: q.level || "easy",
        questionType: q.questionType || "MultipleChoice",
        topic: q.topic?._id || q.topic || "",
        skill: q.skill?._id || q.skill || "",
        certificate: q.certificate?._id || q.certificate || "",
        pair1Left: q.matchingPairs?.[0]?.left || "",
        pair1Right: q.matchingPairs?.[0]?.right || "",
        pair2Left: q.matchingPairs?.[1]?.left || "",
        pair2Right: q.matchingPairs?.[1]?.right || "",
        pair3Left: q.matchingPairs?.[2]?.left || "",
        pair3Right: q.matchingPairs?.[2]?.right || "",
        passage: q.passage || "",
        audioUrl: q.audioUrl || "",
        explanation: q.explanation || ""
      });
    } else {
      setEditingId(null);
      setFormData({
        content: "",
        option1: "", option2: "", option3: "", option4: "",
        correctAnswer: "0",
        level: "easy",
        questionType: "MultipleChoice",
        topic: "",
        skill: "",
        certificate: "",
        pair1Left: "", pair1Right: "",
        pair2Left: "", pair2Right: "",
        pair3Left: "", pair3Right: "",
        passage: "",
        audioUrl: "",
        explanation: ""
      });
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await axios.delete(`http://localhost:9999/questions/${id}`);
        fetchQuestions();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Construct payload depending on questionType
    const payload = {
      content: formData.content,
      level: formData.level,
      questionType: formData.questionType,
      topic: formData.topic || undefined,
      skill: formData.skill || undefined,
      certificate: formData.certificate || undefined,
      passage: formData.passage || undefined,
      audioUrl: formData.audioUrl || undefined,
      explanation: formData.explanation || undefined
    };

    if (formData.questionType === "MultipleChoice") {
      payload.options = [formData.option1, formData.option2, formData.option3, formData.option4].filter(o => o.trim() !== "");
      payload.correctAnswer = parseInt(formData.correctAnswer);
    } else if (formData.questionType === "TrueFalse") {
      payload.correctAnswer = formData.correctAnswer === "true" ? "true" : "false";
    } else if (formData.questionType === "FillInBlank") {
      payload.correctAnswer = formData.correctAnswer.trim().toLowerCase();
    } else if (formData.questionType === "Matching") {
      const pairs = [];
      if (formData.pair1Left.trim()) pairs.push({ left: formData.pair1Left, right: formData.pair1Right });
      if (formData.pair2Left.trim()) pairs.push({ left: formData.pair2Left, right: formData.pair2Right });
      if (formData.pair3Left.trim()) pairs.push({ left: formData.pair3Left, right: formData.pair3Right });
      payload.matchingPairs = pairs;
      // options represent matching left side keys
      payload.options = pairs.map(p => p.left);
      payload.correctAnswer = pairs.map((_, i) => i); // correct mapping sequence: [0, 1, 2]
    }

    try {
      if (editingId) {
        await axios.put(`http://localhost:9999/questions/${editingId}`, payload);
      } else {
        await axios.post("http://localhost:9999/questions", payload);
      }
      setShowModal(false);
      fetchQuestions();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>📚 Question Bank Management</h4>
        <Button variant="primary" onClick={() => handleShow()}>+ Add Question</Button>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Type</th>
            <th>Content</th>
            <th>Metadata</th>
            <th>Level</th>
            <th>Correct Answer</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q, idx) => (
            <tr key={q._id}>
              <td>{idx + 1}</td>
              <td><Badge bg="secondary">{q.questionType || "MultipleChoice"}</Badge></td>
              <td style={{ maxWidth: '250px' }}>{q.content}</td>
              <td style={{ fontSize: '12px' }}>
                <div><strong>Topic:</strong> {q.topic?.name || "N/A"}</div>
                <div><strong>Skill:</strong> {q.skill?.name || "N/A"}</div>
                {q.certificate && <div><strong>Cert:</strong> {q.certificate.name}</div>}
              </td>
              <td><Badge bg={q.level === 'hard' ? 'danger' : q.level === 'medium' ? 'warning' : 'success'}>{q.level}</Badge></td>
              <td style={{ maxWidth: '150px', fontSize: '13px' }} className="text-success fw-bold">
                {q.questionType === "MultipleChoice" ? (q.options?.[q.correctAnswer] || `Index ${q.correctAnswer}`) : String(q.correctAnswer)}
              </td>
              <td style={{ minWidth: '150px'}}>
                <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShow(q)}>Edit</Button>
                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(q._id)}>Delete</Button>
              </td>
            </tr>
          ))}
          {questions.length === 0 && (
            <tr><td colSpan="7" className="text-center">No questions found</td></tr>
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? "Edit Question" : "Add New Question"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Question Type</Form.Label>
                  <Form.Select value={formData.questionType} onChange={e => setFormData({...formData, questionType: e.target.value})}>
                    {questionTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Level</Form.Label>
                  <Form.Select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})}>
                    {levels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Topic</Form.Label>
                  <Form.Select value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})}>
                    <option value="">No Topic</option>
                    {topics.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Skill</Form.Label>
                  <Form.Select value={formData.skill} onChange={e => setFormData({...formData, skill: e.target.value})}>
                    <option value="">No Skill</option>
                    {skills.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Certificate (Optional)</Form.Label>
                  <Form.Select value={formData.certificate} onChange={e => setFormData({...formData, certificate: e.target.value})}>
                    <option value="">None</option>
                    {certificates.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Question / Prompt Content</Form.Label>
              <Form.Control as="textarea" rows={3} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Reading Passage (Optional)</Form.Label>
              <Form.Control as="textarea" rows={2} placeholder="Passage context for reading comprehension" value={formData.passage} onChange={e => setFormData({...formData, passage: e.target.value})} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Audio URL / Trigger Link (Optional)</Form.Label>
              <Form.Control type="text" placeholder="e.g. listening-prompt.mp3" value={formData.audioUrl} onChange={e => setFormData({...formData, audioUrl: e.target.value})} />
            </Form.Group>

            {/* DYNAMIC FIELD RENDERING BY QUESTION TYPE */}
            {formData.questionType === "MultipleChoice" && (
              <>
                <h6 className="fw-bold text-primary mt-4 mb-3">Multiple Choice Options</h6>
                <Row>
                  <Col md={6}>
                     <Form.Group className="mb-3">
                       <Form.Label>Option 1</Form.Label>
                       <Form.Control type="text" value={formData.option1} onChange={e => setFormData({...formData, option1: e.target.value})} required />
                     </Form.Group>
                  </Col>
                  <Col md={6}>
                     <Form.Group className="mb-3">
                       <Form.Label>Option 2</Form.Label>
                       <Form.Control type="text" value={formData.option2} onChange={e => setFormData({...formData, option2: e.target.value})} required />
                     </Form.Group>
                  </Col>
                  <Col md={6}>
                     <Form.Group className="mb-3">
                       <Form.Label>Option 3</Form.Label>
                       <Form.Control type="text" value={formData.option3} onChange={e => setFormData({...formData, option3: e.target.value})} />
                     </Form.Group>
                  </Col>
                  <Col md={6}>
                     <Form.Group className="mb-3">
                       <Form.Label>Option 4</Form.Label>
                       <Form.Control type="text" value={formData.option4} onChange={e => setFormData({...formData, option4: e.target.value})} />
                     </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3" style={{ maxWidth: '300px' }}>
                  <Form.Label>Correct Option</Form.Label>
                  <Form.Select value={formData.correctAnswer} onChange={e => setFormData({...formData, correctAnswer: e.target.value})} required>
                    <option value="0">Option 1</option>
                    <option value="1">Option 2</option>
                    <option value="2">Option 3</option>
                    <option value="3">Option 4</option>
                  </Form.Select>
                </Form.Group>
              </>
            )}

            {formData.questionType === "TrueFalse" && (
              <Form.Group className="mb-3" style={{ maxWidth: '300px' }}>
                <Form.Label>Correct Answer</Form.Label>
                <Form.Select value={formData.correctAnswer} onChange={e => setFormData({...formData, correctAnswer: e.target.value})} required>
                  <option value="true">True</option>
                  <option value="false">False</option>
                </Form.Select>
              </Form.Group>
            )}

            {formData.questionType === "FillInBlank" && (
              <Form.Group className="mb-3">
                <Form.Label>Correct Answer (Exact word, lowercase)</Form.Label>
                <Form.Control type="text" placeholder="e.g. environment" value={formData.correctAnswer} onChange={e => setFormData({...formData, correctAnswer: e.target.value})} required />
              </Form.Group>
            )}

            {formData.questionType === "Matching" && (
              <>
                <h6 className="fw-bold text-primary mt-4 mb-3">Matching Connections</h6>
                <Row className="mb-2 align-items-center">
                  <Col md={5}>
                    <Form.Control type="text" placeholder="Left Item 1 (e.g. Cat)" value={formData.pair1Left} onChange={e => setFormData({...formData, pair1Left: e.target.value})} required />
                  </Col>
                  <Col md={1} className="text-center">&harr;</Col>
                  <Col md={6}>
                    <Form.Control type="text" placeholder="Right Description 1 (e.g. Con mèo)" value={formData.pair1Right} onChange={e => setFormData({...formData, pair1Right: e.target.value})} required />
                  </Col>
                </Row>
                <Row className="mb-2 align-items-center">
                  <Col md={5}>
                    <Form.Control type="text" placeholder="Left Item 2 (e.g. Dog)" value={formData.pair2Left} onChange={e => setFormData({...formData, pair2Left: e.target.value})} />
                  </Col>
                  <Col md={1} className="text-center">&harr;</Col>
                  <Col md={6}>
                    <Form.Control type="text" placeholder="Right Description 2 (e.g. Con chó)" value={formData.pair2Right} onChange={e => setFormData({...formData, pair2Right: e.target.value})} />
                  </Col>
                </Row>
                <Row className="mb-2 align-items-center">
                  <Col md={5}>
                    <Form.Control type="text" placeholder="Left Item 3 (e.g. Bird)" value={formData.pair3Left} onChange={e => setFormData({...formData, pair3Left: e.target.value})} />
                  </Col>
                  <Col md={1} className="text-center">&harr;</Col>
                  <Col md={6}>
                    <Form.Control type="text" placeholder="Right Description 3 (e.g. Con chim)" value={formData.pair3Right} onChange={e => setFormData({...formData, pair3Right: e.target.value})} />
                  </Col>
                </Row>
              </>
            )}

            <Form.Group className="mb-3 mt-4">
              <Form.Label>Explanation (Shown on results page)</Form.Label>
              <Form.Control as="textarea" rows={2} placeholder="Explain why the answer is correct" value={formData.explanation} onChange={e => setFormData({...formData, explanation: e.target.value})} />
            </Form.Group>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" className="me-2" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="primary" type="submit">Save Changes</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default QuestionBank;
