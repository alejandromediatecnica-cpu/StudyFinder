# AGENTS.md

Two independent apps, no orchestrator. There is no root `package.json`, no Makefile, no CI, and the root `README.md` is empty — every command below must be run from inside its subdirectory.

- `backend/` — FastAPI, persistence en MongoDB Atlas (pymongo) vía `backend/.env`; tests con mongomock.
- `front/studyfinderFront/` — Angular 22, standalone components, signals, SSR + prerender.

Everything user-facing is Spanish: UI copy, comments, and commit messages. Keep it that way.

## Commands

```powershell
# backend (must be run from `backend/` so the `app.` package resolves)
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8000        # http://localhost:8000, docs at /docs

# backend tests (needs `pip install -r requirements-dev.txt`; pytest is NOT in requirements.txt)
python -m pytest                                   # 113 tests in backend/tests, all green

# frontend
cd front/studyfinderFront
npm install
npm start                                          # ng serve -> http://localhost:4200
npm run build                                      # production + SSR, default config
npm run serve:ssr:studyfinderFront                 # serves dist/ on PORT (default 4000)
```

Run the two dev servers concurrently; the frontend is useless without the backend.

## Ports and wiring are hardcoded — there is no config layer

- The API base URL is a literal `http://localhost:8000` in `src/app/services/auth.service.ts:20`, `search.service.ts:9`, and `document.service.ts:16`. There are no `environment*.ts` files and no `proxyConfig` in `angular.json`.
- Backend CORS origins come from the `CORS_ORIGINS` env var (comma-separated, default `http://localhost:4200,http://127.0.0.1:4200`) read in `backend/app/config.py` and applied in `backend/app/main.py`. `config.py` also reads `MONGODB_URL`, `MONGODB_DATABASE` and `PORT` (all with sensible defaults) and calls `load_dotenv(BASE_DIR / ".env")`, so `backend/.env` works no matter the CWD and Render can inject the same keys. See `backend/.env.example` and the root `render.yaml` blueprint.
- Change either port and you must update the other side by hand, or nothing works.

## Verification: `npm test` works — run BOTH `npm test` and `npm run build`

`npm test` was originally broken because every `*.spec.ts` imported a class name without the `Component` suffix (renamed components). That was fixed; today the suite is **274 tests in 24 files, all green**, run by Vitest via the `@angular/build:unit-test` builder (jsdom, zoneless — no `zone.js`).

- Test wiring lives in `front/studyfinderFront/angular.json` (`test` target), `tsconfig.spec.json`, and `src/test-setup.ts` (clears `localStorage`, stubs `confirm` and the Object-URL API between tests). Run a subset with `npx ng test --include "src/app/app/pages/login/login.spec.ts"`.
- Test conventions: services are tested through `HttpTestingController` against the real hardcoded URLs; `urlWithParams`/query-string matches must include the full URL. Component specs mount the standalone component directly and rely on the shared mocks.
- Pitfalls seen in this repo's tests: `#<ref>` inside `<input>` is a template reference variable, **not** an `id` attribute, so query it by `input[type="file"]`; jsdom has no `DataTransfer` (inject `files` with `Object.defineProperty`) and no anchor navigation (spy on `HTMLAnchorElement.prototype.click`); `createComponent` schedules `ngOnInit` on a later macrotask, so call `fixture.detectChanges()` explicitly instead of waiting on `whenStable()`; `vi.useFakeTimers()` + `await vi.advanceTimersByTimeAsync(...)` for rxjs `timeout(...)` paths — and for rxjs `debounceTime(...)` install the fake timers **before** emitting the value, or the timer is scheduled in real-time space and never advances.
- To verify frontend work, run `npm run build` (typechecks + AOT-compiles + prerenders 11 routes) **and** `npm test`.
- `npm test` produces `anyComponentStyle` budget warnings for `landing/layout/materias/tareas/calendario/library/main` CSS exceeding 4kB. Non-fatal and expected — don't "fix" them by shrinking styles.
- No ESLint and no `format` script exist. Prettier config is only declarative: `printWidth: 100`, single quotes, 2-space indent, angular parser for HTML.

## Backend data layer

