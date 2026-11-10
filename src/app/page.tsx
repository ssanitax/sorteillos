import Link from "next/link";
import { getSessionUser } from "@/lib/auth";

export default async function Home() {
  const user = await getSessionUser();

  return (
    <div className="atmosphere relative flex min-h-full flex-1 flex-col">
      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-end gap-5 px-6 pt-8 sm:px-10">
        {user ? (
          <Link
            href="/panel"
            className="text-sm font-medium text-ink/80 underline-offset-4 hover:text-ink hover:underline"
          >
            Ir al panel
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="text-sm font-medium text-ink/80 underline-offset-4 hover:text-ink hover:underline"
            >
              Entrar
            </Link>
            <Link
              href="/registro"
              className="text-sm font-medium text-pine underline-offset-4 hover:text-ink hover:underline"
            >
              Registro
            </Link>
          </>
        )}
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-16 sm:px-10 sm:py-20">
        <p className="font-display text-[clamp(3.75rem,15vw,8rem)] leading-[0.95] font-semibold tracking-[-0.02em] text-ink">
          Sorteillos
        </p>

        <p className="mt-6 max-w-lg text-lg leading-relaxed text-pine sm:text-xl">
          Organiza el amigo invisible, comparte el código y cada persona solo
          ve a quién le toca.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          {user ? (
            <>
              <Link
                href="/crear"
                className="inline-flex items-center justify-center rounded-md bg-coral px-6 py-3 text-base font-semibold text-foam transition hover:bg-[#27695c]"
              >
                Crear sorteo
              </Link>
              <Link
                href="/unirse"
                className="inline-flex items-center justify-center rounded-md border border-ink/15 bg-foam/70 px-6 py-3 text-base font-semibold text-ink transition hover:border-ink/30 hover:bg-foam"
              >
                Unirme
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/registro"
                className="inline-flex items-center justify-center rounded-md bg-coral px-6 py-3 text-base font-semibold text-foam transition hover:bg-[#27695c]"
              >
                Crear cuenta
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-md border border-ink/15 bg-foam/70 px-6 py-3 text-base font-semibold text-ink transition hover:border-ink/30 hover:bg-foam"
              >
                Ya tengo cuenta
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
