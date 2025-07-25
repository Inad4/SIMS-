'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { EquipmentRequest, User, School } from '@/types';
import { getConditionColor, login } from '@/utils/utils';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function PersonalBorrowingHistoryPage() {
    const router = useRouter();


    const [user, setUser] = useState<User>();
    const [borrowingHistory, setBorrowingHistory] = useState<EquipmentRequest[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);



    useEffect(() => {
        const fetchBorrowingHistory = async () => {
            setLoading(true);
            setError(null);

            const us = await login();
            if (!us){
                router.replace("/dashboard");
                return;
            }
            setUser(us);

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE}/api/School/${user?.schoolId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("jwt")}`
                    }
                });
                if (!res.ok){
                    setError("Failed to fetch school data");
                }
                const school: School= await res.json();

                if (!school.equipment){
                    setError("Currently your school doesn't have any requests");
                    return;
                }
                
                const userRequests: EquipmentRequest[] = [];
                for (const equipment of school.equipment){
                    for(const request of equipment.requests){
                        if (request.userId != user?.id) continue;
                        userRequests.push(request);
                    }
                }
                setBorrowingHistory(userRequests);

            } catch (err) {
                console.error("Failed to fetch borrowing history:", err);
                setError("Failed to load borrowing history. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchBorrowingHistory();
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <p className="text-gray-700 dark:text-gray-300">Loading your borrowing history...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 p-4">
                <p className="text-xl font-semibold mb-4">Error: {error}</p>
                <Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Go back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <section className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Borrowing History</h1>
                    <Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                        Back to Dashboard
                    </Link>
                </div>

                {borrowingHistory.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
                        <p className="text-gray-600 dark:text-gray-400 text-lg">You have no past borrowing requests.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {borrowingHistory.map((request) => (
                            <div key={request.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-4 pb-4 border-b dark:border-gray-700">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            Request ID: {request.id}
                                        </h2>
                                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                                            Requested On: {new Date(request.createdAt!).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getConditionColor(request.status)}`}>
                                        {request.status.replace(/_/g, ' ')}
                                    </span>
                                </div>

                                <div className="mb-4">
                                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                                        <span className="font-semibold">Requested Period:</span> {/*new Date(request.startDate).toLocaleDateString()*/"start date"} - {/*new Date(request.returnDate).toLocaleDateString()*/"End date"}
                                    </p>
                                    {request.approvedAt && (
                                        <p className="text-gray-700 dark:text-gray-300 mb-2">
                                            <span className="font-semibold">Checked Out On:</span> {new Date(request.approvedAt).toLocaleDateString()}
                                        </p>
                                    )}
                                    {request.returnedAt && (
                                        <p className="text-gray-700 dark:text-gray-300 mb-2">
                                            <span className="font-semibold">Returned On:</span> {new Date(request.returnedAt).toLocaleDateString()}
                                        </p>
                                    )}
                                    <p className="text-gray-700 dark:text-gray-300">
                                        <span className="font-semibold">Message:</span> {request.message}
                                    </p>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Requested Equipment:</h3>
                                <ul className="mb-4 space-y-2">
                                    {request.equipment && request.equipment.length > 0 ? (
                                        request.equipment.map(eq => (
                                            <li key={eq.id} className="flex items-center text-gray-700 dark:text-gray-300">
                                                <Image src={eq.pathToPhoto} alt={eq.name} className="w-8 h-8 rounded-full mr-3" />
                                                <span>{eq.name} (Serial: {eq.serialNumber})</span>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-gray-500 dark:text-gray-400">No equipment details available.</li>
                                    )}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}