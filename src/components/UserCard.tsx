import { User } from '@/types';

interface UserCardProps {
  user: User;
  streak: number;
  todayStatus: 'done' | 'missed' | 'not-logged';
  monthlyCount: { done: number; total: number };
  totalPunishments: number;
  isActiveUser: boolean;
  onPickPunishment?: () => void;
}

const STATUS_CONFIG = {
  done: { label: '✅ DONE', className: 'bg-success text-success-foreground' },
  missed: { label: '❌ MISSED', className: 'bg-destructive text-destructive-foreground' },
  'not-logged': { label: '⏳ NOT LOGGED YET', className: 'bg-accent text-accent-foreground' },
};

export function UserCard({ user, streak, todayStatus, monthlyCount, totalPunishments, isActiveUser, onPickPunishment }: UserCardProps) {
  const status = STATUS_CONFIG[todayStatus];

  return (
    <div className={`brutal-card p-6 hover-bounce ${isActiveUser ? 'animate-pulse-glow-primary' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{user.emoji}</span>
          <div className="flex items-center gap-2">
            <h3 className="text-secondary">{user.name}</h3>
            {isActiveUser && (
              <span className="brutal-badge bg-primary text-primary-foreground text-xs">YOU</span>
            )}
          </div>
        </div>
        {totalPunishments > 0 && (
          <span className="brutal-badge bg-destructive text-destructive-foreground animate-pulse-glow text-base">
            {totalPunishments} owed
          </span>
        )}
      </div>

      {/* Today's status */}
      <div className={`brutal-badge text-lg px-4 py-2.5 mb-4 w-full justify-center ${status.className}`}>
        {status.label}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-accent/50 rounded-lg border-2 border-foreground p-3 text-center">
          <p className="text-2xl font-heading font-extrabold">🔥 {streak}</p>
          <p className="font-mono text-sm font-bold text-muted-foreground">day streak</p>
        </div>
        <div className="bg-accent/50 rounded-lg border-2 border-foreground p-3 text-center">
          <p className="text-2xl font-heading font-extrabold">{monthlyCount.done}/{monthlyCount.total}</p>
          <p className="font-mono text-sm font-bold text-muted-foreground">this month</p>
        </div>
      </div>

      {/* Punishment alert — shown for the other user when they have pending missed workouts */}
      {onPickPunishment && (
        <button
          onClick={onPickPunishment}
          className="brutal-btn mt-3 w-full py-2.5 rounded-lg bg-destructive text-destructive-foreground text-base font-heading hover-bounce"
        >
          ⚠️ {user.name} missed a workout! Pick their punishment →
        </button>
      )}
    </div>
  );
}
