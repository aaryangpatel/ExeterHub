import { InferGetStaticPropsType } from 'next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { BsCalendarWeek } from 'react-icons/bs';
import { getAllClubs } from '../../lib/clubs';

const ClubCalendarClient = dynamic(
  () => import('../../components/ClubCalendarClient'),
  { ssr: false }
);

export default function ClubCalendarPage({
  clubs,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <div>
      <div className="bg-exeter py-16 px-8 dark:bg-neutral-800 lg:px-40">
        <Link href="/clubs">
          <a className="font-display text-sm text-gray-300 hover:text-white">
            ← Back to Clubs
          </a>
        </Link>
        <h1 className="mt-2 flex items-center gap-3 font-display text-4xl font-black text-white md:text-5xl">
          <BsCalendarWeek className="text-exeter-200" />
          My Club Calendar
        </h1>
        <p className="mt-2 font-display text-lg text-white/90">
          Your joined clubs, shown by their scheduled meeting times.
        </p>
      </div>
      <div className="px-8 pt-14 pb-20 lg:px-40">
        <ClubCalendarClient clubs={clubs} />
      </div>
    </div>
  );
}

export async function getStaticProps() {
  const clubs = getAllClubs();
  return { props: { clubs } };
}
