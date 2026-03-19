import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs"



const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Cardify — AI Flashcard Generator",
  description: "Generate, study, and share AI-powered flashcards. Built with Next.js, OpenRouter, and Firestore.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
