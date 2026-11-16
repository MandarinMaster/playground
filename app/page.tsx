"use client";

import { useEffect, useState, type CSSProperties } from "react";

const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const prompts = [
  (digit: string) => `Zeigt mir die ${digit}!`,
  (digit: string) => `Welches ist die ${digit}?`,
  (digit: string) => `Wo siehst du die ${digit}?`,
];
const colors = ["#ff5ca8", "#7358e8", "#12a9a0", "#ff9b35", "#397fe8", "#e45c61", "#8d55c7", "#269b65", "#e17a25", "#3866b7"];

const letterPictures = [
  "Affe.jpg", "Ba\u0308r.jpg", "Chama\u0308leon.jpg", "Delfin.jpg", "Elefant.jpg",
  "Fuchs.jpg", "Giraffe.jpg", "Hund.jpg", "Igel.jpg", "Jaguar.jpg", "Katze.jpg",
  "Lo\u0308we.jpg", "Maus.jpg", "Nashorn.jpg", "Otter.jpg", "Papagei.jpg",
  "Qualle.jpg", "Reh.jpg", "Schaf.jpg", "Tiger.jpg", "Uhu.jpg", "Vogel.jpg",
  "Wal.jpg", "Xaver.jpg", "Yak.jpg", "Zebra.jpg",
];

const spellingWords = ["Mia", "Oma", "Opa", "Mama", "Papa", "Mimi", "Nina", "Tina", "Lama", "Hase", "Huhn", "Hund", "Katze", "Tiger", "Dino", "Lila", "Susi", "Lena"];

function shuffle<T,>(items: T[]) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function makeScatter() {
  const slots = shuffle(Array.from({ length: 10 }, (_, index) => index));
  return Object.fromEntries(digits.map((digit, index) => {
    const slot = slots[index];
    const column = slot % 5;
    const row = Math.floor(slot / 5);
    return [digit, {
      left: `${4 + column * 17.5 + (Math.random() * 9 - 4.5)}%`,
      top: `${8 + row * 40 + (Math.random() * 16 - 8)}%`,
    }];
  })) as Record<string, { left: string; top: string }>;
}

function imageLetter(filename: string) {
  return filename.normalize("NFC").charAt(0).toLocaleUpperCase("de-DE");
}

const lowercaseCoverPositions: Record<string, [number, number, number, number]> = {
  "Affe.jpg": [54, 22, 22, 15],
  "Bär.jpg": [54, 13, 23, 17],
  "Chamäleon.jpg": [53, 21, 22, 16],
  "Delfin.jpg": [54, 12, 23, 17],
  "Elefant.jpg": [55, 17, 23, 16],
  "Fuchs.jpg": [54, 12, 23, 17],
  "Giraffe.jpg": [53, 18, 24, 17],
  "Hund.jpg": [52, 13, 21, 17],
  "Igel.jpg": [51, 16, 18, 17],
  "Jaguar.jpg": [52, 16, 19, 17],
  "Katze.jpg": [55, 13, 20, 17],
  "Löwe.jpg": [59, 12, 18, 17],
  "Maus.jpg": [51, 17, 31, 17],
  "Nashorn.jpg": [54, 17, 22, 17],
  "Otter.jpg": [53, 17, 21, 17],
  "Papagei.jpg": [55, 14, 22, 18],
  "Qualle.jpg": [56, 18, 29, 23],
  "Reh.jpg": [55, 16, 19, 18],
  "Schaf.jpg": [55, 19, 19, 18],
  "Tiger.jpg": [59, 15, 20, 18],
  "Uhu.jpg": [54, 14, 22, 18],
  "Vogel.jpg": [54, 14, 22, 18],
  "Wal.jpg": [57, 18, 31, 19],
  "Xaver.jpg": [54, 14, 22, 18],
  "Yak.jpg": [54, 14, 22, 18],
  "Zebra.jpg": [49, 21, 23, 17],
};

function lowercaseCoverStyle(filename: string): CSSProperties {
  const [left, top, width, height] = lowercaseCoverPositions[filename] ?? [54, 14, 22, 18];
  return {
    "--cover-left": `${left}%`,
    "--cover-top": `${top}%`,
    "--cover-width": `${width}%`,
    "--cover-height": `${height}%`,
  } as CSSProperties;
}

