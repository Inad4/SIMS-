'use client'

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { UserPayload } from "@/types/user";
import { Equipment, EquipmentCondition } from "@/types/equipment";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { getConditionColor, getUniqueTypes } from "@/utils/utils";


export default function DashboardContent({ user }: { user: UserPayload | null }) {
    const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const searchParams = useSearchParams();
    const initialSearchTerm = searchParams.get('search') || '';
    const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm);

    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedCondition, setSelectedCondition] = useState<EquipmentCondition | null>(null);

    const router = useRouter();

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
                            { id: 5, name: 'Microscope Lab-X 2000', room: 101, pathToPhoto: 'https://via.placeholder.com/150/FFFF00/000000?text=Microscope', condition: EquipmentCondition.AVAILABLE, type: 'Microscope', serialNumber: 'MIC-LBX-2000-003', createdAt: '2023-05-01T09:00:00Z', updatedAt: '2024-01-20T11:00:00Z' },
                            { id: 6, name: 'Camera Canon EOS R5', room: 205, pathToPhoto: 'https://via.placeholder.com/150/FF8C00/FFFFFF?text=Camera', condition: EquipmentCondition.CHECKED_OUT, type: 'Camera', serialNumber: 'CAM-CAN-R5-002', createdAt: '2022-09-10T14:00:00Z', updatedAt: '2024-07-16T10:00:00Z' },
                        ]);
                    }, 500)
                );
                setAllEquipment(response);

                const urlType = searchParams.get('type');
                if (urlType && getUniqueTypes(response).includes(urlType)) {
                    setSelectedType(urlType);
                }
                const urlCondition = searchParams.get('condition');
                if (urlCondition && Object.values(EquipmentCondition).includes(urlCondition as EquipmentCondition)) {
                    setSelectedCondition(urlCondition as EquipmentCondition);
                }

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

    const uniqueTypes = useMemo(() => getUniqueTypes(allEquipment), [allEquipment]);
    const allConditions = useMemo(() => Object.values(EquipmentCondition), []);

    const filteredEquipment = useMemo(() => {
        let currentFilteredList = allEquipment;

        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            currentFilteredList = currentFilteredList.filter(item =>
                item.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                item.type.toLowerCase().includes(lowerCaseSearchTerm) ||
                item.serialNumber.toLowerCase().includes(lowerCaseSearchTerm)
            );
        }

        if (selectedType) {
            currentFilteredList = currentFilteredList.filter(item => item.type === selectedType);
        }

        if (selectedCondition) {
            currentFilteredList = currentFilteredList.filter(item => item.condition === selectedCondition);
        }

        return currentFilteredList;
    }, [allEquipment, searchTerm, selectedType, selectedCondition]);

    const handleSearchInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    }, []);

    const toggleFilterPanel = useCallback(() => {
        setIsFilterPanelOpen(prev => !prev);
    }, []);

    const handleTypeChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedType(event.target.value === '' ? null : event.target.value);
    }, []);

    const handleConditionChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCondition(event.target.value === '' ? null : event.target.value as EquipmentCondition);
    }, []);

    const applyFilters = useCallback(() => {
        const newSearchParams = new URLSearchParams();

        if (searchTerm) {
            newSearchParams.set('search', searchTerm);
        }
        if (selectedType) {
            newSearchParams.set('type', selectedType);
        }
        if (selectedCondition) {
            newSearchParams.set('condition', selectedCondition);
        }

        router.replace(`?${newSearchParams.toString()}`);
        setIsFilterPanelOpen(false);
    }, [searchTerm, selectedType, selectedCondition, router]);

    const resetFilters = useCallback(() => {
        setSearchTerm('');
        setSelectedType(null);
        setSelectedCondition(null);
        router.replace('');
        setIsFilterPanelOpen(false);
    }, [router]);

    const handleFormSubmit = useCallback((event: React.FormEvent) => {
        event.preventDefault();
        applyFilters();
    }, [applyFilters]);


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
            <div className={`transition-all duration-300 ease-in-out ${isFilterPanelOpen ? 'blur-sm brightness-50 pointer-events-none' : ''}`}>
                <form className="flex items-center max-w-lg mx-auto mb-8" onSubmit={handleFormSubmit}>
                    <div className="relative w-full">
                        <input
                            type="text"
                            id="search"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Search equipment..."
                            value={searchTerm}
                            onChange={handleSearchInputChange}
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 start-0 flex items-center ps-3"
                            onClick={toggleFilterPanel}
                            title="Open Filters"
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
                                        className="block bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm
                                                hover:shadow-md transition-shadow duration-200
                                                flex flex-col items-center text-center
                                                cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-600"
                                    >
                                        <img
                                            src={equipment.pathToPhoto}
                                            alt={equipment.name}
                                            className="w-32 h-32 object-cover rounded-full mb-4 border-2 border-gray-300 dark:border-gray-600
                                                    group-hover:border-blue-500 transition-colors duration-200"
                                        />
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                                            {equipment.name}
                                        </h2>
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
                                        {equipment.updatedAt && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                Updated: {new Date(equipment.updatedAt).toLocaleDateString()}
                                            </p>
                                        )}
                                        {equipment.createdAt && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Created: {new Date(equipment.createdAt).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-600 dark:text-gray-400 mt-8">No equipment found matching your search.</p>
                    )}
                </div>
            </div> {/* End of main content wrapper */}

            {isFilterPanelOpen && (
                <>
                    {/* The filter panel itself - ensure it's higher z-index */}
                    <div
                        className={`fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-800 shadow-lg transform
                        ${isFilterPanelOpen ? 'translate-x-0' : 'translate-x-full'}
                        transition-transform duration-300 ease-in-out z-[100] p-6 flex flex-col`}
                    >
                        <div className="flex justify-between items-center mb-6 border-b pb-4 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Filters</h2>
                            <button
                                onClick={toggleFilterPanel}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                                aria-label="Close filters"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>

                        <div className="mb-6">
                            <label htmlFor="equipmentType" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Type
                            </label>
                            <select
                                id="equipmentType"
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                                           dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={selectedType || ''}
                                onChange={handleTypeChange}
                            >
                                <option value="">All Types</option>
                                {uniqueTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-6">
                            <label htmlFor="equipmentCondition" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Condition
                            </label>
                            <select
                                id="equipmentCondition"
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                                           dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={selectedCondition || ''}
                                onChange={handleConditionChange}
                            >
                                <option value="">All Conditions</option>
                                {Object.values(EquipmentCondition).map(condition => (
                                    <option key={condition} value={condition}>
                                        {condition.replace(/_/g, ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-4 mt-auto pt-6 border-t dark:border-gray-700">
                            <button
                                onClick={applyFilters}
                                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800"
                            >
                                Apply Filters
                            </button>
                            <button
                                onClick={resetFilters}
                                className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                            >
                                Reset Filters
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}