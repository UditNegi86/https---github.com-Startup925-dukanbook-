import {
  setServerSession,
  NotAuthenticatedError,
} from "../../helpers/getSetServerSession";
import { User } from "../../helpers/User";
import { getServerUserSession } from "../../helpers/getServerUserSession";

export async function handle(request: Request) {
  try {
    const { user, session } = await getServerUserSession(request);

    // Create response with user data
    const userData: User = {
      id: user.id,
      businessName: user.businessName,
      ownerName: user.ownerName,
      contactNumber: user.contactNumber,
      businessType: user.businessType,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      address: user.address,
      pinCode: user.pinCode,
      gstNumber: user.gstNumber,
      referralCode: user.referralCode,
      referredByUserId: user.referredByUserId,
      isActive: user.isActive,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionStartDate: user.subscriptionStartDate,
      subscriptionEndDate: user.subscriptionEndDate,
      subscriptionPlanMonths: user.subscriptionPlanMonths,
      lastPaymentAmount: user.lastPaymentAmount,
      lastPaymentDate: user.lastPaymentDate,
      enabledModules: user.enabledModules ?? ['dashboard', 'customer_record'],
      userType: 'main_user',
      parentUserId: null,
      subuserId: null,
    };

    const response = Response.json({
      user: userData,
    });

    // Update the session cookie with the new lastAccessed time
    await setServerSession(response, {
      id: session.id,
      createdAt: session.createdAt,
      lastAccessed: session.lastAccessed.getTime(),
    });

    return response;
  } catch (error) {
    if (error instanceof NotAuthenticatedError) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }
    console.error("Session validation error:", error);
    return Response.json(
      { error: "Session validation failed" },
      { status: 400 }
    );
  }
}