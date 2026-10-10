# Technische projectstructuur

Doelstructuur voor de repository. Mappen worden **aangemaakt wanneer de eerste file er nodig is**, behalve skelet in fase 2.

## Boom (doel)

```
set-game-v2/
├── src/
│   ├── app/
│   │   ├── (auth)/              # fase 6
│   │   ├── (game)/
│   │   │   ├── dashboard/
│   │   │   └── play/
│   │   ├── api/                 # dunne handlers
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── core/
│   │   ├── cards/
│   │   ├── set-rules/
│   │   ├── game-engine/
│   │   ├── game-modes/
│   │   └── scoring/
│   │
│   ├── modules/
│   │   ├── games/
│   │   ├── accounts/            # fase 6
│   │   ├── lobbies/             # fase 8
│   │   ├── multiplayer/
│   │   ├── statistics/
│   │   └── leaderboards/
│   │
│   ├── shared/
│   │   ├── errors/
│   │   ├── validation/
│   │   └── types/
│   │
│   └── infrastructure/
│       ├── database/
│       ├── logging/
│       └── configuration/
│
├── database/
│   ├── migrations/
│   └── seeds/
├── tests/
│   ├── integration/
│   └── e2e/
├── plan-van-aanpak/             # dit pakket
├── compose.yaml
├── Dockerfile
├── .env.example
├── package.json
└── README.md
```

## Path aliases (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/core/*": ["./src/core/*"],
      "@/modules/*": ["./src/modules/*"]
    }
  }
}
```

## Package scripts (doel)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "db:migrate": "node scripts/migrate.js",
    "db:seed": "node scripts/seed.js"
  }
}
```

Exacte migrate-tool volgt ADR (Drizzle Kit / custom SQL).

## ESLint grenzen

Voor `src/core/**`:

- `no-restricted-imports`: verbied `next`, `react`, `@/infrastructure`, `@/modules/*/presentation`.

Optioneel later: `eslint-plugin-boundaries`.

## Teststructuur

| Locatie | Inhoud |
|---------|--------|
| `src/core/**/*.test.ts` | Unit tests naast bron |
| `tests/integration/` | DB + repositories |
| `tests/e2e/` | Playwright: start spel, vind SET, score |

Fixtures: `src/core/set-rules/__fixtures__/boards.json`.

## Configuratie

- `.env.example`: `DATABASE_URL`, `SESSION_SECRET`, `NODE_ENV`  
- `src/infrastructure/configuration/env.ts`: Zod-validatie bij startup server-side  

## Docker (samenvatting)

- Service `app`: Next.js (dev mount / prod build)  
- Service `db`: MySQL 8.4, volume `mysql_data`  
- Netwerk: alleen `app` expose poort 3000; DB niet naar host in prod  

Details in [Implementatieplan fase 3](./06-implementatieplan.md).

## Conventies branches / PR

- `main` — stabiel  
- Feature: `feature/<fase>-<korte-naam>`  
- PR checklist: [Fase-checklist](./templates/fase-checklist.md)

## Documentatie in repo

Na fase 2: `README.md` vervangt create-next-app boilerplate met:

- Architectuurdiagram (link naar plan-van-aanpak)  
- Local dev met Docker  
- Test commands  
