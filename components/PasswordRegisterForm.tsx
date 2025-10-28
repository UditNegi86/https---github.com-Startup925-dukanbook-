import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
  useForm,
} from "./Form";
import { Input } from "./Input";
import { Button } from "./Button";
import { Spinner } from "./Spinner";
import { Checkbox } from "./Checkbox";
import styles from "./PasswordRegisterForm.module.css";
import { useAuth } from "../helpers/useAuth";
import { useLanguage } from "../helpers/useLanguage";
import {
  schema,
  postRegister,
} from "../endpoints/auth/register_with_password_POST.schema";

export type RegisterFormData = z.infer<typeof schema>;

interface PasswordRegisterFormProps {
  className?: string;
  defaultValues?: Partial<RegisterFormData>;
}

export const PasswordRegisterForm: React.FC<PasswordRegisterFormProps> = ({
  className,
  defaultValues,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModules, setSelectedModules] = useState<string[]>([
    'dashboard',
    'customer_record',
  ]);
  const { onLogin } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const form = useForm({
    schema,
    defaultValues: defaultValues || {
      contactNumber: "",
      pin: "",
      businessName: "",
      ownerName: "",
      businessType: "",
    },
  });

  const handleModuleToggle = (module: string) => {
    setSelectedModules((prev) => {
      if (prev.includes(module)) {
        return prev.filter((m) => m !== module);
      } else {
        return [...prev, module];
      }
    });
  };

  const handleSubmit = async (data: z.infer<typeof schema>) => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await postRegister({
        ...data,
        enabledModules: selectedModules,
      });
      console.log("Registration successful for:", data.contactNumber);
      onLogin(result.user);
      navigate("/");
    } catch (err) {
      console.error("Registration error:", err);

      if (err instanceof Error) {
        const errorMessage = err.message;

        if (errorMessage.includes("already in use") || errorMessage.includes("already registered")) {
          setError(t("auth.mobileAlreadyInUse"));
        } else if (errorMessage.toLowerCase().includes("business name")) {
          setError(errorMessage);
        } else if (errorMessage.toLowerCase().includes("owner name")) {
          setError(errorMessage);
        } else {
          setError(errorMessage || t("auth.registerError"));
        }
      } else {
        console.log("Unknown error type:", err);
        setError(t("auth.registerError"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const optionalModules = [
    { key: 'inventory', label: t('modules.inventory') },
    { key: 'suppliers', label: t('modules.suppliers') },
    { key: 'reports', label: t('modules.reports') },
    { key: 'marketplace', label: t('modules.marketplace') },
  ];

  const alwaysEnabledModules = [
    { key: 'dashboard', label: t('modules.dashboard') },
    { key: 'customer_record', label: t('modules.customerRecord') },
  ];

  return (
    <Form {...form}>
      {error && <div className={styles.errorMessage}>{error}</div>}
      <form
        onSubmit={form.handleSubmit((data) =>
          handleSubmit(data as z.infer<typeof schema>)
        )}
        className={`${styles.form} ${className || ""}`}
      >
        <FormItem name="contactNumber">
          <FormLabel>{t("auth.mobileNumber")}</FormLabel>
          <FormControl>
            <Input
              placeholder={t("auth.mobileNumberPlaceholder")}
              value={form.values.contactNumber || ""}
              onChange={(e) =>
                form.setValues((prev) => ({
                  ...prev,
                  contactNumber: e.target.value,
                }))
              }
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        <FormItem name="businessName">
          <FormLabel>{t("auth.businessName")}</FormLabel>
          <FormControl>
            <Input
              placeholder={t("auth.businessNamePlaceholder")}
              value={form.values.businessName || ""}
              onChange={(e) =>
                form.setValues((prev) => ({
                  ...prev,
                  businessName: e.target.value,
                }))
              }
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        <FormItem name="ownerName">
          <FormLabel>{t("auth.ownerName")}</FormLabel>
          <FormControl>
            <Input
              placeholder={t("auth.ownerNamePlaceholder")}
              value={form.values.ownerName || ""}
              onChange={(e) =>
                form.setValues((prev) => ({
                  ...prev,
                  ownerName: e.target.value,
                }))
              }
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        <FormItem name="businessType">
          <FormLabel>{t("auth.businessType")}</FormLabel>
          <FormControl>
            <Input
              placeholder={t("auth.businessTypePlaceholder")}
              value={form.values.businessType || ""}
              onChange={(e) =>
                form.setValues((prev) => ({
                  ...prev,
                  businessType: e.target.value,
                }))
              }
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        <FormItem name="pin">
          <FormLabel>{t("auth.pin")}</FormLabel>
          <FormControl>
            <Input
              type="password"
              placeholder={t("auth.pinPlaceholder")}
              value={form.values.pin || ""}
              onChange={(e) =>
                form.setValues((prev) => ({
                  ...prev,
                  pin: e.target.value,
                }))
              }
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        <div className={styles.moduleSection}>
          <div className={styles.moduleSectionHeader}>
            <h3 className={styles.moduleSectionTitle}>{t('modules.title')}</h3>
            <p className={styles.moduleSectionDescription}>
              {t('modules.description')}
            </p>
          </div>

          <div className={styles.moduleGrid}>
            {alwaysEnabledModules.map((module) => (
              <div key={module.key} className={styles.moduleItem}>
                <Checkbox
                  id={`module-${module.key}`}
                  checked={true}
                  disabled={true}
                />
                <label
                  htmlFor={`module-${module.key}`}
                  className={styles.moduleLabel}
                >
                  {module.label}
                  <span className={styles.alwaysEnabled}>
                    {' '}{t('modules.alwaysEnabled')}
                  </span>
                </label>
              </div>
            ))}

            {optionalModules.map((module) => (
              <div key={module.key} className={styles.moduleItem}>
                <Checkbox
                  id={`module-${module.key}`}
                  checked={selectedModules.includes(module.key)}
                  onChange={() => handleModuleToggle(module.key)}
                />
                <label
                  htmlFor={`module-${module.key}`}
                  className={styles.moduleLabel}
                >
                  {module.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className={styles.submitButton}
        >
          {isLoading ? (
            <>
              <Spinner size="sm" /> {t("auth.registering")}
            </>
          ) : (
            t("auth.registerButton")
          )}
        </Button>
      </form>
    </Form>
  );
};