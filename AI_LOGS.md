# AI Development Logs

## Purpose

This file records factual AI-assisted development activity only. It does not
invent unavailable conversation history, credentials, timestamps, or results.

## AI Tool

- GitHub Copilot in VS Code
- Linux dev container at `/workspaces/habit_tracker`

## Development Timeline

### Entry 1 - Repository Audit

#### Prompt

The user requested Part 1: inspect the repository and plan the MERN application
without implementing the complete application.

Exact prompt transcript was not available to the development environment; this
entry records the factual development activity.

#### AI Action

Inspected the initial repository and found only `README.md` and Git metadata.
Created the initial planning documentation.

#### Files Created

- `REASONING.md`
- `AI_LOGS.md`

#### Files Modified

- `README.md`

#### Technical Decisions

- Use MongoDB, Express, React, Node.js, Mongoose, REST, and JavaScript.
- Defer implementation until later parts.

#### Commands / Tests

- Repository file and directory listing commands.
- Git status and latest commit inspection.
- Documentation section validation with `grep`.
- `git diff --check`.

#### Verification

The repository audit confirmed there was no existing application code.

#### Issues

`rg` was unavailable in the container during one validation attempt.

#### Fixes

Used the available `grep` command for the equivalent validation.

#### Result

Part 1 planning documentation was created without application code.

### Entry 2 - MongoDB & Express Backend

#### Prompt

The user requested Part 2: implement the MongoDB/Mongoose layer and Express
backend for habits and completions, including validation, search,
archive/restore, today's habits, tests, and documentation updates. The React UI
and complete streak engine were deferred.

Exact prompt transcript was not available to the development environment; this
entry records the factual development activity.

#### AI Action

Created the Node/Express backend, MongoDB connection module, Mongoose models,
date/schedule utility, controllers, services, routes, centralized middleware,
environment template, and integration tests.

#### Files Created

- `package.json`, `package-lock.json`, `.env.example`, `.gitignore`
- `server/src/config/database.js`
- `server/src/models/Habit.js`, `server/src/models/Completion.js`
- `server/src/utils/date.js`
- `server/src/middleware/asyncHandler.js`, `errors.js`, `validation.js`
- `server/src/services/habitService.js`, `completionService.js`
- `server/src/controllers/habitController.js`, `completionController.js`
- `server/src/routes/habitRoutes.js`, `completionRoutes.js`, `todayRoutes.js`
- `server/src/app.js`, `server/src/server.js`
- `server/test/api.test.js`

#### Files Modified

- `README.md`
- `REASONING.md`
- `AI_LOGS.md`

#### Technical Decisions

- Preserve completion records through soft archive.
- Store local calendar dates as `YYYY-MM-DD` keys.
- Enforce one completion per habit/date with a unique compound index.
- Use idempotent completion upserts.
- Reuse one schedule applicability utility.

#### Commands / Tests

- `npm install`
- Backend `node --check` commands.
- `npm install --save-dev mongodb-memory-server`
- `npm test`
- Focused completion date regex checks.
- `git diff --check`.

#### Verification

Static checks passed. The MongoDB-backed integration suite could not complete
because no local `mongod` was installed and the memory server could not
provision its binary in the environment.

#### Issues

The first completion date regex was over-escaped.

#### Fixes

Corrected the regex and confirmed valid date keys matched.

#### Result

The backend implementation was added; MongoDB-backed verification remained
blocked by the environment.

### Entry 3 - Streak Engine & Testing

#### Prompt

The user requested Part 3: implement reliable current and best-ever streak
calculations using scheduled-day semantics, integrate them with the existing
completion API, add deterministic tests, and update documentation.

Exact prompt transcript was not available to the development environment; this
entry records the factual development activity.

#### AI Action

Added a dedicated streak service, integrated the streak endpoint into the
existing completion route, added date-key shifting, and created deterministic
unit and API tests.

#### Files Created

- `server/src/services/streakService.js`
- `server/test/streakService.test.js`

#### Files Modified

- `server/src/utils/date.js`
- `server/src/services/completionService.js`
- `server/src/controllers/completionController.js`
- `server/src/routes/completionRoutes.js`
- `server/test/api.test.js`
- `README.md`
- `REASONING.md`
- `AI_LOGS.md`

#### Technical Decisions

- Use `isScheduledDate` as the sole scheduling source of truth.
- Skip weekends for weekday streaks.
- Keep the backend authoritative for streaks.
- Collapse duplicate completion dates in the pure calculation service.

#### Commands / Tests

- `node --test server/test/streakService.test.js`
- Bounded `npm test` execution.
- Backend syntax checks and `git diff --check`.

#### Verification

After fixing weekend traversal, all 12 deterministic streak tests passed. The
full suite remained blocked by the MongoDB test environment.

#### Issues

Current weekday streak traversal initially stopped at Sunday instead of
skipping the weekend.

#### Fixes

Changed backward traversal to skip all non-scheduled dates.

