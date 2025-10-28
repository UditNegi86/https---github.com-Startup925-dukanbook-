// If you need to udpate this type, make sure to also update
// components/ProtectedRoute
// endpoints/auth/login_with_password_POST
// endpoints/auth/register_with_password_POST
// endpoints/auth/session_GET
// helpers/getServerUserSession
// together with this in one toolcall.

export interface User {
  id: number;
  businessName: string;
  ownerName: string;
  contactNumber: string;
  businessType: string;
  displayName: string;
  avatarUrl: string | null;
  role: "admin" | "user";
  email: string | null; // Keep for compatibility
  address: string | null;
  pinCode: string | null;
  gstNumber: string | null;
  referralCode: string | null;
  referredByUserId: number | null;
  isActive: boolean;
  subscriptionStatus: string | null;
  subscriptionStartDate: Date | null;
  subscriptionEndDate: Date | null;
  subscriptionPlanMonths: number | null;
  lastPaymentAmount: string | null;
  lastPaymentDate: Date | null;
  enabledModules: string[];
  userType: "main_user" | "subuser";
  parentUserId: number | null;
  subuserId: number | null;
}