'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { EquipmentRequest, EquipmentStatus, User, School } from '@/types';
import { useRouter } from 'next/navigation';
import { login } from '@/utils/utils';

export default function AdminLogReturnsPage() {
    const router = useRouter();

    const [user, setUser] = useState<User>();
    const [checkedOutRequests, setCheckedOutRequests] = useState<EquipmentRequest[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
    const [returnNotes, setReturnNotes] = useState<string>('');

    useEffect(() => {
        const fetchCheckedOutRequests = async () => {
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
                    setError("Currently your school doesn't have any equipment");
                    return;
                }
                
                const checkedOutRequestsFetched: EquipmentRequest[] = [];
                for (const equipment of school.equipment){
                    if (equipment.status != EquipmentStatus.CHECKED_OUT) continue;
                    for(const request of equipment.requests){
                        if (request.approvedAt !== null && request.returnedAt === null) checkedOutRequestsFetched.push(request);
                    }
                }
            
                setCheckedOutRequests(checkedOutRequestsFetched);
            } catch (err) {
                console.error("Failed to fetch checked out requests:", err);
                setError("Failed to load requests. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchCheckedOutRequests();
    }, []);

    const filteredRequests = useMemo(() => {
        if (!searchTerm) {
            return checkedOutRequests;
        }
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return checkedOutRequests.filter(request =>
            request.user.firstName.toLowerCase().includes(lowerCaseSearchTerm) ||
            request.user.lastName.toLowerCase().includes(lowerCaseSearchTerm) ||
            request.user.email.toLowerCase().includes(lowerCaseSearchTerm) ||
            request.equipment.some(eq => eq.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
            request.message.toLowerCase().includes(lowerCaseSearchTerm)
        );
    }, [checkedOutRequests, searchTerm]);

    const handleLogReturn = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!selectedRequestId) {
            setError("Please select a request to log its return.");
            return;
        }

        const requestToUpdate = checkedOutRequests.find(req => req.id === selectedRequestId);
        if (!requestToUpdate) {
            setError("Selected request not found.");
            return;
        }

        console.log(`Logging return for request ID: ${selectedRequestId}`);
        console.log(`Notes: ${returnNotes}`);

        try {
            const response = await fetch(`/api/Equipment/${selectedRequestId}/return`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem("jwt")}` },
                body: JSON.stringify({
                    notes: returnNotes,
                    returnedAt: new Date().toISOString()
                })
            });
            if (!response.ok) {
                throw new Error('Failed to log return');
            }
            setCheckedOutRequests(prevRequests =>
                prevRequests.filter(req => req.id !== selectedRequestId)
            );
            setSelectedRequestId(null);
            setReturnNotes('');
        } catch (err) {
            console.error("Error logging return:", err);
            setError("Failed to log return. Please try again.");
        }
    }, [selectedRequestId, returnNotes, checkedOutRequests]);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <p className="text-gray-700 dark:text-gray-300">Loading checked out requests...</p>
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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Log Equipment Return</h1>
                    <Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                        Back to Dashboard
                    </Link>
                </div>

                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search checked out items by user or equipment..."
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Currently Checked Out Equipment</h2>
                    {filteredRequests.length === 0 ? (
                        <p className="text-gray-600 dark:text-gray-400">No equipment is currently checked out.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Select</th>
                                        <th scope="col" className="px-6 py-3">Request ID</th>
                                        <th scope="col" className="px-6 py-3">User</th>
                                        <th scope="col" className="px-6 py-3">Equipment</th>
                                        <th scope="col" className="px-6 py-3">Checkout Date</th>
                                        <th scope="col" className="px-6 py-3">Return Due</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRequests.map((request) => (
                                        <tr key={request.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                            <td className="px-6 py-4">
                                                <input
                                                    type="radio"
                                                    name="selectedRequest"
                                                    value={request.id}
                                                    checked={selectedRequestId === request.id}
                                                    onChange={() => setSelectedRequestId(request.id)}
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                />
                                            </td>
                                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                {request.id}
                                            </th>
                                            <td className="px-6 py-4">
                                                {request.user.firstName} {request.user.lastName} ({request.user.email})
                                            </td>
                                            <td className="px-6 py-4">
                                                {request.equipment.map(eq => eq.name).join(', ')}
                                            </td>
                                            <td className="px-6 py-4">
                                                {request.approvedAt ? new Date(request.approvedAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4">
                                                {request.returnedAt ? new Date(request.returnedAt).toLocaleDateString() : "N/A"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {selectedRequestId && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Log Return Details for Request ID: {selectedRequestId}</h2>
                        <form onSubmit={handleLogReturn} className="space-y-4">
                            <div>
                                <label htmlFor="returnNotes" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Notes (Optional)</label>
                                <textarea
                                    id="returnNotes"
                                    rows={3}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    placeholder="Any notes about the equipment's condition or return..."
                                    value={returnNotes}
                                    onChange={(e) => setReturnNotes(e.target.value)}
                                ></textarea>
                            </div>
                            {error && (
                                <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
                                    {error}
                                </div>
                            )}
                            <button
                                type="submit"
                                className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 transition-colors duration-200"
                            >
                                Confirm Return
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </section>
    );
}