'use client'

import Link from "next/link";
import { UserPayload } from "@/types/user";
import { Equipment, EquipmentCondition } from "@/types/equipment";
import React, { useState, useEffect, useMemo, useCallback } from "react"; // Added useCallback and useMemo


const getConditionColor = (condition: EquipmentCondition): string => {
    switch (condition) {
        case EquipmentCondition.AVAILABLE:
            return 'bg-green-100 text-green-800';
        case EquipmentCondition.UNDER_REPAIR:
            return 'bg-yellow-100 text-yellow-800';
        case EquipmentCondition.CHECKED_OUT:
            return 'bg-blue-100 text-blue-800';
        case EquipmentCondition.RETIRED:
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export default function DashboardContent({ user }: { user: UserPayload | null }) {
    const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>(''); // State for the search input value
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEquipment = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await new Promise<Equipment[]>((resolve) =>
                    setTimeout(() => {
                        resolve([
                            { id: 1, name: 'Projector Epson EX3260', room: 201, pathToPhoto: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Projector', condition: EquipmentCondition.AVAILABLE, type: 'Projector', serialNumber: 'PRJ-EP3260-001', createdAt: '2023-01-15T10:00:00Z', updatedAt: '2024-06-01T14:30:00Z' },
                            { id: 2, name: 'Laptop Dell XPS 15', room: 105, pathToPhoto: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Laptop', condition: EquipmentCondition.CHECKED_OUT, type: 'Laptop', serialNumber: 'LAP-DEL-XPS15-005', createdAt: '2022-11-20T08:00:00Z', updatedAt: '2024-07-10T09:15:00Z' },
                            { id: 3, name: '3D Printer Creality Ender 3', room: 302, pathToPhoto: 'https://via.placeholder.com/150/008000/FFFFFF?text=3D+Printer', condition: EquipmentCondition.UNDER_REPAIR, type: '3D Printer', serialNumber: '3DP-CRE-END3-010', createdAt: '2023-03-01T11:00:00Z', updatedAt: '2024-07-17T16:00:00Z' },
                            { id: 4, name: 'Server Rack HP ProLiant', room: 400, pathToPhoto: 'https://via.placeholder.com/150/800080/FFFFFF?text=Server', condition: EquipmentCondition.RETIRED, type: 'Server', serialNumber: 'SRV-HP-PROL-001', createdAt: '2021-05-01T09:00:00Z', updatedAt: '2024-02-14T10:00:00Z' },
                        ]);
                    }, 500)
                );
                // Update the state with the full list of equipment
                setAllEquipment(response);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unknown error occurred.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchEquipment();
    }, []);

    const filteredEquipment = useMemo(() => {
        if (!searchTerm) {
            return allEquipment;
        }

        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        return allEquipment.filter(item =>
            item.name.toLowerCase().includes(lowerCaseSearchTerm) ||
            item.type.toLowerCase().includes(lowerCaseSearchTerm) ||
            item.serialNumber.toLowerCase().includes(lowerCaseSearchTerm)
        );
    }, [allEquipment, searchTerm]);

    const handleSearchInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    }, []);

    const handleFilterButtonClick = () => {
        alert("Filter settings open");
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
    };


    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                Loading equipment...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300">
                Error: {error}
            </div>
        );
    }

    return (
        <>
            <form className="flex items-center max-w-lg mx-auto mb-8" onSubmit={handleSubmit}>
                <div className="relative w-full">
                    <input
                        type="text"
                        id="search"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Search equipment..."
                        value={searchTerm}
                        onChange={handleSearchInputChange}
                    />
                    {/* Filter button - make sure it's type="button" to prevent form submission */}
                    <button
                        type="button"
                        className="absolute inset-y-0 start-0 flex items-center ps-3"
                        onClick={handleFilterButtonClick}
                    >
                        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M6 4v10m0 0a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m0 0v2m6-16v2m0 0a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m0 0v10m6-16v10m0 0a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m0 0v2"/>
                        </svg>
                    </button>
                </div>
                <button type="submit" className="inline-flex items-center py-2.5 px-3 ms-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                    <svg className="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                    </svg>Search
                </button>
            </form>

            <div className="container mx-auto p-4 bg-white dark:bg-gray-800 shadow-md rounded-lg mt-8">
                {filteredEquipment.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEquipment.map((equipment) => (
                            <Link key={equipment.id} href={`/equipment/${equipment.id}`} passHref>
                                <div
                                    key={equipment.id}
                                    className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col items-center text-center"
                                >
                                    <img
                                        src={equipment.pathToPhoto}
                                        alt={equipment.name}
                                        className="w-32 h-32 object-cover rounded-full mb-4 border-2 border-gray-300 dark:border-gray-600"
                                    />
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{equipment.name}</h2>
                                    <p className="text-gray-700 dark:text-gray-300 mb-1">
                                        Type: {equipment.type}
                                    </p>
                                    <p className="text-gray-700 dark:text-gray-300 mb-1">
                                        Serial: {equipment.serialNumber}
                                    </p>
                                    <p className="text-gray-700 dark:text-gray-300 mb-1">
                                        Room: {equipment.room}
                                    </p>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium mt-3 ${getConditionColor(
                                            equipment.condition
                                        )}`}
                                    >
                                        {equipment.condition.replace(/_/g, ' ')}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-600 dark:text-gray-400 mt-8">No equipment found matching your search.</p>
                )}
            </div>
        </>
    );
}