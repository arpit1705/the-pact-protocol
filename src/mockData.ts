import { WorkoutLog, TreatCounts, ResolutionEvent } from '@/types';

export function generateMockData(): { logs: WorkoutLog[]; treats: TreatCounts; resolutionLog: ResolutionEvent[] } {
  const logs: WorkoutLog[] = [];
  const today = new Date();

  const mockEntries: { userId: string; daysAgo: number; status: 'done' | 'missed'; treat?: string; notes?: string }[] = [
    { userId: 'arpit', daysAgo: 1, status: 'done', notes: 'Heavy leg day 🦵' },
    { userId: 'madhu', daysAgo: 1, status: 'done', notes: 'Yoga flow + HIIT' },
    { userId: 'arpit', daysAgo: 2, status: 'done' },
    { userId: 'madhu', daysAgo: 2, status: 'missed', treat: 'thirst-trap' },
    { userId: 'arpit', daysAgo: 3, status: 'missed', treat: 'video-shower' },
    { userId: 'madhu', daysAgo: 3, status: 'done', notes: 'Morning run 🏃‍♀️' },
    { userId: 'arpit', daysAgo: 4, status: 'done' },
    { userId: 'madhu', daysAgo: 4, status: 'done' },
    { userId: 'arpit', daysAgo: 5, status: 'done', notes: 'Chest & tris' },
    { userId: 'madhu', daysAgo: 5, status: 'done' },
    { userId: 'arpit', daysAgo: 6, status: 'done' },
    { userId: 'madhu', daysAgo: 6, status: 'missed', treat: 'oral-credit' },
    { userId: 'arpit', daysAgo: 7, status: 'done', notes: 'PR on deadlift!' },
    { userId: 'madhu', daysAgo: 7, status: 'done' },
    { userId: 'arpit', daysAgo: 8, status: 'missed', treat: 'sexual-teasing' },
    { userId: 'madhu', daysAgo: 8, status: 'done' },
    { userId: 'arpit', daysAgo: 9, status: 'done' },
    { userId: 'madhu', daysAgo: 9, status: 'done' },
    { userId: 'arpit', daysAgo: 10, status: 'done' },
    { userId: 'madhu', daysAgo: 10, status: 'missed', treat: 'double-down' },
    { userId: 'arpit', daysAgo: 11, status: 'done' },
    { userId: 'madhu', daysAgo: 11, status: 'done', notes: 'Swimming 🏊‍♀️' },
    { userId: 'arpit', daysAgo: 12, status: 'done' },
    { userId: 'madhu', daysAgo: 12, status: 'done' },
    { userId: 'arpit', daysAgo: 13, status: 'missed', treat: 'watch-together' },
    { userId: 'madhu', daysAgo: 13, status: 'done' },
  ];

  mockEntries.forEach((entry, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - entry.daysAgo);
    logs.push({
      id: `mock-${i}`,
      userId: entry.userId,
      date: d.toISOString().split('T')[0],
      status: entry.status,
      notes: entry.notes,
      treatSelected: entry.treat ?? null,
      treatResolvedAt: null,
      photoUrl: entry.status === 'done' && Math.random() > 0.7
        ? `https://picsum.photos/seed/${entry.userId}-${entry.daysAgo}/400/300`
        : undefined,
    });
  });

  const treats: TreatCounts = {
    // Madhu owes these (Arpit picked them when Madhu missed)
    madhu: {
      'thirst-trap': { total: 1, resolved: 0 },
      'oral-credit': { total: 1, resolved: 0 },
      'double-down': { total: 1, resolved: 0 },
    },
    // Arpit owes these (Madhu picked them when Arpit missed)
    arpit: {
      'video-shower': { total: 1, resolved: 0 },
      'sexual-teasing': { total: 1, resolved: 0 },
      'watch-together': { total: 1, resolved: 0 },
    },
  };

  const resolutionLog: ResolutionEvent[] = [];

  return { logs, treats, resolutionLog };
}
