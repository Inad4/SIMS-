import { User } from "@/types/user";
import { Equipment } from "@/types/equipment";

export enum RequestStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    RETURNED = 'RETURNED'
}

export interface EquipmentRequest {
    id: number;
    message: string;
    status: RequestStatus;
    returnedAt: string | null;
    updatedAt: string | null;
    createdAt: string | null;

    equipment: Equipment[];
    userId: string;
    user: User;

    tempEquipmentIds?: number[];
    startDate?: string;
    returnDate?: string;
}