import { useState } from 'react';
import { USERS, getAllPunishments, getOtherUser } from '@/types';
import type { PunishmentOption } from '@/types';
import { useActiveUser } from '@/context/ActiveUserContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { AppData } from '@/pages/Dashboard';

interface PunishmentTrackerProps {
  data: AppData;
}

export default function PunishmentTracker({ data }: PunishmentTrackerProps) {
  const { activeUser } = useActiveUser();
  const [selected, setSelected] = useState<{ punishment: PunishmentOption; userId: string } | null>(null);
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

      {/* Punishment detail dialog */}
      {selected && (() => {
        const { punishment: p, userId } = selected;
        const counts = data.punishmentCounts[userId]?.[p.key];
        const unresolvedCount = counts ? counts.total - counts.resolved : 0;
        const isActive = unresolvedCount > 0;
        const canResolve = activeUser !== userId;
        const canClick = isActive && canResolve;

        return (
          <Dialog open onOpenChange={() => setSelected(null)}>
            <DialogContent className="brutal-card max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-2xl font-heading text-secondary">
                  <span className="text-4xl">{p.emoji}</span>
                  {p.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="font-mono text-sm font-bold text-muted-foreground">{p.description}</p>
                <p className="font-body text-base leading-relaxed">{p.details}</p>
                {isActive && (
                  <div className="brutal-card bg-destructive/10 px-4 py-2 rounded-lg inline-block">
                    <span className="font-heading text-destructive font-bold">×{unresolvedCount} outstanding</span>
                  </div>
                )}
                {canClick && (
                  <button
                    onClick={() => { data.resolvePunishment(userId, p.key, activeUser); setSelected(null); }}
                    className="brutal-btn w-full py-3 rounded-xl text-lg font-heading bg-success text-success-foreground hover-bounce"
                  >
                    ✓ Mark as Served
                  </button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        );
      })()}

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
                    onClick={() => setSelected({ punishment: p, userId: user.id })}
                    className={`brutal-card p-4 transition-all cursor-pointer hover:scale-[1.02] ${
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
                      onClick={e => { e.stopPropagation(); canClick && data.resolvePunishment(user.id, p.key, activeUser); }}
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
