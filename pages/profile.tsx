import { Helmet } from "react-helmet";
import { useLanguage } from "../helpers/useLanguage";
import { profileTranslationsData } from "../helpers/profileTranslations";
import { useAuth } from "../helpers/useAuth";
import { ProfileForm } from "../components/ProfileForm";
import { SubuserList } from "../components/SubuserList";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/Tabs";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const { language } = useLanguage();
  const { authState } = useAuth();
  const pt = profileTranslationsData.profile[language];

  // Show loading state while auth is loading
  if (authState.type === "loading") {
    return null;
  }

  // Should not reach here due to ProtectedRoute, but handle it gracefully
  if (authState.type === "unauthenticated") {
    return null;
  }

  const isMainUser = authState.user.userType === "main_user";

  return (
    <>
      <Helmet>
        <title>{pt.pageTitle}</title>
        <meta name="description" content={pt.metaDescription} />
      </Helmet>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>{pt.title}</h1>
          <p className={styles.subtitle}>{pt.subtitle}</p>
        </header>
        <main className={styles.mainContent}>
          {isMainUser ? (
            <Tabs defaultValue="profile" className={styles.tabs}>
              <TabsList>
                <TabsTrigger value="profile">{pt.tabProfile}</TabsTrigger>
                <TabsTrigger value="subusers">{pt.tabSubusers}</TabsTrigger>
              </TabsList>
              <TabsContent value="profile">
                <ProfileForm />
              </TabsContent>
              <TabsContent value="subusers">
                <SubuserList />
              </TabsContent>
            </Tabs>
          ) : (
            <ProfileForm />
          )}
        </main>
      </div>
    </>
  );
}