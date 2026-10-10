# SET Game v2 — UI/UX & design system (bron van waarheid)

Vastlegging van **thema, kleuren, typografie, spacing, componenten en motion** voor de browser-app. Game-logica en API vallen hier buiten. Bij conflict tussen code en dit document: **eerst dit document aanpassen**, dan code.

**Laatste update:** 2026-10-10

---

## 1. Merk & toon

| Item | Vast |
|------|------|
| Productnaam | **SET Game v2** |
| Hero-tagline | **SET Game v2 — renewed** (NL-variant toegestaan: *vernieuwd*) |
| Footer | **Made by DevJustin** — klein, `muted`, globale layout |
| UI-taal | **Nederlands** (geen i18n in v1) |
| Toon | Competitief en energiek, modern; **geen circus** (geen confetti-storms, knipperende CTAs, regenbooggradients) |

---

## 2. Thema-modi

### Modi

| Modus | Gedrag |
|-------|--------|
| `light` | Altijd licht palet (§3.1) |
| `dark` | Altijd donker palet (§3.2) |
| `system` | Volgt `prefers-color-scheme`; wisselt mee met OS |

### Defaults & opslag

| Regel | Waarde |
|-------|--------|
| Eerste bezoek (geen opgeslagen keuze) | **`light`** |
| Opslag | **`localStorage`** key: `set-game-v2-theme` → `light` \| `dark` \| `system` |
| Gast vs ingelogd | Zelfde key; **geen** server-sync in v1 |
| DOM | `class="light"` of `class="dark"` op `<html>` (effectieve kleur); modus `system` blijft in storage, resolved kleur volgt media query |
| UI | Thema-keuze in **site header** (licht / donker / systeem) |

### Techniek

- Alle UI-kleuren via **CSS custom properties** in `globals.css` (§3.3).
- Geen `zinc-*` / `violet-*` hardcoded in feature-componenten als er een token is.
- `prefers-color-scheme` alleen als **resolved** thema bij modus `system`, niet als enige gebruikersoptie.

---

## 3. Kleurenpalet

### 3.1 Light — “Linnen tafel”

| Token | Hex | Gebruik |
|-------|-----|---------|
| `--background` | `#f6f4f0` | Pagina-achtergrond |
| `--foreground` | `#1c1917` | Bodytekst |
| `--muted` | `#78716c` | Labels (Score, Deck, …) |
| `--border` | `#e7e5e4` | Randen header, panels, inputs |
| `--surface` | `#ffffff` | Kaarten/panels, SET-kaartvlak |
| `--surface-elevated` | `#faf9f7` | Header/footer, zwevende panels |
| `--accent` | `#4338ca` | Primaire knoppen, actieve modus, focus |
| `--accent-hover` | `#3730a3` | Hover primaire knop |
| `--accent-foreground` | `#ffffff` | Tekst op accent |
| `--accent-muted` | `#e0e7ff` | Zachte accent-achtergrond (badges, geselecteerde pill) |
| `--ring` | `#6366f1` | Focus-ring, geselecteerde SET-kaart |
| `--competition` | `#d97706` | Time Attack CTA, timer “warm” |
| `--competition-urgent` | `#e11d48` | Timer laatste 10s |
| `--success` | `#047857` | SET-gevonden tekst |
| `--success-bg` | `#ecfdf5` | Status succes |
| `--danger` | `#be123c` | Geen SET / fout |
| `--danger-bg` | `#fff1f2` | Status fout |

### 3.2 Dark — “Avondtafel”

| Token | Hex | Gebruik |
|-------|-----|---------|
| `--background` | `#121016` | Pagina-achtergrond |
| `--foreground` | `#e8e6f0` | Bodytekst |
| `--muted` | `#9b98a8` | Labels |
| `--border` | `#3d3a48` | Randen |
| `--surface` | `#1c1b22` | Panels |
| `--surface-elevated` | `#25242e` | Header, footer |
| `--accent` | `#6366f1` | Primaire acties |
| `--accent-hover` | `#818cf8` | Hover |
| `--accent-foreground` | `#0f0e14` | Tekst op accent (donker op licht indigo) |
| `--accent-muted` | `#312e81` | Zachte accentvlakken |
| `--ring` | `#818cf8` | Focus / kaartselectie |
| `--competition` | `#f59e0b` | Time Attack |
| `--competition-urgent` | `#fb7185` | Timer urgent |
| `--success` | `#34d399` | Succes tekst |
| `--success-bg` | `#064e3b` | Status succes (40% opacity ok) |
| `--danger` | `#fb7185` | Fout |
| `--danger-bg` | `#4c0519` | Status fout (subtiel) |

