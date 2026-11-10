import Link from "next/link";
import { redirect } from "next/navigation";
import { UnirseForm } from "@/components/UnirseForm";
import { getSessionUser } from "@/lib/auth";

type PageProps = {
  searchParams: Promise<{ codigo?: string }>;
};

export default async function UnirsePage({ searchParams }: PageProps) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const codigoInicial = params.codigo?.trim().toUpperCase() ?? "";

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

        <h1 className="mt-10 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Unirme a un sorteo
        </h1>
        <p className="mt-3 max-w-lg text-lg text-pine-deep/75">
          Introduce el código, elige quién eres y tu asignación quedará
          guardada en tu cuenta.
        </p>

        <UnirseForm codigoInicial={codigoInicial} />
      </div>
    </div>
  );
}
