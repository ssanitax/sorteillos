"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type SorteoCreado = {
  codigo: string;
  titulo: string;
  numParticipantes: number;
  numUnidos: number;
};

export type SorteoUnido = {
  codigo: string;
  titulo: string;
  mensaje: string | null;
  tuNombre: string;
  asignado: string;
};

type Props = {
  creados: SorteoCreado[];
  unidos: SorteoUnido[];
};

export function PanelSorteos({ creados: initialCreados, unidos }: Props) {
  const router = useRouter();
  const [creados, setCreados] = useState(initialCreados);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function borrar(codigo: string, titulo: string) {
    const ok = window.confirm(
      `¿Borrar el sorteo «${titulo}» (${codigo})? Esta acción no se puede deshacer.`,
    );
    if (!ok) return;

    setError(null);
    setDeleting(codigo);
    try {
      const response = await fetch(`/api/sorteos/${codigo}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "No se pudo borrar el sorteo.");
        return;
      }

      setCreados((prev) => prev.filter((s) => s.codigo !== codigo));
      router.refresh();
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="mt-12 flex flex-col gap-12">
      {error ? (
        <p className="text-sm font-medium text-mark" role="alert">
          {error}
        </p>
      ) : null}

      <section>
        <h2 className="font-display text-2xl font-semibold text-ink">
          Sorteos que creé
        </h2>
        {creados.length === 0 ? (
          <p className="mt-4 text-pine">
            Aún no has creado ninguno.{" "}
            <Link
              href="/crear"
              className="font-semibold text-coral underline-offset-4 hover:underline"
            >
              Crear sorteo
            </Link>
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {creados.map((sorteo) => (
              <li key={sorteo.codigo} className="soft-panel px-4 py-4 sm:px-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-display text-xl font-semibold text-ink">
                      {sorteo.titulo}
                    </p>
                    <p className="mt-1 font-mono text-sm text-coral/80">
                      {sorteo.codigo} · {sorteo.numUnidos}/
                      {sorteo.numParticipantes} unidos
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <Link
                      href={`/s/${sorteo.codigo}/hecho`}
                      className="text-sm font-semibold text-pine transition hover:text-coral"
                    >
                      Compartir
                    </Link>
                    <Link
                      href={`/s/${sorteo.codigo}`}
                      className="text-sm font-semibold text-coral transition hover:text-coral-deep"
                    >
                      Abrir
                    </Link>
                    <button
                      type="button"
                      onClick={() => borrar(sorteo.codigo, sorteo.titulo)}
                      disabled={deleting === sorteo.codigo}
                      className="text-sm font-semibold text-mark transition hover:underline disabled:opacity-60"
                    >
                      {deleting === sorteo.codigo ? "Borrando…" : "Borrar"}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold text-ink">
          Sorteos a los que me uní
        </h2>
        {unidos.length === 0 ? (
          <p className="mt-4 text-pine">
            Todavía no te has unido a ninguno.{" "}
            <Link
              href="/unirse"
              className="font-semibold text-coral underline-offset-4 hover:underline"
            >
              Unirme con un código
            </Link>
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {unidos.map((sorteo) => (
              <li key={sorteo.codigo} className="soft-panel px-4 py-4 sm:px-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-display text-xl font-semibold text-ink">
                      {sorteo.titulo}
                    </p>
                    <p className="mt-1 text-sm text-pine">
                      Eres{" "}
                      <span className="font-semibold text-ink">
                        {sorteo.tuNombre}
                      </span>
                      {" · "}
                      Te ha tocado{" "}
                      <span className="font-semibold text-mark">
                        {sorteo.asignado}
                      </span>
                    </p>
                    {sorteo.mensaje ? (
                      <p className="mt-2 text-sm leading-relaxed text-pine">
                        {sorteo.mensaje}
                      </p>
                    ) : null}
                    <p className="mt-1 font-mono text-xs text-coral/70">
                      {sorteo.codigo}
                    </p>
                  </div>
                  <Link
                    href={`/s/${sorteo.codigo}`}
                    className="text-sm font-semibold text-coral transition hover:text-coral-deep"
                  >
                    Ver detalle
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
