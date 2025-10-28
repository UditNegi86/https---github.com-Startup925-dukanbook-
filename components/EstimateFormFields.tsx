import React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { useLanguage } from "../helpers/useLanguage";
import { EstimateStatusArrayValues } from "../helpers/schema";
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
import styles from "./EstimateFormFields.module.css";

interface EstimateFormFieldsProps {
  values: {
    mobileNumber: string;
    customerName: string;
    date: Date;
    status?: string;
  };
  setValues: (updater: (prev: any) => any) => void;
  isEditMode: boolean;
}

export const EstimateFormFields = ({
  values,
  setValues,
  isEditMode,
}: EstimateFormFieldsProps) => {
  const { t } = useLanguage();

  return (
    <div className={styles.grid}>
      <FormItem name="mobileNumber">
        <FormLabel>{t("estimateFormFields.mobileNumber")}</FormLabel>
        <FormControl>
          <Input
            placeholder={t("estimateFormFields.mobileNumberPlaceholder")}
            value={values.mobileNumber}
            onChange={(e) =>
              setValues((p) => ({ ...p, mobileNumber: e.target.value }))
            }
          />
        </FormControl>
        <FormMessage />
      </FormItem>

      <FormItem name="customerName">
        <FormLabel>{t("estimateFormFields.customerName")}</FormLabel>
        <FormControl>
          <Input
            placeholder={t("estimateFormFields.customerNamePlaceholder")}
            value={values.customerName}
            onChange={(e) =>
              setValues((p) => ({ ...p, customerName: e.target.value }))
            }
          />
        </FormControl>
        <FormMessage />
      </FormItem>

      <FormItem name="date">
        <FormLabel>{t("estimateFormFields.date")}</FormLabel>
        <Popover>
          <PopoverTrigger asChild>
            <FormControl>
              <Button variant="outline" className={styles.dateButton}>
                {values.date ? (
                  new Date(values.date).toLocaleDateString()
                ) : (
                  <span>{t("estimateFormFields.pickDate")}</span>
                )}
                <CalendarIcon size={16} />
              </Button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent removeBackgroundAndPadding>
            <Calendar
              mode="single"
              selected={values.date}
              onSelect={(date) => date && setValues((p) => ({ ...p, date }))}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <FormMessage />
      </FormItem>

      {isEditMode && "status" in values && (
        <FormItem name="status">
          <FormLabel>{t("estimateFormFields.status")}</FormLabel>
          <Select
            value={values.status}
            onValueChange={(value) =>
              setValues((p) => ({
                ...p,
                status: value,
              }))
            }
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={t("estimateFormFields.selectStatus")} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {EstimateStatusArrayValues.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    </div>
  );
};