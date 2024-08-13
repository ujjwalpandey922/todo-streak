import { Todo } from "@/models";
import { addDays, endOfWeek, isSameDay, startOfWeek } from "date-fns";

// Main function to calculate both current and longest streaks for a todo item
export const calculateStreaks = (todo: Todo, currentDate: Date) => {
  let currentStreak = 0;
  let longestStreak = 0;
  // Determine whether the todo item is daily or weekly and calculate streaks accordingly
  if (todo?.settings?.trackingType === "daily") {
    // Tracking Days is an array of strings containing the days of the week that the user wants to track
    const trackingDays = Object.keys(todo.settings.scheduledDays ?? {}).filter(
      (day) => todo.settings.scheduledDays![day]
    );
    // Generate an array of dates between the created date and the current date
    const dateRange = generateFlatDates(todo.createdDate, currentDate);
    // Calculate the current and longest streaks
    currentStreak = calculateDailyCurrentStreak(
      todo.completedDates ?? [],
      trackingDays,
      dateRange
    );
    longestStreak = calculateDailyLongestStreak(
      todo.completedDates ?? [],
      trackingDays,
      dateRange
    );
  } else if (todo?.settings?.trackingType === "weekly") {
    // Get the weekly count from the settings
    const weeklyCount = todo.settings.weeklyTarget || 1;
    // Again We need to generate the weekly grouped dates All 7 Days In this Case
    const dateRange = generateWeeklyGroupedDates(todo.createdDate, currentDate);
    // Calculate the current and longest streaks
    currentStreak = calculateWeeklyCurrentStreak(
      todo.completedDates ?? [],
      weeklyCount,
      dateRange
    );
    longestStreak = calculateWeeklyLongestStreak(
      todo.completedDates ?? [],
      weeklyCount,
      dateRange
    );
    console.log({
      completedDateS: todo.completedDates,
      dateRange,
    });
  }
  // Return an object containing the current and longest streaks
  return {
    currentStreak,
    longestStreak,
  };
};

// Helper function to generate an array of consecutive dates between startDate and endDate
const generateFlatDates = (startDate: Date, endDate: Date): Date[] => {
  const dateArray: Date[] = [];
  let current = new Date(startDate);

  // Loop through each day and add it to dateArray
  while (current <= endDate) {
    dateArray.push(new Date(current));
    current = addDays(current, 1);
  }

  return dateArray;
};

// Helper function to generate a record of dates grouped by weeks between startDate and endDate
const generateWeeklyGroupedDates = (
  startDate: Date,
  endDate: Date
): Record<number, Date[]> => {
  const groupedDates: Record<number, Date[]> = {};
  let current = startOfWeek(startDate);

  // Loop through each week and group dates within the week
  while (current <= endDate) {
    const weekStart = startOfWeek(current).getTime();
    const weekEnd = endOfWeek(current);
    const weekDates: Date[] = [];

    let tempDate = new Date(current);
    while (tempDate <= weekEnd && tempDate <= endDate) {
      weekDates.push(new Date(tempDate));
      tempDate = addDays(tempDate, 1);
    }

    groupedDates[weekStart] = weekDates;
    current = addDays(weekEnd, 1);
  }

  return groupedDates;
};

// Helper function to check if a given date is included in the completedDates array
const isDateCompleted = (date: Date, completedDates: Date[]): boolean => {
  return completedDates.some((completedDate) => isSameDay(completedDate, date));
};

// Function to calculate the current streak for daily tracking
const calculateDailyCurrentStreak = (
  completedDates: Date[], // Array of dates when the task was completed
  trackingDays: string[], // Array of days (e.g., "Mon", "Tue") on which the task should be tracked
  dateRange: Date[] // Array of all dates between the task creation date and the current date
): number => {
  let streak = 0; // Initialize streak counter
  // Map tracking days to the first 3 letters for easy comparison with dates
  const updatedTrackingDays = trackingDays.map((day) => day.slice(0, 3));
  // Loop through dateRange in reverse (starting from the latest date)
  for (let i = dateRange.length - 1; i >= 0; i--) {
    // Check if the current date in the range is in the completedDates array
    if (isDateCompleted(dateRange[i], completedDates)) {
      streak += 1; // Increment the streak if the date is found in completedDates
    } else if (
      // If the current date matches a scheduled tracking day, break the loop
      updatedTrackingDays.includes(
        dateRange[i].toLocaleString("en-US", { weekday: "short" }).toLowerCase()
      )
    ) {
      break; // Stop the streak if the task was not completed on a scheduled day
    }
  }
  return streak; // Return the final streak count
};

