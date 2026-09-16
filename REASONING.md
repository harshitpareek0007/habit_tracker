# Engineering Reasoning

Part 4 status: **Implemented** describes the backend and React dashboard now in
the repository; **Planned** marks future work. This is an auditable engineering
explanation, not private chain-of-thought.

## Documentation and Run Workflow Decision

**Implemented:** The README now presents one verified Codespaces workflow:
install dependencies, create `.env` from `.env.example`, configure
`MONGODB_URI`, run `npm run server:dev`, and run `npm run client:dev` in a
second terminal. It identifies ports 5000 and 5173, the Vite `/api` proxy, the
available test/build scripts, and the actual startup/proxy errors observed
during development. The documentation uses only commands present in the root
`package.json` or commands verified directly with Node.

## Part 2 Implementation Decisions

### MongoDB and API architecture

**Implemented:** MongoDB is connected through `MONGODB_URI`; credentials are
not hardcoded. Connection attempts use a bounded configurable server-selection
timeout so an unavailable MongoDB reports startup failure instead of hanging.
One Express app owns route registration, with separate
controllers, services, models, utilities, and centralized error middleware.

### Backend startup debugging decision

The startup error `app.listen is not a function` was caused by
`server/src/app.js` exporting the `createApp` factory itself while
`server/src/server.js` treated that function as the Express instance. The fix
was to keep the existing factory and export its single instantiated app with
`module.exports = createApp()`. `server.js` can therefore continue to require
the app and call `app.listen(...)` without creating another Express app.
The fix was verified by requiring the module and confirming `typeof app.listen`
is `function`, then by reaching the live health API and full CRUD/completion/
streak flow on port 5000.
The React client is implemented in Part 4; streak calculations are implemented
in Part 3.

### Habit and completion schemas

**Implemented:** `Habit` stores name, description, `frequency`, timezone,
`archivedAt`, and timestamps. Mongoose validates names, descriptions,
frequency enum values, and IANA timezones. `Completion` references Habit and
stores a local `dateKey`, completion status, audit timestamp, and timestamps.

Completion uses `YYYY-MM-DD` because habit applicability is a calendar-date
concept. UTC timestamps alone could shift a user's local date around midnight.
A unique `{ habitId, dateKey }` index prevents duplicate completion records.

### Archive, update, and validation behavior

**Implemented:** Archive sets `archivedAt` and restore clears it; completion
records are never deleted. Habit updates do not modify `createdAt` or historical
completions. Changing frequency affects future applicability only and does not
fabricate historical records. New completions are rejected for archived habits
and unscheduled dates.

**Implemented:** The API validates ObjectIds, JSON bodies, habit fields,
completion booleans, and real date keys. Search is case-insensitive and safely
escapes regular-expression characters. Active habits are the default; archived
habits can be queried explicitly.

### Error handling and indexing

**Implemented:** Unknown routes, missing habits, invalid ObjectIds, Mongoose
validation errors, duplicate keys, and server errors use a consistent
`{ success: false, message }` response. Production responses do not expose
stack traces or secrets. Habit archive/update and name indexes support the
implemented list/search paths; Completion has unique habit/date indexing.

**Planned:** Authentication, pagination, permanent deletion, and additional
frequency types remain future work. Permanent deletion is intentionally omitted
so archive remains reversible and history-preserving.

## Streak Calculation Design

### Scheduled Days

**Implemented:** `isScheduledDate` in `server/src/utils/date.js` is the single
source of truth. Daily schedules every date; weekdays schedules Monday-Friday.
The streak service uses this function rather than calendar-day subtraction.

### Current Streak Algorithm

**Implemented:** `calculateCurrentStreak` receives a frequency, completion
history, and explicit `asOfDate`. It starts at the latest scheduled occurrence
on or before that date, walks backward, skips non-scheduled dates, and counts
completed scheduled occurrences until the first miss. Therefore a scheduled but
incomplete today returns zero, while a weekday weekend evaluates from Friday or
the latest prior scheduled date.

### Best-Ever Streak Algorithm

**Implemented:** `calculateBestStreak` filters future records, starts at the
earliest completed historical date, walks forward through scheduled dates, and
tracks the maximum run. Missing scheduled occurrences reset the run; skipped
non-scheduled dates do not. Duplicate dates are collapsed into a Set.

### Daily Habits

**Implemented:** Every date is an occurrence. Saturday and Sunday therefore
must be completed to continue a daily streak.

### Weekday Habits

