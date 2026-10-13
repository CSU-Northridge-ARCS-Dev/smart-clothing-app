// Turns a Fitbit activity TCX file into a list of points for the app's route
// map and heart rate chart.
const { XMLParser } = require("fast-xml-parser");

// A long run has thousands of trackpoints; the app only needs enough to draw
const MAX_POINTS = 600;

const parser = new XMLParser({
  ignoreAttributes: true,
  isArray: (name) => ["Activity", "Lap", "Track", "Trackpoint"].includes(name),
});

const numberOrNull = (value) => {
  const n = Number(value);
  return value != null && value !== "" && Number.isFinite(n) ? n : null;
};

// Every nth point, always keeping the last one
function downsample(points, max = MAX_POINTS) {
  if (points.length <= max) return points;
  const step = Math.ceil(points.length / max);
  const kept = points.filter((_, i) => i % step === 0);
  const last = points[points.length - 1];
  if (kept[kept.length - 1] !== last) kept.push(last);
  return kept;
}

// TCX XML -> [{ t, lat, lon, bpm }], t in seconds from the first trackpoint.
// lat/lon are null when the trackpoint has no Position (no GPS, or a token
// without the location scope); bpm is null when there is no heart rate.
function parseTcx(xml) {
  if (!xml) return [];
  const doc = parser.parse(xml);
  const activities =
    (doc.TrainingCenterDatabase &&
      doc.TrainingCenterDatabase.Activities &&
      doc.TrainingCenterDatabase.Activities.Activity) ||
    [];

  const trackpoints = [];
  for (const activity of activities) {
    for (const lap of activity.Lap || []) {
      for (const track of lap.Track || []) {
        trackpoints.push(...(track.Trackpoint || []));
      }
    }
  }

  let start = null;
  const points = [];
  for (const tp of trackpoints) {
    const time = Date.parse(tp.Time);
    if (Number.isNaN(time)) continue;
    if (start === null) start = time;
    const position = tp.Position || {};
    const heartRate = tp.HeartRateBpm || {};
    points.push({
      t: Math.round((time - start) / 1000),
      lat: numberOrNull(position.LatitudeDegrees),
      lon: numberOrNull(position.LongitudeDegrees),
      bpm: numberOrNull(heartRate.Value),
    });
  }

  return downsample(points);
}

module.exports = { parseTcx, downsample, MAX_POINTS };
