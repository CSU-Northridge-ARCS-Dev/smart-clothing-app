# insights-service

The stateless Node + Express backend for AI feedback. The phone builds one day of watch data (Health Connect on Android) and sends it here. The service verifies the Firebase ID token, checks the day and asks Claude for feedback on it. It holds the Anthropic key, and it stores nothing.

## Run

```bash
npm install
cp .env.example .env     # then fill it in (ask the lead)
npm start                # http://localhost:3001
ngrok http 3001          # separate terminal; the app's INSIGHTS_API_URL points at this address
npm test                 # Jest + supertest, no network calls
```

Use `npm start` when testing feedback from the app. `npm run dev` restarts on file changes, and a restart in the middle of a request fails that request.

`.env` keys: `PORT`, `ANTHROPIC_API_KEY`, `COACH_MODEL`, `FIREBASE_PROJECT_ID`, and the optional `USAGE_LOG_PATH`.

## Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/health` | none | liveness |
| POST | `/api/insights/generate-from-day` | Firebase | body `{ date, profile, day, source }` -> `{ insight: { headline, keySignals[], focus[] }, usage }`, or `{ insight: null, reason: "NO_DATA" }` when the day has no sleep and no workout (Claude is not called) |

"Firebase" means the request sends `Authorization: Bearer <Firebase ID token>`.

`day` is the day the phone built, and `source` says where the phone read it from: `health_connect` or `healthkit`. The day is rebuilt by `validateDay` before it reaches the prompt: only known fields are kept, numbers are held inside a sane range, and no free text from the phone gets through.

Error codes: `UNAUTHENTICATED` (401), `INVALID_DATE`, `INVALID_SOURCE` and `INVALID_DAY` (400), `COACH_API_ERROR` and `COACH_REFUSED` (502: the Claude call failed or was refused), `COACH_NOT_CONFIGURED` (500: `ANTHROPIC_API_KEY` or `COACH_MODEL` missing).

## Claude feedback

`profile` is the signup data the app already has: `{ gender, age, height (inches), weight (lbs), sports }`. Any field can be missing; the app's `"No Data"` placeholder is ignored.

The model comes from `COACH_MODEL`. Every call appends a row to `usage-log.csv` (gitignored; `USAGE_LOG_PATH` moves it): `timestamp,date,model,input_tokens,output_tokens,source`. `source` is where the day came from (`health_connect` or `healthkit`; older rows can say `fitbit` or have none). The cost estimate is worked out from it. `model` is the model that actually answered, which can differ from `COACH_MODEL` after a refusal fallback.

To try the prompt without the app:

```bash
npm run try-coach -- __test__/fixtures/day-sample.json            # sample profile
npm run try-coach -- path/to/day.json path/to/profile.json
```

This calls Claude with the real key (it costs a call) and writes a usage row. `day-sample.json` is invented data.

## Checking it with real data

Run the service and `ngrok http 3001`, open the app's dev build on an Android phone, sign in, connect Health Connect from the Devices tab, open a finished day and tap Get feedback. The app supplies the Firebase ID token itself.

The service never logs tokens. Don't paste them into tickets or chats.
