import { InferGetStaticPropsType } from 'next';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { ChangeEventHandler, useCallback, useState } from 'react';
import { AiOutlineSearch } from 'react-icons/ai';
import { MdExpandMore, MdExpandLess } from 'react-icons/md';
import { clubToSlug } from '../lib/clubUtils';
import type { IClub } from '../lib/clubs';

const JoinClubButton = dynamic(
  () => import('../components/JoinClubButton'),
  { ssr: false }
);

const Clubs = ({
  clubs,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const [results, setResults] = useState<IClub[]>(clubs);
  const [expanded, setExpanded] = useState<string | null>(null);

  const onChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const query = event.target.value.trim().toLowerCase();
      if (query.length) {
        setResults(
          clubs.filter(
            (club) =>
              club.club.toLowerCase().includes(query) ||
              club.description.toLowerCase().includes(query) ||
              club.leaders.some((l) => l.toLowerCase().includes(query)) ||
              club.location.toLowerCase().includes(query)
          )
        );
      } else {
        setResults(clubs);
      }
    },
    [clubs]
  );

  return (
    <div>
      <div className="bg-exeter py-16 px-8 dark:bg-neutral-800 lg:px-40">
        <h1 className="font-display text-4xl font-black text-white md:text-5xl">
          Clubs
        </h1>
        <p className="mt-2 font-display text-lg text-white/90">
          Browse and search student clubs at Phillips Exeter Academy.
        </p>
      </div>
      <div className="px-8 pt-14 pb-20 lg:px-40">
        <div className="border-1 group relative mx-auto mb-8 flex h-14 w-full flex-row items-center justify-start gap-2 overflow-hidden rounded-xl border border-neutral-200 pl-5 font-display text-lg font-semibold shadow-sm dark:border-neutral-500">
          <AiOutlineSearch className="text-neutral-600 dark:text-white" />
          <input
            type="text"
            placeholder="Search clubs by name, description, leaders, or location..."
            onChange={onChange}
            className="peer h-full w-full bg-transparent outline-none dark:text-white"
          />
          <div className="pointer-events-none absolute top-0 bottom-0 right-0 left-0 -z-10 bg-neutral-100 transition-all ease-out peer-hover:bg-neutral-50 peer-focus:bg-neutral-50 dark:bg-neutral-600 dark:peer-hover:bg-neutral-500 dark:peer-focus:bg-neutral-500"></div>
        </div>
        <div className="absolute top-24 -left-[200px] -z-20 -mt-12 opacity-20 dark:opacity-80">
          <Image alt="Decal" src="/decal2.svg" width={3000} height={2000} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2">
          {results &&
            results.map((club) => {
              const isExpanded = expanded === club.club;
              return (
                <div
                  key={club.club}
                  className="border-1 m-0 my-3 rounded-lg border border-neutral-200 bg-neutral-50 shadow-md dark:border-neutral-500 dark:bg-neutral-600 md:m-4"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpanded((prev) =>
                        prev === club.club ? null : club.club
                      );
                    }}
                    className="flex w-full items-center justify-between gap-2 p-4 text-left transition-colors hover:bg-exeter hover:text-white dark:hover:bg-neutral-500"
                  >
                    <h2 className="font-display font-bold text-gray-700 dark:text-white">
                      {club.club}
                    </h2>
                    {isExpanded ? (
                      <MdExpandLess className="shrink-0 text-xl" />
                    ) : (
                      <MdExpandMore className="shrink-0 text-xl" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="border-t border-neutral-200 px-4 pb-4 pt-2 dark:border-neutral-500">
                      {club.leaders.length > 0 && (
                        <div className="mb-3">
                          <span className="font-mono text-xs font-bold text-neutral-500 dark:text-neutral-400">
                            LEADERS
                          </span>
                          <p className="font-display text-sm text-gray-700 dark:text-neutral-200">
                            {club.leaders.join(', ')}
                          </p>
                        </div>
                      )}
                      {(club.times || club.location) && (
                        <div className="mb-3">
                          <span className="font-mono text-xs font-bold text-neutral-500 dark:text-neutral-400">
                            TIME & LOCATION
                          </span>
                          <p className="font-display text-sm text-gray-700 dark:text-neutral-200">
                            {[club.times, club.location].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                      )}
                      {club.description && (
                        <div className="mb-3">
                          <span className="font-mono text-xs font-bold text-neutral-500 dark:text-neutral-400">
                            DESCRIPTION
                          </span>
                          <p className="mt-1 font-display text-sm leading-relaxed text-gray-700 dark:text-neutral-200">
                            {club.description}
                          </p>
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-3">
                        <JoinClubButton
                          slug={clubToSlug(club.club)}
                          clubName={club.club}
                          variant="card"
                        />
                        <Link href={`/club/${clubToSlug(club.club)}`}>
                          <a className="font-display text-sm font-bold text-exeter hover:underline dark:text-exeter-200">
                            View full details →
                          </a>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export async function getStaticProps() {
  const { getAllClubs } = await import('../lib/clubs');
  const clubs = getAllClubs();
  return { props: { clubs } };
}

export default Clubs;
