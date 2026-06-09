import React, { useState } from "react";

const SystemNotice = () => {
  const [notice, setNotice] = useState("");
  const [list, setList] = useState([]);

  const handleAdd = () => {
    if (!notice.trim()) return;
    setList([...list, { id: Date.now(), text: notice }]);
    setNotice("");
  };

  return (
    <div className="p-4">
      <h4 className="fw-bold mb-3 text-primary">Thông báo hệ thống</h4>
      <div className="mb-3">
        <textarea
          className="form-control"
          rows="3"
          placeholder="Nhập nội dung thông báo..."
          value={notice}
          onChange={(e) => setNotice(e.target.value)}
        />
      </div>
      <button className="btn btn-primary mb-3" onClick={handleAdd}>
        Đăng thông báo
      </button>

      <ul className="list-group">
        {list.map((n) => (
          <li key={n.id} className="list-group-item">
            {n.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SystemNotice;
