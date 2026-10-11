# insights-service

The stateless Node + Express backend for the T-003 AI Feedback PoC. It holds the Fitbit client secret  It verifies Firebase ID tokens, runs the Fitbit OAuth round-trip and serves one normalized day of Pixel Watch data.

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

"Firebase" means the request sends `Authorization: Bearer <Firebase ID token>`.

Fitbit refresh tokens are **single-use**. When a response (success or error) includes `refreshedTokens`, the caller must save that pair, because the old refresh token no longer works.

Error codes: `UNAUTHENTICATED`, `INVALID_RETURN_TO`, `INVALID_DATE`, `MISSING_REFRESH_TOKEN`, `FITBIT_NOT_CONNECTED` (401), `FITBIT_REAUTH_REQUIRED` (401: reconnect the watch), `FITBIT_API_ERROR` (502).

## Checking it with real data

The real Fitbit round-trip is tested end to end from the app (T-003 Phase 2): run the service and `ngrok http 3001`, open the app in Expo Go, sign in, and connect the watch from the Devices tab. The app supplies the Firebase ID token and Fitbit tokens itself.

The service never logs tokens. Don't paste them into tickets or chats.
