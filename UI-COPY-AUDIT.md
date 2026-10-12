# UI-copy- en contentkwaliteitsaudit — SET Game v2

**Fase:** 1 — alleen audit. Geen applicatiecode gewijzigd.  
**Datum:** 2026-10-12  
**Bron van waarheid voor gedrag:** de geïmplementeerde code, niet de marketingtekst.  
**Bestaand ontwerpdocument:** `UI-UX-DESIGN.md` (productnaam, UI-taal Nederlands, geen i18n in v1, footer “Made by DevJustin”).

Dit document is het Fase 1-rapport. Implementatie wacht op expliciete goedkeuring.

---

## 1. Samenvatting

De interface is overwegend Nederlands, met Engels voor productnamen (`SET`, `Classic`, `Time Attack`, `Leaderboard`, `Dashboard`) en een aantal losse Engelse zinnen die wél aan spelers worden getoond. Er is geen vertaalframework. Tekst staat hardcoded in pagina’s, componenten, Zod-schema’s en servicefouten.

De grootste inhoudsproblemen:

1. **Misleidende speluitleg.** Classic wordt op de speeltafel beschreven als “zo snel mogelijk”, terwijl de ranglijst op score sorteert. De homepage zegt tegelijk “Geen timer”, terwijl Classic een lopende tijd toont.
2. **Foute feedback bij een ongeldige SET in Classic.** De speler ziet “Combo verbroken.”, ook zonder combo. De e2e-test verwacht “Geen geldige SET”.
3. **Operationele en Engelse fouten naar spelers.** Database- en Docker-instructies, “Unauthorized”, “Game has ended” en Zod-standaardteksten kunnen in de UI belanden.
4. **Ontbrekende status.** Een mislukte score-opslag of mislukte statistiekenlijst wordt niet uitgelegd. Een gast weet na afloop niet dat het resultaat niet op het leaderboard komt.
5. **Ontoegankelijke kaarten en status.** Kaartknoppen hebben geen toegankelijke naam. De rustinstructie op het bord is `aria-hidden`. In multiplayer krijgen fouten dezelfde successtijl als een geldige SET.

Goede copy die behouden moet blijven: neutrale loginfout “Ongeldige gebruikersnaam of wachtwoord”, lobbyteksten als “Lobby is vol.” en “Minimaal twee spelers nodig om te starten.”, en de dynamische score “SET gevonden! +{punten}”.

---

## 2. Scope en geïnspecteerde gebieden

Geïnspecteerd (gelezen, niet uitgevoerd in de browser):

| Gebied | Bestanden |
| --- | --- |
| Routes | `src/app/page.tsx`, `layout.tsx`, `(auth)/login`, `(auth)/register`, `(game)/play`, `dashboard`, `leaderboards`, `lobby`, `lobby/[id]`, `multiplayer/[gameId]` |
| Gedeelde UI | `site-header.tsx`, `site-footer.tsx`, `theme-toggle.tsx`, `home-mode-card.tsx`, `home-hero-showcase.tsx` |
| Spel | `game-board.tsx`, `use-board-game.ts`, `set-card.tsx`, `card-symbol-stack.tsx`, `classic/mode.ts`, `time-attack/mode.ts` |
| Accounts | `auth-form.tsx`, `logout-button.tsx`, `auth-schemas.ts`, `auth-service.ts`, auth API-routes |
| Lobby en multiplayer | `lobby-hub.tsx`, `lobby-room.tsx`, `multiplayer-game-board.tsx`, `lobby-service.ts`, `multiplayer-game-service.ts`, `apply-multiplayer-action.ts`, `multiplayer-schemas.ts` |
| Scores | `leaderboard-panel.tsx`, `user-stats-cards.tsx`, `get-leaderboard.ts`, `get-user-statistics.ts`, `games/record/route.ts`, `persist-game-result.ts` |
| Regels ter controle van de tekst | `classic-scoring.ts`, `apply-action.ts`, `time-attack/types.ts`, `time-attack/apply-action.ts`, leaderboard-SQL |
| Tests die copy vastzetten | `tests/e2e/classic.spec.ts`, `tests/e2e/time-attack.spec.ts` |
| Terminologie | `README.md`, `UI-UX-DESIGN.md` |

Niet aanwezig: `not-found.tsx`, `error.tsx`, `loading.tsx`, vertaalbestanden, Open Graph, webmanifest, juridische pagina’s, wachtwoordherstel, profielbewerking.

Niet runtime gecontroleerd: visuele overflow, schermlezer, echte netwerkfouten, Zod 4-standaardzin letterlijk in de browser.

---

## 3. Taal en contentarchitectuur

| Onderwerp | Bevinding |
| --- | --- |
| Talen | Eén UI-taal: Nederlands (`<html lang="nl">`). Geen tweede locale. |
| Vertalingen | Geen. Niet “gedeeltelijk vertaald”; er is geen catalogus. |
| Architectuur | Hardcoded strings in JSX, mode-metadata in de game-core, foutteksten in application-services, validatie in Zod. |
| Conventie uit ontwerp | `UI-UX-DESIGN.md`: Nederlands, geen i18n in v1, productnaam “SET Game v2”. |
| Datumnotatie | `toLocaleString("nl-NL")` op leaderboard en dashboard. Consistent. |
| Meervoud | Handmatig (`SET` / `SETs`, `fout` / `fouten`, `spel` / `spellen`). Geen ICU. |