**Implemented:** Only Monday-Friday are occurrences. Friday followed by Monday
is consecutive, and Monday-Friday completion across multiple weeks continues
one scheduled-day run when no weekday is missed.

### Weekend Handling

**Implemented:** Saturday and Sunday are skipped, not treated as missed
completions, for weekday habits.

### Missed Scheduled Days

**Implemented:** A missing or `completed: false` scheduled record resets the
current run and separates best-streak runs. For example, Monday/Tuesday
completed, Wednesday missed, Thursday completed gives current `1` and best `2`.

### Date Handling

**Implemented:** The API accepts an explicit `YYYY-MM-DD` query date for
deterministic streak evaluation. Without it, the service derives the local date
from the habit's IANA timezone. Streak calculations use date keys and UTC date
arithmetic only to move between date labels, avoiding timezone midnight shifts.
Future completion keys are ignored.

### Edge Cases

**Implemented and tested:** Empty history, newly created habits, incomplete
today, weekend evaluation, missed weekdays, historical bests, future dates,
duplicate records, false completion records, invalid dates, invalid frequency,
archived habits, and restored habits. Archived/restored status does not erase
history; the streak endpoint can still inspect an archived habit's history.

### Performance Considerations

**Implemented:** The API retrieves a habit's completion history with one MongoDB
query and calculates in memory. The current streak walks only backward until a
miss; best streak walks the date-key interval from the first historical
completion through `asOfDate`. This avoids one query per date and is appropriate
for the current single-habit history model.

## Repository assessment

The initial repository contains only `README.md` and Git metadata. There are no
`package.json` files, React files, Express files, Mongoose models, API routes,
CSS files, tests, environment configuration, or reusable application modules.
Because this is a greenfield scaffold, the proposed structure below establishes
the project boundaries without removing existing code.

## MERN architecture

### Frontend

**Implemented:** The client uses Vite, React Router, a shared API module, and
dashboard components. The current routes are Today (`/`) and Habit Library
(`/habits`).

Planned client structure:

- `pages/TodayPage`: today's scheduled habits, completion actions, and streaks.
- `pages/HabitsPage`: searchable active and archived habit lists.
- `pages/HabitFormPage`: create and edit forms.
- `pages/HistoryPage`: completion history for a selected habit or all habits.
- `components/`: habit rows/cards, schedule fields, status controls, streak
  summary, history list, loading states, and error states.
- `services/api.js`: one configured `fetch` wrapper for REST requests and JSON
  error normalization.
- `state/`: a small context and reducer for selected filters and cached habit
  data; server data remains owned by request hooks/services rather than copied
  into unrelated components.

Routing will use a client-side router with routes for Today, Habits, create/edit,
and History. Forms will use controlled inputs with shared validation helpers.
The UI will expose disabled/loading states for requests, inline validation for
form errors, and a recoverable page-level error state for failed requests.

### Backend

The server will separate responsibilities as follows:

- `app.js`: Express middleware and route registration.
- `server.js`: environment loading, database connection, and HTTP startup.
- `routes/`: REST route declarations only.
- `controllers/`: request parsing, response status codes, and delegation.
- `services/`: schedule matching, completion upsert rules, and streak
  calculations.
- `models/`: Mongoose schemas and indexes.
- `middleware/`: JSON parsing, not-found handling, validation, and centralized
  error handling.

Validation will reject missing or malformed names, unsupported schedule types,
invalid dates, and completion requests for dates that are not applicable. The
error middleware will return a consistent JSON shape such as
`{ error: { code, message, details } }` without exposing stack traces in
production.

## Database design

### Habit

```text
_id: ObjectId
name: String, required, trimmed
description: String, optional
schedule:
  type: "daily" | "weekdays"
  timezone: IANA timezone string, required
archivedAt: Date | null, default null
createdAt: Date
updatedAt: Date
```

`archivedAt` is a soft-archive marker. No delete endpoint is planned. A unique
name is not required because users may reasonably reuse a habit name over time.
The first version can index `{ archivedAt: 1, updatedAt: -1 }` for active versus
archived list queries.

### Completion

```text
_id: ObjectId
habitId: ObjectId, required, ref Habit
dateKey: String, required, YYYY-MM-DD in the habit's timezone
completedAt: Date, required
createdAt: Date
updatedAt: Date
```

There is a unique compound index on `{ habitId: 1, dateKey: 1 }`, making a
completion an idempotent per-habit, per-local-date record. The habit reference
is retained after archiving, so historical records remain queryable.

