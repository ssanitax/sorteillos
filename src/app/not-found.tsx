import Link from "next/link";

export default function NotFound() {
  return (
    <div className="atmosphere relative flex min-h-full flex-1 flex-col overflow-hidden">
      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-16 sm:px-10">
        <Link
          href="/"
          className="brand-mark font-display text-2xl font-semibold tracking-tight"
        >
          Sorteillos
        </Link>
        <h1 className="mt-10 font-display text-4xl font-semibold text-ink">
          No encontramos ese sorteo
        </h1>
        <p className="mt-3 max-w-md text-lg text-pine">
          El código no existe o el enlace está mal escrito.
        </p>
        <Link href="/crear" className="btn-primary mt-8 w-fit">
          Crear uno nuevo
        </Link>
      </div>
    </div>
  );
}
