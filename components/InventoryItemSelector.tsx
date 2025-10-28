import React, { useState } from "react";
import { Package } from "lucide-react";
import { Selectable } from "kysely";
import { InventoryItems } from "../helpers/schema";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { Button } from "./Button";
import { Input } from "./Input";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";
import { useLanguage } from "../helpers/useLanguage";
import { inventoryTranslationsData } from "../helpers/inventoryTranslations";
import styles from "./InventoryItemSelector.module.css";

interface InventoryItemSelectorProps {
  inventoryItems: Selectable<InventoryItems>[];
  onSelect: (itemName: string, salesValue: number, inventoryItemId: number) => void;
  disabled?: boolean;
}

export const InventoryItemSelector = ({
  inventoryItems,
  onSelect,
  disabled = false,
}: InventoryItemSelectorProps) => {
  const { language } = useLanguage();
  const it = inventoryTranslationsData[language];
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(numAmount);
  };

  const filteredItems = inventoryItems.filter((item) =>
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (item: Selectable<InventoryItems>) => {
    const salesValue = typeof item.salesValue === "string" 
      ? parseFloat(item.salesValue) 
      : item.salesValue;
    onSelect(item.itemName, salesValue, item.id);
    setIsOpen(false);
    setSearchQuery("");
  };

  if (inventoryItems.length === 0) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={disabled}
              className={styles.triggerButton}
            >
              <Package size={14} />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          {it.selectorTooltip}
        </TooltipContent>
      </Tooltip>
      <PopoverContent className={styles.popoverContent}>
        <div className={styles.popoverHeader}>
          <h4 className={styles.popoverTitle}>
            {it.selectorTitle}
          </h4>
          {inventoryItems.length > 5 && (
            <Input
              type="text"
              placeholder={it.selectorSearch}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          )}
        </div>
        <div className={styles.itemsList}>
          {filteredItems.length === 0 ? (
            <div className={styles.noResults}>
              {it.selectorNoResults}
            </div>
          ) : (
            filteredItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={styles.inventoryItem}
                onClick={() => handleSelect(item)}
              >
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.itemName}</span>
                  <span className={styles.itemDetails}>
                    {it.selectorStock}: {item.quantity} •{" "}
                    {formatCurrency(item.salesValue)}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};