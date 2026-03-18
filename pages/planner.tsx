import { InferGetStaticPropsType } from 'next';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAllCourses } from '../lib/courses';
import { searchCourses } from '../lib/courseSearch';
import {
  getPlannerData,
  setPlannerData,
} from '../lib/firestore';
import {
  getTermOrder,
  validatePrereqs,
  computeProgress,
  type UnmetPrereq,
  type RequirementProgress,
} from '../lib/plannerValidation';
import {
  GRADUATION_REQUIREMENTS,
  type EntryYear,
} from '../lib/graduationRequirements';
import type { ICourse } from '../types';

interface PlannerState {
  entryYear: EntryYear;
  plannedByTerm: Record<string, string[]>;
}

const DEFAULT_SLOTS_PER_TERM = 6;

function CourseCell({
  value,
  onChange,
  courses,
  coursesMap,
  unmetPrereqs,
  isPeSlot,
}: {
  value: string;
  onChange: (v: string) => void;
  courses: ICourse[];
  coursesMap: Map<string, ICourse>;
  unmetPrereqs: UnmetPrereq[];
  isPeSlot: boolean;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const results = searchCourses(courses, query, 12);
  const hasUnmet = unmetPrereqs.some((u) => u.courseNo === value);

  const showResults = open && (focused || query.length > 0);

  const handleSelect = useCallback(
    (courseNo: string) => {
      onChange(courseNo);
      setQuery('');
      setOpen(false);
    },
    [onChange]
  );

  return (
    <div className="relative">
      <input
        type="text"
        value={query || (value ? (coursesMap.get(value)?.course_no ?? value) : '')}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (!e.target.value) onChange('');
        }}
        onFocus={() => {
          setFocused(true);
          setOpen(true);
        }}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        placeholder={isPeSlot ? 'PE' : 'Course...'}
        className={`w-full rounded border px-2 py-1.5 text-sm font-mono dark:bg-neutral-700 dark:text-white ${
          hasUnmet ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-500'
        }`}
      />
      {showResults && (
        <ul className="absolute top-full left-0 right-0 z-20 mt-1 max-h-48 overflow-auto rounded border border-neutral-300 bg-white shadow-lg dark:border-neutral-600 dark:bg-neutral-800">
          {isPeSlot && (
            <li
              className="cursor-pointer px-3 py-2 font-mono text-sm hover:bg-exeter/20 dark:hover:bg-neutral-600"
              onMouseDown={() => handleSelect('PE')}
            >
              PE (Physical Education)
            </li>
          )}
          {results.map((c) => (
            <li
              key={c.course_no}
              className="cursor-pointer px-3 py-2 font-mono text-sm hover:bg-exeter/20 dark:hover:bg-neutral-600"
              onMouseDown={() => handleSelect(c.course_no)}
            >
              <span className="font-bold">{c.course_no}</span> {c.lt}
            </li>
          ))}
          {!isPeSlot && results.length === 0 && query.length > 0 && (
            <li className="px-3 py-2 text-sm text-neutral-500">No matches</li>
          )}
        </ul>
      )}
    </div>
  );
}

