export function getDayFromISODate(isoDate) {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const date = new Date(isoDate);
  const dayIndex = date.getDay();
  return daysOfWeek[dayIndex];
}

// ISO to human readable datetime format.
export function convertToReadableFormat(isoString) {
  const date = new Date(isoString);

  // Options for toLocaleString to display in desired format
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // Use 12-hour time format with AM/PM
  };

  // Convert to local string with specified options
  return date.toLocaleString("en-US", options);
}

// Calculate total hours and minutes given two ISO 8601 datetimes.
export function calculateTotalDuration(dates) {
  // Initialize total duration in milliseconds
  let totalDurationMs = 0;

  // Loop through each date range object
  dates.forEach(({ endDate, startDate }) => {
    // Parse dates and calculate difference
    const end = new Date(endDate);
    const start = new Date(startDate);
    const durationMs = end - start;

    // Accumulate total duration
    totalDurationMs += durationMs;
  });

  // Convert milliseconds to hours and minutes
  const totalHours = Math.floor(totalDurationMs / (1000 * 60 * 60));
  const totalMinutes = Math.floor(
    (totalDurationMs % (1000 * 60 * 60)) / (1000 * 60)
  );

  return { totalHours, totalMinutes };
}

// Example usage:
// const dateRanges = [
//   { endDate: '2024-03-21T12:00:00Z', startDate: '2024-03-21T09:00:00Z' },
//   { endDate: '2024-03-22T15:00:00Z', startDate: '2024-03-22T12:30:00Z' },
// ];

// const duration = calculateTotalDuration(dateRanges);
// console.log(`Total Duration: ${duration.totalHours} hours and ${duration.totalMinutes} minutes`);
