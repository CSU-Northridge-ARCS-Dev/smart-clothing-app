# insights-service

The stateless Node + Express backend for the T-003 AI Feedback PoC. It holds the Fitbit client secret and the Anthropic key. It verifies Firebase ID tokens, runs the Fitbit OAuth round-trip, serves one normalized day of Pixel Watch data and asks Claude for feedback on that day.

## Run

```bash
npm install
cp .env.example .env     # then fill it in (ask the lead)
npm run dev              # http://localhost:3001, restarts on file changes
ngrok http 3001          # separate terminal; the static domain must match FITBIT_REDIRECT_URI
npm test                 # Jest + supertest, no network calls
```

## Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/health` | none | liveness |
| GET | `/api/fitbit/auth-url?returnTo=` | Firebase | Fitbit authorize URL. `returnTo` must use an allowed scheme (`exp`, `exps`, `com.arcs.smartclothingapp`, or `ALLOWED_RETURN_SCHEMES`) |
| GET | `/api/fitbit/callback?code&state` | public | Fitbit redirects here. Redirects on to `returnTo?accessToken&refreshToken&expiresAt&fitbitUserId`, or `returnTo?error=` |
| POST | `/api/fitbit/refresh` | Firebase | `{ refreshToken }` -> new token pair |
| GET | `/api/fitbit/day/:date` | Firebase + `X-Fitbit-Token`, `X-Fitbit-Refresh-Token` | `{ day, refreshedTokens? }` for a `YYYY-MM-DD` date |
| POST | `/api/insights/generate` | Firebase + `X-Fitbit-Token`, `X-Fitbit-Refresh-Token` | body `{ date, profile }` -> `{ insight: { headline, keySignals[], focus[] }, usage, refreshedTokens? }`, or `{ insight: null, reason: "NO_DATA" }` when the day has no sleep and no workout (Claude is not called) |

"Firebase" means the request sends `Authorization: Bearer <Firebase ID token>`.

Fitbit refresh tokens are **single-use**. When a response (success or error) includes `refreshedTokens`, the caller must save that pair, because the old refresh token no longer works.

Error codes: `UNAUTHENTICATED`, `INVALID_RETURN_TO`, `INVALID_DATE`, `MISSING_REFRESH_TOKEN`, `FITBIT_NOT_CONNECTED` (401), `FITBIT_REAUTH_REQUIRED` (401: reconnect the watch), `FITBIT_API_ERROR` (502), `COACH_API_ERROR` and `COACH_REFUSED` (502: the Claude call failed or was refused), `COACH_NOT_CONFIGURED` (500: `ANTHROPIC_API_KEY` or `COACH_MODEL` missing).

## Claude feedback

`profile` is the signup data the app already has: `{ gender, age, height (inches), weight (lbs), sports }`. Any field can be missing; the app's `"No Data"` placeholder is ignored. The prompt is built from the day **without** the sleep-stage timeline (`sleep.levels`).

The model comes from `COACH_MODEL`. Every call appends a row to `usage-log.csv` (gitignored; `USAGE_LOG_PATH` moves it): `timestamp,date,model,input_tokens,output_tokens`. The cost estimate is worked out from it. `model` is the model that actually answered, which can differ from `COACH_MODEL` after a refusal fallback.

To try the prompt without the app:

```bash
npm run try-coach -- __test__/fixtures/day-sample.json            # sample profile
npm run try-coach -- path/to/day.json path/to/profile.json
```

This calls Claude with the real key (it costs a call) and writes a usage row. `day-sample.json` is invented data.

## Checking it with real data

The real Fitbit round-trip is tested end to end from the app (T-003 Phase 2): run the service and `ngrok http 3001`, open the app in Expo Go, sign in, and connect the watch from the Devices tab. The app supplies the Firebase ID token and Fitbit tokens itself.

The service never logs tokens. Don't paste them into tickets or chats.
