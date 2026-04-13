import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { WorkoutLog, PunishmentCounts, ResolutionEvent } from '@/types';

// ─── DB row types ─────────────────────────────────────────────────────────────

interface DbWorkoutLog {
  id: string;
  user_id: string;
  date: string;
  status: 'done' | 'missed';
  notes: string | null;
  photo_url: string | null;
  punishment_selected: string | null;
  punishment_resolved_at: string | null;
  mutual_miss: boolean;
  created_at: string;
}

interface DbPunishmentCount {
  debtor_user_id: string;
  punishment_key: string;
  total: number;
  resolved: number;
}

interface DbResolutionEvent {
  id: string;
  debtor_user_id: string;
  punishment_type: string;
  resolved_by: string;
  resolved_at: string;
}

// ─── Row → app type mappers ───────────────────────────────────────────────────

function toWorkoutLog(row: DbWorkoutLog): WorkoutLog {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    status: row.status,
    notes: row.notes ?? undefined,
    photoUrl: row.photo_url ?? undefined,
    punishmentSelected: row.punishment_selected,
    punishmentResolvedAt: row.punishment_resolved_at,
    mutualMiss: row.mutual_miss,
  };
}

function toResolutionEvent(row: DbResolutionEvent): ResolutionEvent {
  return {
    id: row.id,
    debtorUserId: row.debtor_user_id,
    punishmentType: row.punishment_type,
    resolvedBy: row.resolved_by,
    resolvedAt: row.resolved_at.split('T')[0],
  };
}

function toPunishmentCounts(rows: DbPunishmentCount[]): PunishmentCounts {
  const result: PunishmentCounts = {};
  for (const row of rows) {
    if (!result[row.debtor_user_id]) result[row.debtor_user_id] = {};
    result[row.debtor_user_id][row.punishment_key] = {
      total: row.total,
      resolved: row.resolved,
    };
  }
  return result;
}

// ─── Query keys ───────────────────────────────────────────────────────────────

