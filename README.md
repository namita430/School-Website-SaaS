# School Website SaaS Platform

Multi-tenant SaaS platform for schools: visual website builder, dynamic CMS, theme engine, custom domains, super admin + school admin dashboards, and per-school public websites.

Stack: Java 21 + Spring Boot + MySQL (backend) · React + TypeScript + Tailwind (frontend) · Flyway migrations · Docker Compose for local dev.

## Project layout

```
backend/                 Spring Boot API (single shared app, tenant-aware)
frontend/apps/
  super-admin/            The single merged frontend app - despite the
                          folder name (kept from its original scope to
                          avoid unnecessary churn), this now serves the
                          platform landing page ("/"), one unified login
                          ("/login"), the Super Admin dashboard ("/dashboard",
                          "/schools", "/plans", "/audit-log"), AND the full
                          School Admin dashboard + website builder, nested
                          under "/schooladmin/*". The formerly-separate
                          school-admin app was merged in and deleted -
                          see AppRouter.tsx for the merged route tree.
  public-site/            Public website renderer - one app serving every
                          school's own site by subdomain, plus the
                          platform's own landing page at the bare host.
frontend/packages/
  ui/                     Shared component/design-token library (future)
  shared-types/           Shared TS types / Zod schemas (future)
infra/
  docker-compose.yml      Local dev stack (MySQL + API)
docs/                     Architecture notes
```

## Running locally

### Backend + database (Docker)

```powershell
cd infra
docker compose up --build
```

API starts on `http://localhost:8080`. Flyway runs migrations automatically on startup.

### Backend only (without Docker), against a local MySQL

```powershell
cd backend
mvn spring-boot:run
```

Requires a MySQL instance reachable per `application.yml` (`DB_HOST`, `DB_USER`, `DB_PASSWORD` env vars override defaults).

### Frontend apps

Two independent Vite projects now (down from three - see "Project layout" above). From each app directory:

```powershell
cd frontend/apps/super-admin   # or public-site
npm install
npm run dev
```

- The merged app (landing, login, Super Admin, School Admin) → http://localhost:5173
- public-site → http://localhost:5175 (a school's own site at `{slug}.localhost:5175`, or the bare host for the platform's public-site landing page)

## Auth (Phase 1)

- `POST /api/v1/auth/login` — `{ email, password }` → JSON access token (15 min TTL) + `Set-Cookie: refreshToken` (httpOnly, 14 days).
- `POST /api/v1/auth/refresh` — rotates the refresh token cookie, returns a new access token.
- `POST /api/v1/auth/logout` — revokes the refresh token and clears the cookie.
- All other `/api/v1/**` endpoints require `Authorization: Bearer <accessToken>`.

No user-registration endpoint exists yet — Phase 1 seeds roles/permissions only (`V2__auth_and_seed_roles.sql`). To create a first login, insert a `users` row directly with a BCrypt password hash, plus a `school_users` or `user_global_roles` row to grant a role.

## Super Admin — Schools (Phase 2)

All under `/api/v1/superadmin/schools`, requiring a Bearer token with the `SUPER_ADMIN` role:

- `POST /` — create `{ name, slug }` (slug: lowercase, hyphenated)
- `GET /` — paginated list (`?page=&size=&sort=`)
- `GET /{id}` — fetch one
- `PUT /{id}` — update `{ name }` (slug is not editable here)
- `POST /{id}/suspend` / `POST /{id}/activate` — status transitions

Creating a school does not create an owner user — there is no registration flow yet, so a school currently has no admin users until one is granted manually (insert a `school_users` row) or a later phase adds an invite flow.

## School Admin — "My school" (Phase 3)

