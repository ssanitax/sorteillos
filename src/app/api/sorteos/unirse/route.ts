import { and, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { participantes, sorteos } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { validarCodigo } from "@/lib/codigo";

type Body = {
  codigo?: unknown;
  nombre?: unknown;
};

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const codigo = validarCodigo(body.codigo);
  const nombre =
    typeof body.nombre === "string" ? body.nombre.trim() : "";

  if (!codigo) {
    return NextResponse.json(
      { error: "Código inválido" },
      { status: 400 },
    );
  }

  if (!nombre) {
    return NextResponse.json(
      { error: "Elige quién eres" },
      { status: 400 },
    );
  }

  const [sorteo] = await db
    .select({
      id: sorteos.id,
      titulo: sorteos.titulo,
      codigo: sorteos.codigo,
      mensaje: sorteos.mensaje,
    })
    .from(sorteos)
    .where(eq(sorteos.codigo, codigo))
    .limit(1);

  if (!sorteo) {
    return NextResponse.json(
      { error: "Sorteo no encontrado" },
      { status: 404 },
    );
  }

  const [yaUnido] = await db
    .select({ id: participantes.id })
    .from(participantes)
    .where(
      and(
        eq(participantes.sorteoId, sorteo.id),
        eq(participantes.userId, user.id),
      ),
    )
    .limit(1);

  if (yaUnido) {
    return NextResponse.json(
      { error: "Ya estás unido a este sorteo" },
      { status: 409 },
    );
  }

  const [plaza] = await db
    .select({
      id: participantes.id,
      nombre: participantes.nombre,
      asignadoA: participantes.asignadoA,
    })
    .from(participantes)
    .where(
      and(
        eq(participantes.sorteoId, sorteo.id),
        eq(participantes.nombre, nombre),
        isNull(participantes.userId),
      ),
    )
    .limit(1);

  if (!plaza) {
    return NextResponse.json(
      {
        error:
          "Ese nombre no está libre o no existe en este sorteo",
      },
      { status: 409 },
    );
  }

  try {
    await db
      .update(participantes)
      .set({ userId: user.id })
      .where(
        and(eq(participantes.id, plaza.id), isNull(participantes.userId)),
      );

    const [confirmado] = await db
      .select({
        userId: participantes.userId,
        nombre: participantes.nombre,
        asignadoA: participantes.asignadoA,
      })
      .from(participantes)
      .where(eq(participantes.id, plaza.id))
      .limit(1);

    if (confirmado?.userId !== user.id) {
      return NextResponse.json(
        { error: "Alguien acaba de reclamar ese nombre" },
        { status: 409 },
      );
    }

    return NextResponse.json({
      codigo: sorteo.codigo,
      titulo: sorteo.titulo,
      mensaje: sorteo.mensaje,
      tuNombre: confirmado.nombre,
      asignado: confirmado.asignadoA,
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudo unir al sorteo" },
      { status: 409 },
    );
  }
}
