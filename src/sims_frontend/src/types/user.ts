export interface User {
    id: string;
    userName?: string | null;
    email: string;
    firstName: string;
    lastName: string;
    updatedAt: string | null;
    createdAt: string | null;
    schoolId: number;
    school?: {
        id: number;
        name: string;
    };
    isAdmin?: boolean;
}