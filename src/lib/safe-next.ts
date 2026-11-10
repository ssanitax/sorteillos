/** Solo rutas internas relativas, p. ej. /s/CODIGO o /unirse?codigo=X */
export function safeNextPath(raw: unknown, fallback = "/panel"): string {
  if (typeof raw !== "string") return fallback;
  const value = raw.trim();
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  if (value.includes("://")) return fallback;
  return value;
}
