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
  details: string;
  emoji: string;
}

export const USERS: User[] = [
  { id: 'arpit', name: 'Arpit', emoji: '🏋️' },
  { id: 'madhu', name: 'Madhu', emoji: '💪' },
];

// Punishments the OTHER user picks when someone misses
// When Madhu misses → Arpit picks from these
export const ARPIT_PICKS: PunishmentOption[] = [
  {
    key: 'thirst-trap',
    name: 'Thirst Trap on Demand',
    description: 'Strike a pose. No excuses.',
    details: 'Must deliver one high-effort, well-lit, genuinely sexy photo. Pose to be specified. No lazy, half-hearted, or poorly lit submissions accepted.',
    emoji: '📸',
  },
  {
    key: 'oral-credit',
    name: 'Oral Pleasure Credit',
    description: 'Redeemable at any time. Non-negotiable.',
    details: 'One token added to the redeemable counter. Can be cashed in at any future time during an in-person visit. Token holder is entirely horizontal and uninvolved — the debtor does all the work.',
    emoji: '🎟️',
  },
  {
    key: 'story-time',
    name: 'Story Time',
    description: 'Read aloud something of their choosing.',
    details: 'Must conduct one dedicated bedtime storytelling session that evening, with full attention, no distractions, and phone face-down. Topic chosen by the storyteller. Goal: put the other person to sleep.',
    emoji: '📖',
  },
  {
    key: 'difficult-convo',
    name: 'Difficult Conversation',
    description: 'Time to talk about that thing.',
    details: 'Must openly discuss one topic they would normally avoid — without getting defensive, dismissive, or angry. Genuine openness required for the full duration.',
    emoji: '💬',
  },
  {
    key: 'double-down',
    name: 'Double Down',
    description: '10 push-ups + 30 squats next day. No mercy.',
    details: 'Must complete 10 push-ups AND 30 squats the following day, in addition to the regular workout. Evidence required.',
    emoji: '💪',
  },
  {
    key: 'salad-sentence',
    name: 'Salad Sentence',
    description: 'Next meal is leaves only. Suffer.',
    details: 'Dinner that evening shall consist of salad only. No exceptions, no sneaky additions.',
    emoji: '🥗',
  },
];

// When Arpit misses → Madhu picks from these
export const MADHU_PICKS: PunishmentOption[] = [
  {
    key: 'video-shower',
    name: 'Video Call Shower',
    description: 'Exactly what it sounds like.',
    details: 'Must shower on a video call in the other party\'s presence. Non-negotiable and cannot be substituted.',
    emoji: '🚿',
  },
  {
    key: 'watch-together',
    name: 'Watch Something Together',
    description: 'Their pick. No complaints.',
    details: 'Must watch a show or movie of the other party\'s choosing, together, that night. No skipping, no falling asleep, no phone during the show.',
    emoji: '🎬',
  },
  {
    key: 'future-convo',
    name: 'Future Conversation',
    description: 'Talk about where this is going.',
    details: 'Must discuss a future-related topic selected by the other party — without being dismissive, avoidant, or in denial. Full presence and genuine engagement required.',
    emoji: '🔮',
  },
  {
    key: 'non-veg',
    name: 'Non-Veg Commitment',
    description: 'Eat something adventurous.',
    details: 'Must consume chicken or another non-vegetarian item (excluding eggs) at least once within the next 15 days.',
    emoji: '🍗',
  },
  {
    key: 'sexual-teasing',
    name: 'Sexual Teasing',
    description: 'All tease, no release. Cruel.',
    details: 'Must tease the other party sexually in a form of their choosing — may include a nude, a sext, or an explicit voice note. Effort and intent are mandatory.',
    emoji: '🔥',
  },
  {
    key: 'read-discuss',
    name: 'Read and Discuss',
    description: 'Read an article/chapter, then discuss.',
    details: 'Must read whatever material is sent, in its entirety, and engage in a meaningful discussion afterward. "I read it" without discussion is not sufficient.',
    emoji: '📚',
  },
];

export const getOtherUser = (userId: string): User =>
  USERS.find(u => u.id !== userId)!;

export const getPunishmentOptions = (missedUserId: string): PunishmentOption[] =>
  missedUserId === 'madhu' ? ARPIT_PICKS : MADHU_PICKS;

export const getAllPunishments = (userId: string): PunishmentOption[] =>
  userId === 'madhu' ? ARPIT_PICKS : MADHU_PICKS;
