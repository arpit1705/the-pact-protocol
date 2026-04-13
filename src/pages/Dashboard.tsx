import { useState } from 'react';
import { USERS } from '@/types';
import { UserCard } from '@/components/UserCard';
import { LogWorkoutModal } from '@/components/LogWorkoutModal';
import { MotivationalBanner } from '@/components/MotivationalBanner';
import { useAppData } from '@/hooks/useAppData';

// Re-export the hook result type for children
export type AppData = ReturnType<typeof useAppData>;

interface DashboardProps {
  data: AppData;
}

export default function Dashboard({ data }: DashboardProps) {
  const [logModalUser, setLogModalUser] = useState<string | null>(null);

  return (
    <div className="container space-y-6 pb-8">
      <div className="text-center mb-2">
        <h2 className="text-4xl md:text-5xl font-heading text-secondary">The Scoreboard ⚡</h2>
      </div>

      {/* User cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {USERS.map(user => (
          <UserCard
            key={user.id}
            user={user}
            streak={data.getStreakForUser(user.id)}
            todayStatus={data.getTodayStatus(user.id)}
            monthlyCount={data.getMonthlyCount(user.id)}
            totalPunishments={data.getTotalPunishments(user.id)}
          />
        ))}
      </div>

      <MotivationalBanner />

      {/* Quick log buttons */}
      <div className="text-center space-y-3">
        <p className="font-mono text-sm text-muted-foreground uppercase tracking-wider">⚡ Quick Log ⚡</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {USERS.map(user => (
            <button
              key={user.id}
              onClick={() => setLogModalUser(user.id)}
              className="brutal-btn bg-secondary text-secondary-foreground px-8 py-4 rounded-xl text-lg hover-bounce"
            >
              {user.emoji} Log {user.name}'s Workout
            </button>
          ))}
        </div>
      </div>

      {logModalUser && (
        <LogWorkoutModal
          data={data}
          initialUserId={logModalUser}
          onClose={() => setLogModalUser(null)}
        />
      )}
    </div>
  );
}
