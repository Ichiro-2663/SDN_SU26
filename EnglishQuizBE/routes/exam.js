const express = require("express");
const router = express.Router();
const Exam = require("../models/Exam");

// GET ALL
router.get("/", async (req, res) => {
  try {
    const exams = await Exam.find()
      .populate({
        path: "questions",
        populate: [
          { path: "topic" },
          { path: "skill" },
          { path: "certificate" }
        ]
      })
      .populate("topic")
      .populate("certificate")
      .populate("skills")
      .populate("createdBy", "-password");
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ONE
router.get("/:id", async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate({
        path: "questions",
        populate: [
          { path: "topic" },
          { path: "skill" },
          { path: "certificate" }
        ]
      })
      .populate("topic")
      .populate("certificate")
      .populate("skills")
      .populate("createdBy", "-password");
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    res.json(exam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE
router.post("/", async (req, res) => {
  try {
    const newExam = await Exam.create(req.body);
    res.status(201).json(newExam);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const updated = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate("questions");
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await Exam.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;