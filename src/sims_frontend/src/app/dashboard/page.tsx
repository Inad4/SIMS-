
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { redirect } from 'next/navigation';
import DashboardContent from './dashboard';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your_super_secret_jwt_key');

interface UserPayload {
    userId: string;
}

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    let user: UserPayload | null = null;

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET, {
            algorithms: ['HS256'],
        });
        user = payload as unknown as UserPayload;
    } catch (e) {
        //console.error("Failed to verify token in DashboardPage:", e);
    }

    //return <DashboardContent user={user} />;
    return <DashboardContent user={{userId: "some_user_id"}} />;
    
}