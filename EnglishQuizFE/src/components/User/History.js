import React, { useState, useEffect, useContext } from "react";
import { Table, Badge, Card, Button, Row, Col } from "react-bootstrap";
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
          if (!q || typeof q === "string" || !q.options) return null;
          const userAnswerObj = selectedHistory.answers?.find(a => String(a.questionId) === String(q._id));
          const userAnsIndex = userAnswerObj?.selectedAnswer !== undefined && userAnswerObj?.selectedAnswer !== null 
            ? parseInt(userAnswerObj.selectedAnswer, 10) 
            : -1;
          const correctAnsIndex = parseInt(q.correctAnswer, 10);

          return (
            <Card key={q._id} className="p-3 mb-3 shadow-sm border-0">
              <p className="fw-bold mb-2 text-dark">Q{i + 1}: {q.content}</p>
              {q.options.map((opt, idx) => {
                const isCorrect = idx === correctAnsIndex;
                const isUser = idx === userAnsIndex;
                return (
                  <div
                    key={idx}
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      marginBottom: "6px",
                      backgroundColor: isCorrect ? "#d1fae5" : (isUser ? "#fee2e2" : "#f8f9fa"),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}
                  >
                    <span>{opt}</span>
                    <div>
                      {isCorrect && <Badge bg="success" className="ms-2 shadow-sm">Correct Answer</Badge>}
                      {isUser && !isCorrect && <Badge bg="danger" className="ms-2 shadow-sm">Your Answer</Badge>}
                    </div>
                  </div>
                );
              })}
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
    if (filterType === "Quiz" && item.examId?.type !== "practice") return true;
    if (filterType === "Practice" && item.examId?.type === "practice") return true;
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
                   <Badge bg={item.examId?.type === 'practice' ? 'info' : 'warning'}>
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