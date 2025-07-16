
interface UserPayload {
    userId: string;
}


export default async function DashboardContent({ user }: { user: UserPayload | null }) {

    return(
        <div>
            <h1>Dashboard</h1>
            <br />
            <p>You are {user ? "" : "not "} logged in</p>
        </div>
    );
}