Aanbeveling: geen i18n-framework toevoegen in deze opdracht. Houd productnamen in het Engels waar het ontwerp dat al doet, en maak de rest consequent Nederlands.

---

## 4. Contentinventaris per gebied

### Navigatie en homepage

- Merk: “SET Game v2”. Tagline: “SET Game v2 — renewed”.
- Hero: “Patronen zien. / SETs pakken.” plus intro over combo’s, Time Attack en lobby’s.
- Acties: “Nu spelen”, “Leaderboard”, “Dashboard”, “Direct naar tafel”.
- Moduskaarten: Classic SET, Time Attack, Online lobby.
- Header: Spelen, Leaderboard, Lobby (alleen ingelogd), Dashboard, gebruikersnaam, Uitloggen, Inloggen, Registreren, thema Licht / Donker / Systeem.
- Footer: “Made by DevJustin”.
- Metadata (alle routes): titel “SET Game v2”, beschrijving “Classic SET met onderhoudbare game-engine”.

### Accounts

- Login en registratie: Gebruikersnaam, E-mail (optioneel), Wachtwoord, knoppen Inloggen / Registreren / “Even geduld…”.
- Validatie pas na submit, via API. Geen hulptekst bij het wachtwoordveld.
- Geen herstel, geen profiel, geen bevestiging bij uitloggen.

### Solo-spel (`/play`)

- Modusnaam en beschrijving uit `listGameModes()`.
- Statistieken: Score, Streak, Tijd, Deck.
- Feedback: geldige SET, ongeldige SET, einde, extra kaarten.
- Knoppen: “+3 kaarten (geen SET op bord)”, “Nieuw spel”, “Opnieuw spelen”.
- Einde Classic: tijd, score, hoogste streak, aantal SETs en fouten.
- Einde Time Attack: eindscore en aantal SETs.

### Lobby en multiplayer

- Hub: lobby aanmaken, invitecode, “Lobby joinen”.
- Kamer: code, spelerslijst, “host”, “Start Classic race”, wachtteksten.
- Bord: “Multiplayer Classic”, deck, scores in “pt”, actiefeedback, “Race afgelopen” met “Winnaar”.

### Dashboard, statistieken, leaderboard

- “Ingelogd als {naam}”, snelkoppelingen, statistieken per modus, recente spellen.
- Leaderboard: modus, “Beste score per speler” / “Top runs (alle spellen)”, kolommen #, Speler, Score, SETs, Zetten, Datum.
- Lege staat verwijst naar spelen terwijl je ingelogd bent.

---

## 5. Bevindingen

Prioriteit: P0 misleidend of privacygevoelig, P1 belangrijk gebruiks- of toegankelijkheidsprobleem, P2 merkbare inconsistentie, P3 klein.

### P0

#### COPY-001 — Docker- en database-instructies aan de speler

- **Categorie:** fouten, privacy/operatie
- **Waar:** `src/modules/accounts/application/auth-service.ts` (`authUnavailableMessage`), `src/app/api/auth/login/route.ts`, `src/app/api/auth/register/route.ts`, `src/modules/lobbies/application/lobby-service.ts`
- **Huidig (representatief):** “Registratie mislukt: database niet bereikbaar. Start MySQL met `docker compose up db -d`, daarna `npm run db:migrate`.” En: “Registratie mislukt. Controleer database en serverlogs.”
- **Context:** login, registratie, lobby aanmaken als de database faalt.
- **Probleem:** een speler krijgt operatorinstructies en implementatiedetails. De loginroute toont bij een onverwachte fout expliciet “serverlogs”.
- **Voorstel:** “Inloggen is tijdelijk niet mogelijk. Probeer het later opnieuw.” / “Registratie is tijdelijk niet mogelijk. Probeer het later opnieuw.” / “De lobby kan nu niet worden aangemaakt. Probeer het later opnieuw.”
- **Waarom:** zelfde betekenis (dienst niet beschikbaar), zonder infrastructuur.
- **Copy-only:** ja, als de tekst alleen in de `message` verandert. Docker-detail blijft in `console.error`.
- **Let op:** `authUnavailableMessage` geeft `err.message` door zodra die de tekst “Database” bevat. Dat pad niet naar de client laten lekken.

#### COPY-002 — Dubbel e-mailadres lijkt een storing

- **Categorie:** accounts, privacy
- **Waar:** `users.email` is uniek (`database/migrations/001_initial.sql`). `registerUser` vangt dat niet apart af.
- **Huidig:** de speler krijgt de generieke registratiefout uit COPY-001, alsof de dienst uit ligt.
- **Probleem:** de tekst is onjuist. Een zin als “dit e-mailadres bestaat al” bevestigt dat het adres een account heeft. Dat stellen we niet voor.
- **Voorstel (geen enumeratie):** “Registratie is niet gelukt. Controleer je gegevens of kies een andere gebruikersnaam.”
- **Productbesluit nodig:** gebruikersnaam “al in gebruik” mag blijven, omdat de naam publiek op het leaderboard staat. E-mail niet bevestigen.
- **Copy-only:** nee. De code moet een duplicaat-e-mail herkennen zonder de databasefout te tonen. Aparte goedkeuring.

### P1

#### COPY-003 — Classic-doel klopt niet