#### Result

Current and best-ever streaks were implemented and exposed through the backend.

### Entry 4 - Frontend Dashboard & Morning Reminder

#### Prompt

The user requested Part 4: build the React dashboard around today's habits,
completion, backend-provided streaks, progress, morning reminder, and
responsive loading/error/empty states while preserving the backend.

Exact prompt transcript was not available to the development environment; this
entry records the factual development activity.

#### AI Action

Added a Vite React client with Today and Habit Library views, shared API
service, completion controls, streak display, progress indicator, responsive
styles, and a dismissible local morning reminder.

#### Files Created

- `index.html`, `vite.config.js`
- `client/src/main.jsx`, `client/src/App.jsx`, `client/src/api.js`
- `client/src/styles.css`
- `client/src/components/HabitCard.jsx`
- `client/src/components/MorningReminder.jsx`

#### Files Modified

- `package.json`, `package-lock.json`
- `README.md`, `REASONING.md`, `AI_LOGS.md`

#### Technical Decisions

- Use Vite and React Router.
- Consume backend today, completion, and streak APIs without duplicating logic.
- Store reminder dismissal locally because no server reminder model exists.

#### Commands / Tests

- React/Vite dependency installation commands.
- `npm install lucide-react`
- `npm run client:build`
- `npm run client:dev`
- `curl -fsS http://localhost:5173/ | head -20`

#### Verification

The production build passed and Vite served the frontend HTML. Proxy requests
logged connection refused because the backend was not running.

#### Issues

The reminder initially used a UTC date key while the dashboard used local dates.

#### Fixes

Changed reminder dismissal to use the browser's local calendar date.

#### Result

The React dashboard was implemented, but full-stack communication still
requires a configured and reachable MongoDB instance.

### Entry 5 - End-to-End Readiness Fixes

#### Prompt

The user requested an end-to-end readiness pass: inspect the current project,
fix startup and environment setup, verify backend/frontend communication where
possible, synchronize documentation, and record this interaction accurately.

#### AI Action

Audited the current repository and found a credential-bearing `.env.example`.
Replaced it with a safe placeholder, added explicit backend scripts, verified
`.env` is ignored, tested the missing-configuration startup guard, updated the
README and reasoning, removed an unused import, and rewrote this log in
chronological order.

#### Files Created

- None.

#### Files Modified

- `.env.example`
- `package.json`
- `.gitignore`
- `README.md`
- `REASONING.md`
- `AI_LOGS.md`
- `client/src/App.jsx`

#### Technical Decisions

- Never place MongoDB credentials in repository files.
- Use `npm run server:start` and `npm run server:dev` as explicit backend
  commands.
- Keep relative frontend `/api` URLs with Vite's port-5000 proxy.
- Report MongoDB-backed verification as blocked when no database is available.

#### Commands / Tests

- Repository and source inspection commands.
- Credential and environment scans with `grep`.
- `git diff --check`.
- `env -u MONGODB_URI PORT=5050 npm run server:start`.
- `command -v mongod`, `pgrep -af mongod`, `.env` and Git ignore checks.
- `MONGODB_URI=mongodb://127.0.0.1:27017/ananyas_75_day_challenge MONGODB_SERVER_SELECTION_TIMEOUT_MS=1000 npm run server:start`.
- `npm run client:build` was previously run during this interaction's active
  frontend state and passed.

#### Verification

The backend startup guard exited with status 1 and the message
Unable to start server: MONGODB_URI is not configured`, which is the expected
result without `.env`. With an unreachable local URI, startup now failed
promptly with `connect ECONNREFUSED 127.0.0.1:27017`. No local `mongod` or
`.env` was available. No real MongoDB-backed API request was claimed as passed.

#### Issues

The user-modified `.env.example` contained a real MongoDB credential. An
unreachable MongoDB URI also used to wait on Mongoose's long default timeout.

#### Fixes

Replaced the credential with `MONGODB_URI=your_mongodb_connection_string` and
confirmed no credential string remained in project source or documentation.
Added the configurable `MONGODB_SERVER_SELECTION_TIMEOUT_MS` connection timeout
and verified the clear connection-refused error.

#### Result

The project has a safe, documented end-to-end run workflow. Full backend and
frontend API communication remains unverified until the developer supplies a
reachable MongoDB connection string.

### Entry 6 - Express Startup Export Fix

#### User Prompt

The user reported `Unable to start server: app.listen is not a function` and
requested inspection and correction of the existing Express app/server wiring,
without rewriting the project or creating duplicate applications. The user
also required verification of MongoDB configuration, APIs, frontend proxy, and
the three living documentation files.

#### AI Action

Inspected `server/src/app.js`, `server/src/server.js`, the CommonJS module
markers, package scripts, `.env.example`, `.gitignore`, frontend API service,
and current running processes. Identified that `app.js` exported the factory
function while `server.js` called `.listen()` on it. Changed `app.js` to export
the one configured Express instance and replaced the credential-bearing
`.env.example` with the safe placeholder. Added this factual log entry and
updated the README and reasoning documents.

#### Files Created

- None.

#### Files Modified

- `server/src/app.js`
- `.env.example`
- `README.md`
- `REASONING.md`
- `AI_LOGS.md`

#### Files Deleted

- None.

#### Technical Decisions

- Preserve CommonJS and the existing `createApp` setup.
- Export `createApp()` once rather than creating a second Express app.
- Keep `server.js` responsible for environment loading, MongoDB connection,
  and `app.listen`.
- Keep MongoDB credentials out of `.env.example` and tracked documentation.

#### Commands

- Repository/module inspection commands using `read_file`, `find`, `grep`, and
  Git status.
- `node --check server/src/app.js && node --check server/src/server.js`
- Node assertion confirming `typeof require('./server/src/app').listen` is
  `function`.
- `npm run server:dev`.
- `curl` health and habits requests on port 5000.
- End-to-end curl flow covering create, search, update, today, completion,
  history, streak, archive, and restore.
- `npm run client:dev`.
- `curl` proxy health requests on ports 5173 and 5174.
- `PORT=5001 npm run server:start`.
- `curl -fsS -i http://localhost:5001/api/health`.
- `node --test server/test/streakService.test.js`.
- `npm run client:build`.
- `node --check server/src/app.js && node --check server/src/server.js && git diff --check`.
- `git diff --check`.

