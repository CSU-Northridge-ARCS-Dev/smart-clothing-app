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
