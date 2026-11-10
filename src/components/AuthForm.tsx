"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { safeNextPath } from "@/lib/safe-next";

type Mode = "login" | "registro";

type Props = {
  mode: Mode;
  next?: string;
};

export function AuthForm({ mode, next }: Props) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isRegistro = mode === "registro";
  const destination = safeNextPath(next);
  const nextQuery =
    destination !== "/panel"
      ? `?next=${encodeURIComponent(destination)}`
      : "";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (isRegistro && password !== passwordConfirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        isRegistro ? "/api/auth/register" : "/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isRegistro
              ? { username, password, passwordConfirm }
              : { username, password },
          ),
        },
      );

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "No se pudo completar la acción.");
        return;
      }

      router.push(destination);
      router.refresh();
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 flex w-full max-w-md flex-col gap-6">
      {destination !== "/panel" ? (
        <p className="soft-panel px-4 py-3 text-sm text-pine">
          Cuando entres, te llevamos de vuelta al sorteo.
        </p>
      ) : null}

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-pine">Usuario</span>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
          autoComplete="username"
          required
          minLength={3}
          maxLength={24}
          pattern="[a-z0-9_]{3,24}"
          className="field-line text-lg"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-pine">Contraseña</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={isRegistro ? "new-password" : "current-password"}
          required
          minLength={8}
          className="field-line text-lg"
        />
      </label>

      {isRegistro ? (
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-pine">
            Repite la contraseña
          </span>
          <input
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            autoComplete="new-password"
            required
            minLength={8}
            className="field-line text-lg"
          />
        </label>
      ) : null}

      {error ? (
        <p className="text-sm font-medium text-mark" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full sm:w-auto"
      >
        {loading ? "Espera…" : isRegistro ? "Crear cuenta" : "Entrar"}
      </button>

      <p className="text-sm text-pine">
        {isRegistro ? (
          <>
            ¿Ya tienes cuenta?{" "}
            <Link
              href={`/login${nextQuery}`}
              className="font-semibold text-coral underline-offset-4 hover:underline"
            >
              Inicia sesión
            </Link>
          </>
        ) : (
          <>
            ¿Nuevo aquí?{" "}
            <Link
              href={`/registro${nextQuery}`}
              className="font-semibold text-coral underline-offset-4 hover:underline"
            >
              Regístrate
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
