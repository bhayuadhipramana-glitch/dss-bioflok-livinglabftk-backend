import { NavLink } from 'react-router-dom';
import { Droplets } from 'lucide-react';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/sensor-data', label: 'Data Sensor' },
  { to: '/klasifikasi', label: 'Klasifikasi' },
  { to: '/pengguna', label: 'Pengguna' },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 flex justify-center pt-4 pb-2 px-4">
      <nav
        id="main-navbar"
        className="flex items-center gap-6 bg-white/90 backdrop-blur-md rounded-full shadow-sm border border-slate-100 px-6 py-2.5"
      >
        <div className="flex items-center gap-2 mr-4">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
            <Droplets className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-slate-800 tracking-tight">
            Bioflok Monitor
          </span>
        </div>

        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${
                isActive
                  ? 'font-semibold text-blue-600 border-b-2 border-blue-600 pb-0.5'
                  : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
