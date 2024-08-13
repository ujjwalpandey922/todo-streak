import { addDays, differenceInCalendarDays, getDay } from "date-fns";
// Utility function to generate dates between two dates
export const getDatesBetween = (
  startDate: Date,
  endDate: Date,
  scheduledDays: { [key: string]: boolean } | undefined,
  trackingType: "daily" | "weekly"
): Date[] => {
  const dates: Date[] = [];
  let currentDate = startDate;

  // Map day numbers to scheduledDays
  const dayMap: { [key: number]: boolean | undefined } = {
    0: scheduledDays?.sunday, // Sunday
    1: scheduledDays?.monday, // Monday
    2: scheduledDays?.tuesday, // Tuesday
    3: scheduledDays?.wednesday, // Wednesday
    4: scheduledDays?.thursday, // Thursday
    5: scheduledDays?.friday, // Friday
    6: scheduledDays?.saturday, // Saturday
  };
  while (differenceInCalendarDays(endDate, currentDate) >= 0) {
    const dayOfWeek = getDay(currentDate); // Get day of the week (0 = Sunday, 1 = Monday, etc.)

    // If tracking type is "weekly", include all days from Sunday to Saturday
    if (trackingType === "weekly" || dayMap[dayOfWeek]) {
      dates.push(currentDate);
    }

    currentDate = addDays(currentDate, 1);
  }

  return dates;
};
