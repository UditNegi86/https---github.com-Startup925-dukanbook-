import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Selectable } from 'kysely';
import { MarketplaceItems } from '../helpers/schema';
import { useLanguage } from '../helpers/useLanguage';
import { useAuth } from '../helpers/useAuth';
import { useCreateOrder } from '../helpers/useMarketplaceQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './Dialog';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Button } from './Button';
import styles from './MarketplaceOrderDialog.module.css';

const orderSchema = z.object({
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1."),
  deliveryAddress: z.string().min(1, "Delivery address is required."),
  deliveryContact: z.string().min(10, "A valid contact number is required."),
  notes: z.string().optional().nullable(),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface MarketplaceOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: Selectable<MarketplaceItems>;
}

export const MarketplaceOrderDialog = ({ isOpen, onClose, item }: MarketplaceOrderDialogProps) => {
  const { t } = useLanguage();
  const { authState } = useAuth();
  const user = authState.type === 'authenticated' ? authState.user : null;
  const createOrderMutation = useCreateOrder();

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
  });

  const quantity = watch('quantity', 1);
  const totalAmount = (parseFloat(item.price) * (quantity || 0)).toFixed(2);

  useEffect(() => {
    if (isOpen && user) {
      reset({
        quantity: 1,
        deliveryAddress: user.address || '',
        deliveryContact: user.contactNumber || '',
        notes: '',
      });
    }
  }, [isOpen, user, reset]);

  const onSubmit = async (data: OrderFormData) => {
    await createOrderMutation.mutateAsync({
      items: [{ itemId: item.id, quantity: data.quantity }],
      deliveryAddress: data.deliveryAddress,
      deliveryContact: data.deliveryContact,
      notes: data.notes,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('orderDialog.title')}</DialogTitle>
          <DialogDescription>{t('orderDialog.description', { itemName: item.name })}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.itemInfo}>
            <span className={styles.itemName}>{item.name}</span>
            <span className={styles.itemPrice}>₹{item.price} / {item.unit}</span>
          </div>
          <div className={styles.formField}>
            <label htmlFor="quantity">{t('orderDialog.quantity')}</label>
            <Input id="quantity" type="number" min="1" max={item.stockQuantity} {...register('quantity')} />
            {errors.quantity && <p className={styles.error}>{errors.quantity.message}</p>}
          </div>
          <div className={styles.formField}>
            <label htmlFor="deliveryAddress">{t('orderDialog.deliveryAddress')}</label>
            <Textarea id="deliveryAddress" {...register('deliveryAddress')} />
            {errors.deliveryAddress && <p className={styles.error}>{errors.deliveryAddress.message}</p>}
          </div>
          <div className={styles.formField}>
            <label htmlFor="deliveryContact">{t('orderDialog.deliveryContact')}</label>
            <Input id="deliveryContact" {...register('deliveryContact')} />
            {errors.deliveryContact && <p className={styles.error}>{errors.deliveryContact.message}</p>}
          </div>
          <div className={styles.formField}>
            <label htmlFor="notes">{t('orderDialog.notes')}</label>
            <Textarea id="notes" {...register('notes')} />
          </div>
          <div className={styles.totalAmount}>
            <span>{t('orderDialog.totalAmount')}:</span>
            <strong>₹{totalAmount}</strong>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('orderDialog.placingOrder') : t('orderDialog.placeOrder')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};