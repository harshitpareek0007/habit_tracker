# Ananya's 75-Day Challenge

Part 4 now includes a React dashboard for today's habits, completion actions,
streak display, progress, and a morning reminder. The backend remains the
authoritative source for applicability and streak calculations.

## Overview

This is a general-purpose habit tracker inspired by Ananya's 75-day challenge.

# How to Run

## 1. Install dependencies

From a fresh clone or GitHub Codespace, run:

```bash
npm install
```

## 2. Environment variables

Create a private local environment file from the committed template:

```bash
cp .env.example .env
```

Edit `.env` and provide your own MongoDB local or Atlas connection string. Never
commit `.env` or put its credentials in documentation:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
MONGODB_SERVER_SELECTION_TIMEOUT_MS=5000
```

`MONGODB_URI` is required. `PORT`, `CLIENT_ORIGIN`, and
`MONGODB_SERVER_SELECTION_TIMEOUT_MS` have the values shown above as local
development defaults.

## Date and Frequency Behavior

The dashboard derives the current date from the browser's local calendar and
checks for a date rollover every 30 seconds. When the date changes, it reloads
today's habits, completion status, streaks, and pending reminder data. The
backend uses the same `YYYY-MM-DD` date-key convention and does not shift the
user's day through UTC midnight conversion.

Habit frequency options are:

- **Every day:** scheduled Sunday through Saturday.
- **Mon - Sat:** scheduled Monday through Saturday and not Sunday.
- **Specific days:** one or more selected weekdays, including weekend-only
	schedules. These are stored as `frequency: "specificDays"` and a `weekdays`
	array using Sunday `0` through Saturday `6`.

Existing `frequency: "weekdays"` habits remain supported as Monday-Friday
habits. The shared backend scheduling utility drives today's habits, completion
validation, streaks, and reminder inputs.

## 3. Start Backend

In the first terminal, run the existing backend development script:

```bash
npm run server:dev
```

The Express API listens on `http://localhost:5000`. The server connects to
MongoDB before opening the port. A successful startup prints
`API listening on port 5000`.

For a non-watch process, the existing script is:

```bash
npm run server:start
```

## 4. Start Frontend

In a second terminal, run the existing Vite script:

```bash
npm run client:dev
```

Open `http://localhost:5173`. The frontend uses relative `/api` URLs, and Vite
proxies those requests to `http://localhost:5000`.

## 5. GitHub Codespaces

Forward ports `5000` and `5173` from the VS Code **PORTS** tab. Open the
forwarded `5173` port, not the backend port, to use the application. In the
PORTS tab, right-click port `5173`, choose **Open in Browser**, and use the
forwarded frontend URL. Keep port `5000` forwarded for the frontend proxy and
for direct API checks.

## 6. Quick Start

```bash
npm install
cp .env.example .env
# Edit .env and set MONGODB_URI to your own connection string.
npm run server:dev
```

In a second terminal:

```bash
npm run client:dev
```

Then open `http://localhost:5173` or the forwarded port-5173 URL.

## 7. Common Errors

- `MONGODB_URI is not configured`: create `.env` from `.env.example` and set a
	valid private MongoDB URI.
- `Unable to start server`: verify MongoDB is reachable, Atlas network access
	allows the Codespace, and the URI credentials are valid.
- `app.listen is not a function`: use the current working tree; `app.js` must
	export the configured Express instance, not the factory function.
- Vite `/api` `ECONNREFUSED`: start the backend with
	`npm run server:dev` and confirm it is listening on port `5000`.
- `EADDRINUSE`: another process already uses port `5000` or `5173`. Stop that
	process or use an available development port and update the proxy as needed.

## 8. Testing and Build

Run the repository's test script:

```bash
npm test
```

Run the deterministic streak tests directly:

```bash
node --test server/test/streakService.test.js
node --test server/test/schedule.test.js server/test/streakService.test.js
```

The complete `npm test` run currently covers 30 tests across API, history, schedule, and
streak behavior.

Build the frontend:

```bash
npm run client:build
```

Preview the production build with the existing script:

```bash
npm run client:preview
```

The available backend syntax checks are direct Node commands rather than npm
scripts:

