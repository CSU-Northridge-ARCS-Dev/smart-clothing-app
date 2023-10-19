export function getFormattedDate(date) {
  // Extract month, day, and year components from the Date object
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is 0-based, so we add 1
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear().toString();

  // Format the date as MM/DD/YYYY
  return `${month}/${day}/${year}`;
}
