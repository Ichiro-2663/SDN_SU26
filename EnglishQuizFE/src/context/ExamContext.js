// src/context/ExamContext.js
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

const ExamContext = createContext();

export const ExamProvider = ({ children }) => {
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentExam, setCurrentExam] = useState(null);
  const [loading, setLoading] = useState(false);

  // 📚 Lấy danh sách đề thi
  const getExams = async () => {
    try {
      const res = await axios.get("http://localhost:9999/exams");
      setExams(res.data);
    } catch (err) {
      console.error("Fetch exams error:", err);
    }
  };

  // ❓ Lấy câu hỏi theo exam
  const getQuestionsByExam = async (examId) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:9999/exams/${examId}/questions`
      );

      // 🔀 shuffle câu hỏi + đáp án
      const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

      const data = res.data.map((q) => ({
        ...q,
        options: shuffle(q.options),
      }));

      setQuestions(shuffle(data));
      setCurrentExam(examId);
    } catch (err) {
      console.error("Fetch questions error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🧠 Submit bài thi
  const submitExam = async (answers) => {
    try {
      const userId = localStorage.getItem("id");

      const res = await axios.post(
        `http://localhost:9999/exams/${currentExam}/submit`,
        {
          userId,
          answers,
        }
      );

      return res.data; // {score, total}
    } catch (err) {
      console.error("Submit exam error:", err);
    }
  };

  useEffect(() => {
    getExams();
  }, []);

  return (
    <ExamContext.Provider
      value={{
        exams,
        questions,
        loading,
        getQuestionsByExam,
        submitExam,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
};

export default ExamContext;