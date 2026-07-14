import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FaChartBar, FaUsers, FaClipboardList, FaTools, FaFileAlt } from "react-icons/fa";
import { Table, Card, Row, Col, Tabs, Tab } from "react-bootstrap";
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
  });
  const [examStats, setExamStats] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [timeframe, setTimeframe] = useState("30"); // "30" (last 30 days), "7" (last 7 days), "all" (by exam)
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
      const history = historyRes.data || [];

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

      setExamStats(statsRes.data.examStats || []);
      setHistoryData(history);
      setStats({
        totalUsers: users.length,
        totalQuestions: questionsRes.data.length,
        totalExams: statsRes.data.totalExams || 0,
        totalHistory: statsRes.data.totalAttempts || 0,
        topUsers,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to group history attempts dynamically based on timeframe and exam type
  const getChartDataForType = useCallback((type) => {
    if (timeframe === "all") {
      // Group by exam (original view) filtered by type
      return examStats
        .filter((e) => e.type === type)
        .map((e) => ({
          name: e.title,
          attempts: e.attempts || 0,
          averageScore: e.averageScore || 0,
        }));
    }

    const daysCount = parseInt(timeframe, 10) || 30;
    const timeline = [];

    // Initialize the days array (e.g. DD/MM format labels)
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const label = `${dd}/${mm}`;
      timeline.push({
        dateStr,
        name: label,
        attempts: 0,
        totalScore: 0,
        averageScore: 0,
      });
    }

    // Populate attempts and scores
    historyData.forEach((h) => {
      if (!h.createdAt || !h.examId || h.examId.type !== type) return;
      const hDate = new Date(h.createdAt);
      const yyyy = hDate.getFullYear();
      const mm = String(hDate.getMonth() + 1).padStart(2, '0');
      const dd = String(hDate.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const dayBucket = timeline.find((t) => t.dateStr === dateStr);
      if (dayBucket) {
        dayBucket.attempts += 1;
        dayBucket.totalScore += h.score || 0;
      }
    });

    // Compute average score for each day
    timeline.forEach((t) => {
      t.averageScore = t.attempts ? Math.round((t.totalScore / t.attempts) * 100) / 100 : 0;
    });

    return timeline;
  }, [timeframe, historyData, examStats]);

  const quizChartData = useMemo(() => getChartDataForType("quiz"), [getChartDataForType]);
  const practiceChartData = useMemo(() => getChartDataForType("practice"), [getChartDataForType]);
  const minitestChartData = useMemo(() => getChartDataForType("minitest"), [getChartDataForType]);

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

      {/* Chart Card with Tabs */}
      <Card className="shadow-sm border-0 p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h5 className="fw-bold text-secondary m-0">📊 Exam Attempts & Average Scores</h5>
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted small fw-semibold">Thời gian:</span>
            <select
              className="form-select form-select-sm"
              style={{ width: "160px", borderRadius: "8px" }}
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <option value="30">1 tháng qua (30 ngày)</option>
              <option value="7">1 tuần qua (7 ngày)</option>
              <option value="all">Theo bài thi (Tất cả)</option>
            </select>
          </div>
        </div>

        <Tabs defaultActiveKey="quiz" id="exam-type-report-tabs" className="mb-3">
          <Tab eventKey="quiz" title="Quiz (Kiểm tra)">
            <div className="pt-2">
              <h6 className="text-muted small fw-semibold mb-3">Thống kê hoạt động làm bài kiểm tra (Quiz)</h6>
              {quizChartData.length === 0 ? (
                <div className="text-center p-5 text-muted">Không có dữ liệu lượt thi Quiz nào.</div>
              ) : (
                <div style={{ width: "100%", height: 320 }}>
                  <ResponsiveContainer>
                    <ComposedChart data={quizChartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="attempts" name="Attempts (Lượt làm)" fill="#8884d8" />
                      <Line type="monotone" dataKey="averageScore" name="Avg Score (Điểm TB)" stroke="#ff7300" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </Tab>

          <Tab eventKey="practice" title="Practice (Luyện tập)">
            <div className="pt-2">
              <h6 className="text-muted small fw-semibold mb-3">Thống kê hoạt động làm bài luyện tập (Practice)</h6>
              {practiceChartData.length === 0 ? (
                <div className="text-center p-5 text-muted">Không có dữ liệu lượt thi Practice nào.</div>
              ) : (
                <div style={{ width: "100%", height: 320 }}>
                  <ResponsiveContainer>
                    <ComposedChart data={practiceChartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="attempts" name="Attempts (Lượt làm)" fill="#82ca9d" />
                      <Line type="monotone" dataKey="averageScore" name="Avg Score (Điểm TB)" stroke="#ff7300" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </Tab>

          <Tab eventKey="minitest" title="Minitest (Thi thử)">
            <div className="pt-2">
              <h6 className="text-muted small fw-semibold mb-3">Thống kê hoạt động làm bài thi thử (Minitest)</h6>
              {minitestChartData.length === 0 ? (
                <div className="text-center p-5 text-muted">Không có dữ liệu lượt thi Minitest nào.</div>
              ) : (
                <div style={{ width: "100%", height: 320 }}>
                  <ResponsiveContainer>
                    <ComposedChart data={minitestChartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="attempts" name="Attempts (Lượt làm)" fill="#ffc658" />
                      <Line type="monotone" dataKey="averageScore" name="Avg Score (Điểm TB)" stroke="#ff7300" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </Tab>
        </Tabs>
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
