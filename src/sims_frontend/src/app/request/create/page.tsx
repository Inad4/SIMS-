"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Equipment, EquipmentCondition, User } from '@/types';

export default function RequestFormPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedEquipmentDetails, setSelectedEquipmentDetails] = useState<Equipment[]>([]);
    const [startDate, setStartDate] = useState<string>('');
    const [returnDate, setReturnDate] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const dummyCurrentUser: User = {
        id: "user123",
        email: "current.user@example.com",
        firstName: "Current",
        lastName: "User",
        schoolId: 1,
        createdAt: null,
        updatedAt: null,
        isAdmin: false
    };

    useEffect(() => {
        const idsParam = searchParams.get('ids');
        if (idsParam) {
            try {
                const equipmentIds = idsParam.split(',').map(Number);

                const dummyAllEquipment: Equipment[] = [
                    { id: 1, name: 'Projector Epson EX3260', room: 201, pathToPhoto: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Projector', condition: EquipmentCondition.AVAILABLE, type: 'Projector', serialNumber: 'PRJ-EP3260-001', createdAt: '2023-01-15T10:00:00Z', updatedAt: '2024-06-01T14:30:00Z' },
                    { id: 2, name: 'Laptop Dell XPS 15', room: 105, pathToPhoto: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Laptop', condition: EquipmentCondition.CHECKED_OUT, type: 'Laptop', serialNumber: 'LAP-DEL-XPS15-005', createdAt: '2022-11-20T08:00:00Z', updatedAt: '2024-07-10T09:15:00Z' },
                    { id: 3, name: '3D Printer Creality Ender 3', room: 302, pathToPhoto: 'https://via.placeholder.com/150/008000/FFFFFF?text=3D+Printer', condition: EquipmentCondition.UNDER_REPAIR, type: '3D Printer', serialNumber: '3DP-CRE-END3-010', createdAt: '2023-03-01T11:00:00Z', updatedAt: '2024-07-17T16:00:00Z' },
                    { id: 4, name: 'Server Rack HP ProLiant', room: 400, pathToPhoto: 'https://via.placeholder.com/150/800080/FFFFFF?text=Server', condition: EquipmentCondition.RETIRED, type: 'Server', serialNumber: 'SRV-HP-PROL-001', createdAt: '2021-05-01T09:00:00Z', updatedAt: '2024-02-14T10:00:00Z' },
                    { id: 5, name: 'Microscope Lab-X 2000', room: 101, pathToPhoto: 'https://via.placeholder.com/150/FFFF00/000000?text=Microscope', condition: EquipmentCondition.AVAILABLE, type: 'Microscope', serialNumber: 'MIC-LBX-2000-003', createdAt: '2023-05-01T09:00:00Z', updatedAt: '2024-01-20T11:00:00Z' },
                    { id: 6, name: 'Camera Canon EOS R5', room: 205, pathToPhoto: 'https://via.placeholder.com/150/FF8C00/FFFFFF?text=Camera', condition: EquipmentCondition.CHECKED_OUT, type: 'Camera', serialNumber: 'CAM-CAN-R5-002', createdAt: '2022-09-10T14:00:00Z', updatedAt: '2024-07-16T10:00:00Z' },
                ];

                const fetchedSelectedEquipment = dummyAllEquipment.filter(eq => equipmentIds.includes(eq.id) && eq.condition === EquipmentCondition.AVAILABLE);
                setSelectedEquipmentDetails(fetchedSelectedEquipment);
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
            userId: dummyCurrentUser.id,
        };

        console.log("Submitting Request:", newRequestPayload);
        alert("Request submitted! (Check console for data)");

        router.push('/dashboard');
    };

        // Dummy data for all available equipment
        const dummyAllEquipment: Equipment[] = [
          {
            id: 1,
            name: "Projector Epson EX3260",
            room: 201,
            pathToPhoto:
              "https://via.placeholder.com/150/0000FF/FFFFFF?text=Projector",
            condition: EquipmentCondition.AVAILABLE,
            type: "Projector",
            serialNumber: "PRJ-EP3260-001",
            createdAt: "2023-01-15T10:00:00Z",
            updatedAt: "2024-06-01T14:30:00Z",
          },
          {
            id: 2,
            name: "Laptop Dell XPS 15",
            room: 105,
            pathToPhoto:
              "https://via.placeholder.com/150/FF0000/FFFFFF?text=Laptop",
            condition: EquipmentCondition.CHECKED_OUT,
            type: "Laptop",
            serialNumber: "LAP-DEL-XPS15-005",
            createdAt: "2022-11-20T08:00:00Z",
            updatedAt: "2024-07-10T09:15:00Z",
          },
          {
            id: 3,
            name: "3D Printer Creality Ender 3",
            room: 302,
            pathToPhoto:
              "https://via.placeholder.com/150/008000/FFFFFF?text=3D+Printer",
            condition: EquipmentCondition.UNDER_REPAIR,
            type: "3D Printer",
            serialNumber: "3DP-CRE-END3-010",
            createdAt: "2023-03-01T11:00:00Z",
            updatedAt: "2024-07-17T16:00:00Z",
          },
          {
            id: 4,
            name: "Server Rack HP ProLiant",
            room: 400,
            pathToPhoto:
              "https://via.placeholder.com/150/800080/FFFFFF?text=Server",
            condition: EquipmentCondition.RETIRED,
            type: "Server",
            serialNumber: "SRV-HP-PROL-001",
            createdAt: "2021-05-01T09:00:00Z",
            updatedAt: "2024-02-14T10:00:00Z",
          },
          {
            id: 5,
            name: "Microscope Lab-X 2000",
            room: 101,
            pathToPhoto:
              "https://via.placeholder.com/150/FFFF00/000000?text=Microscope",
            condition: EquipmentCondition.AVAILABLE,
            type: "Microscope",
            serialNumber: "MIC-LBX-2000-003",
            createdAt: "2023-05-01T09:00:00Z",
            updatedAt: "2024-01-20T11:00:00Z",
          },
          {
            id: 6,
            name: "Camera Canon EOS R5",
            room: 205,
            pathToPhoto:
              "https://via.placeholder.com/150/FF8C00/FFFFFF?text=Camera",
            condition: EquipmentCondition.CHECKED_OUT,
            type: "Camera",
            serialNumber: "CAM-CAN-R5-002",
            createdAt: "2022-09-10T14:00:00Z",
            updatedAt: "2024-07-16T10:00:00Z",
          },
        ];

        const fetchedSelectedEquipment = dummyAllEquipment.filter(
          (eq) =>
            equipmentIds.includes(eq.id) &&
            eq.condition === EquipmentCondition.AVAILABLE,
        );
        setSelectedEquipmentDetails(fetchedSelectedEquipment);
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

    // Construct the message based on selected equipment and dates
    const equipmentNames = selectedEquipmentDetails
      .map((eq) => `${eq.name} (SN: ${eq.serialNumber})`)
      .join(", ");
    const requestMessage = `Request for: ${equipmentNames}. From: ${startDate} To: ${returnDate}. ${message ? `Notes: ${message}` : ""}`;

    const newRequestPayload = {
      message: requestMessage, // Using the combined message string
      equipmentIds: selectedEquipmentDetails.map((eq) => eq.id),
      userId: dummyCurrentUser.id, // Assigning the dummy user ID
      // startDate and returnDate are now embedded in the message string
      // They are not separate fields in the EquipmentRequest type
    };

    console.log("Submitting Request:", newRequestPayload);
    alert("Request submitted! (Check console for data)");

    // Simulate API call
    // const response = await fetch('/api/equipment-requests', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(newRequestPayload)
    // });
    // if (response.ok) {
    //     router.push('/request-success'); // Redirect to a success page
    // } else {
    //     const errorData = await response.json();
    //     setError(errorData.message || "Failed to submit request.");
    // }

    router.push("/dashboard"); // Redirect to dashboard after submission
  };

  if (loading) {
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

  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center py-8">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto w-full max-w-2xl">
        <Link
          href="/dashboard"
          className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
        >
          <Image
            className="w-8 h-8 mr-2 rounded-full"
            src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg"
            alt="logo"
          />
          SIMS
        </Link>
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
                {selectedEquipmentDetails.map((eq) => (
                  <li key={eq.id} className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">{eq.name}</span> (Serial:{" "}
                    {eq.serialNumber})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No equipment selected.
              </p>
            )}

            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="startDate"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Start Date
                </label>
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
                <label
                  htmlFor="returnDate"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Return Date
                </label>
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
                <label
                  htmlFor="message"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Message (Optional)
                </label>
                <textarea
                  id="message" // Changed from 'notes' to 'message'
                  rows={4}
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Any special requirements or details..."
                  value={message} // Changed from 'notes' to 'message'
                  onChange={(e) => setMessage(e.target.value)} // Changed from 'setNotes' to 'setMessage'
                ></textarea>
              </div>

              {error && (
                <div
                  className="p-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 transition-colors duration-200"
              >
                Submit Request
              </button>
              <Link
                href="/dashboard"
                className="w-full text-center block text-gray-500 hover:underline dark:text-gray-400"
              >
                Back to Dashboard
              </Link>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
