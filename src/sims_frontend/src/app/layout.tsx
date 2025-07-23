import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose'; // For verifying the JWT
import "./globals.css";

import Navbar from "@/components/Navbar";
import FlowbiteProvider from "@/components/FlowbiteProvider";
import { User } from "@/types/user";

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


//const inter = Inter({ subsets: ['latin'] });

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret_jwt_key');


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    let user: User | null = null;
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt_token')?.value;

    if (token) {
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET, {
                algorithms: ['HS256'],
            });
            user = payload as unknown as User;
        } catch (error) {
            console.error("JWT verification failed in layout:", error);
        }
    }
    user = {
        id: "user123",
        email: "current.user@example.com",
        firstName: "Current",
        lastName: "User",
        schoolId: 1,
        createdAt: null,
        updatedAt: null,
        isAdmin: true
    };
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <FlowbiteProvider />
        <Navbar initialUser={user}/>
        {children}
      </body>
    </html>
  );
}
