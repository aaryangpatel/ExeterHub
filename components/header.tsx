import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { HiMoon, HiSun } from 'react-icons/hi';
import { useAuth } from '../contexts/AuthContext';

const HeaderDropdown = ({
  label,
  items,
}: {
  label: string;
  items: { name: string; href: string }[];
}) => {
  const [open, setOpen] = useState(false);
  const firstHref = items[0]?.href ?? '#';
  return (
    <li
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link href={firstHref}>
        <a className="flex items-center gap-1 font-display">
          {label}
          <span className="text-sm">▾</span>
        </a>
      </Link>
      {open && (
        <div className="absolute left-0 top-full mt-1 min-w-[160px] rounded-lg border border-white/20 bg-exeter py-2 shadow-lg dark:bg-neutral-700">
          {items.map((item) => (
            <Link key={item.href} href={item.href}>
              <a
                className="block px-4 py-2 text-sm hover:bg-white/20"
                onClick={() => setOpen(false)}
              >
                {item.name}
              </a>
            </Link>
          ))}
        </div>
      )}
    </li>
  );
};

const ThemeSwitch = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, systemTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      className="group relative h-6 w-12 rounded-full border-2 border-white bg-white transition-all duration-300 ease-out dark:bg-neutral-600"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      <div className="absolute top-0 left-0 h-full w-1/2 origin-left p-0.5 transition-all duration-300 ease-out group-active:scale-x-[1.3] dark:left-1/2 dark:origin-right">
        <div className="flex h-full w-full flex-row items-center justify-center rounded-full bg-neutral-600/30 text-black duration-300 dark:bg-neutral-800/40 dark:text-white">
          {
            {
              dark: <HiMoon className="text-lg group-active:scale-x-[0.769]" />,
              light: (
                <HiSun className="text-xl text-neutral-600 group-active:scale-x-[0.769]" />
              ),
            }[(theme === 'system' ? systemTheme : theme) ?? 'light']
          }
        </div>
      </div>
    </button>
  );
};

const Header = () => {
  const { user, loading, logout } = useAuth();

  return (
    <header className="relative z-50 flex w-full flex-col justify-between gap-2 overflow-visible bg-gradient-to-b from-exeter-400 to-exeter py-4 px-8 dark:from-transparent dark:to-transparent sm:flex-row sm:gap-0 lg:px-40">
      <div className="absolute top-0 bottom-0 left-0 right-0 hidden origin-top scale-y-150 bg-gradient-to-b from-exeter to-neutral-800 dark:block"></div>
      <Link href="/" passHref={true}>
        <a className="z-10 font-display text-lg font-black text-white">
          EXETER HUB
        </a>
      </Link>

      <ul className="z-10 flex flex-row flex-wrap items-center justify-start gap-4 font-display text-white">
        <HeaderDropdown label="Clubs" items={[
          { name: 'Browse Clubs', href: '/clubs' },
          { name: 'My Club Calendar', href: '/clubs/calendar' },
        ]} />
        <HeaderDropdown label="Courses" items={[
          { name: 'Browse Courses', href: '/courses' },
          { name: 'Course Maps', href: '/maps' },
          { name: 'Planner', href: '/planner' },
        ]} />
        {!loading && (
          user ? (
            <li className="flex items-center gap-2">
              <span className="text-sm text-white/90 truncate max-w-[120px]">
                {user.displayName || user.email}
              </span>
              <button
                type="button"
                onClick={() => logout()}
                className="rounded bg-white/20 px-2 py-1 text-sm font-bold hover:bg-white/30"
              >
                Sign out
              </button>
            </li>
          ) : (
            <li>
              <Link href="/login">
                <a className="rounded bg-white/20 px-3 py-1.5 text-sm font-bold hover:bg-white/30">
                  Sign in
                </a>
              </Link>
            </li>
          )
        )}
        <ThemeSwitch />
      </ul>
    </header>
  );
};

export default Header;
