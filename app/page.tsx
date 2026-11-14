"use client";

import { useEffect, useMemo, useState } from "react";

type Game = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  type: "math" | "words" | "logic";
};

const games: Game[] = [
  { id: "math", title: "Zahlen-Zauber", subtitle: "Rechnen und knobeln", icon: "🔢", color: "peach", type: "math" },
  { id: "words", title: "Wörter-Welt", subtitle: "Wörter entdecken", icon: "📚", color: "mint", type: "words" },
  { id: "logic", title: "Denk-Detektive", subtitle: "Muster erkennen", icon: "🧩", color: "lavender", type: "logic" },
];

const wordQuestions = [
  { question: "Welches Wort ist ein Tier?", answers: ["Apfel", "Fuchs", "Tisch"], correct: "Fuchs" },
  { question: "Was reimt sich auf Haus?", answers: ["Maus", "Hund", "Baum"], correct: "Maus" },
  { question: "Wie lautet die Mehrzahl von Buch?", answers: ["Büchers", "Bücher", "Buchen"], correct: "Bücher" },
];

const logicQuestions = [
  { question: "Welche Zahl kommt als Nächstes? 2 · 4 · 6 · 8 · ?", answers: ["9", "10", "12"], correct: "10" },
  { question: "Was passt nicht dazu?", answers: ["Kreis", "Dreieck", "Banane"], correct: "Banane" },
  { question: "Welche Form hat 3 Ecken?", answers: ["Kreis", "Dreieck", "Rechteck"], correct: "Dreieck" },
];

function makeMathQuestion() {
  const a = Math.floor(Math.random() * 9) + 2;
  const b = Math.floor(Math.random() * 9) + 1;
  const correct = a + b;
  const choices = new Set([correct, correct + (Math.random() > 0.5 ? 1 : -1), correct + (Math.random() > 0.5 ? 2 : -2)]);
  while (choices.size < 3) choices.add(correct + choices.size + 1);
  return { question: `Was ist ${a} + ${b}?`, answers: [...choices].sort(() => Math.random() - 0.5).map(String), correct: String(correct) };
}

export default function Home() {
  const [selected, setSelected] = useState<Game | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [mathQuestion, setMathQuestion] = useState(makeMathQuestion);

  useEffect(() => {
    const saved = window.localStorage.getItem("playground-stars");
    if (saved) setTotalStars(Number(saved) || 0);
  }, []);

  const questionSet = useMemo(() => {
    if (!selected || selected.type === "math") return [];
    return selected.type === "words" ? wordQuestions : logicQuestions;
  }, [selected]);

  const currentQuestion = selected?.type === "math"
    ? mathQuestion
    : questionSet[questionIndex % Math.max(questionSet.length, 1)];

  function startGame(game: Game) {
    setSelected(game);
    setQuestionIndex(0);
    setScore(0);
    setChosen(null);
    setMathQuestion(makeMathQuestion());
  }

  function answer(value: string) {
    if (chosen || !currentQuestion) return;
    setChosen(value);
    if (value === currentQuestion.correct) {
      setScore((old) => old + 1);
      setTotalStars((old) => {
        const next = old + 1;
        window.localStorage.setItem("playground-stars", String(next));
        return next;
      });
    }
  }

  function nextQuestion() {
    setQuestionIndex((old) => old + 1);
    setChosen(null);
    if (selected?.type === "math") setMathQuestion(makeMathQuestion());
  }

  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="/" onClick={(event) => { event.preventDefault(); setSelected(null); }}>
          <span className="brand-mark">✦</span><span>playground</span>
        </a>
        <div className="star-pill"><span>⭐</span><strong>{totalStars}</strong><span className="star-label">Sterne gesammelt</span></div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="sparkle">✦</span> DEIN ABENTEUER BEGINNT HIER</div>
          <h1>Lernen kann<br /><span>richtig Spaß</span> machen!</h1>
          <p>Entdecke Spiele, löse kleine Rätsel und sammle Sterne. Bist du bereit?</p>
          <button className="primary-button" onClick={() => document.getElementById("spiele")?.scrollIntoView({ behavior: "smooth" })}>Los geht’s <span>→</span></button>
        </div>
        <div className="hero-art" aria-label="Illustration mit Sternen und Regenbogen">
          <div className="sun">☀️</div><div className="rainbow">🌈</div><div className="planet">🪐</div>
          <div className="hero-note note-one">Du schaffst das!</div><div className="hero-note note-two">★ ★ ★</div>
          <div className="hero-orbit orbit-one"></div><div className="hero-orbit orbit-two"></div>
        </div>
      </section>

      <section className="games-section" id="spiele">
        <div className="section-heading">
          <div><div className="eyebrow">SPIELEN & ENTDECKEN</div><h2>Womit möchtest du starten?</h2></div>
          <span className="level-tag">✨ Level 1 · Entdecker</span>
        </div>

        {!selected ? (
          <div className="game-grid">
            {games.map((game, index) => (
              <button className={`game-card ${game.color}`} key={game.id} onClick={() => startGame(game)}>
                <span className="card-number">0{index + 1}</span>
                <span className="game-icon">{game.icon}</span>
                <span className="game-title">{game.title}</span>
                <span className="game-subtitle">{game.subtitle}</span>
                <span className="card-arrow">Losspielen <b>↗</b></span>
              </button>
            ))}
          </div>
        ) : (
          <div className="quiz-panel">
            <div className="quiz-topline">
              <button className="back-button" onClick={() => setSelected(null)}>← Zurück zu den Spielen</button>
              <span className="quiz-score">⭐ {score} richtige Antworten</span>
            </div>
            <div className="quiz-content">
              <div className="quiz-emoji">{selected.icon}</div>
              <div className="eyebrow">{selected.title.toUpperCase()}</div>
              <h3>{currentQuestion?.question}</h3>
              <div className="answer-grid">
                {currentQuestion?.answers.map((answerOption) => {
                  const isCorrect = answerOption === currentQuestion.correct;
                  const isChosen = answerOption === chosen;
                  return <button key={answerOption} className={`answer-button ${chosen && isCorrect ? "correct" : ""} ${isChosen && !isCorrect ? "incorrect" : ""}`} onClick={() => answer(answerOption)} disabled={!!chosen}>{answerOption}</button>;
                })}
              </div>
              {chosen && <div className={`feedback ${chosen === currentQuestion?.correct ? "good" : "try-again"}`}>{chosen === currentQuestion?.correct ? "Super gemacht! Ein Stern für dich ⭐" : `Fast! Richtig ist: ${currentQuestion?.correct}`}</div>}
              {chosen && <button className="primary-button next-button" onClick={nextQuestion}>Nächste Frage <span>→</span></button>}
            </div>
          </div>
        )}
      </section>

      <section className="encouragement"><span>🌟</span><div><strong>Jeder Versuch zählt!</strong><p>Hier geht es nicht um Perfektion. Probier dich aus und hab Spaß dabei.</p></div><span className="encouragement-doodle">✿</span></section>
      <footer><span>✦ playground</span><span>Eine kleine Welt voller großer Ideen.</span></footer>
    </main>
  );
}