- Persistence is **MongoDB Atlas** via `pymongo`, and the connection is read from `backend/.env` (`MONGODB_URL`, `MONGODB_DATABASE`) by `app/config.py`. `backend/.env` is gitignored; `.env.example` has the placeholder pattern. There is **no migration tool** for schema — Mongo has no fixed schema; the only schema is the unique index on `users.email` and the unique compound index on `materia_documents`, both created by `initialize_database()` (at import and again on FastAPI startup).
- `app/database.py` exposes a Mongo-shaped API: `users_collection`, `sessions_collection`, `documents_collection`, `materia_documents_collection`, plus helpers `create_session`, `user_id_for_token`, `revoke_session`, `create_document`, `list_documents`, `get_document`, `get_document_by_id`, `total_storage_for_user`, `list_documents_from_others`, `associate_document`, `remove_document_association`, `delete_document`, and `UPLOADS_PATH`. Cascade of document deletion onto `materia_documents` lives in `delete_document` (no DB-level cascade).
- Library is shared between users: `list_documents_from_others(user_id)` returns documents uploaded by the rest with the owner's name/email (route `GET /documents/public`), and downloads work for any authenticated user. `associate_document` no longer checks ownership, so anyone can assign any document to their own materias — the filter `list_documents(user_id, materia)` therefore matches by `id` only, not by owner. Deletion stays owner-scoped.
- Storage quota is **3 MB per user** (`MAX_STORAGE_PER_USER` in `app/api/documents.py`): `POST /documents` returns **413** when the sum of the user's file sizes would exceed it. Files are still stored on disk under `backend/uploads/<user_id>/<uuid><ext>` — Mongo only stores metadata. Migrating legacy SQLite data: `python -m scripts.migrate_sqlite_to_mongo` (idempotent, preserves user `_id`s).
- `backend/tests/` runs against **`mongomock`** (in-memory), not real Atlas: `tests/conftest.py` sets `MONGODB_URL`/`MONGODB_DATABASE` to local values, swaps `pymongo.MongoClient` for `mongomock.MongoClient` **before** importing the app, and empties the shared mock collections in the `db` fixture for per-test isolation.
- `backend/app/static/index.html` is dead code: `main.py` never mounts `StaticFiles`.
- `backend/app/schemas/search_response.py` and `backend/app/models/document.py` are unused, and `search_response.py` has a broken import (`from models.document`, not `app.models.document`). Nothing imports them, so the app boots — don't fix speculatively.
- `backend/app/main.py` uses the deprecated `@app.on_event("startup")`; the test suite relies on `initialize_database()` running at import and on FastAPI startup. `backend/tests/conftest.py` redirects `DATABASE_PATH`/`UPLOADS_PATH` to temp dirs before importing the app, and `backend/tests/test_documents.py` also patches `app.api.documents.UPLOADS_PATH` because that module captures the value at import time.

## Auth model

- Opaque bearer tokens: `auth_sessions` collection, token minted on signup/login, never expires. Frontend stores it in `localStorage` under `studyfinder_token` / `studyfinder_user`.
- **IDs legacy**: la migración SQLite dejó `users._id` como enteros (1..4) y `auth_sessions.user_id` como su string (`"3"`). Nunca hagas `ObjectId(user_id)` directo: usa `database.id_query(...)`, que devuelve ObjectId si es válido, si no el entero, y si no el valor tal cual, para comparar contra `_id`. Está aplicado en `deps.py` y en `api/contacts.py`; `api/messages.py` valida el destinatario buscándolo con `id_query`.
- `GET /search` is **unauthenticated**. `/documents/*` and `/auth/logout` require `Authorization: Bearer <token>` and are scoped to the token's `user_id` (cascade of associations on delete lives in `delete_document`, since Mongo has no FK). Deleting a document is owner-only; reading/downloading/assigning is open to any `Bearer` holder.
- Uploads land in `backend/uploads/<user_id>/<uuid><ext>`; 25 MB per-file cap and a 3 MB per-user storage quota; only pdf/doc/docx/ppt/pptx/xls/xlsx.

## Mensajería (chat entre usuarios)

- Los contactos se agregan **por nombre**: `GET /users/search?nombre=<texto>` (`app/api/users.py`) devuelve hasta 20 usuarios cuyo `name` coincide de forma parcial e insensible a mayúsculas (`$regex` con `re.escape`, excluye al propio usuario; con menos de 2 caracteres devuelve `[]`). No hay códigos ni emails como identificador público: el usuario elige de esa lista y `POST /contacts/requests` recibe `{"usuario_id": "<id>"}`.
- Colecciones `contacts` y `messages` (`app/database.py`, creadas sin índice especial). Un contacto es un documento con `a_id`/`b_id` normalizados por orden (`_norm_id`), `emisor_id`/`receptor_id` y `estado` `pendiente|aceptado|rechazado`. Rutas en `app/api/contacts.py` (`/contacts/requests`, `/requests/incoming`, `/requests/outgoing`, `/requests/{id}/accept|reject`, `GET /contacts/`). Los pagos de emisor/receptor/otro exponen `name` y `email` (ya no `codigo`).
- Rutas en `app/api/messages.py`: `GET /messages/{otro_id}` (historial `conversacion_id` = ids ordenados unidos por `|`, `limit` 1..100, `before` para paginar) y `POST /messages/{otro_id}` (FormData `texto` + `archivo` opcional, ≤3 MB, guardado en `uploads/<user_id>/<token>.<ext>`). Los endpoints de descarga viven en `app/api/messages_files.py`.
- **Regla dura**: solo contactos `aceptado` pueden leer o enviar mensajes (`_ensure_contact`, si no → 403). El tester `backend/tests/test_chat.py` cubre perfil/búsqueda por nombre, solicitudes y mensajes (texto, archivos y límite); `conftest._COLLECTIONS` vacía también `contacts` y `messages`.
- Frontend: `src/app/services/messages.service.ts` (métodos `getMe`, `search`, `contacts`, `incoming`, `outgoing`, `sendRequest`, `accept`, `reject`, `messages`, `send`, `attachmentUrl`) y `pages/mensajes` (componente con **signals** porque todo llega por `subscribe`; busca por nombre y muestra los resultados con botón "Agregar").

