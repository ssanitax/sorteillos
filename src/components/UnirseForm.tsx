"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type NombreTag = {
  nombre: string;
  libre: boolean;
};

type PasoCodigo = {
  step: "codigo";
};

type PasoNombre = {
  step: "nombre";
  codigo: string;
  titulo: string;
  nombres: NombreTag[];
};

type State = PasoCodigo | PasoNombre;

type Props = {
  codigoInicial?: string;
  sorteoInicial?: {
    codigo: string;
    titulo: string;
    nombres: NombreTag[];
  };
};

export function UnirseForm({ codigoInicial = "", sorteoInicial }: Props) {
  const router = useRouter();
  const [state, setState] = useState<State>(() =>
    sorteoInicial
      ? {
          step: "nombre",
          codigo: sorteoInicial.codigo,
          titulo: sorteoInicial.titulo,
          nombres: sorteoInicial.nombres,
        }
      : { step: "codigo" },
  );
  const [codigo, setCodigo] = useState(
    codigoInicial || sorteoInicial?.codigo || "",
  );
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function goAuth(pathCodigo: string) {
    const next = encodeURIComponent(`/s/${pathCodigo}`);
    router.push(`/registro?next=${next}`);
  }

  async function buscarSorteo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const normalized = codigo.trim().toUpperCase();
    if (normalized.length < 4) {
      setError("Introduce un código válido.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/sorteos/${normalized}`);
      const data = (await response.json()) as {
        error?: string;
        titulo?: string;
        codigo?: string;
        unido?: boolean;
        nombres?: NombreTag[];
        nombresLibres?: string[];
      };

      if (response.status === 401) {
        goAuth(normalized);
        return;
      }

      if (!response.ok) {
        setError(data.error ?? "No se encontró el sorteo.");
        return;
      }

      if (data.unido) {
        router.push(`/s/${data.codigo}`);
        return;
      }

      const nombres: NombreTag[] =
        data.nombres ??
        (data.nombresLibres ?? []).map((n) => ({ nombre: n, libre: true }));

      if (!nombres.some((n) => n.libre)) {
        setError("No quedan nombres libres en este sorteo.");
        return;
      }

      setState({
        step: "nombre",
        codigo: data.codigo!,
        titulo: data.titulo!,
        nombres,
      });
      setNombre("");
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function reclamar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.step !== "nombre") return;
    setError(null);

    if (!nombre) {
      setError("Elige quién eres.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/sorteos/unirse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: state.codigo, nombre }),
      });

      const data = (await response.json()) as {
        error?: string;
        codigo?: string;
      };

      if (response.status === 401) {
        goAuth(state.codigo);
        return;
      }

      if (!response.ok || !data.codigo) {
        setError(data.error ?? "No se pudo unir al sorteo.");
        return;
      }

      router.push(`/s/${data.codigo}`);
      router.refresh();
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (state.step === "nombre") {
    return (
      <form onSubmit={reclamar} className="mt-8 flex w-full max-w-lg flex-col gap-6">
        <div>
          <p className="text-sm font-medium text-pine">Sorteo</p>
          <p className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">
            {state.titulo}
          </p>
          <p className="mt-1 font-mono text-sm text-pine">{state.codigo}</p>
        </div>

        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-medium text-pine">¿Quién eres?</legend>
          <div className="flex flex-wrap gap-2">
            {state.nombres.map((tag) => {
              const selected = nombre === tag.nombre;
              if (!tag.libre) {
                return (
                  <span
                    key={tag.nombre}
                    title="Ya unido"
                    className="inline-flex min-h-11 items-center rounded-md border border-ink/10 bg-mist/80 px-4 py-2.5 text-base text-pine/55 line-through decoration-pine/30"
                  >
                    {tag.nombre}
                  </span>
                );
              }
              return (
                <button
                  key={tag.nombre}
                  type="button"
                  onClick={() => setNombre(tag.nombre)}
                  aria-pressed={selected}
                  className={`min-h-11 rounded-md px-4 py-2.5 text-base font-medium transition ${
                    selected
                      ? "bg-coral text-foam"
                      : "border border-ink/15 bg-foam/80 text-ink hover:border-coral/50 hover:bg-foam"
                  }`}
                >
                  {tag.nombre}
                </button>
              );
            })}
          </div>
          <span className="text-sm text-pine">
            Toca tu nombre. Los tachados ya se han unido.
          </span>
        </fieldset>

        {error ? (
          <p className="text-sm font-medium text-coral-deep" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="submit"
            disabled={loading || !nombre}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-coral px-7 py-3 font-semibold text-foam transition hover:bg-[#27695c] disabled:opacity-60 sm:w-auto"
          >
            {loading ? "Uniendo…" : "Unirme"}
          </button>
          {!sorteoInicial ? (
            <button
              type="button"
              onClick={() => {
                setState({ step: "codigo" });
                setError(null);
              }}
              className="min-h-11 text-sm font-semibold text-pine underline-offset-4 hover:underline"
            >
              Otro código
            </button>
          ) : null}
        </div>
      </form>
    );
  }

  return (
    <form
      onSubmit={buscarSorteo}
      className="mt-8 flex w-full max-w-lg flex-col gap-6"
    >
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-pine">Código del sorteo</span>
        <input
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          placeholder="NAVIDAD26"
          className="border-0 border-b-2 border-pine/30 bg-transparent py-3 font-mono text-xl tracking-wide text-ink outline-none transition placeholder:text-pine/35 focus:border-ink sm:text-2xl"
          maxLength={20}
          required
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
        />
      </label>

      {error ? (
        <p className="text-sm font-medium text-coral-deep" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-coral px-7 py-3 font-semibold text-foam transition hover:bg-[#27695c] disabled:opacity-60 sm:w-auto"
      >
        {loading ? "Buscando…" : "Continuar"}
      </button>
    </form>
  );
}
