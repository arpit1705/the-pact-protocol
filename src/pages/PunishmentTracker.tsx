import { USERS, getAllPunishments } from '@/types';
import type { AppData } from '@/pages/Dashboard';

interface PunishmentTrackerProps {
  data: AppData;
}

export default function PunishmentTracker({ data }: PunishmentTrackerProps) {
  const arpitTotal = data.getTotalPunishments('arpit');
  const madhuTotal = data.getTotalPunishments('madhu');

  return (
    <div className="container space-y-6 pb-8">
      <h2 className="text-4xl md:text-5xl font-heading text-secondary text-center">⚡ Punishment Tracker</h2>

      {/* Scoreboard */}
      <div className="brutal-card bg-secondary text-secondary-foreground p-4">
        <div className="flex items-center justify-center gap-4 md:gap-8 text-center font-heading text-xl md:text-2xl">
          <span>🏋️ Arpit owes <span className="text-accent">{arpitTotal}</span></span>
          <span className="text-accent text-3xl">⚖️</span>
          <span>💪 Madhu owes <span className="text-accent">{madhuTotal}</span></span>
        </div>
      </div>

      {/* Per user sections */}
      {USERS.map(user => {
        const punishments = getAllPunishments(user.id);
        return (
          <div key={user.id}>
            <h3 className="text-2xl font-heading text-secondary mb-3">
              {user.emoji} {user.name}'s Debts
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {punishments.map(p => {
                const count = data.punishmentCounts[user.id]?.[p.key] || 0;
                const isActive = count > 0;
                return (
                  <div
                    key={p.key}
                    className={`brutal-card p-4 transition-all ${
                      isActive ? 'animate-pulse-glow' : 'opacity-50 grayscale'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{p.emoji}</span>
                      <span className={`text-3xl font-heading ${isActive ? 'text-destructive animate-bounce-in' : 'text-muted-foreground'}`}>
                        ×{count}
                      </span>
                    </div>
                    <p className="font-heading text-lg text-secondary">{p.name}</p>
                    <p className="font-mono text-xs text-muted-foreground mb-3">{p.description}</p>
                    <button
                      onClick={() => data.decrementPunishment(user.id, p.key)}
                      disabled={!isActive}
                      className={`brutal-btn w-full py-2 rounded-lg text-sm font-heading ${
                        isActive
                          ? 'bg-success text-success-foreground hover-bounce'
                          : 'bg-muted text-muted-foreground cursor-not-allowed'
                      }`}
                    >
                      ✓ Mark as Served
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
