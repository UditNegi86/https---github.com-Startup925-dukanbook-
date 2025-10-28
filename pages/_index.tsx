import React, { useState, useMemo } from "react";
import { Helmet } from "react-helmet";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Search, X, Globe, Mic, AlertTriangle, Clock } from "lucide-react";
import { VoiceCommandButton } from "../components/VoiceCommandButton";
import { VoiceCommand } from "../helpers/useVoiceCommands";
import { useAuth } from "../helpers/useAuth";
import { useLanguage } from "../helpers/useLanguage";
import { profileTranslationsData } from "../helpers/profileTranslations";
import { useEstimates } from "../helpers/useEstimatesQueries";
import { EstimateWithItems } from "../endpoints/estimates_GET.schema";
import { PaymentType } from "../helpers/schema";
import { Button } from "../components/Button";
import { EstimateTable } from "../components/EstimateTable";
import { EstimateDialog } from "../components/EstimateDialog";
import { SubscriptionDialog } from "../components/SubscriptionDialog";
import { Skeleton } from "../components/Skeleton";
import { Tabs, TabsList, TabsTrigger } from "../components/Tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/Select";
import styles from "./_index.module.css";

const paymentTypes: PaymentType[] = ["cash", "card", "upi", "credit"];

export default function IndexPage() {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
  const [selectedEstimate, setSelectedEstimate] =
    useState<EstimateWithItems | null>(null);
  const [activeFilter, setActiveFilter] = useState<PaymentType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { language, setLanguage, t } = useLanguage();
  const { data: estimates, isFetching, error } = useEstimates();

  const user = authState.type === "authenticated" ? authState.user : null;
  const userIsActive = user?.isActive ?? true;
  const isSubuser = user?.userType === "subuser";

  const activeTab = 
    location.pathname === "/ledger" ? "ledger" :
    location.pathname === "/profile" ? "profile" :
    "dashboard";

  // Calculate if subscription is expiring soon
  const subscriptionExpiryInfo = useMemo(() => {
    if (!user || !user.subscriptionEndDate) {
      return { isExpiringSoon: false, daysUntilExpiry: null, expiryDate: null };
    }

    const endDate = new Date(user.subscriptionEndDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      isExpiringSoon: daysUntilExpiry > 0 && daysUntilExpiry <= 7,
      daysUntilExpiry,
      expiryDate: endDate,
    };
  }, [user]);

  const handleTabChange = (value: string) => {
    // Subusers can only navigate to dashboard
    if (isSubuser && value !== "dashboard") {
      return;
    }
    
    if (value === "ledger") {
      navigate("/ledger");
    } else if (value === "profile") {
      navigate("/profile");
    } else {
      navigate("/");
    }
  };

  const handleCreateNew = () => {
    setSelectedEstimate(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (estimate: EstimateWithItems) => {
    setSelectedEstimate(estimate);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedEstimate(null);
  };

  const handleVoiceCommand = (command: VoiceCommand) => {
    console.log("Voice command received:", command);
    
    switch (command.command) {
      case "CREATE_ESTIMATE":
        handleCreateNew();
        break;
      case "SEARCH":
        if (command.params.query) {
          setSearchQuery(command.params.query);
        }
        break;
      case "CLEAR_SEARCH":
        setSearchQuery("");
        break;
      case "FILTER_PAYMENT":
        if (command.params.type === "all" || paymentTypes.includes(command.params.type as PaymentType)) {
          setActiveFilter(command.params.type as PaymentType | "all");
        }
        break;
      case "NAVIGATE":
        if (command.params.page === "ledger") {
          navigate("/ledger");
        } else if (command.params.page === "dashboard") {
          navigate("/");
        }
        break;
      case "UNKNOWN":
        // Error handling is already done in VoiceCommandButton
        break;
    }
  };

  const filteredEstimates = useMemo(() => {
    if (!estimates) return [];
    
    let filtered = estimates;
    
    // Apply payment type filter
    if (activeFilter !== "all") {
      filtered = filtered.filter(
        (estimate) => estimate.paymentType === activeFilter,
      );
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((estimate) => {
        const customerName = estimate.customerName.toLowerCase();
        const mobileNumber = estimate.mobileNumber.toLowerCase();
        const totalAmount = estimate.totalAmount.toString();
        
        return (
          customerName.includes(query) ||
          mobileNumber.includes(query) ||
          totalAmount.includes(query)
        );
      });
    }
    
    return filtered;
  }, [estimates, activeFilter, searchQuery]);

  const renderContent = () => {
    if (isFetching && !estimates) {
      return (
        <div className={styles.skeletonContainer}>
          <Skeleton style={{ height: "2.5rem", width: "100%" }} />
          <Skeleton style={{ height: "2.5rem", width: "100%" }} />
          <Skeleton style={{ height: "2.5rem", width: "100%" }} />
          <Skeleton style={{ height: "2.5rem", width: "100%" }} />
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.errorState}>
          <p>{t("dashboard.errorLoading")}</p>
          <p>
            <em>{error instanceof Error ? error.message : t("dashboard.unknownError")}</em>
          </p>
        </div>
      );
    }

    return (
      <EstimateTable
        estimates={filteredEstimates}
        onEdit={handleEdit}
        isUpdating={isFetching}
        userIsActive={userIsActive}
      />
    );
  };

  const renderBanner = () => {
    // Priority 1: Show expired subscription banner if disabled and subscription is expired
    if (!userIsActive && user?.subscriptionStatus === 'expired') {
      return (
        <div className={`${styles.warningBanner} ${styles.expiredBanner}`}>
          <AlertTriangle size={20} />
          <div className={styles.warningContent}>
            <strong>{t("dashboard.subscriptionExpired")}</strong>
            <span>{t("dashboard.renewToContinue")}</span>
          </div>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => setIsSubscriptionDialogOpen(true)}
            className={styles.renewButton}
          >
            {t("dashboard.renewSubscription")}
          </Button>
        </div>
      );
    }

    // Priority 2: Show generic account disabled banner if disabled for other reasons
    if (!userIsActive) {
      return (
        <div className={styles.warningBanner}>
          <AlertTriangle size={20} />
          <div className={styles.warningContent}>
            <strong>{t("dashboard.accountDisabled")}</strong>
            <span>{t("dashboard.viewOnlyAccess")}</span>
          </div>
        </div>
      );
    }

    // Priority 3: Show expiring soon warning if subscription expires within 7 days
    if (subscriptionExpiryInfo.isExpiringSoon && subscriptionExpiryInfo.expiryDate) {
      const formattedDate = subscriptionExpiryInfo.expiryDate.toLocaleDateString(
        language === 'hindi' ? 'hi-IN' : 'en-IN',
        { year: 'numeric', month: 'short', day: 'numeric' }
      );
      
      return (
        <div className={`${styles.warningBanner} ${styles.expiringSoonBanner}`}>
          <Clock size={20} />
          <div className={styles.warningContent}>
            <strong>{t("dashboard.subscriptionExpiringSoon")}</strong>
            <span>
              {t("dashboard.subscriptionExpiresOn")} {formattedDate}. {t("dashboard.renewToAvoidInterruption")}
            </span>
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => setIsSubscriptionDialogOpen(true)}
            className={styles.renewButton}
          >
            {t("dashboard.renew")}
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <Helmet>
        <title>{t("dashboard.pageTitle")}</title>
        <meta
          name="description"
          content={t("dashboard.metaDescription")}
        />
      </Helmet>
      <div className={styles.pageContainer}>
        {renderBanner()}
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>{t("dashboard.title")}</h1>
            <p className={styles.subtitle}>
              {t("dashboard.subtitle")}
            </p>
          </div>
          <div className={styles.headerActions}>
            <Select value={language} onValueChange={(value) => setLanguage(value as "english" | "hinglish" | "hindi")}>
              <SelectTrigger className={styles.languageSelect}>
                <Globe size={16} />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">{t("common.english")}</SelectItem>
                <SelectItem value="hinglish">{t("common.hinglish")}</SelectItem>
                <SelectItem value="hindi">{t("common.hindi")}</SelectItem>
              </SelectContent>
            </Select>
            <VoiceCommandButton onCommand={handleVoiceCommand} />
            <Button onClick={handleCreateNew} disabled={!userIsActive}>
              <Plus size={16} />
              {t("dashboard.createNewEstimate")}
            </Button>
          </div>
        </header>

        <div className={styles.searchContainer}>
          <div className={styles.searchInputWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder={t("dashboard.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className={styles.clearButton}
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="dashboard">{t("dashboard.dashboardTab")}</TabsTrigger>
            {!isSubuser && (
              <>
                <TabsTrigger value="ledger">{t("dashboard.ledgerTab")}</TabsTrigger>
                <TabsTrigger value="profile">{profileTranslationsData.profile[language].title}</TabsTrigger>
              </>
            )}
          </TabsList>
        </Tabs>

        <div className={styles.filterBar}>
          <Button
            variant={activeFilter === "all" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveFilter("all")}
          >
            {t("common.all")}
          </Button>
          {paymentTypes.map((type) => (
            <Button
              key={type}
              variant={activeFilter === type ? "primary" : "ghost"}
              size="sm"
              onClick={() => setActiveFilter(type)}
              className={styles.filterButton}
            >
              {t(`common.${type}`)}
            </Button>
          ))}
        </div>

        <main className={styles.mainContent}>{renderContent()}</main>
      </div>

      <EstimateDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        estimate={selectedEstimate}
        userIsActive={userIsActive}
      />

      <SubscriptionDialog
        open={isSubscriptionDialogOpen}
        onOpenChange={setIsSubscriptionDialogOpen}
      />
    </>
  );
}