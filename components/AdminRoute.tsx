import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../helpers/useAuth";
import { Skeleton } from "./Skeleton";

// This component protects routes that require admin privileges.
export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { authState } = useAuth();
  const location = useLocation();

  if (authState.type === "loading") {
    // Display a full-page loader while checking auth status
    return (
      <div style={{ padding: "var(--spacing-8)" }}>
        <Skeleton style={{ height: "4rem", marginBottom: "var(--spacing-4)" }} />
        <Skeleton style={{ height: "20rem" }} />
      </div>
    );
  }

  if (
    authState.type === "unauthenticated" ||
    (authState.type === "authenticated" && authState.user.role !== "admin")
  ) {
    // If not authenticated or not an admin, redirect to the home page.
    // We redirect to home instead of login because a logged-in non-admin user
    // should not see the login page.
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If authenticated as an admin, render the child components.
  return <>{children}</>;
};