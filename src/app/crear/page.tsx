import Link from "next/link";
import { redirect } from "next/navigation";
import { CrearSorteoForm } from "@/components/CrearSorteoForm";
import { getSessionUser } from "@/lib/auth";

export default async function CrearPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="atmosphere relative flex min-h-full flex-1 flex-col overflow-hidden">
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
            Mis sorteos
          </Link>
        </div>

        <h1 className="mt-8 font-display text-3xl font-semibold tracking-tight text-ink sm:mt-10 sm:text-5xl">
          Crear amigo invisible
        </h1>
        <p className="mt-3 max-w-lg text-base text-pine sm:text-lg">
          Elige un código, añade los nombres y compártelo. Si también
          participas, únete después eligiendo tu nombre.
        </p>

        <CrearSorteoForm />
      </div>
    </div>
  );
}
