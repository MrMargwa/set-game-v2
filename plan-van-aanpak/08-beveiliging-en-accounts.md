# Beveiliging en accounts

Accounts komen in **fase 6**; dit document legt ontwerp vast zodat M1 geen keuzes blokkeert die later onveilig zijn.

## Threat model (kort)

| Dreiging | Mitigatie |
|----------|-----------|
| Gestolen sessiecookie | HttpOnly, Secure, korte TTL + rotate |
| Credential stuffing | Rate limit login, geen user enumeration in errors |
| SQL injection | Parameterized queries / ORM |
| XSS → session theft | HttpOnly cookies; CSP waar haalbaar |
| CSRF op state-changing routes | SameSite + token voor cookie auth |
| Weak passwords | Min length, optional breach check later |

## Wachtwoorden

- **Algoritme:** Argon2id (OWASP aanbevolen).  
- **Opslag:** alleen hash + parameters in `password_hash` (encoded string).  
- **Geen** plaintext, geen reversible encryption.  
- Register: constant-time compare where applicable; generic error messages.

## Sessies

| Aspect | Keuze |
|--------|--------|
| Token | Cryptografisch random (256 bit), in cookie |
| Cookie naam | `setgame_session` (voorbeeld) |
| HttpOnly | Ja |
| Secure | Ja in production |
| SameSite | `Lax` (default); `Strict` indien geen cross-site needs |
| Max age | Bijv. 7 dagen sliding of 24h idle — **ADR** |
| Server store | `sessions` tabel met `token_hash`, niet raw token in DB log |

**Login flow:** verify password → create session → Set-Cookie → rotate session id.

**Logout:** invalidate server session + clear cookie.

## Autorisatie

- **Application layer** checkt: `currentUser` mag actie?  
- Patroon: `requireAuth()` in route handlers; use cases krijgen `UserId`.  
- Multiplayer: alleen deelnemers mogen game commands sturen voor die `gameId`.

## API en Next.js

- Server Actions / Route Handlers: nooit vertrouwen op client-only checks.  
- Validatie input met Zod op boundary.  
- Rate limiting (fase 6): login, register, multiplayer commands.

## Geheimen

- `SESSION_SECRET`, DB credentials alleen in env.  
- `.env` in `.gitignore`; `.env.example` zonder waarden.  
- Geen secrets in `snapshot_json` of client bundles.

## Privacy

- Minimale PII: username, optioneel email.  
- Spelhistorie gekoppeld aan user; export/delete (GDPR) als backlog post-M2.

## Checklist fase 6 exit

- [ ] Argon2id via gevestigde library (`@node-rs/argon2` of `argon2`)  
- [ ] Session fixation: new id on login  
- [ ] Password reset flow designed (implementatie mag M2.1 follow-up)  
- [ ] Security headers (baseline) in `next.config`  
- [ ] Dependency audit in CI (`npm audit` / OSV)

## Referenties

- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)  
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
