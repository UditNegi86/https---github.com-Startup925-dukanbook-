import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../helpers/useAuth";
import { User } from "../helpers/User";
import { AuthErrorPage } from "./AuthErrorPage";
import { ShieldOff } from "lucide-react";
import { AuthLoadingState } from "./AuthLoadingState";
import styles from "./ProtectedRoute.module.css";

type PermissionChecker = (user: User) => boolean;

// Do not use this in pageLayout
const MakeProtectedRoute: (
  permissionChecker: PermissionChecker,
  routeDescription: string
) => React.FC<{
  children: React.ReactNode;
}> =
  (permissionChecker, routeDescription) =>
  ({ children }) => {
    const { authState } = useAuth();

    // Show loading state while checking authentication
    if (authState.type === "loading") {
      return <AuthLoadingState title="Authenticating" />;
    }

    // Redirect to login if not authenticated
    if (authState.type === "unauthenticated") {
      return <Navigate to="/login" replace />;
    }

    // Check if user has permission
    if (!permissionChecker(authState.user)) {
      const userInfo =
        authState.user.userType === "subuser"
          ? `${authState.user.role} - subuser`
          : authState.user.role;
      return (
        <AuthErrorPage
          title="Access Denied"
          message={`Access denied. Your account type (${userInfo}) lacks required permissions for ${routeDescription}.`}
          icon={<ShieldOff className={styles.accessDeniedIcon} size={64} />}
        />
      );
    }

    // Render children if authenticated and authorized
    return <>{children}</>;
  };

// Create protected routes here, then import them in pageLayout

// AdminRoute: Only admins
export const AdminRoute = MakeProtectedRoute(
  (user) => user.role === "admin",
  "admin pages"
);

// UserRoute: Main users and admins only (excludes subusers)
export const UserRoute = MakeProtectedRoute(
  (user) => user.role === "admin" || user.userType === "main_user",
  "this page"
);

// SubuserRoute: All authenticated users (main users, admins, and subusers)
export const SubuserRoute = MakeProtectedRoute(
  () => true, // All authenticated users are allowed
  "this page"
);