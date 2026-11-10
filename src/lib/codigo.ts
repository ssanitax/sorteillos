const CODIGO_REGEX = /^[A-Z0-9_-]{4,20}$/;

export function normalizarCodigo(raw: string): string {
  return raw.trim().toUpperCase();
}

export function validarCodigo(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const codigo = normalizarCodigo(raw);
  if (!CODIGO_REGEX.test(codigo)) return null;
  return codigo;
}
