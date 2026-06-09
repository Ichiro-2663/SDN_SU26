const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use("/users", require("./routes/user"));
app.use("/auth", require("./routes/auth"));
app.use("/exams", require("./routes/exam"));
app.use("/questions", require("./routes/question"));
app.use("/history", require("./routes/history"));
app.use("/topics", require("./routes/topic"));
app.use("/skills", require("./routes/skill"));
app.use("/certificates", require("./routes/certificate"));
app.use("/flashcards", require("./routes/flashcard"));
app.use("/bookmarks", require("./routes/bookmark"));

app.listen(9999, () => console.log("Server running on port 9999"));