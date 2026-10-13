// Builds the Workout page data: one workout with its route and heart rate
// points, and the workout days of a month.
const { activityDate } = require("./dates");
const { normalizeWorkout, workoutType, WORKOUT_TYPES } = require("./normalizeDay");
const { parseTcx, downsample } = require("./parseTcx");
const { intradayPoints } = require("./heartIntraday");
const { zoneRanges, zoneForBpm } = require("./workoutZones");

// Fewer heart rate readings than this in the TCX means it has no usable
// heart rate, and the intraday series is used instead
const MIN_BPM_POINTS = 2;

const bpmCount = (points) => points.filter((p) => p.bpm != null).length;

// True when the TCX can't draw the heart rate chart on its own
function tcxLacksHeartRate(tcx) {
  return bpmCount(parseTcx(tcx)) < MIN_BPM_POINTS;
}

// activity: the Fitbit activity record. tcx: its TCX file (XML text).
// hasRoute is false when the watch recorded GPS but the TCX has no positions.
// tcxDenied: Fitbit refused the TCX (a login without the location scope), so
// needsReconnect tells the app to ask for a new login.
// heartIntraday: the intraday heart rate for the workout's window, used for
// the points when the TCX has no heart rate.
function workoutDetail(
  activity,
  tcx,
  { tcxDenied = false, heartIntraday = null } = {},
) {
  const ranges = zoneRanges(activity.heartRateZones);
  let source = parseTcx(tcx);
  if (bpmCount(source) < MIN_BPM_POINTS && heartIntraday) {
    source = downsample(intradayPoints(heartIntraday, activity));
  }
  const points = source.map((p) => ({
    ...p,
    zone: zoneForBpm(p.bpm, ranges),
  }));
  const hasRoute = points.some((p) => p.lat != null && p.lon != null);

  return {
    ...normalizeWorkout(activity),
    date: activityDate(activity),
    zoneRanges: ranges,
    points,
    hasRoute,
    needsReconnect: Boolean(tcxDenied),
  };
}

// month: YYYY-MM. activities: the Activity Log List from the 1st of the month.
// Returns the kept workouts that started in the month, oldest first.
function monthWorkouts(month, activities) {
  return (activities || [])
    .filter((a) => WORKOUT_TYPES.includes(a.activityName))
    .map((a) => ({ date: activityDate(a), logId: a.logId ?? null, type: workoutType(a) }))
    .filter((w) => w.date && w.date.slice(0, 7) === month);
}

module.exports = { workoutDetail, monthWorkouts, tcxLacksHeartRate };
