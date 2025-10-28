import React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { PaymentTypeArrayValues } from "../helpers/schema";
import { useLanguage } from "../helpers/useLanguage";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "./Form";
import { Input } from "./Input";
import { Button } from "./Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { Calendar } from "./Calendar";
import styles from "./EstimateTotalsSection.module.css";

interface Calculations {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
}

import type { PaymentType } from "../helpers/schema";

interface EstimateTotalsSectionProps {
  values: {
    discountPercentage: number;
    taxPercentage: number;
    paymentType: PaymentType;
    expectedPaymentDate?: Date | null | undefined;
  } & Record<string, unknown>;
  setValues: (updater: (prev: any) => any) => void;
  calculations: Calculations;
}

export const EstimateTotalsSection = ({
  values,
  setValues,
  calculations,
}: EstimateTotalsSectionProps) => {
  const { t } = useLanguage();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <div className={styles.totalSection}>
      <div className={styles.calculationsContainer}>
        <div className={styles.calculationRow}>
          <span className={styles.calculationLabel}>{t("estimateTotalsSection.subtotal")}</span>
          <span className={styles.calculationValue}>
            {formatCurrency(calculations.subtotal)}
          </span>
        </div>

        <div className={styles.calculationRow}>
          <div className={styles.inputWithLabel}>
            <FormItem
              name="discountPercentage"
              className={styles.inlineFormItem}
            >
              <FormLabel className={styles.inlineLabel}>{t("estimateTotalsSection.discount")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="0"
                  value={values.discountPercentage || ""}
                  onChange={(e) =>
                    setValues((p) => ({
                      ...p,
                      discountPercentage: e.target.value
                        ? Number(e.target.value)
                        : 0,
                    }))
                  }
                  className={styles.percentInput}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </div>
          <span className={styles.calculationValue}>
            -{formatCurrency(calculations.discountAmount)}
          </span>
        </div>

        <div className={styles.calculationRow}>
          <div className={styles.inputWithLabel}>
            <FormItem name="taxPercentage" className={styles.inlineFormItem}>
              <FormLabel className={styles.inlineLabel}>{t("estimateTotalsSection.tax")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="0"
                  value={values.taxPercentage || ""}
                  onChange={(e) =>
                    setValues((p) => ({
                      ...p,
                      taxPercentage: e.target.value
                        ? Number(e.target.value)
                        : 0,
                    }))
                  }
                  className={styles.percentInput}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </div>
          <span className={styles.calculationValue}>
            +{formatCurrency(calculations.taxAmount)}
          </span>
        </div>

        <div className={styles.totalDivider}></div>

        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>{t("estimateTotalsSection.totalAmount")}</span>
          <span className={styles.totalAmount}>
            {formatCurrency(calculations.totalAmount)}
          </span>
        </div>
      </div>

      <div className={styles.paymentSection}>
        <FormItem name="paymentType" className={styles.paymentTypeField}>
          <FormLabel>{t("estimateTotalsSection.paymentType")}</FormLabel>
          <Select
            value={values.paymentType}
            onValueChange={(value) =>
              setValues((p) => ({
                ...p,
                paymentType: value,
              }))
            }
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={t("estimateTotalsSection.selectPaymentType")} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {PaymentTypeArrayValues.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>

        {values.paymentType === "credit" && (
          <FormItem
            name="expectedPaymentDate"
            className={styles.expectedPaymentDateField}
          >
            <FormLabel>{t("estimateTotalsSection.expectedPaymentDate")}</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button variant="outline" className={styles.dateButton}>
                    {(() => {
                      const expectedDate = values.expectedPaymentDate
                        ? new Date(values.expectedPaymentDate)
                        : undefined;
                      return expectedDate ? (
                        expectedDate.toLocaleDateString()
                      ) : (
                        <span>{t("estimateTotalsSection.pickExpectedDate")}</span>
                      );
                    })()}
                    <CalendarIcon size={16} />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent removeBackgroundAndPadding>
                <Calendar
                  mode="single"
                  selected={
                    values.expectedPaymentDate
                      ? new Date(values.expectedPaymentDate)
                      : undefined
                  }
                  onSelect={(date) =>
                    setValues((p) => ({
                      ...p,
                      expectedPaymentDate: date || null,
                    }))
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      </div>
    </div>
  );
};