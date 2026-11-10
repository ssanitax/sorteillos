# Sorteillos — Amigo invisible

App para organizar amigos invisibles con cuenta. Puedes **crear** un sorteo o **unirte** con un código; tu nombre y asignación quedan guardados en tu perfil.

## Stack

- Next.js (App Router) + TypeScript
- Drizzle ORM + Turso (SQLite serverless)
- Auth propia: sesiones en cookie httpOnly + contraseñas con **Argon2id**
- Deploy recomendado: Vercel conectado al repo de GitHub

## Desarrollo local

```bash
cp .env.example .env.local
npm install
npm run db:push
npm run dev
```

En local, la SQLite debe estar **fuera del repo** (p. ej. `%LOCALAPPDATA%\sorteillos\local.db`).
Si el `.db` / `.db-wal` vive en la carpeta del proyecto, Next/Turbopack recarga la página en bucle.

Abre [http://localhost:3000](http://localhost:3000).

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `TURSO_DATABASE_URL` | `file:…` en local (fuera del repo), o `libsql://…` de Turso en producción |
| `TURSO_AUTH_TOKEN` | Token de Turso (solo remoto) |
| `NEXT_PUBLIC_APP_URL` | URL pública opcional |

## Checklist de deploy (en orden)

### 1. Base de datos (Turso)
- [x] Cuenta en [turso.tech](https://turso.tech)
- [x] Crear una database
- [ ] Copiar `TURSO_DATABASE_URL` (`libsql://…`) y `TURSO_AUTH_TOKEN`
- [ ] En tu PC, con esas vars, ejecutar:
  ```bash
  npm run db:push
  ```

### 2. Código en GitHub
- [ ] Repo en GitHub (sin `.env.local`, sin `*.db`)
- [ ] `git push` del proyecto

### 3. Vercel
- [ ] Importar el repo en [vercel.com](https://vercel.com)
- [ ] Añadir variables (Production):
  - [ ] `TURSO_DATABASE_URL`
  - [ ] `TURSO_AUTH_TOKEN`
  - [ ] `NEXT_PUBLIC_APP_URL` = `https://TU-PROYECTO.vercel.app`
- [ ] Deploy

### 4. Tras el primer deploy
- [ ] Ajustar `NEXT_PUBLIC_APP_URL` si hace falta y redeploy
- [ ] Probar: registro → crear sorteo → unirse con otra cuenta

### Notas
- En Vercel **no** uses `file:local.db`; tiene que ser Turso.
- No subas `.env.local` ni archivos `.db` al repo.

## Flujo de uso

1. **Registro** con usuario + contraseña (confirmada dos veces).
2. **Crear** un sorteo: título + código propio + nombres (mín. 3). Nadie se autoasigna.
3. Comparte el código; cada persona se registra y va a **Unirme**.
4. Al unirse elige quién es (un nombre solo lo puede reclamar una cuenta); la asignación queda en su panel.
