import Link from "next/link";
import { getSessionUser } from "@/lib/auth";

export default async function Home() {
  const user = await getSessionUser();

  return (
    <div className="atmosphere relative flex flex-1 flex-col">
      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-end gap-5 px-4 pt-6 sm:px-10 sm:pt-8">
        {user ? (
          <Link
            href="/panel"
            className="text-sm font-medium text-pine transition hover:text-coral"
          >
            Ir al panel
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="text-sm font-medium text-pine transition hover:text-coral"
            >
              Entrar
            </Link>
            <Link
              href="/registro"
              className="text-sm font-semibold text-coral transition hover:text-coral-deep"
            >
              Registro
            </Link>
          </>
        )}
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-12 sm:px-10 sm:py-20">
        <p className="rise brand-mark font-display text-[clamp(3.2rem,15vw,8rem)] leading-[0.92] font-semibold tracking-[-0.03em]">
          Sorteillos
        </p>

        <p className="rise-delay-1 mt-5 max-w-md text-base leading-relaxed text-pine sm:mt-6 sm:text-xl">
          Organiza el amigo invisible, comparte el código y cada persona solo
          ve a quién le toca.
        </p>

        <div className="rise-delay-2 mt-8 flex w-full flex-col gap-3 sm:mt-10 sm:max-w-md sm:flex-row">
          {user ? (
            <>
              <Link href="/crear" className="btn-primary flex-1">
                Crear sorteo
              </Link>
              <Link href="/unirse" className="btn-secondary flex-1">
                Unirme
              </Link>
            </>
          ) : (
            <>
              <Link href="/registro" className="btn-primary flex-1">
                Crear cuenta
              </Link>
              <Link href="/login" className="btn-secondary flex-1">
                Ya tengo cuenta
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
