import React, { useState } from "react";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "./Form";
import { Input } from "./Input";
import { Button } from "./Button";
import { Spinner } from "./Spinner";
import styles from "./PasswordLoginForm.module.css";
import {
  schema,
  postLogin,
} from "../endpoints/auth/login_with_password_POST.schema";
import { useAuth } from "../helpers/useAuth";
import { useLanguage } from "../helpers/useLanguage";

export type LoginFormData = z.infer<typeof schema>;

interface PasswordLoginFormProps {
  className?: string;
}

export const PasswordLoginForm: React.FC<PasswordLoginFormProps> = ({
  className,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { onLogin } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const form = useForm({
    defaultValues: {
      contactNumber: "",
      pin: "",
    },
    schema,
  });

  const handleSubmit = async (data: LoginFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await postLogin(data);
      onLogin(result.user);
      setTimeout(() => navigate("/"), 200);
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err instanceof Error ? err.message : t("auth.loginError")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={`${styles.form} ${className || ""}`}
      >
        {error && <div className={styles.errorMessage}>{error}</div>}

        <FormItem name="contactNumber">
          <FormLabel>{t("auth.mobileNumber")}</FormLabel>
          <FormControl>
            <Input
              placeholder={t("auth.mobileNumberPlaceholder")}
              type="tel"
              autoComplete="tel"
              disabled={isLoading}
              value={form.values.contactNumber}
              onChange={(e) =>
                form.setValues((prev) => ({ ...prev, contactNumber: e.target.value }))
              }
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        <FormItem name="pin">
          <FormLabel>{t("auth.password")}</FormLabel>
          <FormControl>
            <Input
              type="password"
              placeholder={t("auth.passwordPlaceholder")}
              autoComplete="current-password"
              disabled={isLoading}
              value={form.values.pin}
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

        <Button
          type="submit"
          disabled={isLoading}
          className={styles.submitButton}
        >
          {isLoading ? (
            <span className={styles.loadingText}>
              <Spinner className={styles.spinner} size="sm" />
              {t("auth.loggingIn")}
            </span>
          ) : (
            t("auth.loginButton")
          )}
        </Button>
      </form>
    </Form>
  );
};