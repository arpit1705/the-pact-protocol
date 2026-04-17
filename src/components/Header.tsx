import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { USERS } from '@/types';
import { useActiveUser } from '@/context/ActiveUserContext';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', emoji: '🏠' },
  { path: '/treats', label: 'Treats', emoji: '🎁' },
  { path: '/history', label: 'History', emoji: '📜' },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pillOpen, setPillOpen] = useState(false);
  const location = useLocation();
  const { activeUser, setActiveUser } = useActiveUser();
  const pillRef = useRef<HTMLDivElement>(null);

  const activeUserObj = USERS.find(u => u.id === activeUser)!;

  // Close pill dropdown when clicking outside
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (pillRef.current && !pillRef.current.contains(e.target as Node)) {
        setPillOpen(false);
      }
    }
    if (pillOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [pillOpen]);

  return (
    <header className="brutal-card rounded-none border-x-0 border-t-0 mb-6">
      <div className="container relative flex items-center justify-between py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-3xl animate-spin-slow inline-block">⚖️</span>
          <div>
            <h1 className="text-2xl md:text-3xl font-heading leading-none text-secondary">THE PACT</h1>
            <p className="font-mono text-[10px] text-muted-foreground italic hidden sm:block">
              A binding covenant between two people who love each other
            </p>
          </div>
        </Link>

        {/* Right side: desktop nav + user pill */}
        <div className="flex items-center gap-3">
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-2">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`brutal-btn px-5 py-2.5 rounded-lg text-xl ${
                  location.pathname === item.path
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground'
                }`}
              >
                {item.emoji} {item.label}
              </Link>
            ))}
          </nav>

          {/* User switcher pill */}
          <div ref={pillRef} className="relative">
            <button
              key={activeUser}
              onClick={() => setPillOpen(prev => !prev)}
              className="brutal-btn px-3 py-2 rounded-full bg-secondary text-secondary-foreground text-lg font-heading animate-bounce-in flex items-center gap-1.5"
            >
              <span>{activeUserObj.emoji}</span>
              <span className="hidden sm:inline">{activeUserObj.name}</span>
              <span className="font-mono text-xs opacity-70">▼</span>
            </button>

            {pillOpen && (
              <div className="absolute top-full right-0 mt-2 brutal-card bg-background p-2 z-50 min-w-[160px]">
                {USERS.map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setActiveUser(u.id as 'arpit' | 'madhu');
                      setPillOpen(false);
                    }}
                    className={`w-full text-left brutal-btn px-3 py-2.5 rounded-lg text-lg mb-1 last:mb-0 flex items-center justify-between ${
                      activeUser === u.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-accent'
                    }`}
                  >
                    <span>{u.emoji} {u.name}</span>
                    {activeUser === u.id && (
                      <span className="font-mono text-xs ml-2 brutal-badge bg-primary-foreground/20 text-primary-foreground">YOU</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden brutal-btn p-2 rounded-lg bg-accent"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="md:hidden border-t-3 border-foreground p-4 flex flex-col gap-2">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMenuOpen(false)}
              className={`brutal-btn px-4 py-3 rounded-lg text-center text-xl ${
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
