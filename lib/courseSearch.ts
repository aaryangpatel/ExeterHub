/**
 * Client-side course search for planner autocomplete.
 * Filters courses by course_no, lt (long title), st (short title), subj.
 */

import type { ICourse } from '../types';

/**
 * Search courses by query string.
 * Matches course_no, long title, short title, and subject code.
 * @param courses - Full courses array (from getStaticProps)
 * @param query - Search string
 * @param limit - Max results to return
 */
export function searchCourses(
  courses: ICourse[],
  query: string,
  limit = 15
): ICourse[] {
  const q = query.trim().toUpperCase();
  if (!q) return [];

  const filtered = courses.filter((c) => {
    if (c.course_no === 'PEA000') return false;
    return (
      c.course_no.toUpperCase().includes(q) ||
      c.lt.toUpperCase().includes(q) ||
      c.st.toUpperCase().includes(q) ||
      c.subj.toUpperCase().includes(q)
    );
  });

  return filtered.slice(0, limit);
}
