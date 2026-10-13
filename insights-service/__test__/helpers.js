// Shared test helpers

// Minimal stand-in for a fetch Response
function fakeResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
  };
}

// Fitbit /oauth2/token success body
function tokenBody(suffix = "1") {
  return {
    access_token: `access-${suffix}`,
    refresh_token: `refresh-${suffix}`,
    expires_in: 28800,
    user_id: "FITBIT123",
    scope: "sleep heartrate activity profile",
  };
}

function setFitbitEnv() {
  process.env.FITBIT_CLIENT_ID = "client-id";
  process.env.FITBIT_CLIENT_SECRET = "client-secret";
  process.env.FITBIT_REDIRECT_URI = "https://tunnel.example/api/fitbit/callback";
  process.env.FIREBASE_PROJECT_ID = "test-project";
  delete process.env.ALLOWED_RETURN_SCHEMES;
}

// A Fitbit-style TCX file. trackpoints: [{ time, lat, lon, bpm }]; leave out
// lat/lon or bpm to drop the Position or HeartRateBpm element.
function tcxXml(trackpoints, { laps = 1 } = {}) {
  const point = ({ time, lat, lon, bpm }) =>
    [
      "<Trackpoint>",
      `<Time>${time}</Time>`,
      lat != null
        ? `<Position><LatitudeDegrees>${lat}</LatitudeDegrees><LongitudeDegrees>${lon}</LongitudeDegrees></Position>`
        : "",
      "<AltitudeMeters>80.2</AltitudeMeters>",
      bpm != null ? `<HeartRateBpm><Value>${bpm}</Value></HeartRateBpm>` : "",
      "</Trackpoint>",
    ].join("");
  const perLap = Math.ceil(trackpoints.length / laps);
  const lapXml = [];
  for (let i = 0; i < trackpoints.length; i += perLap) {
    const points = trackpoints.slice(i, i + perLap).map(point).join("");
    lapXml.push(
      `<Lap StartTime="${trackpoints[i].time}"><TotalTimeSeconds>60</TotalTimeSeconds><Track>${points}</Track></Lap>`,
    );
  }
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2">',
    '<Activities><Activity Sport="Running"><Id>2026-10-11T07:00:00.000-07:00</Id>',
    lapXml.join(""),
    "</Activity></Activities></TrainingCenterDatabase>",
  ].join("");
}

// Fitbit activity heartRateZones with bpm ranges, as on the lead's real run
const ACTIVITY_ZONES = [
  { name: "Out of Range", min: 30, max: 115, minutes: 1 },
  { name: "Fat Burn", min: 115, max: 140, minutes: 3 },
  { name: "Cardio", min: 140, max: 171, minutes: 6 },
  { name: "Peak", min: 171, max: 220, minutes: 2 },
];

module.exports = {
  fakeResponse,
  tokenBody,
  setFitbitEnv,
  tcxXml,
  ACTIVITY_ZONES,
};
