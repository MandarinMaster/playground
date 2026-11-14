"use client";

import { useEffect, useState, type CSSProperties } from "react";

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

let sharedAudioContext: AudioContext | null = null;

function getAudioContext() {
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!sharedAudioContext || sharedAudioContext.state === "closed") {
    sharedAudioContext = new AudioContextClass();
  }
  // Resume synchronously inside the tap handler so mobile browsers keep the user gesture.
  if (sharedAudioContext.state === "suspended") void sharedAudioContext.resume();
  return sharedAudioContext;
}

function playTone(frequencies: number[], duration: number, wave: OscillatorType = "sine") {
  try {
    const context = getAudioContext();
    if (!context) return;
    const startAt = context.currentTime + 0.04;
    frequencies.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = wave;
      oscillator.frequency.setValueAtTime(frequency, startAt + index * duration);
      gain.gain.setValueAtTime(0.0001, startAt + index * duration);
      gain.gain.exponentialRampToValueAtTime(0.22, startAt + index * duration + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + (index + 1) * duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(startAt + index * duration);
      oscillator.stop(startAt + (index + 1) * duration);
    });
  } catch {
    // Audio may be unavailable in the current browser or device settings.
  }
}

function playCelebration() {
  try {
    const context = getAudioContext();
    if (!context) return;
    const melody = [659.25, 783.99, 987.77, 1318.5, 1174.66, 1318.5, 1567.98, 1760, 1567.98, 2093];
    const beat = 0.2;
    const startAt = context.currentTime + 0.06;
    melody.forEach((frequency, index) => {
      const at = startAt + index * beat;
      // Bright lead plus a soft octave shimmer.
      ([{ multiple: 1, volume: 0.24, type: "triangle" as OscillatorType }, { multiple: 2, volume: 0.065, type: "sine" as OscillatorType }]).forEach((voice) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = voice.type;
        oscillator.frequency.setValueAtTime(frequency * voice.multiple, at);
        gain.gain.setValueAtTime(0.0001, at);
        gain.gain.exponentialRampToValueAtTime(voice.volume, at + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.36);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(at);
        oscillator.stop(at + 0.38);
      });
    });
    // Warm major chord and sparkling high notes at the end.
    [523.25, 659.25, 783.99, 1046.5].forEach((frequency) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, startAt + 1.55);
      gain.gain.exponentialRampToValueAtTime(0.075, startAt + 1.8);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 2.55);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(startAt + 1.55);
      oscillator.stop(startAt + 2.6);
    });
  } catch {
    // Audio may be unavailable in the current browser or device settings.
  }
}

export default function Home() {
  const [playing, setPlaying] = useState(false);
  const [layout, setLayout] = useState(digits);
  const [target, setTarget] = useState("5");
  const [celebrating, setCelebrating] = useState(false);
  const [message, setMessage] = useState("");
  const [roundKey, setRoundKey] = useState(0);

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
    setRoundKey((key) => key + 1);
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
      playCelebration();
      window.setTimeout(() => {
        setCelebrating(false);
        setLayout(shuffle(digits));
        setRoundKey((key) => key + 1);
        askQuestion();
      }, 4700);
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
          <div className="digit-board" key={roundKey}>
            {layout.map((digit, index) => (
              <button
                className="digit-button"
                key={digit}
                style={{ color: colors[Number(digit)], "--drop-delay": `${index * 55}ms`, "--drop-x": `${((index * 47) % 150) - 75}px`, "--drop-rotate": `${((index * 29) % 100) - 50}deg`, "--rest-rotate": `${((index * 7) % 13) - 6}deg` } as CSSProperties}
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
              <div className="party-message">SUPER GEMACHT!</div>
              {Array.from({ length: 190 }, (_, index) => (
                <i className={index % 3 === 0 ? "confetti-star" : index % 3 === 1 ? "confetti-ribbon" : "confetti-piece"} key={index} style={{ left: `${(index * 37) % 100}%`, animationDelay: `${(index % 30) * 0.055}s`, backgroundColor: colors[index % colors.length], transform: `rotate(${index * 31}deg)` }} />
              ))}
              {Array.from({ length: 34 }, (_, index) => (
                <b className="party-sparkle" key={index} style={{ left: `${(index * 61 + 7) % 100}%`, top: `${(index * 43 + 9) % 92}%`, animationDelay: `${(index % 12) * 0.13}s` }}>✦</b>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
