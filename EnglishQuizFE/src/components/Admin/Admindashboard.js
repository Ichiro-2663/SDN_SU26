import React, { useState, useEffect } from "react";
import { FaUsers, FaClipboardList, FaFileAlt, FaQuestionCircle, FaUserShield, FaUserGraduate, FaChalkboardTeacher, FaArrowRight, FaChartPie, FaBell } from "react-icons/fa";
import { Row, Col, Card, ProgressBar } from "react-bootstrap";
import axios from "axios";

const AdminDashboard = ({ onSelect }) => {
  const [data, setData] = useState({
    totalUsers: 0,
    adminCount: 0,
    teacherCount: 0,
    studentCount: 0,
    totalQuestions: 0,
    totalExams: 0,
    totalAttempts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [usersRes, questionsRes, statsRes] = await Promise.all([
        axios.get("http://localhost:9999/users"),
        axios.get("http://localhost:9999/questions"),
        axios.get("http://localhost:9999/exams/stats"),
      ]);

      const users = usersRes.data || [];
      const totalUsers = users.length;
      const adminCount = users.filter((u) => u.role === "Admin").length;
      const teacherCount = users.filter((u) => u.role === "Teacher").length;
      const studentCount = users.filter((u) => u.role === "Student").length;

      setData({
        totalUsers,
        adminCount,
        teacherCount,
        studentCount,
        totalQuestions: questionsRes.data?.length || 0,
        totalExams: statsRes.data?.totalExams || 0,
        totalAttempts: statsRes.data?.totalAttempts || 0,
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center p-5" style={{ minHeight: "300px" }}>
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">Đang tải thông tin bảng điều khiển...</p>
      </div>
    );
  }

  const kpis = [
    {
      title: "Tổng số người dùng",
      value: data.totalUsers,
      icon: <FaUsers />,
      color: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
      shadow: "rgba(59, 130, 246, 0.3)",
      details: `${data.studentCount} Học sinh | ${data.teacherCount} Giáo viên`,
    },
    {
      title: "Đề thi & Luyện tập",
      value: data.totalExams,
      icon: <FaFileAlt />,
      color: "linear-gradient(135deg, #10b981, #047857)",
      shadow: "rgba(16, 185, 129, 0.3)",
      details: "Được khởi tạo trên hệ thống",
    },
    {
      title: "Lượt làm bài",
      value: data.totalAttempts,
      icon: <FaClipboardList />,
      color: "linear-gradient(135deg, #f59e0b, #d97706)",
      shadow: "rgba(245, 158, 11, 0.3)",
      details: "Số lượt nộp bài đánh giá",
    },
    {
      title: "Ngân hàng câu hỏi",
      value: data.totalQuestions,
      icon: <FaQuestionCircle />,
      color: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
      shadow: "rgba(139, 92, 246, 0.3)",
      details: "Đa dạng các kỹ năng tiếng Anh",
    },
  ];

  const quickActions = [
    {
      title: "Quản lý người dùng",
      description: "Thêm, cập nhật hoặc vô hiệu hóa tài khoản học viên và giáo viên.",
      icon: <FaUsers className="text-primary fs-3" />,
      target: "users",
    },
    {
      title: "Báo cáo hệ thống",
      description: "Xem chi tiết thống kê bài thi, điểm trung bình và biểu đồ phát triển.",
      icon: <FaChartPie className="text-success fs-3" />,
      target: "reports",
    },
    {
      title: "Thông báo hệ thống",
      description: "Gửi thông báo và bảng tin đến toàn bộ người dùng trong ứng dụng.",
      icon: <FaBell className="text-warning fs-3" />,
      target: "system",
    },
  ];

  // Calculate percentages for user breakdown
  const studentPercentage = data.totalUsers ? Math.round((data.studentCount / data.totalUsers) * 100) : 0;
  const teacherPercentage = data.totalUsers ? Math.round((data.teacherCount / data.totalUsers) * 100) : 0;
  const adminPercentage = data.totalUsers ? Math.round((data.adminCount / data.totalUsers) * 100) : 0;

  return (
    <div className="p-2">

      {/* KPI Cards */}
      <Row className="g-3 mb-4">
        {kpis.map((kpi, index) => (
          <Col key={index} xs={12} sm={6} lg={3}>
            <Card
              className="border-0 shadow-sm h-100 dash-card"
              style={{
                borderRadius: "16px",
                transition: "all 0.3s ease",
              }}
            >
              <Card.Body className="d-flex align-items-center p-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white me-3"
                  style={{
                    width: "48px",
                    height: "48px",
                    background: kpi.color,
                    boxShadow: `0 8px 16px ${kpi.shadow}`,
                    fontSize: "20px",
                  }}
                >
                  {kpi.icon}
                </div>
                <div>
                  <h6 className="text-muted mb-1 small text-uppercase fw-bold" style={{ letterSpacing: "0.5px" }}>
                    {kpi.title}
                  </h6>
                  <h3 className="fw-bold text-dark m-0">{kpi.value}</h3>
                  <span className="text-muted small" style={{ fontSize: "11px" }}>{kpi.details}</span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        {/* Breakdown Card */}
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100 p-4" style={{ borderRadius: "16px" }}>
            <h5 className="fw-bold text-dark mb-4 d-flex align-items-center">
              📊 Phân bố vai trò người dùng
            </h5>
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span className="fw-semibold text-muted d-flex align-items-center gap-2">
                  <FaUserGraduate className="text-primary" /> Học sinh
                </span>
                <span className="fw-bold text-dark">{data.studentCount} ({studentPercentage}%)</span>
              </div>
              <ProgressBar now={studentPercentage} variant="primary" style={{ height: "8px", borderRadius: "4px" }} />
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span className="fw-semibold text-muted d-flex align-items-center gap-2">
                  <FaChalkboardTeacher className="text-success" /> Giáo viên
                </span>
                <span className="fw-bold text-dark">{data.teacherCount} ({teacherPercentage}%)</span>
              </div>
              <ProgressBar now={teacherPercentage} variant="success" style={{ height: "8px", borderRadius: "4px" }} />
            </div>

            <div className="mb-2">
              <div className="d-flex justify-content-between mb-1">
                <span className="fw-semibold text-muted d-flex align-items-center gap-2">
                  <FaUserShield className="text-danger" /> Quản trị viên
                </span>
                <span className="fw-bold text-dark">{data.adminCount} ({adminPercentage}%)</span>
              </div>
              <ProgressBar now={adminPercentage} variant="danger" style={{ height: "8px", borderRadius: "4px" }} />
            </div>
          </Card>
        </Col>

        {/* Quick Actions Card */}
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100 p-4" style={{ borderRadius: "16px" }}>
            <h5 className="fw-bold text-dark mb-4">⚡ Thao tác nhanh</h5>
            <div className="d-flex flex-column gap-3">
              {quickActions.map((action, i) => (
                <div
                  key={i}
                  className="d-flex align-items-center justify-content-between p-3 border rounded-3 quick-action-row"
                  style={{
                    cursor: onSelect ? "pointer" : "default",
                    transition: "background 0.2s",
                  }}
                  onClick={() => onSelect && onSelect(action.target)}
                >
                  <div className="d-flex align-items-center">
                    <div className="me-3">{action.icon}</div>
                    <div>
                      <h6 className="fw-bold mb-1 text-dark">{action.title}</h6>
                      <p className="m-0 text-muted small" style={{ fontSize: "12px" }}>{action.description}</p>
                    </div>
                  </div>
                  {onSelect && <FaArrowRight className="text-muted" />}
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <style>{`
        .dash-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.08) !important;
        }
        .quick-action-row:hover {
          background-color: #f8fafc;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
