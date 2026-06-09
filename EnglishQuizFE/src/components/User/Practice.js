import React, { useState, useEffect, useContext } from "react";
import { Card, Row, Col, Button, Badge, ProgressBar, Form } from "react-bootstrap";
import { FaBookmark, FaRegBookmark, FaLightbulb, FaVolumeUp } from "react-icons/fa";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

const Practice = () => {
  const { user } = useContext(AuthContext);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  
  // Quiz states
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Bookmark status state
  const [bookmarkedList, setBookmarkedList] = useState({}); // Maps questionId -> bookmarkId

  const userId = user?._id || localStorage.getItem("id");

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:9999/exams");
        const practiceExams = res.data.filter(e => e.type === "practice");
        setExams(practiceExams);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserBookmarks = async () => {
      try {
        const res = await axios.get(`http://localhost:9999/bookmarks/user/${userId}`);
        const mapping = {};
        res.data.forEach(b => {
          if (b.itemType === "Question" && b.itemId) {
            mapping[b.itemId._id] = b._id;
          }
        });
        setBookmarkedList(mapping);
      } catch (err) {
        console.error(err);
      }
    };

    fetchExams();
    if (userId) {
      fetchUserBookmarks();
    }
  }, [userId]);

  const toggleBookmark = async (qId) => {
    if (bookmarkedList[qId]) {
      // Remove bookmark
      try {
        await axios.delete(`http://localhost:9999/bookmarks/${bookmarkedList[qId]}`);
        const updated = { ...bookmarkedList };
        delete updated[qId];
        setBookmarkedList(updated);
      } catch (err) {
        console.error(err);
      }
    } else {
      // Add bookmark
      try {
        const res = await axios.post("http://localhost:9999/bookmarks", {
          userId,
          itemType: "Question",
          itemId: qId,
          notes: "Saved during " + (selectedExam?.title || "Practice")
        });
        setBookmarkedList({
          ...bookmarkedList,
          [qId]: res.data._id
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const startPractice = async (exam) => {
    try {
      const res = await axios.get(`http://localhost:9999/exams/${exam._id}`);
      setSelectedExam(res.data);
      
      const preparedQuestions = [...(res.data.questions || [])]
        .sort(() => Math.random() - 0.5)
        .map(q => {
          if (q.questionType === "MultipleChoice" && q.options) {
            const mappedOpts = q.options.map((opt, origIndex) => ({ text: opt, origIndex }));
            const shuffledOpts = [...mappedOpts].sort(() => Math.random() - 0.5);
            return {
              ...q,
              shuffledOptions: shuffledOpts
            };
          } else if (q.questionType === "Matching" && q.matchingPairs) {
            // Shuffle right answers
            const rightOptions = q.matchingPairs.map((pair, idx) => ({ text: pair.right, origIndex: idx }));
            const shuffledRight = [...rightOptions].sort(() => Math.random() - 0.5);
            return {
              ...q,
              shuffledRight
            };
          }
          return q;
        });

      setQuestions(preparedQuestions);
      setCurrent(0);
      setAnswers({});
      setSubmitted(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelect = (value) => {
    setAnswers({ ...answers, [current]: value });
  };

  const handleTTS = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, i) => {
      const ans = answers[i];
      if (q.questionType === "MultipleChoice") {
        if (ans === q.correctAnswer) score++;
      } else if (q.questionType === "TrueFalse") {
        if (ans && String(ans).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()) score++;
      } else if (q.questionType === "FillInBlank") {
        if (ans && String(ans).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()) score++;
      } else if (q.questionType === "Matching") {
        let allCorrect = true;
        if (!ans || Object.keys(ans).length < q.matchingPairs.length) {
          allCorrect = false;
        } else {
          q.matchingPairs.forEach((_, idx) => {
            if (ans[idx] !== idx) allCorrect = false;
          });
        }
        if (allCorrect) score++;
      }
    });
    return score;
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    const score = calculateScore();
    const status = (score / questions.length) >= 0.5 ? "PASSED" : "FAILED";

    try {
      // Save history with answers matching history schema
      await axios.post("http://localhost:9999/history", {
        userId: userId,
        examId: selectedExam._id,
        score: score,
        total: questions.length,
        status: status,
        answers: Object.keys(answers).map(key => {
          const q = questions[key];
          // convert matching object to string representation for schema
          const selAnswer = q.questionType === "Matching" ? JSON.stringify(answers[key]) : String(answers[key]);
          return {
            questionId: q._id,
            selectedAnswer: selAnswer
          };
        })
      });
    } catch (err) {
      console.error("Failed to save history:", err);
    }
  };

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  // --- RESULT VIEW ---
  if (submitted) {
    const score = calculateScore();

    return (
      <div className="p-4 w-100">
        <Button variant="outline-primary" className="mb-3" onClick={() => { setSelectedExam(null); setSubmitted(false); }}>
          &larr; Back to Practice List
        </Button>
        <Card className="p-4 shadow text-center mb-4">
          <h3>🎉 Practice Result</h3>
          <h4>{score} / {questions.length}</h4>
          <h5 className={score / questions.length >= 0.5 ? "text-success" : "text-danger"}>
            {score / questions.length >= 0.5 ? "PASSED" : "FAILED"}
          </h5>
        </Card>

        {questions.map((q, i) => {
          const userAns = answers[i];
          let isQCorrect = false;
          
          if (q.questionType === "MultipleChoice") {
            isQCorrect = userAns === q.correctAnswer;
          } else if (q.questionType === "TrueFalse" || q.questionType === "FillInBlank") {
            isQCorrect = userAns && String(userAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
          } else if (q.questionType === "Matching") {
            isQCorrect = true;
            if (!userAns || Object.keys(userAns).length < q.matchingPairs.length) {
              isQCorrect = false;
            } else {
              q.matchingPairs.forEach((_, idx) => {
                if (userAns[idx] !== idx) isQCorrect = false;
              });
            }
          }

          return (
            <Card key={i} className={`p-3 mb-3 shadow-sm ${isQCorrect ? 'border-success' : 'border-danger'}`}>
              <div className="d-flex justify-content-between mb-2">
                <span className="fw-bold">Q{i + 1} ({q.questionType}): {q.content}</span>
                <Button variant="link" className="p-0 text-warning" onClick={() => toggleBookmark(q._id)}>
                  {bookmarkedList[q._id] ? <FaBookmark /> : <FaRegBookmark />}
                </Button>
              </div>

              {/* Multiple Choice Render */}
              {q.questionType === "MultipleChoice" && q.shuffledOptions && (
                <div className="ms-2">
                  {q.shuffledOptions.map((optObj, idx) => {
                    const isCorrect = optObj.origIndex === q.correctAnswer;
                    const isUser = userAns === optObj.origIndex;
                    return (
                      <div
                        key={idx}
                        style={{
                          padding: "6px",
                          borderRadius: "6px",
                          marginBottom: "4px",
                          backgroundColor: isCorrect ? "#d1fae5" : isUser ? "#fee2e2" : "transparent",
                        }}
                      >
                        {optObj.text}
                        {isCorrect && <Badge bg="success" className="ms-2">Correct</Badge>}
                        {isUser && !isCorrect && <Badge bg="danger" className="ms-2">Your answer</Badge>}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* True/False Render */}
              {q.questionType === "TrueFalse" && (
                <div className="ms-2">
                  <div className={`p-2 rounded mb-1 ${q.correctAnswer === "true" ? 'bg-success bg-opacity-10 text-success' : ''}`}>
                    True {q.correctAnswer === "true" && <Badge bg="success" className="ms-2">Correct</Badge>}
                    {userAns === "true" && <Badge bg="secondary" className="ms-2">Your Select</Badge>}
                  </div>
                  <div className={`p-2 rounded mb-1 ${q.correctAnswer === "false" ? 'bg-success bg-opacity-10 text-success' : ''}`}>
                    False {q.correctAnswer === "false" && <Badge bg="success" className="ms-2">Correct</Badge>}
                    {userAns === "false" && <Badge bg="secondary" className="ms-2">Your Select</Badge>}
                  </div>
                </div>
              )}

              {/* Fill in Blank Render */}
              {q.questionType === "FillInBlank" && (
                <div className="ms-2 p-2 bg-light rounded">
                  <div>Correct Answer: <strong className="text-success">{q.correctAnswer}</strong></div>
                  <div>Your Answer: <strong className={isQCorrect ? "text-success" : "text-danger"}>{userAns || "(blank)"}</strong></div>
                </div>
              )}

              {/* Matching Render */}
              {q.questionType === "Matching" && q.matchingPairs && (
                <div className="ms-2 p-3 bg-light rounded">
                  <strong className="d-block mb-2 text-primary">Correct Pairs:</strong>
                  {q.matchingPairs.map((pair, idx) => (
                    <div key={idx} className="small mb-1">
                      <Badge bg="secondary">{pair.left}</Badge> &harr; <Badge bg="success">{pair.right}</Badge>
                    </div>
                  ))}
                  <strong className="d-block mt-3 mb-2 text-warning">Your Selections:</strong>
                  {q.matchingPairs.map((pair, idx) => {
                    const selRightIdx = userAns ? userAns[idx] : undefined;
                    const selRightPair = selRightIdx !== undefined ? q.matchingPairs[selRightIdx] : null;
                    return (
                      <div key={idx} className="small mb-1">
                        <Badge bg="secondary">{pair.left}</Badge> &harr;{" "}
                        <Badge bg={selRightIdx === idx ? "success" : "danger"}>
                          {selRightPair ? selRightPair.right : "(none)"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}

              {q.explanation && (
                <div className="mt-3 p-2 bg-info bg-opacity-10 text-info-emphasis rounded small">
                  <FaLightbulb className="me-1"/> <strong>Explanation:</strong> {q.explanation}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    );
  }

  // --- EXAM TAKING VIEW ---
  if (selectedExam) {
    if (questions.length === 0) return <p>No questions found in this practice.</p>;
    const q = questions[current];
    const progress = ((current + 1) / questions.length) * 100;
    const userAns = answers[current];

    return (
      <div className="p-4 w-100">
        <Button variant="outline-secondary" className="mb-3" onClick={() => setSelectedExam(null)}>
          &larr; Cancel Practice
        </Button>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h4>📝 {selectedExam.title}</h4>
          <Button variant="link" className="p-0 text-warning" onClick={() => toggleBookmark(q._id)}>
            {bookmarkedList[q._id] ? <FaBookmark size={20} /> : <FaRegBookmark size={20} />}
          </Button>
        </div>
        <ProgressBar now={progress} className="mb-3" />

        <Card className="p-4 shadow-sm border-primary">
          <div className="d-flex justify-content-between align-items-center mb-3">
             <h5>Question {current + 1} / {questions.length} <Badge bg="info" className="ms-2">{q.questionType}</Badge></h5>
             <Badge bg="secondary">Practice Mode</Badge>
          </div>

          {q.passage && (
            <div className="bg-light p-3 rounded mb-3 small" style={{ maxHeight: "150px", overflowY: "auto", borderLeft: "4px solid #007bff" }}>
              <strong>Reading Passage:</strong> <p className="m-0 mt-1">{q.passage}</p>
            </div>
          )}

          {q.audioUrl && (
            <div className="bg-light p-3 rounded mb-3 d-flex align-items-center gap-2">
              <Button size="sm" variant="primary" onClick={() => handleTTS(q.content)}>
                <FaVolumeUp /> Play Audio Prompt
              </Button>
              <span className="small text-muted">Listening comprehension prompt</span>
            </div>
          )}

          <p className="fw-semibold fs-5">{q.content}</p>

          <Form className="mt-3">
            {/* Multiple Choice Render */}
            {q.questionType === "MultipleChoice" && q.shuffledOptions && (
              q.shuffledOptions.map((optObj, idx) => (
                <Form.Check
                  key={idx}
                  type="radio"
                  label={optObj.text}
                  name="answer"
                  checked={userAns === optObj.origIndex}
                  onChange={() => handleSelect(optObj.origIndex)}
                  className="mb-2"
                />
              ))
            )}

            {/* True/False Render */}
            {q.questionType === "TrueFalse" && (
              <>
                <Form.Check
                  type="radio"
                  label="True"
                  name="tfAnswer"
                  checked={userAns === "true"}
                  onChange={() => handleSelect("true")}
                  className="mb-2"
                />
                <Form.Check
                  type="radio"
                  label="False"
                  name="tfAnswer"
                  checked={userAns === "false"}
                  onChange={() => handleSelect("false")}
                  className="mb-2"
                />
              </>
            )}

            {/* Fill in Blank Render */}
            {q.questionType === "FillInBlank" && (
              <Form.Group className="mb-3">
                <Form.Control 
                  type="text" 
                  placeholder="Type your answer here..." 
                  value={userAns || ""} 
                  onChange={(e) => handleSelect(e.target.value)} 
                />
              </Form.Group>
            )}

            {/* Matching Render */}
            {q.questionType === "Matching" && q.shuffledRight && (
              <div className="p-3 bg-light rounded">
                <p className="small text-muted">Match each item on the left with the correct description from the dropdown list:</p>
                {q.matchingPairs.map((pair, leftIdx) => {
                  const currentMatching = userAns || {};
                  const selectedVal = currentMatching[leftIdx] !== undefined ? currentMatching[leftIdx] : "";
                  return (
                    <Row key={leftIdx} className="align-items-center mb-2">
                      <Col xs={4}>
                        <Badge bg="secondary" className="p-2 fs-6 w-100">{pair.left}</Badge>
                      </Col>
                      <Col xs={1} className="text-center">&harr;</Col>
                      <Col xs={7}>
                        <Form.Select 
                          value={selectedVal} 
                          onChange={(e) => {
                            const val = e.target.value === "" ? undefined : parseInt(e.target.value);
                            handleSelect({
                              ...currentMatching,
                              [leftIdx]: val
                            });
                          }}
                        >
                          <option value="">-- Choose Description --</option>
                          {q.shuffledRight.map((rOpt, rIdx) => (
                            <option key={rIdx} value={rOpt.origIndex}>{rOpt.text}</option>
                          ))}
                        </Form.Select>
                      </Col>
                    </Row>
                  );
                })}
              </div>
            )}
          </Form>

          <div className="d-flex justify-content-between mt-4">
            <Button variant="secondary" disabled={current === 0} onClick={() => setCurrent(current - 1)}>
              Previous
            </Button>
            {current === questions.length - 1 ? (
              <Button variant="success" onClick={handleSubmit} disabled={Object.keys(answers).length < questions.length}>
                Submit Practice
              </Button>
            ) : (
              <Button onClick={() => setCurrent(current + 1)}>
                Next
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // --- LISTING VIEW ---
  return (
    <div className="w-100 p-2">
      <h4 className="mb-4 fw-bold">Practice English Sessions</h4>
      <Row>
        {exams.length === 0 ? (
          <div className="text-center text-muted my-4">No practice sessions available</div>
        ) : (
          exams.map((exam) => (
            <Col key={exam._id} xs={12} sm={6} md={4} lg={3} className="mb-3">
              <Card className="shadow-sm text-center border-primary h-100" style={{ borderRadius: "12px" }}>
                <Card.Body className="d-flex flex-column justify-content-between">
                  <div>
                    <h6 className="fw-bold mb-2">{exam.title}</h6>
                    <Badge bg="primary" className="mb-2 me-1">{exam.level}</Badge>
                    <Badge bg="secondary" className="mb-3">{exam.questions?.length || 0} Questions</Badge>
                  </div>
                  <Button variant="primary" size="sm" style={{ borderRadius: "20px" }} onClick={() => startPractice(exam)}>
                    Start Practice
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </div>
  );
};

export default Practice;