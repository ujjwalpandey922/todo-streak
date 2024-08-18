import { Todo } from "@/models";
import { addDays, endOfWeek, startOfWeek } from "date-fns";

// Main function to calculate both current and longest streaks for a todo item
export const calculateStreaks = (todo: Todo, currentDate: Date) => {
  let currentStreak = 0;
  let longestStreak = 0;

  // Convert completed dates to a Set for faster lookup
  const completedDatesSet = new Set(
    (todo.completedDates ?? []).map((date) => date.toDateString())
  );

  // Check if the tracking type is daily or weekly and calculate streaks accordingly
  if (todo?.settings?.trackingType === "daily") {
    // Get the days on which the task is scheduled
    const trackingDays = Object.keys(todo.settings.scheduledDays ?? {}).filter(
      (day) => todo.settings.scheduledDays![day]
    );

    // Generate an array of dates from the task's creation date to the current date
    const dateRange = generateFlatDates(todo.createdDate, currentDate);

    // Calculate the current streak based on daily tracking
    currentStreak = calculateDailyCurrentStreak(
      completedDatesSet,
      trackingDays,
      dateRange
    );

    // Calculate the longest streak based on daily tracking
    longestStreak = calculateDailyLongestStreak(
      completedDatesSet,
      trackingDays,
      dateRange,
      currentStreak
    );
  } else if (todo?.settings?.trackingType === "weekly") {
    // Get the weekly target (number of completions required per week)
    const weeklyCount = todo.settings.weeklyTarget || 1;

    // Generate a record of dates grouped by weeks
    const dateRange = generateWeeklyGroupedDates(todo.createdDate, currentDate);

    // Calculate the current streak based on weekly tracking
    currentStreak = calculateWeeklyCurrentStreak(
      completedDatesSet,
      weeklyCount,
      dateRange
    );

    // Calculate the longest streak based on weekly tracking
    longestStreak = calculateWeeklyLongestStreak(
      completedDatesSet,
      weeklyCount,
      dateRange,
      currentStreak
    );
  }

  // Return an object containing both the current and longest streaks
  return {
    currentStreak,
    longestStreak,
  };
};

// Helper function to generate an array of consecutive dates between startDate and endDate
const generateFlatDates = (startDate: Date, endDate: Date): Date[] => {
  const dateArray: Date[] = [];
  let current = new Date(startDate);

  // Loop through each day from startDate to endDate and add it to dateArray
  while (current <= endDate) {
    dateArray.push(new Date(current));
    current = addDays(current, 1);
  }

  return dateArray; // Return the array of dates
};

// Helper function to generate a record of dates grouped by weeks between startDate and endDate
const generateWeeklyGroupedDates = (
  startDate: Date,
  endDate: Date
): Record<number, Date[]> => {
  const groupedDates: Record<number, Date[]> = {};
  let current = startOfWeek(startDate);

  // Loop through each week from startDate to endDate
  while (current <= endDate) {
    const weekStart = startOfWeek(current).getTime(); // Get the timestamp for the start of the week
    const weekEnd = endOfWeek(current); // Get the end of the week
    const weekDates: Date[] = [];

    let tempDate = new Date(current);
    // Loop through each day within the week and add it to weekDates
    while (tempDate <= weekEnd && tempDate <= endDate) {
      weekDates.push(new Date(tempDate));
      tempDate = addDays(tempDate, 1);
    }

    // Store the weekDates array under the corresponding weekStart timestamp
    groupedDates[weekStart] = weekDates;
    current = addDays(weekEnd, 1); // Move to the next week
  }

  return groupedDates; // Return the record of grouped dates
};

// Helper function to check if a given date is included in the completedDates set
const isDateCompleted = (
  date: Date,
  completedDatesSet: Set<string>
): boolean => {
  return completedDatesSet.has(date.toDateString());
};

// Function to calculate the current streak for daily tracking
const calculateDailyCurrentStreak = (
  completedDates: Set<string>, // Set of dates when the task was completed
  trackingDays: string[], // Array of days (e.g., "Mon", "Tue") on which the task should be tracked
  dateRange: Date[] // Array of all dates between the task creation date and the current date
): number => {
  let streak = 0; // Initialize streak counter

  // Map tracking days to the first 3 letters for easy comparison with dates
  const updatedTrackingDays = trackingDays.map((day) => day.slice(0, 3));

  // Loop through dateRange in reverse (starting from the latest date)
  for (let i = dateRange.length - 1; i >= 0; i--) {
    // Check if the current date in the range is in the completedDates set
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
  completedDates: Set<string>, // Set of dates when the task was completed
  weeklyCount: number, // Number of times the task should be completed per week
  dateRange: Record<number, Date[]> // Object with week start timestamps as keys and arrays of dates in that week as values
): number => {
  let streak = 0; // Initialize streak counter

  // Get the week start timestamps and sort them in descending order
  const weeks = Object.keys(dateRange)
    .map(Number)
    .sort((a, b) => b - a);

  // Loop through each week in the sorted order
  for (let i = 0; i < weeks.length; i++) {
    const weekDays = dateRange[weeks[i]]; // Get the array of dates for the current week
    // Calculate the number of completed dates in the current week
    let weekDaysStreak = weekDays.reduce((count, date) => {
      return count + (completedDates.has(date.toDateString()) ? 1 : 0);
    }, 0);

    // If the weekly target is met or exceeded, add to the streak
    if (weekDaysStreak >= weeklyCount) {
      streak += weekDaysStreak;
    } else {
      break; // If the target is not met, stop the streak calculation
    }
  }

  return streak; // Return the final streak count
};

// Function to calculate the longest streak for daily tracking
const calculateDailyLongestStreak = (
  completedDates: Set<string>, // Set of dates when the task was completed
  trackingDays: string[], // Array of days (e.g., "Mon", "Tue") on which the task should be tracked
  dateRange: Date[], // Array of all dates between the task creation date and the current date
  currentStreak: number
): number => {
  let streak = 0; // Initialize streak counter
  let longestStreak = currentStreak; // Initialize the longest streak with the current streak as the base

  // Map tracking days to the first 3 letters for easy comparison with dates
  const updatedTrackingDays = trackingDays.map((day) => day.slice(0, 3));

  // Loop through the date range to calculate the longest streak
  for (let i = 0; i < dateRange.length; i++) {
    // Check if the current date in the range is in the completedDates set
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
  completedDates: Set<string>, // Set of dates when the task was completed
  weeklyCount: number, // Number of times the task should be completed per week
  dateRange: Record<number, Date[]>, // Object with week start timestamps as keys and arrays of dates in that week as values
  currentStreak: number
): number => {
  let streak = 0; // Initialize streak counter
  let longestStreak = currentStreak; // Initialize the longest streak with the current streak as the base

  // Get the week start timestamps and sort them in descending order
  const weeks = Object.keys(dateRange)
    .map(Number)
    .sort((a, b) => b - a);

  // Loop through each week in the sorted order
  for (let i = 0; i < weeks.length; i++) {
    const weekDays = dateRange[weeks[i]]; // Get the array of dates for the current week
    // Calculate the number of completed dates in the current week
    let weekDaysStreak = weekDays.reduce((count, date) => {
      return count + (completedDates.has(date.toDateString()) ? 1 : 0);
    }, 0);

    // If the weekly target is met or exceeded, add to the streak and update longestStreak
    if (weekDaysStreak >= weeklyCount) {
      streak += weekDaysStreak;
      if (streak > longestStreak) {
        longestStreak = streak;
      }
    } else {
      streak = 0; // Reset the streak if the target is not met
    }
  }

  return longestStreak; // Return the longest streak recorded
};
