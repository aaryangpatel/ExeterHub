/**
 * React hook for joined clubs state.
 * Uses Firestore when user is logged in. Requires sign-in for join/leave.
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  addJoinedClub,
  getJoinedClubsData,
  removeJoinedClub,
} from './firestore';

const STORAGE_EVENT = 'exeter-joined-clubs-changed';

function notifyChange(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT));
  }
}

export function useJoinedClubs() {
  const { user } = useAuth();
  const [joined, setJoined] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    if (user) {
      const data = await getJoinedClubsData(user.uid);
      setJoined(data);
    } else {
      setJoined([]);
    }
  }, [user]);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener(STORAGE_EVENT, handler);
    return () => window.removeEventListener(STORAGE_EVENT, handler);
  }, [refresh]);

  const handleJoin = useCallback(
    async (slug: string) => {
      if (user) {
        await addJoinedClub(user.uid, slug);
        setJoined((prev) => (prev.includes(slug) ? prev : [...prev, slug]));
        notifyChange();
      }
    },
    [user]
  );

  const handleLeave = useCallback(
    async (slug: string) => {
      if (user) {
        await removeJoinedClub(user.uid, slug);
        setJoined((prev) => prev.filter((s) => s !== slug));
        notifyChange();
      }
    },
    [user]
  );

  return {
    joined: new Set(joined),
    joinedList: joined,
    joinClub: handleJoin,
    leaveClub: handleLeave,
    isJoined: (slug: string) => joined.includes(slug),
  };
}
