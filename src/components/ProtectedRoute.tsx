import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: "admin" | "customer" | null;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { user, isLoading } = useAuth();

  // If auth is still loading, show nothing
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If role is specified and user doesn't have that role, redirect
  if (role && user.role !== role) {
    // Redirect admin to admin dashboard, customers to home
    const redirectPath = user.role === "admin" ? "/admin/dashboard" : "/";
    return <Navigate to={redirectPath} replace />;
  }

  // Otherwise, render the protected component
  return <>{children}</>;
};

export default ProtectedRoute;
