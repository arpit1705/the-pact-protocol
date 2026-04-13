export interface User {
  id: string;
  name: string;
  emoji: string;
}

export interface WorkoutLog {
  id: string;
  userId: string;
  date: string; // ISO date string YYYY-MM-DD
  status: 'done' | 'missed';
  photoUrl?: string;
  notes?: string;
  punishmentSelected: string | null;
  punishmentResolvedAt: string | null;
  mutualMiss?: boolean; // true when both users missed on the same date — punishment cancelled
}

export type PunishmentCounts = Record<string, Record<string, { total: number; resolved: number }>>;

export interface ResolutionEvent {
  id: string;
  debtorUserId: string;
  punishmentType: string;
  resolvedBy: string;
  resolvedAt: string; // ISO YYYY-MM-DD
}

export interface PunishmentOption {
  key: string;
  name: string;
  description: string;
  emoji: string;
}

export const USERS: User[] = [
  { id: 'arpit', name: 'Arpit', emoji: '🏋️' },
  { id: 'madhu', name: 'Madhu', emoji: '💪' },
];

// Punishments the OTHER user picks when someone misses
// When Madhu misses → Arpit picks from these
export const ARPIT_PICKS: PunishmentOption[] = [
  { key: 'thirst-trap', name: 'Thirst Trap on Demand', description: 'Strike a pose. No excuses.', emoji: '📸' },
  { key: 'oral-credit', name: 'Oral Pleasure Credit', description: 'Redeemable at any time. Non-negotiable.', emoji: '🎟️' },
  { key: 'story-time', name: 'Story Time', description: 'Read aloud something of their choosing.', emoji: '📖' },
  { key: 'difficult-convo', name: 'Difficult Conversation', description: 'Time to talk about that thing.', emoji: '💬' },
  { key: 'double-down', name: 'Double Down', description: '10 push-ups + 30 squats next day. No mercy.', emoji: '💪' },
  { key: 'salad-sentence', name: 'Salad Sentence', description: 'Next meal is leaves only. Suffer.', emoji: '🥗' },
];

// When Arpit misses → Madhu picks from these
export const MADHU_PICKS: PunishmentOption[] = [
  { key: 'video-shower', name: 'Video Call Shower', description: 'Exactly what it sounds like.', emoji: '🚿' },
  { key: 'watch-together', name: 'Watch Something Together', description: 'Their pick. No complaints.', emoji: '🎬' },
  { key: 'future-convo', name: 'Future Conversation', description: 'Talk about where this is going.', emoji: '🔮' },
  { key: 'non-veg', name: 'Non-Veg Commitment', description: 'Eat something adventurous.', emoji: '🍗' },
  { key: 'sexual-teasing', name: 'Sexual Teasing', description: 'All tease, no release. Cruel.', emoji: '🔥' },
  { key: 'read-discuss', name: 'Read and Discuss', description: 'Read an article/chapter, then discuss.', emoji: '📚' },
];

export const getOtherUser = (userId: string): User =>
  USERS.find(u => u.id !== userId)!;

export const getPunishmentOptions = (missedUserId: string): PunishmentOption[] =>
  missedUserId === 'madhu' ? ARPIT_PICKS : MADHU_PICKS;

export const getAllPunishments = (userId: string): PunishmentOption[] =>
  userId === 'madhu' ? ARPIT_PICKS : MADHU_PICKS;