- **Categorie:** gameplay
- **Waar:** `src/core/game-modes/classic/mode.ts` beschrijving, getoond op `/play?mode=classic`. Homepage `src/app/page.tsx` zegt “Geen timer”.
- **Huidig:** “Leeg het deck zo snel mogelijk. Combo’s geven meer punten.”
- **Geverifieerd gedrag:** Classic-score = 100 × combo (`basePoints` 100, multipliers 1 / 1,2 / 1,5 / 1,8 / 2 / 2,5). Het leaderboard sorteert op score, daarna SETs, daarna eerdere eindtijd. De getoonde tijd is een klok, geen limiet en geen score.
- **Voorstel modebeschrijving:** “Leeg het deck. Een reeks geldige SETs levert meer punten op.”
- **Voorstel homepage-chip:** vervang “Geen timer” door “Score op combo”.
- **Copy-only:** ja. De beschrijving is metadata, geen spelregel.

#### COPY-004 — Ongeldige SET in Classic zegt alleen “Combo verbroken.”

- **Categorie:** gameplay, tests
- **Waar:** `src/modules/games/presentation/use-board-game.ts`
- **Huidig:** Classic: “Combo verbroken.” Time Attack: “Geen geldige SET — 3 seconden straf!”
- **Probleem:** zonder lopende reeks is “combo verbroken” onwaar. De speler hoort niet dat de drie kaarten geen SET zijn. `tests/e2e/classic.spec.ts` verwacht de tekst “Geen geldige SET”. Die test is niet in deze audit uitgevoerd; de mismatch staat in de bron.
- **Voorstel:** “Geen geldige SET.” Als `currentStreak` vóór de reset groter was dan 0: “Geen geldige SET. Combo terug naar 0.”
- **Copy-only:** de vaste zin wel. De variant met streak leest bestaande state en verandert geen score. E2e blijft slagen zolang “Geen geldige SET” erin blijft.
- **Toon:** geen uitroepteken. Een fout is geen grap.

#### COPY-005 — Engelse domeinfouten op het bord

- **Categorie:** fouten
- **Waar:** `src/core/game-engine/apply-action.ts`, doorgegeven via `use-board-game.ts` (`result.error.message`) en via multiplayer `apply-multiplayer-action.ts`.
- **Huidig, als de actie de UI bereikt:** “Cannot deal extra cards while a SET exists on the board”, “Not enough cards left in the deck”, “Game is not in progress”, “Select three different cards”, “Game has ended”.
- **Voorstel (Nederlandse spelerstekst, codes ongewijzigd):**
  - “Er ligt nog een SET op het bord.”
  - “Er zijn niet genoeg kaarten over in het deck.”
  - “Dit spel loopt niet meer.”
  - “Kies drie verschillende kaarten.”
  - “Dit spel is afgelopen.”
- **Copy-only:** ja, mits alleen de message-string wijzigt. Identifiers en foutcodes blijven. Interne tests die deze Engelse zinnen verwachten, moeten in dezelfde batch mee (nu geen treffer in `tests/` op deze zinnen).
- **Risico:** deze zinnen zijn ook engine-uitvoer. Als een test of log ze als contract gebruikt, is dat een kleine testaanpassing, geen regelwijziging.

#### COPY-006 — “Unauthorized” en andere API-taal

- **Categorie:** fouten
- **Waar:** lobby-, multiplayer-, statistics- en `games/record`-routes. Vast English: “Unauthorized”, “Invalid payload”, “Could not save game result”, “Ongeldige actie” als fallback.
- **Context:** verlopen sessie tijdens lobby of multiplayer; de pagina toont `data.error`.
- **Voorstel:** “Je sessie is verlopen. Log opnieuw in.” voor 401. “Die actie is niet geldig.” / “Het resultaat kon niet worden opgeslagen.”
- **Copy-only:** ja voor de response-`error`-string. Geen wijziging van statuscodes.

#### COPY-007 — Score wordt stil opgeslagen of stil niet opgeslagen

- **Categorie:** ontbrekende status
- **Waar:** `persist-game-result.ts` negeert het antwoord. Dashboard toont `getUserStatistics` niet als die faalt (`message` bestaat wel: “Statistieken niet beschikbaar…”). Een lege geschiedenis na een databasefout lijkt op “nog geen resultaten”.
- **Probleem:** een gast ziet na “Spel voorbij” niet dat het leaderboard alleen ingelogde spellen bewaart. Een ingelogde speler ziet niet of opslaan mislukte.
- **Voorstel op het eindpaneel, alleen als er geen sessie is (bestaande `/api/auth/me` of het 401-antwoord):** “Dit resultaat wordt niet bewaard. Log in om het op het leaderboard te zetten.”
- **Voorstel bij mislukte opslag terwijl wel ingelogd:** “Je resultaat kon niet worden opgeslagen. Je score in dit spel blijft zichtbaar.”
- **Voorstel dashboard:** toon de bestaande statistiekfout in plaats van de statistiekblokken weg te laten. Bij een mislukte geschiedenis: “Recente spellen kunnen nu niet worden geladen.” niet dezelfde zin als de lege staat.
- **Copy-only:** nee. De UI moet het antwoord gebruiken. Geen wijziging van wat er wordt opgeslagen. Aparte goedkeuring voor die tak; de zinnen zelf zijn hier vastgelegd.

#### COPY-008 — Multiplayer-feedback is altijd “succes”