**SET-kaart op bord (niet panel):** light = `--surface` `#ffffff`; dark = `#2a2833` met border `--border`.

### 3.3 Spelkleuren (alleen op kaart-SVG)

| Kleur | Hex |
|-------|-----|
| Rood | `#d64045` |
| Groen | `#2a9d6f` |
| Paars | `#7b5ea7` |

Niet gebruiken als app-accent of navigatiekleur.

### 3.4 Leaderboard podium (alleen badges/rij-tint)

| Rang | Achtergrond-tint | Tekst/accent |
|------|------------------|--------------|
| 1 | `#fef3c7` / dark `#422006` | `#b45309` |
| 2 | `#f1f5f9` / dark `#1e293b` | `#64748b` |
| 3 | `#ffedd5` / dark `#431407` | `#c2410c` |

Geen metallic gradients of animatie op podium.

### 3.5 Tailwind-koppeling

In `@theme inline` (Tailwind v4) mappen naar `--color-background`, `--color-foreground`, `--color-accent`, enz., zodat utilities `bg-background`, `text-muted`, `border-border`, `bg-accent` werken.

---

## 4. Typografie

| Rol | Font | Gewicht / stijl |
|-----|------|------------------|
| Body, UI | **Geist Sans** | 400 body, 500–600 labels/knoppen |
| Display (H1 hero, grote titels) | **Outfit** | 600–700, `tracking-tight` |
| Stats (score, timer, ranks) | **Geist Mono** | 600, **`tabular-nums`** |

### Schaal (Tailwind-klassen = standaard)

| Element | Klasse |
|---------|--------|
| Hero H1 | `text-4xl sm:text-5xl font-bold` (Outfit) |
| Pagina H1 | `text-2xl font-bold` (Outfit of Geist) |
| Sectie H2 | `text-lg font-semibold` |
| Body | `text-base` |
| Klein / labels | `text-sm text-muted` |
| Stat-getal | `text-2xl font-semibold font-mono tabular-nums` |
| Timer onder druk | zelfde + kleur `--competition` → `--competition-urgent` |

**Tijdens spelen:** timer (indien) en score visueel **boven** modustitel.

---

## 5. Spacing, radius, schaduw

| Token | Waarde | Gebruik |
|-------|--------|---------|
| Pagina padding | `px-4` / `py-8` (play: `py-6`) | Consistent |
| Max content width | `max-w-5xl` | Header inner, meeste pagina’s |
| Max play width | `max-w-4xl` | Bord + stats |
| Gap grid kaarten | `gap-3` | Board |
| `--radius-card` | `0.75rem` (`rounded-xl`) | Panels, SET-kaart |
| `--radius-button` | `0.5rem` (`rounded-lg`) | Standaard knoppen |
| `--radius-pill` | `9999px` (`rounded-full`) | Modus-pills, hero CTA |
| `--shadow-card` | `0 1px 3px rgb(0 0 0 / 0.08)` | Kaarten/panels |
| `--shadow-card-hover` | `0 6px 16px rgb(0 0 0 / 0.12)` | Hover SET-kaart |
| Dark shadows | Zelfde structuur, `rgb(0 0 0 / 0.35)` | |

---

## 6. Motion

| Token | Duur | Easing |
|-------|------|--------|
| `--motion-fast` | `150ms` | `ease-out` |
| `--motion-normal` | `250ms` | `ease-out` |
| `--motion-slow` | `350ms` | `ease-in-out` |

