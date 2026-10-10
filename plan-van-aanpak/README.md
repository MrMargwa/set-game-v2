# Plan van aanpak — SET Game v2 Pro Style

Dit documentenpakket beschrijft hoe SET Game v2 wordt ontworpen, gebouwd en uitgebreid: van geteste spelregels tot accounts, gamemodes en multiplayer — zonder de core telkens opnieuw te schrijven.

## Doel van dit pakket

| Doel | Beschrijving |
|------|--------------|
| **Eenduidigheid** | Iedereen werkt met dezelfde begrippen, lagen en prioriteiten. |
| **Uitbreidbaarheid** | Nieuwe gamemodes en online spelen sluiten aan op bestaande grenzen. |
| **Eerste mijlpaal** | Technische fundering + geteste SET-core + speelbare Classic UI (zonder accounts/multiplayer in v1). |
| **Traceerbaarheid** | Acceptatiecriteria per fase; architectuurkeuzes worden vastgelegd. |

## Leesvolgorde

1. [Management samenvatting](./00-management-samenvatting.md) — voor overzicht en stakeholders  
2. [Uitgangspunten en principes](./01-uitgangspunten-en-principes.md)  
3. [Architectuur](./02-architectuur.md)  
4. [Functionele specificatie (Classic)](./03-functionele-specificatie.md)  
5. [Domeinmodellen](./04-domeinmodellen.md)  
6. [Technische projectstructuur](./05-technische-structuur.md)  
7. [Implementatieplan (fasen 1–9)](./06-implementatieplan.md)  
8. [Data en database](./07-data-en-database.md)  
9. [Beveiliging en accounts](./08-beveiliging-en-accounts.md)  
10. [Gamemodes en multiplayer](./09-gamemodes-en-multiplayer.md)  
11. [Kwaliteit, CI en oplevering](./10-kwaliteit-en-delivery.md)  
12. [Risico’s, open punten en besluiten](./11-risicos-en-beslissingen.md)

## Sjablonen

- [Architecture Decision Record (ADR)](./templates/adr-sjabloon.md)
- [Fase-checklist](./templates/fase-checklist.md)

## Huidige projectstatus (baseline)

| Onderdeel | Status |
|-----------|--------|
| Repository | Aanwezig |
| Next.js 16 + React 19 + TypeScript + Tailwind 4 | Geïnitialiseerd (`app/` op root) |
| Doelstructuur `src/modules`, `src/core` | Nog niet aangelegd |
| Docker / MySQL | Nog niet |
| Game-core / tests | Nog niet |
| Dit plan van aanpak | **Actief document** |

Wijzigingen aan dit plan horen bij significante scope- of architectuurwijzigingen; gebruik het ADR-sjabloon voor keuzes die moeilijk terug te draaien zijn.

## Versie

| Versie | Datum | Auteur | Wijziging |
|--------|-------|--------|-----------|
| 1.0 | 2026-10-09 | Project | Eerste complete plan van aanpak |
