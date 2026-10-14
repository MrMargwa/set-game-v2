# Spelregels

## Classic

- Deck is **81** kaarten: **12** open, **69** in de stapel.
- Elke geldige SET levert **741** punten (`CLASSIC_POINTS_PER_SET`).
- De klok loopt pas nadat je op **Start** drukt. De tijd verandert de score niet.
- **Stoppen** eindigt de ronde en slaat de score op als je ingelogd bent.
- Een hint (**SET tonen**) kost **250** punten (`CLASSIC_HINT_COST`).
- **+3 kaarten** kost **125** punten (`CLASSIC_DEAL_EXTRA_COST`), ook als er nog een SET op het bord ligt. Maximaal **5** keer per ronde.
- Beide knoppen werken meteen. De score mag onder 0.

## Multiplayer

Streaks horen bij multiplayer. Een streak is het aantal geldige SETs **achter elkaar** van dezelfde speler. Een foute SET zet alleen die streak terug naar 0.

| Streak na deze SET | Punten deze SET |
|--------------------|-----------------|
| 1 | 1224 |
| 2 | 2356 |
| 3 | 5167 |
| 4 | 6543 |
| 5 | 9512 |
| 6+ | 13789 |

Tabel: `CLASSIC_COMBO_POINTS` in `src/core/scoring/classic-scoring.ts`.

## Leaderboard

Per spelmodus. De top 3 staat op het podium. Daaronder volgen de rangen 4 tot en met 25.
