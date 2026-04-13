import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', emoji: '🏠' },
  { path: '/punishments', label: 'Punishments', emoji: '⚡' },
  { path: '/history', label: 'History', emoji: '📜' },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="brutal-card rounded-none border-x-0 border-t-0 mb-6">
      <div className="container flex items-center justify-between py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-3xl animate-spin-slow inline-block">⚖️</span>
          <div>
            <h1 className="text-2xl md:text-3xl font-heading leading-none text-secondary">THE PACT</h1>
            <p className="font-mono text-[10px] text-muted-foreground italic hidden sm:block">
              A binding covenant between two people who love each other
            </p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`brutal-btn px-4 py-2 rounded-lg text-sm ${
                location.pathname === item.path
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground'
              }`}
            >
              {item.emoji} {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden brutal-btn p-2 rounded-lg bg-accent"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="md:hidden border-t-3 border-foreground p-4 flex flex-col gap-2">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMenuOpen(false)}
              className={`brutal-btn px-4 py-3 rounded-lg text-center ${
                location.pathname === item.path
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent text-accent-foreground'
              }`}
            >
              {item.emoji} {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
