'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { EquipmentRequest, RequestStatus, EquipmentStatus, School, User } from '@/types';
import { getConditionColor, isStringANumber } from '@/utils/utils';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { login } from '@/utils/utils';

export default function AdminManageRequestsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [user, setUser] = useState<User>();
    const [pendingRequests, setPendingRequests] = useState<EquipmentRequest[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');


    useEffect(() => {
        const fetchPendingRequests = async () => {
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
                const school: School = await res.json();
                if (!school.equipment){
                    setError("Currently your school doesn't have any requests");
                    return;
                }
                
                const pendingRequestsFetched: EquipmentRequest[] = [];
                for (const equipment of school.equipment){
                    if (equipment.status != EquipmentStatus.AVAILABLE) continue;
                    for(const request of equipment.requests){
                        if (request.status == RequestStatus.PENDING) pendingRequestsFetched.push(request);
                    }
                }
                
                setPendingRequests(pendingRequestsFetched);
            } catch (err) {
                console.error("Failed to fetch pending requests:", err);
                setError("Failed to load requests. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchPendingRequests();
    });

    const filteredRequests = useMemo(() => {
        if (!searchTerm) {
            return pendingRequests;
        }
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return pendingRequests.filter(request =>
            request.user.firstName.toLowerCase().includes(lowerCaseSearchTerm) ||
            request.user.lastName.toLowerCase().includes(lowerCaseSearchTerm) ||
            request.user.email.toLowerCase().includes(lowerCaseSearchTerm) ||
            request.equipment.some(eq => eq.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
            request.message.toLowerCase().includes(lowerCaseSearchTerm)
        );
    }, [pendingRequests, searchTerm]);

    const handleAction = useCallback(async (requestId: number, action: 'approve' | 'reject') => {
        const requestToUpdate = pendingRequests.find(req => req.id === requestId);
        if (!requestToUpdate) return;

        console.log(`Attempting to ${action} request ${requestId}`);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE}/api/Equipment/${requestId}/${action}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem("jwt")}` },
            });
            if (!response.ok) {
                throw new Error('Failed to update request status');
            }
            // After successful API call, remove from pending list
            setPendingRequests(prevRequests =>
                prevRequests.filter(req => req.id !== requestId)
            );
        } catch (err) {
            console.error(`Error ${action}ing request:`, err);
            setError(`Failed to ${action} request ${requestId}. Please try again.`);
            // Optionally, revert the UI change if API fails
        }
    }, [pendingRequests]);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <p className="text-gray-700 dark:text-gray-300">Loading pending requests...</p>
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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Pending Requests</h1>
                    <Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                        Back to Dashboard
                    </Link>
                </div>

                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search requests by user, equipment, or message..."
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>

                {filteredRequests.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
                        <p className="text-gray-600 dark:text-gray-400 text-lg">No pending requests found.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredRequests.map((request) => (
                            <div key={request.id} 
                            className={
                                (searchParams.has("equipmentId") && isStringANumber(searchParams.get("equipmentId") as unknown as string) && request.equipment.find(eq => eq.id === parseInt(searchParams.get("equipmentId") as unknown as string)))
                                 ? "bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl border border-blue-500 dark:border-blue-600 ring-2 ring-blue-400 dark:ring-blue-700" 
                                 : "bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"}>
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
                                        <span className="font-semibold">Requested Period:</span> {/*new Date(request.startDate).toLocaleDateString()*/"Start date"} - {/*new Date(request.returnDate).toLocaleDateString()*/"End date"}
                                    </p>
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

                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => handleAction(request.id, 'approve')}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 transition-colors duration-200"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleAction(request.id, 'reject')}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 transition-colors duration-200"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}