Under `/api/v1/schools/me` (scoped by the caller's JWT `schoolId` claim, not a path id):

- `GET /` — any authenticated member of the school
- `PUT /` — requires the `SETTINGS_EDIT` permission (SCHOOL_OWNER/SCHOOL_ADMIN by default)

The `school-admin` frontend app now has a real shell: `/login`, a protected layout with sidebar navigation (Dashboard, Website, Content, Media, SEO, Domain, Users, Settings), a working Dashboard (reads `/schools/me`) and Settings page (edits the school name). Every module besides Dashboard/Settings is a placeholder page until its phase lands. Auth state lives in a Zustand store (access token in memory only); on load the app calls `/auth/refresh` once to silently resume a session from the httpOnly cookie.

## Components & Pages (Phase 4)

- `GET /api/v1/components` — the component registry (type key, name, prop schema); requires `WEBSITE_VIEW`.
- `/api/v1/pages` — tenant-scoped CRUD: `POST` (`PAGE_CREATE`), `GET`/`GET /{id}` (`WEBSITE_VIEW`), `PUT /{id}/content` (`PAGE_EDIT`, validates every section against its component's schema before saving), `POST /{id}/set-home` (`PAGE_EDIT`), `DELETE /{id}` (`PAGE_DELETE`, refuses to delete the home page).

A page's `contentJson` is `{ "sections": [ { "id", "type", "props": {...} } ] }` — never HTML. This is still draft-only (no publish/versioning yet — that's Phase 6), and the component schema format is a small hand-rolled convention (`{ "properties": { "<name>": { "type", "required" } } }`), not full JSON Schema — documented in `V4__component_registry_and_pages.sql`.

## Website Builder (Phase 5)

`/website/pages` lists a school's pages (create, set-home, delete) and links into `/website/builder/:pageId`, the visual editor:

- **Component panel** (left) — every registered component type; click to add a new section
- **Canvas** (center) — sections as cards, click to select, reorder/duplicate/remove
- **Properties panel** (right) — a form generated live from the selected section's component schema (string/number/boolean/array/object inputs)
- **Toolbar** (top) — Undo/Redo (in-memory history stack, 50 steps) and a manual Save button (disabled until something's actually changed)

Canvas cards are a structural preview, not a live rendering of each component — an actual per-type visual renderer is shared work with the public site, which lands in Phase 6. Save is manual; autosave is a later refinement.

## Draft/Publish + Public Site (Phase 6)

Page content now lives in `page_versions` (one DRAFT row, one optional PUBLISHED row per page — `V5` migration). `/api/v1/pages/{id}/content` still edits the draft; new `POST /{id}/publish` promotes it to PUBLISHED (re-validated), `POST /{id}/unpublish` takes it back down.

Public, unauthenticated endpoints under `/api/v1/public/**` (never expose draft content):
- `GET /site` — school name/slug/home page slug
- `GET /pages/home`, `GET /pages/{slug}` — PUBLISHED content only, 404 otherwise

Tenant resolution for these is Host-header-based: `TenantResolutionFilter` reads `X-Forwarded-Host` (falls back to `Host`), strips the port, and matches `<slug>.<PUBLIC_BASE_DOMAIN>` against a school. Custom domains (the `domains` table) are still Phase 11 — only subdomain resolution exists so far.

The `public-site` frontend app renders this: a `COMPONENT_REGISTRY` maps each component type key to a real React component (`Hero`, `Heading`, `Text`, `Image`, `About`, `Cta`, `NoticeBoard`, `Footer`, `Navbar`), driven purely by `section.props` — no page-specific code. It sends its own `window.location.hostname` as `X-Forwarded-Host` so a single dev backend can serve multiple tenants without a reverse proxy; in production a real proxy sets this header instead.

**Local subdomain testing**: modern OS/browser resolvers treat `*.localhost` as loopback automatically, so `http://<school-slug>.localhost:8080/api/v1/public/site` resolves without any `/etc/hosts` edit, given `PUBLIC_BASE_DOMAIN=localhost` (the Docker Compose default).

## Theme Engine (Phase 7)

`GET/PUT /api/v1/themes/me` — one row per school (`themes` table, `V6` migration), auto-created with sensible defaults on first read. 8 tokens: `colorPrimary`, `colorSecondary`, `colorAccent`, `colorBackground`, `colorText`, `fontHeading`, `fontBody`, `radius`. `GET` requires any authenticated school member; `PUT` requires `THEME_EDIT` (already seeded back in Phase 1).

`/api/v1/public/site` now includes `themeTokens`. The `public-site` app applies them as CSS custom properties on `<html>` at runtime (`lib/applyTheme.ts`) — every component's Tailwind classes already reference `var(--color-primary, #2563eb)`-style fallbacks, so one theme change updates the whole site with no per-component code. `school-admin` gets a real `/website/theme` settings page (color pickers + font/radius fields) replacing its placeholder.

## Content Modules (Phase 8)

8 content types — notices, events, news, teachers, gallery, testimonials, facilities, downloads — each with:
- Admin CRUD at `/api/v1/{notices,events,news,teachers,gallery,testimonials,facilities,downloads}` (create/list/get/update/delete), permission-gated (notices/events reuse their existing `NOTICE_CREATE`/`NOTICE_EDIT`/`EVENT_CREATE`/`EVENT_EDIT`; the other 6 use one `<TYPE>_MANAGE` permission each — `V7` migration)
- Unauthenticated public reads at `/api/v1/public/{same paths}?limit=N`, each explicitly guarding against an unresolved Host (would otherwise leak every school's data unfiltered)
- 7 new builder component types (`events`, `news`, `teachers`, `gallery`, `testimonials`, `facilities`, `downloads` — `notice_board` already existed) so schools can place this content on pages

**A deliberate structural exception for this batch**: each type's entity/repository/service/controller/DTOs live in **one file** (`backend/.../school/content/{Notice,Event,News,Teacher,GalleryItem,Testimonial,Facility,Download}.java`) rather than the one-class-per-file convention used elsewhere — these 8 modules are structurally identical CRUD, and a shared `AbstractTenantContentService` base class covers the common list/create/update/delete logic. The `school-admin` UI mirrors this: one generic config-driven `ContentPage.tsx` (see `features/content/contentConfig.ts`) instead of 8 near-identical pages. `public-site` still has one bespoke renderer component per type, since visual rendering genuinely differs per type.

## Media Library (Phase 9)

`POST /api/v1/media` (multipart, `MEDIA_UPLOAD` permission), `GET /api/v1/media`, `DELETE /api/v1/media/{id}`. Server-side validation: allowed content types and a 10MB max size (both configurable via `app.media.*`). Files are written to a local directory (`app.media.storage-dir`, default `./media-storage`, Docker-mounted as a named volume) behind a `StorageService` interface — architecture says never store large files in MySQL and design for object storage, and since this dev environment has neither Docker-based MinIO nor cloud credentials available, `LocalFileStorageService` is the only implementation so far. Swapping in a real S3-backed implementation later means adding one new `@Service` class, not changing the upload/delete flow or the API. Uploaded files are served back publicly (unauthenticated) at `/media/**` via a static resource handler, since these URLs get embedded directly in published pages.

`school-admin` gets a real Media Library page (upload, grid view, copy URL, delete) at `/media`.

## SEO (Phase 10)

- `GET/PUT /api/v1/seo/me` — site-wide defaults (default meta description, default OG image, favicon URL, robots indexable toggle), same `getOrCreate` pattern as themes.
- `PUT /api/v1/pages/{id}/seo` — per-page `metaDescription`/`ogImageUrl` overrides; `null` falls back to the site-wide default (resolved server-side, not client-side).
- `GET /api/v1/public/sitemap.xml`, `GET /api/v1/public/robots.txt` — tenant-resolved via the same Host-header mechanism as every other public endpoint. In production these need a reverse-proxy rewrite from the conventional root paths (`/sitemap.xml`, `/robots.txt`) to these — that's Phase 11 infra work, not done here.

`public-site` now manages real `<head>` tags per page (title, meta description, Open Graph, canonical URL) and site-wide (favicon, `<meta name="robots">`), via `lib/applySeo.ts` — no `react-helmet` dependency, just direct DOM manipulation matching the existing `applyTheme.ts` pattern. `school-admin` gets a site-wide `/seo` settings page plus a per-page SEO panel accessible from the builder's Toolbar.

## Custom Domains (Phase 11)

`/api/v1/domains` — add a custom domain (`POST`), list (`GET`), verify via a real DNS TXT lookup (`POST /{id}/verify`), set primary (`POST /{id}/set-primary`), remove (`DELETE`). All gated by `DOMAIN_MANAGE` (seeded back in Phase 1).

- **Domain names are unique across the whole platform**, not per-school — enforced at the DB level (`UNIQUE` constraint) and explicitly at the application level too: `DomainService` deliberately disables the per-tenant Hibernate filter for that one uniqueness check (documented inline), since a normal tenant-scoped query would only ever see the current school's own domains.
- **Verification is a real DNS lookup**, not a stub: `DnsVerificationService` queries a `TXT` record at `_schoolsaas-verify.<domain>` via the JDK's built-in DNS provider (`com.sun.jndi.dns`), no extra dependency needed.
- **`TenantResolutionFilter` now has both halves**: subdomain resolution (Phase 6) tried first, falling back to an exact-hostname lookup against `VERIFIED` custom domains.
- **Honest scope limit**: SSL status moves `NONE → PROVISIONING` on successful verification and stops there — actually issuing a certificate needs a reverse proxy + ACME client (Let's Encrypt), which is real infrastructure this dev environment doesn't have. `ACTIVE` is never set by application code; a production deployment's proxy would be what flips it.

`school-admin` gets a real `/domain` page — add a domain, see DNS instructions (TXT + CNAME), verify, set primary, remove.

## Subscriptions & Payments (Phase 12)

- `GET /api/v1/superadmin/plans` + `POST`/`activate`/`deactivate` — global plan catalog, Super Admin only (`PLATFORM_MANAGE`).
- `GET /api/v1/billing/{plans,subscription,payments}`, `POST /api/v1/billing/{subscribe,cancel}` — school-admin self-service, restricted to `SCHOOL_OWNER` (`BILLING_MANAGE`, deliberately not granted to `SCHOOL_ADMIN`/`CONTENT_MANAGER`).
- **No real payment gateway is wired up** — per an explicit decision with the user, this is built behind a `PaymentGateway` interface (Stripe-shaped: checkout session creation, would-be webhook handling) with a `StubPaymentGateway` that deterministically simulates a successful checkout with no network call. Swapping in real Stripe later is a new class implementing the interface — `SubscriptionService` and everything above it needs no changes.

`school-admin` gets a `/billing` page (current plan, plan picker, cancel, payment history).

**A significant bug was found and fixed in this phase**: `@PreAuthorize` denials (`AuthorizationDeniedException`) were being caught by the generic `Exception` handler and returned as 500 instead of 403 — silently true for every permission check across the whole app since Phase 2, only surfaced once a genuinely-denied request was tested (every prior live check happened to use a token with sufficient permissions). Fixed with an explicit handler in `GlobalExceptionHandler`.

## Audit Logs & Observability (Phase 13)

- `audit_logs` table — deliberately NOT tenant-owned in the usual sense (`school_id` is a plain nullable column, no Hibernate `tenantFilter`), since the actor performing an action (e.g. a Super Admin suspending a school) often doesn't belong to the affected school's tenant. School-scoped reads apply an explicit `WHERE school_id = ?`; the Super Admin view has none.
- `AuditLogService.record(...)` is called directly (not via an AOP annotation, for traceability) from `SchoolService` (suspend/activate), `DomainService` (add/verify/set-primary/remove), `ThemeService` (update), `PageService` (publish/unpublish), and `SubscriptionService` (subscribe/cancel).
- `GET /api/v1/audit-logs` (school-scoped, `SETTINGS_EDIT`) and `GET /api/v1/superadmin/audit-logs` (platform-wide, `PLATFORM_MANAGE`).
- **Spring Boot Actuator was added** — `/actuator/health` has been `permitAll` in `SecurityConfig` since Phase 1 but had no backing dependency until now (a dead rule, confirmed and fixed this phase).

`school-admin` gets a real `/audit-log` page.

## Portals (Phase 14, open-ended)

`school-admin` now branches its layout by the logged-in user's role (`authStore.activeRoleCode`, derived from login's `memberships`), not a separate app per role:
- **Teacher** (`TEACHER` role, existed since Phase 1) — gained `NOTICE_CREATE/EDIT`, `EVENT_CREATE/EDIT` (`V13`). Restricted nav: Dashboard, Notices, Events, reusing the existing admin `ContentPage`.
- **Student** (`STUDENT` role, new — `V14`) — `WEBSITE_VIEW` only. Single read-only dashboard (notices/events/downloads), no create/edit UI at all.
- **Parent** (`PARENT` role, new — `V15`) — same `WEBSITE_VIEW`-only shape as Student, reuses the same dashboard content (`StudentDashboardPage`) with its own layout header.

The backend permission check is the real security boundary in every case, not the frontend nav — verified live for each role (allowed actions succeed, disallowed ones correctly 403). Test accounts: `teacher@demo.test` / `student@demo.test` / `parent@demo.test`, all `password123`.

## AI Site Generator (Phase 14, stubbed)

`POST /api/v1/ai/generate-site` `{schoolType?, location?, style?, primaryColor?}` (requires `PAGE_CREATE` + `THEME_EDIT`) creates Home, About, Academics, Admissions, Teachers, Facilities, Gallery, Events, News, and Contact pages using real registered components, plus a matching theme — idempotent (skips any page whose slug already exists, never overwrites). No LLM is called: `AiContentGenerator` is a `PaymentGateway`-style interface with `StubAiGenerator` as the only implementation (deterministic templates from the inputs), by explicit choice since no API key is available here — a real Claude/GPT-backed implementation drops in later behind the same interface. `school-admin`'s Pages screen gets a "Generate a starter site" panel.

## Super Admin App

The third planned frontend app, previously just a Phase 0 placeholder — now a real app mirroring `school-admin`'s auth/API patterns (Bearer token in memory, silent-refresh on load, `ApiError`). Login rejects any account without the `SUPER_ADMIN` global role (the backend still issues a token for a valid school-scoped login — this app just refuses to use it). Pages: Dashboard (school/plan counts), Schools (create, suspend/activate), Plans (create, activate/deactivate), platform-wide Audit Log.

## Development status

Phases 0–13 are complete: scaffolding, auth core, Super Admin school CRUD, School Admin shell, component registry + page JSON schema, website builder frontend, draft/publish + public renderer, theme engine, content modules, media library, SEO, custom domains, subscriptions/payments, and audit logs/observability. Backend: `mvn compile` passes. Frontend `school-admin` and `public-site`: `npx tsc -b` and `npx vite build` both pass.

**Phases 6 through 13 were additionally run live** against a real MySQL instance (not just compiled) — login, page create/edit/publish/unpublish, theme get/update, and the public renderer (Host-header tenant resolution, theme propagation, 404s for unknown hosts/unpublished content) were all exercised end-to-end via curl and the running frontend dev servers. This caught and fixed four real bugs invisible to compilation: `@EnableJpaAuditing` was never registered (timestamps never populated), the tenant filter never auto-assigned `school_id` on insert (only filtered reads), the generic 500 handler swallowed exceptions without server-side logging, and a public endpoint marked `readOnly = true` transitively wrote a default theme row (MySQL rejects writes inside a read-only transaction). See the architecture doc for the full phased roadmap; each phase is implemented incrementally on request.
