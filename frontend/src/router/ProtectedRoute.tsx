import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store";
import {ForbiddenPage} from "@/page";

interface ProtectedRouteProps {
    requiredRole?: string;
}

export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
    const { isAuthenticated, user, isLoading } = useAuthStore();

    if (isLoading) return <div>Loading...</div>;

    if (!isAuthenticated) return <Navigate to="/auth/login" replace />;

    if (requiredRole && user?.role !== requiredRole) {
        return <ForbiddenPage />;
    }

    return <Outlet />;
}