## REST API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Service health check |
| `GET` | `/api/habits?search=&archived=` | List/search active or archived habits |
| `POST` | `/api/habits` | Create a habit |
| `GET` | `/api/habits/:habitId` | Get habit details and summary |
| `PATCH` | `/api/habits/:habitId` | Edit habit fields or schedule |
| `POST` | `/api/habits/:habitId/archive` | Soft-archive a habit |
| `POST` | `/api/habits/:habitId/restore` | Restore an archived habit |
| `GET` | `/api/today?date=YYYY-MM-DD` | Return applicable habits for a local date |
| `PUT` | `/api/habits/:habitId/completions/:dateKey` | Mark one scheduled date complete |
| `DELETE` | `/api/habits/:habitId/completions/:dateKey` | Undo a completion |
| `GET` | `/api/habits/:habitId/completions` | Paginated completion history |
| `GET` | `/api/habits/:habitId/completions/streaks?date=YYYY-MM-DD` | Current and best streak summaries |

The client sends the requested local date key. The server remains authoritative
and validates that the date key is valid and the habit is scheduled on it.

## Streak algorithm

Dates are represented as `YYYY-MM-DD` calendar keys in each habit's IANA
timezone. `completedAt` is stored as an instant in UTC for auditing, but streak
logic uses the local `dateKey`; this prevents UTC midnight from changing a
user's intended day.

For a habit, first sort completed date keys ascending and retain only dates on
which the habit was scheduled. A scheduled date is every local date for a daily
habit, and Monday through Friday for a weekday habit. Weekend dates are skipped
for weekday habits, so an eligible Friday followed by an eligible Monday is
consecutive. For daily habits, Saturday and Sunday are eligible and therefore
must be completed to continue the streak.

To calculate a streak, walk the scheduled date sequence and split it whenever
an eligible date has no completion. The best-ever streak is the longest run.
The current streak is the run ending at the latest scheduled date up to today,
with these rules:

- A future date is ignored.
- If today is scheduled and incomplete, the current streak is zero because the
  user has missed the current required day.
- If today is not scheduled, evaluate through the most recent scheduled date;
  this keeps a weekday streak alive over Saturday and Sunday.
- A missed scheduled day breaks the run, while an unscheduled day never does.

The service will use date-only iteration in the habit timezone rather than
subtracting fixed UTC milliseconds. Tests will cover weekday Friday-to-Monday
continuity, a missed Tuesday, daily weekend requirements, archived habits, and
date-boundary behavior around midnight and daylight-saving transitions.

## Testing strategy

- Backend unit tests: schedule matching, date-key validation, streak runs, and
  archive/restore behavior.
- Backend integration tests: Express routes against a test MongoDB instance,
  including idempotent completion writes and preserved history.
- Frontend component tests: forms, search/filter behavior, completion loading
  states, errors, and archived-history rendering.
- End-to-end smoke tests: create a habit, complete applicable dates, inspect
  streak/history, archive, and restore.
- Test data will use fixed IANA timezones and explicit date keys so tests do not
  depend on the machine's clock.

## Implementation phases

1. Initialize client/server packages, scripts, environment examples, and the
   Express health endpoint.
2. Add Mongoose models, indexes, validation, and database connection handling.
3. Implement habit CRUD, search, soft archive, and restore APIs.
4. Implement schedule matching, completion APIs, history, and streak services.
5. Build React routing, API service, forms, today view, history, and streak UI.
6. Add focused unit/integration/frontend tests and error/loading states.
7. Run verification, document setup, and refine responsive UI behavior.

## Frontend Implementation

**Implemented:** The Vite React client uses `App.jsx` for routed Today and
Habit Library views, `api.js` for one fetch/response-error boundary,
`HabitCard` for completion and streak presentation, and `MorningReminder` for
a dismissible morning prompt. The dashboard loads today's applicable habits
from the backend, then loads each habit's completion and streak response.
React never calculates schedule applicability or streaks independently.

**Implemented:** Completion actions show a disabled busy state and refresh
authoritative backend data. The dashboard includes loading, request error,
empty-day, and empty-search states. The habit library supports create, search,
and archive through existing APIs. The reminder is local browser behavior: it
appears before noon while habits remain pending and stores one dismissal per
local day; no server reminder model or notification permission is fabricated.

**Planned:** Full history screens, edit/restore controls in the client,
authentication, and browser push notifications remain future work.