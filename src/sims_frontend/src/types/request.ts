
import { Equipment } from './equipment';
import { User } from './user';

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
    startDate: string;
    returnDate: string;
    checkoutDate: string | null;
    returnedAt: string | null;
    updatedAt: string | null;
    createdAt: string | null;

    equipment: Equipment[];
    userId: string;
    user: User;
}