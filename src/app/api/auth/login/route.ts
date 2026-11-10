import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  createSession,
  normalizeUsername,
  verifyPassword,
} from "@/lib/auth";

type Body = {
  username?: unknown;
  password?: unknown;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const username =
    typeof body.username === "string"
      ? normalizeUsername(body.username)
      : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json(
      { error: "Usuario y contraseña son obligatorios" },
      { status: 400 },
    );
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (!user || !(await verifyPassword(user.passwordHash, password))) {
    return NextResponse.json(
      { error: "Usuario o contraseña incorrectos" },
      { status: 401 },
    );
  }

  await createSession(user.id);

  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
    },
  });
}
