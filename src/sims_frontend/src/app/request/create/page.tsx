'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Equipment, User, EquipmentStatus } from '@/types';
import { login } from '@/utils/utils';

export default function RequestFormPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [user, setUser] = useState<User>();
    const [selectedEquipmentDetails, setSelectedEquipmentDetails] = useState<Equipment[]>([]);
    const [startDate, setStartDate] = useState<string>('');
    const [returnDate, setReturnDate] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEquipmentDetail = async () => {
            const idsParam = searchParams.get('ids');
            if (idsParam) {
                const us = await login();
                if (!us){
                    router.replace("/dashboard");
                    return;
                }
                setUser(us);

                try {
                    const equipmentIds = idsParam.split(',').map(Number);

                    const equipmentDetails: Equipment[] = [];
                    for (const id of equipmentIds){
                        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE}/api/Equipment/${id}`, {
                            headers: {
                                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
                            }
                        });
                        const eq: Equipment = await res.json();

                        if (eq.status != EquipmentStatus.AVAILABLE){
                            console.log(`Equipment(${JSON.stringify(eq, null, 2)}) is not available`);
                            continue;
                        }

                        equipmentDetails.push(eq);
                    }
                    
                    setSelectedEquipmentDetails(equipmentDetails);
                    setLoading(false);
                } catch (e) {
                    console.error("Failed to parse equipment IDs from URL:", e);
                    setError("Invalid equipment selection.");
                    setLoading(false);
                }
            } else {
                setError("No equipment selected for request.");
                setLoading(false);
            }
        }
        fetchEquipmentDetail();
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (selectedEquipmentDetails.length === 0) {
            setError("Please select equipment before submitting.");
            return;
        }
        if (!startDate || !returnDate) {
            setError("Start and Return dates are required.");
            return;
        }
        if (new Date(startDate) >= new Date(returnDate)) {
            setError("Return date must be after the start date.");
            return;
        }

        const equipmentNames = selectedEquipmentDetails.map(eq => `${eq.name} (SN: ${eq.serialNumber})`).join(', ');
        const requestMessage = `Request for: ${equipmentNames}. From: ${startDate} To: ${returnDate}. ${message ? `Notes: ${message}` : ''}`;

        const newRequestPayload = {
            message: requestMessage,
            equipmentIds: selectedEquipmentDetails.map(eq => eq.id),
            userId: user?.id,
        };

        console.log("Submitting Request:", newRequestPayload);
        alert("Request submitted! (Check console for data)");

        router.push('/dashboard');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <p className="text-gray-700 dark:text-gray-300">Loading selected equipment...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 p-4">
                <p className="text-xl font-semibold mb-4">{error}</p>
                <Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Go back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <section className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center py-8">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto w-full max-w-2xl">
                <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                            Request Selected Equipment
                        </h1>

                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                            Equipment to Request:
                        </h2>
                        {selectedEquipmentDetails.length > 0 ? (
                            <ul className="list-disc list-inside space-y-2 mb-6">
                                {selectedEquipmentDetails.map(eq => (
                                    <li key={eq.id} className="text-gray-700 dark:text-gray-300">
                                        <span className="font-medium">{eq.name}</span> (Serial: {eq.serialNumber})
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">No equipment selected.</p>
                        )}

                        <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="startDate" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Start Date</label>
                                <input
                                    type="date"
                                    id="startDate"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="returnDate" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Return Date</label>
                                <input
                                    type="date"
                                    id="returnDate"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    value={returnDate}
                                    onChange={(e) => setReturnDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Message (Optional)</label>
                                <textarea
                                    id="message"
                                    rows={4}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    placeholder="Any special requirements or details..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
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
                                Submit Request
                            </button>
                            <Link href="/dashboard" className="w-full text-center block text-gray-500 hover:underline dark:text-gray-400">
                                Back to Dashboard
                            </Link>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}