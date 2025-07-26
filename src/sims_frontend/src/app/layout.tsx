import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";

import Navbar from "@/components/Navbar";
import FlowbiteProvider from "@/components/FlowbiteProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SIMS",
  description: "School inventory management system",
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <FlowbiteProvider />
        <Navbar />
        <Suspense fallback={
                    <div className="text-center text-gray-600 dark:text-gray-400">Loading...</div>
                }>
          {children}
        </Suspense>
        
      </body>
    </html>
  );
}
