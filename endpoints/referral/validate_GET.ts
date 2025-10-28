import { db } from "../../helpers/db";
import { schema, OutputType } from "./validate_GET.schema";
import superjson from 'superjson';

export async function handle(request: Request) {
  try {
    const url = new URL(request.url);
    const referralCode = url.searchParams.get("referralCode");

    const input = schema.parse({ referralCode });

    if (!input.referralCode) {
      return new Response(superjson.stringify({ valid: false } satisfies OutputType), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const referrer = await db
      .selectFrom("users")
      .select("businessName")
      .where("referralCode", "=", input.referralCode)
      .executeTakeFirst();

    if (referrer) {
      return new Response(superjson.stringify({
        valid: true,
        referrerName: referrer.businessName,
      } satisfies OutputType), {
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(superjson.stringify({ valid: false } satisfies OutputType), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error("Error validating referral code:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(superjson.stringify({ error: errorMessage }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}