function makeLetterRound(enabledLetters: string[], previousWord?: string) {
  const availablePictures = letterPictures.filter((file) => enabledLetters.includes(imageLetter(file)));
  const words = spellingWords.filter((item) => item !== previousWord && [...new Set(item.toLocaleUpperCase("de-DE").split(""))].every((letter) => enabledLetters.includes(letter)));
  if (!words.length || availablePictures.length < 2) return null;
  const word = shuffle(words)[0];
  const correctLetters = [...new Set(word.toLocaleUpperCase("de-DE").split(""))];
  const correctPictures = correctLetters.map((letter) => availablePictures.find((file) => imageLetter(file) === letter)).filter(Boolean) as string[];
  const distractors = shuffle(availablePictures.filter((file) => !correctLetters.includes(imageLetter(file)))).slice(0, Math.max(0, 6 - correctPictures.length));
  return { word, correctLetters, choices: shuffle([...correctPictures, ...distractors]) };
}

let sharedAudioContext: AudioContext | null = null;

function getAudioContext() {
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!sharedAudioContext || sharedAudioContext.state === "closed") sharedAudioContext = new AudioContextClass();
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
  } catch {}
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
  } catch {}
}

export default function Home() {
  const [playing, setPlaying] = useState(false);\n  const [showLibrary, setShowLibrary] = useState(false);\n  const [enabledLetters, setEnabledLetters] = useState<string[]>(letterPictures.map(imageLetter));
  const [gameMode, setGameMode] = useState<"numbers" | "letters">("numbers");
  const [layout, setLayout] = useState(digits);
  const [scatter, setScatter] = useState<Record<string, { left: string; top: string }>>(() => makeScatter());
  const [target, setTarget] = useState("5");
  const [celebrating, setCelebrating] = useState(false);
  const [message, setMessage] = useState("");
  const [roundKey, setRoundKey] = useState(0);
  const [letterRound, setLetterRound] = useState(() => makeLetterRound(letterPictures.map(imageLetter))!);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [wrongLetter, setWrongLetter] = useState<string | null>(null);

  function speak(text: string) {
    if (!( "speechSynthesis" in window)) return;
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

  function startNumberGame() {
    setGameMode("numbers");
    setLayout(shuffle(digits));
    setScatter(makeScatter());
    setRoundKey((key) => key + 1);
    setPlaying(true);
    setCelebrating(false);
    setMessage("Pass gut auf!");
    window.setTimeout(() => askQuestion(), 450);
  }

  function startLetterGame() {
    const next = makeLetterRound(enabledLetters);
    if (!next) {
      setShowLibrary(true);
      return;
    }
    setLetterRound(next);
    setSelectedLetters([]);
    setWrongLetter(null);
    setCelebrating(false);
    setGameMode("letters");
    setPlaying(true);
    const phrase = `Wie schreibt man ${next.word}?`;
    setMessage(phrase);
    window.setTimeout(() => speak(phrase), 180);
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
        setScatter(makeScatter());
        setRoundKey((key) => key + 1);
        askQuestion();
      }, 4700);
    } else {
      setMessage("Huch, das war sie nicht. Versuch's nochmal!");
      playTone([190, 145], 0.16, "triangle");
      window.setTimeout(() => setMessage(prompts[Math.floor(Math.random() * prompts.length)](target)), 1100);
    }
  }

  function chooseLetterPicture(filename: string) {
    if (celebrating || selectedLetters.includes(filename)) return;
    const letter = imageLetter(filename);
    if (!letterRound.correctLetters.includes(letter)) {
      setWrongLetter(filename);
      playTone([190, 145], 0.16, "triangle");
      window.setTimeout(() => setWrongLetter((current) => current === filename ? null : current), 850);
      return;
    }
    const nextSelected = [...selectedLetters, filename];
    setSelectedLetters(nextSelected);
    if (nextSelected.length === letterRound.correctLetters.length) {
      setCelebrating(true);
      setMessage("Richtig geschrieben! 🎉");
      playCelebration();
      window.setTimeout(() => {
        const next = makeLetterRound(enabledLetters, letterRound.word) ?? makeLetterRound(enabledLetters);
        if (!next) {
          setPlaying(false);
          setShowLibrary(true);
          return;
        }
        setLetterRound(next);
        setSelectedLetters([]);
        setWrongLetter(null);
        setCelebrating(false);
        setMessage(`Wie schreibt man ${next.word}?`);
        speak(`Wie schreibt man ${next.word}?`);
      }, 3800);
    }
  }

  function goHome() {
    setPlaying(false);
    setCelebrating(false);
    setWrongLetter(null);
    window.speechSynthesis?.cancel();
  }

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("playground-enabled-letters");
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setEnabledLetters(parsed.filter((letter): letter is string =>
            typeof letter === "string" && letterPictures.some((file) => imageLetter(file) === letter)
          ));
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem("playground-enabled-letters", JSON.stringify(enabledLetters)); } catch {}
  }, [enabledLetters]);

  function toggleLibraryLetter(letter: string) {
    setEnabledLetters((current) => current.includes(letter)
      ? current.filter((item) => item !== letter)
      : [...current, letter]);
  }

  useEffect(() => () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  return (
    <main className="start-screen">
      {!playing ? (showLibrary ? (
        <section className="library-screen">
          <div className="game-toolbar">
            <button className="game-back" onClick={() => setShowLibrary(false)}>← Zurück</button>
            <span className="game-label">BUCHSTABEN-BIBLIOTHEK</span>
          </div>
          <h1 className="game-prompt">Deine Buchstaben</h1>
          <p className="game-hint">Wähle die Tierbilder aus, deren Buchstaben im Spiel vorkommen dürfen.</p>
          <div className="library-grid">
            {letterPictures.map((filename) => {
              const letter = imageLetter(filename);
              const active = enabledLetters.includes(letter);
              return <button key={filename} className={`library-card${active ? " active" : ""}`} onClick={() => toggleLibraryLetter(letter)} aria-pressed={active} aria-label={`${letter} ${active ? "deaktivieren" : "aktivieren"}`}>
                <span className="library-image-wrap" style={lowercaseCoverStyle(filename)}>
                  <img src={`/bilder/${encodeURIComponent(filename)}`} alt={filename.replace(/\\.jpg$/i, "")} />
                  <span className="lowercase-cover" aria-hidden="true" />
                </span>
                <span className="library-letter">{letter}</span>
                <span className="library-check">{active ? "✓" : "+"}</span>
              </button>;
            })}
          </div>
          <div className="library-footer">
            <span>{enabledLetters.length} von 26 Buchstaben ausgewählt</span>
            <button className="library-done" onClick={() => setShowLibrary(false)}>Fertig</button>
          </div>
        </section>
      ) : (
        <div className="tile-grid" aria-label="Startauswahl">
          <button className="start-tile tile-pink" onClick={startNumberGame} aria-label="Zahlen-Spiel starten">
            <span className="tile-symbol" aria-hidden="true">✦</span>
            <span className="tile-number">Zahlen</span>
          </button>
          <button className="start-tile tile-violet" onClick={startLetterGame} aria-label="Buchstaben-Spiel starten">
            <span className="tile-symbol" aria-hidden="true">♡</span>
            <span className="tile-number">Buchstaben</span>
          </button>
          <button className="start-tile tile-rose" onClick={() => setShowLibrary(true)} aria-label="Buchstaben-Bibliothek öffnen"><span className="tile-symbol">▤</span><span className="tile-number">Bibliothek</span></button>
          <div className="start-tile tile-lilac" aria-hidden="true"><span className="tile-symbol">☾</span><span className="tile-number">04</span></div>
        </div>
      )) : gameMode === "numbers" ? (
        <section className="number-game">
          <div className="game-toolbar">
            <button className="game-back" onClick={goHome}>← Zurück</button>
            <span className="game-label">ZAHLEN-SPIEL</span>
          </div>
          <h1 className="game-prompt" aria-live="polite">{message}</h1>
          <p className="game-hint">Tippe auf die richtige Zahl.</p>
          <div className="digit-board" key={roundKey}>
            {layout.map((digit, index) => (
              <button className="digit-button" key={digit}
                style={{ color: colors[Number(digit)], left: scatter[digit]?.left, top: scatter[digit]?.top, "--drop-delay": `${index * 55}ms`, "--drop-x": `${((index * 47) % 150) - 75}px`, "--drop-rotate": `${((index * 29) % 100) - 50}deg`, "--rest-rotate": `${((index * 7) % 13) - 6}deg` } as CSSProperties}
                onClick={() => chooseDigit(digit)} disabled={celebrating} aria-label={`Zahl ${digit}`}>{digit}</button>
            ))}
          </div>
          {celebrating && <div className="party-overlay" aria-hidden="true">
            <div className="party-message">SUPER GEMACHT!</div>
            {Array.from({ length: 190 }, (_, index) => <i className={index % 3 === 0 ? "confetti-star" : index % 3 === 1 ? "confetti-ribbon" : "confetti-piece"} key={index} style={{ left: `${(index * 37) % 100}%`, animationDelay: `${(index % 30) * 0.055}s`, backgroundColor: colors[index % colors.length], transform: `rotate(${index * 31}deg)` }} />)}
            {Array.from({ length: 34 }, (_, index) => <b className="party-sparkle" key={index} style={{ left: `${(index * 61 + 7) % 100}%`, top: `${(index * 43 + 9) % 92}%`, animationDelay: `${(index % 12) * 0.13}s` }}>✦</b>)}
          </div>}
        </section>
      ) : (
        <section className="number-game letter-game">
          <div className="game-toolbar">
            <button className="game-back" onClick={goHome}>← Zurück</button>
            <span className="game-label">BUCHSTABEN-SPIEL</span>
          </div>
          <h1 className="game-prompt" aria-live="polite">{message}</h1>
          <p className="game-hint">Finde die passenden Anfangsbuchstaben auf den Tierbildern.</p>
          <div className="letter-board">
            {letterRound.choices.map((filename) => {
              const letter = imageLetter(filename);
              const selected = selectedLetters.includes(filename);
              const wrong = wrongLetter === filename;
              return <button key={filename} className={`picture-tile${selected ? " selected" : ""}${wrong ? " wrong" : ""}`}
                onClick={() => chooseLetterPicture(filename)} disabled={selected || celebrating}
                aria-label={`Bild mit dem Buchstaben ${letter}`}>
                <span className="picture-image-wrap" style={lowercaseCoverStyle(filename)}>
                  <img
                    src={`/bilder/${encodeURIComponent(filename)}`}
                    alt={`Tierbild zum Buchstaben ${letter}`}
                    onLoad={(event) => {
                      const img = event.currentTarget;
                      try {
                        const canvas = document.createElement("canvas");
                        canvas.width = 1;
                        canvas.height = 1;
                        const context = canvas.getContext("2d", { willReadFrequently: true });
                        if (!context) return;
                        context.drawImage(img, Math.floor(img.naturalWidth * 0.94), Math.floor(img.naturalHeight * 0.1), 1, 1, 0, 0, 1, 1);
                        const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
                        img.parentElement?.style.setProperty("--letter-cover", `rgb(${red}, ${green}, ${blue})`);
                      } catch {}
                    }}
                  />
                  <span className="lowercase-cover" aria-hidden="true" />
                </span>
              </button>;
            })}
          </div>
          <p className="letter-progress">{selectedLetters.length} von {letterRound.correctLetters.length} Buchstaben gefunden</p>
          {celebrating && <div className="party-overlay" aria-hidden="true">
            <div className="party-message">SUPER GEMACHT!</div>
            {Array.from({ length: 190 }, (_, index) => <i className={index % 3 === 0 ? "confetti-star" : index % 3 === 1 ? "confetti-ribbon" : "confetti-piece"} key={index} style={{ left: `${(index * 37) % 100}%`, animationDelay: `${(index % 30) * 0.055}s`, backgroundColor: colors[index % colors.length], transform: `rotate(${index * 31}deg)` }} />)}
            {Array.from({ length: 34 }, (_, index) => <b className="party-sparkle" key={index} style={{ left: `${(index * 61 + 7) % 100}%`, top: `${(index * 43 + 9) % 92}%`, animationDelay: `${(index % 12) * 0.13}s` }}>✦</b>)}
          </div>}
        </section>
      )}
    </main>
  );
}
