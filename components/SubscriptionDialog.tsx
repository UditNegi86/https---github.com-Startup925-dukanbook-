import React, { useState } from 'react';
import { useLanguage } from '../helpers/useLanguage';
import { subscriptionTranslationsData } from '../helpers/subscriptionTranslations';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './Dialog';
import { Button } from './Button';
import { Badge } from './Badge';
import { useRequestSubscription } from '../helpers/useSubscriptionQueries';
import { toast } from 'sonner';
import { Copy, ArrowLeft, Flame } from 'lucide-react';
import styles from './SubscriptionDialog.module.css';

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Plan = {
  months: 3 | 6 | 9 | 12;
  displayTitle?: string;
  displaySubtitle?: string;
  price: number;
  discount?: string;
  isBestValue?: boolean;
  isLimitedOffer?: boolean;
  features: string[];
};

const UPI_ID = '9871926428@ptsbi';

export const SubscriptionDialog = ({ open, onOpenChange }: SubscriptionDialogProps) => {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const { mutate: requestSubscription, isPending } = useRequestSubscription();
  const { language } = useLanguage();
  const st = subscriptionTranslationsData[language];

  const plans: Plan[] = [
    {
      months: 6,
      displayTitle: '3+3 Months',
      displaySubtitle: st.buyGetFree,
      price: 300,
      isLimitedOffer: true,
      features: ['Unlimited Estimates', 'Full Ledger Access', 'Priority Email Support', 'Early Access to Features'],
    },
    {
      months: 3,
      price: 300,
      features: ['Unlimited Estimates', 'Full Ledger Access', 'Email Support'],
    },
    {
      months: 6,
      price: 600,
      discount: '10% OFF',
      features: ['Unlimited Estimates', 'Full Ledger Access', 'Priority Email Support'],
    },
    {
      months: 9,
      price: 700,
      discount: '20% OFF',
      features: ['Unlimited Estimates', 'Full Ledger Access', 'Priority Email Support', 'Early Access to Features'],
    },
    {
      months: 12,
      price: 900,
      discount: '25% OFF',
      isBestValue: true,
      features: ['Unlimited Estimates', 'Full Ledger Access', '24/7 Phone Support', 'Early Access to Features'],
    },
  ];

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after a short delay to allow the dialog to close smoothly
    setTimeout(() => {
      setSelectedPlan(null);
    }, 300);
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
  };

  const handleBackToPlans = () => {
    setSelectedPlan(null);
  };

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID);
    toast.success(st.upiIdCopied);
  };

  const handleDone = () => {
    if (!selectedPlan) return;

    requestSubscription(
      {
        planMonths: selectedPlan.months,
        amount: selectedPlan.price,
      },
      {
        onSuccess: () => {
          toast.success(st.subscriptionPending, {
            description: st.subscriptionPendingMessage,
          });
          handleClose();
        },
        onError: (error) => {
          toast.error('Failed to submit request', {
            description: error instanceof Error ? error.message : 'Please try again.',
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={styles.dialogContent}>
        {!selectedPlan ? (
          <>
            <DialogHeader>
              <DialogTitle>{st.subscriptionTitle}</DialogTitle>
              <DialogDescription>
                {st.unlimitedEstimates}, {st.fullAccess}, {st.prioritySupport}
              </DialogDescription>
            </DialogHeader>
            <div className={styles.plansGrid}>
              {plans.map((plan, index) => (
                <div 
                  key={`${plan.months}-${index}`} 
                  className={`${styles.planCard} ${plan.isBestValue ? styles.bestValue : ''} ${plan.isLimitedOffer ? styles.limitedOffer : ''}`}
                >
                  {plan.isLimitedOffer && (
                    <div className={styles.limitedOfferBadge}>
                      <Flame size={14} />
                      <span>{st.limitedTimeOnly}</span>
                    </div>
                  )}
                  {plan.isBestValue && <Badge className={styles.bestValueBadge}>{st.bestValue}</Badge>}
                  <div className={styles.planHeader}>
                    <div>
                      <h3 className={styles.planDuration}>
                        {plan.displayTitle || `${plan.months} ${st.months}`}
                      </h3>
                      {plan.displaySubtitle && (
                        <p className={styles.planSubtitle}>{plan.displaySubtitle}</p>
                      )}
                    </div>
                    {plan.discount && <Badge variant="secondary">{plan.discount}</Badge>}
                  </div>
                  <div className={styles.planPricing}>
                    <p className={styles.planPrice}>₹{plan.price}</p>
                    <p className={styles.planPerMonth}>₹{Math.round(plan.price / plan.months)}/month</p>
                  </div>
                  <ul className={styles.planFeatures}>
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex}>{feature}</li>
                    ))}
                  </ul>
                  <Button onClick={() => handleSelectPlan(plan)} className={styles.subscribeButton}>
                    {st.subscribe}
                  </Button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className={styles.paymentHeader}>
                <Button variant="ghost" size="icon-sm" onClick={handleBackToPlans} className={styles.backButton}>
                  <ArrowLeft />
                </Button>
                <DialogTitle>{st.paymentInstructions}</DialogTitle>
              </div>
              <DialogDescription>
                You have selected the <strong>{selectedPlan.displayTitle || `${selectedPlan.months} ${st.months}`}</strong> plan.
              </DialogDescription>
            </DialogHeader>
            <div className={styles.paymentSection}>
              <div className={styles.upiInfo}>
                <p className={styles.upiLabel}>{st.upiId}:</p>
                <div className={styles.upiIdContainer}>
                  <span className={styles.upiId}>{UPI_ID}</span>
                  <Button variant="outline" size="sm" onClick={handleCopyUpiId}>
                    <Copy size={14} />
                    {st.copyUpiId}
                  </Button>
                </div>
              </div>
              <div className={styles.amountInfo}>
                <p className={styles.amountLabel}>{st.amountToPay}:</p>
                <p className={styles.amountValue}>₹{selectedPlan.price}</p>
              </div>
              <div className={styles.qrPlaceholder}>
                <p>Or scan the QR code in your UPI app.</p>
                <div className={styles.qrCodeBox}>QR Code Placeholder</div>
              </div>
              <div className={styles.instructions}>
                <h4>{st.paymentInstructions}:</h4>
                <ol>
                  <li>{st.step1}</li>
                  <li>{st.step2}</li>
                  <li>{st.step3}</li>
                </ol>
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={handleBackToPlans}>{st.cancel}</Button>
              <Button onClick={handleDone} disabled={isPending}>
                {isPending ? 'Submitting...' : st.done}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};