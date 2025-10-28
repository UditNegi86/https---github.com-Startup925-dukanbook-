import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateSubuser, useUpdateSubuser } from '../helpers/useSubuserQueries';
import { Subuser } from '../endpoints/subusers_GET.schema';
import { schema as createSchema } from '../endpoints/subusers_POST.schema';
import { useLanguage } from '../helpers/useLanguage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './Dialog';
import { Button } from './Button';
import { Input } from './Input';
import { Switch } from './Switch';
import { Spinner } from './Spinner';
import styles from './SubuserDialog.module.css';

interface SubuserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  subuserToEdit?: Subuser | null;
}

// Unified schema for both create and edit modes
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long."),
  username: z.string().min(3, "Username must be at least 3 characters long."),
  password: z.string(),
  isActive: z.boolean(),
}).superRefine((data, ctx) => {
  // Password validation: required for create, optional for edit
  // This will be checked dynamically in onSubmit instead
  return true;
});

type FormData = z.infer<typeof formSchema>;

export const SubuserDialog = ({ isOpen, onClose, subuserToEdit }: SubuserDialogProps) => {
  const { t } = useLanguage();
  const isEditMode = !!subuserToEdit;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      username: '',
      password: '',
      isActive: true,
    },
  });

  const { mutateAsync: createSubuser } = useCreateSubuser();
  const { mutateAsync: updateSubuser } = useUpdateSubuser();

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && subuserToEdit) {
        reset({
          name: subuserToEdit.name,
          username: subuserToEdit.username,
          password: '',
          isActive: subuserToEdit.isActive,
        });
      } else {
        reset({
          name: '',
          username: '',
          password: '',
          isActive: true,
        });
      }
    }
  }, [isOpen, isEditMode, subuserToEdit, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      // Validate password for create mode
      if (!isEditMode && (!data.password || data.password.length < 6)) {
        setError('password', {
          type: 'manual',
          message: 'Password must be at least 6 characters long.',
        });
        return;
      }

      if (isEditMode && subuserToEdit) {
        await updateSubuser({
          subuserId: subuserToEdit.id,
          name: data.name,
          username: data.username,
          password: data.password || '',
          isActive: data.isActive,
        });
      } else {
        await createSubuser({
          name: data.name,
          username: data.username,
          password: data.password,
        });
      }
      onClose();
    } catch (error) {
      console.error('Failed to save subuser:', error);
      // Error toast is handled by the mutation hook
    }
  };

  const isActive = watch('isActive');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t('subusers.editTitle') : t('subusers.createTitle')}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? t('subusers.editDescription', { name: subuserToEdit.name })
              : t('subusers.createDescription')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.formField}>
            <label htmlFor="name">{t('subusers.name')}</label>
            <Input id="name" {...register('name')} placeholder={t('subusers.namePlaceholder')} />
            {errors.name && <p className={styles.error}>{errors.name.message}</p>}
          </div>
          <div className={styles.formField}>
            <label htmlFor="username">{t('subusers.username')}</label>
            <Input id="username" {...register('username')} placeholder={t('subusers.usernamePlaceholder')} />
            {errors.username && <p className={styles.error}>{errors.username.message}</p>}
          </div>
          <div className={styles.formField}>
            <label htmlFor="password">{t('subusers.password')}</label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              placeholder={isEditMode ? t('subusers.passwordOptionalPlaceholder') : '••••••••'}
            />
            {errors.password && <p className={styles.error}>{errors.password.message}</p>}
          </div>
          {isEditMode && (
            <div className={`${styles.formField} ${styles.switchField}`}>
              <label htmlFor="isActive">{t('subusers.status')}</label>
              <div className={styles.switchContainer}>
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={(checked) => setValue('isActive', checked)}
                />
                <span>{isActive ? t('subusers.active') : t('subusers.inactive')}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Spinner size="sm" />}
              {isEditMode ? t('common.saveChanges') : t('subusers.createSubuser')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};