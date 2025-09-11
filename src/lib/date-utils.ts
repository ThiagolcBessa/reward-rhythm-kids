import { startOfWeek, addDays, format } from 'date-fns';

export interface WeekInfo {
  weekStart: Date;
  weekEnd: Date;
  weekStartISO: string;
  weekEndISO: string;
}

/**
 * Given a date, compute the week boundaries (Monday to Sunday)
 */
export const getWeekInfo = (date: Date): WeekInfo => {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday = 1
  const weekEnd = addDays(weekStart, 6); // Sunday
  
  return {
    weekStart,
    weekEnd,
    weekStartISO: format(weekStart, 'yyyy-MM-dd'),
    weekEndISO: format(weekEnd, 'yyyy-MM-dd'),
  };
};

/**
 * Navigate to the next week (+7 days from current week start)
 */
export const getNextWeek = (currentWeekStart: Date): WeekInfo => {
  const nextWeekStart = addDays(currentWeekStart, 7);
  return getWeekInfo(nextWeekStart);
};

/**
 * Navigate to the previous week (-7 days from current week start)
 */
export const getPreviousWeek = (currentWeekStart: Date): WeekInfo => {
  const previousWeekStart = addDays(currentWeekStart, -7);
  return getWeekInfo(previousWeekStart);
};

/**
 * Format a date for calendar headers (EEE dd/MM)
 * Example: "Mon 13/01"
 */
export const formatCalendarHeader = (date: Date): string => {
  return format(date, 'EEE dd/MM');
};

/**
 * Generate array of dates for the current week (Monday to Sunday)
 */
export const getWeekDays = (weekStart: Date): Date[] => {
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
};