#### Tests / Verification

- The live backend returned 200 for `/api/health` and `/api/habits`.
- The live MongoDB-backed flow successfully created, searched, updated,
  completed, inspected history/streak, archived, and restored a habit.
- Vite proxy requests returned the backend health response on both frontend
  ports.
- Startup of a second backend process reached `app.listen` and correctly
  reported `EADDRINUSE` because port 5000 was already occupied by the verified
  backend process.
- A fresh backend instance on port 5001 printed `API listening on port 5001`,
  and its health route returned 200.
- All 12 deterministic streak tests passed and the frontend production build
  passed.

#### Error

`Unable to start server: app.listen is not a function`

#### Root Cause

`app.js` exported a factory function instead of the configured Express app
instance.

#### Fix

Exported `createApp()` from `app.js`, preserving the existing routes and
middleware.

#### Result

The reported `app.listen` error is fixed. Backend and frontend proxy flows were
verified against the configured running environment.

#### Remaining Issues

Port 5000 and 5173 were already occupied during verification. The documented
commands work when those existing processes are reused or stopped first.

### Entry 7 - Interviewer Runbook Documentation

#### User Prompt

The user requested a README update so an interviewer can run the project from a
fresh GitHub Codespace or clone. The request required inspecting actual package
scripts, documenting environment variables without exposing MongoDB
credentials, explaining forwarded ports, adding a quick start, common errors,
testing/build commands, and updating REASONING.md and AI_LOGS.md factually.

#### AI Action

Inspected the root package scripts and current README, reasoning, and log files.
Added a visible `How to Run` section near the README top with installation,
`.env`, backend/frontend commands, Codespaces ports, quick start, common errors,
tests, build, preview, and direct syntax-check commands. Added the documentation
decision to REASONING.md and this chronological log entry.

#### Files Created

- None.

#### Files Modified

- `README.md`
- `REASONING.md`
- `AI_LOGS.md`

#### Files Deleted

- None.

#### Technical Decisions

- Document only scripts present in the root `package.json`.
- Identify port `5173` as the interviewer-facing frontend and port `5000` as
  the backend/proxy target.
- Require a user-provided `MONGODB_URI` and never document a real credential.
- Include direct Node syntax checks because no backend lint script exists.

#### Commands

- Package manifest and documentation inspection commands.
- `node -e 'const scripts=require("./package.json").scripts; ...'` to verify
  every documented npm script exists.
- `git diff --check`.
- `node --check server/src/app.js && node --check server/src/server.js`.
- `node --test server/test/streakService.test.js`.
- `npm run client:build`.

#### Tests / Verification

- Confirmed the documented npm scripts exist in `package.json`.
- Confirmed with the corrected command that all six documented npm scripts
  exist.
- The deterministic streak suite passed all 12 tests, the frontend build
  passed, syntax checks passed, and `git diff --check` passed.

#### Issues

- One shell command used to inspect package manifests had a quoting error; the
  package file was already directly inspected and the documented scripts were
  confirmed from it.
- The first script-verification command triggered Bash history expansion because
  it contained `!scripts[name]`; it was rerun with safe single-quote handling.

#### Fixes

- Added only verified commands and corrected the documentation workflow.

#### Result

README.md now contains an interviewer-focused, Codespaces-ready runbook that
matches the current package scripts and backend/frontend ports.

#### Remaining Issues

Full application use still requires the interviewer to provide a reachable
MongoDB connection string in the ignored `.env` file.
