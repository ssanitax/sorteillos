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
      <div className="soft-panel px-4 py-4 sm:px-5">
        <p className="text-sm font-medium text-pine">Enlace para compartir</p>
        <p className="mt-2 break-all font-mono text-sm text-ink sm:text-base">
          {displayUrl}
        </p>
      </div>
      <button type="button" onClick={copy} className="btn-primary w-full sm:w-auto">
        {copied ? "Copiado" : "Copiar enlace"}
      </button>
    </div>
  );
}
