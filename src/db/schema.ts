import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const sessions = sqliteTable("sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
});

export const sorteos = sqliteTable("sorteos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  codigo: text("codigo").notNull().unique(),
  titulo: text("titulo").notNull(),
  mensaje: text("mensaje"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const participantes = sqliteTable(
  "participantes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    sorteoId: integer("sorteo_id")
      .notNull()
      .references(() => sorteos.id),
    nombre: text("nombre").notNull(),
    asignadoA: text("asignado_a").notNull(),
    userId: integer("user_id").references(() => users.id),
  },
  (table) => [
    uniqueIndex("participantes_sorteo_user_unique").on(
      table.sorteoId,
      table.userId,
    ),
  ],
);

export type User = typeof users.$inferSelect;
export type PublicUser = Pick<User, "id" | "username">;
