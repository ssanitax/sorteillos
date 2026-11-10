import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getSessionUser } from "@/lib/auth";
import { safeNextPath } from "@/lib/safe-next";

type PageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function RegistroPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  const user = await getSessionUser();
  if (user) redirect(next);

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
            href={next}
            className="text-sm font-semibold text-pine underline-offset-4 hover:underline"
          >
            ← Atrás
          </Link>
        </div>
        <h1 className="mt-8 font-display text-3xl font-semibold tracking-tight text-ink sm:mt-10 sm:text-5xl">
          Crear cuenta
        </h1>
        <p className="mt-3 max-w-md text-base text-pine sm:text-lg">
          Elige un usuario y una contraseña para crear o unirte a sorteos.
        </p>
        <AuthForm mode="registro" next={next} />
      </div>
    </div>
  );
}
