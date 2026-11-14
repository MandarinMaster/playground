"use client";

import { useEffect, useState } from "react";

const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const prompts = [
  (digit: string) => `Zeigt mir die ${digit}!`,
  (digit: string) => `Welches ist die ${digit}?`,
  (digit: string) => `Wo siehst du die ${digit}?`,
];
const colors = ["#ff5ca8", "#7358e8", "#12a9a0", "#ff9b35", "#397fe8", "#e45c61", "#8d55c7", "#269b65", "#e17a25", "#3866b7"];

function shuffle<T,>(items: T[]) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function playTone(frequencies: number[], duration: number, wave: OscillatorType = "sine") {
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    frequencies.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = wave;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, context.currentTime + index * duration);
      gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + index * duration + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + (index + 1) * duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(context.currentTime + index * duration);
      oscillator.stop(context.currentTime + (index + 1) * duration);
    });
    window.setTimeout(() => context.close(), (frequencies.length * duration + 0.2) * 1000);
  } catch {
    // Audio is an enhancement; the game remains playable if it is unavailable.
  }
}

export default function Home() {
  const [playing, setPlaying] = useState(false);
  const [layout, setLayout] = useState(digits);
  const [target, setTarget] = useState("5");
  const [celebrating, setCelebrating] = useState(false);
  const [message, setMessage] = useState("");

  function speak(text: string) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE";
    utterance.rate = 0.88;
    utterance.pitch = 1.12;
    window.speechSynthesis.speak(utterance);
  }

  function askQuestion(nextTarget?: string) {
    const chosen = nextTarget ?? digits[Math.floor(Math.random() * digits.length)];
    const phrase = prompts[Math.floor(Math.random() * prompts.length)](chosen);
    setTarget(chosen);
    setMessage(phrase);
    window.setTimeout(() => speak(phrase), 120);
  }

  function startGame() {
    setLayout(shuffle(digits));
    setPlaying(true);
    setCelebrating(false);
    setMessage("Pass gut auf!");
    window.setTimeout(() => askQuestion(), 450);
  }

  function chooseDigit(digit: string) {
    if (celebrating) return;
    if (digit === target) {
      setCelebrating(true);
      setMessage("Jaaaa! Richtig! 🎉");
      playTone([523.25, 659.25, 783.99, 1046.5, 1318.5], 0.22);
      window.setTimeout(() => {
        setCelebrating(false);
        setLayout(shuffle(digits));
        askQuestion();
      }, 3000);
    } else {
      setMessage("Huch, das war sie nicht. Versuch's nochmal!");
      playTone([190, 145], 0.16, "triangle");
      window.setTimeout(() => {
        setMessage(prompts[Math.floor(Math.random() * prompts.length)](target));
      }, 1100);
    }
  }

  useEffect(() => () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  return (
    <main className="start-screen">
      {!playing ? (
        <div className="tile-grid" aria-label="Startauswahl">
          <button className="start-tile tile-pink" onClick={startGame} aria-label="Zahlen-Spiel starten">
            <span className="tile-symbol" aria-hidden="true">✦</span>
            <span className="tile-number">Zahlen</span>
          </button>
          <div className="start-tile tile-violet" aria-hidden="true"><span className="tile-symbol">♡</span><span className="tile-number">02</span></div>
          <div className="start-tile tile-rose" aria-hidden="true"><span className="tile-symbol">✿</span><span className="tile-number">03</span></div>
          <div className="start-tile tile-lilac" aria-hidden="true"><span className="tile-symbol">☾</span><span className="tile-number">04</span></div>
        </div>
      ) : (
        <section className="number-game">
          <div className="game-toolbar">
            <button className="game-back" onClick={() => { setPlaying(false); setCelebrating(false); window.speechSynthesis?.cancel(); }}>← Zurück</button>
            <span className="game-label">ZAHLEN-SPIEL</span>
          </div>
          <h1 className="game-prompt" aria-live="polite">{message}</h1>
          <p className="game-hint">Tippe auf die richtige Zahl.</p>
          <div className="digit-board">
            {layout.map((digit, index) => (
              <button
                className="digit-button"
                key={digit}
                style={{ color: colors[Number(digit)], fontSize: `clamp(${index % 3 === 0 ? 43 : index % 3 === 1 ? 56 : 66}px, ${index % 3 === 0 ? 7 : index % 3 === 1 ? 8 : 9}vw, ${index % 3 === 0 ? 76 : index % 3 === 1 ? 92 : 108}px)`, transform: `rotate(${(index % 5 - 2) * 3}deg)` }}
                onClick={() => chooseDigit(digit)}
                disabled={celebrating}
                aria-label={`Zahl ${digit}`}
              >
                {digit}
              </button>
            ))}
          </div>
          {celebrating && (
            <div className="party-overlay" aria-hidden="true">
              {Array.from({ length: 90 }, (_, index) => (
                <i key={index} style={{ left: `${(index * 37) % 100}%`, animationDelay: `${(index % 18) * 0.045}s`, backgroundColor: colors[index % colors.length], transform: `rotate(${index * 31}deg)` }} />
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
