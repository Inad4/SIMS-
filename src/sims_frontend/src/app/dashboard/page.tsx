'use client'

import React from 'react';
import DashboardContent from './dashboard';
import Link from 'next/link';
import { User } from '@/types'; // Updated import

const dummyAdminUser: User = {
    id: "admin_1",
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
    schoolId: 1,
    createdAt: null,
    updatedAt: null,
    isAdmin: true
};

const dummyRegularUser: User = {
    id: "user_abc_1",
    email: "user1@example.com",
    firstName: "Alice",
    lastName: "Smith",
    schoolId: 1,
    createdAt: null,
    updatedAt: null,
    isAdmin: false
};

export default function DashboardPage() {
    // You can switch between dummyAdminUser and dummyRegularUser to test
    const currentUser: User | null = dummyAdminUser;

    return <DashboardContent user={currentUser} />
}