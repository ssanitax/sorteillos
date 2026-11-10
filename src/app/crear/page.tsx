import Link from "next/link";
import { redirect } from "next/navigation";
import { CrearSorteoForm } from "@/components/CrearSorteoForm";
import { getSessionUser } from "@/lib/auth";

export default async function CrearPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

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
            Mis sorteos
          </Link>
        </div>

        <h1 className=" mt-10 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Crear amigo invisible
        </h1>
        <p
          className=" mt-3 max-w-lg text-lg text-pine-deep/75"
          style={{ animationDelay: "80ms" }}
        >
          Elige un código, añade los nombres y compártelo. Si también
          participas, únete después eligiendo tu nombre.
        </p>

        <CrearSorteoForm />
      </div>
    </div>
  );
}
