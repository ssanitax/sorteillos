import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { participantes, sorteos } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { normalizarCodigo } from "@/lib/codigo";

type RouteContext = {
  params: Promise<{ codigo: string }>;
};

/** Solo el usuario que reclamó el nombre ve su asignación. */
export async function POST(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
  }

  const { codigo } = await context.params;
  const normalizedCodigo = normalizarCodigo(codigo);

  const [sorteo] = await db
    .select({
      id: sorteos.id,
      titulo: sorteos.titulo,
      mensaje: sorteos.mensaje,
    })
    .from(sorteos)
    .where(eq(sorteos.codigo, normalizedCodigo))
    .limit(1);

  if (!sorteo) {
    return NextResponse.json(
      { error: "Sorteo no encontrado" },
      { status: 404 },
    );
  }

  const [row] = await db
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

  if (!row) {
    return NextResponse.json(
      { error: "No estás unido a este sorteo" },
      { status: 403 },
    );
  }

  return NextResponse.json({
    titulo: sorteo.titulo,
    mensaje: sorteo.mensaje,
    nombre: row.nombre,
    asignado: row.asignadoA,
  });
}
