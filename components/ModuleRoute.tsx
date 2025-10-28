import React, { useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../helpers/useAuth";
import { useLanguage } from "../helpers/useLanguage";
import { moduleTranslationsData } from "../helpers/moduleTranslations";
import { AuthLoadingState } from "./AuthLoadingState";
import { toast } from "sonner";
import { ShieldOff } from "lucide-react";
import { AuthErrorPage } from "./AuthErrorPage";
import styles from "./ModuleRoute.module.css";

/**
 * A layout component factory to protect a page based on enabled user modules.
 *
 * @param requiredModule The name of the module required to access the route.
 * @returns A React functional component that acts as a route guard.
 *
 * @example
 * // In a pageLayout.tsx file
 * import { UserRoute } from './components/ProtectedRoute';
 * import { ModuleRoute } from './components/ModuleRoute';
 * import { SharedLayout } from './components/SharedLayout';
 *
 * export default [UserRoute, ModuleRoute('inventory'), SharedLayout];
 */
export const ModuleRoute =
  (
    requiredModule: string
  ): React.FC<{
    children: React.ReactNode;
  }> =>
  ({ children }) => {
    const { authState } = useAuth();
    const { language } = useLanguage();
    const toastShownRef = useRef(false);

    useEffect(() => {
      if (
        authState.type === "authenticated" &&
        !toastShownRef.current
      ) {
        const hasModule = authState.user.enabledModules?.some(
          (module) => module.toLowerCase() === requiredModule.toLowerCase()
        );

        if (!hasModule) {
          toast.error(moduleTranslationsData[language].modules.moduleAccessDenied);
          toastShownRef.current = true;
        }
      }
    }, [authState, requiredModule]);

    if (authState.type === "loading") {
      return <AuthLoadingState title="Checking module access..." />;
    }

    if (authState.type === "unauthenticated") {
      return <Navigate to="/login" replace />;
    }

    const hasModule = authState.user.enabledModules?.some(
      (module) => module.toLowerCase() === requiredModule.toLowerCase()
    );

    if (!hasModule) {
      // The toast is fired in useEffect to prevent it from showing on every render during redirection.
      // The Navigate component will handle the redirection.
      return <Navigate to="/" replace />;
    }

    return <>{children}</>;
  };