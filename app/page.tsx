"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

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
  "Affe.jpg": [51.5, 20.5, 24, 17],
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

function germanNumber(value: number): string {
  const ones = ["null", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun"];
  const teens = ["zehn", "elf", "zwölf", "dreizehn", "vierzehn", "fünfzehn", "sechzehn", "siebzehn", "achtzehn", "neunzehn"];
  const tens = ["", "", "zwanzig", "dreißig", "vierzig", "fünfzig"];
  if (value < 10) return ones[value];
  if (value < 20) return teens[value - 10];
  const unit = value % 10;
  return unit === 0 ? tens[Math.floor(value / 10)] : `${ones[unit] === "eins" ? "ein" : ones[unit]}und${tens[Math.floor(value / 10)]}`;
}

function germanClockAnnouncement(totalMinutes: number): string {
  const minute = totalMinutes % 60;
  const hour = Math.floor(totalMinutes / 60) % 12 || 12;
  const nextHour = hour === 12 ? 1 : hour + 1;
  const hourWord = (n: number) => n === 1 ? "eins" : germanNumber(n);
  const halfWord = hourWord(nextHour);
  if (minute === 0) return `${hourWord(hour)} Uhr`;
  if (minute === 15) return `viertel nach ${hourWord(hour)}`;
  if (minute === 30) return `halb ${halfWord}`;
  if (minute === 45) return `viertel vor ${hourWord(nextHour)}`;
  if (minute <= 20) return `${germanNumber(minute)} Minuten nach ${hourWord(hour)}`;
  if (minute < 30) return `${germanNumber(30 - minute)} Minuten vor halb ${halfWord}`;
  if (minute < 45) return `${germanNumber(minute - 30)} Minuten nach halb ${halfWord}`;
  return `${germanNumber(60 - minute)} Minuten vor ${hourWord(nextHour)}`;
}

function clockPointerAngle(svg: SVGSVGElement, clientX: number, clientY: number) {
  const matrix = svg.getScreenCTM();
  if (!matrix) return 0;
  const point = svg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  const local = point.matrixTransform(matrix.inverse());
  const angle = Math.atan2(local.x - 200, 200 - local.y) * 180 / Math.PI;
  return (angle + 360) % 360;
}

function makeLetterRound(enabledLetters: string[], previousWord?: string) {
  const availablePictures = letterPictures.filter((file) => enabledLetters.includes(imageLetter(file)));
  if (!availablePictures.length) return null;
  const choices = shuffle(availablePictures.filter((file) => imageLetter(file) !== previousWord));
  const filename = choices[0] ?? shuffle(availablePictures)[0];
  const letter = imageLetter(filename);
  return { word: letter, correctLetters: [letter], choices: [filename] };
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
  const [playing, setPlaying] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showClock, setShowClock] = useState(false);
  const [clockMinutes, setClockMinutes] = useState(180);
  const clockDragRef = useRef<{ angle: number; minutes: number } | null>(null);
  const [showHomeSettings, setShowHomeSettings] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [allAvailableVoices, setAllAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState("");
  const [thorstenStatus, setThorstenStatus] = useState("Noch nicht geladen. Beim ersten Einsatz werden Sprachmodell und Rechenkern heruntergeladen.");
  const [showDice, setShowDice] = useState(false);
  const [showDiceSettings, setShowDiceSettings] = useState(false);
  const [diceCount, setDiceCount] = useState(2);
  const [diceValues, setDiceValues] = useState<number[]>([1, 1]);
  const [diceRollKey, setDiceRollKey] = useState(0);
  const [showLowercaseInLibrary, setShowLowercaseInLibrary] = useState(false);
  const [enabledLetters, setEnabledLetters] = useState<string[]>(letterPictures.map(imageLetter));
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

  function rollDice() {
    setDiceValues(Array.from({ length: diceCount }, () => 1 + Math.floor(Math.random() * 6)));
    setDiceRollKey((key) => key + 1);
  }

  async function speak(text: string) {
    if (selectedVoiceURI === "piper:thorsten") {
      try {
        setThorstenStatus("Thorsten wird vorbereitet …");
        window.speechSynthesis?.cancel();
        const piper = await import("@realtimex/piper-tts-web");
        const wav = await piper.predict({ text, voiceId: "de_DE-thorsten-medium" });
        const audioUrl = URL.createObjectURL(wav);
        const audio = new Audio(audioUrl);
        audio.onended = () => URL.revokeObjectURL(audioUrl);
        audio.onerror = () => { URL.revokeObjectURL(audioUrl); setThorstenStatus("Die Wiedergabe ist fehlgeschlagen."); };
        await audio.play();
        setThorstenStatus("Thorsten ist bereit.");
      } catch (error) {
        console.error("Thorsten TTS:", error);
        setThorstenStatus("Thorsten konnte nicht geladen werden. Bitte Internetverbindung prüfen und erneut versuchen.");
      }
      return;
    }
    if (!( "speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE";
    const selectedVoice = window.speechSynthesis.getVoices().find((voice) => voice.voiceURI === selectedVoiceURI);
    if (selectedVoice) utterance.voice = selectedVoice;
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
    const phrase = `Das ist der Buchstabe ${next.word}.`;
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
    if (celebrating) return;
    const next = makeLetterRound(enabledLetters, imageLetter(filename)) ?? makeLetterRound(enabledLetters);
    if (!next) {
      setPlaying(false);
      setShowLibrary(true);
      return;
    }
    setLetterRound(next);
    setSelectedLetters([]);
    setWrongLetter(null);
    setMessage(`Das ist der Buchstabe ${next.word}.`);
    speak(`Das ist der Buchstabe ${next.word}.`);
  }

  function goHome() {
    setPlaying(false);
    setCelebrating(false);
    setWrongLetter(null);
    window.speechSynthesis?.cancel();
  }

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const refreshVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      setAllAvailableVoices(allVoices);
      const germanVoices = allVoices.filter((voice) => voice.lang.toLowerCase().startsWith("de")).sort((a, b) => a.name.localeCompare(b.name, "de"));
      setAvailableVoices(germanVoices);
      const savedVoice = window.localStorage.getItem("playground-speech-voice");
      if (savedVoice === "piper:thorsten") setSelectedVoiceURI(savedVoice);
      else if (savedVoice && germanVoices.some((voice) => voice.voiceURI === savedVoice)) setSelectedVoiceURI(savedVoice);
      else if (!selectedVoiceURI && germanVoices.length) {
        const preferred = germanVoices.find((voice) => /natural|online|google|katja|anna/i.test(voice.name)) ?? germanVoices[0];
        setSelectedVoiceURI(preferred.voiceURI);
      }
    };
    refreshVoices();
    window.speechSynthesis.addEventListener("voiceschanged", refreshVoices);
    window.addEventListener("focus", refreshVoices);
    document.addEventListener("visibilitychange", refreshVoices);
    const retryOne = window.setTimeout(refreshVoices, 500);
    const retryTwo = window.setTimeout(refreshVoices, 1500);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", refreshVoices);
      window.removeEventListener("focus", refreshVoices);
      document.removeEventListener("visibilitychange", refreshVoices);
      window.clearTimeout(retryOne);
      window.clearTimeout(retryTwo);
    };
  }, [selectedVoiceURI]);

  useEffect(() => {
    if (selectedVoiceURI) { try { window.localStorage.setItem("playground-speech-voice", selectedVoiceURI); } catch {} }
  }, [selectedVoiceURI]);

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
      {showLibrary ? (
        <section className={`library-screen${showLowercaseInLibrary ? " show-lowercase" : ""}`}>
          <div className="game-toolbar"><button className="game-back" onClick={() => setShowLibrary(false)}>← Zurück</button><span className="game-label">BUCHSTABEN-EINSTELLUNGEN</span></div>
          <h1 className="game-prompt">Buchstaben verwalten</h1><p className="game-hint">Lege fest, welche Buchstaben im Buchstabenspiel vorkommen dürfen.</p>
          <div className="library-display-control"><button className="library-toggle-lowercase" onClick={() => setShowLowercaseInLibrary(v => !v)} aria-pressed={showLowercaseInLibrary}>{showLowercaseInLibrary ? "Kleinbuchstaben ausblenden" : "Kleinbuchstaben einblenden"}</button></div>
          <div className="library-grid">{letterPictures.map(filename => { const letter = imageLetter(filename); const active = enabledLetters.includes(letter); return <button key={filename} className={`library-card${active ? " active" : ""}`} onClick={() => toggleLibraryLetter(letter)} aria-pressed={active}><span className="library-image-wrap" style={lowercaseCoverStyle(filename)}><img src={`/bilder/${encodeURIComponent(filename)}`} alt={filename.replace(/\.jpg$/i, "")} /><span className="lowercase-cover" aria-hidden="true" /></span><span className="library-letter">{letter}</span><span className="library-check">{active ? "✓" : "+"}</span></button>; })}</div>
          <div className="library-footer"><span>{enabledLetters.length} von 26 Buchstaben ausgewählt</span><button className="library-done" onClick={() => setShowLibrary(false)}>Fertig</button></div>
        </section>
      ) : !playing ? (showHomeSettings && !showLibrary && !showDice ? (
        <section className="home-settings-screen">
          <div className="game-toolbar"><button className="game-back" onClick={() => setShowHomeSettings(false)}>← Zurück</button><span className="game-label">APP-EINSTELLUNGEN</span></div>
          <h1 className="game-prompt">Sprechstimme</h1>
          <p className="game-hint">Wähle eine deutsche Stimme und höre sie dir an.</p>
          {availableVoices.length ? (
            <>
              <select className="voice-select" aria-label="Deutsche Sprechstimme" value={selectedVoiceURI} onChange={(event) => setSelectedVoiceURI(event.target.value)}>
                <option value="piper:thorsten">Thorsten (Piper · neural, lokal)</option>
                {availableVoices.map((voice) => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} ({voice.lang} · {voice.localService ? "lokal" : "Netzwerk"}{voice.default ? " · Standard" : ""} · {voice.voiceURI.slice(-18)})</option>)}
              </select>
              <button className="voice-preview-button" onClick={() => void speak("Hallo! Ich freue mich, mit dir zu lernen. Wie schreibt man Katze?")}>Stimme anhören</button>
              {selectedVoiceURI === "piper:thorsten" && <p className="voice-note" aria-live="polite">{thorstenStatus}</p> }
            </>
          ) : <><select className="voice-select" aria-label="Deutsche Sprechstimme" value={selectedVoiceURI} onChange={(event) => setSelectedVoiceURI(event.target.value)}><option value="piper:thorsten">Thorsten (Piper · neural, lokal)</option></select><button className="voice-preview-button" onClick={() => void speak("Hallo! Ich freue mich, mit dir zu lernen. Wie schreibt man Katze?")}>Stimme anhören</button><p className="voice-note">{thorstenStatus}</p><p className="voice-unavailable">Es wurden keine deutschen Gerätestimmen gefunden.</p></> }
          <section className="voice-diagnostics">
            <h2>Erkannte Gerätestimmen</h2>
            <p>Insgesamt: {allAvailableVoices.length} · Deutsch: {availableVoices.length}</p>
            <button className="voice-preview-button" onClick={() => {
              const voices = window.speechSynthesis.getVoices();
              setAllAvailableVoices(voices);
              setAvailableVoices(voices.filter((voice) => voice.lang.toLowerCase().startsWith("de")).sort((a, b) => a.name.localeCompare(b.name, "de")));
            }}>Stimmen neu laden</button>
            {allAvailableVoices.length ? <ul className="voice-diagnostics-list">
              {allAvailableVoices.map((voice) => <li key={voice.voiceURI}>
                <strong>{voice.name}</strong> — {voice.lang}
                <small>{voice.voiceURI} · {voice.localService ? "lokal" : "Netzwerk"}{voice.default ? " · Standardsstimme" : ""}</small>
              </li>)}
            </ul> : <p>Noch keine Stimmen vom Browser gemeldet.</p>}
          </section>
          <p className="voice-note">Die verfügbaren Stimmen hängen von deinem Gerät und Browser ab. Deine Auswahl wird auf diesem Gerät gespeichert.</p>
        </section>
      ) : showClock ? (
        <section className="clock-game">
          <div className="game-toolbar"><button className="game-back" onClick={() => setShowClock(false)}>← Zurück</button><span className="game-label">UHRZEIT-SPIEL</span></div>
          <h1 className="game-prompt">Wie spät ist es?</h1><p className="game-hint">Ziehe den Minutenzeiger auf die gewünschte Uhrzeit.</p>
          <svg className="analog-clock" viewBox="0 0 400 400" role="slider" aria-label="Analoguhr: Minutenzeiger verschieben" aria-valuemin={0} aria-valuemax={719} aria-valuenow={clockMinutes} onPointerMove={(event) => { const drag = clockDragRef.current; if (!drag || !event.currentTarget.hasPointerCapture(event.pointerId)) return; const angle = clockPointerAngle(event.currentTarget, event.clientX, event.clientY); let delta = angle - drag.angle; if (delta > 180) delta -= 360; if (delta < -180) delta += 360; drag.angle = angle; drag.minutes += delta / 6; setClockMinutes(((Math.round(drag.minutes) % 720) + 720) % 720); }} onPointerUp={(event) => { clockDragRef.current = null; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }} onPointerCancel={() => { clockDragRef.current = null; }}>
            <defs><linearGradient id="clockFaceGradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fffef7" /><stop offset="100%" stopColor="#e9f8ff" /></linearGradient></defs><circle cx="200" cy="200" r="190" className="clock-face" /><circle cx="200" cy="200" r="178" className="clock-inner-ring" />
            {Array.from({length:60},(_,i)=><line key={i} x1="200" y1={i%5===0?24:29} x2="200" y2={i%5===0?43:36} transform={`rotate(${i*6} 200 200)`} className={i%5===0?"clock-hour-tick":"clock-minute-tick"} />)}
            {Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;const x=200+145*Math.sin(a);const y=200-145*Math.cos(a);return <g key={i}><circle cx={x} cy={y} r="22" className="clock-number-badge" /><text x={x} y={y+9} className="clock-number">{i===0?12:i}</text></g>;})}
            <line x1="200" y1="200" x2="200" y2="92" className="clock-hour-hand" transform={`rotate(${(clockMinutes % 720) * 0.5} 200 200)`} />
            <line x1="200" y1="200" x2="200" y2="48" stroke="transparent" strokeWidth="38" strokeLinecap="round" transform={`rotate(${clockMinutes%60*6} 200 200)`} style={{ pointerEvents: "stroke", cursor: "grab" }} onPointerDown={(event) => { event.stopPropagation(); const svg = event.currentTarget.ownerSVGElement; if (!svg) return; const angle = clockPointerAngle(svg, event.clientX, event.clientY); clockDragRef.current = { angle, minutes: clockMinutes }; svg.setPointerCapture(event.pointerId); }} />
            <line x1="200" y1="218" x2="200" y2="48" className="clock-minute-hand" transform={`rotate(${clockMinutes%60*6} 200 200)`} style={{ pointerEvents: "none" }} />
            <circle cx="200" cy="200" r="11" className="clock-pin" />
          </svg>
          <div className="clock-readout">{String(Math.floor(clockMinutes/60)%12||12).padStart(2,"0")}:{String(clockMinutes%60).padStart(2,"0")} Uhr</div>
          <button className="clock-speak-button" onClick={() => { void speak(germanClockAnnouncement(clockMinutes)); }}>Uhrzeit vorlesen</button>
        </section>
      ) : showDice ? (
        <section className="dice-game">
          <div className="game-toolbar">
            <button className="game-back" onClick={() => { setShowDice(false); setShowDiceSettings(false); }}>← Zurück</button>
            <button className="dice-settings-button" onClick={() => setShowDiceSettings((shown) => !shown)}>{showDiceSettings ? "Spiel" : "Einstellungen"}</button>
          </div>
          {showDiceSettings ? (
            <div className="dice-settings-panel">
              <h1 className="game-prompt">Einstellungen</h1>
              <p className="game-hint">Wie viele Würfel möchtest du verwenden?</p>
              <div className="dice-count-control" role="group" aria-label="Anzahl der Würfel">
                <div className="dice-count-options">
                  {[1, 2, 3, 4, 5, 6].map((count) => <button key={count} type="button" className={`dice-count-option${diceCount === count ? " active" : ""}`} aria-pressed={diceCount === count} onClick={() => { setDiceCount(count); setDiceValues(Array.from({ length: count }, () => 1)); }}>{count}</button>)}
                </div>
              </div>
              <button className="dice-settings-done" onClick={() => setShowDiceSettings(false)}>Fertig</button>
            </div>
          ) : (
            <>
              <div className={`dice-pair dice-count-${diceCount}`} aria-live="polite" aria-label={"Gewürfelt: " + diceValues.join(", ")}>
                {diceValues.map((value, index) => <div className="die" key={diceRollKey + "-" + index} style={{ animationDelay: (index * 90) + "ms" }} aria-label={value + " Augen"}><span className="die-face">{Array.from({ length: 9 }, (_, pip) => <i className={"die-pip" + ([[], [4], [0, 8], [0, 4, 8], [0, 2, 6, 8], [0, 2, 4, 6, 8], [0, 2, 3, 5, 6, 8]][value].includes(pip) ? " visible" : "")} key={pip} />)}</span></div>)}
              </div>
              <button className="roll-button" onClick={rollDice}>Würfeln</button>
            </>
          )}
        </section>
      ) : (
        <div className="home-screen">
          <button className="home-settings-button" onClick={() => setShowHomeSettings(true)}>Einstellungen</button>
          <div className="tile-grid" aria-label="Startauswahl">
          <button className="start-tile tile-pink" onClick={startNumberGame} aria-label="Zahlen-Spiel starten">
            <span className="tile-symbol" aria-hidden="true">✦</span>
            <span className="tile-number">Zahlen</span>
          </button>
          <button className="start-tile tile-violet" onClick={startLetterGame} aria-label="Buchstaben-Spiel starten">
            <span className="tile-symbol" aria-hidden="true">♡</span>
            <span className="tile-number">Buchstaben</span>
          </button>
          <button className="start-tile tile-rose" onClick={() => { setClockMinutes(180); setShowClock(true); }} aria-label="Uhrzeit-Spiel starten"><span className="tile-symbol">◷</span><span className="tile-number">Uhrzeit</span></button>
          <button className="start-tile tile-lilac" onClick={() => { setDiceValues([1, 1]); setShowDice(true); }} aria-label="Würfel öffnen"><span className="tile-symbol">⚄</span><span className="tile-number">Würfeln</span></button>
          </div>
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
            <button className="dice-settings-button" onClick={() => setShowLibrary(true)}>Einstellungen</button>
          </div>
          <h1 className="game-prompt" aria-live="polite">{message}</h1>
          <p className="game-hint">Schau dir den Buchstaben an. Tippe darauf für den nächsten.</p>
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
