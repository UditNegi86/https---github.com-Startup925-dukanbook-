import React, { useState } from "react";
import { useAuth } from "../helpers/useAuth";
import { useLanguage } from "../helpers/useLanguage";
import { profileTranslationsData } from "../helpers/profileTranslations";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { ThemeModeSwitch } from "./ThemeModeSwitch";
import { SubscriptionDialog } from "./SubscriptionDialog";
import { ChatbotWidget } from "./ChatbotWidget";
import { VoiceCommandButton } from "./VoiceCommandButton";
import { VoiceCommand } from "../helpers/useVoiceCommands";
import { LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./SharedLayout.module.css";

export const SharedLayout = ({ children }: { children: React.ReactNode }) => {
  const { authState, logout } = useAuth();
  const { t, language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      // Navigation to /login will be handled by the auth system
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  // Helper function to check if a module is enabled
  const isModuleEnabled = (moduleName: string): boolean => {
    if (authState.type !== "authenticated") return false;
    const enabledModules = authState.user.enabledModules || [];
    return enabledModules.includes(moduleName);
  };

  // Check if user is a subuser
  const isSubuser =
    authState.type === "authenticated" &&
    authState.user.userType === "subuser";

  const handleVoiceCommand = (command: VoiceCommand) => {
    if (command.command === "NAVIGATE" && command.params.page) {
      const page = command.params.page.toLowerCase();
      if (page === "dashboard" || page === "home") {
        navigate("/");
      } else if (page === "profile") {
        navigate("/profile");
      } else if (isSubuser) {
        // Subusers can only navigate to dashboard and profile
        console.log("Voice command: Access restricted for subusers");
        return;
      } else if (page === "ledger") {
        navigate("/ledger");
      } else if (page === "inventory") {
        if (isModuleEnabled("inventory")) {
          navigate("/inventory");
        } else {
          console.log("Voice command: Inventory module not enabled");
        }
      } else if (page === "suppliers" || page === "supplier") {
        if (isModuleEnabled("suppliers")) {
          navigate("/suppliers");
        } else {
          console.log("Voice command: Suppliers module not enabled");
        }
      } else if (page === "marketplace") {
        if (isModuleEnabled("marketplace")) {
          navigate("/marketplace");
        } else {
          console.log("Voice command: Marketplace module not enabled");
        }
      } else if (page === "reports" || page === "report") {
        if (isModuleEnabled("reports")) {
          navigate("/reports");
        } else {
          console.log("Voice command: Reports module not enabled");
        }
      } else if (page === "admin") {
        if (authState.type === "authenticated" && authState.user.role === "admin") {
          navigate("/admin");
        } else {
          console.log("Voice command: Admin access denied");
        }
      } else if (page === "logout") {
        handleLogout();
      }
    }
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.logo}>{t("common.appName")}</div>
        {authState.type === "authenticated" && (
          <>
            <nav className={styles.nav}>
              <Link
                to="/"
                className={`${styles.navLink} ${location.pathname === "/" ? styles.navLinkActive : ""}`}
              >
                {t("navigation.dashboard")}
              </Link>
              {!isSubuser && (
                <>
                  <Link
                    to="/ledger"
                    className={`${styles.navLink} ${location.pathname === "/ledger" ? styles.navLinkActive : ""}`}
                  >
                    {t("navigation.ledger")}
                  </Link>
                  {isModuleEnabled("inventory") && (
                    <Link
                      to="/inventory"
                      className={`${styles.navLink} ${location.pathname === "/inventory" ? styles.navLinkActive : ""}`}
                    >
                      {t("navigation.inventory")}
                    </Link>
                  )}
                  {isModuleEnabled("suppliers") && (
                    <Link
                      to="/suppliers"
                      className={`${styles.navLink} ${location.pathname === "/suppliers" ? styles.navLinkActive : ""}`}
                    >
                      {t("navigation.suppliers")}
                    </Link>
                  )}
                  {isModuleEnabled("reports") && (
                    <Link
                      to="/reports"
                      className={`${styles.navLink} ${location.pathname === "/reports" ? styles.navLinkActive : ""}`}
                    >
                      {t("navigation.reports")}
                    </Link>
                  )}
                  {isModuleEnabled("marketplace") && (
                    <Link
                      to="/marketplace"
                      className={`${styles.navLink} ${location.pathname === "/marketplace" ? styles.navLinkActive : ""}`}
                    >
                      {t("navigation.marketplace")}
                    </Link>
                  )}
                </>
              )}
              <Link
                to="/profile"
                className={`${styles.navLink} ${location.pathname === "/profile" ? styles.navLinkActive : ""}`}
              >
                {profileTranslationsData.profile[language].title}
              </Link>
              {!isSubuser && authState.user.role === "admin" && (
                <Link
                  to="/admin"
                  className={`${styles.navLink} ${location.pathname === "/admin" ? styles.navLinkActive : ""}`}
                >
                  {t("navigation.admin")}
                </Link>
              )}
            </nav>
            <div className={styles.userInfo}>
              <div className={styles.subscriptionSection}>
                <span className={styles.businessName}>
                  {authState.user.businessName}
                </span>
                {authState.user.subscriptionStatus === 'trial' && (
                  <Badge variant="info">Free Trial</Badge>
                )}
                {authState.user.subscriptionStatus === 'pending' && (
                  <Badge variant="warning">Pending</Badge>
                )}
                {authState.user.subscriptionStatus === 'active' && (
                  <Badge variant="success">Active</Badge>
                )}
                {authState.user.subscriptionStatus === 'expired' && (
                  <Badge variant="destructive">Expired</Badge>
                )}
                {(authState.user.subscriptionStatus === 'trial' || 
                  authState.user.subscriptionStatus === 'expired' || 
                  !authState.user.subscriptionStatus) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSubscriptionDialog(true)}
                    className={styles.subscribeButton}
                  >
                    Subscribe
                  </Button>
                )}
              </div>
              <ChatbotWidget />
            <VoiceCommandButton onCommand={handleVoiceCommand} />
            <ThemeModeSwitch />
            <Button
              variant="ghost"
              size="icon-md"
              onClick={handleLogout}
              disabled={isLoggingOut}
              title={t("auth.logout")}
            >
              <LogOut />
            </Button>
            </div>
          </>
        )}
      </header>
      <main className={styles.main}>{children}</main>
      {authState.type === "authenticated" && (
        <SubscriptionDialog
          open={showSubscriptionDialog}
          onOpenChange={setShowSubscriptionDialog}
        />
      )}
    </div>
  );
};