// YYYY-MM-DD plus n days (calendar arithmetic, no timezone involved)
function addDays(date, n) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// YYYY-MM-DD an activity started on (its local time, as Fitbit reports it)
function activityDate(a) {
  const start = a.startTime || a.originalStartTime;
  return start ? start.slice(0, 10) : null;
}

module.exports = { addDays, activityDate };
