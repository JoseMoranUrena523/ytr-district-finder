import type { Metadata } from "next";
import {
  Source_Serif_4 as sourceSerifFont,
  IBM_Plex_Mono as plexMonoFont,
} from "next/font/google";
import "./globals.css";

const sourceSerif = sourceSerifFont({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const plexMono = plexMonoFont({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Find Your Districts | Yonkers Teen Republicans",
  description:
    "Look up your U.S. House, NY State Senate, NY State Assembly, Westchester County Legislature, and Yonkers City Council districts by address.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sourceSerif.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
