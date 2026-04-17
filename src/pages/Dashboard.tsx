import { useState } from 'react';
import { USERS } from '@/types';
import { UserCard } from '@/components/UserCard';
import { LogWorkoutModal } from '@/components/LogWorkoutModal';
import { TreatSelector } from '@/components/TreatSelector';
import { MotivationalBanner } from '@/components/MotivationalBanner';
import { useAppData } from '@/hooks/useAppData';
import { useActiveUser } from '@/context/ActiveUserContext';

// Re-export the hook result type for children
export type AppData = ReturnType<typeof useAppData>;

interface DashboardProps {
  data: AppData;
}

export default function Dashboard({ data }: DashboardProps) {
  const { activeUser } = useActiveUser();
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [treatModalUserId, setTreatModalUserId] = useState<string | null>(null);

  // Active user always first
  const sortedUsers = [...USERS].sort((a, b) => (a.id === activeUser ? -1 : b.id === activeUser ? 1 : 0));

  const otherUserId = activeUser === 'arpit' ? 'madhu' : 'arpit';
  const pendingMissedLogs = data.getPendingMissedLogs(otherUserId);
  const hasPendingTreat = pendingMissedLogs.length > 0;

  const allTreatsResolved =
    data.getTotalTreats('arpit') === 0 && data.getTotalTreats('madhu') === 0;
  const noPendingMissed =
    data.getPendingMissedLogs('arpit').length === 0 && data.getPendingMissedLogs('madhu').length === 0;
  const showCelebration = allTreatsResolved && noPendingMissed;

  const activeUserObj = USERS.find(u => u.id === activeUser)!;

  return (
    <div className="container space-y-6 pb-8">
      <div className="text-center mb-2">
        <h2 className="text-4xl md:text-5xl font-heading text-secondary">The Scoreboard ⚡</h2>
      </div>

      {/* Celebration banner */}
      {showCelebration && (
        <div className="brutal-card bg-success text-success-foreground p-4 text-center animate-bounce-in">
          <p className="font-heading text-2xl">🎉 You're both killing it. The Pact is satisfied.</p>
        </div>
      )}

      {/* User cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedUsers.map(user => (
          <UserCard
            key={user.id}
            user={user}
            streak={data.getStreakForUser(user.id)}
            todayStatus={data.getTodayStatus(user.id)}
            monthlyCount={data.getMonthlyCount(user.id)}
            totalTreats={data.getTotalTreats(user.id === 'arpit' ? 'madhu' : 'arpit')}
            isActiveUser={user.id === activeUser}
            onPickTreat={
              user.id === otherUserId && hasPendingTreat
                ? () => setTreatModalUserId(otherUserId)
                : undefined
            }
          />
        ))}
      </div>

      <MotivationalBanner />

      {/* Quick log — only for active user */}
      <div className="text-center space-y-3">
        <p className="font-mono text-base font-bold text-muted-foreground uppercase tracking-wider">⚡ Quick Log ⚡</p>
        <div className="flex justify-center">
          <button
            onClick={() => setLogModalOpen(true)}
            className="brutal-btn bg-secondary text-secondary-foreground px-8 py-4 rounded-xl text-xl hover-bounce"
          >
            {activeUserObj.emoji} Log My Workout
          </button>
        </div>
      </div>

      {logModalOpen && (
        <LogWorkoutModal
          data={data}
          initialUserId={activeUser}
          onClose={() => setLogModalOpen(false)}
        />
      )}

      {treatModalUserId && (
        <TreatSelector
          missedUserId={treatModalUserId}
          data={data}
          logId={pendingMissedLogs[0]?.id ?? null}
          onClose={() => setTreatModalUserId(null)}
        />
      )}
    </div>
  );
}