const KEYS = {
  workoutLogs: ['workout_logs'] as const,
  punishmentCounts: ['punishment_counts'] as const,
  resolutionLog: ['resolution_events'] as const,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAppData() {
  const qc = useQueryClient();

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data: workoutLogs = [] } = useQuery({
    queryKey: KEYS.workoutLogs,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_logs')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      return (data as DbWorkoutLog[]).map(toWorkoutLog);
    },
  });

  const { data: punishmentCounts = {} } = useQuery({
    queryKey: KEYS.punishmentCounts,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('punishment_counts')
        .select('*');
      if (error) throw error;
      return toPunishmentCounts(data as DbPunishmentCount[]);
    },
  });

  const { data: resolutionLog = [] } = useQuery({
    queryKey: KEYS.resolutionLog,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resolution_events')
        .select('*')
        .order('resolved_at', { ascending: false });
      if (error) throw error;
      return (data as DbResolutionEvent[]).map(toResolutionEvent);
    },
  });

  // ── Mutations ──────────────────────────────────────────────────────────────

  const addWorkoutLogMutation = useMutation({
    mutationFn: async (log: Omit<WorkoutLog, 'id'>): Promise<WorkoutLog> => {
      let mutualMiss = false;

      // Check for mutual miss before inserting
      if (log.status === 'missed') {
        const otherUserId = log.userId === 'arpit' ? 'madhu' : 'arpit';
        const { data: otherMiss } = await supabase
          .from('workout_logs')
          .select('id')
          .eq('user_id', otherUserId)
          .eq('date', log.date)
          .eq('status', 'missed')
          .is('punishment_selected', null)
          .eq('mutual_miss', false)
          .maybeSingle();

        if (otherMiss) {
          mutualMiss = true;
          // Mark the other user's log as mutual miss too
          await supabase
            .from('workout_logs')
            .update({ mutual_miss: true })
            .eq('id', otherMiss.id);
        }
      }

      const { data, error } = await supabase
        .from('workout_logs')
        .insert({
          user_id: log.userId,
          date: log.date,
          status: log.status,
          notes: log.notes ?? null,
          photo_url: log.photoUrl ?? null,
          punishment_selected: log.punishmentSelected,
          punishment_resolved_at: log.punishmentResolvedAt,
          mutual_miss: mutualMiss,
        })
        .select()
        .single();

      if (error) throw error;
      return toWorkoutLog(data as DbWorkoutLog);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.workoutLogs }),
  });

  const updateWorkoutLogMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<WorkoutLog> }) => {
      const dbUpdates: Partial<DbWorkoutLog> = {};
      if (updates.date !== undefined) dbUpdates.date = updates.date;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes ?? null;
      if (updates.photoUrl !== undefined) dbUpdates.photo_url = updates.photoUrl ?? null;
      if (updates.punishmentSelected !== undefined) dbUpdates.punishment_selected = updates.punishmentSelected;
      if (updates.punishmentResolvedAt !== undefined) dbUpdates.punishment_resolved_at = updates.punishmentResolvedAt;
      if (updates.mutualMiss !== undefined) dbUpdates.mutual_miss = updates.mutualMiss;

      const { error } = await supabase
        .from('workout_logs')
        .update(dbUpdates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.workoutLogs }),
  });

  const incrementPunishmentMutation = useMutation({
    mutationFn: async ({ userId, punishmentKey }: { userId: string; punishmentKey: string }) => {
      // Upsert: increment total if exists, insert with total=1 if not
      const { data: existing } = await supabase
        .from('punishment_counts')
        .select('total, resolved')
        .eq('debtor_user_id', userId)
        .eq('punishment_key', punishmentKey)
        .maybeSingle();

      const { error } = await supabase
        .from('punishment_counts')
        .upsert(
          {
            debtor_user_id: userId,
            punishment_key: punishmentKey,
            total: (existing?.total ?? 0) + 1,
            resolved: existing?.resolved ?? 0,
          },
          { onConflict: 'debtor_user_id,punishment_key' },
        );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.punishmentCounts }),
  });

  const resolvePunishmentMutation = useMutation({
    mutationFn: async ({
      debtorUserId,
      punishmentKey,
      resolvedByUserId,
    }: {
      debtorUserId: string;
      punishmentKey: string;
      resolvedByUserId: string;
    }) => {
      // 1. Increment resolved count
      const { data: current } = await supabase
        .from('punishment_counts')
        .select('total, resolved')
        .eq('debtor_user_id', debtorUserId)
        .eq('punishment_key', punishmentKey)
        .single();

      if (current) {
        const { error: countError } = await supabase
          .from('punishment_counts')
          .update({ resolved: current.resolved + 1 })
          .eq('debtor_user_id', debtorUserId)
          .eq('punishment_key', punishmentKey);
        if (countError) throw countError;
      }

      // 2. Stamp punishment_resolved_at on the oldest matching unresolved log
      const { data: targetLog } = await supabase
        .from('workout_logs')
        .select('id')
        .eq('user_id', debtorUserId)
        .eq('punishment_selected', punishmentKey)
        .is('punishment_resolved_at', null)
        .order('date', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (targetLog) {
        const { error: logError } = await supabase
          .from('workout_logs')
          .update({ punishment_resolved_at: new Date().toISOString() })
          .eq('id', targetLog.id);
        if (logError) throw logError;
      }

      // 3. Create resolution event
      const { error: eventError } = await supabase
        .from('resolution_events')
        .insert({
          debtor_user_id: debtorUserId,
          punishment_type: punishmentKey,
          resolved_by: resolvedByUserId,
          resolved_at: new Date().toISOString(),
        });
      if (eventError) throw eventError;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.punishmentCounts });
      qc.invalidateQueries({ queryKey: KEYS.workoutLogs });
      qc.invalidateQueries({ queryKey: KEYS.resolutionLog });
    },
  });

  // ── Stable action wrappers (same signatures as before) ────────────────────

  const addWorkoutLog = useCallback(
    (log: Omit<WorkoutLog, 'id'>) => addWorkoutLogMutation.mutateAsync(log),
    [addWorkoutLogMutation],
  );

  const updateWorkoutLog = useCallback(
    (id: string, updates: Partial<WorkoutLog>) =>
      updateWorkoutLogMutation.mutate({ id, updates }),
    [updateWorkoutLogMutation],
  );

  const incrementPunishment = useCallback(
    (userId: string, punishmentKey: string) =>
      incrementPunishmentMutation.mutate({ userId, punishmentKey }),
    [incrementPunishmentMutation],
  );

  const resolvePunishment = useCallback(
    (debtorUserId: string, punishmentKey: string, resolvedByUserId: string) =>
      resolvePunishmentMutation.mutate({ debtorUserId, punishmentKey, resolvedByUserId }),
    [resolvePunishmentMutation],
  );

  // ── Computed queries (pure, run against in-memory data) ───────────────────

  const getStreakForUser = useCallback(
    (userId: string): number => {
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
        else if (i === 0) continue;
        else break;
      }
      return streak;
    },
    [workoutLogs],
  );

  const getTodayStatus = useCallback(
    (userId: string): 'done' | 'missed' | 'not-logged' => {
      const today = new Date().toISOString().split('T')[0];
      const log = workoutLogs.find(l => l.userId === userId && l.date === today);
      return log?.status ?? 'not-logged';
    },
    [workoutLogs],
  );

  const getMonthlyCount = useCallback(
    (userId: string): { done: number; total: number } => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const userLogs = workoutLogs.filter(l => {
        const d = new Date(l.date);
        return l.userId === userId && d.getFullYear() === year && d.getMonth() === month;
      });
      return { done: userLogs.filter(l => l.status === 'done').length, total: now.getDate() };
    },
    [workoutLogs],
  );

  const getTotalPunishments = useCallback(
    (userId: string): number => {
      const counts = punishmentCounts[userId] ?? {};
      return Object.values(counts).reduce((sum, c) => sum + (c.total - c.resolved), 0);
    },
    [punishmentCounts],
  );

  const getPendingMissedLogs = useCallback(
    (userId: string): WorkoutLog[] =>
      workoutLogs.filter(
        l => l.userId === userId && l.status === 'missed' && l.punishmentSelected === null && !l.mutualMiss,
      ),
    [workoutLogs],
  );

  return {
    workoutLogs,
    punishmentCounts,
    resolutionLog,
    addWorkoutLog,
    updateWorkoutLog,
    incrementPunishment,
    resolvePunishment,
    getPendingMissedLogs,
    getStreakForUser,
    getTodayStatus,
    getMonthlyCount,
    getTotalPunishments,
  };
}
