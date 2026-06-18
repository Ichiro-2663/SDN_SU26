import React, { useState, useEffect } from "react";
import { FaChartBar, FaUsers, FaClipboardList, FaTools, FaFileAlt } from "react-icons/fa";
import { Table, Card, Row, Col } from "react-bootstrap";
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

const Reports = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuestions: 0,
    totalExams: 0,
    totalHistory: 0,
    topUsers: [],
    chartData: { labels: [], attempts: [], averageScores: [] },
  });
  const [loading, setLoading] = useState(true);

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

      const users = usersRes.data.filter((u) => u.role !== "ADMIN");
      const history = historyRes.data;

      // compute top users from history
      const userPerformances = {};
      history.forEach((h) => {
        const uId = h.userId?._id;
        const uName = h.userId?.name || "Unknown";
        if (!uId) return;

        if (!userPerformances[uId]) {
          userPerformances[uId] = { id: uId, name: uName, examsTaken: 0, totalScore: 0 };
        }
        userPerformances[uId].examsTaken += 1;
        userPerformances[uId].totalScore += h.score || 0;
      });

      const topUsers = Object.values(userPerformances)
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, 5);

      const examStats = statsRes.data.examStats || [];
      // build chart data for recharts (array of objects)
      const chartData = examStats.map((e) => ({
        name: e.title,
        attempts: e.attempts || 0,
        averageScore: e.averageScore || 0,
      }));

      setStats({
        totalUsers: users.length,
        totalQuestions: questionsRes.data.length,
        totalExams: statsRes.data.totalExams || 0,
        totalHistory: statsRes.data.totalAttempts || 0,
        topUsers,
        chartData,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center mt-5">Gathering statistics...</p>;

  return (
    <div className="p-4">
      <h4 className="fw-bold mb-4 text-primary d-flex align-items-center">
        <FaChartBar className="me-2" /> System Reports & Analytics
      </h4>

      {/* Overview Cards */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="shadow-sm border-0 p-4 text-center h-100" style={{ borderBottom: "4px solid #007bff" }}>
            <FaUsers className="text-primary fs-2 mb-3 mx-auto" />
            <h6 className="text-muted text-uppercase mb-2" style={{ letterSpacing: "1px", fontSize: "13px" }}>Total Students</h6>
            <h3 className="fw-bold text-dark m-0">{stats.totalUsers}</h3>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="shadow-sm border-0 p-4 text-center h-100" style={{ borderBottom: "4px solid #28a745" }}>
            <FaClipboardList className="text-success fs-2 mb-3 mx-auto" />
            <h6 className="text-muted text-uppercase mb-2" style={{ letterSpacing: "1px", fontSize: "13px" }}>Submissions</h6>
            <h3 className="fw-bold text-dark m-0">{stats.totalHistory}</h3>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="shadow-sm border-0 p-4 text-center h-100" style={{ borderBottom: "4px solid #17a2b8" }}>
            <FaFileAlt className="text-info fs-2 mb-3 mx-auto" />
            <h6 className="text-muted text-uppercase mb-2" style={{ letterSpacing: "1px", fontSize: "13px" }}>Exams / Practices</h6>
            <h3 className="fw-bold text-dark m-0">{stats.totalExams}</h3>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="shadow-sm border-0 p-4 text-center h-100" style={{ borderBottom: "4px solid #ffc107" }}>
            <FaTools className="text-warning fs-2 mb-3 mx-auto" />
            <h6 className="text-muted text-uppercase mb-2" style={{ letterSpacing: "1px", fontSize: "13px" }}>Question Bank</h6>
            <h3 className="fw-bold text-dark m-0">{stats.totalQuestions}</h3>
          </Card>
        </Col>
      </Row>

      {/* Chart */}
      <Card className="shadow-sm border-0 p-4 mb-4">
        <h5 className="fw-bold mb-3 text-secondary">📊 Exam Attempts & Average Scores</h5>
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer>
            <ComposedChart data={stats.chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="attempts" name="Attempts" fill="#8884d8" />
              <Line type="monotone" dataKey="averageScore" name="Average Score" stroke="#ff7300" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Top Students */}
      <Card className="shadow-sm border-0 p-4">
        <h5 className="fw-bold mb-3 text-secondary">🏆 Top Performing Students</h5>
        <Table hover responsive className="bg-white">
          <thead className="table-light">
            <tr>
              <th>Rank</th>
              <th>Student Name</th>
              <th>Exams Taken</th>
              <th>Total Correct Answers</th>
            </tr>
          </thead>
          <tbody>
            {stats.topUsers.length === 0 ? (
              <tr><td colSpan="4" className="text-center text-muted p-3">No activity yet.</td></tr>
            ) : (
              stats.topUsers.map((u, index) => (
                <tr key={u.id}>
                  <td>
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                  </td>
                  <td className="fw-bold">{u.name}</td>
                  <td>{u.examsTaken}</td>
                  <td className="text-success fw-bold">{u.totalScore}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};

export default Reports;
