/**
 * Safely formats a date value (string or Date object) to a localized date string.
 * @param date - The date to format, can be a Date object, ISO string, or null
 * @param locale - The locale to use for formatting (default: 'en-GB')
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted date string or empty string if null
 */
export function formatDate(
  date: Date | string | null,
  locale: string = "en-GB",
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }
): string {
  if (!date) {
    return "";
  }

  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    console.error("Invalid date provided to formatDate:", date);
    return "";
  }

  return dateObj.toLocaleDateString(locale, options);
}

/**
 * Converts a date value (string or Date object) to a Date object.
 * @param date - The date to convert
 * @returns Date object or null if input is null or invalid
 */
export function toDateObject(date: Date | string | null): Date | null {
  if (!date) {
    return null;
  }

  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    console.error("Invalid date provided to toDateObject:", date);
    return null;
  }

  return dateObj;
}

/**
 * Formats a numeric value as currency with ₹ symbol using Indian number formatting.
 * @param amount - The amount to format, can be a string or number
 * @returns Formatted currency string with ₹ symbol
 */
export function formatCurrency(amount: string | number): string {
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    console.error("Invalid amount provided to formatCurrency:", amount);
    return "₹0";
  }

  // Use Indian locale for proper comma formatting (lakhs and crores)
  return `₹${numericAmount.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Converts a date to a relative time string like "2 days ago", "just now", etc.
 * @param date - The date to convert, can be a Date object or ISO string
 * @returns Human-readable relative time string
 */
export function getRelativeTimeString(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    console.error("Invalid date provided to getRelativeTimeString:", date);
    return "Invalid date";
  }

  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  // Future dates
  if (diffInMs < 0) {
    const absDiffInSeconds = Math.abs(diffInSeconds);
    const absDiffInMinutes = Math.abs(diffInMinutes);
    const absDiffInHours = Math.abs(diffInHours);
    const absDiffInDays = Math.abs(diffInDays);
    const absDiffInWeeks = Math.abs(diffInWeeks);
    const absDiffInMonths = Math.abs(diffInMonths);
    const absDiffInYears = Math.abs(diffInYears);

    if (absDiffInSeconds < 60) return "in a few seconds";
    if (absDiffInMinutes === 1) return "in 1 minute";
    if (absDiffInMinutes < 60) return `in ${absDiffInMinutes} minutes`;
    if (absDiffInHours === 1) return "in 1 hour";
    if (absDiffInHours < 24) return `in ${absDiffInHours} hours`;
    if (absDiffInDays === 1) return "tomorrow";
    if (absDiffInDays < 7) return `in ${absDiffInDays} days`;
    if (absDiffInWeeks === 1) return "in 1 week";
    if (absDiffInWeeks < 4) return `in ${absDiffInWeeks} weeks`;
    if (absDiffInMonths === 1) return "in 1 month";
    if (absDiffInMonths < 12) return `in ${absDiffInMonths} months`;
    if (absDiffInYears === 1) return "in 1 year";
    return `in ${absDiffInYears} years`;
  }

  // Past dates
  if (diffInSeconds < 10) return "just now";
  if (diffInSeconds < 60) return "a few seconds ago";
  if (diffInMinutes === 1) return "1 minute ago";
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInHours === 1) return "1 hour ago";
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInDays === 1) return "yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInWeeks === 1) return "1 week ago";
  if (diffInWeeks < 4) return `${diffInWeeks} weeks ago`;
  if (diffInMonths === 1) return "1 month ago";
  if (diffInMonths < 12) return `${diffInMonths} months ago`;
  if (diffInYears === 1) return "1 year ago";
  return `${diffInYears} years ago`;
}