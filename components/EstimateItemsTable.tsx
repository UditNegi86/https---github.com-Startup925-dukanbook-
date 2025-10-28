import React, { useState, useRef, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useLanguage } from "../helpers/useLanguage";
import { useInventoryItems } from "../helpers/useInventoryQueries";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "./Form";
import { Input } from "./Input";
import { Button } from "./Button";

import styles from "./EstimateItemsTable.module.css";

interface Item {
  description: string;
  quantity: number;
  unitPrice: number;
  inventoryItemId?: number | null;
}

interface EstimateItemsTableProps {
  items: Item[];
  handleItemChange: (
    index: number,
    field: "description" | "quantity" | "unitPrice",
    value: string | number,
    inventoryItemId?: number | null,
  ) => void;
  handleRemoveItem: (index: number) => void;
  handleAddItem: () => void;
}

export const EstimateItemsTable = ({
  items,
  handleItemChange,
  handleRemoveItem,
  handleAddItem,
}: EstimateItemsTableProps) => {
  const { t } = useLanguage();
  const { data: inventoryItems = [], isFetching: isLoadingInventory } =
    useInventoryItems();

  const [activeInputIndex, setActiveInputIndex] = useState<number | null>(null);
  const [popoverOpen, setPopoverOpen] = useState<{ [key: number]: boolean }>({});
  const inputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<{ [key: number]: number }>({});

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getFilteredItems = (searchText: string) => {
    if (!searchText || searchText.length === 0) {
      return [];
    }
    const search = searchText.toLowerCase().trim();
    return inventoryItems.filter(item =>
      item.itemName.toLowerCase().includes(search)
    );
  };

  const handleInputFocus = (index: number) => {
    setActiveInputIndex(index);
    const currentValue = items[index].description;
    const filtered = getFilteredItems(currentValue);
    if (currentValue.length > 0 && filtered.length > 0) {
      setPopoverOpen({ ...popoverOpen, [index]: true });
    }
  };

  const handleInputBlur = (index: number) => {
    // Delay to allow click on suggestion
    setTimeout(() => {
      setActiveInputIndex(null);
      setPopoverOpen({ ...popoverOpen, [index]: false });
      setSelectedSuggestionIndex({ ...selectedSuggestionIndex, [index]: 0 });
    }, 200);
  };

  const handleInputChange = (index: number, value: string) => {
    handleItemChange(index, "description", value);
    const filtered = getFilteredItems(value);
    setPopoverOpen({ ...popoverOpen, [index]: value.length > 0 && filtered.length > 0 });
    setSelectedSuggestionIndex({ ...selectedSuggestionIndex, [index]: 0 });
  };

  const handleSuggestionSelect = (index: number, itemName: string, salesValue: number, inventoryItemId: number) => {
    handleItemChange(index, "description", itemName, inventoryItemId);
    handleItemChange(index, "unitPrice", salesValue, inventoryItemId);
    setPopoverOpen({ ...popoverOpen, [index]: false });
    setSelectedSuggestionIndex({ ...selectedSuggestionIndex, [index]: 0 });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    const filtered = getFilteredItems(items[index].description);
    const isOpen = popoverOpen[index];
    
    if (!isOpen || filtered.length === 0) {
      return;
    }

    const currentIndex = selectedSuggestionIndex[index] || 0;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedSuggestionIndex({
          ...selectedSuggestionIndex,
          [index]: Math.min(currentIndex + 1, filtered.length - 1)
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedSuggestionIndex({
          ...selectedSuggestionIndex,
          [index]: Math.max(currentIndex - 1, 0)
        });
        break;
      case "Enter":
        if (isOpen) {
          e.preventDefault();
          const selected = filtered[currentIndex];
          if (selected) {
            handleSuggestionSelect(index, selected.itemName, Number(selected.salesValue), selected.id);
          }
        }
        break;
      case "Escape":
        e.preventDefault();
        setPopoverOpen({ ...popoverOpen, [index]: false });
        setSelectedSuggestionIndex({ ...selectedSuggestionIndex, [index]: 0 });
        break;
    }
  };

  const highlightMatch = (text: string, search: string) => {
    if (!search) return text;
    const parts = text.split(new RegExp(`(${search})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === search.toLowerCase() 
            ? <mark key={i} className={styles.highlight}>{part}</mark>
            : part
        )}
      </span>
    );
  };

  return (
    <div className={styles.itemsSection}>
      <h3 className={styles.itemsHeader}>{t("estimateDialog.items")}</h3>
      <FormItem name="items">
        <FormMessage />
      </FormItem>

      {/* Table Header */}
      <div className={styles.itemTableHeader}>
        <div className={styles.headerDescription}>{t("estimateTable.description")}</div>
        <div className={styles.headerQuantity}>{t("estimateTable.quantity")}</div>
        <div className={styles.headerPrice}>{t("estimateTable.unitPrice")}</div>
        <div className={styles.headerAmount}>{t("estimateTable.amount")}</div>
        <div className={styles.headerAction}></div>
      </div>

      {/* Items */}
      {items.map((item, index) => {
        const itemAmount = (item.quantity || 0) * (item.unitPrice || 0);
        const filteredItems = getFilteredItems(items[index].description);
        const isPopoverOpen = popoverOpen[index] && filteredItems.length > 0;
        const currentSelectedIndex = selectedSuggestionIndex[index] || 0;
        
        return (
          <div key={index} className={styles.itemRow}>
            <FormItem
              name={`items.${index}.description`}
              className={styles.itemDescription}
            >
              <FormLabel className={styles.srOnly}>{t("estimateTable.description")}</FormLabel>
              <div className={styles.descriptionWrapper}>
                <FormControl>
                  <Input
                    ref={(el) => { inputRefs.current[index] = el; }}
                    placeholder={t("estimateDialog.itemDescription")}
                    value={items[index].description}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onFocus={() => handleInputFocus(index)}
                    onBlur={() => handleInputBlur(index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    autoComplete="off"
                  />
                </FormControl>
                {isPopoverOpen && !isLoadingInventory && (
                  <div className={styles.suggestionsDropdown}>
                    <div className={styles.suggestionsList}>
                      {filteredItems.slice(0, 5).map((inventoryItem, suggestionIndex) => (
                        <button
                          key={inventoryItem.id}
                          type="button"
                          className={`${styles.suggestionItem} ${suggestionIndex === currentSelectedIndex ? styles.suggestionItemSelected : ''}`}
                          onClick={() => handleSuggestionSelect(
                            index,
                            inventoryItem.itemName,
                            Number(inventoryItem.salesValue),
                            inventoryItem.id
                          )}
                          onMouseEnter={() => setSelectedSuggestionIndex({ ...selectedSuggestionIndex, [index]: suggestionIndex })}
                        >
                          <div className={styles.suggestionName}>
                            {highlightMatch(inventoryItem.itemName, items[index].description)}
                          </div>
                          <div className={styles.suggestionDetails}>
                            <span className={styles.suggestionStock}>
                              Stock: {Number(inventoryItem.quantity)}
                            </span>
                            <span className={styles.suggestionPrice}>
                              {formatCurrency(Number(inventoryItem.salesValue))}
                            </span>
                          </div>
                        </button>
                      ))}
                      {filteredItems.length > 5 && (
                        <div className={styles.suggestionFooter}>
                          +{filteredItems.length - 5} more items
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
            <FormItem
              name={`items.${index}.quantity`}
              className={styles.itemQuantity}
            >
              <FormLabel className={styles.fieldLabel}>{t("estimateTable.quantity")}</FormLabel>
              <FormControl>
                  <Input
                    type="number"
                    placeholder={t("estimateTable.quantity")}
                    value={items[index].quantity}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", e.target.value)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
            <FormItem
              name={`items.${index}.unitPrice`}
              className={styles.itemPrice}
            >
              <FormLabel className={styles.fieldLabel}>{t("estimateTable.unitPrice")}</FormLabel>
              <FormControl>
                  <Input
                    type="number"
                    placeholder={t("estimateTable.unitPrice")}
                    value={items[index].unitPrice}
                  onChange={(e) =>
                    handleItemChange(index, "unitPrice", e.target.value)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
            <div className={styles.itemAmount}>
              <span className={styles.itemAmountValue}>
                {formatCurrency(itemAmount)}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => handleRemoveItem(index)}
              disabled={items.length <= 1}
              aria-label={t("estimateTable.delete")}
              className={styles.itemRemoveButton}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        );
      })}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAddItem}
        className={styles.addItemButton}
      >
        <Plus size={14} /> {t("estimateDialog.addItem")}
      </Button>
    </div>
  );
};