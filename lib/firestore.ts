import {
  doc,
  getDoc,
  setDoc,
  type DocumentReference,
  type Firestore,
} from 'firebase/firestore';
import { db } from './firebase';

const PLANNER_COLLECTION = 'planners';
const CLUBS_COLLECTION = 'joinedClubs';

function getDb(): Firestore {
  if (!db) throw new Error('Firebase not initialized');
  return db;
}

export interface PlannerData {
  entryYear: number;
  plannedByTerm: Record<string, string[]>;
}

export interface JoinedClubsData {
  clubs: string[];
}

function plannerRef(uid: string): DocumentReference {
  return doc(getDb(), PLANNER_COLLECTION, uid);
}

function clubsRef(uid: string): DocumentReference {
  return doc(getDb(), CLUBS_COLLECTION, uid);
}

export async function getPlannerData(uid: string): Promise<PlannerData | null> {
  const snap = await getDoc(plannerRef(uid));
  if (!snap.exists()) return null;
  return snap.data() as PlannerData;
}

export async function setPlannerData(
  uid: string,
  data: PlannerData
): Promise<void> {
  await setDoc(plannerRef(uid), data);
}

export async function getJoinedClubsData(uid: string): Promise<string[]> {
  const snap = await getDoc(clubsRef(uid));
  if (!snap.exists()) return [];
  const d = snap.data() as JoinedClubsData;
  return Array.isArray(d.clubs) ? d.clubs : [];
}

export async function setJoinedClubsData(
  uid: string,
  clubs: string[]
): Promise<void> {
  await setDoc(clubsRef(uid), { clubs });
}

export async function addJoinedClub(uid: string, slug: string): Promise<void> {
  const current = await getJoinedClubsData(uid);
  if (current.includes(slug)) return;
  await setJoinedClubsData(uid, [...current, slug]);
}

export async function removeJoinedClub(uid: string, slug: string): Promise<void> {
  const current = await getJoinedClubsData(uid);
  await setJoinedClubsData(uid, current.filter((s) => s !== slug));
}
