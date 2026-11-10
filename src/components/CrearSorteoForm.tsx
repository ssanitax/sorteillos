"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function CrearSorteoForm() {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nombres, setNombres] = useState<string[]>([""]);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateNombre(index: number, value: string) {
    setNombres((prev) => prev.map((n, i) => (i === index ? value : n)));
  }

  function addNombre() {
    setNombres((prev) => [...prev, ""]);
  }

  function removeNombre(index: number) {
    setNombres((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== index),
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const lista = nombres.map((n) => n.trim()).filter(Boolean);

    if (!titulo.trim()) {
      setError("Pon un nombre al sorteo.");
      return;
    }

    if (!codigo.trim()) {
      setError("Elige un código para el sorteo.");
      return;
    }

    if (lista.length < 3) {
      setError("Añade al menos 3 participantes.");
      return;
    }

    const keys = lista.map((n) => n.toLocaleLowerCase("es"));
    if (new Set(keys).size !== keys.length) {
      setError("Hay nombres duplicados.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/sorteos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: titulo.trim(),
          codigo: codigo.trim(),
          nombres: lista,
          mensaje: mensaje.trim() || null,
        }),
      });

      const data = (await response.json()) as {
        codigo?: string;
        error?: string;
      };

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok || !data.codigo) {
        setError(data.error ?? "No se pudo crear el sorteo.");
        return;
      }

      router.push(`/s/${data.codigo}/hecho`);
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 flex max-w-xl flex-col gap-8">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-pine">
          Nombre del sorteo
        </span>
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Cena de Navidad 2026"
          className="border-0 border-b-2 border-pine/30 bg-transparent px-0 py-3 text-xl text-ink outline-none transition placeholder:text-pine/35 focus:border-ink"
          maxLength={80}
          required
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-pine">
          Código
        </span>
        <input
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          placeholder="NAVIDAD26"
          className="border-0 border-b-2 border-pine/30 bg-transparent px-0 py-3 font-mono text-xl tracking-wide text-ink outline-none transition placeholder:text-pine/35 focus:border-ink"
          maxLength={20}
          minLength={4}
          pattern="[-A-Za-z0-9_]{4,20}"
          required
        />
        <span className="text-sm text-pine-deep/65">
          4–20 caracteres. Letras, números, _ o -. Los participantes lo usarán
          para entrar.
        </span>
      </label>

      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium text-pine">
          Participantes
        </span>
        {nombres.map((nombre, index) => (
          <div key={index} className="flex items-center gap-3">
            <input
              value={nombre}
              onChange={(e) => updateNombre(index, e.target.value)}
              placeholder={`Nombre ${index + 1}`}
              className="min-w-0 flex-1 border-0 border-b-2 border-pine/30 bg-transparent py-3 text-lg text-ink outline-none transition placeholder:text-pine/35 focus:border-ink"
              maxLength={60}
            />
            {nombres.length > 1 ? (
              <button
                type="button"
                onClick={() => removeNombre(index)}
                className="shrink-0 text-sm font-semibold text-coral-deep underline-offset-4 hover:underline"
                aria-label={`Quitar nombre ${index + 1}`}
              >
                Quitar
              </button>
            ) : null}
          </div>
        ))}
        <button
          type="button"
          onClick={addNombre}
          className="mt-1 inline-flex min-h-11 w-full items-center justify-center border-2 border-pine/30 px-5 py-2.5 text-sm font-semibold text-pine-deep transition hover:border-pine hover:bg-foam/40 sm:w-fit"
        >
          Añadir participante
        </button>
        <span className="text-sm text-pine-deep/65">
          Mínimo 3, sin duplicados. Nadie se toca a sí mismo.
        </span>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-pine">
          Mensaje (opcional)
        </span>
        <textarea
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          placeholder="Presupuesto orientativo 20€. ¡Que sea divertido!"
          rows={4}
          maxLength={500}
          className="resize-y border-2 border-pine/20 bg-foam/60 px-4 py-3 text-base leading-relaxed text-ink outline-none transition placeholder:text-pine/35 focus:border-ink"
        />
        <span className="text-sm text-pine-deep/65">
          Lo verán junto a su asignación cuando elijan quién son.
        </span>
      </label>

      {error ? (
        <p className="text-sm font-medium text-coral-deep" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-coral px-7 py-3.5 text-base font-semibold text-foam transition hover:bg-[#27695c] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:w-auto"
      >
        {loading ? "Sorteando…" : "Crear sorteo"}
      </button>
    </form>
  );
}
