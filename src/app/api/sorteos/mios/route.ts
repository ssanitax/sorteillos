import { and, count, desc, eq, isNotNull, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { participantes, sorteos } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
  }

  const creadosRows = await db
    .select({
      codigo: sorteos.codigo,
      titulo: sorteos.titulo,
      createdAt: sorteos.createdAt,
      numParticipantes: count(participantes.id),
      numUnidos: sql<number>`sum(case when ${participantes.userId} is not null then 1 else 0 end)`,
    })
    .from(sorteos)
    .leftJoin(participantes, eq(participantes.sorteoId, sorteos.id))
    .where(eq(sorteos.userId, user.id))
    .groupBy(sorteos.id)
    .orderBy(desc(sorteos.createdAt));

  const unidosRows = await db
    .select({
      codigo: sorteos.codigo,
      titulo: sorteos.titulo,
      mensaje: sorteos.mensaje,
      createdAt: sorteos.createdAt,
      tuNombre: participantes.nombre,
      asignado: participantes.asignadoA,
    })
    .from(participantes)
    .innerJoin(sorteos, eq(participantes.sorteoId, sorteos.id))
    .where(
      and(
        eq(participantes.userId, user.id),
        isNotNull(participantes.userId),
      ),
    )
    .orderBy(desc(sorteos.createdAt));

  return NextResponse.json({
    creados: creadosRows.map((row) => ({
      codigo: row.codigo,
      titulo: row.titulo,
      createdAt: row.createdAt,
      numParticipantes: Number(row.numParticipantes),
      numUnidos: Number(row.numUnidos),
    })),
    unidos: unidosRows.map((row) => ({
      codigo: row.codigo,
      titulo: row.titulo,
      mensaje: row.mensaje,
      createdAt: row.createdAt,
      tuNombre: row.tuNombre,
      asignado: row.asignado,
    })),
  });
}
