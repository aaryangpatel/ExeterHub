/**
 * Phillips Exeter Academy graduation requirements by entry year.
 * Encodes requirements for New Preps (4-year), New Lowers (3-year),
 * New Uppers (2-year), and New Seniors/Postgraduates (1-year).
 */

export type EntryYear = 9 | 10 | 11 | 12;

export interface DepartmentRequirement {
  department: string;
  credits?: number;
  courses?: string[];
  specifics: string;
  alternative?: string;
}

export interface GraduationRequirements {
  entryYear: EntryYear;
  label: string;
  requirements: DepartmentRequirement[];
}

const FOUR_YEAR: DepartmentRequirement[] = [
  {
    department: 'English',
    credits: 11,
    specifics: 'Full sequence from 100 to 500 level.',
  },
  {
    department: 'Mathematics',
    credits: 9,
    specifics: 'Or passing a course numbered 330 or higher.',
    alternative: 'MAT330+',
  },
  {
    department: 'Science',
    credits: 6,
    specifics: '3 in Biology + 3 in either Chemistry or Physics.',
  },
  {
    department: 'History',
    credits: 6,
    specifics:
      'Must include one 200-level, one 300-level, and three 400-level (U.S. History).',
  },
  {
    department: 'Languages',
    credits: 9,
    specifics: 'Nine credits in one language or passing the 400 level.',
    alternative: '400 level',
  },
  {
    department: 'Arts',
    credits: 3,
    specifics:
      'Must include two departments (Art, Music, or Theater); two must be studio/performance.',
  },
  {
    department: 'Religion',
    credits: 2,
    specifics: 'Two term credits in Religion, Ethics, and Philosophy.',
  },
  {
    department: 'Comp Sci',
    credits: 1,
    specifics: 'One term credit.',
  },
  {
    department: 'HHD',
    courses: ['HHD110', 'HHD120', 'HHD240', 'HHD340', 'HHD490'],
    specifics: 'Health & Human Development 110, 120, 240, 340, and 490 (1/3 credit each).',
  },
  {
    department: 'Phys Ed',
    credits: 9,
    specifics: 'Includes three terms of the 9th-grade PE program.',
  },
];

const THREE_YEAR: DepartmentRequirement[] = [
  {
    department: 'English',
    credits: 8,
    specifics:
      'Sequence 310, 320, 330, 410, 420, 430, and two 500-level.',
  },
  {
    department: 'Mathematics',
    credits: 7,
    specifics: 'Or passing 330 or higher.',
    alternative: 'MAT330+',
  },
  {
    department: 'Science',
    credits: 5,
    specifics:
      'If no prior lab science: 3 in Bio, 2 in Chem/Physics. If Bio completed: 3 in Chem/Physics, 2 additional.',
  },
  {
    department: 'History',
    credits: 5,
    specifics: 'One 300-level and three 400-level/U.S. History.',
  },
  {
    department: 'Languages',
    credits: 7,
    specifics: 'In the same language or passing 400 level.',
    alternative: '400 level',
  },
  {
    department: 'Arts',
    credits: 2,
    specifics: 'One must be studio or performance.',
  },
  {
    department: 'Religion',
    credits: 1,
    specifics: 'One term credit.',
  },
  {
    department: 'Comp Sci',
    credits: 1,
    specifics: 'Exemption possible based on prior coursework.',
  },
  {
    department: 'HHD',
    courses: ['HHD310', 'HHD340', 'HHD490'],
    specifics: 'HHD 310, 340, and 490.',
  },
  {
    department: 'Phys Ed',
    credits: 6,
    specifics:
      'Two terms per year in Lower, Upper, and Senior years.',
  },
];

const TWO_YEAR: DepartmentRequirement[] = [
  {
    department: 'English',
    credits: 5,
    specifics: 'Sequence 410, 420, 430, and two 500-level.',
  },
  {
    department: 'Mathematics',
    credits: 4,
    specifics: 'Or passing 330 or higher.',
    alternative: 'MAT330+',
  },
  {
    department: 'Science',
    credits: 3,
    specifics:
      'Usually the department requires a balance of Bio/Chem/Physics based on prior transcript.',
  },
  {
    department: 'History',
    credits: 3,
    specifics: 'Must be 400-level U.S. History unless already completed elsewhere.',
  },
  {
    department: 'Languages',
    credits: 4,
    specifics: 'In the same language or passing 400 level.',
    alternative: '400 level',
  },
  {
    department: 'Arts',
    credits: 2,
    specifics: 'One must be studio or performance.',
  },
  {
    department: 'Religion',
    credits: 1,
    specifics: 'One term credit.',
  },
  {
    department: 'HHD',
    courses: ['HHD310', 'HHD340', 'HHD490'],
    specifics: 'HHD 310, 340, and 490.',
  },
  {
    department: 'Phys Ed',
    credits: 4,
    specifics: 'Four credits.',
  },
];

const ONE_YEAR: DepartmentRequirement[] = [
  {
    department: 'English',
    credits: 2,
    specifics: 'Two 500-level courses; PGs must complete English 500.',
  },
  {
    department: 'History',
    credits: 3,
    specifics:
      '400-level U.S. History is required if not already on the student\'s transcript.',
  },
  {
    department: 'HHD',
    courses: ['HHD410', 'HHD490'],
    specifics: 'HHD 410 and 490.',
  },
];

export const GRADUATION_REQUIREMENTS: Record<
  EntryYear,
  GraduationRequirements
> = {
  9: {
    entryYear: 9,
    label: 'New Preps (4-Year)',
    requirements: FOUR_YEAR,
  },
  10: {
    entryYear: 10,
    label: 'New Lowers (3-Year)',
    requirements: THREE_YEAR,
  },
  11: {
    entryYear: 11,
    label: 'New Uppers (2-Year)',
    requirements: TWO_YEAR,
  },
  12: {
    entryYear: 12,
    label: 'New Seniors & Postgraduates (1-Year)',
    requirements: ONE_YEAR,
  },
};

/** Subject codes mapped to requirement departments. */
export const SUBJ_TO_DEPARTMENT: Record<string, string> = {
  ENG: 'English',
  MAT: 'Mathematics',
  BIO: 'Science',
  CHE: 'Science',
  PHY: 'Science',
  HIS: 'History',
  ARA: 'Languages',
  CHI: 'Languages',
  FRE: 'Languages',
  GER: 'Languages',
  GRK: 'Languages',
  ITA: 'Languages',
  JPN: 'Languages',
  LAT: 'Languages',
  RUS: 'Languages',
  SPA: 'Languages',
  ART: 'Arts',
  MUS: 'Arts',
  THR: 'Arts',
  DAN: 'Arts',
  REL: 'Religion',
  CSC: 'Comp Sci',
  HHD: 'HHD',
};
