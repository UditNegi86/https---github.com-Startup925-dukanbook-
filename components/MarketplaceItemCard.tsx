import React from 'react';
import { Selectable } from 'kysely';
import { Package, ShoppingCart } from 'lucide-react';
import { MarketplaceItems } from '../helpers/schema';
import { useLanguage } from '../helpers/useLanguage';
import { Button } from './Button';
import { Badge } from './Badge';
import styles from './MarketplaceItemCard.module.css';

interface MarketplaceItemCardProps {
  item: Selectable<MarketplaceItems>;
  onOrderClick: (item: Selectable<MarketplaceItems>) => void;
  className?: string;
}

export const MarketplaceItemCard = ({ item, onOrderClick, className }: MarketplaceItemCardProps) => {
  const { t } = useLanguage();
  const isOutOfStock = item.stockQuantity <= 0;

  return (
    <div className={`${styles.card} ${className || ''}`}>
      <div className={styles.imageContainer}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className={styles.image} />
        ) : (
          <div className={styles.placeholderImage}>
            <Package size={48} />
          </div>
        )}
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.name}>{item.name}</h3>
          {item.category && <Badge variant="secondary">{item.category}</Badge>}
        </div>
        <p className={styles.description}>{item.description}</p>
        <div className={styles.details}>
          <span className={styles.price}>₹{item.price} / {item.unit}</span>
          <span className={`${styles.stock} ${isOutOfStock ? styles.outOfStock : ''}`}>
            {isOutOfStock ? t('marketplace.outOfStock') : `${item.stockQuantity} in stock`}
          </span>
        </div>
        <Button
          className={styles.orderButton}
          onClick={() => onOrderClick(item)}
          disabled={isOutOfStock}
        >
          <ShoppingCart size={16} />
          {t('marketplace.orderNow')}
        </Button>
      </div>
    </div>
  );
};