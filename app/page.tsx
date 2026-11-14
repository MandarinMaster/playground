"use client";

const tiles = [
  { id: "01", symbol: "✦", className: "tile-pink" },
  { id: "02", symbol: "♡", className: "tile-violet" },
  { id: "03", symbol: "✿", className: "tile-rose" },
  { id: "04", symbol: "☾", className: "tile-lilac" },
];

export default function Home() {
  return (
    <main className="start-screen">
      <div className="tile-grid" aria-label="Startauswahl">
        {tiles.map((tile) => (
          <button className={`start-tile ${tile.className}`} key={tile.id} aria-label={`Kachel ${tile.id}`}>
            <span className="tile-symbol" aria-hidden="true">{tile.symbol}</span>
            <span className="tile-number">{tile.id}</span>
          </button>
        ))}
      </div>
    </main>
  );
}
