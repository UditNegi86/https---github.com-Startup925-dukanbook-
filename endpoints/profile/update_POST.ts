import { schema, InputType, OutputType } from "./update_POST.schema";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { db } from "../../helpers/db";
import { User } from "../../helpers/User";
import superjson from "superjson";
import { ZodError } from "zod";

export async function handle(request: Request) {
  try {
    const { user: currentUser } = await getServerUserSession(request);

    const json = superjson.parse(await request.text());
    const validatedInput = schema.parse(json);

    const updateData: Partial<{
      businessName: string;
      ownerName: string;
      displayName: string;
      businessType: string;
      email: string | null;
      address: string | null;
      pinCode: string | null;
      gstNumber: string | null;
      enabledModules: string[];
    }> = {};

    if (validatedInput.businessName) updateData.businessName = validatedInput.businessName;
    if (validatedInput.ownerName) updateData.ownerName = validatedInput.ownerName;
    if (validatedInput.displayName) updateData.displayName = validatedInput.displayName;
    if (validatedInput.businessType) updateData.businessType = validatedInput.businessType;
    if (validatedInput.email !== undefined) {
      updateData.email = validatedInput.email === "" ? null : validatedInput.email;
    }
    if (validatedInput.address !== undefined) {
      updateData.address = validatedInput.address === "" ? null : validatedInput.address;
    }
    if (validatedInput.pinCode !== undefined) {
      updateData.pinCode = validatedInput.pinCode === "" ? null : validatedInput.pinCode;
    }
    if (validatedInput.gstNumber !== undefined) {
      updateData.gstNumber = validatedInput.gstNumber === "" ? null : validatedInput.gstNumber;
    }
    if (validatedInput.enabledModules !== undefined) {
      // Always ensure dashboard and customer_record are included
      const baseModules = ['dashboard', 'customer_record'];
      const additionalModules = validatedInput.enabledModules.filter(
        m => !baseModules.includes(m)
      );
      updateData.enabledModules = [...baseModules, ...additionalModules];
    }

    await db
      .updateTable("users")
      .set(updateData)
      .where("id", "=", currentUser.id)
      .execute();

    const updatedUserResult = await db
      .selectFrom("users")
      .select([
        "id",
        "businessName",
        "ownerName",
        "contactNumber",
        "businessType",
        "displayName",
        "avatarUrl",
        "role",
        "email",
        "address",
        "pinCode",
        "gstNumber",
        "referralCode",
        "referredByUserId",
        "isActive",
        "subscriptionStatus",
        "subscriptionStartDate",
        "subscriptionEndDate",
        "subscriptionPlanMonths",
        "lastPaymentAmount",
        "lastPaymentDate",
        "enabledModules",
      ])
      .where("id", "=", currentUser.id)
      .executeTakeFirstOrThrow();

    const updatedUser: User = {
      id: updatedUserResult.id,
      businessName: updatedUserResult.businessName,
      ownerName: updatedUserResult.ownerName,
      contactNumber: updatedUserResult.contactNumber,
      businessType: updatedUserResult.businessType,
      displayName: updatedUserResult.displayName,
      avatarUrl: updatedUserResult.avatarUrl,
      role: updatedUserResult.role as "admin" | "user",
      email: updatedUserResult.email,
      address: updatedUserResult.address,
      pinCode: updatedUserResult.pinCode,
      gstNumber: updatedUserResult.gstNumber,
      referralCode: updatedUserResult.referralCode,
      referredByUserId: updatedUserResult.referredByUserId,
      isActive: updatedUserResult.isActive,
      subscriptionStatus: updatedUserResult.subscriptionStatus,
      subscriptionStartDate: updatedUserResult.subscriptionStartDate,
      subscriptionEndDate: updatedUserResult.subscriptionEndDate,
      subscriptionPlanMonths: updatedUserResult.subscriptionPlanMonths,
      lastPaymentAmount: updatedUserResult.lastPaymentAmount,
      lastPaymentDate: updatedUserResult.lastPaymentDate,
      enabledModules: updatedUserResult.enabledModules ?? ['dashboard', 'customer_record'],
      userType: 'main_user',
      parentUserId: null,
      subuserId: null,
    };

    return new Response(
      superjson.stringify({ user: updatedUser } satisfies OutputType)
    );
  } catch (error) {
    console.error("Failed to update profile:", error);
    if (error instanceof ZodError) {
      return new Response(
        superjson.stringify({ error: error.errors.map((e) => e.message).join(", ") }),
        { status: 400 }
      );
    }
    if (error instanceof Error) {
      return new Response(superjson.stringify({ error: error.message }), {
        status: 401,
      });
    }
    return new Response(
      superjson.stringify({ error: "An unknown error occurred." }),
      { status: 500 }
    );
  }
}