import { schema, OutputType } from "./lookup_GET.schema";
import { db } from "../../helpers/db";
import superjson from 'superjson';
import { ZodError } from "zod";

export async function handle(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const mobileNumber = url.searchParams.get("mobileNumber");

    const validatedInput = schema.parse({ mobileNumber });

    const customer = await db
      .selectFrom('estimates')
      .select(['customerName', 'mobileNumber'])
      .where('mobileNumber', '=', validatedInput.mobileNumber)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .executeTakeFirst();

    const responseData: OutputType = customer ? {
      customerName: customer.customerName,
      mobileNumber: customer.mobileNumber,
    } : null;

    return new Response(superjson.stringify(responseData), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response(superjson.stringify({ error: "Invalid input: " + error.message }), { status: 400 });
    }
    if (error instanceof Error) {
      console.error("Error in customers/lookup_GET:", error);
      return new Response(superjson.stringify({ error: error.message }), { status: 500 });
    }
    return new Response(superjson.stringify({ error: "An unknown error occurred" }), { status: 500 });
  }
}