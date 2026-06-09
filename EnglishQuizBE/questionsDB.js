const generateQuestions = () => {
  const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const db = [];

  const templates = {
    A1: [
      { q: "She ___ from Spain.", opts: ["is", "are", "am", "be"], ans: "is" },
      { q: "I ___ like apples.", opts: ["don't", "doesn't", "not", "no"], ans: "don't" },
      { q: "___ you speak English?", opts: ["Do", "Are", "Is", "Does"], ans: "Do" },
      { q: "They ___ my friends.", opts: ["are", "is", "be", "am"], ans: "are" },
      { q: "He ___ a new car.", opts: ["has", "have", "having", "is have"], ans: "has" },
    ],
    A2: [
      { q: "I went to the store ___ buy milk.", opts: ["to", "for", "so", "at"], ans: "to" },
      { q: "She ___ watching TV at 8 PM yesterday.", opts: ["was", "were", "is", "are"], ans: "was" },
      { q: "We have lived here ___ 2010.", opts: ["since", "for", "in", "from"], ans: "since" },
      { q: "He is taller ___ his brother.", opts: ["than", "then", "from", "as"], ans: "than" },
      { q: "Have you ___ been to London?", opts: ["ever", "never", "always", "yet"], ans: "ever" },
    ],
    B1: [
      { q: "If it rains, we ___ at home.", opts: ["will stay", "would stay", "stayed", "stays"], ans: "will stay" },
      { q: "She told me she ___ the movie already.", opts: ["had seen", "has seen", "saw", "was seeing"], ans: "had seen" },
      { q: "I'm looking forward to ___ you.", opts: ["seeing", "see", "saw", "be seeing"], ans: "seeing" },
      { q: "You ___ smoke in the hospital.", opts: ["mustn't", "don't have to", "needn't", "won't"], ans: "mustn't" },
      { q: "The book ___ was written in 1990 is a bestseller.", opts: ["which", "who", "where", "whose"], ans: "which" },
    ],
    B2: [
      { q: "By this time tomorrow, I ___ my exam.", opts: ["will have finished", "will finish", "am finishing", "have finished"], ans: "will have finished" },
      { q: "Despite ___ tired, he kept working.", opts: ["being", "he was", "of being", "be"], ans: "being" },
      { q: "I wish I ___ more money.", opts: ["had", "have", "will have", "am having"], ans: "had" },
      { q: "Hardly ___ entered the room when the phone rang.", opts: ["had I", "I had", "did I", "I did"], ans: "had I" },
      { q: "The building is reputed ___ in the 15th century.", opts: ["to have been built", "being built", "to build", "to be built"], ans: "to have been built" },
    ],
    C1: [
      { q: "Scarcely ___ asleep when the storm broke.", opts: ["had I fallen", "I had fallen", "did I fall", "fell I"], ans: "had I fallen" },
      { q: "It is imperative that he ___ immediately.", opts: ["leave", "leaves", "left", "will leave"], ans: "leave" },
      { q: "Had I known about the issue, I ___ you.", opts: ["would have helped", "would help", "helped", "will help"], ans: "would have helped" },
      { q: "He was on the verge of ___ when the offer arrived.", opts: ["resigning", "resign", "to resign", "resigned"], ans: "resigning" },
      { q: "Not only ___ late, but he forgot his keys.", opts: ["did he arrive", "he arrived", "arrived he", "did he arrived"], ans: "did he arrive" },
    ],
    C2: [
      { q: "In retrospect, it ___ easier to abandon the project.", opts: ["might have been", "could be", "was to be", "had been"], ans: "might have been" },
      { q: "Such ___ the scale of the disaster that the government collapsed.", opts: ["was", "were", "is", "being"], ans: "was" },
      { q: "He objected to ___ treated like a child.", opts: ["being", "be", "have been", "having been"], ans: "being" },
      { q: "Be that as it ___, we must proceed.", opts: ["may", "can", "will", "does"], ans: "may" },
      { q: "I'd rather you ___ mention this to anyone.", opts: ["didn't", "don't", "wouldn't", "won't"], ans: "didn't" },
    ]
  };

  levels.forEach(lvl => {
    const list = templates[lvl];
    for (let i = 0; i < 20; i++) {
        const template = list[i % 5];
        db.push({
            content: `[Question ${i+1}] ${template.q}`,
            options: [...template.opts],
            correctAnswer: template.opts.indexOf(template.ans),
            level: lvl
        });
    }
  });

  return db;
};

module.exports = generateQuestions();
