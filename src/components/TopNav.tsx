import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: '🏠' },
  { to: '/athletes', label: 'Athletes' },
  { to: '/poles', label: 'Poles' },
  { to: '/meets', label: 'Meets' },
  { to: '/settings', label: 'Settings' },
];

export default function TopNav() {
  return (
    <nav className="sticky top-0 z-10 bg-white border-b border-zinc-200 px-4 py-3 flex space-x-4 text-sm font-medium">
      {navItems.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            isActive
              ? 'text-blue-600 underline'
              : 'text-zinc-600 hover:text-zinc-900'
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
