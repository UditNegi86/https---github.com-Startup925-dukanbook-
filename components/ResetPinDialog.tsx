import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./Dialog";
import { Button } from "./Button";
import { Input } from "./Input";
import { useLanguage } from "../helpers/useLanguage";
import { useResetUserPin } from "../helpers/useAdminQueries";
import styles from "./ResetPinDialog.module.css";

interface ResetPinDialogProps {
  userId: number;
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ResetPinDialog = ({
  userId,
  userName,
  open,
  onOpenChange,
}: ResetPinDialogProps) => {
  const { t } = useLanguage();
  const [newPin, setNewPin] = useState("");
  const [error, setError] = useState("");
  const resetPinMutation = useResetUserPin();

  const validatePin = (pin: string): boolean => {
    const pinRegex = /^\d{4,6}$/;
    if (!pin) {
      setError(t("admin.users.pinRequired"));
      return false;
    }
    if (!pinRegex.test(pin)) {
      setError(t("admin.users.pinInvalid"));
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!validatePin(newPin)) {
      return;
    }

    resetPinMutation.mutate(
      { userId, newPin },
      {
        onSuccess: () => {
          setNewPin("");
          setError("");
          onOpenChange(false);
        },
      }
    );
  };

  const handleCancel = () => {
    setNewPin("");
    setError("");
    onOpenChange(false);
  };

  const handlePinChange = (value: string) => {
    setNewPin(value);
    if (error) {
      setError("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("admin.users.resetPinTitle")}</DialogTitle>
          <DialogDescription>
            {t("admin.users.resetPinDescription", { userName })}
          </DialogDescription>
        </DialogHeader>
        <div className={styles.formGroup}>
          <label htmlFor="newPin" className={styles.label}>
            {t("admin.users.newPin")}
          </label>
          <Input
            id="newPin"
            type="text"
            inputMode="numeric"
            placeholder={t("admin.users.newPinPlaceholder")}
            value={newPin}
            onChange={(e) => handlePinChange(e.target.value)}
            maxLength={6}
            className={error ? styles.inputError : ""}
          />
          {error && <p className={styles.errorMessage}>{error}</p>}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={resetPinMutation.isPending}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={resetPinMutation.isPending}
          >
                      {resetPinMutation.isPending
              ? t("admin.users.resetPin")
              : t("admin.users.resetPin")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};