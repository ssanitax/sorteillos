import { NextResponse } from "next/server";
import { db } from "@/db";
import { participantes, sorteos } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { validarCodigo } from "@/lib/codigo";
import { derange } from "@/lib/derangement";

type CreateBody = {
  titulo?: unknown;
  codigo?: unknown;
  nombres?: unknown;
  mensaje?: unknown;
};

function normalizeNombres(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null;

  const nombres = raw
    .map((n) => (typeof n === "string" ? n.trim() : ""))
    .filter(Boolean);

  if (nombres.length < 3) return null;

  const seen = new Set<string>();
  for (const nombre of nombres) {
    const key = nombre.toLocaleLowerCase("es");
    if (seen.has(key)) return null;
    seen.add(key);
  }

  return nombres;
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
  }

  let body: CreateBody;
  try {
    body = (await request.json()) as CreateBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const titulo =
    typeof body.titulo === "string" ? body.titulo.trim() : "";
  const codigo = validarCodigo(body.codigo);
  const nombres = normalizeNombres(body.nombres);
  const mensaje =
    typeof body.mensaje === "string" ? body.mensaje.trim().slice(0, 500) : "";

  if (!titulo) {
    return NextResponse.json(
      { error: "El título del sorteo es obligatorio" },
      { status: 400 },
    );
  }

  if (!codigo) {
    return NextResponse.json(
      {
        error:
          "El código debe tener 4–20 caracteres (A–Z, 0–9, _ o -)",
      },
      { status: 400 },
    );
  }

  if (!nombres) {
    return NextResponse.json(
      {
        error:
          "Añade al menos 3 nombres distintos (sin duplicados ni vacíos)",
      },
      { status: 400 },
    );
  }

  let asignados: string[];
  try {
    asignados = derange(nombres);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al sortear";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  try {
    const [sorteo] = await db
      .insert(sorteos)
      .values({
        titulo,
        codigo,
        userId: user.id,
        mensaje: mensaje || null,
      })
      .returning();

    await db.insert(participantes).values(
      nombres.map((nombre, index) => ({
        sorteoId: sorteo.id,
        nombre,
        asignadoA: asignados[index],
      })),
    );

    return NextResponse.json({
      codigo: sorteo.codigo,
      url: `/s/${sorteo.codigo}`,
    });
  } catch {
    return NextResponse.json(
      { error: "Ese código ya está en uso. Elige otro." },
      { status: 409 },
    );
  }
}