## Frontend gotchas

- Pages live at `src/app/app/pages/**` — a **double `app/`**. Services live one level up at `src/app/services/**`, imported as `'../../../services/...'`. This looks like a mistake but is the current structure; flattening it means rewriting every import.
- Auth is `localStorage`-only and SSR prerenders `**` (`app.routes.server.ts`), so server-side rendering always treats the user as logged out. Guard any browser-only API (`window.*`, `localStorage.*` reads outside the existing `typeof localStorage === 'undefined'` guards).
- There is **no `zone.js`** and no `provideZonelessChangeDetection`, so the app runs in Angular's zoneless mode: plain class-field mutations made inside async callbacks (e.g. `subscribe({ error: ... })`) never re-render the template. State that changes asynchronously and appears in the template must be a `signal()` (e.g. `LoginComponent`, `SignupComponent`, `LayoutComponent`, `UploadComponent`, `LibraryComponent` and `MensajesComponent`). `ChangeDetectorRef` is not used anywhere yet. Rule of thumb: if a value is set inside a `subscribe` callback, make it a signal.
- `src/app/app/pages/materias/materias.ts` encodes the built-in materias as IDs `1..6`; user-created ones get `1000 + index`, and deletions are tracked in `deletedMateriaIds` in `StudyDataService`. Changing the built-in list breaks that ID arithmetic.
- `src/app/services/study-data.service.ts` is a `localStorage` shim (searches, saved docs, stats, materias, **tasks and calendar events**) — it is the only "state" for most pages, and is namespaced per user ID.
- Tareas and Calendario share state through that service (there is **no MongoDB backend for tasks/events**; they are per-browser `localStorage`). `addTask`/`updateTask` call the private `sincronizaEventoDeTarea`, which creates, moves or deletes the linked `CalendarEvent` (matched by `taskId`), so a task with a `dueDate` always shows up in Calendario exactly once and `removeTask` takes its event with it. Don't re-create the event in the page: the service owns that invariant.
- `Task.documents: TaskDocument[]` is the only place attachments live — **several documents per task** are allowed, and the array is copied wholesale into the linked `CalendarEvent`. There is no singular `documentId`/`documentName` any more; don't reintroduce it.
- `MainComponent` (`pages/main`) has no hardcoded data: `urgentTask`/`upcomingTasks`/`recentlyCompleted` are `computed()` over the same `StudyDataService.getTasks()`, so completing a task from the dashboard moves it to Tareas → Completadas. Urgency order = overdue first, then nearest `dueDate`/`dueTime`; undated tasks sort last. `upcomingTasks` **excludes the urgent task** (it is already shown in the big card) and caps at 4; keep code and `main.spec.ts` in sync if you change that. The dashboard's "Completado" button is only a `toggleTask`, no percentage progress.
- `src/app/app/components/date-picker.ts` and `styled-select.ts` replace the native `<input type="date">`/`<select>`, which ignore the dark theme. Both are `model()`-based so they work with `[(ngModel)]` like a plain input, close on outside click via `HostListener`, and are the components to reuse for any new date/dropdown field.
- `Task.status` is stored but the board column is derived by `TareasComponent.statusActual` from `completed` + `dueDate` (completed → Completadas, no date → Pendientes, due today or earlier → Hoy, within 7 days → Esta semana, later → Pendientes). Task filtering is accent-insensitive via `sinAcentos()`.
- Global design tokens are CSS custom properties in `src/styles.css` (`--primary`, `--surface`, `--border`, `--radius-md`, ...). Page CSS consumes those; there is no component library or theme file. Solo existe tema oscuro (no hay bloque `:root[data-theme='light']`); `ThemeService` (`services/theme.service.ts`) gestiona la clave `studyfinder_theme`.
- Some UI is intentionally decorative: the Configuración page and the Study AI chat have no backend and are not wired up. Don't implement them; they were deliberately left as-is to keep the scope to real bugs. The login/signup timeout error copy no longer mentions MongoDB, and `index.html` has `lang="es"`.
- `front.zip` at the repo root is a committed snapshot of the frontend, not a build input. Editing or "refreshing" it does nothing to the running app.

## Git

Default branch is `develop` (`origin/HEAD` points at `main`; there is also `release` and several stale `feature/*` branches). Commits are short and Spanish, e.g. `Corrige busqueda reactiva y activa materias`. No PR template, no hooks, no CI checks to satisfy.

