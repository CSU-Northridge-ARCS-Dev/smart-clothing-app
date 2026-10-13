// Helpers for the Workout page: split a workout's points into runs of the
// same heart rate zone, and frame the GPS route on the map.

// Zones from easiest to hardest, as the service tags each point
export const ZONE_ORDER = ["outOfRange", "fatBurn", "cardio", "peak"];

export const ZONE_LABELS = {
  outOfRange: "Out of Range",
  fatBurn: "Fat Burn",
  cardio: "Cardio",
  peak: "Peak",
};

// points -> [{ zone, points }], one entry per run of consecutive points in
// the same zone. Each run after the first starts with the last point of the
// one before, so the drawn line has no gaps. A point with no zone counts as
// outOfRange.
export function groupByZone(points) {
  const groups = [];
  let current = null;
  for (const point of points || []) {
    const zone = point.zone || "outOfRange";
    if (!current || current.zone !== zone) {
      const previous = current && current.points[current.points.length - 1];
      current = { zone, points: previous ? [previous] : [] };
      groups.push(current);
    }
    current.points.push(point);
  }
  return groups;
}

const hasPosition = (p) => p.lat != null && p.lon != null;

// GPS points -> [{ zone, coordinates: [{ latitude, longitude }] }] for
// the route map. Points without a position are skipped.
export function routeSegments(points) {
  return groupByZone((points || []).filter(hasPosition)).map((group) => ({
    zone: group.zone,
    coordinates: group.points.map((p) => ({ latitude: p.lat, longitude: p.lon })),
  }));
}

const LEAFLET_VERSION = "1.9.4";
const TILE_URL =
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

// A small Leaflet page for a WebView: map tiles from CARTO (OpenStreetMap
// data, no API key) under one colored line per zone run, zoomed to fit the
// route. segments: routeSegments output; colors: { [zone]: "#rrggbb" }.
// Returns null when there are no coordinates.
export function routeMapHtml(segments, colors) {
  const lines = (segments || [])
    .filter((s) => s.coordinates.length > 0)
    .map((s) => ({
      color: colors[s.zone] || colors.outOfRange,
      latlngs: s.coordinates.map((c) => [c.latitude, c.longitude]),
    }));
  if (lines.length === 0) return null;

  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.css">
<script src="https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.js"></script>
<style>html, body, #map { height: 100%; margin: 0; }</style>
</head>
<body>
<div id="map"></div>
<script>
var lines = ${JSON.stringify(lines)};
var map = L.map("map", { zoomControl: false, attributionControl: true });
L.tileLayer("${TILE_URL}", {
  attribution: '${TILE_ATTRIBUTION}',
  subdomains: "abcd",
  maxZoom: 20
}).addTo(map);
var bounds = L.latLngBounds([]);
lines.forEach(function (line) {
  L.polyline(line.latlngs, {
    color: line.color, weight: 5, lineCap: "round", lineJoin: "round"
  }).addTo(map);
  bounds.extend(line.latlngs);
});
map.fitBounds(bounds, { padding: [24, 24], maxZoom: 17 });
</script>
</body>
</html>`;
}

// Heart rate points placed in a width x height box: x by time, y by bpm
// (highest bpm at the top). Returns { groups, minBpm, maxBpm } with each
// group's points carrying x and y, or null with fewer than two bpm readings.
export function heartRateChart(points, width, height) {
  const withBpm = (points || []).filter((p) => p.bpm != null);
  if (withBpm.length < 2 || !(width > 0) || !(height > 0)) return null;

  const minBpm = Math.min(...withBpm.map((p) => p.bpm));
  const maxBpm = Math.max(...withBpm.map((p) => p.bpm));
  const firstT = withBpm[0].t;
  const spanT = withBpm[withBpm.length - 1].t - firstT || 1;
  const spanBpm = maxBpm - minBpm || 1;

  const placed = withBpm.map((p) => ({
    ...p,
    x: ((p.t - firstT) / spanT) * width,
    y: height - ((p.bpm - minBpm) / spanBpm) * height,
  }));
  return { groups: groupByZone(placed), minBpm, maxBpm };
}

// "2026-10-11" -> "2026-10"
export const monthOf = (date) => (date ? date.slice(0, 7) : null);
