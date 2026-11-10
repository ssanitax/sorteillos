import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { CopiarEnlace } from "@/components/CopiarEnlace";
import { db } from "@/db";
import { sorteos } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { normalizarCodigo } from "@/lib/codigo";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ codigo: string }>;
};

export default async function HechoPage({ params }: PageProps) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { codigo } = await params;
  const normalized = normalizarCodigo(codigo);

  const [sorteo] = await db
    .select({
      titulo: sorteos.titulo,
      codigo: sorteos.codigo,
    })
    .from(sorteos)
    .where(
      and(eq(sorteos.codigo, normalized), eq(sorteos.userId, user.id)),
    )
    .limit(1);

  if (!sorteo) {
    notFound();
  }

  const path = `/s/${sorteo.codigo}`;
  const fallback = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}${path}`
    : path;

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
          <Link
            href="/panel"
            className="text-sm font-medium text-pine underline-offset-4 hover:underline"
          >
            Mi panel
          </Link>
        </div>

        <p className="mt-8 text-sm font-medium text-pine sm:mt-10">Listo</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
          {sorteo.titulo}
        </h1>
        <p className="mt-3 max-w-lg text-base text-pine sm:text-lg">
          Comparte el código o el enlace. Cada persona se registra, se une
          eligiendo su nombre y verá solo su asignación en su panel.
        </p>

        <CopiarEnlace path={path} fallback={fallback} />

        <p className="mt-6 text-sm text-pine">
          Código:{" "}
          <span className="font-mono font-semibold text-ink">
            {sorteo.codigo}
          </span>
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href={`/s/${sorteo.codigo}`}
            className="text-sm font-medium text-coral underline-offset-4 hover:underline"
          >
            Unirme yo también
          </Link>
          <Link
            href="/panel"
            className="text-sm font-medium text-pine underline-offset-4 hover:underline"
          >
            Ir al panel
          </Link>
        </div>
      </div>
    </div>
  );
}
