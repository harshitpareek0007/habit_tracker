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
- `server/test/schedule.test.js`

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
- `node --test server/test/schedule.test.js server/test/streakService.test.js`
- Live `curl` verification of a `specificDays` habit on Monday versus Tuesday,
  followed by archiving temporary verification records.
- `timeout 20s npm test; status=$?; printf 'full_test_exit=%s\\n' "$status"; pkill -f '[n]ode --test' || true; pkill -f '[n]pm test' || true`.
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

- `server/test/schedule.test.js`

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

### Entry 8 - Current Date, Specific Frequencies & Profile Name

#### User Prompt

The user requested fixes for dynamic local date behavior, Every day and
Specific days frequency selection, today's scheduling, streak and reminder
consistency, completion refresh behavior, tests, documentation, and a simple
persistent editable profile name without adding authentication or changing the
75-day challenge.

#### AI Action

Inspected the existing Habit model, date utility, habit/completion/streak
services, dashboard, and reminder. Extended the existing Habit frequency model
with `specificDays` and a `weekdays` array, threaded it through today,
completion, and streak paths, added weekday controls and edit mode to the
existing Habit Library, made the dashboard detect local date rollover, and
added local-storage profile-name editing.

#### Files Created

- None.

#### Files Modified

- `server/src/models/Habit.js`
- `server/src/controllers/habitController.js`
- `server/src/utils/date.js`
- `server/src/services/habitService.js`
- `server/src/services/completionService.js`
- `server/src/services/streakService.js`
- `server/test/streakService.test.js`
- `client/src/api.js`
- `client/src/App.jsx`
- `client/src/styles.css`
- `README.md`
- `REASONING.md`
- `AI_LOGS.md`

#### Technical Decisions

- Preserve legacy `weekdays` frequency behavior for existing data.
- Represent custom schedules with `frequency: "specificDays"` and numeric
  `weekdays` in the existing Habit document.
- Keep `isScheduledDate` as the single scheduling source of truth.
- Use a local date key and periodic rollover check for dashboard data.
- Persist the profile name locally because no profile/account model exists.

#### Commands / Tests

- `node --test server/test/streakService.test.js`
- `node --test server/test/schedule.test.js server/test/streakService.test.js`
- `npm run client:build`
- Backend `node --check` commands for changed server files.
- `git diff --check`.

#### Verification

- All 14 focused streak/schedule tests passed.
- The combined schedule and streak run passed all 17 tests.
- The live API included a Monday/Wednesday/Friday habit on Monday and excluded
  it on Tuesday; temporary verification records were archived afterward.
- The complete test command passed all 28 tests with exit code 0.
- Frontend production build passed.
- Changed backend files passed syntax checks.
- Profile name and reminder state remain frontend-local concerns and do not
  alter backend habit, completion, streak, schedule, or 75-day data.

#### Issues / Fixes

- The former form only offered daily and Monday-Friday frequencies; it now
  supports Every day and selectable individual weekdays.
- The former dashboard date was computed only during render; it now detects a
  local date-key change and reloads today-bound data.
- Added edit support using the existing PATCH API rather than another route.
- The first live API assertion command had unsafe shell quoting and failed with
  `TypeError: Assignment to constant variable`; the assertion was rerun with a
  heredoc and passed.

#### Result

Current-date behavior, custom scheduling, streak scheduling, reminder inputs,
completion refresh, habit editing, and local profile-name persistence are
implemented without changing the 75-day challenge duration.

#### Remaining Issues

The full MongoDB-backed API suite still depends on the configured database;
deterministic schedule/streak tests and the frontend build passed in this step.

### Entry 10 - Profile Duration and Historical Activity

#### User Prompt

The user requested a dark-themed Profile page, persistent editable challenge
duration with a 75-day default, a History navigation/page using existing
Completion records, archived-history visibility, date navigation, schedule-aware
misses, and synchronized documentation/tests without duplicate systems.

#### AI Action

Inspected the existing Profile route, App state, backend routes/services, date
utility, models, and tests. Added challenge-duration local persistence and
Profile controls, added History navigation and view, created the backend
history endpoint using existing Habit/Completion/scheduling logic, applied dark
Profile styling, and added API coverage for archived and future history.

#### Files Created

- `server/src/routes/historyRoutes.js`

#### Files Modified

- `server/src/services/habitService.js`
- `server/src/controllers/habitController.js`
- `server/src/app.js`
- `server/test/api.test.js`
- `client/src/api.js`
- `client/src/App.jsx`
- `client/src/styles.css`
- `README.md`
- `REASONING.md`
- `AI_LOGS.md`

#### Technical Decisions

- Keep profile name and challenge duration in the existing local-storage
  persistence approach because there is no user/account model.
- Keep 75 days as the default and make duration changes presentation/configuration
  only; no habit, completion, archive, or streak records are changed.
- Implement history as one backend read endpoint over existing collections.
- Query all habits for history so archived habits remain visible, but apply the
  shared scheduling utility so non-scheduled days are not misses.
- Return explicit future history state instead of fabricated rows.
- Use the existing dark theme tokens for Profile forms.

#### Commands / Tests

- `npm run client:build`
- `node --check server/src/services/habitService.js`
- `node --check server/src/controllers/habitController.js`
- `node --check server/src/routes/historyRoutes.js`
- `node --check server/src/app.js`
- `node --test server/test/schedule.test.js server/test/streakService.test.js`
- `npm test`
- `git diff --check`

