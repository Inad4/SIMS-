import { User } from "./user"
import { Equipment } from "./equipment"

export interface School {
    id: number;
    name: string;
    city: string | null;
    address: string | null;
    updatedAt: string | null;
    createdAt: string | null;
    users: User[] | null;
    equipment: Equipment[] | null;
}