```bash
node --check server/src/app.js
node --check server/src/server.js
```

## Features

Implemented: habit CRUD, case-insensitive search, soft archive/restore, today's
applicable habits, completion history, current/best streaks, and a responsive
React dashboard with habit management. Habits support Every day and selected
specific weekdays, plus Mon - Sat.

Planned: authentication, additional frequency types, and browser push
notifications.

## Tech Stack

- Frontend: React.js with a client-side router
- Backend: Node.js and Express.js
- Database: MongoDB through Mongoose
- API: REST
- Language: JavaScript
- Authentication: not planned unless a later requirement adds it

## Architecture

The backend uses Express routes, controllers, services, Mongoose models, shared
date utilities, and centralized error handling. The React client uses Vite,
React Router, a shared API service, and dashboard components. The frontend does
not calculate schedules or streaks locally.

## Project Structure

```text
client/
	src/
		components/
		App.jsx
		api.js
		main.jsx
		styles.css
server/
  src/{config,controllers,middleware,models,routes,services,utils}
  test/
REASONING.md
AI_LOGS.md
```

## Design documents

- [REASONING.md](REASONING.md): proposed architecture, schemas, date model,
	streak rules, and implementation decisions.
- [AI_LOGS.md](AI_LOGS.md): factual development activity recorded so far.

The streak engine remains a backend service; the client consumes its response.

## Prerequisites

Node.js 18+, npm, and MongoDB 6+ or a compatible MongoDB deployment.

## Installation

```bash
npm install
cp .env.example .env
```

Edit `.env` and replace `your_mongodb_connection_string` with your own local
MongoDB URI or MongoDB Atlas connection string. Never commit `.env`.

## Environment Variables

- `MONGODB_URI`: MongoDB connection string.
- `PORT`: HTTP port, default `5000`.
- `CLIENT_ORIGIN`: allowed frontend origin for CORS.
- `MONGODB_SERVER_SELECTION_TIMEOUT_MS`: connection-failure timeout, default
	`5000` milliseconds.

## MongoDB Setup

Set `MONGODB_URI` in `.env` to a reachable MongoDB instance. The server
connects before listening and exits if the URI is missing or unavailable.

## Running Backend

```bash
npm start
```

The equivalent explicit command is `npm run server:start`. Development mode is
`npm run server:dev`.

The backend reads `MONGODB_URI` before it opens port `5000`. A successful start
prints `API listening on port 5000`.

## Running Frontend

In a second terminal run `npm run client:dev`, then open
`http://localhost:5173`. Vite proxies `/api` requests to
`http://localhost:5000`.

## Running Full Application

1. Configure `.env` with a reachable `MONGODB_URI`.
2. Run `npm run server:dev`.
3. In a second terminal run `npm run client:dev`.
4. Open `http://localhost:5173`.

## Ports

- Frontend: `5173` (Vite)
- Backend: `5000` (Express)
- MongoDB: the host/port defined by your `MONGODB_URI`

## API / Proxy Configuration

The frontend uses relative `/api` URLs. During development, Vite proxies them
to `http://localhost:5000`; no database URI is sent to the browser. In a
different deployment, set `VITE_API_URL` to the public backend origin at build
time.

## GitHub Codespaces Setup

Install dependencies, create `.env` from `.env.example`, provide a reachable
`MONGODB_URI`, then run the backend and frontend commands above.

## Testing

Run `npm test`. Tests use `mongodb-memory-server`; the first run may download a
MongoDB binary.

Build the frontend with `npm run client:build` and preview it with
`npm run client:preview`.

## Debugging

Use `GET /api/health` as the service check. API errors return a message without
database credentials or stack traces.

- `MONGODB_URI is not configured`: create `.env` and set your own URI.
- `Unable to start server`: verify the URI, Atlas network access, credentials,
	and that MongoDB is running.
- Vite `/api` proxy `ECONNREFUSED`: start the backend on port `5000`.
- CORS errors: set `CLIENT_ORIGIN` to the frontend origin and restart the
	backend.
- Port already in use: stop the existing process or choose a different `PORT`
	and update the Vite proxy for that development session.
