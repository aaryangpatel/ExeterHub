'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  buildClubCalendarEvents,
  type ClubCalendarEvent,
} from '../lib/clubCalendar';
import type { IClub } from '../lib/clubs';
import { useJoinedClubs } from '../lib/useJoinedClubs';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const START_HOUR = 12; // noon
const END_HOUR = 23; // 11 PM

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function EventBlock({
  event,
  hour,
}: {
  event: ClubCalendarEvent;
  hour: number;
}) {
  const { parsed } = event;
  const cellStart = hour * 60;
  const cellEnd = (hour + 1) * 60;
  const topMinutes = Math.max(0, parsed.startMinutes - cellStart);
  const endInCell = Math.min(parsed.endMinutes, cellEnd);
  const durationInCell = endInCell - parsed.startMinutes;
  const topPercent = (topMinutes / 60) * 100;
  const heightPercent = (durationInCell / 60) * 100;

  return (
    <Link href={`/club/${event.slug}`}>
      <a
        className="absolute left-1 right-1 overflow-hidden rounded bg-exeter px-2 py-1 text-xs font-medium text-white shadow hover:bg-exeter-600 dark:bg-exeter-600 dark:hover:bg-exeter-500"
        style={{
          top: `${topPercent}%`,
          height: `${heightPercent}%`,
        }}
      >
        <div className="truncate font-display font-bold">{event.club}</div>
        <div className="truncate text-white/90">
          {formatTime(parsed.startMinutes)} – {formatTime(parsed.endMinutes)}
        </div>
        {event.location && (
          <div className="truncate text-white/80">{event.location}</div>
        )}
      </a>
    </Link>
  );
}

export default function ClubCalendarClient({ clubs }: { clubs: IClub[] }) {
  const { user } = useAuth();
  const { joined } = useJoinedClubs();

  const events = useMemo(
    () => buildClubCalendarEvents(clubs, joined),
    [clubs, joined]
  );

  const eventsByDay = useMemo(() => {
    const byDay: Record<number, ClubCalendarEvent[]> = {};
    for (let d = 0; d < 7; d++) byDay[d] = [];
    for (const e of events) {
      byDay[e.parsed.dayOfWeek].push(e);
    }
    for (const day of Object.values(byDay)) {
      day.sort((a, b) => a.parsed.startMinutes - b.parsed.startMinutes);
    }
    return byDay;
  }, [events]);

  if (!user) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-12 text-center dark:border-neutral-500 dark:bg-neutral-600">
        <p className="font-display text-lg text-gray-700 dark:text-neutral-200">
          Sign in to save your club calendar.
        </p>
        <p className="mt-2 font-display text-sm text-neutral-500 dark:text-neutral-400">
          Your joined clubs will be saved to your account.
        </p>
        <Link href="/login">
          <a className="mt-4 inline-block rounded-lg bg-exeter px-4 py-2 font-display font-bold text-white hover:bg-exeter-600 dark:bg-exeter-200 dark:text-exeter-900 dark:hover:bg-exeter-300">
            Sign in
          </a>
        </Link>
      </div>
    );
  }

  if (joined.size === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-12 text-center dark:border-neutral-500 dark:bg-neutral-600">
        <p className="font-display text-lg text-gray-700 dark:text-neutral-200">
          You haven&apos;t joined any clubs yet.
        </p>
        <p className="mt-2 font-display text-sm text-neutral-500 dark:text-neutral-400">
          Browse clubs and click &quot;Join Club&quot; to add them to your calendar.
        </p>
        <Link href="/clubs">
          <a className="mt-4 inline-block rounded-lg bg-exeter px-4 py-2 font-display font-bold text-white hover:bg-exeter-600 dark:bg-exeter-200 dark:text-exeter-900 dark:hover:bg-exeter-300">
            Browse Clubs
          </a>
        </Link>
      </div>
    );
  }

  const hasEvents = events.length > 0;
  if (!hasEvents) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-12 dark:border-neutral-500 dark:bg-neutral-600">
        <p className="font-display text-lg text-gray-700 dark:text-neutral-200">
          Your joined clubs don&apos;t have scheduled meeting times yet.
        </p>
        <p className="mt-2 font-display text-sm text-neutral-500 dark:text-neutral-400">
          Clubs with times will appear here when they&apos;re added.
        </p>
      </div>
    );
  }

  const hours = Array.from(
    { length: END_HOUR - START_HOUR },
    (_, i) => START_HOUR + i
  );

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[600px] grid-cols-8 gap-px rounded-lg border border-neutral-200 bg-neutral-200 dark:border-neutral-500 dark:bg-neutral-500">
        <div className="rounded-tl-lg bg-neutral-100 p-2 dark:bg-neutral-700" />
        {DAY_NAMES.map((name) => (
          <div
            key={name}
            className="bg-neutral-100 p-2 text-center font-display font-bold text-gray-700 dark:bg-neutral-700 dark:text-white"
          >
            {name}
          </div>
        ))}
        {hours.flatMap((hour) => [
          <div
            key={`time-${hour}`}
            className="bg-neutral-100 p-1 text-right font-mono text-xs text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400"
          >
            {hour > 12 ? hour - 12 : hour === 12 ? 12 : hour}:00
            {hour >= 12 ? 'PM' : 'AM'}
          </div>,
          ...([0, 1, 2, 3, 4, 5, 6] as const).map((day) => (
            <div
              key={`${day}-${hour}`}
              className="relative min-h-[60px] bg-white dark:bg-neutral-600"
            >
              {eventsByDay[day]
                .filter(
                  (e) =>
                    e.parsed.startMinutes >= hour * 60 &&
                    e.parsed.startMinutes < (hour + 1) * 60
                )
                .map((e) => (
                  <EventBlock key={e.slug} event={e} hour={hour} />
                ))}
            </div>
          )),
        ])}
      </div>
    </div>
  );
}
