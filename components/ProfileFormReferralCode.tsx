import { useState } from "react";
import { useLanguage } from "../helpers/useLanguage";
import { profileTranslationsData } from "../helpers/profileTranslations";
import { Button } from "./Button";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";
import styles from "./ProfileFormReferralCode.module.css";

interface ProfileFormReferralCodeProps {
  referralCode: string;
}

export function ProfileFormReferralCode({
  referralCode,
}: ProfileFormReferralCodeProps) {
  const { language } = useLanguage();
  const pt = profileTranslationsData.profile[language];
  const [copied, setCopied] = useState(false);

  const handleCopyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      toast.success(pt.referralCodeCopied);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy referral code");
      console.error("Failed to copy:", error);
    }
  };

  return (
    <div className={styles.referralSection}>
      <h3 className={styles.referralTitle}>{pt.referralCodeTitle}</h3>
      <div className={styles.referralCodeContainer}>
        <div className={styles.referralCode}>{referralCode}</div>
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={handleCopyReferralCode}
          className={styles.copyButton}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? pt.referralCodeCopied : pt.referralCodeCopy}
        </Button>
      </div>
      <p className={styles.referralDescription}>{pt.referralCodeDescription}</p>
    </div>
  );
}