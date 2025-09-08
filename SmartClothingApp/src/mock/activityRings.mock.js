// src/mock/activityRings.mock.js
// Goals mirror your UI caps: Move=800 cal, Exercise=90 min, Stand=16 hrs
export const ringData = [
  // Pick any ISO dates—getDayFromISODate will map them to day names.
  { date: "2025-08-18T12:00:00.000Z", energyBurned: 520, energyBurnedGoal: 800, exerciseTime: 41, exerciseTimeGoal: 90, standHours: 12, standHoursGoal: 16 }, // Mon
  { date: "2025-08-19T12:00:00.000Z", energyBurned: 610, energyBurnedGoal: 800, exerciseTime: 52, exerciseTimeGoal: 90, standHours: 13, standHoursGoal: 16 }, // Tue
  { date: "2025-08-20T12:00:00.000Z", energyBurned: 740, energyBurnedGoal: 800, exerciseTime: 63, exerciseTimeGoal: 90, standHours: 15, standHoursGoal: 16 }, // Wed
  { date: "2025-08-21T12:00:00.000Z", energyBurned: 455, energyBurnedGoal: 800, exerciseTime: 28, exerciseTimeGoal: 90, standHours: 10, standHoursGoal: 16 }, // Thu
  { date: "2025-08-22T12:00:00.000Z", energyBurned: 800, energyBurnedGoal: 800, exerciseTime: 90, exerciseTimeGoal: 90, standHours: 16, standHoursGoal: 16 }, // Fri (perfect)
  { date: "2025-08-23T12:00:00.000Z", energyBurned: 385, energyBurnedGoal: 800, exerciseTime: 21, exerciseTimeGoal: 90, standHours: 9,  standHoursGoal: 16 }, // Sat
  { date: "2025-08-24T12:00:00.000Z", energyBurned: 675, energyBurnedGoal: 800, exerciseTime: 58, exerciseTimeGoal: 90, standHours: 14, standHoursGoal: 16 }, // Sun
];
