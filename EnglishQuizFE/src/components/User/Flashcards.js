import React, { useEffect, useState, useCallback } from "react";
import { Card, Button, Form, Modal, Row, Col, Badge, ButtonGroup, Alert } from "react-bootstrap";
import { FaPlus, FaUndo, FaCheck, FaTimes, FaVolumeUp, FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";

const Flashcards = () => {
  const [cards, setCards] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [message, setMessage] = useState(null);

  // Form states
  const [word, setWord] = useState("");
  const [definition, setDefinition] = useState("");
  const [example, setExample] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [cardTopic, setCardTopic] = useState("");
  const [cardType, setCardType] = useState("vocabulary");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const userId = localStorage.getItem("id");

  const fetchCards = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      let url = `http://localhost:9999/flashcards/user/${userId}`;
      const qs = [];
      if (selectedTopic) qs.push(`topic=${selectedTopic}`);
      if (selectedType) qs.push(`type=${selectedType}`);
      if (qs.length) url += `?${qs.join("&")}`;
      const res = await axios.get(url);
      setCards(res.data);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId, selectedTopic, selectedType]);

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const fetchTopics = async () => {
    try {
      const res = await axios.get("http://localhost:9999/topics");
      setTopics(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!word.trim() || !definition.trim()) {
      alert("Please enter word and definition");
      return;
    }
    try {
      const payload = {
        userId,
        word,
        definition,
        example,
        pronunciation,
        topic: cardTopic || undefined,
        type: cardType || "vocabulary"
      };
      if (isEditing && editingId) {
        await axios.put(`http://localhost:9999/flashcards/${editingId}`, payload);
      } else {
        await axios.post("http://localhost:9999/flashcards", payload);
      }
      setShowModal(false);
      // Reset form
      setWord("");
      setDefinition("");
      setExample("");
      setPronunciation("");
      setCardTopic("");
      setCardType("vocabulary");
      setIsEditing(false);
      setEditingId(null);
      fetchCards();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (card) => {
    setIsEditing(true);
    setEditingId(card._id);
    setWord(card.word || "");
    setDefinition(card.definition || "");
    setExample(card.example || "");
    setPronunciation(card.pronunciation || "");
    setCardTopic(card.topic?._id || "");
    setCardType(card.type || "vocabulary");
    setShowModal(true);
  };

  const handleDelete = async (cardId) => {
    if (!window.confirm("Are you sure you want to delete this flashcard?")) return;
    try {
      await axios.delete(`http://localhost:9999/flashcards/${cardId}`);
      fetchCards();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReview = async (isCorrect) => {
    if (cards.length === 0) return;
    const card = cards[currentIndex];
    try {
      const res = await axios.post(`http://localhost:9999/flashcards/${card._id}/review`, { isCorrect });

      // Update local card list
      const updatedCards = [...cards];
      updatedCards[currentIndex] = res.data;
      setCards(updatedCards);

      // Display review result alert briefly
      setMessage({
        type: isCorrect ? "success" : "danger",
        text: isCorrect ? "Correct! Spaced repetition review scheduled later." : "Incorrect! Reset to Box 1 for review tomorrow."
      });
      setTimeout(() => setMessage(null), 2500);

      // Go to next card if available
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
      } else {
        // Wrap around or show finished message
        setMessage({ type: "info", text: "Finished all cards in this list! Starting over..." });
        setTimeout(() => setMessage(null), 3000);
        setCurrentIndex(0);
        setIsFlipped(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTTS = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  if (loading) return <p className="text-center mt-5">Loading flashcards...</p>;

  const activeCard = cards[currentIndex];
  const dueCards = cards.filter(c => new Date(c.nextReviewDate) <= new Date());

  return (
    <div className="w-100 p-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="m-0 fw-bold text-dark">{selectedType ? (selectedType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) + ' Flashcards') : 'Vocabulary Flashcards'}</h4>
          <p className="text-muted m-0 small">Master English using Spaced Repetition (Leitner System)</p>
        </div>
        <Button variant="warning" className="text-dark fw-bold" style={{ borderRadius: "20px" }} onClick={() => setShowModal(true)}>
          <FaPlus className="me-1" /> Add Flashcard
        </Button>
      </div>

      {/* STATS & FILTER */}
      <Row className="mb-4 align-items-center">
        <Col md={6} className="d-flex gap-3">
          <Badge bg="primary" style={{ padding: "8px 12px", borderRadius: "8px" }}>Total Words: {cards.length}</Badge>
          <Badge bg="danger" style={{ padding: "8px 12px", borderRadius: "8px" }}>Due Review: {dueCards.length}</Badge>
        </Col>
        <Col md={6}>
          <Form.Group className="d-flex justify-content-end align-items-center">
            <Form.Label className="me-2 mb-0 fw-semibold text-secondary">Topic Filter:</Form.Label>
            <Form.Select
              style={{ width: "200px", borderRadius: "8px" }}
              value={selectedTopic}
              onChange={e => setSelectedTopic(e.target.value)}
            >
              <option value="">All Topics</option>
              {topics.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col className="d-flex justify-content-end">
          <Form.Label className="me-2 mb-0 fw-semibold text-secondary">Category:</Form.Label>
          <Form.Select style={{ width: "200px", borderRadius: "8px" }} value={selectedType} onChange={e => setSelectedType(e.target.value)}>
            <option value="">All</option>
            <option value="vocabulary">Vocabulary</option>
            <option value="grammar">Grammar</option>
            <option value="common_mistake">Common Mistake</option>
            <option value="collocation">Collocation</option>
            <option value="idiom">Idiom</option>
            <option value="collection">Collection</option>
          </Form.Select>
        </Col>
      </Row>

      {message && <Alert variant={message.type} className="text-center">{message.text}</Alert>}

      {/* FLASHCARD RENDER */}
      {cards.length === 0 ? (
        <div className="text-center text-muted p-5 bg-white rounded shadow-sm border">
          <h5>No flashcards found!</h5>
          <p>Click "+ Add Word" to create your first vocabulary card.</p>
        </div>
      ) : (
        <div className="d-flex flex-column align-items-center">
          {/* Main Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            style={{
              width: "100%",
              maxWidth: "500px",
              height: "300px",
              perspective: "1000px",
              cursor: "pointer",
              marginBottom: "20px"
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                transition: "transform 0.6s",
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "none",
              }}
            >
              {/* FRONT VIEW */}
              <Card
                className="shadow-lg p-4 d-flex flex-column justify-content-between text-center border-warning"
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  backfaceVisibility: "hidden",
                  borderRadius: "20px",
                  background: "linear-gradient(135deg, #ffffff, #fffbeb)"
                }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <Badge bg="info">{activeCard.topic?.name || "General"}</Badge>
                  <Badge bg="secondary">Box {activeCard.box || 1} / 5</Badge>
                </div>
                <div>
                  <h1 className="fw-bold text-warning mb-2">{activeCard.word}</h1>
                  {activeCard.pronunciation && (
                    <div className="d-flex justify-content-center align-items-center text-muted fs-5">
                      <span>{activeCard.pronunciation}</span>
                      <Button
                        variant="link"
                        className="text-warning p-0 ms-2"
                        onClick={(e) => { e.stopPropagation(); handleTTS(activeCard.word); }}
                      >
                        <FaVolumeUp size={18} />
                      </Button>
                    </div>
                  )}
                  {activeCard.example && (
                    <p className="mt-3 text-secondary italic">" {activeCard.example} "</p>
                  )}
                </div>
                <div className="text-muted small">Click to flip & show definition</div>
              </Card>

              {/* BACK VIEW */}
              <Card
                className="shadow-lg p-4 d-flex flex-column justify-content-between text-center border-primary"
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  borderRadius: "20px",
                  background: "linear-gradient(135deg, #eff6ff, #ffffff)"
                }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <Badge bg="primary">Definition</Badge>
                  <Badge bg="warning" text="dark">Review Due: {new Date(activeCard.nextReviewDate).toLocaleDateString()}</Badge>
                </div>
                <div>
                  <h3 className="fw-semibold text-primary mb-3">{activeCard.definition}</h3>
                </div>
                <div className="text-muted small">Click to flip back</div>
              </Card>
            </div>
          </div>

          {/* CONTROL BUTTONS */}
          <div className="d-flex gap-3 mb-4 w-100 justify-content-center" style={{ maxWidth: "500px" }}>
            <Button variant="outline-danger" className="w-50 py-2 fw-semibold" onClick={() => handleReview(false)}>
              <FaTimes className="me-1" /> Incorrect (Box 1)
            </Button>
            <Button variant="success" className="w-50 py-2 fw-semibold" onClick={() => handleReview(true)}>
              <FaCheck className="me-1" /> Correct (Box +1)
            </Button>
          </div>

          {/* PROGRESS */}
          <div className="text-muted small">
            Card {currentIndex + 1} of {cards.length}
          </div>
          <ButtonGroup size="sm" className="mt-2">
            <Button variant="outline-secondary" disabled={currentIndex === 0} onClick={() => { setCurrentIndex(currentIndex - 1); setIsFlipped(false); }}>Prev</Button>
            <Button variant="outline-secondary" onClick={() => setIsFlipped(!isFlipped)}><FaUndo className="me-1" /> Flip</Button>
            <Button variant="outline-secondary" disabled={currentIndex === cards.length - 1} onClick={() => { setCurrentIndex(currentIndex + 1); setIsFlipped(false); }}>Next</Button>
          </ButtonGroup>
          <div className="d-flex gap-2 mt-2">
            <Button variant="outline-primary" size="sm" onClick={() => handleEditClick(activeCard)}><FaEdit /> Edit</Button>
            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(activeCard._id)}><FaTrash /> Delete</Button>
          </div>
        </div>
      )}

      {/* CREATE CARD MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Create New Flashcard</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreate}>
            <Form.Group className="mb-3">
              <Form.Label>Word / Phrase</Form.Label>
              <Form.Control type="text" placeholder="e.g. Biodiversity" value={word} onChange={e => setWord(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Definition / Translation</Form.Label>
              <Form.Control as="textarea" rows={2} placeholder="e.g. Sự đa dạng sinh học" value={definition} onChange={e => setDefinition(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Pronunciation (Optional)</Form.Label>
              <Form.Control type="text" placeholder="e.g. /ˌbaɪoʊdaɪˈvɜːrsəti/" value={pronunciation} onChange={e => setPronunciation(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Example Sentence (Optional)</Form.Label>
              <Form.Control as="textarea" rows={2} placeholder="e.g. The Amazon rainforest contains rich biodiversity." value={example} onChange={e => setExample(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Topic</Form.Label>
              <Form.Select value={cardTopic} onChange={e => setCardTopic(e.target.value)}>
                <option value="">Select Topic (Optional)</option>
                {topics.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Category / Type</Form.Label>
              <Form.Select value={cardType} onChange={e => setCardType(e.target.value)}>
                <option value="vocabulary">Vocabulary</option>
                <option value="grammar">Grammar</option>
                <option value="common_mistake">Common Mistake</option>
                <option value="collocation">Collocation</option>
                <option value="idiom">Idiom</option>
                <option value="collection">Collection</option>
              </Form.Select>
            </Form.Group>
            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" className="me-2" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="warning" className="text-dark fw-bold" type="submit">Create Card</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Flashcards;
