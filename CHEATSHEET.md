# SET Game v2 — cheatsheet

Kopieer-blokken voor dagelijks werk (Windows / PowerShell). Projectmap: `set-game-v2`.

## Dagelijkse routine (meest gebruikt)

```powershell
cd D:\_Development\projects\set-game-v2
npm run docker:db
npm run db:migrate
npm run dev
```

App: **http://localhost:4000**

> Gebruik **niet** `docker compose up -d` als je ook `npm run dev` draait — dan vechten twee processen om poort **4000**. Alleen de DB-container, of alles via `docker:prod` (zie onder).

## Eerste keer / na clone

```powershell
cd D:\_Development\projects\set-game-v2
npm install
copy .env.example .env
# .env: SESSION_SECRET minstens 32 tekens
npm run docker:db
npm run db:migrate
npm run dev
```

## NPM-scripts (overzicht)

| Commando | Wat het doet |
|----------|----------------|
| `npm run dev` | Development op **localhost:4000** |
| `npm run build` | Production build |
| `npm run start` | Production (`PORT` uit env, bv. Railway) |
| `npm run start:local` | Production lokaal op **4000** (na `build`) |
| `npm run docker:db` | Alleen MySQL in Docker |
| `npm run docker:prod` | App + DB in Docker (stop `npm run dev` eerst) |
| `npm run db:migrate` | SQL migraties (leest `.env`) |
| `npm run test` | Unit/integration (Vitest) |
| `npm run test:watch` | Vitest watch |
| `npm run test:e2e` | Playwright (start dev server zelf) |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint |

Alles gezond checken:

```powershell
npm run typecheck; npm run test; npm run lint
```

## Poorten

| Wat | Poort |
|-----|-------|
| Webapp (dev/prod lokaal) | **4000** |
| MySQL (host → Docker) | **3307** |

## `.env` (onthouden)

```env
DATABASE_URL=mysql://setgame:setgame@127.0.0.1:3307/setgame
SESSION_SECRET=<minimaal-32-random-tekens>
```

## Docker handig

```powershell
# DB starten
npm run docker:db

# Status
docker compose ps

# DB stoppen
docker compose stop db

# DB + volumes weg (⚠️ data kwijt)
docker compose down -v
```

## DBeaver / MySQL client

| Veld | Waarde |
|------|--------|
| Host | `127.0.0.1` |
| Port | `3307` |
| Database | `setgame` |
| User / wachtwoord | `setgame` / `setgame` |
| Root (indien nodig) | `root` / `root` |

## URLs in de browser

| Wat | Pad |
|-----|-----|
| Home | `/` |
| Classic | `/play?mode=classic` |
| Time Attack | `/play?mode=time_attack` |
| Lobby (login) | `/lobby` |
| Dashboard | `/dashboard` |
| Leaderboard | `/leaderboards` |
| Login / register | `/login`, `/register` |
| Health API | `/api/health` |

Vaste seed (tests/debug): `/play?seed=e2e-happy`

## Multiplayer snel testen

1. Twee accounts (twee browsers of incognito).
2. A: `/lobby` → **Nieuwe lobby** → invitecode.
3. B: `/lobby` → code invoeren → **Join**.
4. A (host): **Start Classic race** (min. 2 spelers).

## Veelvoorkomende fouten

| Symptoom | Fix |
|----------|-----|
| Registreren/login **503** / netwerkfout DB | `npm run docker:db`, wacht op healthy, `npm run db:migrate` |
| `DATABASE_URL is not set` bij migrate | `.env` aanmaken/aanvullen, opnieuw migreren |
| Poort **4000** bezet | Stop andere `npm run dev` of Docker app (`docker compose --profile production down`) |
| `docker compose up -d` faalt op 4000 | Gebruik `npm run docker:db` + lokaal `npm run dev` |

## Railway (productie)

- **Lokaal:** blijf `npm run dev` → poort **4000** (`.env` met Docker MySQL).
- **Railway web service:** geen custom start met `$PORT` nodig — `npm start` leest `PORT` van Railway.
- **Variables:** `DATABASE_URL` (MySQL reference), `SESSION_SECRET`, `NODE_ENV=production`.
- **Migraties:** **Pre-deploy command** → `npm run db:migrate` (of één keer in Railway shell na deploy). Vereist recente Dockerfile met `database/` + `scripts/migrate.mjs` in de image.
- **Start:** leeg laten of `npm start` (geen `-p 4000`).

## Git (kort)

```powershell
git status
git diff
```

Commits alleen als je dat expliciet wilt — geen vaste flow hier.

---

Meer context: [README](./README.md) · [plan van aanpak](./plan-van-aanpak/README.md)
