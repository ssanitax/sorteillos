import Link from "next/link";
import { redirect } from "next/navigation";
import { and, count, desc, eq, isNotNull, sql } from "drizzle-orm";
import { LogoutButton } from "@/components/LogoutButton";
import { PanelSorteos } from "@/components/PanelSorteos";
import { db } from "@/db";
import { participantes, sorteos } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PanelPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const creadosRows = await db
    .select({
      codigo: sorteos.codigo,
      titulo: sorteos.titulo,
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

  const creados = creadosRows.map((row) => ({
    codigo: row.codigo,
    titulo: row.titulo,
    numParticipantes: Number(row.numParticipantes),
    numUnidos: Number(row.numUnidos),
  }));

  const unidos = unidosRows.map((row) => ({
    codigo: row.codigo,
    titulo: row.titulo,
    mensaje: row.mensaje,
    tuNombre: row.tuNombre,
    asignado: row.asignado,
  }));

  return (
    <div className="atmosphere relative flex min-h-full flex-1 flex-col">
      <div className="relative z-10 mx-auto w-full max-w-3xl px-4 py-10 sm:px-10 sm:py-16">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="font-display text-2xl font-semibold tracking-tight text-ink transition hover:text-coral"
          >
            Sorteillos
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="max-w-[40vw] truncate text-sm text-pine">
              @{user.username}
            </span>
            <LogoutButton />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-6 sm:mt-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
              Tu panel
            </h1>
            <p className="mt-3 max-w-md text-base text-pine sm:text-lg">
              Crea un amigo invisible o únete con un código. Tu asignación
              queda guardada en tu perfil.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/unirse"
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md border border-ink/15 bg-foam/70 px-5 py-3 font-semibold text-ink transition hover:border-ink/30 sm:flex-none"
            >
              Unirme
            </Link>
            <Link
              href="/crear"
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md bg-coral px-5 py-3 font-semibold text-foam transition hover:bg-[#27695c] sm:flex-none"
            >
              Crear
            </Link>
          </div>
        </div>

        <PanelSorteos creados={creados} unidos={unidos} />
      </div>
    </div>
  );
}
