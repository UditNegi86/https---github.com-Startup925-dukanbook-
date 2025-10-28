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
import styles from "./SubuserLoginForm.module.css";
import { postSubuserLogin } from "../endpoints/auth/subuser-login_POST.schema";
import { useAuth } from "../helpers/useAuth";
import { useLanguage } from "../helpers/useLanguage";

const subuserLoginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters."),
  password: z.string().min(4, "Password must be at least 4 characters."),
});

export type SubuserLoginFormData = z.infer<typeof subuserLoginSchema>;

interface SubuserLoginFormProps {
  className?: string;
}

export const SubuserLoginForm: React.FC<SubuserLoginFormProps> = ({
  className,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { onLogin } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    schema: subuserLoginSchema,
  });

  const handleSubmit = async (data: SubuserLoginFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await postSubuserLogin(data);
      onLogin(result.user);
      setTimeout(() => navigate("/"), 200);
    } catch (err) {
      console.error("Subuser login error:", err);
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

        <FormItem name="username">
          <FormLabel>{t("auth.username")}</FormLabel>
          <FormControl>
            <Input
              placeholder={t("auth.usernamePlaceholder")}
              type="text"
              autoComplete="username"
              disabled={isLoading}
              value={form.values.username}
              onChange={(e) =>
                form.setValues((prev) => ({ ...prev, username: e.target.value }))
              }
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        <FormItem name="password">
          <FormLabel>{t("auth.password")}</FormLabel>
          <FormControl>
            <Input
              type="password"
              placeholder={t("auth.passwordPlaceholder")}
              autoComplete="current-password"
              disabled={isLoading}
              value={form.values.password}
              onChange={(e) =>
                form.setValues((prev) => ({
                  ...prev,
                  password: e.target.value,
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