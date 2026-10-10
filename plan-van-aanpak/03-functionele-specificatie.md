# Functionele specificatie — Classic SET (v1)

Deze specificatie is de bron voor core-implementatie, tests en acceptatie van **Mijlpaal M1**. Afwijkingen vereisen ADR + update van dit document.

## 1. Begrippen

| Begrip | Definitie |
|--------|-----------|
| **Kaart** | Uniek object met vier attributen (zie §2). |
| **Deck** | 81 unieke kaarten; start shuffle. |
| **Bord (board)** | Kaarten die zichtbaar en speelbaar zijn. |
| **SET** | Drie verschillende kaarten waarvoor per attribuut geldt: alle drie gelijk **of** alle drie verschillend. |
| **Zet (move)** | Speler selecteert drie kaarten op het bord; indien geldige SET → score + vervanging. |
| **Deal extra** | Drie kaarten van deck naar bord (zonder score). |

## 2. Kaartmodel

Vier attributen, elk **exact 3 waarden**:

| Attribuut | Waarden |
|-----------|---------|
| **Aantal (number)** | 1, 2, 3 |
| **Vorm (shape)** | diamond, squiggle, oval |
| **Shading** | solid, striped, open |
| **Kleur (color)** | red, green, purple |

**Deck:** cartesisch product → **81** kaarten. Elke kaart heeft een stabiele `cardId` (0–80 of UUID afgeleid van attributen — technisch in domeinmodel).

## 3. SET-regel (formeel)

Voor kaarten A, B, C en elk attribuut `attr`:

Laat `V(A, attr)` de waarde zijn. Dan is `{A,B,C}` een SET iff voor **alle** vier attributen:

- `V(A) = V(B) = V(C)`, **of**
- `V(A), V(B), V(C)` zijn pairwise verschillend.

Precies drie kaarten; dubbele kaart op bord kan niet voorkomen.

## 4. Classic spelverloop (solo)

### 4.1 Start

1. Maak vol deck, shuffle (seedbaar voor tests).  
2. Leg **12** kaarten open op het bord.  
3. Score = 0.  
4. Status = `playing`.

### 4.2 Speleracties

| Actie | Voorwaarde | Effect |
|-------|------------|--------|
| **Selecteer 3 kaarten** | Status `playing`; kaarten op bord; nog geen pending validatie | UI markeert selectie (presentatie); bij 3e kaart → **SubmitSet** |
| **SubmitSet** | 3 geselecteerde ids | Zie §4.3 |
| **DealExtra** (optioneel knop “+3 kaarten”) | Geen SET op bord (zie §4.4) | 3 kaarten van deck naar bord; geen score |

**M1 UX:** automatisch SubmitSet zodra 3 kaarten geselecteerd (geen aparte “bevestig” verplicht, tenzij usability-test anders aangeeft).

### 4.3 Geldige SET

1. Verhoog score met **+1** (Classic; uitbreidbaar via scoring module).  
2. Verwijder de drie kaarten van het bord.  
3. Trek **3** nieuwe kaarten van deck naar bord (indien deck niet leeg).  
4. Clear selectie.  
5. Als deck leeg en geen kaarten meer te trekken → evalueer einde (§4.5).

### 4.4 Ongeldige selectie (geen SET)

1. Geen scorewijziging.  
2. Feedback “Geen geldige SET” (presentatie).  
3. Clear selectie.  
4. **Geen** straf in Classic M1 (optioneel later: time penalty in Time Attack).

### 4.5 Geen SET op bord

**Detectie:** `findSets(board).length === 0`.

Gedrag Classic (standaard SET-spel):

- Als deck **≥ 3** kaarten heeft: speler mag **DealExtra** (automatisch of via knop — **besluit M1:** knop “Extra 3 kaarten” zichtbaar wanneer geen SET én deck ≥ 3).  
- Herhaal tot SET bestaat of deck `< 3`.  
- Als geen SET en geen deal meer mogelijk: status → `ended`, reden `no_set_remaining`.

### 4.6 Spel einde

| Conditie | Status | Reden |
|----------|--------|-------|
| Deck leeg, bord leeg (alle SETs gespeeld) | `ended` | `deck_empty` |
| Geen SET en niet genoeg deck voor deal | `ended` | `no_set_remaining` |
| Speler stopt (M1 optioneel) | `ended` | `player_quit` |

**M1:** toon eindscherm met totaalscore en “Opnieuw spelen”.

## 5. Scoring Classic

| Gebeurtenis | Punten |
|-------------|--------|
| Geldige SET | +1 |

Geen bonus voor snelheid in Classic. Time Attack krijgt eigen tabel (later).

## 6. Niet-functionele eisen (M1)

- Zetvalidatie < 5 ms op gemiddelde laptop (81 kaarten, 12 op bord) — richtlijn.  
- Deterministische tests met vaste RNG seed.  
- Toegankelijkheid: kaarten selecteerbaar via toetsenbord (minimaal focus + Enter/Space) — **stretch M1**.

## 7. Acceptatiecriteria (Given/When/Then)

### AC-SET-01 — Geldige SET

- **Given** bord met bekende SET uit testfixture  
- **When** speler submit die drie kaarten  
- **Then** score +1, drie kaarten verdwijnen, drie nieuwe verschijnen indien deck rest heeft  

### AC-SET-02 — Ongeldige triple

- **Given** drie kaarten die geen SET vormen  
- **When** submit  
- **Then** score ongewijzigd, selectie cleared  

### AC-SET-03 — findSets

- **Given** fixture bord zonder SET  
- **When** engine `findSets`  
- **Then** lege lijst  

### AC-SET-04 — Deal extra

- **Given** geen SET op bord, deck ≥ 3  
- **When** DealExtra  
- **Then** bord +3 kaarten, score ongewijzigd  

### AC-SET-05 — Einde

- **Given** deck leeg, geen geldige zetten meer mogelijk  
- **When** situatie geëvalueerd  
- **Then** status `ended`  

## 8. Uitbreidingspunten (expliciet niet in M1)

- Multiplayer beurten  
- Timer  
- Strafpunten  
- Hint (“is er een SET?”)  
- Daily challenge seed  

## 9. Open productbesluiten

| # | Vraag | Voorstel M1 | Status |
|---|-------|-------------|--------|
| OB-01 | Auto-deal extra wanneer geen SET? | Handmatige knop | **Te bevestigen** |
| OB-02 | cardId encoding | Deterministisch uit attributen | Voorstel akkoord |
| OB-03 | Animaties bij succes | Ja, lichte CSS | Presentatie |

Update [Risico’s](./11-risicos-en-beslissingen.md) bij afsluiten open punten.
