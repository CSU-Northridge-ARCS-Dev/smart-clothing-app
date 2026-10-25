// Age in whole years from a date of birth
export const ageFromDob = (dob, now = new Date()) => {
  if (!dob) return null;
  let dobDate;
  if (dob.seconds !== undefined && dob.nanoseconds !== undefined) {
    // A Timestamp read back from AsyncStorage is a plain object without toDate
    dobDate =
      typeof dob.toDate === "function"
        ? dob.toDate()
        : new Date(dob.seconds * 1000);
  } else {
    dobDate = new Date(dob);
  }
  if (isNaN(dobDate.getTime())) return null;

  let age = now.getFullYear() - dobDate.getFullYear();
  if (
    now.getMonth() < dobDate.getMonth() ||
    (now.getMonth() === dobDate.getMonth() && now.getDate() < dobDate.getDate())
  ) {
    age -= 1;
  }
  return age;
};
