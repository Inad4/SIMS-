'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { EquipmentRequest, RequestStatus, Equipment, EquipmentCondition, User } from '@/types';

export default function AdminLogReturnsPage() {
    const [checkedOutRequests, setCheckedOutRequests] = useState<EquipmentRequest[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
    const [returnCondition, setReturnCondition] = useState<EquipmentCondition | ''>('');
    const [returnNotes, setReturnNotes] = useState<string>('');

    const dummyAllEquipment: Equipment[] = [
        { id: 1, name: 'Projector Epson EX3260', room: 201, pathToPhoto: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Projector', condition: EquipmentCondition.CHECKED_OUT, type: 'Projector', serialNumber: 'PRJ-EP3260-001', createdAt: '2023-01-15T10:00:00Z', updatedAt: '2024-07-15T10:00:00Z' },
        { id: 2, name: 'Laptop Dell XPS 15', room: 105, pathToPhoto: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Laptop', condition: EquipmentCondition.CHECKED_OUT, type: 'Laptop', serialNumber: 'LAP-DEL-XPS15-005', createdAt: '2022-11-20T08:00:00Z', updatedAt: '2024-07-10T09:15:00Z' },
        { id: 3, name: '3D Printer Creality Ender 3', room: 302, pathToPhoto: 'https://via.placeholder.com/150/008000/FFFFFF?text=3D+Printer', condition: EquipmentCondition.UNDER_REPAIR, type: '3D Printer', serialNumber: '3DP-CRE-END3-010', createdAt: '2023-03-01T11:00:00Z', updatedAt: '2024-07-17T16:00:00Z' },
    ];

    const dummyUsers: User[] = [
        { id: "user_1", email: "john.doe@example.com", firstName: "John", lastName: "Doe", schoolId: 1, createdAt: null, updatedAt: null, isAdmin: false },
        { id: "user_2", email: "jane.smith@example.com", firstName: "Jane", lastName: "Smith", schoolId: 1, createdAt: null, updatedAt: null, isAdmin: false },
    ];

    useEffect(() => {
        const fetchCheckedOutRequests = async () => {
            setLoading(true);
            setError(null);
            try {
                const dummyData: EquipmentRequest[] = await new Promise((resolve) =>
                    setTimeout(() => {
                        resolve([
                            {
                                id: 101,
                                equipment: [dummyAllEquipment[0]],
                                userId: dummyUsers[0].id,
                                user: dummyUsers[0],
                                message: 'Projector for presentation.',
                                status: RequestStatus.APPROVED,
                                startDate: '2025-07-20',
                                returnDate: '2025-07-22',
                                checkoutDate: '2025-07-20T09:00:00Z',
                                returnedAt: null,
                                createdAt: '2025-07-18T10:00:00Z',
                                updatedAt: '2025-07-20T09:00:00Z',
                            },
                            {
                                id: 102,
                                equipment: [dummyAllEquipment[1]],
                                userId: dummyUsers[1].id,
                                user: dummyUsers[1],
                                message: 'Laptop for urgent work.',
                                status: RequestStatus.APPROVED,
                                startDate: '2025-07-15',
                                returnDate: '2025-07-25',
                                checkoutDate: '2025-07-15T11:00:00Z',
                                returnedAt: null,
                                createdAt: '2025-07-14T14:00:00Z',
                                updatedAt: '2025-07-15T11:00:00Z',
                            },
                        ]);
                    }, 500)
                );
                setCheckedOutRequests(dummyData);
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
        if (!returnCondition) {
            setError("Please select the return condition of the equipment.");
            return;
        }

        const requestToUpdate = checkedOutRequests.find(req => req.id === selectedRequestId);
        if (!requestToUpdate) {
            setError("Selected request not found.");
            return;
        }

        console.log(`Logging return for request ID: ${selectedRequestId}`);
        console.log(`Condition: ${returnCondition}, Notes: ${returnNotes}`);

        alert(`Return for request ${selectedRequestId} logged! (Simulated)`);

        setCheckedOutRequests(prevRequests =>
            prevRequests.filter(req => req.id !== selectedRequestId)
        );

        setSelectedRequestId(null);
        setReturnCondition('');
        setReturnNotes('');

        // In a real application, you would make an API call here:
        // try {
        //     const response = await fetch(`/api/equipment-requests/${selectedRequestId}/return`, {
        //         method: 'PUT',
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify({
        //             condition: returnCondition,
        //             notes: returnNotes,
        //             returnedAt: new Date().toISOString()
        //         })
        //     });
        //     if (!response.ok) {
        //         throw new Error('Failed to log return');
        //     }
        //     setCheckedOutRequests(prevRequests =>
        //         prevRequests.filter(req => req.id !== selectedRequestId)
        //     );
        //     setSelectedRequestId(null);
        //     setReturnCondition('');
        //     setReturnNotes('');
        // } catch (err) {
        //     console.error("Error logging return:", err);
        //     setError("Failed to log return. Please try again.");
        // }
    }, [selectedRequestId, returnCondition, returnNotes, checkedOutRequests]);

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
                                                {request.checkoutDate ? new Date(request.checkoutDate).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4">
                                                {new Date(request.returnDate).toLocaleDateString()}
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
                                <label htmlFor="returnCondition" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Return Condition</label>
                                <select
                                    id="returnCondition"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    value={returnCondition}
                                    onChange={(e) => setReturnCondition(e.target.value as EquipmentCondition)}
                                    required
                                >
                                    <option value="">Select condition</option>
                                    <option value={EquipmentCondition.AVAILABLE}>Good (Available)</option>
                                    <option value={EquipmentCondition.UNDER_REPAIR}>Damaged (Under Repair)</option>
                                    <option value={EquipmentCondition.RETIRED}>Retired (Beyond Repair)</option>
                                </select>
                            </div>
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