// Function to calculate the current streak for weekly tracking
const calculateWeeklyCurrentStreak = (
  completedDates: Date[], // Array of dates when the task was completed
  weeklyCount: number, // Number of times the task should be completed per week
  dateRange: Record<number, Date[]> // Object with week start timestamps as keys and arrays of dates in that week as values
): number => {
  let streak = 0; // Initialize streak counter
  // Get the week start timestamps and sort them in descending order
  const weeks = Object.keys(dateRange)
    .map(Number)
    .sort((a, b) => b - a);
  // Loop through the weeks to calculate the streak
  for (let i = 0; i < weeks.length; i++) {
    let weekDaysStreak = 0; // Initialize counter for the current week's streak
    const weekDays = dateRange[weeks[i]]; // Get all dates in the current week
    // Loop through each date in the week
    for (let j = 0; j < weekDays.length; j++) {
      // Check if the date is in the completedDates array
      if (isDateCompleted(weekDays[j], completedDates)) {
        weekDaysStreak += 1; // Increment the weekDaysStreak if the date is found
      }
    }
    // If it's the first week or the weekDaysStreak meets the weekly target, add to the total streak
    if (i === 0 || weekDaysStreak >= weeklyCount) {
      streak += weekDaysStreak;
    } else {
      break; // Stop counting if the streak is broken
    }
  }
  return streak; // Return the final streak count
};

// Function to calculate the longest streak for daily tracking
const calculateDailyLongestStreak = (
  completedDates: Date[], // Array of dates when the task was completed
  trackingDays: string[], // Array of days (e.g., "Mon", "Tue") on which the task should be tracked
  dateRange: Date[] // Array of all dates between the task creation date and the current date
): number => {
  let streak = 0; // Initialize streak counter
  // Calculate the current streak as the initial longest streak
  let longestStreak = calculateDailyCurrentStreak(
    completedDates,
    trackingDays,
    dateRange
  );
  // Map tracking days to the first 3 letters for easy comparison with dates
  const updatedTrackingDays = trackingDays.map((day) => day.slice(0, 3));
  // Loop through the date range to calculate the longest streak
  for (let i = 0; i < dateRange.length; i++) {
    // Check if the current date in the range is in the completedDates array
    if (isDateCompleted(dateRange[i], completedDates)) {
      streak += 1; // Increment the streak if the date is found in completedDates
      // Update the longest streak if the current streak exceeds the previous longest
      if (streak > longestStreak) {
        longestStreak = streak;
      }
    } else if (
      // If the current date matches a scheduled tracking day, reset the streak
      updatedTrackingDays.includes(
        dateRange[i].toLocaleString("en-US", { weekday: "short" }).toLowerCase()
      )
    ) {
      streak = 0; // Reset the streak if a required tracking day is missed
    }
  }
  return longestStreak; // Return the longest streak recorded
};

// Function to calculate the longest streak for weekly tracking
const calculateWeeklyLongestStreak = (
  completedDates: Date[], // Array of dates when the task was completed
  weeklyCount: number, // Number of times the task should be completed per week
  dateRange: Record<number, Date[]> // Object with week start timestamps as keys and arrays of dates in that week as values
): number => {
  let streak = 0; // Initialize streak counter
  // Calculate the current streak as the initial longest streak
  let longestStreak = calculateWeeklyCurrentStreak(
    completedDates,
    weeklyCount,
    dateRange
  );
  // Get the week start timestamps and sort them in descending order
  const weeks = Object.keys(dateRange)
    .map(Number)
    .sort((a, b) => b - a);
  // Loop through the weeks to calculate the longest streak
  for (let i = 0; i < weeks.length; i++) {
    let weekDaysStreak = 0; // Initialize counter for the current week's streak
    const weekDays = dateRange[weeks[i]]; // Get all dates in the current week
    // Loop through each date in the week
    for (let j = 0; j < weekDays.length; j++) {
      // Check if the date is in the completedDates array
      if (isDateCompleted(weekDays[j], completedDates)) {
        weekDaysStreak += 1; // Increment the weekDaysStreak if the date is found
      }
    }
    // If the current weekDaysStreak meets or exceeds the weekly target, add to the total streak
    if (weekDaysStreak >= weeklyCount) {
      streak += weekDaysStreak;
      // Update the longest streak if the current streak exceeds the previous longest
      if (streak > longestStreak) {
        longestStreak = streak;
      }
    } else {
      streak = 0; // Reset the streak if the weekly target is not met
    }
  }
  return longestStreak; // Return the longest streak recorded
};
