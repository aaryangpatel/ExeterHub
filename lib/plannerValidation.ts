/**
 * Validates planned courses against prerequisites and graduation requirements.
 * Works with course data passed from getStaticProps (client-safe).
 */

import type { ICourse } from '../types';
import {
  GRADUATION_REQUIREMENTS,
  SUBJ_TO_DEPARTMENT,
  type EntryYear,
} from './graduationRequirements';

export interface UnmetPrereq {
  courseNo: string;
  missingPrereqs: string[];
}

export interface RequirementProgress {
  department: string;
  required: number | string[] | string;
  fulfilled: number;
  total: number;
  met: boolean;
  specifics: string;
}

/** Parse prereq string (e.g. "ARA111|ARA121" or "HHD240|HHD310") into course IDs. */
function parsePrereqString(pre: string | null): string[] {
  if (!pre) return [];
  const ids: string[] = [];
  let i = 0;
  while (i < pre.length && pre[i] !== '/') {
    const id = pre.substring(i, i + 6);
    if (id && id !== 'PEA000') ids.push(id);
    i += 6;
    if (pre[i] === '|') i++;
    if (pre[i] === '/') break;
  }
  return ids;
}

/** Get term order for a given entry year. */
export function getTermOrder(entryYear: EntryYear): string[] {
  const yearLabels = ['prep', 'lower', 'upper', 'senior'];
  const startIdx = entryYear === 9 ? 0 : entryYear === 10 ? 1 : entryYear === 11 ? 2 : 3;
  const terms: string[] = [];
  for (let y = startIdx; y < 4; y++) {
    const year = yearLabels[y];
    terms.push(`${year}_fall`, `${year}_winter`, `${year}_spring`);
  }
  return terms;
}

/**
 * Validates that all prerequisites for planned courses are satisfied in earlier terms.
 * @param plannedByTerm - Map of termKey (e.g. "prep_fall") to array of course_no
 * @param coursesMap - Map of course_no to ICourse
 * @param entryYear - Entry year (9, 10, 11, 12)
 */
export function validatePrereqs(
  plannedByTerm: Record<string, string[]>,
  coursesMap: Map<string, ICourse>,
  entryYear: EntryYear
): UnmetPrereq[] {
  const termOrder = getTermOrder(entryYear);
  const completed = new Set<string>();

  const unmet: UnmetPrereq[] = [];

  for (const termKey of termOrder) {
    const courses = plannedByTerm[termKey] ?? [];
    for (const courseNo of courses) {
      const course = coursesMap.get(courseNo);
      if (!course?.pre) return unmet;

      const prereqs = parsePrereqString(course.pre);
      const missing = prereqs.filter((p) => !completed.has(p));
      if (missing.length > 0) {
        unmet.push({ courseNo, missingPrereqs: missing });
      }
    }
    for (const courseNo of courses) {
      completed.add(courseNo);
    }
  }
  return unmet;
}

/** Extract numeric level from course (e.g. "310" from "ENG310"). */
function getLevel(courseNo: string): number {
  const match = courseNo.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

/** Check if course satisfies MAT 330+ alternative. */
function isMat330OrHigher(courseNo: string): boolean {
  const subj = courseNo.substring(0, 3);
  return subj === 'MAT' && getLevel(courseNo) >= 330;
}

/** Check if course is 400-level language. */
function isLanguage400Level(courseNo: string, subj: string): boolean {
  const langSubjs = ['ARA', 'CHI', 'FRE', 'GER', 'GRK', 'ITA', 'JPN', 'LAT', 'RUS', 'SPA'];
  return langSubjs.includes(subj) && getLevel(courseNo) >= 400;
}

/**
 * Computes progress toward graduation requirements.
 * @param plannedByTerm - Map of termKey to course_no array
 * @param entryYear - Entry year
 * @param coursesMap - Map of course_no to ICourse
 */
export function computeProgress(
  plannedByTerm: Record<string, string[]>,
  entryYear: EntryYear,
  coursesMap: Map<string, ICourse>
): RequirementProgress[] {
  const reqs = GRADUATION_REQUIREMENTS[entryYear].requirements;
  const allPlanned = Object.values(plannedByTerm).flat();

  const progress: RequirementProgress[] = [];

  for (const req of reqs) {
    if (req.courses) {
      const required = req.courses;
      const fulfilled = required.filter((c) => allPlanned.includes(c)).length;
      progress.push({
        department: req.department,
        required: required,
        fulfilled,
        total: required.length,
        met: fulfilled >= required.length,
        specifics: req.specifics,
      });
      continue;
    }

    if (req.department === 'Mathematics' && req.alternative) {
      const mat330Met = allPlanned.some((c) => isMat330OrHigher(c));
      const matCredits = allPlanned.filter((c) => {
        const course = coursesMap.get(c);
        return course?.subj === 'MAT';
      }).length;
      const met = mat330Met || matCredits >= (req.credits ?? 0);
      progress.push({
        department: req.department,
        required: req.credits ?? 0,
        fulfilled: matCredits,
        total: req.credits ?? 0,
        met,
        specifics: req.specifics,
      });
      continue;
    }

    if (req.department === 'Languages' && req.alternative) {
      const langCreditsByLang: Record<string, number> = {};
      let lang400Met = false;
      for (const courseNo of allPlanned) {
        const course = coursesMap.get(courseNo);
        if (!course) continue;
        const dept = SUBJ_TO_DEPARTMENT[course.subj];
        if (dept !== 'Languages') continue;
        langCreditsByLang[course.subj] = (langCreditsByLang[course.subj] ?? 0) + 1;
        if (isLanguage400Level(courseNo, course.subj)) lang400Met = true;
      }
      const maxCredits = Math.max(0, ...Object.values(langCreditsByLang));
      const requiredCredits = req.credits ?? 0;
      const met = lang400Met || maxCredits >= requiredCredits;
      progress.push({
        department: req.department,
        required: requiredCredits,
        fulfilled: maxCredits,
        total: requiredCredits,
        met,
        specifics: req.specifics,
      });
      continue;
    }

    if (req.credits !== undefined) {
      const deptName = req.department;
      const deptCredits = allPlanned.filter((c) => {
        const course = coursesMap.get(c);
        if (!course) return false;
        return SUBJ_TO_DEPARTMENT[course.subj] === deptName;
      }).length;

      if (req.department === 'Phys Ed') {
        const peCredits = allPlanned.filter((c) => c === 'PE').length;
        progress.push({
          department: req.department,
          required: req.credits,
          fulfilled: peCredits,
          total: req.credits,
          met: peCredits >= req.credits,
          specifics: req.specifics,
        });
      } else {
        progress.push({
          department: req.department,
          required: req.credits,
          fulfilled: deptCredits,
          total: req.credits,
          met: deptCredits >= req.credits,
          specifics: req.specifics,
        });
      }
    } else {
      progress.push({
        department: req.department,
        required: '-',
        fulfilled: 0,
        total: 0,
        met: false,
        specifics: req.specifics,
      });
    }
  }
  return progress;
}
