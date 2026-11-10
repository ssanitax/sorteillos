"use client";

import { useState } from "react";

type Props = {
  path: string;
  fallback: string;
};

export function CopiarEnlace({ path, fallback }: Props) {
  const [copied, setCopied] = useState(false);
  const displayUrl = fallback.startsWith("http") ? fallback : path;

  async function copy() {
    const absolute =
      typeof window !== "undefined"
        ? `${window.location.origin}${path}`
        : fallback;

    try {
      await navigator.clipboard.writeText(absolute);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-8 flex w-full max-w-2xl flex-col gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-pine">Enlace para compartir</p>
        <p className="mt-2 break-all border-b-2 border-pine/25 pb-2 font-mono text-sm text-ink sm:text-base">
          {displayUrl}
        </p>
      </div>
      <button
        type="button"
        onClick={copy}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-coral px-6 py-3 text-sm font-semibold text-foam transition hover:bg-[#27695c] sm:w-auto"
      >
        {copied ? "Copiado" : "Copiar enlace"}
      </button>
    </div>
  );
}
