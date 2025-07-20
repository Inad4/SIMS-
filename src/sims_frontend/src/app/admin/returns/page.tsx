'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Equipment, EquipmentCondition } from '@/types/equipment';
import { getConditionColor } from '@/utils/utils';

export default function LogReturnPage() {
    const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
    const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedEquipmentForReturn, setSelectedEquipmentForReturn] = useState<Equipment | null>(null);
    const [newCondition, setNewCondition] = useState<EquipmentCondition | ''>('');
    const [returnNotes, setReturnNotes] = useState<string>('');
    const [returnError, setReturnError] = useState<string | null>(null);
    const [returnSuccess, setReturnSuccess] = useState<string | null>(null);

    const dummyAllEquipmentData: Equipment[] = [
        { id: 1, name: 'Projector Epson EX3260', room: 201, pathToPhoto: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Projector', condition: EquipmentCondition.AVAILABLE, type: 'Projector', serialNumber: 'PRJ-EP3260-001', createdAt: '2023-01-15T10:00:00Z', updatedAt: '2024-06-01T14:30:00Z' },
        { id: 2, name: 'Laptop Dell XPS 15', room: 105, pathToPhoto: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Laptop', condition: EquipmentCondition.CHECKED_OUT, type: 'Laptop', serialNumber: 'LAP-DEL-XPS15-005', createdAt: '2022-11-20T08:00:00Z', updatedAt: '2024-07-10T09:15:00Z' },
        { id: 3, name: '3D Printer Creality Ender 3', room: 302, pathToPhoto: 'https://via.placeholder.com/150/008000/FFFFFF?text=3D+Printer', condition: EquipmentCondition.UNDER_REPAIR, type: '3D Printer', serialNumber: '3DP-CRE-END3-010', createdAt: '2023-03-01T11:00:00Z', updatedAt: '2024-07-17T16:00:00Z' },
        { id: 4, name: 'Server Rack HP ProLiant', room: 400, pathToPhoto: 'https://via.placeholder.com/150/800080/FFFFFF?text=Server', condition: EquipmentCondition.RETIRED, type: 'Server', serialNumber: 'SRV-HP-PROL-001', createdAt: '2021-05-01T09:00:00Z', updatedAt: '2024-02-14T10:00:00Z' },
        { id: 5, name: 'Microscope Lab-X 2000', room: 101, pathToPhoto: 'https://via.placeholder.com/150/FFFF00/000000?text=Microscope', condition: EquipmentCondition.AVAILABLE, type: 'Microscope', serialNumber: 'MIC-LBX-2000-003', createdAt: '2023-05-01T09:00:00Z', updatedAt: '2024-01-20T11:00:00Z' },
        { id: 6, name: 'Camera Canon EOS R5', room: 205, pathToPhoto: 'https://via.placeholder.com/150/FF8C00/FFFFFF?text=Camera', condition: EquipmentCondition.CHECKED_OUT, type: 'Camera', serialNumber: 'CAM-CAN-R5-002', createdAt: '2022-09-10T14:00:00Z', updatedAt: '2024-07-16T10:00:00Z' },
    ];

    useEffect(() => {
        const fetchEquipment = async () => {
            setLoading(true);
            setError(null);
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                setAllEquipment(dummyAllEquipmentData);
                setFilteredEquipment(dummyAllEquipmentData.filter(eq => eq.condition === EquipmentCondition.CHECKED_OUT));
            } catch (err) {
                console.error("Failed to fetch equipment:", err);
                setError("Failed to load equipment. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchEquipment();
    }, []);

    useEffect(() => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const results = allEquipment.filter(item =>
            item.condition === EquipmentCondition.CHECKED_OUT &&
            (item.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                item.serialNumber.toLowerCase().includes(lowerCaseSearchTerm) ||
                item.type.toLowerCase().includes(lowerCaseSearchTerm))
        );
        setFilteredEquipment(results);
    }, [searchTerm, allEquipment]);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, []);

    const handleSelectEquipment = useCallback((equipment: Equipment) => {
        setSelectedEquipmentForReturn(equipment);
        setNewCondition(equipment.condition);
        setReturnNotes('');
        setReturnSuccess(null);
        setReturnError(null);
    }, []);

    const handleSubmitReturn = async (e: React.FormEvent) => {
        e.preventDefault();
        setReturnError(null);
        setReturnSuccess(null);

        if (!selectedEquipmentForReturn) {
            setReturnError("No equipment selected for return.");
            return;
        }
        if (!newCondition) {
            setReturnError("Please select a new condition for the equipment.");
            return;
        }

        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            const updatedEquipment: Equipment = {
                ...selectedEquipmentForReturn,
                condition: newCondition as EquipmentCondition,
                updatedAt: new Date().toISOString()
            };

            setAllEquipment(prev => prev.map(eq =>
                eq.id === updatedEquipment.id ? updatedEquipment : eq
            ));

            setReturnSuccess(`Equipment "${selectedEquipmentForReturn.name}" (SN: ${selectedEquipmentForReturn.serialNumber}) returned and condition updated to ${newCondition.replace(/_/g, ' ')}.`);
            setSelectedEquipmentForReturn(null);
            setNewCondition('');
            setReturnNotes('');

        } catch (err) {
            console.error("Failed to log return:", err);
            setReturnError("Failed to log return. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (loading && allEquipment.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <p className="text-gray-700 dark:text-gray-300">Loading equipment list...</p>
            </div>
        );
    }

    return (
        <section className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Log Equipment Return</h1>
                    <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                        Back to Dashboard
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Search for Checked Out Equipment</h2>
                    <input
                        type="text"
                        placeholder="Search by name, serial, or type..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    />

                    {loading ? (
                        <p className="text-center text-gray-600 dark:text-gray-400 mt-4">Searching...</p>
                    ) : (
                        filteredEquipment.length === 0 ? (
                            <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
                                No checked out equipment found matching your search.
                            </p>
                        ) : (
                            <div className="mt-6 space-y-4 max-h-60 overflow-y-auto pr-2">
                                {filteredEquipment.map(eq => (
                                    <div
                                        key={eq.id}
                                        onClick={() => handleSelectEquipment(eq)}
                                        className={`flex items-center p-3 rounded-md border cursor-pointer
                                                    ${selectedEquipmentForReturn?.id === eq.id
                                                        ? 'bg-blue-100 border-blue-400 dark:bg-blue-900 dark:border-blue-700'
                                                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600'
                                                    }
                                                    transition-colors duration-200`}
                                    >
                                        <img src={eq.pathToPhoto} alt={eq.name} className="w-10 h-10 rounded-full mr-3" />
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{eq.name}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">SN: {eq.serialNumber} | Room: {eq.room}</p>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getConditionColor(eq.condition)}`}>
                                                {eq.condition.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>

                {selectedEquipmentForReturn && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Return Details for:</h2>
                        <div className="flex items-center mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                            <img src={selectedEquipmentForReturn.pathToPhoto} alt={selectedEquipmentForReturn.name} className="w-16 h-16 rounded-full mr-4 object-cover" />
                            <div>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">{selectedEquipmentForReturn.name}</p>
                                <p className="text-gray-700 dark:text-gray-300">Serial: {selectedEquipmentForReturn.serialNumber}</p>
                                <p className="text-gray-700 dark:text-gray-300">Current Condition: <span className={`${getConditionColor(selectedEquipmentForReturn.condition)} px-2 py-0.5 rounded-full text-sm`}>{selectedEquipmentForReturn.condition.replace(/_/g, ' ')}</span></p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmitReturn} className="space-y-4">
                            <div>
                                <label htmlFor="newCondition" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">New Condition</label>
                                <select
                                    id="newCondition"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    value={newCondition}
                                    onChange={(e) => setNewCondition(e.target.value as EquipmentCondition)}
                                    required
                                >
                                    <option value="">Select Condition</option>
                                    {Object.values(EquipmentCondition).map(condition => (
                                        <option key={condition} value={condition}>
                                            {condition.replace(/_/g, ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="returnNotes" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Return Notes (Optional)</label>
                                <textarea
                                    id="returnNotes"
                                    rows={3}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    placeholder="Notes on returned item's state, damages, etc."
                                    value={returnNotes}
                                    onChange={(e) => setReturnNotes(e.target.value)}
                                ></textarea>
                            </div>

                            {returnError && (
                                <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
                                    {returnError}
                                </div>
                            )}
                            {returnSuccess && (
                                <div className="p-3 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-200 dark:text-green-800" role="alert">
                                    {returnSuccess}
                                </div>
                            )}

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setSelectedEquipmentForReturn(null)}
                                    className="px-5 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                    {loading ? 'Submitting...' : 'Log Return'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </section>
    );
}