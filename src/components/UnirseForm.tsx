"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type PasoCodigo = {
  step: "codigo";
};

type PasoNombre = {
  step: "nombre";
  codigo: string;
  titulo: string;
  nombresLibres: string[];
};

type State = PasoCodigo | PasoNombre;

type Props = {
  codigoInicial?: string;
  sorteoInicial?: {
    codigo: string;
    titulo: string;
    nombresLibres: string[];
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
          nombresLibres: sorteoInicial.nombresLibres,
        }
      : { step: "codigo" },
  );
  const [codigo, setCodigo] = useState(
    codigoInicial || sorteoInicial?.codigo || "",
  );
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
        nombresLibres?: string[];
      };

      if (response.status === 401) {
        router.push("/login");
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

      if (!data.nombresLibres?.length) {
        setError("No quedan nombres libres en este sorteo.");
        return;
      }

      setState({
        step: "nombre",
        codigo: data.codigo!,
        titulo: data.titulo!,
        nombresLibres: data.nombresLibres,
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
        router.push("/login");
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
      <form onSubmit={reclamar} className="mt-10 flex max-w-md flex-col gap-6">
        <div>
          <p className="text-sm font-medium text-pine">
            Sorteo
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-ink">
            {state.titulo}
          </p>
          <p className="mt-1 font-mono text-sm text-pine-deep/70">
            {state.codigo}
          </p>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-pine">
            ¿Quién eres?
          </span>
          <select
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="appearance-none border-0 border-b-2 border-pine/30 bg-transparent py-3 text-xl text-ink outline-none transition focus:border-ink"
            required
          >
            <option value="">Elige tu nombre</option>
            {state.nombresLibres.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span className="text-sm text-pine-deep/65">
            Solo aparecen nombres aún no reclamados. Quedará asociado a tu
            cuenta.
          </span>
        </label>

        {error ? (
          <p className="text-sm font-medium text-coral-deep" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading || !nombre}
            className="inline-flex bg-coral px-7 py-3.5 font-semibold text-foam transition hover:bg-[#27695c] disabled:opacity-60"
          >
            {loading ? "Uniendo…" : "Unirme"}
          </button>
          <button
            type="button"
            onClick={() => {
              setState({ step: "codigo" });
              setError(null);
            }}
            className="text-sm font-semibold text-pine underline-offset-4 hover:underline"
          >
            Otro código
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={buscarSorteo} className="mt-10 flex max-w-md flex-col gap-6">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-pine">
          Código del sorteo
        </span>
        <input
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          placeholder="NAVIDAD26"
          className="border-0 border-b-2 border-pine/30 bg-transparent py-3 font-mono text-2xl tracking-wide text-ink outline-none transition placeholder:text-pine/35 focus:border-ink"
          maxLength={20}
          required
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
        className="inline-flex w-fit bg-coral px-7 py-3.5 font-semibold text-foam transition hover:bg-[#27695c] disabled:opacity-60"
      >
        {loading ? "Buscando…" : "Continuar"}
      </button>
    </form>
  );
}
