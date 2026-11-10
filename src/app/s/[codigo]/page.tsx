import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { UnirseForm } from "@/components/UnirseForm";
import { db } from "@/db";
import { participantes, sorteos } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { normalizarCodigo } from "@/lib/codigo";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ codigo: string }>;
};

export default async function SorteoPage({ params }: PageProps) {
  const user = await getSessionUser();
  const { codigo } = await params;
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
    notFound();
  }

  const nextPath = `/s/${sorteo.codigo}`;
  const nextQuery = `?next=${encodeURIComponent(nextPath)}`;

  if (!user) {
    return (
      <div className="atmosphere relative flex min-h-full flex-1 flex-col">
        <div className="relative z-10 mx-auto w-full max-w-3xl px-4 py-10 sm:px-10 sm:py-16">
          <Link
            href="/"
            className="brand-mark font-display text-2xl font-semibold tracking-tight transition hover:opacity-80"
          >
            Sorteillos
          </Link>

          <p className="mt-10 text-sm font-medium text-coral">Amigo invisible</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
            {sorteo.titulo}
          </h1>
          <p className="mt-3 max-w-md text-base text-pine sm:text-lg">
            Para ver a quién te toca, entra o crea una cuenta. Luego vuelves
            aquí automáticamente.
          </p>
          <p className="mt-2 font-mono text-sm tracking-wide text-coral/80">
            {sorteo.codigo}
          </p>

          <div className="mt-10 flex w-full flex-col gap-3 sm:max-w-sm sm:flex-row">
            <Link href={`/registro${nextQuery}`} className="btn-primary flex-1">
              Crear cuenta
            </Link>
            <Link href={`/login${nextQuery}`} className="btn-secondary flex-1">
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </div>
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
    ? await db
        .select({ nombre: participantes.nombre })
        .from(participantes)
        .where(
          and(
            eq(participantes.sorteoId, sorteo.id),
            isNull(participantes.userId),
          ),
        )
    : [];

  const todos = mio
    ? []
    : await db
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
  const hayLibres = nombres.some((n) => n.libre);

  return (
    <div className="atmosphere relative flex min-h-full flex-1 flex-col">
      <div className="relative z-10 mx-auto w-full max-w-3xl px-4 py-10 sm:px-10 sm:py-16">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="brand-mark font-display text-2xl font-semibold tracking-tight transition hover:opacity-80"
          >
            Sorteillos
          </Link>
          <Link
            href="/panel"
            className="text-sm font-semibold text-pine transition hover:text-coral"
          >
            Mi panel
          </Link>
        </div>

        <p className="mt-8 text-sm font-medium text-coral sm:mt-10">
          Amigo invisible
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
          {sorteo.titulo}
        </h1>

        {mio ? (
          <div className="mt-8 max-w-lg sm:mt-10">
            <p className="text-base text-pine sm:text-lg">
              Eres{" "}
              <span className="font-semibold text-ink">{mio.nombre}</span>. Te
              ha tocado regalar a:
            </p>
            <p className="rise mt-5 break-words font-display text-4xl font-semibold tracking-tight text-mark sm:text-6xl">
              {mio.asignadoA}
            </p>
            {sorteo.mensaje ? (
              <p className="mt-8 border-l-2 border-lilac pl-4 text-base leading-relaxed text-pine">
                {sorteo.mensaje}
              </p>
            ) : null}
            <p className="mt-8 text-sm text-pine">
              Queda guardado en tu panel. Puedes volver cuando quieras.
            </p>
          </div>
        ) : (
          <>
            <p className="mt-3 max-w-md text-base text-pine sm:text-lg">
              {hayLibres
                ? "Aún no estás unido. Elige quién eres para ver tu asignación."
                : "No quedan nombres libres en este sorteo."}
            </p>
            {hayLibres ? (
              <UnirseForm
                sorteoInicial={{
                  codigo: sorteo.codigo,
                  titulo: sorteo.titulo,
                  nombres,
                }}
              />
            ) : null}
          </>
        )}

        {esCreador ? (
          <section className="mt-12 max-w-lg border-t border-lilac/40 pt-8 sm:mt-14">
            <h2 className="font-display text-xl font-semibold text-ink">
              Pendientes de unirse
            </h2>
            {pendientes.length === 0 ? (
              <p className="mt-3 text-sm text-pine">
                Todo el mundo ya ha elegido nombre.
              </p>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                {pendientes.map((p) => (
                  <span key={p.nombre} className="chip">
                    {p.nombre}
                  </span>
                ))}
              </div>
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
}
