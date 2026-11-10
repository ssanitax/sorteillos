import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  createSession,
  hashPassword,
  normalizeUsername,
  validarPassword,
  validarUsername,
} from "@/lib/auth";

type Body = {
  username?: unknown;
  password?: unknown;
  passwordConfirm?: unknown;
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
  const passwordConfirm =
    typeof body.passwordConfirm === "string" ? body.passwordConfirm : "";

  if (!validarUsername(username)) {
    return NextResponse.json(
      {
        error:
          "El usuario debe tener 3–24 caracteres (minúsculas, números o _)",
      },
      { status: 400 },
    );
  }

  if (!validarPassword(password)) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 8 caracteres" },
      { status: 400 },
    );
  }

  if (password !== passwordConfirm) {
    return NextResponse.json(
      { error: "Las contraseñas no coinciden" },
      { status: 400 },
    );
  }

  const passwordHash = await hashPassword(password);

  try {
    const [user] = await db
      .insert(users)
      .values({ username, passwordHash })
      .returning({
        id: users.id,
        username: users.username,
      });

    await createSession(user.id);

    return NextResponse.json({ user }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Ese usuario ya está registrado" },
      { status: 409 },
    );
  }
}
