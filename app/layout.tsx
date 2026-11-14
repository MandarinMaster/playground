import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Playground – Lernen macht Spaß",
  description: "Eine bunte Spielwelt zum Lernen, Entdecken und Knobeln.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
