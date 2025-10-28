import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm, Form, FormItem, FormLabel, FormControl, FormMessage } from './Form';
import { Input } from './Input';
import { Button } from './Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';
import { useMutation } from '@tanstack/react-query';
import { postRegister } from '../endpoints/auth/register_with_password_POST.schema';
import { useAuth } from '../helpers/useAuth';
import { useLanguage } from '../helpers/useLanguage';
import { useNavigate } from 'react-router-dom';
import { Spinner } from './Spinner';
import { useValidateReferral } from '../helpers/useReferralQueries';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import styles from './BusinessRegistrationForm.module.css';

const businessTypes = [
  "Retail Shop",
  "Grocery Store",
  "Restaurant",
  "Electronics Store",
  "Clothing Store",
  "Hardware Store",
  "Medical Store",
  "Stationery Shop",
  "Other"
];

export const BusinessRegistrationForm = () => {
  const { onLogin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [debouncedReferralCode, setDebouncedReferralCode] = useState('');

  const registrationSchema = z.object({
    businessName: z.string().min(1, t("auth.businessName") + " is required"),
    ownerName: z.string().min(1, t("auth.ownerName") + " is required"),
    contactNumber: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit customer contact number"),
    businessType: z.string().min(1, t("auth.businessType") + " is required"),
    pin: z.string().regex(/^\d{4,6}$/, "PIN must be 4 to 6 digits"),
    confirmPin: z.string(),
    referralCode: z.string().optional(),
  }).refine(data => data.pin === data.confirmPin, {
    message: "PINs do not match",
    path: ["confirmPin"],
  });

  type RegistrationFormValues = z.infer<typeof registrationSchema>;

  const form = useForm({
    schema: registrationSchema,
    defaultValues: {
      businessName: '',
      ownerName: '',
      contactNumber: '',
      businessType: '',
      pin: '',
      confirmPin: '',
      referralCode: '',
    }
  });

  const { data: referralData, isFetching: isReferralLoading } = useValidateReferral(debouncedReferralCode);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedReferralCode(form.values.referralCode || '');
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [form.values.referralCode]);

  const registrationMutation = useMutation({
    mutationFn: postRegister,
    onSuccess: (data) => {
      onLogin(data.user);
      navigate('/');
    },
    onError: (error) => {
      if (error instanceof Error) {
        form.setFieldError('root.serverError', error.message);
      } else {
        form.setFieldError('root.serverError', t("auth.registerError"));
      }
    }
  });

  const onSubmit = (values: RegistrationFormValues) => {
    registrationMutation.mutate({
      businessName: values.businessName,
      ownerName: values.ownerName,
      contactNumber: values.contactNumber,
      businessType: values.businessType,
      pin: values.pin,
      referralCode: values.referralCode,
    });
  };

  const renderReferralFeedback = () => {
    if (isReferralLoading) {
      return <div className={styles.referralFeedback}><Loader2 className={styles.spinnerIcon} /> Validating...</div>;
    }
    if (!debouncedReferralCode) {
      return null;
    }
    if (referralData?.valid) {
      return <div className={`${styles.referralFeedback} ${styles.valid}`}><CheckCircle2 /> Referred by: {referralData.referrerName}</div>;
    }
    return <div className={`${styles.referralFeedback} ${styles.invalid}`}><XCircle /> Invalid referral code</div>;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
        <FormItem name="businessName">
          <FormLabel>{t("auth.businessName")}</FormLabel>
          <FormControl>
            <Input
              placeholder={t("auth.businessNamePlaceholder")}
              value={form.values.businessName}
              onChange={(e) => form.setValues(prev => ({ ...prev, businessName: e.target.value }))}
              disabled={registrationMutation.isPending}
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        <FormItem name="ownerName">
          <FormLabel>{t("auth.ownerName")}</FormLabel>
          <FormControl>
            <Input
              placeholder={t("auth.ownerNamePlaceholder")}
              value={form.values.ownerName}
              onChange={(e) => form.setValues(prev => ({ ...prev, ownerName: e.target.value }))}
              disabled={registrationMutation.isPending}
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        <FormItem name="contactNumber">
          <FormLabel>{t("auth.mobileNumber")}</FormLabel>
          <FormControl>
            <Input
              type="tel"
              placeholder={t("auth.mobileNumberPlaceholder")}
              value={form.values.contactNumber}
              onChange={(e) => form.setValues(prev => ({ ...prev, contactNumber: e.target.value }))}
              disabled={registrationMutation.isPending}
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        <FormItem name="businessType">
          <FormLabel>{t("auth.businessType")}</FormLabel>
          <FormControl>
            <Select
              value={form.values.businessType}
              onValueChange={(value) => form.setValues(prev => ({ ...prev, businessType: value }))}
              disabled={registrationMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("auth.businessTypePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>

        <div className={styles.pinFields}>
          <FormItem name="pin">
            <FormLabel>{t("auth.setPin")}</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder={t("auth.pinPlaceholder")}
                maxLength={6}
                value={form.values.pin}
                onChange={(e) => form.setValues(prev => ({ ...prev, pin: e.target.value.replace(/\D/g, '') }))}
                disabled={registrationMutation.isPending}
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormItem name="confirmPin">
            <FormLabel>{t("auth.confirmPin")}</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder={t("auth.pinPlaceholder")}
                maxLength={6}
                value={form.values.confirmPin}
                onChange={(e) => form.setValues(prev => ({ ...prev, confirmPin: e.target.value.replace(/\D/g, '') }))}
                disabled={registrationMutation.isPending}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </div>

        <FormItem name="referralCode">
          <FormLabel>Referral Code (Optional)</FormLabel>
          <FormControl>
            <Input
              placeholder="Enter referral code if you have one"
              value={form.values.referralCode || ''}
              onChange={(e) => form.setValues(prev => ({ ...prev, referralCode: e.target.value }))}
              disabled={registrationMutation.isPending}
            />
          </FormControl>
          {renderReferralFeedback()}
          <FormMessage />
        </FormItem>
        
        {form.errors['root.serverError'] && (
            <p className={styles.serverError}>{form.errors['root.serverError'] as string}</p>
        )}

        <Button type="submit" disabled={registrationMutation.isPending} className={styles.submitButton}>
          {registrationMutation.isPending ? <Spinner size="sm" /> : t("auth.createAccount")}
        </Button>
      </form>
    </Form>
  );
};