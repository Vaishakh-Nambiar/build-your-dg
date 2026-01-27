import type { Metadata } from "next";
import { Inter, Newsreader, Caveat } from "next/font/google"; // Added Caveat
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Digital Garden",
  description: "A digital garden built with Next.js, Tailwind, and Framer Motion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${newsreader.variable} ${caveat.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
