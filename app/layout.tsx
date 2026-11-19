import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Playground – Lernen macht Spaß",
  description: "Eine bunte Spielwelt zum Lernen, Entdecken und Knobeln.",
  icons: {
    icon: "/bilder/IMG_4058.jpeg",
    shortcut: "/bilder/IMG_4058.jpeg",
    apple: "/bilder/IMG_4058.jpeg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