- `app.listen is not a function`: this project exports the configured Express
	instance from `server/src/app.js`; restart from the current working tree if
	an older process or stale code is being used.

## API Endpoints

- `GET /api/health`
- `GET /api/habits?search=&archived=true|false|all`
- `POST /api/habits`
- `GET /api/habits/:habitId`
- `PATCH /api/habits/:habitId`
- `POST /api/habits/:habitId/archive`
- `POST /api/habits/:habitId/restore`
- `GET /api/today?date=YYYY-MM-DD`
- `GET /api/history?date=YYYY-MM-DD`
- `GET /api/habits/:habitId/completions`
- `GET /api/habits/:habitId/completions/:dateKey`
- `PUT /api/habits/:habitId/completions/:dateKey`
- `GET /api/habits/:habitId/completions/streaks?date=YYYY-MM-DD`

Success responses use `{ success: true, data }`; errors use
`{ success: false, message }`.

## Database Models

`Habit` stores name, description, frequency, timezone, archive timestamp, and
timestamps. `Completion` stores a habit reference, local `dateKey`, status, and
timestamps. A unique `{ habitId, dateKey }` index prevents duplicates.

Challenge duration and profile name are currently browser-local settings because
the application has no user/account model. The default challenge duration is
75 days; Profile supports 30, 45, 60, 75, 90, and 100 days. Changing it does
not modify habits, completions, archived records, or streak history.

## History

The History page uses `GET /api/history?date=YYYY-MM-DD`. The backend loads all
habits, including archived habits, applies the shared scheduling utility, and
joins persisted Completion records. It shows completed and missed scheduled
habits, progress counts, percentages, a dark month calendar, previous/next-day
navigation, and a clear future-date empty state. Non-scheduled habits are not
counted as missed. If nothing is scheduled it shows `No habits were scheduled
for this date.`; scheduled days with no completed records show
`No activity recorded for this date.`. Archived habits remain visible on dates
at or before their archive date and are not turned into later misses.

## Streak Logic

The backend is authoritative for streaks. Daily habits treat every calendar
date as scheduled. Weekday habits treat Monday-Friday as scheduled and skip
Saturday/Sunday entirely, so weekends do not break a weekday streak. A missed
scheduled date breaks the current run; an incomplete scheduled today produces a
current streak of zero. On an unscheduled date, current streak is evaluated
through the most recent scheduled date. Best-ever streak is the longest
historical run and is not erased when the current streak breaks. Completion
dates use local `YYYY-MM-DD` keys.

The dashboard requests today's habits from the backend, then requests each
habit's completion and streak data. It displays progress without implementing
a second schedule or streak algorithm in React.

## Morning Reminder

Before noon in the browser's local time, the dashboard shows active habits
returned for today that have no completed record for today's date. Completed,
archived, and non-scheduled habits are excluded. Completing a habit reloads the
backend state, updating the pending count and reminder immediately; refreshes
also recalculate it from the persisted completion record. Dismissal is stored
locally for the current local date.

## Profile and Greeting

Use the **Profile** navigation item to edit the display name and save it. The
name is persisted in browser local storage because this project has no account
or authentication model. The dashboard uses the current local clock for a
dynamic Good morning, Good afternoon, Good evening, or Good night greeting and
updates it periodically without requiring a refresh. The profile name does not
affect the 75-day duration or any habit data.

## Profile Name

The sidebar profile-name field stores the display name in browser local storage.
It updates the greeting and brand immediately and survives refresh. No account
or authentication system is introduced, and the name does not affect habits,
completions, streaks, scheduling, reminders, or the 75-day challenge duration.

## Build / Production

The backend runs directly with `npm start`; no production build step exists.

## Common Errors

- Missing `MONGODB_URI`: configure `.env` before starting.
- Invalid habit ID: use a MongoDB ObjectId.
- Invalid date: use a real `YYYY-MM-DD` date.
- Weekend completion for a weekday habit: the API rejects unscheduled dates.
- Frontend API proxy errors: start the backend with `npm start` and ensure
	MongoDB is reachable through `MONGODB_URI`.

## Future Improvements

Authentication, user ownership, additional frequencies, and browser push
notifications remain future work.