- **Categorie:** toegankelijkheid, feedback
- **Waar:** `multiplayer-game-board.tsx`
- **Huidig:** “Geen geldige SET.”, “Actie mislukt.” en “Netwerkfout bij actie.” staan in `alertSuccess` met `role="status"`. Subtitel: “Race om SETs — server is authoritative (v{versie}).”
- **Probleem:** een fout wordt visueel en structureel als succes gebracht. De versiezin is voor ontwikkelaars.
- **Voorstel subtitel:** “Wie het eerst een SET vindt, krijgt het punt.”
- **Voorstel feedback:** geldige SET blijft succes; ongeldige SET, conflict en netwerkfout krijgen de bestaande gevarenstijl en `role="alert"`.
- **Copy-only:** de subtitel wel. De rol en stijl zijn een presentatie-aanpassing zonder spelregelwijziging; wel even apart markeren bij implementatie.
- **Gelijk trekken met solo:** “SET gevonden! +1 punt” klopt (multiplayer telt +1 per geldige SET). Behouden.

#### COPY-009 — Kaarten hebben geen toegankelijke naam

- **Categorie:** toegankelijkheid
- **Waar:** `set-card.tsx`, `card-symbol-stack.tsx` (`alt=""` en `aria-hidden` op de symbolen).
- **Huidig:** de knop heeft `aria-pressed`, geen naam. Een schermlezer hoort een lege knop.
- **Voorstel `aria-label`:** “{aantal} {kleur} {vorm}, {vulling}” met Nederlandse woorden: één/twee/drie, rood/groen/paars, ovaal/ruit/golf, open/gestreept/gevuld.
- **Voorbeeld:** “twee groene ovalen, gestreept”.
- **Copy-only:** ja. Geen wijziging van selectielogica. Hero blijft `aria-hidden` (decoratief).
- **Terminologie:** “squiggle” in de engine wordt in de UI “golf”, “diamond” wordt “ruit”, “solid” wordt “gevuld”. Alleen in de toegankelijke naam.

#### COPY-010 — Rustinstructie is verborgen voor hulpsoftware

- **Categorie:** toegankelijkheid
- **Waar:** `game-board.tsx`, de paragraaf “Selecteer drie kaarten op het bord.” heeft `aria-hidden`.
- **Probleem:** zichtbare uitleg is voor schermlezers afwezig zolang er geen status is. Na een status verdwijnt de uitleg ook voor ziende spelers, wat prima is.
- **Voorstel:** haal `aria-hidden` weg als dit de enige instructie is, of geef het bord `aria-live="polite"` alleen voor de echte status (die heeft al `role="status"`). De lege instructie niet als live region laten herhalen.
- **Copy-only:** ja.

#### COPY-011 — Zod-lengtefouten zijn Engels

- **Categorie:** validatie
- **Waar:** `auth-schemas.ts`: `username.max(32)` en `password.max(128)` zonder eigen bericht. `joinLobbySchema` heeft wel een Nederlandse minimumzin, geen maximumzin.
- **Probleem:** Zod 4 stuurt dan zijn standaardbericht (Engels) naar het formulier via `issues[0].message`.
- **Voorstel:** “Gebruikersnaam mag maximaal 32 tekens zijn.” “Wachtwoord mag maximaal 128 tekens zijn.” “Invitecode mag maximaal 8 tekens zijn.”
- **Hulptekst bij registratie, zichtbaar vóór submit:** “Minstens 3 tekens: letters, cijfers en underscore.” en “Minstens 8 tekens.”
- **Copy-only:** ja. De regels (3, 32, 8, regex) blijven gelijk.
- **Behoud:** “Gebruikersnaam moet minimaal 3 tekens zijn”, “Alleen letters, cijfers en underscore”, “Wachtwoord moet minimaal 8 tekens zijn”, “Ongeldig e-mailadres”, “Gebruikersnaam is verplicht”, “Wachtwoord is verplicht”.

#### COPY-012 — Dashboard toont `time_attack` als “Time_attack”

- **Categorie:** resultaten
- **Waar:** `dashboard/page.tsx`, `className="… capitalize"` op `game.modeId`.
- **Probleem:** CSS `capitalize` maakt er “Time_attack” van, niet “Time Attack”.
- **Voorstel:** de bestaande `displayName` uit `listGameModes()` (“Classic”, “Time Attack”).
- **Copy-only:** ja, weergave van een al bestaande naam.

### P2

#### COPY-013 — Modusnamen lopen uiteen

| Plek | Tekst |
| --- | --- |
| Homepage-kaart | “Classic SET”, “Start Classic” |
| Modusmetadata en pills | “Classic” |
| Dashboard-knop | “Speel Classic SET” |
| Homepage | “Time Attack”, “Start Time Attack” |
| Multiplayer-start | “Start Classic race” |
| Multiplayer-bord | “Multiplayer Classic” |
| Header | “Lobby” |
| Homepage | “Online lobby”, “Naar lobby” |

**Voorstel:** in navigatie en op het bord de metadata-namen **Classic** en **Time Attack**. Op de homepage mag de kaarttitel “Classic” zijn, met de bestaande uitleg eronder. Multiplayer blijft “Multiplayer” of “Online lobby”, niet een derde naam “Classic race” zonder uitleg. Knop in de kamer: “Spel starten”.

#### COPY-014 — “Leaderboard” naast Nederlandse chroom

Het ontwerp en de UI gebruiken overal “Leaderboard”. Dat is een bewuste productnaam. Niet half vertalen naar “Ranglijst” op de ene pagina en “Leaderboard” op de andere.

**Voorstel:** overal “Leaderboard” als label. In lopende zin mag “het leaderboard”. Niet “ranglijst” introduceren.

#### COPY-015 — “joinen” en “invitecode”

