import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
  publicOnly?: boolean;
}

export function ProtectedRoute({
  children,
  adminOnly = false,
  publicOnly = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null; // or a loading spinner
  }

  if (publicOnly && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!publicOnly) {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (adminOnly && !isAdmin) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
