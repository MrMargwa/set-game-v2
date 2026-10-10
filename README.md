# SET Game v2 Pro Style

Classic SET gebouwd op een **UI-vrije game-core**: spelregels, deck en scoring leven in `src/core`, de Next.js UI roept alleen use cases aan.

## Mijlpaal 5 (huidige scope)

- **Leaderboard** (`/leaderboards`): beste score per speler of top runs, per mode
- **Statistieken** op dashboard: spellen, beste/gemiddelde score, SETs per mode
- API: `GET /api/leaderboards`, `GET /api/statistics/me` (login)
- Migratie `003_leaderboard_indexes.sql` voor snellere rankings

Eerdere mijlpalen (solo modes, accounts, lobby/multiplayer) blijven actief.

## Gamemodes

| Mode | URL |
|------|-----|
| Classic | `/play?mode=classic` |
| Time Attack | `/play?mode=time_attack` |
| Online lobby | `/lobby` (login vereist) |
| Leaderboard | `/leaderboards` |

## Poorten & Docker

| Modus | Commando | URL |
|--------|----------|-----|
| Lokaal dev | `docker compose up db -d` → `npm run dev` | http://localhost:4000 |
| Alles in Docker | `npm run docker:prod` | http://localhost:4000 (stop `npm run dev` — anders poortconflict) |

Architectuur en roadmap: [plan-van-aanpak](./plan-van-aanpak/README.md).  
**Snelle commando’s:** [CHEATSHEET.md](./CHEATSHEET.md).

## Lokaal starten

```bash
npm install
npm run dev
```

Open [http://localhost:4000](http://localhost:4000) — **Speel Classic SET** gaat naar `/play`.

Optioneel vaste seed (handig voor tests):

`/play?seed=e2e-happy`

## Scripts

| Script | Beschrijving |
|--------|----------------|
| `npm run dev` | Next.js development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm run test` | Vitest (core / domain) |
| `npm run test:e2e` | Playwright |
| `npm run db:migrate` | SQL migraties (vereist `DATABASE_URL`) |

## Database (Docker)

```bash
npm run docker:db
# of: docker compose up db -d   (start NIET `docker compose up -d` als je ook npm run dev gebruikt)
```

Wacht tot MySQL healthy is, dan:

Stel in `.env` (kopieer van `.env.example`):

```env
DATABASE_URL=mysql://setgame:setgame@127.0.0.1:3307/setgame
SESSION_SECRET=change-me-to-a-long-random-string-at-least-32-chars
```

Migraties:

```bash
npm run db:migrate
```

Health check (database optioneel zonder `DATABASE_URL`):

`GET /api/health`

## Projectstructuur (kern)

```
src/
  core/           # SET-regels, deck, game-engine
  modules/accounts/  # auth, sessies
  modules/games/     # use cases + React UI
  app/            # Next.js routes
  infrastructure/ # database, config
```

## Tests

```bash
npm run test
npm run test:e2e
```

E2E start automatisch `next dev` via Playwright `webServer`.
