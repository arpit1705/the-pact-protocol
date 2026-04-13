import { useState } from 'react';
import { USERS, ARPIT_PICKS, MADHU_PICKS } from '@/types';
import { LogWorkoutModal } from '@/components/LogWorkoutModal';
import type { AppData } from '@/pages/Dashboard';

interface HistoryProps {
  data: AppData;
}

const allPunishments = [...ARPIT_PICKS, ...MADHU_PICKS];
const getPunishmentName = (key: string) => allPunishments.find(p => p.key === key);

export default function History({ data }: HistoryProps) {
  const [filter, setFilter] = useState<string>('both');
  const [editingLog, setEditingLog] = useState<string | null>(null);

  const filteredLogs = data.workoutLogs
    .filter(l => filter === 'both' || l.userId === filter)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Monthly summary
  const now = new Date();
  const currentMonth = now.toLocaleString('default', { month: 'long' });
  const monthLogs = data.workoutLogs.filter(l => {
    const d = new Date(l.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const logToEdit = editingLog ? data.workoutLogs.find(l => l.id === editingLog) : null;

  return (
    <div className="container space-y-6 pb-8">
      <h2 className="text-4xl md:text-5xl font-heading text-secondary text-center">📜 History</h2>

      {/* Monthly summary */}
      <div className="brutal-card bg-accent/30 p-4 text-center">
        <p className="font-heading text-2xl text-secondary">{currentMonth} Summary</p>
        <div className="flex justify-center gap-6 mt-2 font-mono text-base font-bold">
          {USERS.map(user => {
            const done = monthLogs.filter(l => l.userId === user.id && l.status === 'done').length;
            const total = monthLogs.filter(l => l.userId === user.id).length;
            return (
              <span key={user.id}>
                {user.emoji} {user.name}: <strong>{done}/{total}</strong> ✅
              </span>
            );
          })}
        </div>
      </div>

      {/* Filter toggle */}
      <div className="flex bg-muted rounded-full border-2 border-foreground p-1 max-w-md mx-auto">
        {[
          { id: 'both', label: '👫 Both' },
          { id: 'arpit', label: '🏋️ Arpit' },
          { id: 'madhu', label: '💪 Madhu' },
        ].map(opt => (
          <button
            key={opt.id}
            onClick={() => setFilter(opt.id)}
            className={`flex-1 py-2.5 rounded-full font-heading text-lg transition-all ${
              filter === opt.id
                ? 'bg-primary text-primary-foreground shadow-brutal-sm'
                : 'text-muted-foreground'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Log entries */}
      <div className="space-y-3">
        {filteredLogs.map(log => {
          const user = USERS.find(u => u.id === log.userId)!;
          const punishment = log.punishmentTriggered ? getPunishmentName(log.punishmentTriggered) : null;
          return (
            <div key={log.id} className="brutal-card p-4 hover-bounce">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{user.emoji}</span>
                  <div>
                    <p className="font-heading text-xl text-secondary">{user.name}</p>
                    <p className="font-mono text-sm font-bold text-muted-foreground">{formatDate(log.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`brutal-badge ${
                    log.status === 'done'
                      ? 'bg-success text-success-foreground'
                      : 'bg-destructive text-destructive-foreground'
                  }`}>
                    {log.status === 'done' ? '✅ Done' : '❌ Missed'}
                  </span>
                  <button
                    onClick={() => setEditingLog(log.id)}
                    className="brutal-btn p-2 rounded-lg bg-muted text-base"
                  >
                    ✏️
                  </button>
                </div>
              </div>
              {log.notes && (
                <p className="mt-2 text-base text-muted-foreground ml-11">💬 {log.notes}</p>
              )}
              {punishment && (
                <p className="mt-1 ml-11 font-mono text-sm font-bold text-destructive">
                  ⚡ Punishment: {punishment.emoji} {punishment.name}
                </p>
              )}
              {log.photoUrl && (
                <img
                  src={log.photoUrl}
                  alt="Workout photo"
                  className="mt-2 ml-11 rounded-lg border-2 border-foreground w-32 h-24 object-cover"
                  loading="lazy"
                />
              )}
            </div>
          );
        })}
      </div>

      {logToEdit && (
        <LogWorkoutModal
          data={data}
          initialUserId={logToEdit.userId}
          editLog={{
            id: logToEdit.id,
            userId: logToEdit.userId,
            date: logToEdit.date,
            status: logToEdit.status,
            notes: logToEdit.notes,
          }}
          onClose={() => setEditingLog(null)}
        />
      )}
    </div>
  );
}
