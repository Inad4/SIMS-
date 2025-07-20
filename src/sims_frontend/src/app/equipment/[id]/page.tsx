'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import { Equipment, EquipmentCondition } from '@/types/equipment';
import { getConditionColor } from '@/utils/utils';

export default function EquipmentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const id = params.id;

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchEquipmentDetail = async () => {
        setLoading(true);
        setError(null);
        try {
          const foundEquipment = { id: 1, name: 'Projector Epson EX3260', room: 201, pathToPhoto: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Projector', condition: EquipmentCondition.AVAILABLE, type: 'Projector', serialNumber: 'PRJ-EP3260-001', createdAt: '2023-01-15T10:00:00Z', updatedAt: '2024-06-01T14:30:00Z' };
          if (foundEquipment) {
            setEquipment(foundEquipment);
          } else {
            setError('Equipment not found');
          }
        } catch (err) {
          setError('Failed to fetch equipment details');
        } finally {
          setLoading(false);
        }
      };
      fetchEquipmentDetail();
    }
  }, [id, router]);

  if (loading) return <div>Loading equipment details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!equipment) return <div>Equipment not found.</div>;

  return (
    <div className="container mx-auto p-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg mt-8">
      <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">{equipment.name}</h1>
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        <img src={equipment.pathToPhoto} alt={equipment.name} className="w-64 h-64 object-cover rounded-lg shadow-md" />
        <div>
          <p className="text-xl text-gray-800 dark:text-gray-200 mb-2">Type: {equipment.type}</p>
          <p className="text-xl text-gray-800 dark:text-gray-200 mb-2">Serial Number: {equipment.serialNumber}</p>
          <p className="text-xl text-gray-800 dark:text-gray-200 mb-2">Room: {equipment.room}</p>
          <p className="text-xl text-gray-800 dark:text-gray-200 mb-2">Condition: <span className={`px-3 py-1 rounded-full font-semibold ${getConditionColor(equipment.condition as any)}`}>{equipment.condition.replace(/_/g, ' ')}</span></p>
          {equipment.createdAt && <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">Created: {new Date(equipment.createdAt).toLocaleDateString()}</p>}
          {equipment.updatedAt && <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated: {new Date(equipment.updatedAt).toLocaleDateString()}</p>}
        </div>
      </div>
      <button onClick={() => router.back()} className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
        Back to List
      </button>
    </div>
  );
}