'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Equipment, EquipmentCondition } from '@/types';

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditEquipmentPage({ params }: PageProps) {
  const router = useRouter();
  const { id: equipmentId } = params as unknown as { id: string };

  const [name, setName] = useState<string>('');
  const [room, setRoom] = useState<string>('');
  const [pathToPhoto, setPathToPhoto] = useState<string>('');
  const [condition, setCondition] = useState<EquipmentCondition>(EquipmentCondition.AVAILABLE);
  const [type, setType] = useState<string>('');
  const [serialNumber, setSerialNumber] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [originalEquipment, setOriginalEquipment] = useState<Equipment | null>(null);

  useEffect(() => {
    if (!equipmentId) {
      setLoading(false);
      setError("Equipment ID is missing.");
      return;
    }

    const fetchEquipment = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_BASE}/api/Equipment/${equipmentId}`;
        const response = await fetch(url, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("jwt")}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setError("Failed to fetch equipment details.");
          return;
        }
        const eq = data as Equipment;

        setOriginalEquipment(eq);
        setName(eq.name);
        setRoom(eq.room.toString());
        setPathToPhoto(eq.pathToPhoto);
        setCondition(eq.condition);
        setType(eq.type);
        setSerialNumber(eq.serialNumber);

      } catch (err: unknown) {
        console.error('Network or unexpected error fetching equipment:', err);
        let errorMessage = 'An unexpected error occurred while fetching equipment. Please check your network connection.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [equipmentId]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

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

    const updatedEquipment: Partial<Equipment> = {
      id: originalEquipment?.id,
      name,
      room: roomNumber,
      pathToPhoto,
      condition: condition,
      type,
      serialNumber,
    };

    try {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_BASE}/api/Equipment/${equipmentId}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("jwt")}`,
        },
        body: JSON.stringify(updatedEquipment),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Error: ${response.statusText} (${response.status})`, errorData);
        setError(errorData.message || `Failed to update equipment.`);
        return;
      }

      setSuccessMessage(`Equipment "${name}" updated successfully!`);
      setTimeout(() => {
        router.push(`/equipment/${equipmentId}`);
      }, 1500);

    } catch (err: unknown) {
      console.error('Network or unexpected error updating equipment:', err);
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
  }, [name, room, pathToPhoto, condition, type, serialNumber, equipmentId, originalEquipment, router]);

  if (loading && !originalEquipment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-700 dark:text-gray-300">Loading equipment details...</p>
      </div>
    );
  }

  if (error && !originalEquipment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 p-4 rounded-lg">
        <p className="text-xl font-semibold mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!originalEquipment) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl font-semibold text-gray-700 dark:text-gray-300">
        Equipment Not Found.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline"> {successMessage}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white pb-8">Edit Equipment: {originalEquipment.name}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <div>
            <label htmlFor="condition" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Condition</label>
            <select
              id="condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value as EquipmentCondition)}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              {Object.values(EquipmentCondition).map((cond) => (
                <option key={cond} value={cond}>
                  {cond.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-center space-x-4">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 rounded-lg text-white font-semibold transition-colors duration-200
              ${loading
                  ? 'bg-blue-400 dark:bg-blue-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
              }`}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 rounded-lg text-gray-700 dark:text-gray-300 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200 focus:ring-4 focus:outline-none focus:ring-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
