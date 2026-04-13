import { useState } from 'react';
import { getOtherUser, getPunishmentOptions, USERS } from '@/types';
import { X } from 'lucide-react';
import type { AppData } from '@/pages/Dashboard';

interface PunishmentSelectorProps {
  missedUserId: string;
  data: AppData;
  logId?: string | null;
  onClose: () => void;
}

export function PunishmentSelector({ missedUserId, data, logId, onClose }: PunishmentSelectorProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const missedUser = USERS.find(u => u.id === missedUserId)!;
  const otherUser = getOtherUser(missedUserId);
  const options = getPunishmentOptions(missedUserId);

  const handleConfirm = () => {
    if (!selected) return;
    data.incrementPunishment(missedUserId, selected);
    if (logId) {
      data.updateWorkoutLog(logId, { punishmentTriggered: selected });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-foreground/50 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="brutal-card bg-background w-full md:max-w-2xl md:rounded-xl rounded-t-2xl rounded-b-none md:rounded-b-xl p-6 max-h-[90vh] overflow-y-auto animate-bounce-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-heading text-destructive">⚠️ Punishment Time!</h2>
          <button onClick={onClose} className="brutal-btn p-2 rounded-lg bg-muted">
            <X size={18} />
          </button>
        </div>

        <p className="font-mono text-base font-bold mb-6 text-muted-foreground">
          Uh oh! <strong className="text-foreground">{missedUser.name} {missedUser.emoji}</strong> missed their workout.
          <br />
          <strong className="text-foreground">{otherUser.name} {otherUser.emoji}</strong>, pick your punishment:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {options.map(opt => (
            <button
              key={opt.key}
              onClick={() => setSelected(opt.key)}
              className={`brutal-card p-4 text-left transition-all hover-bounce ${
                selected === opt.key
                  ? 'border-primary bg-primary/10 shadow-brutal-lg'
                  : 'hover:border-primary/50'
              }`}
            >
              <p className="text-2xl mb-1">{opt.emoji}</p>
              <p className="font-heading text-xl text-secondary">{opt.name}</p>
              <p className="font-mono text-sm font-bold text-muted-foreground">{opt.description}</p>
            </button>
          ))}
        </div>

        <button
          onClick={handleConfirm}
          disabled={!selected}
          className={`brutal-btn w-full py-4 rounded-xl text-xl font-heading ${
            selected
              ? 'bg-destructive text-destructive-foreground hover-bounce'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          ⚖️ Confirm Punishment
        </button>
      </div>
    </div>
  );
}
