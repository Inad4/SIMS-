"use client";

import React from "react";
import DashboardContent from "./dashboard";
import Link from "next/link";
import { User } from "@/types/user";

const dummyAdminUser: User = {
  id: "admin_1",
  email: "admin@example.com",
  firstName: "Admin",
  lastName: "User",
  schoolId: 1,
  createdAt: null,
  updatedAt: null,
  isAdmin: true,
};

// const dummyRegularUser: User = {
//     id: "user_1",
//     email: "user@example.com",
//     firstName: "Regular",
//     lastName: "User",
//     schoolId: 1,
//     createdAt: null,
//     updatedAt: null,
//     isAdmin: false
// };

export default function DashboardPage() {
  const currentUser: User | null = dummyAdminUser;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-bold text-gray-900 dark:text-white"
        >
          SIMS
        </Link>
        <nav className="space-x-4 flex items-center">
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
          >
            Dashboard
          </Link>
          {currentUser && currentUser.isAdmin && (
            <>
              <Link
                href="/admin/requests"
                className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200"
              >
                Manage Requests
              </Link>
              <Link
                href="/admin/returns"
                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
              >
                Log Returns
              </Link>
            </>
          )}
          {currentUser ? (
            <span className="text-gray-700 dark:text-gray-300 ml-4">
              Welcome, {currentUser.firstName} {currentUser.lastName}
            </span>
          ) : (
            <Link
              href="/auth/login"
              className="text-gray-600 hover:underline ml-4"
            >
              Login
            </Link>
          )}
        </nav>
      </header>
      <main className="p-4">
        <DashboardContent user={currentUser} />
      </main>
    </div>
  );
}
