'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Equipment, EquipmentStatus, User, School } from '@/types';
import { getConditionColor } from '@/utils/utils';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

interface DashboardContentProps {
    user: User;
}

export default function DashboardContent({ user }: DashboardContentProps) {
    const router = useRouter();
    const searchParams = useSearchParams();


    const [school, setSchool] = useState<School | null>(null); // Stores all fetched equipment
    const [selectedEquipmentList, setSelectedEquipmentList] = useState<Equipment[]>([]); // Stores full selected equipment objects
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('search') || '');
    const [filterCondition, setFilterCondition] = useState<EquipmentStatus | ''>(
        (searchParams.get('condition') as EquipmentStatus) || ''
    );
    const [filterType, setFilterType] = useState<string>(searchParams.get('type') || '');
    const [selectionMode, setSelectionMode] = useState<boolean>(false);


    useEffect(() => {
        const fetchSchool = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE}/api/School/${user.schoolId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("jwt")}`
                    }
                });
                if (!res.ok){
                    setError("Failed to fetch school data");
                }
                const obj = await res.json();
                setSchool(obj);
            } catch (err) {
                console.error("Failed to fetch equipment:", err);
                setError("Failed to load equipment. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchSchool();
    }, []);


    // Effect to update URL whenever search/filter states change
    useEffect(() => {
        const currentParams = new URLSearchParams(searchParams.toString());

        if (searchTerm) {
        currentParams.set('search', searchTerm);
        } else {
        currentParams.delete('search');
        }

        if (filterCondition) {
        currentParams.set('condition', filterCondition);
        } else {
        currentParams.delete('condition');
        }

        if (filterType) {
        currentParams.set('type', filterType);
        } else {
        currentParams.delete('type');
        }

        router.replace(`?${currentParams.toString()}`, { scroll: false });
    }, [searchTerm, filterCondition, filterType, router, searchParams]);


    const availableEquipmentTypes = useMemo(() => {
        const types = new Set<string>();
        school?.equipment?.forEach(eq => types.add(eq.type));
        return Array.from(types);
    }, [school]);

    const filteredEquipment = useMemo(() => {
        // Start with all equipment, then filter out selected ones if in selection mode
        let currentFilteredList = school?.equipment?.filter(eq =>
            !selectionMode || !selectedEquipmentList.some(selectedEq => selectedEq.id === eq.id)
        );

        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            currentFilteredList = currentFilteredList?.filter(equipment =>
                equipment.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                equipment.serialNumber.toLowerCase().includes(lowerCaseSearchTerm) ||
                equipment.type.toLowerCase().includes(lowerCaseSearchTerm)
            );
        }

        if (filterCondition) {
            currentFilteredList = currentFilteredList?.filter(equipment => equipment.status === filterCondition);
        }

        if (filterType) {
            currentFilteredList = currentFilteredList?.filter(equipment => equipment.type === filterType);
        }

        return currentFilteredList;
    }, [school, selectedEquipmentList, searchTerm, filterCondition, filterType, selectionMode]);

    // Only available items from the currently filtered list (i.e., not selected yet)
    const availableFilteredEquipment = useMemo(() => {
        return filteredEquipment?.filter(eq => eq.status === EquipmentStatus.AVAILABLE);
    }, [filteredEquipment]);

    const handleCheckboxChange = useCallback((equipment: Equipment, isSelected: boolean) => {
        if (isSelected) {
            setSelectedEquipmentList(prevSelected => [...prevSelected, equipment]);
        } else {
            setSelectedEquipmentList(prevSelected => prevSelected.filter(eq => eq.id !== equipment.id));
        }
    }, []);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, []);

    const handleConditionFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterCondition(e.target.value as EquipmentStatus | '');
    }, []);

    const handleTypeFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterType(e.target.value);
    }, []);

    const handleRequestSelected = useCallback(() => {
        if (selectedEquipmentList.length > 0) {
            const idsParam = selectedEquipmentList.map(eq => eq.id).join(',');
            router.push(`/request/create?ids=${idsParam}`);
        } else {
            alert("Please select at least one piece of equipment to request.");
        }
    }, [selectedEquipmentList, router]);

    const handleToggleSelectionMode = useCallback(() => {
        setSelectionMode(prevMode => !prevMode);
        // Clear selections when exiting selection mode
        if (selectionMode) {
            setSelectedEquipmentList([]);
        }
    }, [selectionMode]);

    const handleRowClick = useCallback((equipmentId: number) => {
        if (!selectionMode) {
            router.push(`/equipment/${equipmentId}`);
        }
    }, [router, selectionMode]);

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

            {/* Selected Equipment Section (Only visible in selection mode or if items are selected) */}
            {(selectionMode || selectedEquipmentList.length > 0) && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Selected Equipment ({selectedEquipmentList.length})</h2>
                    {selectedEquipmentList.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="p-4">Deselect</th>
                                        <th scope="col" className="px-6 py-3">Equipment Name</th>
                                        <th scope="col" className="px-6 py-3">Serial Number</th>
                                        <th scope="col" className="px-6 py-3">Type</th>
                                        <th scope="col" className="px-6 py-3">Room</th>
                                        <th scope="col" className="px-6 py-3">Condition</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedEquipmentList.map((equipment) => (
                                        <tr key={`selected-${equipment.id}`} className="bg-blue-50 dark:bg-blue-950 border-b dark:border-gray-700">
                                            <td className="w-4 p-4">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600"
                                                    checked={true} // Always checked in this section
                                                    onChange={() => handleCheckboxChange(equipment, false)} // Deselect
                                                />
                                            </td>
                                            <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                                                <Image className="w-10 h-10 rounded-full" src={equipment.pathToPhoto} alt={`${equipment.name} image`} />
                                                <div className="ps-3">
                                                    <div className="text-base font-semibold">{equipment.name}</div>
                                                </div>
                                            </th>
                                            <td className="px-6 py-4">{equipment.serialNumber}</td>
                                            <td className="px-6 py-4">{equipment.type}</td>
                                            <td className="px-6 py-4">{equipment.room}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className={`h-2.5 w-2.5 rounded-full ${getConditionColor(equipment.status)} me-2`}></div>
                                                    {equipment.status.replace(/_/g, ' ')}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-600 dark:text-gray-400">No equipment currently selected.</p>
                    )}

                    {user && (
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={handleRequestSelected}
                                className={`px-6 py-3 rounded-lg text-white font-semibold transition-colors duration-200
                                ${selectedEquipmentList.length === 0
                                        ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
                                    }`}
                                disabled={selectedEquipmentList.length === 0}
                            >
                                Request Selected Equipment ({selectedEquipmentList.length})
                            </button>
                        </div>
                    )}
                </div>
            )}


            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Available Equipment (Browse & Filter)</h2>
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={handleToggleSelectionMode}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200
                        ${selectionMode
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-green-500 hover:bg-green-600 text-white'
                            }`}
                    >
                        {selectionMode ? 'Exit Selection Mode' : 'Select Equipment for Request'}
                    </button>
                </div>
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
                            {Object.values(EquipmentStatus).map(condition => (
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

            {filteredEquipment?.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
                    <p className="text-gray-600 dark:text-gray-400 text-lg">No equipment found matching your criteria.</p>
                </div>
            ) : (
                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="p-4">
                                    {selectionMode && (
                                        <div className="flex items-center">
                                            <input
                                                id="checkbox-all-search"
                                                type="checkbox"
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                onChange={(e) => {
                                                    if (e.target.checked && availableFilteredEquipment) {
                                                        setSelectedEquipmentList(prevSelected => [
                                                            ...prevSelected,
                                                            ...availableFilteredEquipment.filter(
                                                                eq => !prevSelected.some(pEq => pEq.id === eq.id)
                                                            )
                                                        ]);
                                                    } else {
                                                        setSelectedEquipmentList(prevSelected => prevSelected.filter(
                                                            eq => !availableFilteredEquipment?.some(aEq => aEq.id === eq.id)
                                                        ));
                                                    }
                                                }}
                                                checked={availableFilteredEquipment && availableFilteredEquipment.length > 0 && availableFilteredEquipment.every(eq => selectedEquipmentList.some(sEq => sEq.id === eq.id))}
                                            />
                                            <label htmlFor="checkbox-all-search" className="sr-only">checkbox</label>
                                        </div>
                                    )}
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
                            {filteredEquipment?.map((equipment) => (
                                <tr
                                    key={equipment.id}
                                    className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600
                                    ${!selectionMode ? 'cursor-pointer' : ''}`}
                                    onClick={() => handleRowClick(equipment.id)}
                                >
                                    <td className="w-4 p-4">
                                        {selectionMode && (
                                            <div className="flex items-center">
                                                <input
                                                    id={`checkbox-table-search-${equipment.id}`}
                                                    type="checkbox"
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                    checked={selectedEquipmentList.some(eq => eq.id === equipment.id)}
                                                    onChange={(e) => handleCheckboxChange(equipment, e.target.checked)}
                                                    disabled={equipment.status !== EquipmentStatus.AVAILABLE}
                                                />
                                                <label htmlFor={`checkbox-table-search-${equipment.id}`} className="sr-only">checkbox</label>
                                            </div>
                                        )}
                                    </td>
                                    <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                                        <Image className="w-10 h-10 rounded-full" src={equipment.pathToPhoto} alt={`${equipment.name} image`} />
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
                                            <div className={`h-2.5 w-2.5 rounded-full ${getConditionColor(equipment.status)} me-2`}></div>
                                            {equipment.status.replace(/_/g, ' ')}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}