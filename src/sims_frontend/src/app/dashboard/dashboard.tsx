'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Equipment, EquipmentCondition, User } from '@/types';
import { getConditionColor } from '@/utils/utils';

interface DashboardContentProps {
    user: User | null;
}

export default function DashboardContent({ user }: DashboardContentProps) {
    const router = useRouter();
    const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedEquipment, setSelectedEquipment] = useState<number[]>([]);
    const [filterCondition, setFilterCondition] = useState<EquipmentCondition | ''>('');
    const [filterType, setFilterType] = useState<string>('');

    useEffect(() => {
        const fetchEquipment = async () => {
            setLoading(true);
            setError(null);
            try {
                const dummyData: Equipment[] = await new Promise((resolve) =>
                    setTimeout(() => {
                        resolve([
                            { id: 1, name: 'Projector Epson EX3260', room: 201, pathToPhoto: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Projector', condition: EquipmentCondition.AVAILABLE, type: 'Projector', serialNumber: 'PRJ-EP3260-001', createdAt: '2023-01-15T10:00:00Z', updatedAt: '2024-06-01T14:30:00Z' },
                            { id: 2, name: 'Laptop Dell XPS 15', room: 105, pathToPhoto: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Laptop', condition: EquipmentCondition.CHECKED_OUT, type: 'Laptop', serialNumber: 'LAP-DEL-XPS15-005', createdAt: '2022-11-20T08:00:00Z', updatedAt: '2024-07-10T09:15:00Z' },
                            { id: 3, name: '3D Printer Creality Ender 3', room: 302, pathToPhoto: 'https://via.placeholder.com/150/008000/FFFFFF?text=3D+Printer', condition: EquipmentCondition.UNDER_REPAIR, type: '3D Printer', serialNumber: '3DP-CRE-END3-010', createdAt: '2023-03-01T11:00:00Z', updatedAt: '2024-07-17T16:00:00Z' },
                            { id: 4, name: 'Server Rack HP ProLiant', room: 400, pathToPhoto: 'https://via.placeholder.com/150/800080/FFFFFF?text=Server', condition: EquipmentCondition.RETIRED, type: 'Server', serialNumber: 'SRV-HP-PROL-001', createdAt: '2021-05-01T09:00:00Z', updatedAt: '2024-02-14T10:00:00Z' },
                            { id: 5, name: 'Microscope Lab-X 2000', room: 101, pathToPhoto: 'https://via.placeholder.com/150/FFFF00/000000?text=Microscope', condition: EquipmentCondition.AVAILABLE, type: 'Microscope', serialNumber: 'MIC-LBX-2000-003', createdAt: '2023-05-01T09:00:00Z', updatedAt: '2024-01-20T11:00:00Z' },
                            { id: 6, name: 'Camera Canon EOS R5', room: 205, pathToPhoto: 'https://via.placeholder.com/150/FF8C00/FFFFFF?text=Camera', condition: EquipmentCondition.AVAILABLE, type: 'Camera', serialNumber: 'CAM-CAN-R5-002', createdAt: '2022-09-10T14:00:00Z', updatedAt: '2024-07-16T10:00:00Z' },
                            { id: 7, name: 'VR Headset Oculus Quest', room: 301, pathToPhoto: 'https://via.placeholder.com/150/A020F0/FFFFFF?text=VR', condition: EquipmentCondition.AVAILABLE, type: 'VR Headset', serialNumber: 'VRH-OCU-QST-001', createdAt: '2023-06-20T11:00:00Z', updatedAt: '2024-07-05T15:00:00Z' },
                            { id: 8, name: 'Sound System JBL EON', room: 202, pathToPhoto: 'https://via.placeholder.com/150/00CED1/FFFFFF?text=Sound', condition: EquipmentCondition.AVAILABLE, type: 'Sound System', serialNumber: 'SNS-JBL-EON-003', createdAt: '2022-03-10T10:00:00Z', updatedAt: '2024-05-20T09:00:00Z' },
                        ]);
                    }, 500)
                );
                setEquipmentList(dummyData);
            } catch (err) {
                console.error("Failed to fetch equipment:", err);
                setError("Failed to load equipment. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchEquipment();
    }, []);

    const availableEquipmentTypes = useMemo(() => {
        const types = new Set<string>();
        equipmentList.forEach(eq => types.add(eq.type));
        return Array.from(types);
    }, [equipmentList]);

    const filteredEquipment = useMemo(() => {
        let currentFilteredList = equipmentList;

        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            currentFilteredList = currentFilteredList.filter(equipment =>
                equipment.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                equipment.serialNumber.toLowerCase().includes(lowerCaseSearchTerm) ||
                equipment.type.toLowerCase().includes(lowerCaseSearchTerm)
            );
        }

        if (filterCondition) {
            currentFilteredList = currentFilteredList.filter(equipment => equipment.condition === filterCondition);
        }

        if (filterType) {
            currentFilteredList = currentFilteredList.filter(equipment => equipment.type === filterType);
        }

        return currentFilteredList;
    }, [equipmentList, searchTerm, filterCondition, filterType]);

    const handleCheckboxChange = useCallback((id: number) => {
        setSelectedEquipment(prevSelected =>
            prevSelected.includes(id)
                ? prevSelected.filter(eqId => eqId !== id)
                : [...prevSelected, id]
        );
    }, []);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, []);

    const handleConditionFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterCondition(e.target.value as EquipmentCondition | '');
    }, []);

    const handleTypeFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterType(e.target.value);
    }, []);

    const handleRequestSelected = useCallback(() => {
        if (selectedEquipment.length > 0) {
            const selectedAvailableEquipment = selectedEquipment.filter(id => {
                const eq = equipmentList.find(e => e.id === id);
                return eq && eq.condition === EquipmentCondition.AVAILABLE;
            });

            if (selectedAvailableEquipment.length > 0) {
                const idsParam = selectedAvailableEquipment.join(',');
                router.push(`/request?ids=${idsParam}`);
            } else {
                alert("Please select available equipment to request.");
            }
        } else {
            alert("Please select at least one piece of equipment to request.");
        }
    }, [selectedEquipment, equipmentList, router]);


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
                <p className="text-gray-700 dark:text-gray-300">Loading equipment data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 p-4 rounded-lg">
                <p className="text-xl font-semibold mb-4">Error: {error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Available Equipment</h1>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Filters & Search</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label htmlFor="search" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Search Equipment</label>
                        <input
                            type="text"
                            id="search"
                            placeholder="Search by name, serial number, or type..."
                            className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <div>
                        <label htmlFor="conditionFilter" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Filter by Condition</label>
                        <select
                            id="conditionFilter"
                            className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={filterCondition}
                            onChange={handleConditionFilterChange}
                        >
                            <option value="">All Conditions</option>
                            {Object.values(EquipmentCondition).map(condition => (
                                <option key={condition} value={condition}>{condition.replace(/_/g, ' ')}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="typeFilter" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Filter by Type</label>
                        <select
                            id="typeFilter"
                            className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={filterType}
                            onChange={handleTypeFilterChange}
                        >
                            <option value="">All Types</option>
                            {availableEquipmentTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {filteredEquipment.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
                    <p className="text-gray-600 dark:text-gray-400 text-lg">No equipment found matching your criteria.</p>
                </div>
            ) : (
                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="p-4">
                                    <div className="flex items-center">
                                        <input
                                            id="checkbox-all-search"
                                            type="checkbox"
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedEquipment(filteredEquipment.filter(eq => eq.condition === EquipmentCondition.AVAILABLE).map(eq => eq.id));
                                                } else {
                                                    setSelectedEquipment([]);
                                                }
                                            }}
                                            checked={selectedEquipment.length > 0 && selectedEquipment.length === filteredEquipment.filter(eq => eq.condition === EquipmentCondition.AVAILABLE).length}
                                        />
                                        <label htmlFor="checkbox-all-search" className="sr-only">checkbox</label>
                                    </div>
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Equipment Name
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Serial Number
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Type
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Room
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Condition
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEquipment.map((equipment) => (
                                <tr key={equipment.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="w-4 p-4">
                                        <div className="flex items-center">
                                            <input
                                                id={`checkbox-table-search-${equipment.id}`}
                                                type="checkbox"
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                checked={selectedEquipment.includes(equipment.id)}
                                                onChange={() => handleCheckboxChange(equipment.id)}
                                                disabled={equipment.condition !== EquipmentCondition.AVAILABLE}
                                            />
                                            <label htmlFor={`checkbox-table-search-${equipment.id}`} className="sr-only">checkbox</label>
                                        </div>
                                    </td>
                                    <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                                        <img className="w-10 h-10 rounded-full" src={equipment.pathToPhoto} alt={`${equipment.name} image`} />
                                        <div className="ps-3">
                                            <div className="text-base font-semibold">{equipment.name}</div>
                                        </div>
                                    </th>
                                    <td className="px-6 py-4">
                                        {equipment.serialNumber}
                                    </td>
                                    <td className="px-6 py-4">
                                        {equipment.type}
                                    </td>
                                    <td className="px-6 py-4">
                                        {equipment.room}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className={`h-2.5 w-2.5 rounded-full ${getConditionColor(equipment.condition)} me-2`}></div>
                                            {equipment.condition.replace(/_/g, ' ')}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {user && !user.isAdmin && (
                <div className="flex justify-end mt-6">
                    <button
                        onClick={handleRequestSelected}
                        disabled={selectedEquipment.length === 0}
                        className={`px-6 py-3 rounded-lg text-white font-semibold transition-colors duration-200
                        ${selectedEquipment.length === 0
                                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
                            }`}
                    >
                        Request Selected Equipment ({selectedEquipment.length})
                    </button>
                </div>
            )}
        </div>
    );
}