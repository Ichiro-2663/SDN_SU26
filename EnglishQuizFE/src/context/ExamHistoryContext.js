// src/context/ExamHistoryContext.js
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

const ExamHistoryContext = createContext();

export const ExamHistoryProvider = ({ children }) => {
  const [history, setHistory] = useState([]);

  // 📊 Lấy lịch sử bài thi
  const getHistory = async () => {
    try {
      const userId = localStorage.getItem("id");

      const res = await axios.get(
        `http://localhost:9999/history/${userId}`
      );

      setHistory(res.data);
    } catch (err) {
      console.error("Fetch history error:", err);
    }
  };

  // 🗑 Xóa kết quả
  const deleteResult = async (id) => {
    try {
      await axios.delete(`http://localhost:9999/history/${id}`);
      setHistory((prev) => prev.filter((h) => h._id !== id));
    } catch (err) {
      console.error("Delete result error:", err);
    }
  };

  useEffect(() => {
    getHistory();
  }, []);

  return (
    <ExamHistoryContext.Provider
      value={{
        history,
        getHistory,
        deleteResult,
      }}
    >
      {children}
    </ExamHistoryContext.Provider>
  );
};

export default ExamHistoryContext;