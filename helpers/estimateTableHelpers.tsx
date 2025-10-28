// Type for due date color classes
export type DueDateColorClass = 'dueDefault' | 'duePastDue' | 'dueVeryUrgent' | 'dueUrgent' | 'dueSoon';

// Helper function to calculate days until expected payment date
export const calculateDaysUntilDue = (expectedPaymentDate: Date | string | null): number | null => {
  if (!expectedPaymentDate) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueDate = new Date(expectedPaymentDate);
  dueDate.setHours(0, 0, 0, 0);
  
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Helper function to determine color class based on days remaining
export const getDueDateColorClass = (daysRemaining: number | null): DueDateColorClass => {
  if (daysRemaining === null) return 'dueDefault';
  
  if (daysRemaining <= 0) return 'duePastDue';
  if (daysRemaining <= 2) return 'dueVeryUrgent';
  if (daysRemaining <= 6) return 'dueUrgent';
  return 'dueSoon';
};

// Helper function to format currency
export const formatCurrency = (value: string | number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(value));
};