// Heart rate zones for one workout, from the bpm ranges Fitbit stores on the
// activity.

const ZONE_KEYS = {
  "Out of Range": "outOfRange",
  "Fat Burn": "fatBurn",
  Cardio: "cardio",
  Peak: "peak",
};

// Fitbit heartRateZones -> [{ key, min, max }], lowest zone first.
// Zones without a bpm range are skipped.
function zoneRanges(heartRateZones) {
  return (heartRateZones || [])
    .filter((z) => ZONE_KEYS[z.name] && Number.isFinite(z.min))
    .map((z) => ({ key: ZONE_KEYS[z.name], min: z.min, max: z.max ?? null }))
    .sort((a, b) => a.min - b.min);
}

// The zone a bpm falls in: the highest zone whose min it reaches. Below every
// zone is outOfRange; no bpm or no ranges is null.
function zoneForBpm(bpm, ranges) {
  if (bpm == null || !ranges || ranges.length === 0) return null;
  let zone = "outOfRange";
  for (const range of ranges) {
    if (bpm >= range.min) zone = range.key;
  }
  return zone;
}

module.exports = { zoneRanges, zoneForBpm, ZONE_KEYS };
