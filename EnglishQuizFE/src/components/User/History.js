import React, { useState, useEffect, useContext } from "react";
import { Table, Badge, Card, Button, Row, Col } from "react-bootstrap";
import { FaLightbulb } from "react-icons/fa";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

const History = () => {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("All");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const userId = user?._id || localStorage.getItem("id");
      if (!userId) return;
      const res = await axios.get(`http://localhost:9999/history/${userId}`);
      // Sort to show newest first
      const sortedHistory = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setHistory(sortedHistory);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = async (item) => {
    try {
      // Set a generic loading state or try to use existing loading
      setLoading(true);
      const examId = item.examId?._id || item.examId;
      if (examId) {
        const res = await axios.get(`http://localhost:9999/exams/${examId}`);
        // Overwrite examId with fully populated exam data
        setSelectedHistory({ ...item, examId: res.data });
      } else {
        setSelectedHistory(item);
      }
    } catch (err) {
      console.error("Failed to fetch detailed exam", err);
      setSelectedHistory(item); // Fallback
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case "PASSED":
        return <Badge bg="success">PASSED</Badge>;
      case "FAILED":
        return <Badge bg="danger">FAILED</Badge>;
      default:
        return <Badge bg="secondary">UNKNOWN</Badge>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) return <p className="text-center mt-5">Loading history...</p>;

  if (selectedHistory) {
    return (
      <div className="p-4 w-100">
        <Button variant="outline-secondary" className="mb-4" onClick={() => setSelectedHistory(null)}>
          &larr; Back to History
        </Button>
        <Card className="p-4 shadow-sm mb-4 border-0" style={{ backgroundColor: "#f8f9fa" }}>
          <h4 className="fw-bold text-primary mb-3">
            {selectedHistory.examId?.title || "Unknown Exam"}
          </h4>
          <Row>
            <Col md={4}><p className="m-0"><strong>Date:</strong> {formatDate(selectedHistory.createdAt)}</p></Col>
            <Col md={4}><p className="m-0"><strong>Score:</strong> {selectedHistory.score} / {selectedHistory.total}</p></Col>
            <Col md={4}><p className="m-0"><strong>Status:</strong> {getStatusBadge(selectedHistory.status)}</p></Col>
          </Row>
        </Card>

        <h5 className="fw-bold mb-3">Questions Review</h5>
        {(!selectedHistory.answers || selectedHistory.answers.length === 0) && (
          <div className="alert alert-warning mb-4">
            ⚠️ Bài làm này là dữ liệu mẫu (hoặc bạn chưa chọn đáp án nào) nên hệ thống chỉ hiển thị Đáp án đúng, không có "Your Answer".
          </div>
        )}
        {selectedHistory.examId?.questions?.map((q, i) => {
          if (!q || typeof q === "string") return null;
          const userAnswerObj = selectedHistory.answers?.find(a => String(a.questionId) === String(q._id));
          const userAns = userAnswerObj?.selectedAnswer;

          let isQCorrect = false;
          if (q.questionType === "MultipleChoice") {
            const userAnsIndex = userAns !== undefined && userAns !== null ? parseInt(userAns, 10) : -1;
            const correctAnsIndex = parseInt(q.correctAnswer, 10);
            isQCorrect = userAnsIndex === correctAnsIndex;
          } else if (q.questionType === "TrueFalse" || q.questionType === "FillInBlank") {
            isQCorrect = userAns && String(userAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
          } else if (q.questionType === "Matching") {
            isQCorrect = true;
            let parsedUserAns;
            try {
              parsedUserAns = userAns ? JSON.parse(userAns) : null;
            } catch (e) {
              parsedUserAns = null;
            }
            if (!parsedUserAns || Object.keys(parsedUserAns).length < q.matchingPairs.length) {
              isQCorrect = false;
            } else {
              q.matchingPairs.forEach((_, idx) => {
                if (parsedUserAns[idx] !== idx) isQCorrect = false;
              });
            }
          }

          return (
            <Card key={q._id} className={`p-3 mb-3 shadow-sm border-0 ${isQCorrect ? 'border-start border-success border-4' : 'border-start border-danger border-4'}`}>
              <div className="d-flex justify-content-between mb-2">
                <span className="fw-bold">Q{i + 1} ({q.questionType || "MultipleChoice"}): {q.content}</span>
              </div>

              {/* Multiple Choice Render */}
              {q.questionType === "MultipleChoice" && q.options && (
                <div className="ms-2">
                  {q.options.map((opt, idx) => {
                    const isCorrect = idx === parseInt(q.correctAnswer, 10);
                    const isUser = userAns !== undefined && userAns !== null && parseInt(userAns, 10) === idx;
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
                        {opt}
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
                    let parsedUserAns;
                    try {
                      parsedUserAns = userAns ? JSON.parse(userAns) : null;
                    } catch (e) {
                      parsedUserAns = null;
                    }
                    const selRightIdx = parsedUserAns ? parsedUserAns[idx] : undefined;
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
        {(!selectedHistory.examId?.questions || selectedHistory.examId.questions.length === 0 || typeof selectedHistory.examId.questions[0] === 'string') && (
          <div className="text-center p-5 text-muted bg-light rounded shadow-sm">
            No detailed question information is available for this record.
          </div>
        )}
      </div>
    );
  }

  const displayedHistory = history.filter(item => {
    if (filterType === "All") return true;
    if (filterType === "Quiz" && item.examId?.type === "quiz") return true;
    if (filterType === "Practice" && item.examId?.type === "practice") return true;
    if (filterType === "MiniTest" && item.examId?.type === "minitest") return true;
    return false;
  });

  return (
    <div className="p-4 w-100">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold m-0 text-primary">
          📊 Practice & Exam History
        </h4>
        <select 
          className="form-select w-auto shadow-sm" 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="All">All Types</option>
          <option value="Quiz">Quizzes Only</option>
          <option value="Practice">Practice Only</option>
          <option value="MiniTest">Mini Tests Only</option>
        </select>
      </div>

      <Table bordered hover responsive className="bg-white shadow-sm">
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>Type</th>
            <th>Exam/Practice Name</th>
            <th>Date</th>
            <th>Score</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {displayedHistory.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center text-muted p-4">
                No exam history found for this filter.
              </td>
            </tr>
          ) : (
            displayedHistory.map((item, index) => (
              <tr 
                key={item._id} 
                onClick={() => handleSelectHistory(item)}
                style={{ cursor: "pointer", transition: "all 0.2s" }}
                className="table-row-hover"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td>{index + 1}</td>
                <td>
                   <Badge bg={item.examId?.type === 'practice' ? 'info' : item.examId?.type === 'minitest' ? 'success' : 'warning'}>
                     {item.examId?.type ? item.examId.type.toUpperCase() : 'QUIZ'}
                   </Badge>
                </td>
                <td className="fw-semibold text-primary">{item.examId?.title || "Unknown Exam"}</td>
                <td className="text-muted">{formatDate(item.createdAt)}</td>
                <td>
                  <strong>{item.score}</strong> / {item.total || item.examId?.questions?.length || '?'}
                </td>
                <td>{getStatusBadge(item.status)}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default History;