- **Huidig:** “Lobby joinen”, “Kon niet joinen.”, “Invitecode”, placeholder “ABC123”.
- **Voorstel:** “Meedoen”, “Meedoen is niet gelukt. Controleer de code.”, label “Invitecode” behouden (kort en al overal gebruikt) mét hulptekst “4 tot 8 tekens.”
- Placeholder “ABC123” is een voorbeeld, geen echte code. Behouden.

#### COPY-016 — Tijdlabel dekt twee begrippen

Classic en Time Attack gebruiken allebei “Tijd”. Classic is verstreken speeltijd (`m:ss.t`). Time Attack is resterende seconden (`Ns`).

**Voorstel:** Classic “Speeltijd”. Time Attack “Resterend”. Hint bij streak “Volgende ×{n}” met hoofdletter, dezelfde multiplier als nu.

#### COPY-017 — Extra-kaartenknop legt de voorwaarde in het label

**Huidig:** “+3 kaarten (geen SET op bord)”. Uitgeschakeld zonder aparte uitleg.

**Voorstel knop:** “3 kaarten extra”. **Voorstel als de knop uit staat en het spel loopt:** “Alleen als er geen SET op het bord ligt.” Niet tonen als het deck op is; dan: “Geen kaarten meer in het deck.” Die tweede zin alleen als `deckRemaining < 3` (bestaande state).

De succeszin “Drie extra kaarten gedeeld.” wordt nu gezet ná elke klik, ook als de actie faalt. Dat is een functionele volgorde, geen tekstwens. Zie sectie 11.

#### COPY-018 — Afsluiting en meervoud

- “Spel voorbij” en “Spel afgelopen — …” door elkaar. **Voorstel:** statusregel “Spel afgelopen.” Eindpaneelkop “Resultaat”.
- “1 SET” / “2 SETs” / “2 SETs gevonden”. **Voorstel:** “1 SET” en “2 SETs” overal, zonder extra “gevonden” in Classic en mét “gevonden” alleen in de Time Attack-zin als die één regel blijft: “Eindscore {n} · {k} SETs”.
- “Hoogste streak” mag blijven; in de glossary is streak het spelwoord.
- Time Attack “Tijd is op!” mag het uitroepteken houden (einde van de ronde). “deck is leeg!” niet. **Voorstel:** “Spel afgelopen. Het deck is leeg.” en “Spel afgelopen. Er is geen SET meer mogelijk.”

#### COPY-019 — Thema zonder geselecteerde staat in de naam

`aria-label="Thema"` is goed. De knoppen “Licht”, “Donker”, “Systeem” hebben geen `aria-pressed`. **Voorstel:** `aria-pressed={preference === pref}` op de bestaande knoppen. Geen nieuwe labels.

#### COPY-020 — Uitloggen zonder fout en zonder context

De knop toont “…” tijdens laden en negeert een mislukte logout (“Uitloggen mislukt” bestaat al op de API). **Voorstel:** bij falen “Uitloggen is niet gelukt. Probeer het opnieuw.” Geen bevestigingsdialoog: uitloggen is omkeerbaar via opnieuw inloggen. Behoud “Uitloggen”.

#### COPY-021 — Metadata is ontwikkelaarstaal

**Huidig:** description “Classic SET met onderhoudbare game-engine”. Geen titel per pagina. Geen Open Graph. Geen 404-pagina; Next toont dan de standaard Engelse 404.

**Voorstel description:** “Speel SET in Classic of Time Attack, alleen of met anderen in een lobby.”  
**Voorstel titels:** “Spelen · SET Game v2”, “Inloggen · SET Game v2”, “Registreren · SET Game v2”, “Dashboard · SET Game v2”, “Leaderboard · SET Game v2”, “Lobby · SET Game v2”.  
**404, als die pagina later mag:** “Pagina niet gevonden.” met link “Naar de startpagina”. Geen juridische teksten verzinnen.

#### COPY-022 — Homepage mengt talen in chips

“Combo scoring”, “60s sprint”, “High score”, “Solo focus”, “renewed”, hero-badge “Match”.

**Voorstel, zonder de betekenis te wijzigen:** “Combo-score” / “vanaf 100 per SET” (100 is de echte basis). “Time Attack” / “60 seconden”. “Online” / “Samen spelen”. Wenkbrauw Classic: “Solo”. Time Attack: “Tegen de klok”. Tagline volgens ontwerpdocument mag “SET Game v2 — vernieuwd” worden; “renewed” is daar als alternatief genoemd, niet als plicht. Hero-badge: “SET” in plaats van “Match”. De voorbeeldcijfers 420, 3× en ×1,5 blijven decoratief (`aria-hidden`); 3× hoort bij multiplier 1,5. Niet als echte score presenteren — het label “Voorbeeld” dekt dat.

#### COPY-023 — Netwerkfouten bijna hetzelfde, net niet

“Netwerkfout — probeer opnieuw”, “Netwerkfout. Probeer opnieuw.”, “Netwerkfout.”, “Netwerkfout bij lobby vernieuwen.”, “Netwerkfout bij starten.”, “Netwerkfout bij actie.”

**Voorstel patroon:** “Geen verbinding. Probeer het opnieuw.” Context alleen waar die de volgende stap verandert: “Geen verbinding. Vernieuwen van de lobby is niet gelukt.”

#### COPY-024 — “Winnaar” bij gelijke score

Sortering is alleen op score. Bij gelijkspel toont de UI toch één “Winnaar”. **Voorstel zonder winnaarlogica te verzinnen:** “Hoogste score: {naam} ({n} pt).” Dat blijft juist bij een gedeelde hoogste score. Een echte gedeelde podiumtekst vraagt een functionele vergelijking. Niet in deze copy-batch doen.

