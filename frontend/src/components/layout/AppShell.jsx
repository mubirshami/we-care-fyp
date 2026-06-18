import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Icon({ d, className = 'h-5 w-5' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      stroke="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const ICONS = {
  home: 'm2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
  journal:
    'm16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10',
  insights:
    'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z',
  chat: 'M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155',
  resources:
    'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25',
  review:
    'M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z',
  logout:
    'M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9',
  menu: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5',
  close: 'M6 18 18 6M6 6l12 12',
};

const PRIMARY_NAV = [
  { to: '/home', label: 'Home', icon: ICONS.home },
  { to: '/journal', label: 'Journal', icon: ICONS.journal },
  { to: '/insights', label: 'Insights', icon: ICONS.insights },
  { to: '/chatbot', label: 'Chat', icon: ICONS.chat },
  { to: '/resources', label: 'Resources', icon: ICONS.resources },
];

const SECONDARY_NAV = [{ to: '/reviews', label: 'Review', icon: ICONS.review }];

function NavItem({ to, label, icon, onClick }) {
  return (
    <li>
      <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) =>
          [
            'flex items-center gap-3 rounded-button px-3 py-2.5 text-sm font-medium',
            'transition-all duration-150',
            isActive
              ? 'bg-primary-50 text-primary-700 shadow-[inset_3px_0_0_0] shadow-primary-500 pl-3'
              : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
          ].join(' ')
        }
      >
        <Icon d={icon} />
        <span>{label}</span>
      </NavLink>
    </li>
  );
}

function MobileNavItem({ to, label, icon, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          'flex flex-col items-center gap-1 flex-1 py-2 text-xs font-medium',
          'transition-colors duration-150',
          isActive ? 'text-primary-600' : 'text-neutral-500',
        ].join(' ')
      }
    >
      <Icon d={icon} />
      <span>{label}</span>
    </NavLink>
  );
}

function Avatar({ name, size = 'sm' }) {
  const initial = name?.charAt(0)?.toUpperCase() || '?';
  const dim = size === 'lg' ? 'h-10 w-10 text-base' : 'h-8 w-8 text-sm';
  return (
    <div
      className={`${dim} rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold shrink-0`}
      aria-hidden="true"
    >
      {initial}
    </div>
  );
}

function Sidebar({ name, onLogout }) {
  return (
    <aside className="hidden md:flex md:flex-col md:w-60 md:shrink-0 h-full bg-white border-r border-neutral-200">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-neutral-100">
        <div className="h-7 w-7 rounded-lg bg-primary-500 flex items-center justify-center">
          <svg
            className="h-4 w-4 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <span className="text-lg font-display font-bold text-neutral-900">We Care</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
        <ul className="space-y-0.5">
          {PRIMARY_NAV.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </ul>
        <div className="mt-6 pt-4 border-t border-neutral-100">
          <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Feedback
          </p>
          <ul className="space-y-0.5">
            {SECONDARY_NAV.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </ul>
        </div>
      </nav>
      <div className="border-t border-neutral-100 p-4 space-y-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={name} />
          <span className="text-sm font-medium text-neutral-700 truncate">{name || 'User'}</span>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-button text-sm font-medium text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800 transition-all duration-150"
        >
          <Icon d={ICONS.logout} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

function MobileHeader({ name, onMenuOpen }) {
  return (
    <header className="md:hidden flex items-center justify-between bg-white border-b border-neutral-200 px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-md bg-primary-500 flex items-center justify-center">
          <svg
            className="h-3.5 w-3.5 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <span className="text-base font-display font-bold text-neutral-900">We Care</span>
      </div>
      <button
        onClick={onMenuOpen}
        aria-label="Open menu"
        className="p-2 rounded-button text-neutral-500 hover:bg-neutral-100"
      >
        <Avatar name={name} size="sm" />
      </button>
    </header>
  );
}

function MobileBottomNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 flex bg-white border-t border-neutral-200"
      aria-label="Bottom navigation"
    >
      {PRIMARY_NAV.map((item) => (
        <MobileNavItem key={item.to} {...item} />
      ))}
    </nav>
  );
}

function MobileDrawer({ open, onClose, name, onLogout }) {
  if (!open) return null;
  return (
    <>
      <div
        className="md:hidden fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="md:hidden fixed top-0 right-0 bottom-0 z-50 w-72 bg-white flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <Avatar name={name} size="lg" />
            <div>
              <p className="text-sm font-semibold text-neutral-800">{name || 'User'}</p>
              <p className="text-xs text-neutral-500">Your account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-2 rounded-button text-neutral-400 hover:bg-neutral-100"
          >
            <Icon d={ICONS.close} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-0.5">
            {[...PRIMARY_NAV, ...SECONDARY_NAV].map((item) => (
              <NavItem key={item.to} {...item} onClick={onClose} />
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-neutral-100">
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-button text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-all duration-150"
          >
            <Icon d={ICONS.logout} />
            Sign out
          </button>
        </div>
      </div>
    </>
  );
}

export default function AppShell() {
  const { name, token, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/signin', { replace: true });
  };

  if (!token) {
    navigate('/signin', { replace: true });
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <Sidebar name={name} onLogout={handleLogout} />
      <div className="flex flex-1 flex-col min-w-0">
        <MobileHeader name={name} onMenuOpen={() => setDrawerOpen(true)} />
        <main id="main-content" className="flex-1 overflow-y-auto pb-16 md:pb-0" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
      <MobileBottomNav />
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        name={name}
        onLogout={handleLogout}
      />
    </div>
  );
}
