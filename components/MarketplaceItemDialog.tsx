import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Selectable } from 'kysely';
import { MarketplaceItems } from '../helpers/schema';
import { useLanguage } from '../helpers/useLanguage';
import { useCreateMarketplaceItem, useUpdateMarketplaceItem } from '../helpers/useMarketplaceQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './Dialog';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Button } from './Button';
import styles from './MarketplaceItemDialog.module.css';

const itemSchema = z.object({
  name: z.string().min(1, "Item name is required."),
  description: z.string().optional().nullable(),
  price: z.coerce.number().min(0, "Price must be a positive number."),
  category: z.string().optional().nullable(),
  stockQuantity: z.coerce.number().int().min(0, "Stock quantity must be a non-negative integer."),
  unit: z.string().min(1, "Unit is required."),
  imageUrl: z.string().url("Must be a valid URL").or(z.string().startsWith("data:image/")).optional().nullable(),
});

type ItemFormData = z.infer<typeof itemSchema>;

interface MarketplaceItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item?: Selectable<MarketplaceItems> | null;
}

export const MarketplaceItemDialog = ({ isOpen, onClose, item }: MarketplaceItemDialogProps) => {
  const { t } = useLanguage();
  const isEditMode = !!item;
  const createItemMutation = useCreateMarketplaceItem();
  const updateItemMutation = useUpdateMarketplaceItem();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (item) {
        reset({
          name: item.name,
          description: item.description,
          price: parseFloat(item.price),
          category: item.category,
          stockQuantity: item.stockQuantity,
          unit: item.unit,
          imageUrl: item.imageUrl,
        });
        setImagePreview(item.imageUrl);
      } else {
        reset({
          name: '',
          description: '',
          price: 0,
          category: '',
          stockQuantity: 0,
          unit: '',
          imageUrl: '',
        });
        setImagePreview(null);
      }
    }
  }, [item, isOpen, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        field.onChange(base64String);
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ItemFormData) => {
    if (isEditMode) {
      await updateItemMutation.mutateAsync({ id: item.id, ...data });
    } else {
      await createItemMutation.mutateAsync(data);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader>
          <DialogTitle>{isEditMode ? t('itemDialog.editTitle') : t('itemDialog.createTitle')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label htmlFor="name">{t('itemDialog.itemName')}</label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className={styles.error}>{errors.name.message}</p>}
            </div>
            <div className={styles.formField}>
              <label htmlFor="price">{t('itemDialog.price')}</label>
              <Input id="price" type="number" step="0.01" {...register('price')} />
              {errors.price && <p className={styles.error}>{errors.price.message}</p>}
            </div>
            <div className={styles.formField}>
              <label htmlFor="stockQuantity">{t('itemDialog.stock')}</label>
              <Input id="stockQuantity" type="number" {...register('stockQuantity')} />
              {errors.stockQuantity && <p className={styles.error}>{errors.stockQuantity.message}</p>}
            </div>
            <div className={styles.formField}>
              <label htmlFor="unit">{t('itemDialog.unit')}</label>
              <Input id="unit" {...register('unit')} />
              {errors.unit && <p className={styles.error}>{errors.unit.message}</p>}
            </div>
            <div className={styles.formField}>
              <label htmlFor="category">{t('itemDialog.category')}</label>
              <Input id="category" {...register('category')} />
              {errors.category && <p className={styles.error}>{errors.category.message}</p>}
            </div>
            <div className={`${styles.formField} ${styles.fullWidth}`}>
              <label htmlFor="description">{t('itemDialog.description')}</label>
              <Textarea id="description" {...register('description')} />
              {errors.description && <p className={styles.error}>{errors.description.message}</p>}
            </div>
            <div className={`${styles.formField} ${styles.fullWidth}`}>
              <label>{t('itemDialog.imageUrl')}</label>
              <Controller
                name="imageUrl"
                control={control}
                render={({ field }) => (
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, field)}
                    className={styles.fileInput}
                  />
                )}
              />
              {imagePreview && <img src={imagePreview} alt="Preview" className={styles.imagePreview} />}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (isEditMode ? t('itemDialog.updatingItem') : t('itemDialog.creatingItem')) : t('itemDialog.saveItem')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};