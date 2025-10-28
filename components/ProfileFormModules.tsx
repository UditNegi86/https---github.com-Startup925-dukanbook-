import { useEffect } from "react";
import { useLanguage } from "../helpers/useLanguage";
import { moduleTranslationsData } from "../helpers/moduleTranslations";
import { Checkbox } from "./Checkbox";
import { Package } from "lucide-react";
import styles from "./ProfileFormModules.module.css";

interface ProfileFormModulesProps {
  enabledModules: string[];
  onModuleToggle: (moduleKey: string) => void;
  isEditMode: boolean;
}

export function ProfileFormModules({
  enabledModules,
  onModuleToggle,
  isEditMode,
}: ProfileFormModulesProps) {
  const { language } = useLanguage();
  const mt = moduleTranslationsData[language].modules;

  useEffect(() => {
    console.log("[ProfileFormModules] Received isEditMode prop:", isEditMode);
  }, [isEditMode]);

  return (
    <div className={styles.modulesSection}>
      <h3 className={styles.modulesTitle}>
        <Package size={20} />
        {mt.title}
      </h3>
      <p className={styles.modulesDescription}>{mt.description}</p>

      <div className={styles.modulesGrid}>
        {/* Dashboard - Always enabled */}
        <div className={styles.moduleItem}>
          <Checkbox id="module-dashboard" checked={true} disabled={true} />
          <label htmlFor="module-dashboard" className={styles.moduleLabel}>
            <span className={styles.moduleName}>{mt.dashboard}</span>
            <span className={styles.moduleStatus}>{mt.alwaysEnabled}</span>
          </label>
        </div>

        {/* Customer Record - Always enabled */}
        <div className={styles.moduleItem}>
          <Checkbox
            id="module-customer_record"
            checked={true}
            disabled={true}
          />
          <label htmlFor="module-customer_record" className={styles.moduleLabel}>
            <span className={styles.moduleName}>{mt.customerRecord}</span>
            <span className={styles.moduleStatus}>{mt.alwaysEnabled}</span>
          </label>
        </div>

        {/* Inventory - Optional */}
        <div className={styles.moduleItem}>
          <Checkbox
            id="module-inventory"
            checked={enabledModules.includes("inventory")}
            onChange={() => {
              console.log("[ProfileFormModules] Checkbox onChange triggered for module: inventory");
              onModuleToggle("inventory");
            }}
            disabled={!isEditMode}
          />
          <label htmlFor="module-inventory" className={styles.moduleLabel}>
            <span className={styles.moduleName}>{mt.inventory}</span>
          </label>
        </div>

        {/* Suppliers - Optional */}
        <div className={styles.moduleItem}>
          <Checkbox
            id="module-suppliers"
            checked={enabledModules.includes("suppliers")}
            onChange={() => {
              console.log("[ProfileFormModules] Checkbox onChange triggered for module: suppliers");
              onModuleToggle("suppliers");
            }}
            disabled={!isEditMode}
          />
          <label htmlFor="module-suppliers" className={styles.moduleLabel}>
            <span className={styles.moduleName}>{mt.suppliers}</span>
          </label>
        </div>

        {/* Reports - Optional */}
        <div className={styles.moduleItem}>
          <Checkbox
            id="module-reports"
            checked={enabledModules.includes("reports")}
            onChange={() => {
              console.log("[ProfileFormModules] Checkbox onChange triggered for module: reports");
              onModuleToggle("reports");
            }}
            disabled={!isEditMode}
          />
          <label htmlFor="module-reports" className={styles.moduleLabel}>
            <span className={styles.moduleName}>{mt.reports}</span>
          </label>
        </div>

        {/* Marketplace - Optional */}
        <div className={styles.moduleItem}>
          <Checkbox
            id="module-marketplace"
            checked={enabledModules.includes("marketplace")}
            onChange={() => {
              console.log("[ProfileFormModules] Checkbox onChange triggered for module: marketplace");
              onModuleToggle("marketplace");
            }}
            disabled={!isEditMode}
          />
          <label htmlFor="module-marketplace" className={styles.moduleLabel}>
            <span className={styles.moduleName}>{mt.marketplace}</span>
          </label>
        </div>
      </div>
    </div>
  );
}