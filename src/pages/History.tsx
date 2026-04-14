import { useMemo, useState } from 'react';
import { USERS, ARPIT_PICKS, MADHU_PICKS, WorkoutLog, PunishmentOption, ResolutionEvent } from '@/types';
import { LogWorkoutModal } from '@/components/LogWorkoutModal';
import { useActiveUser } from '@/context/ActiveUserContext';
import type { AppData } from '@/pages/Dashboard';

interface HistoryProps {
  data: AppData;
}

type TimelineEvent =
  | { kind: 'workout'; log: WorkoutLog }
  | { kind: 'punishment'; log: WorkoutLog; option: PunishmentOption }
  | { kind: 'resolution'; event: ResolutionEvent };

const allPunishments = [...ARPIT_PICKS, ...MADHU_PICKS];
const getPunishmentOption = (key: string) => allPunishments.find(p => p.key === key);

export default function History({ data }: HistoryProps) {
  const { activeUser } = useActiveUser();
  const [userFilter, setUserFilter] = useState<string>('both');
  const [eventFilter, setEventFilter] = useState<'all' | 'workouts' | 'punishments' | 'resolutions'>('all');
  const [editingLog, setEditingLog] = useState<string | null>(null);

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

  // Build the unified timeline
  const timeline = useMemo((): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    data.workoutLogs.forEach(log => {
      events.push({ kind: 'workout', log });
      if (log.punishmentSelected) {
        const option = getPunishmentOption(log.punishmentSelected);
        if (option) events.push({ kind: 'punishment', log, option });
      }
    });

    data.resolutionLog.forEach(event => {
      events.push({ kind: 'resolution', event });
    });

    return events;
  }, [data.workoutLogs, data.resolutionLog]);

  // Apply both filters
  const filteredTimeline = useMemo(() => {
    return timeline
      .filter(e => {
        // User filter
        if (userFilter !== 'both') {
          if (e.kind === 'workout' || e.kind === 'punishment') {
            if (e.log.userId !== userFilter) return false;
          } else if (e.kind === 'resolution') {
            if (e.event.debtorUserId !== userFilter) return false;
          }
        }
        // Event type filter
        if (eventFilter === 'workouts') return e.kind === 'workout';
        if (eventFilter === 'punishments') return e.kind === 'punishment';
        if (eventFilter === 'resolutions') return e.kind === 'resolution';
        return true;
      })
      .sort((a, b) => {
        const dateA = a.kind === 'resolution' ? a.event.resolvedAt : a.log.date;
        const dateB = b.kind === 'resolution' ? b.event.resolvedAt : b.log.date;
        // Same date: sort workout before punishment before resolution
        if (dateA === dateB) {
          const kindOrder = { workout: 0, punishment: 1, resolution: 2 };
          return kindOrder[a.kind] - kindOrder[b.kind];
        }
        return dateB.localeCompare(dateA);
      });
  }, [timeline, userFilter, eventFilter]);

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

      {/* User filter toggle */}
      <div className="flex bg-muted rounded-full border-2 border-foreground p-1 max-w-md mx-auto">
        {[
          { id: 'both', label: '👫 Both' },
          { id: 'arpit', label: '🏋️ Arpit' },
          { id: 'madhu', label: '💪 Madhu' },
        ].map(opt => (
          <button
            key={opt.id}
            onClick={() => setUserFilter(opt.id)}
            className={`flex-1 py-2.5 rounded-full font-heading text-lg transition-all ${
              userFilter === opt.id
                ? 'bg-primary text-primary-foreground shadow-brutal-sm'
                : 'text-muted-foreground'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Event type filter */}
      <div className="flex bg-muted rounded-full border-2 border-foreground p-1 max-w-xl mx-auto">
        {[
          { id: 'all', label: '📋 All' },
          { id: 'workouts', label: '🏋️ Workouts' },
          { id: 'punishments', label: '🔥 Punishments' },
          { id: 'resolutions', label: '✅ Resolved' },
        ].map(opt => (
          <button
            key={opt.id}
            onClick={() => setEventFilter(opt.id as typeof eventFilter)}
            className={`flex-1 py-2 rounded-full font-heading text-base transition-all ${
              eventFilter === opt.id
                ? 'bg-primary text-primary-foreground shadow-brutal-sm'
                : 'text-muted-foreground'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {filteredTimeline.map((event, idx) => {
          if (event.kind === 'workout') {
            const log = event.log;
            const user = USERS.find(u => u.id === log.userId)!;
            const punishment = log.punishmentSelected ? getPunishmentOption(log.punishmentSelected) : null;
            const isPunishmentPending = log.status === 'missed' && log.punishmentSelected === null && !log.mutualMiss;
            const canEdit = activeUser === log.userId;

            return (
              <div key={`workout-${log.id}`} className="brutal-card p-4 hover-bounce">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{user.emoji}</span>
                    <div>
                      <p className="font-heading text-xl text-secondary">{user.name}</p>
                      <p className="font-mono text-sm font-bold text-muted-foreground">{formatDate(log.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <span className={`brutal-badge ${
                      log.status === 'done'
                        ? 'bg-success text-success-foreground'
                        : 'bg-destructive text-destructive-foreground'
                    }`}>
                      {log.status === 'done' ? '✅ Done' : '❌ Missed'}
                    </span>
                    {log.mutualMiss && (
                      <span className="brutal-badge bg-muted text-muted-foreground text-xs">
                        🤝 Mutual Miss
                      </span>
                    )}
                    {isPunishmentPending && (
                      <span className="brutal-badge bg-accent text-accent-foreground animate-pulse-glow text-xs">
                        ⚠️ PUNISHMENT PENDING
                      </span>
                    )}
                    {canEdit && (
                      <button
                        onClick={() => setEditingLog(log.id)}
                        className="brutal-btn p-2 rounded-lg bg-muted text-base"
                      >
                        ✏️
                      </button>
                    )}
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
          }

          if (event.kind === 'punishment') {
            const log = event.log;
            const user = USERS.find(u => u.id === log.userId)!;
            return (
              <div key={`punishment-${log.id}-${idx}`} className="brutal-card p-4 border-destructive/50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔥</span>
                  <div>
                    <p className="font-heading text-xl text-secondary">
                      Punishment picked: {event.option.emoji} {event.option.name}
                    </p>
                    <p className="font-mono text-sm font-bold text-muted-foreground">
                      for {user.name}'s miss on {formatDate(log.date)}
                    </p>
                  </div>
                </div>
              </div>
            );
          }

          // resolution
          const resolverUser = USERS.find(u => u.id === event.event.resolvedBy);
          const punishmentOption = getPunishmentOption(event.event.punishmentType);
          return (
            <div key={`resolution-${event.event.id}`} className="brutal-card p-4 border-success/50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-heading text-xl text-secondary">
                    {resolverUser?.name} marked {punishmentOption?.emoji} {punishmentOption?.name} as served
                  </p>
                  <p className="font-mono text-sm font-bold text-muted-foreground">
                    {formatDate(event.event.resolvedAt)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {filteredTimeline.length === 0 && (
          <div className="brutal-card p-8 text-center text-muted-foreground">
            <p className="font-heading text-2xl">Nothing here yet.</p>
            <p className="font-mono text-sm font-bold mt-2">Log a workout to get started.</p>
          </div>
        )}
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
            photoUrl: logToEdit.photoUrl,
          }}
          onClose={() => setEditingLog(null)}
        />
      )}
    </div>
  );
}
