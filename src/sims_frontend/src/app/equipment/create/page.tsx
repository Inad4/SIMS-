'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Equipment, EquipmentStatus } from '@/types';

interface NewEquipmentPayload {
    name: string;
    room: number;
    pathToPhoto: string;
    condition: EquipmentStatus;
    type: string;
    serialNumber: string;
}

export default function CreateEquipmentPage() {
    const router = useRouter();

    // State for form inputs
    const [name, setName] = useState<string>('');
    const [room, setRoom] = useState<string>('');
    const [pathToPhoto, setPathToPhoto] = useState<string>('');
    const [condition, setCondition] = useState<EquipmentStatus>(EquipmentStatus.AVAILABLE);
    const [type, setType] = useState<string>('');
    const [serialNumber, setSerialNumber] = useState<string>('');

    // State for feedback
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [createMore, setCreateMore] = useState<boolean>(false);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        // Basic validation
        if (!name || !room || !pathToPhoto || !type || !serialNumber) {
            setError('Please fill in all required fields.');
            setLoading(false);
            return;
        }

        const roomNumber = parseInt(room, 10);
        if (isNaN(roomNumber)) {
            setError('Room must be a valid number.');
            setLoading(false);
            return;
            }

        const newEquipment: NewEquipmentPayload = {
            name,
            room: roomNumber,
            pathToPhoto,
            condition,
            type,
            serialNumber,
        };

        try {
            const url = `${process.env.NEXT_PUBLIC_BACKEND_BASE}/api/Equipment`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("jwt")}`,
                },
                body: JSON.stringify(newEquipment),
            });

            if (!response.ok) {
                console.error(`Error: ${response.statusText} (${response.status})`);
                setError(`Failed to create equipment`);
                return; 
            }

            const createdEquipment: Equipment = await response.json();
            setSuccessMessage(`Equipment "${createdEquipment.name}" created successfully!`);

            if (createMore) {
                // Reset all form fields
                setName('');
                setRoom('');
                setPathToPhoto('');
                setCondition(EquipmentStatus.AVAILABLE); // Reset to default condition
                setType('');
                setSerialNumber('');
                // Keep success message visible for a short period
                setTimeout(() => setSuccessMessage(null), 3000);
            } else {
                setTimeout(() => {
                    router.push(`/equipment/${createdEquipment.id}`);
                }, 1500);
            }

        } catch (err: unknown) {
            console.error('Network or unexpected error creating equipment:', err);

            let errorMessage = 'An unexpected error occurred. Please check your network connection.';

            
            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (typeof err === 'string') {
                errorMessage = err;
            }
            

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [name, room, pathToPhoto, condition, type, serialNumber, router]);

    return (
        <div className="container mx-auto p-4 max-w-2xl">

            {/* Success Message */}
            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Success!</strong>
                    <span className="block sm:inline"> {successMessage}</span>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white pb-8">Create New Equipment</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Equipment Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        />
                    </div>

                    {/* Room */}
                    <div>
                        <label htmlFor="room" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room Number <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            id="room"
                            value={room}
                            onChange={(e) => setRoom(e.target.value)}
                            required
                            className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        />
                    </div>

                    {/* Path to Photo */}
                    <div className="md:col-span-2">
                        <label htmlFor="pathToPhoto" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Photo URL <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            id="pathToPhoto"
                            value={pathToPhoto}
                            onChange={(e) => setPathToPhoto(e.target.value)}
                            required
                            placeholder="e.g., https://via.placeholder.com/150"
                            className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Equipment Type <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            id="type"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            required
                            className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        />
                    </div>

                    {/* Serial Number */}
                    <div>
                        <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Serial Number <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            id="serialNumber"
                            value={serialNumber}
                            onChange={(e) => setSerialNumber(e.target.value)}
                            required
                            className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        />
                    </div>

                    {/* Condition */}
                    <div>
                        <label htmlFor="condition" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Condition</label>
                        <select
                            id="condition"
                            value={condition}
                            onChange={(e) => setCondition(e.target.value as EquipmentStatus)}
                            className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        >
                            {Object.values(EquipmentStatus).map((cond) => (
                                <option key={cond} value={cond}>
                                    {cond.replace(/_/g, ' ')}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-6 flex items-center">
                    <input
                        id="createMore"
                        type="checkbox"
                        checked={createMore}
                        onChange={(e) => setCreateMore(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="createMore" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Create more equipment after this one</label>
                </div>

                {/* Submit Button */}
                <div className="mt-8 text-center">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-3 rounded-lg text-white font-semibold transition-colors duration-200
                            ${loading
                                ? 'bg-blue-400 dark:bg-blue-600 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
                            }`}
                    >
                        {loading ? 'Creating...' : 'Create Equipment'}
                    </button>
                </div>
            </form>
        </div>
    );
}
