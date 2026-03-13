import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pollutantCodes } from "@/db/schema";
import { ilike, or } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ code: "UNAUTHORIZED", message: "Требуется авторизация" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 100);

  if (q.length < 2) {
    return NextResponse.json({ code: "VALIDATION_ERROR", message: "Минимум 2 символа" }, { status: 400 });
  }

  const pattern = `%${q}%`;
  const results = await db
    .select()
    .from(pollutantCodes)
    .where(
      or(
        ilike(pollutantCodes.code, pattern),
        ilike(pollutantCodes.name, pattern),
        ilike(pollutantCodes.casNumber, pattern)
      )
    )
    .limit(limit);

  return NextResponse.json(results);
}
