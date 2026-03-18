/**
 * Parse club meeting times for calendar display.
 * Handles format: "Tuesday, 7:00 PM to 7:50 PM" or "Saturday, 1:00 PM to 2:00 PM"
 */

import type { IClub } from './clubs';
import { clubToSlug } from './clubUtils';

export interface ParsedClubTime {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startMinutes: number; // minutes from midnight
  endMinutes: number;
  displayTime: string;
}

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/**
 * Parse a time string like "7:00 PM" or "12:30 AM" into minutes from midnight.
 */
function parseTimeToMinutes(timeStr: string): number | null {
  const trimmed = timeStr.trim();
  const match = trimmed.match(
    /^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i
  );
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && hours !== 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

/**
 * Parse club times string into structured data for calendar.
 * Returns null if times string is empty or unparseable.
 */
export function parseClubTimes(times: string): ParsedClubTime | null {
  if (!times || !times.trim()) return null;
  const match = times.match(
    /^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday),\s*(.+?)\s+to\s+(.+)$/i
  );
  if (!match) return null;
  const dayName = match[1];
  const startStr = match[2].trim();
  const endStr = match[3].trim();
  const dayIndex = DAY_NAMES.findIndex(
    (d) => d.toLowerCase() === dayName.toLowerCase()
  );
  if (dayIndex === -1) return null;
  const startMinutes = parseTimeToMinutes(startStr);
  const endMinutes = parseTimeToMinutes(endStr);
  if (startMinutes == null || endMinutes == null) return null;
  if (endMinutes <= startMinutes) return null; // invalid range
  return {
    dayOfWeek: dayIndex,
    startMinutes,
    endMinutes,
    displayTime: times,
  };
}

export interface ClubCalendarEvent {
  club: string;
  slug: string;
  location: string;
  parsed: ParsedClubTime;
}

/**
 * Build calendar events for joined clubs that have parseable times.
 */
export function buildClubCalendarEvents(
  clubs: IClub[],
  joinedSlugs: Set<string>
): ClubCalendarEvent[] {
  const events: ClubCalendarEvent[] = [];
  for (const club of clubs) {
    const slug = clubToSlug(club.club);
    if (!joinedSlugs.has(slug)) continue;
    const parsed = parseClubTimes(club.times);
    if (!parsed) continue;
    events.push({
      club: club.club,
      slug,
      location: club.location || '',
      parsed,
    });
  }
  return events;
}
