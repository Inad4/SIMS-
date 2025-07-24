'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Equipment, EquipmentCondition } from '@/types/equipment';
import { getConditionColor } from '@/utils/utils';
import { generateQrCodePdf } from '@/utils/utils';
import Image from 'next/image';


interface PageProps {
  params: Promise<{
    id: string;
  }>;
}


export default function EquipmentDetailPage({ params }: PageProps) {
  const router = useRouter();
  
  const { id } = params as unknown as {id: string;};
  const user = { role: "admin" };

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleQrCodeGeneration = async () => {
    if (equipment){
      generateQrCodePdf(`${location.origin}/equipment/${equipment?.id}`, `asset_${equipment?.name}_${equipment?.serialNumber}_qrcode`);
    } else{
      console.log("Unexpected error");
    }
  }

  useEffect(() => {
    if (id) {
      const fetchEquipmentDetail = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE}/equipment/${id}`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("jwt")}`
                }
            });

            const data = await response.json();
            if (!response.ok) {
                setError(data.message || "Equipment fetch failed. Try again");
                return;
            }
            
            setEquipment(data);
        } catch (error) {
            console.error('Login error:', error);
            setError("An unexpected error occurred. Please try again.");
        } finally{
          setLoading(false);
        }
      };
      fetchEquipmentDetail();
    }
  }, [id, router]);

  if (loading) return <div>Loading equipment details...</div>;
  if (!error && !equipment) setError("Equipment Not Found");
  if (error) {
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
  if (!equipment) return <></>;
  return (
    <div className="container mx-auto p-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg mt-8">
      <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">{equipment.name}</h1>
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        <Image src={equipment.pathToPhoto} alt={equipment.name} className="w-64 h-64 object-cover rounded-lg shadow-md" />
        <div>
          <p className="text-xl text-gray-800 dark:text-gray-200 mb-2">Type: {equipment.type}</p>
          <p className="text-xl text-gray-800 dark:text-gray-200 mb-2">Serial Number: {equipment.serialNumber}</p>
          <p className="text-xl text-gray-800 dark:text-gray-200 mb-2">Room: {equipment.room}</p>
          <p className="text-xl text-gray-800 dark:text-gray-200 mb-2">Condition: <span className={`px-3 py-1 rounded-full font-semibold ${getConditionColor(equipment.condition)}`}>{equipment.condition.replace(/_/g, ' ')}</span></p>
          {equipment.createdAt && <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">Created: {new Date(equipment.createdAt).toLocaleDateString()}</p>}
          {equipment.updatedAt && <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated: {new Date(equipment.updatedAt).toLocaleDateString()}</p>}
        </div>
      </div>
      {user.role === "admin" && equipment.condition === EquipmentCondition.CHECKED_OUT && 
      <><button onClick={handleQrCodeGeneration} className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
        Log Return
      </button><br /></>
      }
      <button onClick={handleQrCodeGeneration} className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
        Generate Qr Code
      </button>
      <br />
      <button onClick={() => router.back()} className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
        Back to Dashboard
      </button>
    </div>
  );
}