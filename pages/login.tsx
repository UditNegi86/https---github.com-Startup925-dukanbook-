import React from 'react';
import { Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '../helpers/useAuth';
import { useLanguage } from '../helpers/useLanguage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/Tabs';
import { PinLoginForm } from '../components/PinLoginForm';
import { SubuserLoginForm } from '../components/SubuserLoginForm';
import { BusinessRegistrationForm } from '../components/BusinessRegistrationForm';
import { Skeleton } from '../components/Skeleton';
import styles from './login.module.css';

export default function LoginPage() {
  const { authState } = useAuth();
  const { t } = useLanguage();

  if (authState.type === 'loading') {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <Skeleton style={{ height: '2rem', width: '70%', marginBottom: 'var(--spacing-2)' }} />
          <Skeleton style={{ height: '1rem', width: '50%', marginBottom: 'var(--spacing-8)' }} />
          <Skeleton style={{ height: '2.5rem', width: '100%', marginBottom: 'var(--spacing-6)' }} />
          <Skeleton style={{ height: '15rem', width: '100%' }} />
        </div>
      </div>
    );
  }

  if (authState.type === 'authenticated') {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Helmet>
        <title>{t('auth.login')} / {t('auth.register')} | {t('common.appName')}</title>
        <meta name="description" content="Access your account or create a new one to manage your sales ledger." />
      </Helmet>
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>{t('common.appName')}</h1>
            <p className={styles.subtitle}>Welcome! Please login or register to continue.</p>
          </div>
          <Tabs defaultValue="login" className={styles.tabs}>
            <TabsList>
              <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
              <TabsTrigger value="subuser-login">{t('auth.subuserLogin')}</TabsTrigger>
              <TabsTrigger value="register">{t('auth.register')}</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className={styles.tabContent}>
              <PinLoginForm />
            </TabsContent>
            <TabsContent value="subuser-login" className={styles.tabContent}>
              <SubuserLoginForm />
            </TabsContent>
            <TabsContent value="register" className={styles.tabContent}>
              <BusinessRegistrationForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}