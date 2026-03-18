import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { BsClock, BsGeoAlt, BsPeople } from 'react-icons/bs';
import ExpandableText from '../../components/expandableText';
import { clubToSlug } from '../../lib/clubUtils';

const JoinClubButton = dynamic(
  () => import('../../components/JoinClubButton'),
  { ssr: false }
);
import { getAllClubs, getClubBySlug, type IClub } from '../../lib/clubs';
import { event } from '../../lib/gtag';

const ClubPage = ({ club }: { club: IClub }) => {
  useEffect(() => {
    event({
      action: 'view_club',
      category: 'general',
      label: club.club,
      value: 1,
    });
  }, [club.club]);

  return (
    <div>
      <div className="bg-exeter px-8 pt-20 pb-20 dark:bg-neutral-800 lg:px-40">
        <Link href="/clubs">
          <a className="font-display text-sm text-gray-300 hover:text-white">
            ← Back to Clubs
          </a>
        </Link>
        <h1 className="mt-2 font-display text-4xl font-black text-white md:text-5xl">
          {club.club}
        </h1>
      </div>
      <div className="grid grid-cols-1 gap-16 px-8 pt-14 pb-20 md:grid-cols-5 lg:px-40">
        <div className="flex flex-col gap-8 md:col-span-2">
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-3xl font-black text-gray-700 dark:text-white">
              Information
            </h1>
            <div className="text-md border-1 grid grid-cols-2 border border-neutral-300 dark:border-exeter-400 dark:bg-exeter dark:text-neutral-100 [&>*]:p-3 [&>div>p:nth-child(1)]:font-bold [&>*:nth-child(even)]:bg-neutral-100 dark:[&>*:nth-child(even)]:bg-exeter-600">
              {club.times && (
                <>
                  <div className="flex flex-row items-center gap-2 font-mono">
                    <BsClock />
                    TIME
                  </div>
                  <div>{club.times}</div>
                </>
              )}
              {club.location && (
                <>
                  <div className="flex flex-row items-center gap-2 font-mono">
                    <BsGeoAlt />
                    LOCATION
                  </div>
                  <div>{club.location}</div>
                </>
              )}
              <div className="flex flex-row items-center gap-2 font-mono">
                <BsPeople />
                LEADERS
              </div>
              <div>
                {club.leaders.length > 0
                  ? club.leaders.join(', ')
                  : 'No leaders listed'}
              </div>
            </div>
            <JoinClubButton
              slug={clubToSlug(club.club)}
              clubName={club.club}
              variant="detail"
            />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-3xl font-black text-gray-700 dark:text-white">
              Description
            </h1>
            {club.description ? (
              <ExpandableText
                className="font-display text-lg leading-8 text-gray-900 dark:text-neutral-100"
                text={club.description}
              />
            ) : (
              <p className="font-display text-neutral-500 dark:text-neutral-400">
                No description available.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export async function getStaticPaths() {
  const clubs = getAllClubs();
  const paths = clubs.map((club) => ({
    params: { slug: clubToSlug(club.club) },
  }));
  return { paths, fallback: false };
}

export async function getStaticProps({
  params,
}: {
  params: { slug: string };
}): Promise<{ props: { club: IClub } } | { notFound: true }> {
  const club = getClubBySlug(params.slug);
  if (!club) {
    return { notFound: true };
  }
  return { props: { club } };
}

export default ClubPage;
