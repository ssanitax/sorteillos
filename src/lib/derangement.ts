function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Empareja cada persona con otra distinta (derangement). */
export function derange<T>(items: readonly T[]): T[] {
  if (items.length < 2) {
    throw new Error("Se necesitan al menos 2 participantes");
  }

  const maxAttempts = 2000;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const shuffled = shuffle([...items]);
    if (shuffled.every((item, index) => item !== items[index])) {
      return shuffled;
    }
  }

  throw new Error("No se pudo generar un sorteo válido. Inténtalo de nuevo.");
}
