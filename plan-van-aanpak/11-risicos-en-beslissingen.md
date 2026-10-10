# Risico’s, open punten en beslissingen

## Risicoregister

| ID | Risico | Kans | Impact | Mitigatie |
|----|--------|------|--------|-----------|
| R1 | Scope creep vóór M1 (auth/MP) | Hoog | Hoog | M1-scope in README + PR review |
| R2 | Core lekt naar React | Medium | Hoog | ESLint restricted imports |
| R3 | ORM-keuze vertraagt fase 3 | Medium | Medium | ADR week 1; default Drizzle+SQL |
| R4 | Multiplayer sync bugs | Hoog | Hoog | Server authoritative + version column |
| R5 | Next.js 16 breaking vs docs | Medium | Medium | AGENTS.md + officiële docs in node_modules |
| R6 | Testloze UI regressies | Medium | Medium | Playwright happy path |
| R7 | Zwakke auth implementatie | Medium | Hoog | Checklist [08-beveiliging](./08-beveiliging-en-accounts.md) |

## Open productbesluiten

| ID | Onderwerp | Voorstel | Besluit door | Deadline |
|----|-----------|----------|--------------|----------|
| OB-01 | Auto vs handmatig deal extra | Handmatig knop | Product | Vóór fase 4 |
| OB-02 | cardId encoding | Deterministisch uit attrs | Dev | Vóór fase 4 |
| OB-03 | MP beurt model | Realtime race | Product | Vóór fase 8 |
| OB-04 | ORM | Drizzle | Team | Vóór fase 3 |
| OB-05 | Session TTL | 7d sliding | Security | Vóór fase 6 |

Vul **Besluit** kolom in bij akkoord; archiveer in ADR indien impact langdurig.

## Architecture Decision Records (index)

| ADR | Titel | Status |
|-----|-------|--------|
| ADR-001 | Mapstructuur src/ + module boundaries | Voorgesteld |
| ADR-002 | Database access layer | Open |
| ADR-003 | Session storage model | Open |
| ADR-004 | Realtime transport (WS vs SSE) | Open — fase 8 |
| ADR-005 | Multiplayer turn model | Open |

Gebruik [ADR-sjabloon](./templates/adr-sjabloon.md).

## Afhankelijkheden extern

- Docker Desktop / Linux docker voor dev.  
- MySQL 8.4 image compatibility.  
- Node LTS versie (20+) — align met `@types/node`.

## Communicatie

- Architectuurwijziging → update plan + ADR.  
- Spec wijziging → update [03-functionele-specificatie](./03-functionele-specificatie.md) + tests.

## Go / No-Go M1 review

Review meeting checklist:

1. Demo Classic solo end-to-end  
2. Testrapport core coverage  
3. Open OB-* afgesloten of expliciet uitgesteld  
4. Bekende bugs gelogd met prioriteit  

Go → start fase 6 planning; No-Go → fix lijst + datum herreview.
