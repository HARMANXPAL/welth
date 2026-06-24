import { seedTransactions } from "@/actions/seed";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await seedTransactions();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}