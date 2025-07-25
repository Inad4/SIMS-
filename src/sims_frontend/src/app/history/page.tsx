"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  EquipmentRequest,
  RequestStatus,
  Equipment,
  User,
  EquipmentCondition,
} from "@/types";
import { getConditionColor } from "@/utils/utils";
import Image from "next/image";

export default function PersonalBorrowingHistoryPage() {
  const [borrowingHistory, setBorrowingHistory] = useState<EquipmentRequest[]>(
    [],
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const dummyCurrentUser: User = {
    id: "user_abc_1",
    email: "user1@example.com",
    firstName: "Alice",
    lastName: "Smith",
    schoolId: 1,
    createdAt: null,
    updatedAt: null,
    isAdmin: false,
  };

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
      pathToPhoto: "https://via.placeholder.com/150/FF0000/FFFFFF?text=Laptop",
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
      pathToPhoto: "https://via.placeholder.com/150/FF8C00/FFFFFF?text=Camera",
      condition: EquipmentCondition.CHECKED_OUT,
      type: "Camera",
      serialNumber: "CAM-CAN-R5-002",
      createdAt: "2022-09-10T14:00:00Z",
      updatedAt: "2024-07-16T10:00:00Z",
    },
  ];

  useEffect(() => {
    const fetchBorrowingHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const dummyRequests: EquipmentRequest[] = await new Promise((resolve) =>
          setTimeout(() => {
            resolve([
              {
                id: 101,
                equipment: [
                  dummyAllEquipment.find((e) => e.id === 1)!,
                  dummyAllEquipment.find((e) => e.id === 5)!,
                ],
                userId: dummyCurrentUser.id,
                user: dummyCurrentUser,
                message:
                  "Request for: Projector Epson EX3260 (SN: PRJ-EP3260-001), Microscope Lab-X 2000 (SN: MIC-LBX-2000-003). From: 2025-08-01 To: 2025-08-05. Notes: Need for presentation in Room 201.",
                status: RequestStatus.APPROVED,
                startDate: "2025-08-01",
                returnDate: "2025-08-05",
                checkoutDate: "2025-07-31T14:00:00Z",
                returnedAt: null,
                createdAt: "2025-07-18T10:00:00Z",
                updatedAt: "2025-07-18T10:00:00Z",
              },
              {
                id: 102,
                equipment: [dummyAllEquipment.find((e) => e.id === 6)!],
                userId: dummyCurrentUser.id,
                user: dummyCurrentUser,
                message:
                  "Request for: Camera Canon EOS R5 (SN: CAM-CAN-R5-002). From: 2025-07-25 To: 2025-07-28. Notes: For a photography project.",
                status: RequestStatus.RETURNED,
                startDate: "2025-07-25",
                returnDate: "2025-07-28",
                checkoutDate: "2025-07-24T09:00:00Z",
                returnedAt: "2025-07-27T16:00:00Z",
                createdAt: "2025-07-19T11:30:00Z",
                updatedAt: "2025-07-27T16:00:00Z",
              },
              {
                id: 103,
                equipment: [dummyAllEquipment.find((e) => e.id === 2)!],
                userId: dummyCurrentUser.id,
                user: dummyCurrentUser,
                message:
                  "Request for: Laptop Dell XPS 15 (SN: LAP-DEL-XPS15-005). From: 2025-08-10 To: 2025-08-15. Notes: Urgent laptop need.",
                status: RequestStatus.PENDING,
                startDate: "2025-08-10",
                returnDate: "2025-08-15",
                checkoutDate: null,
                returnedAt: null,
                createdAt: "2025-07-19T15:00:00Z",
                updatedAt: "2025-07-19T15:00:00Z",
              },
            ]);
          }, 800),
        );

        const userRequests = dummyRequests.filter(
          (req) => req.userId === dummyCurrentUser.id,
        );
        setBorrowingHistory(userRequests);
      } catch (err) {
        console.error("Failed to fetch borrowing history:", err);
        setError("Failed to load borrowing history. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBorrowingHistory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-700 dark:text-gray-300">
          Loading your borrowing history...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 p-4">
        <p className="text-xl font-semibold mb-4">Error: {error}</p>
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Your Borrowing History
          </h1>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Back to Dashboard
          </Link>
        </div>

        {borrowingHistory.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              You have no past borrowing requests.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {borrowingHistory.map((request) => (
              <div
                key={request.id}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4 pb-4 border-b dark:border-gray-700">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Request ID: {request.id}
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      Requested On:{" "}
                      {new Date(request.createdAt!).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getConditionColor(request.status)}`}
                  >
                    {request.status.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    <span className="font-semibold">Requested Period:</span>{" "}
                    {new Date(request.startDate).toLocaleDateString()} -{" "}
                    {new Date(request.returnDate).toLocaleDateString()}
                  </p>
                  {request.checkoutDate && (
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      <span className="font-semibold">Checked Out On:</span>{" "}
                      {new Date(request.checkoutDate).toLocaleDateString()}
                    </p>
                  )}
                  {request.returnedAt && (
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      <span className="font-semibold">Returned On:</span>{" "}
                      {new Date(request.returnedAt).toLocaleDateString()}
                    </p>
                  )}
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Message:</span>{" "}
                    {request.message}
                  </p>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Requested Equipment:
                </h3>
                <ul className="mb-4 space-y-2">
                  {request.equipment && request.equipment.length > 0 ? (
                    request.equipment.map((eq) => (
                      <li
                        key={eq.id}
                        className="flex items-center text-gray-700 dark:text-gray-300"
                      >
                        <Image
                          src={eq.pathToPhoto}
                          alt={eq.name}
                          className="w-8 h-8 rounded-full mr-3"
                        />
                        <span>
                          {eq.name} (Serial: {eq.serialNumber})
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 dark:text-gray-400">
                      No equipment details available.
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
