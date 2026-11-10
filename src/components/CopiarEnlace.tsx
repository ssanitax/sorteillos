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
    <div className="mt-8 flex max-w-2xl flex-col gap-4 sm:flex-row sm:items-end">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-pine">
          Enlace para compartir
        </p>
        <p className="mt-2 truncate border-b-2 border-pine/25 pb-2 font-mono text-base text-ink sm:text-lg">
          {displayUrl}
        </p>
      </div>
      <button
        type="button"
        onClick={copy}
        className="inline-flex shrink-0 items-center justify-center rounded-md bg-coral px-6 py-3 text-sm font-semibold text-foam transition hover:bg-[#27695c]"
      >
        {copied ? "Copiado" : "Copiar enlace"}
      </button>
    </div>
  );
}