#### COPY-025 — “host” en “pt”

**Voorstel:** badge “Host”. Score “{n} pt” behouden als compact label; in zinnen “punt” / “punten”.

#### COPY-026 — Gesloten lobby zonder uitleg

Status `closed` toont de spelerslijst zonder zin. **Voorstel:** “Deze lobby is gesloten.”

#### COPY-027 — Sessie verlopen is een redirect zonder uitleg

Lobby en dashboard sturen naar `/login` zonder reden. **Voorstel, alleen als een beschermde pagina de redirect veroorzaakt:** query of kleine zin op login “Log in om verder te gaan.” Niet toevoegen als dat een routeringswijziging vraagt zonder goedkeuring. De zin op de loginformulier is copy; de voorwaarde is gedrag. Markeer als optioneel.

### P3

#### COPY-028 — Punctuatie en toon, kleine reeks

| Huidig | Voorstel | Reden |
| --- | --- | --- |
| “Gebruikersnaam is al in gebruik” | “Die gebruikersnaam is al in gebruik.” | Punt, consequent met andere zinnen. |
| “Ongeldige gebruikersnaam of wachtwoord” | dezelfde zin plus punt | Geen hint welk veld fout is. Behouden. |
| “Er ging iets mis” | “Er ging iets mis. Probeer het opnieuw.” | Alleen de fallback als de API geen `error` geeft. |
| “Onverwacht serverantwoord” | “Geen bruikbaar antwoord van de server. Probeer het opnieuw.” | |
| “Serverfout ({status})” | “De server antwoordde met een fout. Probeer het opnieuw.” | Statuscode weg uit de spelerstekst. |
| “Even geduld…” | “Bezig…” | Korter op een knop. |
| “Laden…” / “Spel laden…” / “Lobby laden…” | behouden | Duidelijk genoeg. |
| “Nog geen account?” / “Al een account?” | behouden | |
| “Jouw statistieken op het dashboard →” | “Je statistieken” | “Jouw” is onnodig nadrukkelijk. De pijl mag. |
| “Speel een rondje” | “Speel een spel” | “Rondje” is vaag; het product heeft geen aparte rondes. |
| “Nog geen opgeslagen solo-spellen.” | behouden | Klopt: multiplayer schrijft deze statistiek niet. |
| “Ingelogd als {naam}” | behouden | |
| Footer “Made by DevJustin” | behouden | Staat vast in `UI-UX-DESIGN.md`. |

#### COPY-029 — “Direct naar tafel” en “Speeltafel”

Begrijpelijk en consistent met elkaar. Behouden.

#### COPY-030 — Lege leaderboardzin

“Nog geen resultaten voor deze mode. Speel een spel terwijl je ingelogd bent.” De link mag blijven. “mode” vervangen door “modus”.

---

## 6. Belangrijke voor en na

| ID | Nu | Voorstel |
| --- | --- | --- |
| COPY-003 | Leeg het deck zo snel mogelijk. Combo’s geven meer punten. | Leeg het deck. Een reeks geldige SETs levert meer punten op. |
| COPY-004 | Combo verbroken. | Geen geldige SET. |
| COPY-004b | Geen geldige SET — 3 seconden straf! | Geen geldige SET. 3 seconden eraf. |
| COPY-008 | Race om SETs — server is authoritative (v12). | Wie het eerst een SET vindt, krijgt het punt. |
| COPY-016 | Tijd / Tijd | Speeltijd / Resterend |
| COPY-018 | Spel afgelopen — deck is leeg! | Spel afgelopen. Het deck is leeg. |
| COPY-022 | SET Game v2 — renewed | SET Game v2 — vernieuwd |

Behouden, want al precies:

- “SET gevonden! +{punten} (combo ×{multiplier})” in Classic. De multiplier staat alleen in de tekst als die groter is dan 1. Dat klopt met de code.
- “SET gevonden! +1 punt” in Time Attack en multiplayer.
- “Ongeldige gebruikersnaam of wachtwoord”.
- “Minimaal twee spelers nodig om te starten.”
- “Iemand anders was sneller. Status wordt vernieuwd.”

---

## 7. Terminologie

