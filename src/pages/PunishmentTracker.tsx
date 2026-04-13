import { USERS, getAllPunishments, getOtherUser } from '@/types';
import { useActiveUser } from '@/context/ActiveUserContext';
import type { AppData } from '@/pages/Dashboard';

interface PunishmentTrackerProps {
  data: AppData;
}

export default function PunishmentTracker({ data }: PunishmentTrackerProps) {
  const { activeUser } = useActiveUser();
  const arpitTotal = data.getTotalPunishments('arpit');
  const madhuTotal = data.getTotalPunishments('madhu');

  const arpitLabel = activeUser === 'arpit' ? 'You owe' : '🏋️ Arpit owes';
  const madhuLabel = activeUser === 'madhu' ? 'You owe' : '💪 Madhu owes';

  return (
    <div className="container space-y-6 pb-8">
      <h2 className="text-4xl md:text-5xl font-heading text-secondary text-center">⚡ Punishment Tracker</h2>

      {/* Scoreboard */}
      <div className="brutal-card bg-secondary text-secondary-foreground p-5">
        <div className="flex items-center justify-center gap-4 md:gap-8 text-center font-heading text-2xl md:text-3xl">
          <span>{arpitLabel} <span className="text-accent">{arpitTotal}</span></span>
          <span className="text-accent text-4xl">⚖️</span>
          <span>{madhuLabel} <span className="text-accent">{madhuTotal}</span></span>
        </div>
      </div>

      {/* Per user sections */}
      {USERS.map(user => {
        const punishments = getAllPunishments(user.id);
        const canResolve = activeUser !== user.id;
        const isOwnSection = activeUser === user.id;
        const sectionLabel = isOwnSection
          ? `${user.emoji} Your Debts (read-only)`
          : `${user.emoji} ${user.name}'s Debts — you can resolve these`;

        return (
          <div key={user.id}>
            <h3 className={`mb-3 ${isOwnSection ? 'text-muted-foreground' : 'text-secondary'}`}>
              {sectionLabel}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {punishments.map(p => {
                const counts = data.punishmentCounts[user.id]?.[p.key];
                const unresolvedCount = counts ? counts.total - counts.resolved : 0;
                const isActive = unresolvedCount > 0;
                const canClick = isActive && canResolve;

                return (
                  <div
                    key={p.key}
                    className={`brutal-card p-4 transition-all ${
                      isActive ? 'animate-pulse-glow' : 'opacity-50 grayscale'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{p.emoji}</span>
                      <span className={`text-3xl font-heading font-extrabold ${isActive ? 'text-destructive animate-bounce-in' : 'text-muted-foreground'}`}>
                        ×{unresolvedCount}
                      </span>
                    </div>
                    <p className="font-heading text-xl text-secondary">{p.name}</p>
                    <p className="font-mono text-sm font-bold text-muted-foreground mb-3">{p.description}</p>
                    <button
                      onClick={() => canClick && data.resolvePunishment(user.id, p.key, activeUser)}
                      disabled={!canClick}
                      title={
                        !canResolve
                          ? `Switch to ${getOtherUser(user.id).name} to resolve this`
                          : undefined
                      }
                      className={`brutal-btn w-full py-2.5 rounded-lg text-base font-heading ${
                        canClick
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
