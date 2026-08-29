import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GlassPanel } from '../shared/GlassPanel';
import { X, AlertTriangle, Gift, ShieldAlert, Camera, Send, Award, Clock, Sun, Cloud, User, CheckCircle, Radio, Play, Pause, RotateCcw } from 'lucide-react';
import { playSound } from '../../lib/sound';

export const ModalManager: React.FC = () => {
  const {
    activeModal,
    modalData,
    closeModal,
    issueWarning,
    grantBonusBreak,
    toggleBlockAgent,
    updateUserAvatar,
    updateUserProfile,
    appealWarning,
    sendBroadcast,
    addShiftNote,
    currentUser,
    users,
    breaks,
    warnings,
    endBreak,
  } = useApp();

  // Local states for modal forms
  const [warnLevel, setWarnLevel] = useState<1 | 2 | 3>(1);
  const [warnReason, setWarnReason] = useState('Slot overrun by 2 minutes');
  const [warnNote, setWarnNote] = useState('');
  const [bonusReason, setBonusReason] = useState('Qualified 10+ BQ leads with live bookings! 🍕');
  const [newAvatarUrl, setNewAvatarUrl] = useState('');
  const [blockReason, setBlockReason] = useState('Floor attendance audit');
  const [appealText, setAppealText] = useState('');
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastPriority, setBroadcastPriority] = useState<'normal' | 'urgent' | 'critical'>('normal');
  const [handoverText, setHandoverText] = useState('');
  const [handoverCategory, setHandoverCategory] = useState<'general' | 'warning' | 'praise' | 'alert'>('general');
  const [goalText, setGoalText] = useState('');
  const [goalTarget, setGoalTarget] = useState(10);

  // Replay time machine state
  const [replaySpeed, setReplaySpeed] = useState(1);
  const [replayPlaying, setReplayPlaying] = useState(false);
  const [replayProgress, setReplayProgress] = useState(45);

  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl overflow-y-auto">
      {/* 1. WARNING ISSUANCE MODAL (PART 12) */}
      {activeModal === 'warning' && (
        <GlassPanel material="thick" className="w-full max-w-lg p-6 border-2 border-yellow-400/50 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-2 text-yellow-400 font-orbitron font-bold text-lg">
              <AlertTriangle className="w-5 h-5" />
              Issue Warning to {modalData?.agent?.name}
            </div>
            <button onClick={closeModal} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          <div className="space-y-4">
            {/* Level selection buttons with penalty previews */}
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setWarnLevel(lvl as 1 | 2 | 3)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    warnLevel === lvl
                      ? lvl === 1
                        ? 'bg-yellow-400/20 border-yellow-400 text-yellow-300 font-bold'
                        : lvl === 2
                        ? 'bg-orange-500/20 border-orange-500 text-orange-300 font-bold'
                        : 'bg-crimson/20 border-crimson text-red-300 font-bold'
                      : 'bg-black/40 border-white/10 text-zinc-400'
                  }`}
                >
                  <div className="font-orbitron text-xs">Level {lvl}</div>
                  <div className="text-[10px] text-zinc-400 mt-1">
                    {lvl === 1 ? 'Badge Only (3 Shifts)' : lvl === 2 ? '50m Budget · 4 Slots' : '40m Budget · 4 Slots (7 Shifts)'}
                  </div>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-orbitron text-zinc-300 mb-1">Preset Reason</label>
              <select
                value={warnReason}
                onChange={e => setWarnReason(e.target.value)}
                className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="Slot overrun by 2 minutes">Slot overrun by 2 minutes</option>
                <option value="Exceeded daily 60m budget">Exceeded daily 60m budget</option>
                <option value="Exceeded 20m WC allowance">Exceeded 20m WC allowance</option>
                <option value="Restricted hour break attempt">Restricted hour break attempt</option>
                <option value="Floor discipline reminder">Floor discipline reminder</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-orbitron text-zinc-300 mb-1">Custom Note (Firm but humorous)</label>
              <textarea
                value={warnNote}
                onChange={e => setWarnNote(e.target.value)}
                placeholder="e.g. Nice try Solomon, but math is hard. 17m is not 15m! Keep it clean 😊"
                className="w-full h-20 bg-black/80 border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none placeholder-zinc-600"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={closeModal} className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-orbitron">
                Cancel
              </button>
              <button
                onClick={() => {
                  issueWarning(modalData.agent.email, warnLevel, warnReason, warnNote || warnReason);
                  closeModal();
                }}
                className="px-6 py-2 rounded-xl bg-crimson hover:bg-red-600 text-white font-orbitron font-bold text-xs shadow-lg"
              >
                Issue Warning
              </button>
            </div>
          </div>
        </GlassPanel>
      )}

      {/* 2. BONUS BREAK MODAL ("10 BQ LEADS RULE") */}
      {activeModal === 'bonus' && (
        <GlassPanel material="thick" className="w-full max-w-md p-6 border-2 border-yellow-400/60 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-2 text-gold font-orbitron font-bold text-lg">
              <Gift className="w-5 h-5" />
              Grant +10m Bonus Break
            </div>
            <button onClick={closeModal} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-yellow-400/10 border border-yellow-400/30 text-xs font-inter text-yellow-200">
              💡 <span className="font-bold">Qualification Rule:</span> Agent must have actively worked at least 10 BQ leads during this shift. Free 10 minutes that does not deduct from the 60m budget or regular slots!
            </div>

            <div>
              <label className="block text-xs font-orbitron text-zinc-300 mb-1">Grant Reason / Note</label>
              <input
                type="text"
                value={bonusReason}
                onChange={e => setBonusReason(e.target.value)}
                className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={closeModal} className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-orbitron">
                Cancel
              </button>
              <button
                onClick={() => {
                  grantBonusBreak(modalData.agent.email, bonusReason);
                  closeModal();
                }}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-orbitron font-black text-xs shadow-lg"
              >
                Grant +10m Bonus 🍕
              </button>
            </div>
          </div>
        </GlassPanel>
      )}

      {/* 3. AGENT DETAIL SIDE PANEL (PART 16) */}
      {activeModal === 'agentDetail' && modalData?.agent && (
        <GlassPanel material="thick" className="w-full max-w-lg p-6 border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <img
                src={modalData.agent.avatarUrl}
                alt={modalData.agent.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-yellow-400 shadow-md"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="font-orbitron font-bold text-lg text-white">{modalData.agent.name}</div>
                <div className="text-xs text-zinc-400">{modalData.agent.email}</div>
                <div className="text-[10px] text-yellow-400 font-teko text-base mt-0.5">
                  Streak: {modalData.agent.currentStreak} Days · Streak Best: {modalData.agent.longestStreak} Days
                </div>
              </div>
            </div>
            <button onClick={closeModal} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          {/* 6 STAT CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
            <div className="p-3 rounded-2xl bg-black/60 border border-white/10">
              <div className="text-[10px] text-zinc-400 font-orbitron">TOTAL BREAK</div>
              <div className="text-xl font-teko text-yellow-400 font-bold">{modalData.agent.totalBreakTime}m / 60m</div>
            </div>
            <div className="p-3 rounded-2xl bg-black/60 border border-white/10">
              <div className="text-[10px] text-zinc-400 font-orbitron">SLOTS USED</div>
              <div className="text-xl font-teko text-cyan font-bold">{breaks.filter(b => b.agentEmail === modalData.agent.email).length} / 5</div>
            </div>
            <div className="p-3 rounded-2xl bg-black/60 border border-white/10">
              <div className="text-[10px] text-zinc-400 font-orbitron">WC TODAY</div>
              <div className="text-xl font-teko text-blue-400 font-bold">7m / 20m</div>
            </div>
            <div className="p-3 rounded-2xl bg-black/60 border border-white/10">
              <div className="text-[10px] text-zinc-400 font-orbitron">WARNINGS</div>
              <div className="text-xl font-teko text-orange-400 font-bold">{modalData.agent.totalWarnings}</div>
            </div>
            <div className="p-3 rounded-2xl bg-black/60 border border-white/10">
              <div className="text-[10px] text-zinc-400 font-orbitron">BONUS EARNED</div>
              <div className="text-xl font-teko text-gold font-bold">+{modalData.agent.totalBonusReceived * 10}m</div>
            </div>
            <div className="p-3 rounded-2xl bg-black/60 border border-white/10">
              <div className="text-[10px] text-zinc-400 font-orbitron">DISCIPLINE</div>
              <div className="text-xl font-teko text-emerald-400 font-bold">98.4% (A+)</div>
            </div>
          </div>

          {/* ACTIONS GRID */}
          <div className="space-y-2">
            <div className="text-xs font-orbitron text-zinc-400 mb-1">Administrative Actions</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  const brk = breaks.find(b => b.agentEmail === modalData.agent.email && b.isActive);
                  if (brk) endBreak(brk.breakId, currentUser?.email);
                  closeModal();
                }}
                className="p-2.5 rounded-xl bg-crimson/20 hover:bg-crimson/30 border border-crimson/40 text-crimson font-orbitron text-xs font-semibold text-center"
              >
                🛑 Force End Break
              </button>
              <button
                onClick={() => {
                  toggleBlockAgent(modalData.agent.email);
                  closeModal();
                }}
                className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-orbitron text-xs font-semibold text-center"
              >
                {modalData.agent.isBlocked ? '🟢 Unblock Agent' : '🚫 Block Punching'}
              </button>
              <button
                onClick={() => {
                  grantBonusBreak(modalData.agent.email, 'Qualified floor performance');
                  closeModal();
                }}
                className="p-2.5 rounded-xl bg-yellow-400/20 hover:bg-yellow-400/30 border border-yellow-400/40 text-yellow-300 font-orbitron text-xs font-semibold text-center"
              >
                🎁 Grant +10m Bonus
              </button>
              <button
                onClick={() => {
                  issueWarning(modalData.agent.email, 1, 'Administrative hold', 'Discipline check');
                  closeModal();
                }}
                className="p-2.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 font-orbitron text-xs font-semibold text-center"
              >
                ⚠️ Issue Warning
              </button>
            </div>
          </div>
        </GlassPanel>
      )}

      {/* 4. CAIRO WEATHER WIDGET MODAL (PART 19.O) */}
      {activeModal === 'weather' && (
        <GlassPanel material="thick" className="w-full max-w-md p-6 border border-cyan/40 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-2 text-cyan font-orbitron font-bold text-lg">
              <Sun className="w-5 h-5 text-yellow-400" />
              Cairo Night-Shift Weather Intel
            </div>
            <button onClick={closeModal} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          <div className="space-y-4 font-inter text-xs">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-black/60 border border-white/10">
              <div>
                <div className="text-[10px] font-orbitron text-zinc-400">CAIRO, EGYPT (CURRENT)</div>
                <div className="text-4xl font-teko text-yellow-400 font-bold">22°C / 72°F</div>
                <div className="text-zinc-300">Clear Night Sky · Wind 8 km/h NW</div>
              </div>
              <Cloud className="w-12 h-12 text-cyan" />
            </div>

            <div className="p-3.5 rounded-2xl bg-cyan/10 border border-cyan/30 text-cyan">
              🧥 <span className="font-bold">Shift Outfit Recommendation:</span> Air conditioning is running high on floor 3. A light hoodie or pullover is ideal between 2 AM and 5 AM. Sunrise in Cairo at 5:28 AM.
            </div>

            <button onClick={closeModal} className="w-full py-2 rounded-xl bg-zinc-800 text-zinc-300 font-orbitron text-xs">
              Dismiss
            </button>
          </div>
        </GlassPanel>
      )}

      {/* 5. SHIFT REPLAY TIME MACHINE (PART 19.H) */}
      {activeModal === 'replay' && (
        <GlassPanel material="thick" className="w-full max-w-2xl p-6 border border-yellow-400/40 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-2 text-yellow-400 font-orbitron font-bold text-lg">
              <Clock className="w-5 h-5" />
              Shift Replay (Time Machine)
            </div>
            <button onClick={closeModal} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          <div className="space-y-5 font-inter text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Simulating Shift Timeline: <span className="text-yellow-400 font-bold">02:45 AM Cairo Time</span></span>
              <div className="flex items-center gap-2">
                {[1, 2, 4].map(s => (
                  <button
                    key={s}
                    onClick={() => setReplaySpeed(s)}
                    className={`px-2 py-1 rounded text-[10px] font-orbitron font-bold ${replaySpeed === s ? 'bg-yellow-400 text-black' : 'bg-zinc-800 text-zinc-400'}`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Timeline Bar */}
            <div className="relative w-full h-8 bg-zinc-900 rounded-xl overflow-hidden border border-white/10 flex items-center px-2">
              <div
                className="h-full bg-gradient-to-r from-crimson via-yellow-400 to-cyan opacity-40 rounded-lg transition-all duration-300"
                style={{ width: `${replayProgress}%` }}
              />
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_white]"
                style={{ left: `${replayProgress}%` }}
              />
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setReplayPlaying(!replayPlaying)}
                className="px-6 py-2 rounded-xl bg-yellow-400 text-black font-orbitron font-bold text-xs flex items-center gap-2 shadow-lg"
              >
                {replayPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {replayPlaying ? 'Pause Replay' : 'Play Timeline'}
              </button>
              <button
                onClick={() => setReplayProgress(10)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-orbitron text-xs flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                Rewind
              </button>
            </div>
          </div>
        </GlassPanel>
      )}

      {/* 6. WEEKLY FLOOR LEADERBOARDS (PART 19.G) */}
      {activeModal === 'leaderboard' && (
        <GlassPanel material="thick" className="w-full max-w-lg p-6 border border-gold/40 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-2 text-gold font-orbitron font-bold text-lg">
              <Award className="w-5 h-5" />
              Floor Competition Leaderboards
            </div>
            <button onClick={closeModal} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          <div className="space-y-4">
            {/* Podium */}
            <div className="flex items-end justify-center gap-3 py-4">
              <div className="flex flex-col items-center">
                <div className="text-xs font-orbitron text-zinc-300">Zayn</div>
                <div className="w-20 h-20 bg-zinc-700/60 rounded-t-xl flex items-center justify-center font-orbitron font-bold text-silver border border-white/10">
                  #2 (1,380)
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-xs font-orbitron text-yellow-400 font-bold">Fabiola 👑</div>
                <div className="w-24 h-28 bg-yellow-400/20 rounded-t-xl flex items-center justify-center font-orbitron font-black text-yellow-400 border border-yellow-400 text-lg shadow-[0_0_20px_rgba(255,204,0,0.3)]">
                  #1 (1,420)
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-xs font-orbitron text-zinc-400">Solomon</div>
                <div className="w-20 h-16 bg-zinc-800/60 rounded-t-xl flex items-center justify-center font-orbitron font-bold text-amber-600 border border-white/10">
                  #3 (1,290)
                </div>
              </div>
            </div>

            <button onClick={closeModal} className="w-full py-2 rounded-xl bg-zinc-800 text-zinc-300 font-orbitron text-xs">
              Close
            </button>
          </div>
        </GlassPanel>
      )}

      {/* 7. BROADCAST MODAL (PART 19.K) */}
      {activeModal === 'broadcast' && (
        <GlassPanel material="thick" className="w-full max-w-md p-6 border-2 border-crimson/50 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-2 text-crimson font-orbitron font-bold text-lg">
              <Radio className="w-5 h-5" />
              Floor Shift Broadcast
            </div>
            <button onClick={closeModal} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-orbitron text-zinc-300 mb-1">Broadcast Message</label>
              <textarea
                value={broadcastText}
                onChange={e => setBroadcastText(e.target.value)}
                placeholder="Type urgent announcement to all floor agents..."
                className="w-full h-24 bg-black/80 border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-orbitron text-zinc-300 mb-1">Priority</label>
              <select
                value={broadcastPriority}
                onChange={e => setBroadcastPriority(e.target.value as any)}
                className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="normal">Normal Announcement</option>
                <option value="urgent">Urgent Floor Alert</option>
                <option value="critical">Critical Full-Screen Emergency</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={closeModal} className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-orbitron">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (broadcastText.trim()) {
                    sendBroadcast({
                      messageType: broadcastPriority === 'critical' ? 'emergency' : 'announcement',
                      message: broadcastText,
                      target: 'all',
                      sentBy: currentUser?.email || 'admin',
                      sentByName: currentUser?.name || 'Supervisor',
                      requireAcknowledgment: broadcastPriority === 'critical',
                      priority: broadcastPriority,
                    });
                    closeModal();
                  }
                }}
                className="px-6 py-2 rounded-xl bg-crimson hover:bg-red-600 text-white font-orbitron font-bold text-xs shadow-lg"
              >
                Transmit Blast 📢
              </button>
            </div>
          </div>
        </GlassPanel>
      )}

      {/* 8. PROFILE & GOAL SETTING MODAL */}
      {activeModal === 'profile' && currentUser && (
        <GlassPanel material="thick" className="w-full max-w-md p-6 border border-white/20 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-2 text-zinc-100 font-orbitron font-bold text-lg">
              <User className="w-5 h-5 text-cyan" />
              My Profile & Daily Goal
            </div>
            <button onClick={closeModal} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          <div className="space-y-4 text-xs font-inter">
            <div>
              <label className="block text-xs font-orbitron text-zinc-300 mb-1">Personal Motto</label>
              <input
                type="text"
                defaultValue={currentUser.personalMotto || ''}
                onChange={e => updateUserProfile(currentUser.email, { personalMotto: e.target.value })}
                placeholder="e.g. Close deals, take 10-min tea breaks ☕"
                className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-orbitron text-zinc-300 mb-1">Daily Shift Goal</label>
              <input
                type="text"
                defaultValue={currentUser.dailyGoal?.text || '12 Qualified BQ Calls'}
                onChange={e => setGoalText(e.target.value)}
                className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <button
              onClick={() => {
                if (goalText) {
                  updateUserProfile(currentUser.email, {
                    dailyGoal: {
                      text: goalText,
                      target: goalTarget,
                      progress: 4,
                      completed: false,
                    },
                  });
                }
                closeModal();
              }}
              className="w-full py-2.5 rounded-xl bg-yellow-400 text-black font-orbitron font-bold text-xs"
            >
              Save Profile Preferences
            </button>
          </div>
        </GlassPanel>
      )}

      {/* 9. SHIFT HANDOVER MODAL */}
      {activeModal === 'handover' && (
        <GlassPanel material="thick" className="w-full max-w-md p-6 border border-yellow-400/40 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-2 text-yellow-400 font-orbitron font-bold text-lg">
              <Award className="w-5 h-5" />
              Supervisor Shift Handover
            </div>
            <button onClick={closeModal} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          <div className="space-y-4 text-xs font-inter">
            <div>
              <label className="block text-xs font-orbitron text-zinc-300 mb-1">Category</label>
              <select
                value={handoverCategory}
                onChange={e => setHandoverCategory(e.target.value as any)}
                className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="general">General Floor Notes</option>
                <option value="warning">Warning / Discipline Summary</option>
                <option value="praise">Praise & Top Closers</option>
                <option value="alert">System or Lead Inventory Alert</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-orbitron text-zinc-300 mb-1">Handover Notes for Next Shift</label>
              <textarea
                value={handoverText}
                onChange={e => setHandoverText(e.target.value)}
                placeholder="Summary of floor capacity, active pipeline, and pending agent appeals..."
                className="w-full h-24 bg-black/80 border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={closeModal} className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-orbitron">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (handoverText.trim()) {
                    addShiftNote({
                      supervisorEmail: currentUser?.email || 'supervisor',
                      supervisorName: currentUser?.name || 'Supervisor',
                      teamId: currentUser?.teamId || 'team_strikers',
                      noteText: handoverText,
                      category: handoverCategory,
                      forShiftDate: new Date().toISOString().split('T')[0],
                      isPinned: true,
                      mentionedAgents: [],
                    });
                    closeModal();
                  }
                }}
                className="px-6 py-2 rounded-xl bg-yellow-400 text-black font-orbitron font-bold text-xs"
              >
                Submit Handover Note
              </button>
            </div>
          </div>
        </GlassPanel>
      )}

      {/* 10. CHANGE PICTURE MODAL */}
      {activeModal === 'changePicture' && modalData?.agent && (
        <GlassPanel material="thick" className="w-full max-w-md p-6 border border-purple-400/40 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-2 text-purple-400 font-orbitron font-bold text-lg">
              <Camera className="w-5 h-5" />
              Update Profile Picture
            </div>
            <button onClick={closeModal} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-orbitron text-zinc-300 mb-1">Image URL</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={newAvatarUrl}
                onChange={e => setNewAvatarUrl(e.target.value)}
                className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={closeModal} className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-orbitron">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newAvatarUrl.trim()) {
                    updateUserAvatar(modalData.agent.email, newAvatarUrl.trim());
                    closeModal();
                  }
                }}
                className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-orbitron font-bold text-xs"
              >
                Update Photo
              </button>
            </div>
          </div>
        </GlassPanel>
      )}

      {/* 11. BLOCK / UNBLOCK BREAKS MODAL */}
      {activeModal === 'blockAgent' && modalData?.agent && (
        <GlassPanel material="thick" className="w-full max-w-md p-6 border-2 border-crimson/50 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-2 text-crimson font-orbitron font-bold text-lg">
              <ShieldAlert className="w-5 h-5" />
              {modalData.agent.isBlocked ? 'Unblock Break Access' : 'Block Break Access'}
            </div>
            <button onClick={closeModal} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          <div className="space-y-4 font-inter text-xs">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-black/60 border border-white/10">
              <img
                src={modalData.agent.avatarUrl}
                alt={modalData.agent.name}
                className="w-10 h-10 rounded-full object-cover border border-white/20"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="font-orbitron font-bold text-white text-sm">{modalData.agent.name}</div>
                <div className="text-[11px] text-zinc-400">{modalData.agent.email}</div>
              </div>
            </div>

            {!modalData.agent.isBlocked ? (
              <>
                <p className="text-zinc-300">
                  Blocking this agent will prevent them from punching in or taking any breaks until unblocked by a supervisor or admin.
                </p>
                <div>
                  <label className="block text-xs font-orbitron text-zinc-300 mb-1">Reason for Block</label>
                  <select
                    value={blockReason}
                    onChange={e => setBlockReason(e.target.value)}
                    className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Floor attendance audit">Floor attendance audit</option>
                    <option value="Performance check / Meeting required">Performance check / Meeting required</option>
                    <option value="Repeated break overtime penalty">Repeated break overtime penalty</option>
                    <option value="Unauthorized break attempt">Unauthorized break attempt</option>
                    <option value="Shift management hold">Shift management hold</option>
                  </select>
                </div>
              </>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300">
                This agent is currently blocked ({modalData.agent.blockReason || 'Administrative hold'}). Unblocking will restore normal break punch capabilities immediately.
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={closeModal} className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-orbitron">
                Cancel
              </button>
              <button
                onClick={() => {
                  toggleBlockAgent(modalData.agent.email, modalData.agent.isBlocked ? undefined : blockReason);
                  closeModal();
                }}
                className={`px-6 py-2 rounded-xl font-orbitron font-bold text-xs shadow-lg ${
                  modalData.agent.isBlocked
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                    : 'bg-crimson hover:bg-red-600 text-white shadow-[0_0_15px_rgba(255,0,60,0.4)]'
                }`}
              >
                {modalData.agent.isBlocked ? 'Confirm Unblock' : 'Block Break Access'}
              </button>
            </div>
          </div>
        </GlassPanel>
      )}
    </div>
  );
};