| Begrip | Voorkeur | Niet gebruiken | Betekenis | Waar |
| --- | --- | --- | --- | --- |
| Product | SET Game v2 | Pro Style in de UI | De naam uit het ontwerp. “Pro Style” staat niet in de interface. | Merk, titel |
| Geldige combinatie | SET | Match, setje, drieset | Drie kaarten die volgens de regels een SET zijn. | Overal |
| Ongeldige poging | geen geldige SET | foute combo, mis | Drie kaarten die geen SET vormen. | Feedback |
| Modus | Classic, Time Attack | Classic SET, Classic race, gamemode | De twee solo-modi. | Pills, borden, statistiek |
| Multiplayer | Online lobby, daarna Multiplayer | race, realtime Classic-race | Lobby plus gedeeld bord. Bestaat. | Homepage, lobby, bord |
| Spel | spel | rondje, potje, ronde | Eén sessie van start tot einde. Er zijn geen rondes. | Lege staten, einde |
| Opnieuw | Opnieuw spelen / Nieuw spel | restart, reset | Nieuw spel met een nieuwe seed. Hervatten bestaat niet. | Bord |
| Stoppen | — | quit, exit | Er is geen stopknop. `QUIT` in de engine niet in de UI noemen. | — |
| Score | score, punten, pt | high score als los Engels label | Classic: combopunten. Time Attack en multiplayer: 1 per SET. | Bord, einde, lijst |
| Reeks | streak, combo | reeks en streak door elkaar in één zin | Opeenvolgende geldige SETs. Combo is de vermenigvuldiger. | Bord |
| Deck | deck | stapel, talon | Resterende kaarten. | Stat, einde |
| Extra delen | 3 kaarten extra | +3 kaarten (geen SET op bord) als enige uitleg | Alleen als er geen SET ligt en er genoeg kaarten zijn. | Knop |
| Speler | speler | user | Naam op het bord en de lijst. | Leaderboard, lobby |
| Tegenstander | andere spelers | opponent | Multiplayer heeft geen beurten. | Lobby, scorebalk |
| Account | account, gebruikersnaam | user name, profiel | Profiel bewerken bestaat niet. | Auth, header |
| Leaderboard | Leaderboard | ranglijst | Beste score per speler, of alle spellen. | Navigatie |
| Statistieken | statistieken | stats | Solo-totalen. | Dashboard |
| Invitecode | invitecode | join code, room code | Code om een bestaande lobby te openen. | Lobby |
| Host | Host | host (lowercase), owner | Alleen de host start het spel. | Lobby |
| Thema | Licht, Donker, Systeem | theme, mode | Weergave. | Header |

Open punten voor de producteigenaar:

1. Tagline “renewed” of “vernieuwd”. Het ontwerp staat beide toe.
2. Of “Leaderboard” en “Dashboard” ooit Nederlandse labels krijgen. Voorstel voor nu: laten staan.
3. Of een dubbel e-mailadres een neutrale fout blijft (COPY-002).

---

## 8. Toon en schrijfregels

Drie registers, één product. UI-taal Nederlands. Productnamen hierboven blijven Engels.

**Standaard (navigatie, accounts, fouten):** korte zin, tegenwoordige tijd, concrete volgende stap. Geen “iets ging mis” als de oorzaak veilig te zeggen is. Geen Docker, SQL, stacktraces of statuscodes. Eén punt aan het eind van een zin. Knoppen zonder punt.

**Spel:** kort en warm bij een geldige SET (“SET gevonden! +100”). Fouten zonder sarcasme en zonder uitroepteken. Niet elke actie vieren.

**Prestatie:** getallen letterlijk. Geen “persoonlijk record” tenzij de UI dat echt vergelijkt (dat doet ze nu niet). Geen verzonnen rang of beloning.

**Vorm:**

- “je”, niet “u” en niet “jij/jouw”, behalve waar nadruk nodig is (niet nodig).
- Cijfers in de UI: 3, 60, 100.
- Meervoud SET: “1 SET”, “2 SETs”.
- Geen emoji in tekst. De bestaande streak-icoon 🔥 is visueel en `aria-hidden`; niet namaken in zinnen.
- Geen nieuwe marketingbelofte. Multiplayer bestaat; niet suggereren dat er meer modi, toernooien of wachtwoordherstel zijn.

---

## 9. Lokalisatie en toegankelijkheid

**Lokalisatie:** geen catalogus, dus geen ontbrekende sleutels. Risico voor later: alle zinnen staan verspreid. Een framework nu introduceren valt buiten deze opdracht. Placeholder-volgorde in de voorstellen is simpel (`+${punten}`, namen, seconden) en blijft in de bestaande template literals.

**Toegankelijkheid:**

- Kaartknoppen zonder naam (COPY-009).
- Instructie `aria-hidden` (COPY-010).
- Multiplayerfouten niet als fout gemarkeerd (COPY-008).
- Thema zonder `aria-pressed` (COPY-019).
- Live region op het solo-bord bestaat alleen tijdens een status (`role="status"`). Dat is geschikt als de tekst klopt.
- Formulierfouten gebruiken `role="alert"`. Goed.
- Geen `aria-invalid` of `aria-describedby` op auth-velden. De fout staat boven het formulier, niet aan een veld gekoppeld. Koppelen aan een veld is alleen juist als de fout over één veld gaat. Een algemene alert mag blijven.
- Verplichte velden hebben `required` maar geen tekst “verplicht”. De browser toont een eigen, taalonafhankelijke of OS-afhankelijke melding. Een zichtbaar “verplicht” is P3 en optioneel.

---

## 10. Ontbrekende copy en staten

| Staat | Nu | Nodig |
| --- | --- | --- |
| Gast, spel afgelopen | Alleen resultaat | Zin dat opslaan inloggen vereist (COPY-007) |
| Opslaan mislukt | Niets | Korte fout, score blijft op het bord |
| Statistieken offline | Blok verdwijnt | De bestaande foutzin tonen |
| Geschiedenis offline | Lijkt leeg | Aparte fout, niet de lege-staat-zin |
| Sessie verlopen in lobby | “Unauthorized” | Nederlandse sessiezin |
| Lobby gesloten | Geen zin | “Deze lobby is gesloten.” |
| Knop extra kaarten uit | Alleen disabled | Korte reden |
| 404 / applicatiefout | Standaard Next, Engels | Eigen Nederlandse pagina, alleen na goedkeuring van een nieuw bestand |
| Wachtwoordregels | Pas na een fout | Hulptekst onder het veld |
| Uitloggen mislukt | Stil | API-zin tonen |
| Offline tijdens spel | Alleen bij de volgende fetch | Zelfde netwerkzin; geen aparte offline-app |