#### Verification

- Complete backend suite passed all 29 tests.
- History API test verified archived completed history remains visible and an
  unscheduled habit is excluded.
- Future history returns an explicit future state.
- Frontend production build passed.
- Editor diagnostics reported no errors in changed files.

#### Issues / Fixes

- The existing app had no history endpoint; added one route using existing
  models and the shared schedule utility rather than a second completion system.
- The prior test count/documentation was updated from 28 to 29.
- Added a safe 75-day fallback when the local challenge-duration value is
  malformed.

#### Result

Profile duration persistence, dark Profile presentation, History navigation,
archived historical records, schedule-aware misses, and future-date handling are
implemented without changing the 75-day default or existing streak logic.

#### Remaining Issues

No browser automation suite is configured. Frontend behavior was validated by
production build and backend behavior by the complete test suite.

### Entry 11 - Dark Calendar History and Real-Data States

#### User Prompt

The user requested improving the existing History page with real database data
only, a full dark theme, calendar month/date selection, archived-history rules,
future-date handling, schedule-aware misses, stable loading/error/empty states,
responsive accessibility, and preservation of Today, the reminder, and streaks.

#### AI Action

Inspected the existing History page, `/api/history` service, date utility,
models, tests, and current styles. Hardened the backend history query for
archived dates, added scheduled/completed counts, built a dark responsive
calendar/details layout with previous/next month and date selection, added
real-data-only empty/future/error states, stable loading skeletons, and reduced
motion styling. Added an archived-after-completion regression test.

#### Files Created

- None.

#### Files Modified

- `server/src/services/habitService.js`
- `server/test/api.test.js`
- `client/src/App.jsx`
- `client/src/styles.css`
- `README.md`
- `REASONING.md`
- `AI_LOGS.md`

#### Technical Decisions

- Reuse the existing `/api/history?date=` endpoint and Completion collection.
- Keep `isScheduledDate` as the only scheduling source of truth.
- Include archived habits only through their archive date; keep old completions
  visible while avoiding later artificial misses.
- Keep month navigation client-side and fetch only the selected date.
- Avoid activity dots because one-date history data cannot safely provide
  month-wide indicators without creating additional API work/data assumptions.
- Use dark existing palette tokens and a lightweight skeleton rather than a new
  theme or animation library.

#### Commands / Tests

- `npm test`
- `npm run client:build`
- `node --check` for changed backend files.
- `git diff --check`.

#### Verification

- Backend suite passed all 30 tests, including the archived-history regression.
- Frontend production build passed.
- Editor diagnostics reported no errors in changed files.

#### Issues / Fixes

- History previously had no calendar and used light cards; added the dark
  calendar/details layout.
- Archived habits could have been treated as later scheduled misses; backend
  history now excludes dates after archive while preserving earlier records.
- Retry now refetches the selected date without changing calendar state.

#### Result

History now renders only backend-derived records, supports calendar and day
navigation, distinguishes empty states, preserves archived history, and remains
schedule-aware without changing Today, reminders, or streak logic.

#### Remaining Issues

No browser automation suite is configured. Build, diagnostics, and backend
integration tests are available; the final test count is 30.

### Entry 9 - Profile Navigation, Dynamic Greeting & Mon-Sat

#### User Prompt

The user requested replacing the always-visible sidebar profile input with a
proper Profile option/page and Save action, adding a dynamic local-time
greeting, preserving current-date/reminder behavior, and adding Every day,
Mon-Sat, and Specific days frequency behavior without duplicate systems.

#### AI Action

Inspected the current App shell, profile storage, date clock, Habit model,
shared scheduling utility, streak service, styles, and tests. Added a Profile
route/page, moved name editing into an explicit save form, added local time
greeting periods and periodic clock refresh, added `monSat` to the existing
frequency model and schedule utility, and added Mon-Sat controls and tests.

#### Files Created

- None.

#### Files Modified

- `client/src/App.jsx`
- `client/src/styles.css`
- `server/src/models/Habit.js`
- `server/src/utils/date.js`
- `server/src/services/streakService.js`
- `server/test/schedule.test.js`
- `server/test/streakService.test.js`
- `README.md`
- `REASONING.md`
- `AI_LOGS.md`

#### Technical Decisions

- Keep browser local storage as the single profile persistence mechanism because
  no user/account model exists.
- Keep scheduling and streak calculation backend-authoritative.
- Persist `monSat` as its own frequency rather than disguising it as custom
  selected days.
- Use one periodically refreshed local clock for greeting transitions.

#### Commands / Tests

- `node --test server/test/schedule.test.js server/test/streakService.test.js`
- `npm run client:build`
- Backend `node --check` commands and `git diff --check`.

#### Verification

- The first focused run found one stale invalid-frequency assertion; the test
  expected the pre-Mon-Sat error text.
- After updating that expectation, all 19 schedule/streak tests passed.
- Frontend production build and changed-file diagnostics passed.

#### Issues / Fixes

- Removed the always-visible sidebar profile input and replaced it with Profile
  navigation and a saved profile page.
- Added the Mon-Sat schedule and corrected the test expectation for its error
  message.

#### Result

Profile editing, dynamic local-time greeting, Mon-Sat scheduling, Specific days,
current-date refresh, reminder inputs, and existing streak behavior are
integrated without changing the 75-day challenge.

#### Remaining Issues

No frontend browser automation test exists; frontend production build and
backend deterministic/API test coverage were run.
