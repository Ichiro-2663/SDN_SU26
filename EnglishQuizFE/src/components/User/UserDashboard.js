import React, { useEffect, useState } from "react";
import { Card, Row, Col, Badge, ProgressBar } from "react-bootstrap";
import { FaTrophy, FaGamepad, FaStar, FaHistory, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import axios from "axios";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from "recharts";

const UserDashboard = ({ setActiveTab }) => {
  const [historyData, setHistoryData] = useState([]);
  const [skillsData, setSkillsData] = useState([]);
  const [topicsData, setTopicsData] = useState([]);
  const [stats, setStats] = useState({
    totalTakes: 0,
    totalPassed: 0,
    totalFailed: 0,
    accuracy: 0,
  });

  const userId = localStorage.getItem("id");
  const userName = JSON.parse(localStorage.getItem("user") || "{}").name || "Learner";

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        if (!userId) return;
        const res = await axios.get(`http://localhost:9999/history/${userId}`);
        const data = res.data;
        setHistoryData(data);

        const totalTakes = data.length;
        const totalPassed = data.filter(h => h.status === "PASSED").length;
        const totalFailed = totalTakes - totalPassed;

        let totalScore = 0;
        let totalQuestions = 0;
        data.forEach(h => {
          totalScore += (h.score || 0);
          totalQuestions += (h.total || 0);
        });

        const accuracy = totalQuestions === 0 ? 0 : Math.round((totalScore / totalQuestions) * 100);
        setStats({ totalTakes, totalPassed, totalFailed, accuracy });

        // Calculate Skill and Topic accuracy stats
        const skillStats = {};
        const topicStats = {};

        data.forEach(h => {
          if (!h.examId || !h.examId.questions) return;
          
          // build map of user answers for this exam attempt
          const ansMap = {};
          if (h.answers) {
            h.answers.forEach(ans => {
              ansMap[ans.questionId] = ans.selectedAnswer;
            });
          }

          h.examId.questions.forEach(q => {
            // Check if correct
            const userAns = ansMap[q._id];
            const isCorrect = userAns !== undefined && String(userAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();

            if (q.skill && q.skill.name) {
              const sName = q.skill.name;
              if (!skillStats[sName]) skillStats[sName] = { correct: 0, total: 0 };
              skillStats[sName].total++;
              if (isCorrect) skillStats[sName].correct++;
            }

            if (q.topic && q.topic.name) {
              const tName = q.topic.name;
              if (!topicStats[tName]) topicStats[tName] = { correct: 0, total: 0 };
              topicStats[tName].total++;
              if (isCorrect) topicStats[tName].correct++;
            }
          });
        });

        // Map to Recharts format
        const skillsChart = Object.keys(skillStats).map(name => ({
          name,
          Accuracy: Math.round((skillStats[name].correct / skillStats[name].total) * 100)
        }));

        const topicsChart = Object.keys(topicStats).map(name => ({
          name,
          Accuracy: Math.round((topicStats[name].correct / topicStats[name].total) * 100)
        }));

        setSkillsData(skillsChart);
        setTopicsData(topicsChart);
      } catch (err) {
        console.error("Dashboard statistics loading failed:", err);
      }
    };

    fetchHistory();
  }, [userId]);

  return (
    <div style={{ padding: "10px", width: "100%" }}>
      {/* HEADER BANNER */}
      <div
        style={{
          background: "linear-gradient(135deg, #f97316, #eab308)",
          color: "white",
          padding: "2rem",
          borderRadius: "15px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          marginBottom: "30px",
        }}
      >
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ fontWeight: "800", marginBottom: "5px" }}>
            Welcome back, {userName}! 🚀
          </h2>
          <p style={{ opacity: 0.9, fontSize: "16px", marginBottom: "20px" }}>
            Let's crush some English quizzes today. You're doing great!
          </p>
          <div>
            <button
              onClick={() => setActiveTab("quiz")}
              className="btn btn-light text-warning fw-bold px-4 py-2 me-3 rounded-pill shadow-sm"
              style={{ transition: "0.2s" }}
            >
              Start a Quiz
            </button>
            <button
              onClick={() => setActiveTab("practice")}
              className="btn btn-outline-light fw-bold px-4 py-2 rounded-pill border-2"
              style={{ transition: "0.2s" }}
            >
              Practice Mode
            </button>
          </div>
        </div>
        <FaGamepad style={{ position: "absolute", right: "-20px", top: "-20px", fontSize: "180px", opacity: 0.15, transform: "rotate(15deg)" }} />
      </div>

      {/* STATS OVERVIEW */}
      <h5 className="fw-bold mb-3 text-secondary border-bottom pb-2">Your Progress Overview</h5>
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm text-center p-3 h-100" style={{ borderRadius: "15px", borderBottom: "5px solid #f97316" }}>
            <FaHistory className="text-primary fs-2 mb-2 mx-auto" />
            <span className="text-muted fw-semibold small text-uppercase">Total Exams Taken</span>
            <h2 className="fw-bold m-0">{stats.totalTakes}</h2>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm text-center p-3 h-100" style={{ borderRadius: "15px", borderBottom: "5px solid #28a745" }}>
            <FaCheckCircle className="text-success fs-2 mb-2 mx-auto" />
            <span className="text-muted fw-semibold small text-uppercase">Exams Passed</span>
            <h2 className="fw-bold m-0 text-success">{stats.totalPassed}</h2>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm text-center p-3 h-100" style={{ borderRadius: "15px", borderBottom: "5px solid #dc3545" }}>
            <FaTimesCircle className="text-danger fs-2 mb-2 mx-auto" />
            <span className="text-muted fw-semibold small text-uppercase">Exams Failed</span>
            <h2 className="fw-bold m-0 text-danger">{stats.totalFailed}</h2>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm text-center p-3 h-100" style={{ borderRadius: "15px", borderBottom: "5px solid #ffc107" }}>
            <FaStar className="text-warning fs-2 mb-2 mx-auto" />
            <span className="text-muted fw-semibold small text-uppercase">Avg Accuracy</span>
            <h2 className="fw-bold m-0">{stats.accuracy}%</h2>
          </Card>
        </Col>
      </Row>

      {/* RECENT HISTORY & ACCURACY BAR */}
      <Row className="mb-4">
        <Col md={7}>
          <Card className="border-0 shadow-sm p-4" style={{ borderRadius: "15px", minHeight: "250px" }}>
            <h6 className="fw-bold text-primary mb-3"><FaTrophy className="me-2" /> Recent Activities</h6>
            {historyData.slice().reverse().slice(0, 4).map((record, index) => (
              <div key={record._id || index} className="d-flex justify-content-between align-items-center mb-3 p-2 border-bottom">
                <div>
                  <strong className="d-block">{record.examId?.title || "Unknown Exam"}</strong>
                  <small className="text-muted">{new Date(record.createdAt).toLocaleString()}</small>
                </div>
                <div className="text-end">
                  <Badge bg={record.status === "PASSED" ? "success" : "danger"} className="mb-1">
                    {record.status}
                  </Badge>
                  <div className="fw-bold small text-secondary">Score: {record.score}/{record.total}</div>
                </div>
              </div>
            ))}
            {historyData.length === 0 && (
              <div className="text-center text-muted mt-4">
                You haven't taken any exams yet! <br/> Click 'Start a Quiz' above to begin.
              </div>
            )}
            {historyData.length > 0 && (
              <div className="text-center mt-2">
                <button className="btn btn-link text-decoration-none fw-bold" onClick={() => setActiveTab("history")}>
                  View Full History →
                </button>
              </div>
            )}
          </Card>
        </Col>

        <Col md={5}>
          <Card className="border-0 shadow-sm p-4" style={{ borderRadius: "15px", minHeight: "250px", background: "linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)" }}>
            <h5 className="fw-bold text-white mb-4">🏆 Performance Quality</h5>
            <div className="bg-white p-3 rounded shadow-sm text-center mb-3">
               <h1 className="fw-bold text-dark m-0" style={{fontSize: "3rem"}}>{stats.accuracy}<span className="text-muted" style={{fontSize: "1.5rem"}}>%</span></h1>
               <span className="fw-semibold text-secondary">Overall Correct Rate</span>
            </div>
            <ProgressBar 
               now={stats.accuracy} 
               variant={stats.accuracy > 70 ? "success" : stats.accuracy > 40 ? "warning" : "danger"} 
               className="mb-2 shadow-sm"
               style={{height: "15px"}} 
            />
            <p className="text-white text-end fw-bold small mb-0">
               {stats.accuracy > 70 ? "Excellent Work!" : stats.accuracy > 40 ? "Keep Trying!" : "Need more practice!"}
            </p>
          </Card>
        </Col>
      </Row>

      {/* RECHARTS ANALYTICS */}
      {historyData.length > 0 && (
        <>
          <h5 className="fw-bold mb-3 text-secondary border-bottom pb-2">Skills & Topics Analytics</h5>
          <Row>
            {skillsData.length > 0 && (
              <Col md={6} className="mb-4">
                <Card className="border-0 shadow-sm p-4 h-100" style={{ borderRadius: "15px" }}>
                  <h6 className="fw-bold text-primary mb-4">Accuracy by Skill Group</h6>
                  <div style={{ width: "100%", height: "250px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" radius="80%" data={skillsData}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="name" stroke="#64748b" style={{ fontSize: "12px", fontWeight: "600" }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
                        <Radar name="Accuracy %" dataKey="Accuracy" stroke="#f97316" fill="#f97316" fillOpacity={0.4} />
                        <Tooltip formatter={(value) => [`${value}%`, 'Accuracy']} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </Col>
            )}

            {topicsData.length > 0 && (
              <Col md={6} className="mb-4">
                <Card className="border-0 shadow-sm p-4 h-100" style={{ borderRadius: "15px" }}>
                  <h6 className="fw-bold text-primary mb-4">Accuracy by Vocabulary Topic</h6>
                  <div style={{ width: "100%", height: "250px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topicsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: "11px", fontWeight: "600" }} />
                        <YAxis domain={[0, 100]} stroke="#64748b" />
                        <Tooltip formatter={(value) => [`${value}%`, 'Accuracy']} />
                        <Bar dataKey="Accuracy" fill="#eab308" radius={[8, 8, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </Col>
            )}
          </Row>
        </>
      )}
    </div>
  );
};

export default UserDashboard;
