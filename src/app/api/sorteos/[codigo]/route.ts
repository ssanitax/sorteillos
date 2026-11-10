import { and, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { participantes, sorteos } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { normalizarCodigo } from "@/lib/codigo";

type RouteContext = {
  params: Promise<{ codigo: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
  }

  const { codigo } = await context.params;
  const normalized = normalizarCodigo(codigo);

  const [sorteo] = await db
    .select({
      id: sorteos.id,
      titulo: sorteos.titulo,
      codigo: sorteos.codigo,
      mensaje: sorteos.mensaje,
      ownerId: sorteos.userId,
    })
    .from(sorteos)
    .where(eq(sorteos.codigo, normalized))
    .limit(1);

  if (!sorteo) {
    return NextResponse.json(
      { error: "Sorteo no encontrado" },
      { status: 404 },
    );
  }

  const esCreador = sorteo.ownerId === user.id;

  const [mio] = await db
    .select({
      nombre: participantes.nombre,
      asignadoA: participantes.asignadoA,
    })
    .from(participantes)
    .where(
      and(
        eq(participantes.sorteoId, sorteo.id),
        eq(participantes.userId, user.id),
      ),
    )
    .limit(1);

  const pendientes = esCreador
    ? (
        await db
          .select({ nombre: participantes.nombre })
          .from(participantes)
          .where(
            and(
              eq(participantes.sorteoId, sorteo.id),
              isNull(participantes.userId),
            ),
          )
      ).map((row) => row.nombre)
    : undefined;

  if (mio) {
    return NextResponse.json({
      titulo: sorteo.titulo,
      codigo: sorteo.codigo,
      mensaje: sorteo.mensaje,
      esCreador,
      unido: true,
      tuNombre: mio.nombre,
      asignado: mio.asignadoA,
      ...(esCreador ? { pendientes } : {}),
    });
  }

  const todos = await db
    .select({
      nombre: participantes.nombre,
      userId: participantes.userId,
    })
    .from(participantes)
    .where(eq(participantes.sorteoId, sorteo.id));

  const nombres = todos.map((row) => ({
    nombre: row.nombre,
    libre: row.userId == null,
  }));

  return NextResponse.json({
    titulo: sorteo.titulo,
    codigo: sorteo.codigo,
    mensaje: sorteo.mensaje,
    esCreador,
    unido: false,
    nombres,
    nombresLibres: nombres.filter((n) => n.libre).map((n) => n.nombre),
    ...(esCreador ? { pendientes } : {}),
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
  }

  const { codigo } = await context.params;
  const normalized = normalizarCodigo(codigo);

  const [sorteo] = await db
    .select({ id: sorteos.id })
    .from(sorteos)
    .where(
      and(eq(sorteos.codigo, normalized), eq(sorteos.userId, user.id)),
    )
    .limit(1);

  if (!sorteo) {
    return NextResponse.json(
      { error: "Sorteo no encontrado" },
      { status: 404 },
    );
  }

  await db
    .delete(participantes)
    .where(eq(participantes.sorteoId, sorteo.id));
  await db.delete(sorteos).where(eq(sorteos.id, sorteo.id));

  return NextResponse.json({ ok: true });
}
