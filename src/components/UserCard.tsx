import { User } from '@/types';

interface UserCardProps {
  user: User;
  streak: number;
  todayStatus: 'done' | 'missed' | 'not-logged';
  monthlyCount: { done: number; total: number };
  totalPunishments: number;
}

const STATUS_CONFIG = {
  done: { label: '✅ DONE', className: 'bg-success text-success-foreground' },
  missed: { label: '❌ MISSED', className: 'bg-destructive text-destructive-foreground' },
  'not-logged': { label: '⏳ NOT LOGGED YET', className: 'bg-accent text-accent-foreground' },
};

export function UserCard({ user, streak, todayStatus, monthlyCount, totalPunishments }: UserCardProps) {
  const status = STATUS_CONFIG[todayStatus];

  return (
    <div className="brutal-card p-6 hover-bounce">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{user.emoji}</span>
          <h3 className="text-3xl font-heading text-secondary">{user.name}</h3>
        </div>
        {totalPunishments > 0 && (
          <span className="brutal-badge bg-destructive text-destructive-foreground animate-pulse-glow">
            {totalPunishments} owed
          </span>
        )}
      </div>

      {/* Today's status */}
      <div className={`brutal-badge text-base px-4 py-2 mb-4 w-full justify-center ${status.className}`}>
        {status.label}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-accent/50 rounded-lg border-2 border-foreground p-3 text-center">
          <p className="text-2xl font-heading">🔥 {streak}</p>
          <p className="font-mono text-xs text-muted-foreground">day streak</p>
        </div>
        <div className="bg-accent/50 rounded-lg border-2 border-foreground p-3 text-center">
          <p className="text-2xl font-heading">{monthlyCount.done}/{monthlyCount.total}</p>
          <p className="font-mono text-xs text-muted-foreground">this month</p>
        </div>
      </div>
    </div>
  );
}
