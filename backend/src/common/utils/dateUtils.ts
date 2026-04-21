import { 
  addDays, 
  isWeekend, 
  startOfDay, 
  differenceInDays, 
  eachDayOfInterval,
  format
} from 'date-fns';
import { holidaysService } from '../../modules/holidays/Holidays.service';

/**
 * Calculates the number of "billable" leave days between two dates,
 * excluding weekends and public holidays.
 */
export async function calculateNetLeaveDays(
  startDate: Date, 
  endDate: Date, 
  country: string = 'US'
): Promise<number> {
  const start = startOfDay(startDate);
  const end = startOfDay(endDate);

  if (start > end) return 0;

  const daysInterval = eachDayOfInterval({ start, end });
  const holidayDates = await holidaysService.getHolidaysInRange(start, end, country);
  
  // Format for easy comparison
  const holidayStrings = holidayDates.map(d => format(d, 'yyyy-MM-dd'));

  let count = 0;
  for (const day of daysInterval) {
    if (isWeekend(day)) continue;
    if (holidayStrings.includes(format(day, 'yyyy-MM-dd'))) continue;
    count++;
  }

  return count;
}

export function isBusinessDay(date: Date): boolean {
  return !isWeekend(date);
}
