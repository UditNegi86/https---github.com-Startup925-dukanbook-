import { useState, useEffect } from "react";
import { z } from "zod";
import { useAuth, AUTH_QUERY_KEY } from "../helpers/useAuth";
import { useLanguage } from "../helpers/useLanguage";
import { profileTranslationsData } from "../helpers/profileTranslations";
import { useUpdateProfile } from "../helpers/useProfileQueries";
import { useQueryClient } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "./Form";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import { Button } from "./Button";
import { ProfileFormSkeleton } from "./ProfileFormSkeleton";
import { ProfileFormModules } from "./ProfileFormModules";
import { ProfileFormReferralCode } from "./ProfileFormReferralCode";
import { ProfileFormSubscription } from "./ProfileFormSubscription";
import { toast } from "sonner";
import { Edit3, Save, X, Loader } from "lucide-react";
import styles from "./ProfileForm.module.css";

const profileSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  ownerName: z.string().min(1, "Owner name is required"),
  displayName: z.string().min(1, "Display name is required"),
  businessType: z.string().min(1, "Business type is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  pinCode: z.string().optional().or(z.literal("")),
  gstNumber: z.string().optional().or(z.literal("")),
  enabledModules: z.array(z.string()).optional(),
});

export function ProfileForm() {
  const { authState } = useAuth();
  const { language, t } = useLanguage();
  const pt = profileTranslationsData.profile[language];
  const [isEditMode, setIsEditMode] = useState(false);
  const queryClient = useQueryClient();
  const updateProfileMutation = useUpdateProfile();

  const form = useForm({
    schema: profileSchema,
    defaultValues: {
      businessName: "",
      ownerName: "",
      displayName: "",
      businessType: "",
      email: "",
      address: "",
      pinCode: "",
      gstNumber: "",
      enabledModules: ["dashboard", "customer_record"],
    },
  });

  useEffect(() => {
    if (authState.type === "authenticated") {
      form.setValues({
        businessName: authState.user.businessName,
        ownerName: authState.user.ownerName,
        displayName: authState.user.displayName,
        businessType: authState.user.businessType,
        email: authState.user.email ?? "",
        address: authState.user.address ?? "",
        pinCode: authState.user.pinCode ?? "",
        gstNumber: authState.user.gstNumber ?? "",
        enabledModules: authState.user.enabledModules ?? [
          "dashboard",
          "customer_record",
        ],
      });
    }
  }, [authState, form.setValues]);

  const handleCancel = () => {
    if (authState.type === "authenticated") {
      form.setValues({
        businessName: authState.user.businessName,
        ownerName: authState.user.ownerName,
        displayName: authState.user.displayName,
        businessType: authState.user.businessType,
        email: authState.user.email ?? "",
        address: authState.user.address ?? "",
        pinCode: authState.user.pinCode ?? "",
        gstNumber: authState.user.gstNumber ?? "",
        enabledModules: authState.user.enabledModules ?? [
          "dashboard",
          "customer_record",
        ],
      });
    }
    setIsEditMode(false);
  };

  console.log("[ProfileForm] Rendering with isEditMode:", isEditMode);

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    try {
      const result = await updateProfileMutation.mutateAsync(values);
      // Update auth state with the new user data including enabledModules
      if ("user" in result) {
        queryClient.setQueryData(AUTH_QUERY_KEY, result.user);
      }
      toast.success(pt.updateSuccess);
      setIsEditMode(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : pt.updateError;
      toast.error(errorMessage);
      console.error("Profile update failed:", error);
    }
  };

  const handleModuleToggle = (moduleKey: string) => {
    form.setValues((prev) => {
      const currentModules = prev.enabledModules ?? ["dashboard", "customer_record"];
      const isEnabled = currentModules.includes(moduleKey);

      if (isEnabled) {
        // Remove module
        return {
          ...prev,
          enabledModules: currentModules.filter((m) => m !== moduleKey),
        };
      } else {
        // Add module
        return {
          ...prev,
          enabledModules: [...currentModules, moduleKey],
        };
      }
    });
  };

  if (authState.type === "loading") {
    return <ProfileFormSkeleton />;
  }

  if (authState.type === "unauthenticated") {
    return (
      <div className={styles.card}>
        <p>{pt.notAuthenticated}</p>
      </div>
    );
  }

  const { user } = authState;

  return (
    <div className={styles.card}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.grid}>
            <FormItem name="businessName">
              <FormLabel>{t("auth.businessName")}</FormLabel>
              <FormControl>
                <Input
                  value={form.values.businessName}
                  onChange={(e) =>
                    form.setValues((p) => ({
                      ...p,
                      businessName: e.target.value,
                    }))
                  }
                  disabled={!isEditMode}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem name="ownerName">
              <FormLabel>{t("auth.ownerName")}</FormLabel>
              <FormControl>
                <Input
                  value={form.values.ownerName}
                  onChange={(e) =>
                    form.setValues((p) => ({ ...p, ownerName: e.target.value }))
                  }
                  disabled={!isEditMode}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem name="displayName">
              <FormLabel>{pt.displayName}</FormLabel>
              <FormControl>
                <Input
                  value={form.values.displayName}
                  onChange={(e) =>
                    form.setValues((p) => ({
                      ...p,
                      displayName: e.target.value,
                    }))
                  }
                  disabled={!isEditMode}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem name="businessType">
              <FormLabel>{t("auth.businessType")}</FormLabel>
              <FormControl>
                <Input
                  value={form.values.businessType}
                  onChange={(e) =>
                    form.setValues((p) => ({
                      ...p,
                      businessType: e.target.value,
                    }))
                  }
                  disabled={!isEditMode}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem name="contactNumber">
              <FormLabel>{t("auth.mobileNumber")}</FormLabel>
              <FormControl>
                <Input value={user.contactNumber} disabled />
              </FormControl>
              <FormDescription>{pt.contactNumberDescription}</FormDescription>
            </FormItem>

            <FormItem name="email">
              <FormLabel>{pt.email}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  value={form.values.email}
                  onChange={(e) =>
                    form.setValues((p) => ({ ...p, email: e.target.value }))
                  }
                  disabled={!isEditMode}
                  placeholder={pt.emailPlaceholder}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem name="address">
              <FormLabel>{pt.address}</FormLabel>
              <FormControl>
                <Textarea
                  value={form.values.address}
                  onChange={(e) =>
                    form.setValues((p) => ({ ...p, address: e.target.value }))
                  }
                  disabled={!isEditMode}
                  placeholder={pt.addressPlaceholder}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem name="pinCode">
              <FormLabel>{pt.pinCode}</FormLabel>
              <FormControl>
                <Input
                  value={form.values.pinCode}
                  onChange={(e) =>
                    form.setValues((p) => ({ ...p, pinCode: e.target.value }))
                  }
                  disabled={!isEditMode}
                  placeholder={pt.pinCodePlaceholder}
                  maxLength={10}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem name="gstNumber">
              <FormLabel>{pt.gstNumber}</FormLabel>
              <FormControl>
                <Input
                  value={form.values.gstNumber}
                  onChange={(e) =>
                    form.setValues((p) => ({
                      ...p,
                      gstNumber: e.target.value,
                    }))
                  }
                  disabled={!isEditMode}
                  placeholder={pt.gstNumberPlaceholder}
                  maxLength={15}
                />
              </FormControl>
              <FormDescription>{pt.gstNumberDescription}</FormDescription>
              <FormMessage />
            </FormItem>
          </div>

          {/* Module Selection Section */}
          <ProfileFormModules
            enabledModules={form.values.enabledModules ?? []}
            onModuleToggle={handleModuleToggle}
            isEditMode={isEditMode}
          />

          {/* Referral Code Section */}
          {user.referralCode && (
            <ProfileFormReferralCode referralCode={user.referralCode} />
          )}

          {/* Subscription Details Section */}
          {user.subscriptionStatus && (
            <ProfileFormSubscription
              subscriptionStatus={user.subscriptionStatus}
              subscriptionPlanMonths={user.subscriptionPlanMonths}
              subscriptionStartDate={user.subscriptionStartDate}
              subscriptionEndDate={user.subscriptionEndDate}
            />
          )}

          <div className={styles.footer}>
            {isEditMode ? (
              <div className={styles.editActions}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updateProfileMutation.isPending}
                >
                  <X size={16} /> {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? (
                    <Loader size={16} className={styles.spinner} />
                  ) : (
                    <Save size={16} />
                  )}
                  {pt.saveChanges}
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                onClick={() => {
                  console.log("[ProfileForm] Edit button clicked!");
                  setIsEditMode(true);
                }}
              >
                <Edit3 size={16} /> {pt.editProfile}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}