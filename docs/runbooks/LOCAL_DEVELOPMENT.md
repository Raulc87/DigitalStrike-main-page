# LOCAL_DEVELOPMENT — run and test the site on your machine

For developers and agents. Covers TECH_STACK §8.2 (US-016). Lead endpoint contract:
`docs/specs/LEAD_ENDPOINT_CONTRACT.md` (§8 variables, §9 mock).

## 1. Prerequisites

- **Node.js 22 LTS**, the version in `.nvmrc` (`node --version` prints `v22.x`). See §7 for
  Windows and macOS installs.
- **Git.** On Windows, use Git for Windows; it includes Git Bash, which this runbook's commands
  assume.
- Optional: **Google Chrome**, only for `npm run lhci` (Lighthouse).

No Google account, Python or server is needed. The lead form talks to a local mock of the Apps
Script endpoint.

## 2. Install

From the repository root:

```bash
npm ci
cp .env.example .env     # local values; .env is git-ignored, never commit it
```

`.env.example` lists every `PUBLIC_*` variable (contract §8). Its defaults work as they are: the
form posts to the mock at `http://127.0.0.1:8787/exec`. Never put the real Apps Script URL or any
secret into a committed file.

## 3. Run the site with the mock endpoint

Two terminals, both in the repository root:

| Terminal | Command | Serves |
|---|---|---|
| 1 — mock lead endpoint | `npm run mock:lead` | `http://127.0.0.1:8787/exec` (contract §9) |
| 2 — site | `npm run dev` | `http://localhost:4321/` → `/es/` or `/en/` |

The mock runs the real endpoint logic from `apps-script/lib`: validation, honeypot, minimum fill
time, throttles and idempotency. It keeps leads in memory and sends no email.
- **See stored leads:** open <http://127.0.0.1:8787/__leads> (they are lost when the mock stops).
- **Simulate a sheet failure:** start it with `MOCK_FAIL=storage npm run mock:lead`.
- **Other options:** `MOCK_PORT`, `MOCK_HOST`, `MOCK_MAX_LEADS_PER_EMAIL_PER_HOUR` / `_PER_HOUR` /
  `_PER_DAY`, `MOCK_LOG=1`. They are documented at the top of `scripts/mock-lead-endpoint.mjs`.
- **Rate limit while testing:** the mock applies the contract's limits. A 4th lead from the same
  email within an hour returns `rate_limited`, so use different emails or restart the mock.
- **Too-fast submissions look like success:** a lead sent less than 3 s after the page loaded is
  treated as a bot. It looks successful but is not stored.

Only test against the real Apps Script on purpose. To do so, put its `/exec` URL in your local
`.env` (never commit it), and mark the test rows `rejected` afterwards.

## 4. Checks (the same ones CI runs, `.github/workflows/ci.yml`)

```bash
npm run lint        # ESLint + Prettier       (CI check: lint)
npm run check       # astro check             (CI check: typecheck)
npm test            # Vitest: site + Apps Script logic + mock   (CI check: unit)
npm run build       # static build into dist/ (CI check: build, with the Pages base path)

npx playwright install chromium   # once per machine, or after a Playwright upgrade
npm run build && npm run test:e2e # e2e against `astro preview` (CI check: e2e)

npm run lhci        # Lighthouse, mobile, 3 runs on /es/ and /en/ (CI check: lighthouse)
```

Notes:
- e2e starts `astro preview` itself, and the specs start their own mocks. You don't need
  `npm run mock:lead` for e2e. Build first with the base path `/` (the default in `.env.example`).
- `npm run lhci` rebuilds `dist/` with the base path `/` and needs Chrome installed. Run
  `npm run build` again afterwards if you need the Pages base-path build.
