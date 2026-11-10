import Link from "next/link";
import { notFound, redirect } from "next/navigation";
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

  if (!user) {
    redirect(`/login`);
  }

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

  const libres = mio
    ? []
    : await db
        .select({ nombre: participantes.nombre })
        .from(participantes)
        .where(
          and(
            eq(participantes.sorteoId, sorteo.id),
            isNull(participantes.userId),
          ),
        );

  return (
    <div className="atmosphere relative flex min-h-full flex-1 flex-col overflow-hidden">
      <div className="relative z-10 mx-auto w-full max-w-3xl px-6 py-12 sm:px-10 sm:py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="font-display text-2xl font-extrabold tracking-tight text-pine-deep transition hover:text-coral"
          >
            Sorteillos
          </Link>
          <Link
            href="/panel"
            className="text-sm font-semibold text-pine underline-offset-4 hover:underline"
          >
            Mi panel
          </Link>
        </div>

        <p className="mt-10 text-sm font-medium text-pine">
          Amigo invisible
        </p>
        <h1
          className=" mt-2 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl"
          style={{ animationDelay: "60ms" }}
        >
          {sorteo.titulo}
        </h1>

        {mio ? (
          <div className=" mt-10 max-w-lg">
            <p className="text-lg text-pine-deep/80">
              Eres{" "}
              <span className="font-semibold text-ink">{mio.nombre}</span>. Te
              ha tocado regalar a:
            </p>
            <p className="mt-6 font-display text-5xl font-semibold tracking-tight text-mark sm:text-6xl">
              {mio.asignadoA}
            </p>
            {sorteo.mensaje ? (
              <p className="mt-8 border-l-2 border-ink pl-4 text-base leading-relaxed text-pine">
                {sorteo.mensaje}
              </p>
            ) : null}
            <p className="mt-8 text-sm text-pine-deep/60">
              Queda guardado en tu panel. Puedes volver cuando quieras.
            </p>
          </div>
        ) : (
          <>
            <p
              className=" mt-3 max-w-md text-lg text-pine-deep/75"
              style={{ animationDelay: "120ms" }}
            >
              {libres.length > 0
                ? "Aún no estás unido. Elige quién eres para ver tu asignación."
                : "No quedan nombres libres en este sorteo."}
            </p>
            {libres.length > 0 ? (
              <UnirseForm
                sorteoInicial={{
                  codigo: sorteo.codigo,
                  titulo: sorteo.titulo,
                  nombresLibres: libres.map((row) => row.nombre),
                }}
              />
            ) : null}
          </>
        )}

        {esCreador ? (
          <section className="mt-14 max-w-lg border-t border-pine/15 pt-8">
            <h2 className="font-display text-xl font-bold text-ink">
              Pendientes de unirse
            </h2>
            {pendientes.length === 0 ? (
              <p className="mt-3 text-sm text-pine-deep/70">
                Todo el mundo ya ha elegido nombre.
              </p>
            ) : (
              <ul className="mt-4 flex flex-col gap-2">
                {pendientes.map((p) => (
                  <li
                    key={p.nombre}
                    className="border-b border-pine/10 py-2 text-base text-ink"
                  >
                    {p.nombre}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
}
