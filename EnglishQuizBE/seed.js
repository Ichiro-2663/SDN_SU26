const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Question = require("./models/Question");
const Exam = require("./models/Exam");
const History = require("./models/History");
const Topic = require("./models/Topic");
const Skill = require("./models/Skill");
const Certificate = require("./models/Certificate");
const Flashcard = require("./models/Flashcard");
const Bookmark = require("./models/Bookmark");

require("dotenv").config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/SDN302_project_SP26");
    console.log("Connected to MongoDB for seeding...");

    // Clear DB
    await User.deleteMany({});
    await Question.deleteMany({});
    await Exam.deleteMany({});
    await History.deleteMany({});
    await Topic.deleteMany({});
    await Skill.deleteMany({});
    await Certificate.deleteMany({});
    await Flashcard.deleteMany({});
    await Bookmark.deleteMany({});
    console.log("Cleared old data from all collections");

    // Seed Topics
    const topics = await Topic.insertMany([
      { name: "Environment", description: "Nature, pollution, climate change, and ecology vocabulary.", slug: "environment" },
      { name: "Pets & Animals", description: "Domestic pets, wildlife, biology, and animal behaviors.", slug: "pets-animals" },
      { name: "Technology", description: "Computers, software, Internet, and innovations in the modern world.", slug: "technology" },
      { name: "Health & Medicine", description: "Human anatomy, diseases, healthy habits, and medical treatments.", slug: "health-medicine" },
      { name: "Travel & Culture", description: "Tourism, transport, traditions, countries, and outdoor activities.", slug: "travel-culture" }
    ]);
    console.log(`Seeded ${topics.length} Topics`);

    // Seed Certificates
    const certs = await Certificate.insertMany([
      { name: "TOEIC", description: "Test of English for International Communication.", format: "Listening & Reading (200 questions)", maxScore: 990 },
      { name: "IELTS", description: "International English Language Testing System.", format: "Academic & General Training (4 modules)", maxScore: 9 },
      { name: "VSTEP", description: "Vietnamese Standardized Test of English Proficiency.", format: "Level 3-5 (B1-C1 equivalent)", maxScore: 10 }
    ]);
    console.log(`Seeded ${certs.length} Certificates`);

    // Seed Skills
    const skills = await Skill.insertMany([
      { name: "Grammar", description: "Tenses, structures, syntax, and sentence formations." },
      { name: "Vocabulary", description: "Word meanings, definitions, synonyms, and collocations." },
      { name: "Listening", description: "Audio comprehension, dialogues, and audio prompts." },
      { name: "Reading", description: "Comprehension passages, article analysis, and speed reading." },
      { name: "Writing", description: "Sentence correction, essay formats, and structured drafting." }
    ]);
    console.log(`Seeded ${skills.length} Skills`);

    // Helper mappings
    const tMap = {}; topics.forEach(t => tMap[t.name] = t._id);
    const cMap = {}; certs.forEach(c => cMap[c.name] = c._id);
    const sMap = {}; skills.forEach(s => sMap[s.name] = s._id);

    // Seed Users (Admin, Teacher, Student)
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash("123456", salt);

    const admin = await User.create({
      name: "Admin User",
      email: "admin@gmail.com",
      password: hash,
      role: "Admin",
      age: 30,
      address: "Hanoi",
      school: "FPT University"
    });

    const teacher = await User.create({
      name: "Teacher Alice",
      email: "teacher@gmail.com",
      password: hash,
      role: "Teacher",
      age: 28,
      address: "HCMC",
      school: "FPT Academy",
      teacherProfile: {
        specialization: ["IELTS Reading", "TOEIC Grammar"],
        experienceYears: 5,
        bio: "Experienced IELTS tutor with band 8.5 overall."
      }
    });

    const student = await User.create({
      name: "Student Bob",
      email: "student@gmail.com",
      password: hash,
      role: "Student",
      age: 20,
      address: "Danang",
      school: "BKU",
      studentProfile: {
        targetCertificate: "IELTS",
        targetScore: "7.0"
      }
    });

    // Mock students
    const mockStudents = [];
    for (let i = 1; i <= 5; i++) {
      mockStudents.push({
        name: `Student 00${i}`,
        email: `student${i}@gmail.com`,
        password: hash,
        role: "Student",
        age: 18 + i,
        address: "Danang",
        school: "FPT University",
        studentProfile: {
          targetCertificate: "TOEIC",
          targetScore: "650"
        }
      });
    }
    const insertedStudents = await User.insertMany(mockStudents);
    const allUsers = [student, ...insertedStudents];
    console.log(`Seeded 1 Admin, 1 Teacher, and ${allUsers.length} Students`);

    // Seed Questions of all 4 types
    const questionsData = [
      // Multiple Choice
      {
        content: "What is the primary cause of global warming?",
        options: ["Carbon dioxide emissions", "Solar wind cycles", "Deep ocean currents", "Volcanic ash eruptions"],
        correctAnswer: 0,
        level: "medium",
        questionType: "MultipleChoice",
        topic: tMap["Environment"],
        skill: sMap["Vocabulary"],
        certificate: cMap["IELTS"],
        explanation: "Carbon dioxide (CO2) is a greenhouse gas that traps heat in the atmosphere, primary driving global warming."
      },
      {
        content: "Complete the sentence: If we ___ protect wildlife, many species will go extinct.",
        options: ["don't", "won't", "didn't", "haven't"],
        correctAnswer: 0,
        level: "easy",
        questionType: "MultipleChoice",
        topic: tMap["Environment"],
        skill: sMap["Grammar"],
        explanation: "First conditional uses Present Simple in the 'if'-clause."
      },
      {
        content: "TOEIC stands for Test of English for International ___.",
        options: ["Communication", "Community", "Commerce", "Commission"],
        correctAnswer: 0,
        level: "easy",
        questionType: "MultipleChoice",
        topic: tMap["Travel & Culture"],
        skill: sMap["Vocabulary"],
        certificate: cMap["TOEIC"]
      },

      // Fill in the Blank
      {
        content: "A small domesticated carnivorous mammal with soft fur, a short snout, and retractile claws is called a ___(singular, lowercase).",
        correctAnswer: "cat",
        level: "easy",
        questionType: "FillInBlank",
        topic: tMap["Pets & Animals"],
        skill: sMap["Vocabulary"],
        explanation: "The definition perfectly describes a cat."
      },
      {
        content: "We must reduce our carbon footprint by using public transport instead of personal ___.",
        correctAnswer: "cars",
        level: "medium",
        questionType: "FillInBlank",
        topic: tMap["Environment"],
        skill: sMap["Vocabulary"],
        explanation: "Plural noun 'cars' fits best for public transport comparison."
      },

      // True / False
      {
        content: "IELTS Academic is typically taken by candidates looking to study in an English-speaking environment.",
        correctAnswer: "true",
        level: "easy",
        questionType: "TrueFalse",
        topic: tMap["Travel & Culture"],
        skill: sMap["Reading"],
        certificate: cMap["IELTS"],
        explanation: "True. Academic IELTS is for students seeking higher education abroad."
      },
      {
        content: "Computers only operate using decimal numbers.",
        correctAnswer: "false",
        level: "easy",
        questionType: "TrueFalse",
        topic: tMap["Technology"],
        skill: sMap["Vocabulary"],
        explanation: "False. Computers operate in binary code (zeros and ones)."
      },

      // Matching
      {
        content: "Match the following animal groups with their definitions:",
        options: ["Mammals", "Birds", "Reptiles"], // Keys/Left labels
        matchingPairs: [
          { left: "Mammals", right: "Warm-blooded vertebrates that give birth to live young" },
          { left: "Birds", right: "Feathered vertebrates that lay eggs and can fly" },
          { left: "Reptiles", right: "Cold-blooded vertebrates with dry scaly skin" }
        ],
        correctAnswer: [0, 1, 2], // matching index sequence
        level: "medium",
        questionType: "Matching",
        topic: tMap["Pets & Animals"],
        skill: sMap["Vocabulary"]
      },
      {
        content: "Match the computer terms with their descriptions:",
        options: ["CPU", "RAM", "Hard Drive"],
        matchingPairs: [
          { left: "CPU", right: "The central processor, acting as the brain of the computer" },
          { left: "RAM", right: "Temporary short-term high-speed memory storage" },
          { left: "Hard Drive", right: "Permanent long-term storage device for data" }
        ],
        correctAnswer: [0, 1, 2],
        level: "hard",
        questionType: "Matching",
        topic: tMap["Technology"],
        skill: sMap["Vocabulary"]
      }
    ];

    const seededQuestions = await Question.insertMany(questionsData);
    console.log(`Seeded ${seededQuestions.length} Questions of all 4 types`);

    // Seed Exams (Practice and Quiz)
    const practiceExam = await Exam.create({
      title: "Nature & Environment Practice",
      duration: 15,
      type: "practice",
      level: "medium",
      questions: seededQuestions.filter(q => q.level === "medium" || q.level === "easy").map(q => q._id),
      topic: tMap["Environment"],
      skills: [sMap["Vocabulary"], sMap["Grammar"]],
      createdBy: teacher._id
    });

    const certQuiz = await Exam.create({
      title: "TOEIC Vocabulary Starter Challenge",
      duration: 20,
      type: "quiz",
      level: "medium",
      questions: seededQuestions.map(q => q._id),
      certificate: cMap["TOEIC"],
      skills: [sMap["Vocabulary"], sMap["Reading"]],
      createdBy: admin._id
    });

    console.log("Seeded 2 comprehensive exams");

    // Seed History
    const histories = [];
    allUsers.forEach(u => {
      histories.push({
        userId: u._id,
        examId: certQuiz._id,
        score: 2,
        total: 4,
        status: "PASSED",
        answers: [
          { questionId: seededQuestions[0]._id, selectedAnswer: "0" },
          { questionId: seededQuestions[1]._id, selectedAnswer: "0" },
          { questionId: seededQuestions[2]._id, selectedAnswer: "1" } // wrong
        ]
      });
      histories.push({
        userId: u._id,
        examId: practiceExam._id,
        score: 3,
        total: 3,
        status: "PASSED",
        answers: [
          { questionId: seededQuestions[0]._id, selectedAnswer: "0" },
          { questionId: seededQuestions[1]._id, selectedAnswer: "0" }
        ]
      });
    });
    await History.insertMany(histories);
    console.log(`Seeded ${histories.length} exam histories`);

    // Seed Flashcards for Bob
    await Flashcard.create([
      {
        userId: student._id,
        word: "Biodiversity",
        definition: "The variety of plant and animal life in the world or in a particular habitat.",
        example: "The forest boasts a rich biodiversity.",
        pronunciation: "/ˌbaɪoʊdaɪˈvɜːrsəti/",
        topic: tMap["Environment"],
        box: 1,
        nextReviewDate: new Date()
      },
      {
        userId: student._id,
        word: "Feline",
        definition: "Relating to or affecting cats or other members of the cat family.",
        example: "She has feline characteristics.",
        pronunciation: "/ˈfiːlaɪn/",
        topic: tMap["Pets & Animals"],
        box: 2,
        nextReviewDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days in the future
      }
    ]);
    console.log("Seeded 2 Flashcards for Student Bob");

    // Seed Bookmarks for Bob
    await Bookmark.create([
      {
        userId: student._id,
        itemType: "Question",
        itemId: seededQuestions[0]._id,
        notes: "Remember to review carbon dioxide greenhouse explanation."
      },
      {
        userId: student._id,
        itemType: "Exam",
        itemId: practiceExam._id,
        notes: "Great exam to review grammar."
      }
    ]);
    console.log("Seeded 2 Bookmarks for Student Bob");

    console.log("Database successfully seeded!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding Error:", error);
    process.exit(1);
  }
};

seedDB();