- To see the Pages preview build locally, set the base path for **both** commands. `astro preview`
  reads it too, and an inline variable applies to one command only:
  ```bash
  PUBLIC_BASE_PATH=/DigitalStrike-main-page npm run build
  PUBLIC_BASE_PATH=/DigitalStrike-main-page npm run preview
  ```
  PowerShell: `$env:PUBLIC_BASE_PATH="/DigitalStrike-main-page"; npm run build; npm run preview`.
  Then open <http://localhost:4321/DigitalStrike-main-page/es/>. Close that terminal afterwards
  (PowerShell keeps the variable), or the next `npm run dev` also uses the base path.
- Formatting: `npx prettier --write <files>` fixes what `npm run lint` reports.

## 5. Ports

| Port | Used by | Change it with |
|---|---|---|
| 4321 | `npm run dev`, `npm run preview`, e2e | `npm run dev -- --port 4322`; for e2e `PREVIEW_PORT=4322` |
| 8787 | `npm run mock:lead` | `MOCK_PORT=8788 npm run mock:lead`, and the same URL in `.env` `PUBLIC_LEAD_ENDPOINT_URL` |

"Address already in use" (`EADDRINUSE`): something else holds the port, often a dev server or mock
left running in another terminal. Find and stop it:
- **macOS / Linux:** `lsof -i :4321`, then `kill <PID>`.
- **Windows (PowerShell):** `netstat -ano | findstr :4321`, then `taskkill /PID <PID> /F`.

## 6. Troubleshooting

| Symptom | Likely cause |
|---|---|
| The form shows "No pudimos enviar tu mensaje…" right away | The mock is not running, or `.env` points to another port; restart `npm run dev` after editing `.env` |
| The form says "¡Recibido!" but `/__leads` is empty | The submit came less than 3 s after the page loaded (fill-time decoy), or the honeypot was filled |
| The form shows the rate-limit message ("En este momento no podemos recibir más mensajes…") | The mock's throttles (§3); restart the mock |
| The browser console shows a CORS error on the lead POST | The request is not a "simple request" (contract §2): it must be `text/plain` with no custom headers. The mock refuses preflights, like Apps Script |
| `npm ci` prints an `EBADENGINE` warning | Your Node 22 patch version is older than a dependency wants; harmless, or update Node 22 |
| `npm run lint` fails on every file on Windows | Line endings: see §7 (Windows) |
| `npm run lhci` says Chrome is not found | Install Google Chrome, or set `CHROME_PATH` to a Chrome/Chromium binary |

## 7. Platform notes

### Windows
- **Node 22:** `winget install OpenJS.NodeJS.LTS`, or `nvm-windows` (`nvm install 22`,
  `nvm use 22`). Open a new terminal and check `node --version`.
- **Shell:** run this runbook's commands in **Git Bash**. In PowerShell, inline variables such as
  `MOCK_FAIL=storage npm run mock:lead` become `$env:MOCK_FAIL="storage"; npm run mock:lead`.
- **PowerShell blocks `npm`** ("running scripts is disabled"): run
  `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once. It needs no admin rights.
- **OneDrive file locks:** if the repository is inside a folder OneDrive syncs (`Documents`,
  `Desktop` on many PCs), `npm ci` or `npx playwright install` can fail with intermittent
  `EPERM`/`EBUSY` errors that succeed on retry.
  - Best fix: clone outside OneDrive, e.g. `C:\dev\DigitalStrike-main-page`.
  - Otherwise, mark the folder "Always keep on this device", or pause syncing while installing.
- **Line endings:** the repository uses LF and Prettier checks it. If Git converts files to CRLF,
  `npm run lint` fails everywhere. Before cloning, run `git config --global core.autocrlf input`
  (or `false`). If you already cloned, run it and then `git checkout -- .` (on a clean tree).

### macOS
- **Node 22:** `brew install node@22`, then add it to `PATH` in `~/.zshrc` and open a new terminal:
  ```bash
  export PATH="$(brew --prefix node@22)/bin:$PATH"
  ```
  Or use `nvm install 22`. Check `node --version`.
- **Homebrew "Permission denied":** run `brew doctor` and fix only the paths it lists. Never run
  `brew install` with `sudo`.
