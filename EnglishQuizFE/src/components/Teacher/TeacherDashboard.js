import React, { useState, useEffect } from "react";
import { Table, Card, Row, Col, Button, Badge } from "react-bootstrap";
import { 
  FaUsers, 
  FaClipboardList, 
  FaBookOpen, 
  FaQuestionCircle, 
  FaFileAlt, 
  FaTrophy, 
  FaPlusCircle, 
  FaChartLine,
  FaCalendarAlt
} from "react-icons/fa";
import axios from "axios";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

const TeacherDashboard = ({ setActiveTab }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuestions: 0,
    totalExams: 0,
    totalHistory: 0,
    topUsers: [],
    recentSubmissions: [],
    chartData: [],
  });
  const [loading, setLoading] = useState(true);

  // Lấy tên giáo viên từ localStorage
  const teacherName = JSON.parse(localStorage.getItem("user") || "{}").name || "Teacher";

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [usersRes, questionsRes, statsRes, historyRes] = await Promise.all([
        axios.get("http://localhost:9999/users"),
        axios.get("http://localhost:9999/questions"),
        axios.get("http://localhost:9999/exams/stats"),
        axios.get("http://localhost:9999/history"),
      ]);

      const students = usersRes.data.filter((u) => u.role === "STUDENT" || u.role === "student" || (u.role !== "ADMIN" && u.role !== "TEACHER"));
      const history = historyRes.data || [];

      // Tính toán học sinh tiêu biểu (Top Users)
      const userPerformances = {};
      history.forEach((h) => {
        const uId = h.userId?._id;
        const uName = h.userId?.name || "Unknown Student";
        const email = h.userId?.email || "";
        if (!uId) return;

        if (!userPerformances[uId]) {
          userPerformances[uId] = { id: uId, name: uName, email, examsTaken: 0, totalScore: 0, maxScorePossible: 0 };
        }
        userPerformances[uId].examsTaken += 1;
        userPerformances[uId].totalScore += h.score || 0;
        userPerformances[uId].maxScorePossible += h.total || 10;
      });

      const topUsers = Object.values(userPerformances)
        .map(u => ({
          ...u,
          accuracyRate: Math.round((u.totalScore / u.maxScorePossible) * 100)
        }))
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, 5);

      // Lịch sử bài làm mới nhất (Recent submissions)
      const recentSubmissions = history
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      const examStats = statsRes.data.examStats || [];
      const chartData = examStats.map((e) => ({
        name: e.title,
        attempts: e.attempts || 0,
        averageScore: Math.round((e.averageScore || 0) * 10) / 10,
      }));

      setStats({
        totalUsers: students.length || usersRes.data.filter(u => u.role !== "ADMIN").length,
        totalQuestions: questionsRes.data.length,
        totalExams: statsRes.data.totalExams || 0,
        totalHistory: statsRes.data.totalAttempts || history.length,
        topUsers,
        recentSubmissions,
        chartData,
      });
    } catch (err) {
      console.error("Failed to load teacher stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRandomGradient = (id) => {
    const gradients = [
      "linear-gradient(135deg, #6366f1, #4f46e5)",
      "linear-gradient(135deg, #10b981, #059669)",
      "linear-gradient(135deg, #f59e0b, #d97706)",
      "linear-gradient(135deg, #ec4899, #db2777)",
      "linear-gradient(135deg, #3b82f6, #2563eb)",
    ];
    const index = id ? id.charCodeAt(id.length - 1) % gradients.length : 0;
    return gradients[index];
  };

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-primary mb-3" role="status" style={{ width: "3rem", height: "3rem" }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <h5 className="text-secondary fw-semibold">Gathering reports and analytics data...</h5>
      </div>
    );
  }

  return (
    <div style={{ padding: "10px", width: "100%" }}>
      {/* WELCOME BANNER */}
      <div
        style={{
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)",
          color: "white",
          padding: "2.5rem 2rem",
          borderRadius: "20px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(99, 102, 241, 0.25)",
          marginBottom: "35px",
        }}
      >
        <div style={{ position: "relative", zIndex: 2 }}>
          <Badge bg="white" className="text-primary fw-bold px-3 py-2 rounded-pill mb-3 shadow-sm" style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
            Teacher Panel Active ⚡
          </Badge>
          <h1 style={{ fontWeight: "800", fontSize: "2.5rem", marginBottom: "8px" }}>
            Welcome back, {teacherName}! 📚
          </h1>
          <p style={{ opacity: 0.9, fontSize: "16px", maxWidth: "600px", lineHeight: "1.6", margin: 0 }}>
            Here is a consolidated overview of student activity, test performance, and question statistics.
          </p>
        </div>
        
        {/* Abstract floating circles for premium design */}
        <div style={{ position: "absolute", right: "-50px", top: "-50px", width: "220px", height: "220px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", zIndex: 1 }} />
        <div style={{ position: "absolute", right: "80px", bottom: "-80px", width: "180px", height: "180px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", zIndex: 1 }} />
      </div>

      {/* METRIC CARD WIDGETS */}
      <Row className="mb-4">
        {[
          {
            title: "Total Students",
            value: stats.totalUsers,
            icon: <FaUsers />,
            color: "#6366f1",
            bg: "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0.02))",
            border: "1px solid rgba(99, 102, 241, 0.2)",
            desc: "Active student accounts"
          },
          {
            title: "Total Attempts",
            value: stats.totalHistory,
            icon: <FaClipboardList />,
            color: "#10b981",
            bg: "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.02))",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            desc: "Quizzes/exams completed"
          },
          {
            title: "Active Exams",
            value: stats.totalExams,
            icon: <FaFileAlt />,
            color: "#f59e0b",
            bg: "linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.02))",
            border: "1px solid rgba(245, 158, 11, 0.2)",
            desc: "Tests & practice models"
          },
          {
            title: "Question Bank",
            value: stats.totalQuestions,
            icon: <FaQuestionCircle />,
            color: "#ec4899",
            bg: "linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(236, 72, 153, 0.02))",
            border: "1px solid rgba(236, 72, 153, 0.2)",
            desc: "Curriculum questions"
          }
        ].map((card, index) => (
          <Col md={3} sm={6} className="mb-3" key={index}>
            <Card 
              className="border-0 h-100 shadow-sm transition-hover" 
              style={{ 
                borderRadius: "18px", 
                background: card.bg, 
                border: card.border,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = `0 12px 20px rgba(0,0,0,0.08)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <Card.Body className="d-flex flex-column justify-content-between p-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div 
                    style={{ 
                      width: "48px", 
                      height: "48px", 
                      borderRadius: "14px", 
                      backgroundColor: card.color, 
                      color: "white", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      fontSize: "20px",
                      boxShadow: `0 4px 10px rgba(0,0,0,0.1)`
                    }}
                  >
                    {card.icon}
                  </div>
                  <Badge pill bg="light" className="text-secondary border small">
                    Overview
                  </Badge>
                </div>
                <div>
                  <h6 className="text-muted fw-bold text-uppercase mb-1" style={{ fontSize: "11px", letterSpacing: "1px" }}>
                    {card.title}
                  </h6>
                  <h2 className="fw-extrabold m-0 text-dark" style={{ fontSize: "2.2rem" }}>
                    {card.value}
                  </h2>
                  <p className="text-muted small m-0 mt-2">
                    {card.desc}
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* QUICK ACTIONS GRID */}
      <h5 className="fw-bold mb-3 mt-4 text-secondary d-flex align-items-center">
        <FaPlusCircle className="me-2 text-primary" /> Quick Management Tools
      </h5>
      <Row className="mb-4">
        {[
          { title: "Manage Exams", action: "exams", desc: "Compile new tests & quizzes", icon: <FaFileAlt />, color: "#8b5cf6" },
          { title: "Question Bank", action: "questions", desc: "Create, view & import questions", icon: <FaQuestionCircle />, color: "#3b82f6" },
          { title: "Topic Categories", action: "topics", desc: "Add vocabulary & grammar topics", icon: <FaBookOpen />, color: "#10b981" }
        ].map((tool, idx) => (
          <Col md={4} className="mb-3" key={idx}>
            <Card 
              className="border-0 p-3 shadow-soft align-items-center text-center h-100" 
              style={{ 
                borderRadius: "16px", 
                cursor: "pointer", 
                backgroundColor: "white", 
                border: "1px solid #e5e7eb",
                transition: "all 0.2s"
              }}
              onClick={() => setActiveTab(tool.action)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = tool.color;
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <div 
                style={{ 
                  width: "50px", 
                  height: "50px", 
                  borderRadius: "50%", 
                  backgroundColor: `${tool.color}15`, 
                  color: tool.color,
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  fontSize: "22px",
                  marginBottom: "12px"
                }}
              >
                {tool.icon}
              </div>
              <h6 className="fw-bold m-0 text-dark">{tool.title}</h6>
              <p className="text-muted small m-0 mt-1">{tool.desc}</p>
            </Card>
          </Col>
        ))}
      </Row>

      {/* MAIN GRAPH & RECENT SUBMISSIONS */}
      <Row className="mb-4">
        {/* GRAPH COLUMN */}
        <Col lg={8} className="mb-4">
          <Card className="border-0 shadow-sm p-4 h-100" style={{ borderRadius: "20px" }}>
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <h5 className="fw-bold text-dark m-0"><FaChartLine className="me-2 text-primary" /> Exam Attempts & Performance</h5>
                <p className="text-muted small m-0">Average correct ratios mapped against submission count</p>
              </div>
              <FaCalendarAlt className="text-muted" />
            </div>

            {stats.chartData.length === 0 ? (
              <div className="d-flex justify-content-center align-items-center h-100 text-muted">
                No attempt statistics available. Create and publish exams first!
              </div>
            ) : (
              <div style={{ width: "100%", height: 350 }}>
                <ResponsiveContainer>
                  <ComposedChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorAttempts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: "11px", fontWeight: "600" }} />
                    <YAxis stroke="#64748b" style={{ fontSize: "11px" }} />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: "12px", 
                        border: "none", 
                        boxShadow: "0 8px 30px rgba(0,0,0,0.12)" 
                      }} 
                    />
                    <Legend />
                    <Bar 
                      dataKey="attempts" 
                      name="Submissions" 
                      fill="url(#colorAttempts)" 
                      radius={[8, 8, 0, 0]} 
                      barSize={40} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="averageScore" 
                      name="Avg Correct Qs" 
                      stroke="#ec4899" 
                      strokeWidth={3}
                      dot={{ r: 5, fill: "#ec4899", strokeWidth: 2 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </Col>

        {/* TOP STUDENTS COLUMN */}
        <Col lg={4} className="mb-4">
          <Card className="border-0 shadow-sm p-4 h-100" style={{ borderRadius: "20px" }}>
            <h5 className="fw-bold text-dark mb-4"><FaTrophy className="me-2 text-warning" /> Top Performing Students</h5>
            <div className="d-flex flex-column gap-3">
              {stats.topUsers.length === 0 ? (
                <div className="text-center text-muted py-5">
                  No active student records found.
                </div>
              ) : (
                stats.topUsers.map((student, idx) => (
                  <div key={student.id} className="d-flex align-items-center justify-content-between p-2 rounded hover-light" style={{ transition: "0.2s" }}>
                    <div className="d-flex align-items-center">
                      <div 
                        style={{ 
                          width: "42px", 
                          height: "42px", 
                          borderRadius: "12px", 
                          background: getRandomGradient(student.id),
                          color: "white",
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                          marginRight: "12px"
                        }}
                      >
                        {getInitials(student.name)}
                      </div>
                      <div>
                        <strong className="d-block text-dark small">{student.name}</strong>
                        <span className="text-muted" style={{ fontSize: "11px" }}>{student.examsTaken} attempts</span>
                      </div>
                    </div>
                    <div className="text-end">
                      <span className="badge bg-success bg-opacity-10 text-success fw-bold" style={{ fontSize: "12px" }}>
                        {student.accuracyRate}% Acc
                      </span>
                      <small className="d-block text-muted mt-1" style={{ fontSize: "10px" }}>Score: {student.totalScore} Qs</small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* RECENT SUBMISSIONS TIMELINE */}
      <Card className="border-0 shadow-sm p-4 mb-4" style={{ borderRadius: "20px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="fw-bold text-dark m-0">📑 Recent Student Submissions</h5>
            <p className="text-muted small m-0">Live log of exams/practice tests submitted by students</p>
          </div>
          <Button variant="outline-primary" size="sm" onClick={fetchStats} className="rounded-pill px-3 fw-bold">
            Reload Feed
          </Button>
        </div>

        <Table borderless hover responsive className="m-0 align-middle">
          <thead>
            <tr className="border-bottom text-muted" style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
              <th className="pb-3">Student</th>
              <th className="pb-3">Exam Module</th>
              <th className="pb-3">Submitted At</th>
              <th className="pb-3 text-center">Score</th>
              <th className="pb-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentSubmissions.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-muted py-4">No recent test attempts recorded yet.</td>
              </tr>
            ) : (
              stats.recentSubmissions.map((record, index) => (
                <tr key={record._id || index} className="border-bottom-soft">
                  <td className="py-3">
                    <strong className="d-block text-dark">{record.userId?.name || "Anonymous User"}</strong>
                    <span className="text-muted small">{record.userId?.email || ""}</span>
                  </td>
                  <td>
                    <span className="fw-semibold text-primary">{record.examId?.title || "Deleted/Archived Exam"}</span>
                    <Badge bg={record.examId?.type === "practice" ? "info" : "warning"} className="ms-2 small">
                      {record.examId?.type ? record.examId.type.toUpperCase() : "QUIZ"}
                    </Badge>
                  </td>
                  <td className="text-muted small">
                    {new Date(record.createdAt).toLocaleString()}
                  </td>
                  <td className="text-center font-monospace fw-bold">
                    {record.score} / {record.total}
                  </td>
                  <td className="text-center">
                    <Badge bg={record.status === "PASSED" ? "success" : "danger"} className="px-3 py-2 rounded-pill">
                      {record.status}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};

export default TeacherDashboard;
