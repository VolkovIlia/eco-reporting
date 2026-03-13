import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { db } from "@/db";
import { users, organizations } from "@/db/schema";
import { eq } from "drizzle-orm";

interface RegisterBody {
  email: string;
  password: string;
  name?: string;
  orgName: string;
  inn?: string;
}

function validateBody(body: unknown): body is RegisterBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  if (typeof b.email !== "string" || !b.email.includes("@")) return false;
  if (typeof b.password !== "string" || b.password.length < 8) return false;
  if (typeof b.orgName !== "string" || b.orgName.length === 0) return false;
  return true;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: "Неверный формат запроса" },
      { status: 400 }
    );
  }

  if (!validateBody(body)) {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: "Заполните обязательные поля: email, password (мин. 8 символов), orgName" },
      { status: 400 }
    );
  }

  // Check email uniqueness
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, body.email.toLowerCase()))
    .limit(1);

  if (existing) {
    return NextResponse.json(
      { code: "CONFLICT", message: "Email уже зарегистрирован" },
      { status: 409 }
    );
  }

  const passwordHash = await bcryptjs.hash(body.password, 12);

  // Create org and user in a transaction
  const result = await db.transaction(async (tx) => {
    const [org] = await tx
      .insert(organizations)
      .values({
        name: body.orgName,
        inn: body.inn ?? "0000000000",
      })
      .returning({ id: organizations.id });

    const [user] = await tx
      .insert(users)
      .values({
        email: body.email.toLowerCase(),
        passwordHash,
        name: body.name ?? null,
        orgId: org.id,
        role: "owner",
      })
      .returning({ id: users.id, email: users.email });

    return user;
  });

  return NextResponse.json(
    { id: result.id, email: result.email },
    { status: 201 }
  );
}
