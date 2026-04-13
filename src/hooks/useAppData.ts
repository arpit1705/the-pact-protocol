import { useState, useCallback } from 'react';
import { WorkoutLog, PunishmentCounts } from '@/types';
import { generateMockData } from '@/mockData';

const { logs: initialLogs, punishments: initialPunishments } = generateMockData();

export function useAppData() {
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>(initialLogs);
  const [punishmentCounts, setPunishmentCounts] = useState<PunishmentCounts>(initialPunishments);

  const addWorkoutLog = useCallback((log: Omit<WorkoutLog, 'id'>) => {
    const newLog: WorkoutLog = {
      ...log,
      id: crypto.randomUUID(),
    };
    setWorkoutLogs(prev => [newLog, ...prev]);
    return newLog;
  }, []);

  const updateWorkoutLog = useCallback((id: string, updates: Partial<WorkoutLog>) => {
    setWorkoutLogs(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, []);

  const incrementPunishment = useCallback((userId: string, punishmentKey: string) => {
    setPunishmentCounts(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [punishmentKey]: (prev[userId]?.[punishmentKey] || 0) + 1,
      },
    }));
  }, []);

  const decrementPunishment = useCallback((userId: string, punishmentKey: string) => {
    setPunishmentCounts(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [punishmentKey]: Math.max(0, (prev[userId]?.[punishmentKey] || 0) - 1),
      },
    }));
  }, []);

  const getStreakForUser = useCallback((userId: string): number => {
    const userLogs = workoutLogs
      .filter(l => l.userId === userId)
      .sort((a, b) => b.date.localeCompare(a.date));

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const log = userLogs.find(l => l.date === dateStr);
      if (log?.status === 'done') streak++;
      else if (log?.status === 'missed') break;
      else if (i === 0) continue; // today not logged yet is ok
      else break;
    }
    return streak;
  }, [workoutLogs]);

  const getTodayStatus = useCallback((userId: string): 'done' | 'missed' | 'not-logged' => {
    const today = new Date().toISOString().split('T')[0];
    const log = workoutLogs.find(l => l.userId === userId && l.date === today);
    return log?.status || 'not-logged';
  }, [workoutLogs]);

  const getMonthlyCount = useCallback((userId: string): { done: number; total: number } => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const userLogs = workoutLogs.filter(l => {
      const d = new Date(l.date);
      return l.userId === userId && d.getFullYear() === year && d.getMonth() === month;
    });
    return {
      done: userLogs.filter(l => l.status === 'done').length,
      total: now.getDate(),
    };
  }, [workoutLogs]);

  const getTotalPunishments = useCallback((userId: string): number => {
    const counts = punishmentCounts[userId] || {};
    return Object.values(counts).reduce((sum, c) => sum + c, 0);
  }, [punishmentCounts]);

  return {
    workoutLogs,
    punishmentCounts,
    addWorkoutLog,
    updateWorkoutLog,
    incrementPunishment,
    decrementPunishment,
    getStreakForUser,
    getTodayStatus,
    getMonthlyCount,
    getTotalPunishments,
  };
}
