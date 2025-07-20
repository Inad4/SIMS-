'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Equipment, EquipmentCondition } from '@/types/equipment';
import { User } from '@/types/user';
import { EquipmentRequest, RequestStatus } from '@/types/request';
import { getConditionColor } from '@/utils/utils';

export default function ManageRequestsPage() {
    const [pendingRequests, setPendingRequests] = useState<EquipmentRequest[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const dummyAllEquipment: Equipment[] = [
        { id: 1, name: 'Projector Epson EX3260', room: 201, pathToPhoto: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Projector', condition: EquipmentCondition.AVAILABLE, type: 'Projector', serialNumber: 'PRJ-EP3260-001', createdAt: '2023-01-15T10:00:00Z', updatedAt: '2024-06-01T14:30:00Z' },
        { id: 2, name: 'Laptop Dell XPS 15', room: 105, pathToPhoto: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Laptop', condition: EquipmentCondition.CHECKED_OUT, type: 'Laptop', serialNumber: 'LAP-DEL-XPS15-005', createdAt: '2022-11-20T08:00:00Z', updatedAt: '2024-07-10T09:15:00Z' },
        { id: 3, name: '3D Printer Creality Ender 3', room: 302, pathToPhoto: 'https://via.placeholder.com/150/008000/FFFFFF?text=3D+Printer', condition: EquipmentCondition.UNDER_REPAIR, type: '3D Printer', serialNumber: '3DP-CRE-END3-010', createdAt: '2023-03-01T11:00:00Z', updatedAt: '2024-07-17T16:00:00Z' },
        { id: 4, name: 'Server Rack HP ProLiant', room: 400, pathToPhoto: 'https://via.placeholder.com/150/800080/FFFFFF?text=Server', condition: EquipmentCondition.RETIRED, type: 'Server', serialNumber: 'SRV-HP-PROL-001', createdAt: '2021-05-01T09:00:00Z', updatedAt: '2024-02-14T10:00:00Z' },
        { id: 5, name: 'Microscope Lab-X 2000', room: 101, pathToPhoto: 'https://via.placeholder.com/150/FFFF00/000000?text=Microscope', condition: EquipmentCondition.AVAILABLE, type: 'Microscope', serialNumber: 'MIC-LBX-2000-003', createdAt: '2023-05-01T09:00:00Z', updatedAt: '2024-01-20T11:00:00Z' },
        { id: 6, name: 'Camera Canon EOS R5', room: 205, pathToPhoto: 'https://via.placeholder.com/150/FF8C00/FFFFFF?text=Camera', condition: EquipmentCondition.CHECKED_OUT, type: 'Camera', serialNumber: 'CAM-CAN-R5-002', createdAt: '2022-09-10T14:00:00Z', updatedAt: '2024-07-16T10:00:00Z' },
    ];

    useEffect(() => {
        const fetchPendingRequests = async () => {
            setLoading(true);
            setError(null);
            try {
                const dummyRequests: EquipmentRequest[] = await new Promise((resolve) =>
                    setTimeout(() => {
                        resolve([
                            {
                                id: 101,
                                equipment: [
                                    dummyAllEquipment.find(e => e.id === 1)!,
                                    dummyAllEquipment.find(e => e.id === 5)!
                                ],
                                userId: "user_abc_1",
                                user: { id: "user_abc_1", email: "user1@example.com", firstName: "Alice", lastName: "Smith", schoolId: 1, createdAt: null, updatedAt: null },
                                message: 'Request for: Projector Epson EX3260 (SN: PRJ-EP3260-001), Microscope Lab-X 2000 (SN: MIC-LBX-2000-003). From: 2025-08-01 To: 2025-08-05. Notes: Need for presentation in Room 201.',
                                status: RequestStatus.PENDING,
                                returnedAt: null,
                                createdAt: '2025-07-18T10:00:00Z',
                                updatedAt: '2025-07-18T10:00:00Z',
                            },
                            {
                                id: 102,
                                equipment: [
                                    dummyAllEquipment.find(e => e.id === 6)!
                                ],
                                userId: "user_def_2",
                                user: { id: "user_def_2", email: "user2@example.com", firstName: "Bob", lastName: "Johnson", schoolId: 1, createdAt: null, updatedAt: null },
                                message: 'Request for: Camera Canon EOS R5 (SN: CAM-CAN-R5-002). From: 2025-07-25 To: 2025-07-28. Notes: For a photography project.',
                                status: RequestStatus.PENDING,
                                returnedAt: null,
                                createdAt: '2025-07-19T11:30:00Z',
                                updatedAt: '2025-07-19T11:30:00Z',
                            },
                            {
                                id: 103,
                                equipment: [
                                    dummyAllEquipment.find(e => e.id === 2)!
                                ],
                                userId: "user_ghi_3",
                                user: { id: "user_ghi_3", email: "user3@example.com", firstName: "Charlie", lastName: "Brown", schoolId: 2, createdAt: null, updatedAt: null },
                                message: 'Request for: Laptop Dell XPS 15 (SN: LAP-DEL-XPS15-005). From: 2025-08-10 To: 2025-08-15. Notes: Urgent laptop need.',
                                status: RequestStatus.PENDING,
                                returnedAt: null,
                                createdAt: '2025-07-19T15:00:00Z',
                                updatedAt: '2025-07-19T15:00:00Z',
                            }
                        ]);
                    }, 800)
                );
                setPendingRequests(dummyRequests);

            } catch (err) {
                console.error("Failed to fetch pending requests:", err);
                setError("Failed to load pending requests. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchPendingRequests();
    }, []);

    const handleRequestAction = async (requestId: number, action: 'approve' | 'reject') => {
        setLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));

            setPendingRequests(prevRequests =>
                prevRequests.filter(req => req.id !== requestId)
            );
            alert(`Request ${requestId} ${action}d successfully!`);

        } catch (err) {
            console.error(`Failed to ${action} request ${requestId}:`, err);
            setError(`Failed to ${action} request. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

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
                <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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
                    <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                        Back to Dashboard
                    </Link>
                </div>

                {pendingRequests.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
                        <p className="text-gray-600 dark:text-gray-400 text-lg">No pending requests at this time.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {pendingRequests.map((request) => (
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
                                        <span className="font-semibold">Message:</span> {request.message}
                                    </p>
                                    {request.createdAt && (
                                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                                            <span className="font-semibold">Requested On:</span> {new Date(request.createdAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Requested Equipment:</h3>
                                <ul className="mb-4 space-y-2">
                                    {request.equipment && request.equipment.length > 0 ? (
                                        request.equipment.map(eq => (
                                            <li key={eq.id} className="flex items-center text-gray-700 dark:text-gray-300">
                                                <img src={eq.pathToPhoto} alt={eq.name} className="w-8 h-8 rounded-full mr-3" />
                                                <span>{eq.name} (Serial: {eq.serialNumber}) - <span className={`${getConditionColor(eq.condition)} px-2 py-0.5 rounded-full text-xs`}>{eq.condition.replace(/_/g, ' ')}</span></span>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-gray-500 dark:text-gray-400">No equipment details available.</li>
                                    )}
                                </ul>

                                <div className="flex justify-end space-x-3 mt-4">
                                    <button
                                        onClick={() => handleRequestAction(request.id, 'approve')}
                                        className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleRequestAction(request.id, 'reject')}
                                        className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
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