import React, { useContext } from "react";
import { FaUsers, FaChartBar, FaClipboardList } from "react-icons/fa";
import UserContext from "../../context/UserContext";

const AdminDashboard = () => {

    const {totalUser} = useContext(UserContext)

  const stats = [
    { icon: <FaUsers />, label: "Tổng số người dùng", value: totalUser },
    { icon: <FaChartBar />, label: "Báo cáo tháng", value: 28 },
    { icon: <FaClipboardList />, label: "Hệ thống hoạt động", value: "Ổn định" },
  ];

  return (
    <div className="p-4">
      <h4 className="fw-bold mb-3 text-primary">Bảng điều khiển quản trị</h4>
      <div className="row">
        {stats.map((item, i) => (
          <div key={i} className="col-md-4 mb-3">
            <div className="card shadow-sm border-0 p-3 text-center">
              <div className="fs-2 text-primary mb-2">{item.icon}</div>
              <h6 className="fw-bold">{item.label}</h6>
              <p className="fs-5 mb-0">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
