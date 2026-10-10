# Kwaliteit, CI en oplevering

## Tooling stack (doel)

| Tool | Doel |
|------|------|
| ESLint | Lint + import boundaries |
| TypeScript `strict` | Type safety |
| Vitest | Unit + domain tests |
| Playwright | E2E browser |
| GitHub Actions / CI | PR gates |

## CI pipeline (minimum)

```yaml
# Conceptueel — .github/workflows/ci.yml in fase 2
jobs:
  check:
    steps:
      - npm ci
      - npm run lint
      - npm run typecheck
      - npm run test
      - npm run build
  e2e: # vanaf M1 einde
    steps:
      - npm run test:e2e
```

E2E mag nightly als runtime te zwaar voor elke PR; **M1:** minstens lokaal verplicht vóór merge.

## Testpiramide

```
        / E2E \           weinig, kritieke flows
       / integration \    DB, auth
      /   unit/core    \   SET, engine, scoring
```

### Verplichte core tests

- `isValidSet`: alle attribute permutaties (table-driven).  
- `findSets`: known boards met 0, 1, N sets.  
- `applyAction`: alle AC-* + deck empty edges.  
- RNG: zelfde seed → zelfde shuffle (regression).

### Wat we niet overtesten

- Snapshot van hele SVG component zonder gedrag.  
- Elke Tailwind class.

## M1 gate (Definition of Done)

- [ ] Fase 1–5 exit criteria uit [Implementatieplan](./06-implementatieplan.md)  
- [ ] `lint`, `typecheck`, `test` groen  
- [ ] Core geen framework imports  
- [ ] E2E: start → valid SET → score stijgt  
- [ ] README: dev start + scripts  
- [ ] Geen `.env` committed  

## Productie gate (fase 9)

- [ ] HTTPS termination documented  
- [ ] Secure cookies verified in staging  
- [ ] DB migrations automated on deploy  
- [ ] Health: `GET /api/health` → DB ping  
- [ ] Logging zonder PII/passwords  
- [ ] Restore test van backup uitgevoerd  
- [ ] Rate limits op auth endpoints  

## Observability

- Structured JSON logs (pino of winston).  
- Fields: `requestId`, `userId`, `gameId`, `durationMs`.  
- Errors: stack in server logs, generic message naar client.

## Performance richtlijnen

- `findSets` op 15 kaarten: O(n³) acceptabel (455 combinaties).  
- API p95 < 200ms voor game action op LAN.  
- WebSocket broadcast < 100ms na commit (M4).

## Release strategie

- `main` always deployable na M1.  
- Feature flags optioneel voor Time Attack / MP.  
- Semantic versioning app (`0.x` tot M4).

## Documentatie onderhoud

- Plan van aanpak bij scope change.  
- ADR per grote keuze.  
- Changelog in releases (optioneel).
