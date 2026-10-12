// Display helpers for the Fitbit day object returned by insights-service.

// 412 -> "6h 52m", 45 -> "45m", null -> "--"
export function formatMinutes(minutes) {
  if (minutes === null || minutes === undefined) return "--";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

// 8432 -> "8,432", null -> "--". Done by hand so it doesn't depend on Intl.
export function formatSteps(steps) {
  if (typeof steps !== "number" || !Number.isFinite(steps)) return "--";
  return String(Math.round(steps)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Fitbit times are wall-clock strings ("2026-10-09T23:10:00.000", sometimes
// with an offset). Read the HH:MM directly so the phone's timezone is not
// applied a second time. -> "11:10 PM"
export function formatClockTime(dateTime) {
  if (!dateTime || dateTime.length < 16) return "--";
  const hours = Number(dateTime.slice(11, 13));
  const minutes = dateTime.slice(14, 16);
  const suffix = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${h12}:${minutes} ${suffix}`;
}

const KM_PER_MILE = 1.609344;

// The service sends km; the app shows miles. 5 -> "3.1 mi"
export function formatDistanceMiles(distanceKm) {
  if (!distanceKm) return null;
  return `${(distanceKm / KM_PER_MILE).toFixed(1)} mi`;
}

// Minutes per km from the service -> minutes per mile. 6.25 -> "10:04 /mi"
export function formatPace(paceMinPerKm) {
  if (!paceMinPerKm) return null;
  const paceMinPerMile = paceMinPerKm * KM_PER_MILE;
  let minutes = Math.floor(paceMinPerMile);
  let seconds = Math.round((paceMinPerMile - minutes) * 60);
  if (seconds === 60) {
    minutes += 1;
    seconds = 0;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")} /mi`;
}

// "2026-10-10" -> "Sat, Oct 10"
export function formatDateLabel(dateString) {
  const [y, m, d] = dateString.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// Hypnogram rows, top to bottom. Stages logs use wake/rem/light/deep;
// classic logs (older or short sleeps) use awake/restless/asleep.
export const STAGE_ROWS = ["wake", "rem", "light", "deep"];
export const CLASSIC_ROWS = ["awake", "restless", "asleep"];

// levels: [{ dateTime, level, seconds }] -> rows plus segments placed as
// fractions (0-1) of the night, ready for absolutely positioned Views.
export function buildHypnogram(levels) {
  if (!levels || levels.length === 0) return null;

  const isClassic = levels.some((l) => CLASSIC_ROWS.includes(l.level));
  const rows = isClassic ? CLASSIC_ROWS : STAGE_ROWS;

  const start = new Date(levels[0].dateTime).getTime();
  const last = levels[levels.length - 1];
  const end = new Date(last.dateTime).getTime() + last.seconds * 1000;
  const total = end - start;
  if (!(total > 0)) return null;

  const segments = levels
    .filter((l) => rows.includes(l.level))
    .map((l) => ({
      level: l.level,
      row: rows.indexOf(l.level),
      left: (new Date(l.dateTime).getTime() - start) / total,
      width: (l.seconds * 1000) / total,
    }));

  return { rows, segments };
}
