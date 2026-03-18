import fs from 'fs';
import path from 'path';
import { clubToSlug } from './clubUtils';

export interface IClub {
  club: string;
  description: string;
  times: string;
  location: string;
  leaders: string[];
}

export function getAllClubs(): IClub[] {
  const clubs: IClub[] = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), '/data/clubs.json'), 'utf-8')
  );
  return clubs;
}

/** Find club by slug. */
export function getClubBySlug(slug: string): IClub | undefined {
  const clubs = getAllClubs();
  return clubs.find((c) => clubToSlug(c.club) === slug);
}
