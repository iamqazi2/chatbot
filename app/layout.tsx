import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title:
    "Agile Requirements Chatbot - Gemini AI-Powered Requirements Elicitation",
  description:
    "Streamline your Agile requirements gathering with our Gemini AI-powered chatbot. Capture, clarify, and organize software requirements through natural conversation.",
  keywords:
    "agile, requirements, chatbot, AI, software development, requirements elicitation",
  authors: [{ name: "Agile Requirements Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
