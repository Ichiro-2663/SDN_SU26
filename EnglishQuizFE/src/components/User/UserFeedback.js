// src/components/User/Feedback.js
import React, { useState } from "react";
import { Card, Button, Form } from "react-bootstrap";

const UserFeedback = () => {
  const [feedbackList, setFeedbackList] = useState([
    { id: 1, name: "Nguyễn Văn A", content: "Dịch vụ rất tốt, cảm ơn nhà trường!" },
    { id: 2, name: "Trần Thị B", content: "Mong có thêm dịch vụ hỗ trợ đăng ký câu lạc bộ." },
  ]);

  const [newFeedback, setNewFeedback] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newFeedback.trim()) return;

    const newItem = {
      id: feedbackList.length + 1,
      name: "Bạn",
      content: newFeedback.trim(),
    };

    setFeedbackList([newItem, ...feedbackList]);
    setNewFeedback("");
  };

  return (
    <div className="p-4">
      <h3 className="mb-4 fw-bold text-primary">Góp ý & Phản hồi</h3>

      {/* Form nhập phản hồi */}
      <Card className="p-3 mb-4 shadow-sm border-0">
        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Viết phản hồi của bạn..."
              value={newFeedback}
              onChange={(e) => setNewFeedback(e.target.value)}
            />
          </Form.Group>
          <Button variant="warning" type="submit" className="mt-3 px-4">
            Gửi phản hồi
          </Button>
        </Form>
      </Card>

      {/* Danh sách phản hồi */}
      <div>
        {feedbackList.map((item) => (
          <Card key={item.id} className="p-3 mb-3 border-0 shadow-sm">
            <h6 className="fw-bold mb-1 text-primary">{item.name}</h6>
            <p className="mb-0">{item.content}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserFeedback;
