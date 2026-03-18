'use client';

import Link from 'next/link';
import { BsCalendarPlus, BsCalendarCheck } from 'react-icons/bs';
import { useAuth } from '../contexts/AuthContext';
import { useJoinedClubs } from '../lib/useJoinedClubs';

interface JoinClubButtonProps {
  slug: string;
  clubName?: string;
  variant?: 'detail' | 'card';
}

/**
 * Join/Leave club button. Requires sign-in. Saves to Firestore.
 */
export default function JoinClubButton({
  slug,
  variant = 'detail',
}: JoinClubButtonProps) {
  const { user } = useAuth();
  const { isJoined, joinClub, leaveClub } = useJoinedClubs();
  const joined = isJoined(slug);

  if (!user) {
    if (variant === 'card') {
      return (
        <Link href="/login">
          <a className="flex items-center gap-2 rounded-lg bg-exeter px-3 py-1.5 text-sm font-bold text-white hover:bg-exeter-600 dark:bg-exeter-200 dark:text-exeter-900 dark:hover:bg-exeter-300">
            <BsCalendarPlus /> Sign in to join
          </a>
        </Link>
      );
    }
    return (
      <Link href="/login">
        <a className="flex w-fit items-center gap-2 rounded-lg bg-exeter px-4 py-2 font-display font-bold text-white hover:bg-exeter-600 dark:bg-exeter-200 dark:text-exeter-900 dark:hover:bg-exeter-300">
          <BsCalendarPlus className="text-lg" /> Sign in to join
        </a>
      </Link>
    );
  }

  if (variant === 'card') {
    return (
      <button
        type="button"
        onClick={() => (joined ? leaveClub(slug) : joinClub(slug))}
        className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-bold transition-colors ${
          joined
            ? 'bg-exeter/20 text-exeter hover:bg-exeter/30 dark:bg-exeter-200/30 dark:text-exeter-200'
            : 'bg-exeter text-white hover:bg-exeter-600 dark:bg-exeter-200 dark:text-exeter-900 dark:hover:bg-exeter-300'
        }`}
      >
        {joined ? (
          <>
            <BsCalendarCheck /> Joined
          </>
        ) : (
          <>
            <BsCalendarPlus /> Join Club
          </>
        )}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => (joined ? leaveClub(slug) : joinClub(slug))}
        className={`flex w-fit items-center gap-2 rounded-lg px-4 py-2 font-display font-bold transition-colors ${
          joined
            ? 'bg-exeter/20 text-exeter hover:bg-exeter/30 dark:bg-exeter-200/30 dark:text-exeter-200'
            : 'bg-exeter text-white hover:bg-exeter-600 dark:bg-exeter-200 dark:text-exeter-900 dark:hover:bg-exeter-300'
        }`}
      >
        {joined ? (
          <>
            <BsCalendarCheck className="text-lg" /> Leave Club
          </>
        ) : (
          <>
            <BsCalendarPlus className="text-lg" /> Join Club
          </>
        )}
      </button>
      {joined && (
        <Link href="/clubs/calendar">
          <a className="font-display text-sm text-exeter hover:underline dark:text-exeter-200">
            View in My Club Calendar →
          </a>
        </Link>
      )}
    </div>
  );
}