Niet bouwen: herstelmail, profiel, pauzeren, hervatten, toernooi, beloften over versleuteling.

---

## 11. Wijzigingen die aparte goedkeuring nodig hebben

Geen van deze punten in een “alleen tekst”-batch doen:

1. **COPY-002** — duplicaat-e-mail herkennen. Dat is foutdetectie, geen zin.
2. **COPY-007** — het opslagantwoord lezen en tonen. Nu wordt `fetch` genegeerd. Gedrag van de melding verandert; de opslag-API niet.
3. **COPY-017 volgorde** — `dealExtra` zet altijd “Drie extra kaarten gedeeld.”, ook als `dispatch` faalt. De succeszin pas zetten nadat de actie slaagt. Dat is besturingsstroom.
4. **COPY-024** — een echte gelijkspel-uitspraak vergelijkt scores. De voorgestelde “Hoogste score” is wél copy-only.
5. **Engineberichten (COPY-005)** — zelfde strings kunnen in logs of tests voorkomen. Alleen de spelerstekst wijzigen, niet de foutcode.
6. **Nieuwe `not-found.tsx`** — nieuw bestand en routegedrag van de 404. Alleen als daarom gevraagd wordt.
7. Geen schema-, score-, of routeringswijziging om een zin mooier te maken.

---

## 12. Bestanden bij een latere implementatie

**Batch A — solo-feedback en modusbeschrijving (copy-only)**  
`src/core/game-modes/classic/mode.ts`, `src/modules/games/presentation/use-board-game.ts`, `src/modules/games/presentation/game-board.tsx`, `src/app/page.tsx`  
E2e: `tests/e2e/classic.spec.ts` blijft geldig als “SET gevonden” en “Geen geldige SET” blijven staan.

**Batch B — spelersteksten van API en validatie**  
`src/shared/validation/auth-schemas.ts`, `src/shared/validation/multiplayer-schemas.ts`, `src/modules/accounts/application/auth-service.ts`, `src/app/api/auth/login/route.ts`, `src/app/api/auth/register/route.ts`, `src/app/api/games/record/route.ts`, lobby- en multiplayer-routes die “Unauthorized” teruggeven, `src/core/game-engine/apply-action.ts`, `src/modules/multiplayer/application/apply-multiplayer-action.ts`, `src/modules/lobbies/application/lobby-service.ts`, `src/modules/leaderboards/application/get-leaderboard.ts`

**Batch C — lobby, multiplayer, dashboard-weergave**  
`lobby-hub.tsx`, `lobby-room.tsx`, `multiplayer-game-board.tsx`, `dashboard/page.tsx`, `leaderboard-panel.tsx`, `auth-form.tsx`, `logout-button.tsx`, `layout.tsx` (metadata)

**Batch D — toegankelijke kaartnamen**  
`set-card.tsx` (en een kleine map voor kleur/vorm/vulling, lokaal bij de kaart, geen nieuw contentplatform)

**Niet in de eerste batches:** COPY-002, COPY-007, de volgorde in `dealExtra`, een nieuwe 404.

---

## 13. Test- en verificatieplan (na goedkeuring)

1. `npm run test` — engineberichten alleen als die tests zinnen vastzetten.
2. `npm run typecheck` en `npm run lint`.
3. `tests/e2e/classic.spec.ts` — “SET gevonden” en “Geen geldige SET”.
4. Handmatig of in de browser: Classic ongeldige SET met en zonder streak; Time Attack strafzin; eindpaneel; login met lege velden en fout wachtwoord; registratiehulptekst; leaderboard lege staat; lobbyfout “Lobby is vol.” als die flow beschikbaar is; toetsenbord op een kaart (toegankelijke naam in de accessibility tree); thema `aria-pressed`.
5. Diff nalopen: geen scoreformule, geen statuscode, geen SQL, geen route-redirect gewijzigd.

Niet claimen dat e2e slaagt voordat het gedraaid is.

---

## 14. Beperkingen

- Geen browserrondgang en geen schermlezer in deze fase.
- Overflow is niet visueel gemeten. De langste nieuwe zinnen zijn de einduitleg en de uitgeschakelde-knopreden; die passen in de bestaande `text-sm`-blokken, maar dat is een inschatting.
- De letterlijke Zod 4-standaardzin is niet in de browser afgelezen. Wel vastgesteld: `.max()` zonder bericht.
- E2e niet uitgevoerd. De verwachte string en de UI-string zijn allebei in de bron gelezen.
- Multiplayer-happy-path is niet gespeeld met twee sessies.
- `plan-van-aanpak/` is productdocumentatie voor ontwikkelaars, geen UI. Niet als spelerstekst beoordeeld.
- Secrets en `.env` niet geopend.

---

## 15. Voorgestelde volgorde

1. Batch A — omdat Classic-feedback nu aantoonbaar tegen de e2e-tekst en de spelregels ingaat.  
2. Batch B — Engelse en operationele fouten.  
3. Batch C — dezelfde woorden op homepage, lobby, dashboard en leaderboard.  
4. Batch D — toegankelijke kaartnamen.  
5. Daarna apart beslissen over COPY-002, COPY-007 en de `dealExtra`-volgorde.

---

## 16. Wat deze audit niet doet

Geen bestanden met spel, layout of API zijn gewijzigd voor deze audit. Dit document is de gevraagde documentatie van Fase 1.

Implementatie start pas na expliciete goedkeuring, met de batches en uitzonderingen hierboven.
