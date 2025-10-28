import React from 'react';
import { z } from 'zod';
import { useLanguage } from '../helpers/useLanguage';
import { useForm, Form, FormItem, FormLabel, FormControl, FormMessage } from './Form';
import { Input } from './Input';
import { Button } from './Button';
import { useMutation } from '@tanstack/react-query';
import { postLogin } from '../endpoints/auth/login_with_password_POST.schema';
import { useAuth } from '../helpers/useAuth';
import { useNavigate } from 'react-router-dom';
import { Spinner } from './Spinner';
import styles from './PinLoginForm.module.css';

const loginSchema = z.object({
  contactNumber: z.string().min(1, "Contact number is required"),
  pin: z.string().regex(/^\d{4,6}$/, "PIN must be 4 to 6 digits"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const PinLoginForm = () => {
  const { t } = useLanguage();
  const { onLogin } = useAuth();
  const navigate = useNavigate();

  const form = useForm({
    schema: loginSchema,
    defaultValues: {
      contactNumber: '',
      pin: '',
    }
  });

  const loginMutation = useMutation({
    mutationFn: postLogin,
    onSuccess: (data) => {
      onLogin(data.user);
      navigate('/');
    },
    onError: (error) => {
      if (error instanceof Error) {
        form.setFieldError('root.serverError', error.message);
      } else {
        form.setFieldError('root.serverError', t('auth.loginError'));
      }
    }
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
        <FormItem name="contactNumber">
          <FormLabel>{t('auth.mobileNumber')}</FormLabel>
          <FormControl>
            <Input
              type="tel"
              placeholder={t('auth.mobileNumberPlaceholder')}
              value={form.values.contactNumber}
              onChange={(e) => form.setValues(prev => ({ ...prev, contactNumber: e.target.value }))}
              disabled={loginMutation.isPending}
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        <FormItem name="pin">
          <FormLabel>{t('auth.pin')}</FormLabel>
          <FormControl>
            <Input
              type="password"
              placeholder={t('auth.pinPlaceholder')}
              maxLength={6}
              value={form.values.pin}
              onChange={(e) => form.setValues(prev => ({ ...prev, pin: e.target.value.replace(/\D/g, '') }))}
              disabled={loginMutation.isPending}
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        {form.errors['root.serverError'] && (
            <p className={styles.serverError}>{form.errors['root.serverError'] as string}</p>
        )}

        <Button type="submit" disabled={loginMutation.isPending} className={styles.submitButton}>
          {loginMutation.isPending ? <Spinner size="sm" /> : t('auth.loginButton')}
        </Button>
      </form>
    </Form>
  );
};