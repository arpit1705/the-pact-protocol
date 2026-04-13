import { useState } from 'react';
import { X } from 'lucide-react';
import { PunishmentSelector } from '@/components/PunishmentSelector';
import { ConfettiCelebration } from '@/components/ConfettiCelebration';
import { useActiveUser } from '@/context/ActiveUserContext';
import type { AppData } from '@/pages/Dashboard';

interface LogWorkoutModalProps {
  data: AppData;
  initialUserId: string;
  editLog?: { id: string; userId: string; date: string; status: 'done' | 'missed'; notes?: string };
  onClose: () => void;
}

export function LogWorkoutModal({ data, initialUserId, editLog, onClose }: LogWorkoutModalProps) {
  const { activeUser } = useActiveUser();
  // For new logs: locked to activeUser. For edit: use the log's original userId.
  const [userId] = useState(editLog?.userId ?? activeUser);
  const [date, setDate] = useState(editLog?.date || new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'done' | 'missed' | null>(editLog?.status || null);
  const [notes, setNotes] = useState(editLog?.notes || '');
  const [showPunishment, setShowPunishment] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMutualMiss, setShowMutualMiss] = useState(false);
  const [submittedLogId, setSubmittedLogId] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!status) return;

    if (editLog) {
      data.updateWorkoutLog(editLog.id, { userId, date, status, notes: notes || undefined });
    } else {
      const log = data.addWorkoutLog({
        userId,
        date,
        status,
        notes: notes || undefined,
        punishmentSelected: null,
        punishmentResolvedAt: null,
      });
      setSubmittedLogId(log.id);
      if (status === 'missed' && log.mutualMiss) {
        setShowMutualMiss(true);
        return;
      }
    }

    if (status === 'done') {
      setShowConfetti(true);
      setTimeout(onClose, 1500);
    } else {
      setShowPunishment(true);
    }
  };

  if (showConfetti) {
    return <ConfettiCelebration onDone={onClose} />;
  }

  if (showMutualMiss) {
    return (
      <div className="fixed inset-0 bg-foreground/50 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
        <div className="brutal-card bg-background w-full md:max-w-lg md:rounded-xl rounded-t-2xl rounded-b-none md:rounded-b-xl p-6 animate-bounce-in text-center">
          <p className="text-6xl mb-4">🤝</p>
          <h2 className="text-3xl font-heading text-secondary mb-2">Mutual Miss!</h2>
          <p className="font-mono text-base font-bold text-muted-foreground mb-6">
            You both skipped on the same day. No punishments owed — this one cancels out.
            <br /><br />
            Don't let it happen again.
          </p>
          <button
            onClick={onClose}
            className="brutal-btn w-full py-4 rounded-xl text-xl font-heading bg-accent text-accent-foreground hover-bounce"
          >
            Understood 🫡
          </button>
        </div>
      </div>
    );
  }

  if (showPunishment) {
    return (
      <PunishmentSelector
        missedUserId={userId}
        data={data}
        logId={submittedLogId || editLog?.id}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-foreground/50 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="brutal-card bg-background w-full md:max-w-lg md:rounded-xl rounded-t-2xl rounded-b-none md:rounded-b-xl p-6 max-h-[90vh] overflow-y-auto animate-bounce-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-heading text-secondary">
            {editLog ? '✏️ Edit Log' : '🏋️ Log Workout'}
          </h2>
          <button onClick={onClose} className="brutal-btn p-2 rounded-lg bg-muted">
            <X size={18} />
          </button>
        </div>

        {/* Date */}
        <div className="mb-4">
          <label className="font-mono text-sm font-bold text-muted-foreground uppercase tracking-wider block mb-2">When?</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full brutal-btn bg-card px-4 py-3 rounded-lg font-mono"
          />
        </div>

        {/* Status toggle */}
        <div className="mb-4">
          <label className="font-mono text-sm font-bold text-muted-foreground uppercase tracking-wider block mb-2">Did it happen?</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setStatus('done')}
              className={`brutal-btn py-4 rounded-lg text-xl ${
                status === 'done'
                  ? 'bg-success text-success-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              ✅ Done!
            </button>
            <button
              onClick={() => setStatus('missed')}
              className={`brutal-btn py-4 rounded-lg text-xl ${
                status === 'missed'
                  ? 'bg-destructive text-destructive-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              ❌ Missed
            </button>
          </div>
        </div>

        {/* Photo upload zone */}
        <div className="mb-4">
          <label className="font-mono text-sm font-bold text-muted-foreground uppercase tracking-wider block mb-2">
            Sweaty selfie? Drop it here 📸
          </label>
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center text-muted-foreground hover:border-primary transition-colors cursor-pointer">
            <p className="text-3xl mb-2">📷</p>
            <p className="font-mono text-sm font-bold">Photo upload coming soon™</p>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="font-mono text-sm font-bold text-muted-foreground uppercase tracking-wider block mb-2">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="How was it? Brag or complain..."
            className="w-full brutal-btn bg-card px-4 py-3 rounded-lg font-body resize-none h-20"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!status}
          className={`brutal-btn w-full py-4 rounded-xl text-xl font-heading ${
            status
              ? 'bg-primary text-primary-foreground hover-bounce'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          {status === 'missed' ? '😬 Submit & Face Consequences' : '🔥 Submit'}
        </button>
      </div>
    </div>
  );
}