function RequirementProgressBar({ prog }: { prog: RequirementProgress }) {
  const total = typeof prog.total === 'number' ? prog.total : 0;
  const fulfilled = typeof prog.fulfilled === 'number' ? prog.fulfilled : 0;
  const pct = total > 0 ? Math.min(100, (fulfilled / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-sm">
        <span className="font-display text-neutral-800 dark:text-neutral-100">
          {prog.department}
        </span>
        <span
          className={`font-mono ${prog.met ? 'text-green-600 dark:text-green-400' : 'text-neutral-500'}`}
        >
          {Array.isArray(prog.required)
            ? `${prog.fulfilled}/${prog.total}`
            : `${fulfilled}/${total}`}
          {prog.met && ' ✓'}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-600">
        <div
          style={{ width: `${pct}%` }}
          className={`h-full rounded-full ${
            prog.met
              ? 'bg-green-500 dark:bg-green-600'
              : 'bg-exeter dark:bg-exeter-400'
          }`}
        />
      </div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        {prog.specifics}
      </p>
    </div>
  );
}

const DEFAULT_STATE: PlannerState = {
  entryYear: 9,
  plannedByTerm: {},
};

export default function Planner({
  courses,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { user } = useAuth();
  const [state, setState] = useState<PlannerState>(DEFAULT_STATE);
  const [mounted, setMounted] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const coursesMap = new Map(courses.map((c) => [c.course_no, c]));

  useEffect(() => {
    if (!mounted || !user) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      setPlannerData(user.uid, state);
      saveTimeoutRef.current = null;
    }, 500);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [state, mounted, user]);

  useEffect(() => {
    let cancelled = false;
    if (user) {
      getPlannerData(user.uid).then((data) => {
        if (!cancelled && data) {
          setState({
            entryYear: (data.entryYear as EntryYear) ?? 9,
            plannedByTerm: data.plannedByTerm ?? {},
          });
        }
      });
    } else {
      setState(DEFAULT_STATE);
    }
    setMounted(true);
    return () => {
      cancelled = true;
    };
  }, [user]);

  const setEntryYear = useCallback((y: EntryYear) => {
    setState((s) => ({ ...s, entryYear: y }));
  }, []);

  const setPlanned = useCallback(
    (termKey: string, slotIndex: number, value: string) => {
      setState((s) => {
        const arr = [...(s.plannedByTerm[termKey] ?? [])];
        while (arr.length <= slotIndex) arr.push('');
        arr[slotIndex] = value;
        return { ...s, plannedByTerm: { ...s.plannedByTerm, [termKey]: arr } };
      });
    },
    []
  );

  const getPlanned = useCallback(
    (termKey: string, slotIndex: number) => {
      const arr = state.plannedByTerm[termKey] ?? [];
      return arr[slotIndex] ?? '';
    },
    [state.plannedByTerm]
  );

  const termOrder = getTermOrder(state.entryYear);
  const unmetPrereqs = validatePrereqs(
    state.plannedByTerm,
    coursesMap,
    state.entryYear
  );
  const progress = computeProgress(
    state.plannedByTerm,
    state.entryYear,
    coursesMap
  );

  const unmetByCourse = new Map<string, string[]>();
  for (const u of unmetPrereqs) {
    unmetByCourse.set(u.courseNo, u.missingPrereqs);
  }

  return (
    <div>
      <div className="bg-exeter px-8 py-16 dark:bg-neutral-800 lg:px-40">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-black text-white md:text-5xl">
              Course Planner
            </h1>
            <p className="mt-2 font-display text-lg text-white/90">
              Plan your courses for all 4 years. Select your entry year below.
            </p>
          </div>
          {!user && (
            <Link href="/login">
              <a className="rounded-lg bg-white/20 px-4 py-2 font-display font-bold text-white hover:bg-white/30">
                Sign in to save
              </a>
            </Link>
          )}
        </div>
      </div>

      <div className="px-8 py-8 lg:px-40">
        <div className="mb-8 flex flex-wrap gap-2">
          {([9, 10, 11, 12] as EntryYear[]).map((y) => (
            <button
              key={y}
              onClick={() => setEntryYear(y)}
              className={`rounded-lg px-4 py-2 font-display font-bold transition-colors ${
                state.entryYear === y
                  ? 'bg-exeter text-white dark:bg-exeter-400'
                  : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-500'
              }`}
            >
              {y === 9 && '9th (4-Year)'}
              {y === 10 && '10th (3-Year)'}
              {y === 11 && '11th (2-Year)'}
              {y === 12 && '12th / PG (1-Year)'}
            </button>
          ))}
        </div>

        <div className="mb-4 font-display text-sm text-neutral-600 dark:text-neutral-400">
          {GRADUATION_REQUIREMENTS[state.entryYear].label}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="overflow-x-auto rounded-lg border border-neutral-300 dark:border-neutral-600">
              <table className="w-full min-w-[600px] border-collapse">
                <thead>
                  <tr className="bg-neutral-100 dark:bg-neutral-700">
                    <th className="border-b border-r border-neutral-300 px-3 py-2 text-left font-display dark:border-neutral-600">
                      Term
                    </th>
                    {Array.from({ length: DEFAULT_SLOTS_PER_TERM }, (_, i) => (
                      <th
                        key={i}
                        className="border-b border-neutral-300 px-2 py-2 text-center font-mono text-xs dark:border-neutral-600"
                      >
                        {i < 5 ? `Course ${i + 1}` : 'PE'}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {termOrder.map((termKey) => {
                    const [year, season] = termKey.split('_');
                    const label = `${year.charAt(0).toUpperCase() + year.slice(1)} ${season.charAt(0).toUpperCase() + season.slice(1)}`;
                    return (
                      <tr
                        key={termKey}
                        className="border-b border-neutral-200 dark:border-neutral-600"
                      >
                        <td className="border-r border-neutral-300 px-3 py-2 font-display dark:border-neutral-600">
                          {label}
                        </td>
                        {Array.from(
                          { length: DEFAULT_SLOTS_PER_TERM },
                          (_, i) => (
                            <td
                              key={i}
                              className="border-r border-neutral-200 px-2 py-1.5 last:border-r-0 dark:border-neutral-600"
                            >
                              <CourseCell
                                value={getPlanned(termKey, i)}
                                onChange={(v) => setPlanned(termKey, i, v)}
                                courses={courses}
                                coursesMap={coursesMap}
                                unmetPrereqs={unmetPrereqs}
                                isPeSlot={i === 5}
                              />
                            </td>
                          )
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {unmetPrereqs.length > 0 && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                <h3 className="font-display font-bold text-amber-800 dark:text-amber-200">
                  Prerequisite warnings
                </h3>
                <ul className="mt-2 space-y-1 text-sm text-amber-700 dark:text-amber-300">
                  {unmetPrereqs.map((u) => (
                    <li key={u.courseNo}>
                      <Link href={`/course/${u.courseNo}`}>
                        <a className="font-mono font-bold underline">
                          {u.courseNo}
                        </a>
                      </Link>{' '}
                      requires{' '}
                      {u.missingPrereqs.map((p, i) => (
                        <span key={p}>
                          {i > 0 && ', '}
                          <Link href={`/course/${p}`}>
                            <a className="font-mono underline">{p}</a>
                          </Link>
                        </span>
                      ))}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-neutral-300 bg-neutral-50 p-4 dark:border-neutral-600 dark:bg-neutral-800">
            <h2 className="mb-4 font-display text-xl font-bold text-neutral-800 dark:text-neutral-100">
              Graduation Progress
            </h2>
            <div className="space-y-4">
              {progress.map((p) => (
                <RequirementProgressBar key={p.department} prog={p} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getStaticProps() {
  const courses = getAllCourses().filter((c) => c.course_no !== 'PEA000');
  return { props: { courses } };
}