| Interactie | Motion |
|------------|--------|
| SET-kaart hover | `translateY(-2px)` + `--shadow-card-hover` |
| Selectie | `scale(1.02)` + `ring-2` `--ring` |
| Geldige SET | pulse 200ms → fade out 250ms → nieuwe kaarten fade in (stagger 50ms) |
| Ongeldige SET | shake ~300ms horizontaal |
| **`prefers-reduced-motion: reduce`** | Geen shake/pulse/stagger; instant state |

Animaties **CSS-first**; geen motion-library verplicht.

---

## 7. Componenten

### 7.1 Site header

- `sticky top-0 z-50`
- `bg-[var(--surface-elevated)]/80` + `backdrop-blur-md`
- `border-b border-border`
- Logo: `font-semibold text-accent` (light) / `text-foreground` met accent on hover
- Nav links: `text-foreground/80 hover:text-foreground`
- **Compact op** `/play` en multiplayer: `py-2` i.p.v. `py-3`

### 7.2 Footer

- `border-t border-border`, `text-sm text-muted`, gecentreerd of links
- Tekst: `Made by DevJustin`

### 7.3 Button

| Variant | Stijl |
|---------|--------|
| **Primary** | `bg-accent text-accent-foreground hover:bg-accent-hover` |
| **Secondary** | `border border-border bg-surface hover:bg-surface-elevated` |
| **Ghost** | `hover:bg-surface-elevated` |
| **Danger** | `bg-danger-bg text-danger` of outline danger |
| **Competition** | Time Attack: `bg-competition` (token), witte tekst |

Min. hoogte touch: **44px** waar het een primaire actie is.

### 7.4 Card (panel)

- `bg-surface border border-border rounded-xl shadow-card`
- Padding: `p-4` tot `p-6`

### 7.5 Badge / modus-pill

- Actief: `bg-accent text-accent-foreground rounded-full px-3 py-1 text-sm font-medium`
- Inactief: `border border-border text-foreground rounded-full … hover:bg-surface-elevated`

### 7.6 Statusstrip (spel)

- Vaste hoogte-regel onder bord
- Succes: `bg-success-bg text-success`
- Fout: `bg-danger-bg text-danger`
- Copy NL, o.a. **“Geen SET — probeer opnieuw.”**

### 7.7 ThemeToggle

- Drie opties: Licht | Donker | Systeem
- Schrijft `set-game-v2-theme` in localStorage

---

## 8. Layout & schermen

### Pagina’s

`Home` · `Play` · `Lobby` / `Multiplayer` · `Leaderboards` · `Dashboard` · `Login` / `Register`

### Play-layout

```
[stats: modus | timer | score | deck]
[modus-pills]                    [secundaire acties]
────────── kaartgrid (focus) ──────────
[statusstrip]              [Deal extra | Nieuw spel]
```

### Kaartgrid

| Breakpoint | Kolommen |
|------------|----------|
| default | 3 |
| `sm` | 4 |
| `md+` | 6 |

SET-kaart: `aspect-[5/7]`, `max-w-[120px]` (mobiel mag iets groter), border `border-border` → geselecteerd `border-[var(--ring)]`.

---

## 9. Geluid

| Regel | Waarde |
|-------|--------|
| v1 | **Geen geluid** (geen audio assets, geen toggle) |
| Later | Optioneel, minimaal; alleen na update van dit document |

---

## 10. Uitrol (implementatievolgorde)

1. **Foundation** — §3 tokens in `globals.css`, ThemeToggle, header/footer, Button/Card  
2. **Play** — grid, kaart-motion, statusstrip, timer-kleuren  
3. **Home** — hero tagline, mode-cards  
4. **Social/data** — lobby, leaderboard podium, dashboard responsive  

---

## 11. Niet doen

- Circus-UI, kaartkleuren als hoofdaccent, Engelse UI-strings  
- Thema alleen via OS (zonder keuze + localStorage)  
- Layout shift bij elke statusmelding  
- “Pro Style” of andere niet-§1 taglines  
- Hardcoded `violet-700` / losse hex in componenten (gebruik tokens)

---

## 12. Wijzigingen loggen

| Datum | Wijziging |
|-------|-----------|
| 2026-10-10 | Eerste vastlegging palet, thema-modi, tokens, componenten |
