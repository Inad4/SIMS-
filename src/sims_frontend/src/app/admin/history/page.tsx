'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { EquipmentRequest, RequestStatus, School, User } from '@/types';
import { getConditionColor, login } from '@/utils/utils';
import Image from 'next/image';
import { useRouter } from 'next/router';

export default function AdminBorrowingHistoryPage() {

    const router = useRouter();
    const [user, setUser] = useState<User>();
    const [allRequests, setAllRequests] = useState<EquipmentRequest[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<RequestStatus | ''>('');
    const [filterUserEmail, setFilterUserEmail] = useState<string>('');


    useEffect(() => {
        
        const fetchAllRequests = async () => {
            setLoading(true);
            setError(null);

            const us = await login();
            if (!us || !us.isAdmin){
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
                
                const schoolRequests: EquipmentRequest[] = [];
                for (const equipment of school.equipment){
                    for(const request of equipment.requests){
                        schoolRequests.push(request);
                    }
                }
                setAllRequests(schoolRequests);
            } catch (err) {
                console.error("Failed to fetch all requests:", err);
                setError("Failed to load all requests. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllRequests();
    }, []);

    const filteredRequests = useMemo(() => {
        let currentFilteredList = allRequests;

        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            currentFilteredList = currentFilteredList.filter(request =>
                request.message.toLowerCase().includes(lowerCaseSearchTerm) ||
                request.equipment.some(eq =>
                    eq.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                    eq.serialNumber.toLowerCase().includes(lowerCaseSearchTerm)
                ) ||
                request.user.firstName.toLowerCase().includes(lowerCaseSearchTerm) ||
                request.user.lastName.toLowerCase().includes(lowerCaseSearchTerm)
            );
        }

        if (filterStatus) {
            currentFilteredList = currentFilteredList.filter(request => request.status === filterStatus);
        }

        if (filterUserEmail) {
            currentFilteredList = currentFilteredList.filter(request =>
                request.user.email.toLowerCase().includes(filterUserEmail.toLowerCase())
            );
        }

        return currentFilteredList;
    }, [allRequests, searchTerm, filterStatus, filterUserEmail]);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, []);

    const handleStatusFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterStatus(e.target.value as RequestStatus | '');
    }, []);

    const handleUserEmailFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFilterUserEmail(e.target.value);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <p className="text-gray-700 dark:text-gray-300">Loading all borrowing history...</p>
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
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Borrowing History</h1>
                    <Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                        Back to Dashboard
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Filters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="search" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Search (Message, Equipment, User Name)</label>
                            <input
                                type="text"
                                id="search"
                                placeholder="Search all requests..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="statusFilter" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Filter by Status</label>
                            <select
                                id="statusFilter"
                                value={filterStatus}
                                onChange={handleStatusFilterChange}
                                className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            >
                                <option value="">All Statuses</option>
                                {Object.values(RequestStatus).map(status => (
                                    <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="userEmailFilter" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Filter by User Email</label>
                            <input
                                type="email"
                                id="userEmailFilter"
                                placeholder="Filter by user email..."
                                value={filterUserEmail}
                                onChange={handleUserEmailFilterChange}
                                className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {filteredRequests.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
                        <p className="text-gray-600 dark:text-gray-400 text-lg">No requests found matching your criteria.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredRequests.map((request) => (
                            <div key={request.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-4 pb-4 border-b dark:border-gray-700">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            Request ID: {request.id}
                                        </h2>
                                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                                            Requested by: <span className="font-medium">{request.user.firstName} {request.user.lastName} ({request.user.email})</span>
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getConditionColor(request.status)}`}>
                                        {request.status.replace(/_/g, ' ')}
                                    </span>
                                </div>

                                <div className="mb-4">
                                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                                        <span className="font-semibold">Requested Period:</span> {/*new Date(request.startDate).toLocaleDateString()*/"Start date needs to be added"} - {/*new Date(request.returnDate).toLocaleDateString()*/"Start date needs to be added"}
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
                                                <span>{eq.name} (Serial: {eq.serialNumber}) - <span className={`${getConditionColor(eq.status)} px-2 py-0.5 rounded-full text-xs`}>{eq.status.replace(/_/g, ' ')}</span></span>
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