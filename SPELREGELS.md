# Spelregels — Classic

Korte referentie. Time Attack en multiplayer gebruiken deze combo-score **niet** (daar blijft +1 per SET).

## Bord

- Deck blijft **81** kaarten.
- Startbord is **18 kaarten**: drie rijen van zes.
- Doel: het deck leegspelen. De klok loopt pas nadat je op **Start** drukt.
- **Stoppen** eindigt de ronde (`player_quit`) en slaat de score op als je ingelogd bent.

## Score

Elke geldige SET levert een vast, ongelijk bedrag op. Hoe langer de streak, hoe hoger dat bedrag. Geen ronde ×1000-stappen.

Een streak is het aantal geldige SETs **achter elkaar**. Een foute SET zet de streak terug naar 0. **+3 kaarten** breekt de streak niet.

| Streak na deze SET | Punten deze SET |
|--------------------|-----------------|
| 1 | 1224 |
| 2 | 2356 |
| 3 | 5167 |
| 4 | 6543 |
| 5 | 9512 |
| 6+ | 13789 |

Voorbeeld: twee goede SETs achter elkaar = 1224 + 2356 = **3580**. Daarna een fout, en de volgende SET is weer 1224.

Tabel in code: `CLASSIC_COMBO_POINTS` in `src/core/scoring/classic-scoring.ts`.

## +3 kaarten

- **Vind een SET:** wijst één geldige SET aan, zonder punten. Maximaal **5 keer per ronde** (`CLASSIC_MAX_HINT_USES`).
- **+3 kaarten:** maximaal **5 keer per ronde**.
- Werkt ook als er nog een SET op het bord ligt.
- Werkt niet meer als het deck minder dan 3 kaarten heeft, of als de 5 op zijn.

Constante: `CLASSIC_MAX_DEAL_EXTRA_USES` in `src/core/game-engine/types.ts`.

## Leaderboard

Opgeslagen veld is de **eindscore** (inclusief als je stopt). Tijd en hoogste streak zie je op het eindscherm; die staan niet als aparte kolommen op het leaderboard.
