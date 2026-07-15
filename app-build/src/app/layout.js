import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Axiom Weaver Terminal // Sector 14",
  description: "Reality Curator Dashboard — Compile Reality Reimagined. Stellar Hack: Vibe-a-Thon by Team Hatsoff.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={geistMono.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
