import Link from "next/link";
import { redirect } from "next/navigation";
import { UnirseForm } from "@/components/UnirseForm";
import { getSessionUser } from "@/lib/auth";

type PageProps = {
  searchParams: Promise<{ codigo?: string }>;
};

export default async function UnirsePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const codigoInicial = params.codigo?.trim().toUpperCase() ?? "";
  const user = await getSessionUser();

  if (!user) {
    // Con código: la página del sorteo ofrece registro/login sin perder el enlace.
    if (codigoInicial) redirect(`/s/${codigoInicial}`);
    redirect(`/registro?next=${encodeURIComponent("/unirse")}`);
  }

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
            className="text-sm font-semibold text-pine underline-offset-4 hover:underline"
          >
            Mi panel
          </Link>
        </div>

        <h1 className="mt-8 font-display text-3xl font-semibold tracking-tight text-ink sm:mt-10 sm:text-5xl">
          Unirme a un sorteo
        </h1>
        <p className="mt-3 max-w-lg text-base text-pine sm:text-lg">
          Introduce el código, elige quién eres y tu asignación quedará
          guardada en tu cuenta.
        </p>

        <UnirseForm codigoInicial={codigoInicial} />
      </div>
    </div>
  );
}
