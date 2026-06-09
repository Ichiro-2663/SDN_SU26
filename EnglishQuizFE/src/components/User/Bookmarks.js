import React, { useEffect, useState } from "react";
import { Card, Tabs, Tab, Button, Badge, Accordion, ListGroup } from "react-bootstrap";
import { FaTrash, FaPlay, FaBookmark, FaLightbulb } from "react-icons/fa";
import axios from "axios";

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("id");

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:9999/bookmarks/user/${userId}`);
      setBookmarks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Remove this bookmark?")) {
      try {
        await axios.delete(`http://localhost:9999/bookmarks/${id}`);
        setBookmarks(bookmarks.filter(b => b._id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) return <p className="text-center mt-5">Loading bookmarks...</p>;

  const questionBookmarks = bookmarks.filter(b => b.itemType === "Question" && b.itemId);
  const examBookmarks = bookmarks.filter(b => b.itemType === "Exam" && b.itemId);

  return (
    <div className="w-100 p-2">
      <div className="mb-4">
        <h4 className="fw-bold text-dark"><FaBookmark className="text-warning me-2" /> Bookmarked Items</h4>
        <p className="text-muted small">Access and review your bookmarked questions and exams anytime</p>
      </div>

      <Tabs defaultActiveKey="questions" id="bookmark-tabs" className="mb-4">
        {/* QUESTIONS TAB */}
        <Tab eventKey="questions" title={`Saved Questions (${questionBookmarks.length})`}>
          {questionBookmarks.length === 0 ? (
            <div className="text-center text-muted p-5 bg-white rounded shadow-sm border">
              <h5>No saved questions yet!</h5>
              <p>You can bookmark questions during your practices or quizzes.</p>
            </div>
          ) : (
            questionBookmarks.map((bookmark) => {
              const q = bookmark.itemId;
              return (
                <Card key={bookmark._id} className="mb-3 shadow-sm border-light">
                  <Card.Header className="d-flex justify-content-between align-items-center bg-white border-bottom-0 pt-3">
                    <div className="d-flex gap-2 flex-wrap">
                      <Badge bg="info">{q.topic?.name || "General"}</Badge>
                      <Badge bg="primary">{q.skill?.name || "Vocabulary"}</Badge>
                      {q.certificate && <Badge bg="success">{q.certificate.name}</Badge>}
                      <Badge bg="secondary" text="light">{q.level || "easy"}</Badge>
                      <Badge bg="warning" text="dark">{q.questionType}</Badge>
                    </div>
                    <Button variant="outline-danger" size="sm" style={{ borderRadius: "50%" }} onClick={() => handleDelete(bookmark._id)}>
                      <FaTrash size={12} />
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <h6 className="fw-semibold text-dark mb-3">{q.content}</h6>

                    {/* Rendering different option patterns depending on questionType */}
                    {q.questionType === "MultipleChoice" && q.options && (
                      <ListGroup variant="flush" className="mb-3">
                        {q.options.map((opt, idx) => (
                          <ListGroup.Item 
                            key={idx} 
                            className={`p-2 border-0 rounded mb-1 ${idx === q.correctAnswer ? 'bg-success bg-opacity-10 text-success fw-bold' : ''}`}
                          >
                            {idx + 1}. {opt} {idx === q.correctAnswer && <Badge bg="success" className="ms-2">Correct Answer</Badge>}
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    )}

                    {q.questionType === "TrueFalse" && (
                      <div className="mb-3">
                        Correct Answer: <Badge bg="success">{String(q.correctAnswer).toUpperCase()}</Badge>
                      </div>
                    )}

                    {q.questionType === "FillInBlank" && (
                      <div className="mb-3 bg-light p-2 rounded">
                        Correct Answer: <strong className="text-success">{q.correctAnswer}</strong>
                      </div>
                    )}

                    {q.questionType === "Matching" && q.matchingPairs && (
                      <div className="mb-3 p-3 bg-light rounded">
                        <strong className="d-block mb-2">Pairs:</strong>
                        <div className="d-flex flex-column gap-1">
                          {q.matchingPairs.map((pair, idx) => (
                            <div key={idx} className="small">
                              <Badge bg="secondary">{pair.left}</Badge> &harr; <Badge bg="success bg-opacity-70">{pair.right}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Explanation */}
                    {q.explanation && (
                      <Accordion className="border-0 shadow-none mt-3">
                        <Accordion.Item eventKey="0" className="border-0">
                          <Accordion.Header className="p-0 border-0">
                            <span className="text-warning fw-semibold d-flex align-items-center gap-1">
                              <FaLightbulb /> View Explanation
                            </span>
                          </Accordion.Header>
                          <Accordion.Body className="bg-light p-3 rounded mt-2 text-secondary small">
                            {q.explanation}
                          </Accordion.Body>
                        </Accordion.Item>
                      </Accordion>
                    )}

                    {bookmark.notes && (
                      <div className="mt-3 p-2 bg-warning bg-opacity-10 text-warning-emphasis border border-warning border-opacity-25 rounded small">
                        <strong>My Notes:</strong> {bookmark.notes}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              );
            })
          )}
        </Tab>

        {/* EXAMS TAB */}
        <Tab eventKey="exams" title={`Saved Exams (${examBookmarks.length})`}>
          {examBookmarks.length === 0 ? (
            <div className="text-center text-muted p-5 bg-white rounded shadow-sm border">
              <h5>No saved exams yet!</h5>
              <p>Bookmark practice sessions or quizzes from the exam listing dashboard.</p>
            </div>
          ) : (
            <div className="row">
              {examBookmarks.map((bookmark) => {
                const exam = bookmark.itemId;
                return (
                  <div key={bookmark._id} className="col-md-6 col-lg-4 mb-3">
                    <Card className="shadow-sm border-warning h-100">
                      <Card.Body className="d-flex flex-column justify-content-between">
                        <div>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="fw-bold text-dark m-0">{exam.title}</h6>
                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(bookmark._id)}>
                              <FaTrash size={12} />
                            </Button>
                          </div>
                          <div className="mb-3">
                            <Badge bg="info" className="me-1">{exam.level}</Badge>
                            <Badge bg="secondary">{exam.questions?.length || 0} Qs</Badge>
                            <span className="ms-2 text-muted small">{exam.duration} mins</span>
                          </div>
                          {bookmark.notes && (
                            <p className="bg-light p-2 rounded text-muted small mb-0 mt-2">
                              <strong>Notes:</strong> {bookmark.notes}
                            </p>
                          )}
                        </div>
                        <div className="mt-3">
                          <Button variant="warning" className="text-dark fw-bold w-100" style={{ borderRadius: "20px" }} onClick={() => alert("Please start this exam from the Practice or Take Quiz sidebar tab.")}>
                            <FaPlay size={12} className="me-1" /> View Exam
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}
        </Tab>
      </Tabs>
    </div>
  );
};

export default Bookmarks;
