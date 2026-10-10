# Uitgangspunten en principes

## Productvisie

SET Game v2 is geen eenmalige demo, maar een **game-engine met presentatie en infrastructuur eromheen**. Spelers krijgen een verzorgde Classic-ervaring; ontwikkelaars krijgen voorspelbare plekken voor nieuwe features.

## Hoofdprincipe

> **De spelregels kennen niets van interface, database of multiplayer.**  
> De game-engine voert regels uit; andere lagen roepen de engine aan.

Gevolgen:

- Core code draait in Node en in tests identiek.  
- Server-side validatie voor multiplayer gebruikt **dezelfde** `applyGameAction` (of equivalent) als de solo-client.  
- UI toont state en stuurt intenties; UI **beslist niet** of een SET geldig is.

## Architectuurprincipes

| Principe | Toepassing |
|----------|------------|
| **Separation of concerns** | Vier lagen: presentatie, applicatie, domein, infrastructuur. |
| **Feature modules** | `accounts`, `games`, `lobbies`, … elk met domain/application/infrastructure/presentation waar nodig. |
| **Eén verantwoordelijkheid** | Kleine functies; modules met duidelijke publieke API. |
| **DRY voor regels** | SET-validatie, scoring en deck-logica **alleen** in `core/`. |
| **Strikte types** | Domeintypes (`Card`, `GameState`, `GameAction`) geen `string` soup. |
| **Geen verborgen side effects** | Core mutaties via expliciete state-transities (immutable of gecontroleerd copy). |
| **Geen premature abstractie** | Geen generieke `Manager`/`Utils`; abstractie bij tweede echt hergebruik. |
| **Pragmatisch DDD** | Aggregates waar het helpt (Game, User, Lobby); geen enterprise-boilerplate. |

## Code-afspraken

### Naamgeving

- Functies: werkwoord + domein — `isValidSet`, `findSetsOnBoard`, `applyAction`.  
- Types: zelfstandig naamwoord — `Card`, `Board`, `ClassicGameState`.  
- Geen: `check`, `process`, `handleData`, `utils.ts` zonder domein.

### Fouten

- **Verwachte fouten** (ongeldige zet, spel afgelopen): getypeerde domain errors (`InvalidActionError`) met code + message.  
- **Onverwachte fouten**: loggen in infrastructuur/presentatie; niet stil slikken in core.

### Dependencies (richting)

```
presentation → application → domain
infrastructure → application (implementeert poorten)
domain → (niets uit app/infra/framework)
```

### TypeScript

- `strict: true`  
- Geen `any` in domein; `@typescript-eslint/no-explicit-any` waar mogelijk.  
- Publieke API’s van core via barrel `index.ts` per submodule.

## Kwaliteit vanaf dag één

| Commando | Doel |
|----------|------|
| `npm run lint` | ESLint + projectregels |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest (of Jest) — unit + domain |
| `npm run test:e2e` | Playwright — kritieke flows (vanaf M1 einde / M2) |

Elke **domeinregel** met niet-triviale logica krijgt tests. Geen quota-jagen op coverage in UI-only code.

## Wat we niet doen (M1)

- Externe identity providers als verplichting.  
- WebSockets vóór multiplayer-fase.  
- Microservices of monorepo met meerdere deployables.  
- Alle mappen uit de doelstructuur leeg aanmaken “voor later”.

## Documentatie

- Dit plan + ADR’s voor keuzes met lange levensduur (ORM, sessiestore, realtime stack).  
- README in repo: lokaal starten (Docker), scripts, mapoverzicht.

## Definitie of Done (algemeen)

- [ ] Code voldoet aan lint + typecheck  
- [ ] Tests toegevoegd/bijgewerkt voor gewijzigde domeinlogica  
- [ ] Geen secrets of `.env` in commit  
- [ ] Migraties bij schema-wijziging  
- [ ] ADR bij architectuurwijziging (indien van toepassing)
