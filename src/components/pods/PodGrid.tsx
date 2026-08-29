import React from 'react';
import { useApp } from '../../context/AppContext';
import { AgentPod } from './AgentPod';
import { motion, AnimatePresence } from 'motion/react';
import { GLIDE, SNAP } from '../../styles/motion-presets';
import { Clock, Coffee, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';

export const PodGrid: React.FC = () => {
  const {
    users,
    activeTeamId,
    currentUser,
    breaks,
    shiftConfig,
    endBreak,
  } = useApp();

  // Filter agents for current active team
  const teamAgents = users.filter(
    u => u.teamId === activeTeamId && u.role === 'agent'
  );

  const canManageTeam =
    currentUser?.role === 'developer' ||
    currentUser?.role === 'admin' ||
    (currentUser?.role === 'supervisor' && currentUser?.teamId === activeTeamId);

  // Active breaks in this team
  const activeTeamBreaks = breaks.filter(
    b => b.isActive && (b.teamId === activeTeamId || teamAgents.some(a => a.email === b.agentEmail))
  );

  // Helper format MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      {/* Active Breaks Live Quick-Monitor Shelf (if any breaks are active) */}
      <AnimatePresence>
        {activeTeamBreaks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={SNAP}
            className="mb-6 p-3.5 rounded-2xl bg-zinc-950/80 border border-cyan/30 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,229,255,0.1)] flex flex-wrap items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan animate-ping" />
              <span className="font-orbitron font-bold text-xs uppercase tracking-wider text-cyan flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Active Breaks in Pod ({activeTeamBreaks.length})
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {activeTeamBreaks.map(brk => {
                const agent = users.find(u => u.email === brk.agentEmail);
                const totalSlotSeconds = brk.breakType === 'bonus'
                  ? 600
                  : brk.breakType === 'wc'
                  ? 1200
                  : (shiftConfig.maxSlotDuration || 15) * 60;
                
                const remainingSecs = Math.max(0, totalSlotSeconds - brk.duration);
                const remainingRatio = Math.max(0, Math.min(1, remainingSecs / totalSlotSeconds));
                const remainingPercent = Math.round(remainingRatio * 100);
                const isOvertime = brk.duration > totalSlotSeconds;

                // Circular mini ring math (r=14 in 36x36 viewBox, circ = 2*PI*14 ≈ 87.96)
                const miniCirc = 87.96;
                const miniOffset = miniCirc * (1 - remainingRatio);

                const ringColor = isOvertime
                  ? '#FF003C'
                  : remainingRatio > 0.6
                  ? '#00FF88'
                  : remainingRatio > 0.3
                  ? '#FFD700'
                  : remainingRatio > 0.15
                  ? '#FF8800'
                  : '#FF003C';

                const isSelf = currentUser?.email === brk.agentEmail;
                const canEnd = isSelf || canManageTeam;
                const isNearLimit = isOvertime || remainingSecs <= 120;

                return (
                  <div
                    key={brk.breakId}
                    className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border backdrop-blur-md transition-all ${
                      isOvertime
                        ? 'bg-crimson/20 border-crimson/60 shadow-[0_0_12px_rgba(255,0,60,0.3)] animate-pulse'
                        : isNearLimit
                        ? 'bg-amber-950/40 border-amber-500/60 shadow-[0_0_12px_rgba(255,136,0,0.35)] animate-pulse'
                        : 'bg-zinc-900/90 border-white/10 hover:border-cyan/40'
                    }`}
                  >
                    {/* Mini Circular Progress Ring Visual */}
                    <div className="relative w-8 h-8 flex items-center justify-center">
                      <svg viewBox="0 0 36 36" className="w-8 h-8 -rotate-90">
                        <defs>
                          <linearGradient id={`miniGrad-${brk.breakId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#00FF88" />
                            <stop offset="35%" stopColor="#84CC16" />
                            <stop offset="65%" stopColor="#EAB308" />
                            <stop offset="85%" stopColor="#F97316" />
                            <stop offset="100%" stopColor="#FF003C" />
                          </linearGradient>
                        </defs>
                        {/* Background track */}
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="3"
                          fill="transparent"
                        />
                        {/* Depleting ring */}
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          stroke={`url(#miniGrad-${brk.breakId})`}
                          strokeWidth="3"
                          strokeDasharray={miniCirc}
                          strokeDashoffset={miniOffset}
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-1000 ease-linear"
                        />
                      </svg>
                      {/* Avatar initial or icon in center */}
                      <span className="absolute text-[9px] font-orbitron font-bold text-zinc-200">
                        {isOvertime ? '!' : `${remainingPercent}%`}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <span className="font-orbitron font-bold text-xs text-zinc-100">
                          {agent?.name.split(' ')[0] || brk.agentName}
                        </span>
                        <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-mono">
                          {brk.breakType}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 font-mono text-[10px]" style={{ color: ringColor }}>
                        <span>
                          {isOvertime ? `+${formatTimer(brk.duration - totalSlotSeconds)} OVERTIME` : `${formatTimer(remainingSecs)} remaining`}
                        </span>
                      </div>
                    </div>

                    {canEnd && (
                      <button
                        onClick={() => endBreak(brk.breakId, isSelf ? undefined : currentUser?.email)}
                        className="ml-1 px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-crimson/80 text-zinc-200 hover:text-white text-[10px] font-orbitron transition-colors border border-white/10"
                        title={isSelf ? 'Return from Break' : 'Force End Break'}
                      >
                        {isSelf ? 'Return' : 'End'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Team Pod Grid with responsive 2 / 3-4 / 5 columns */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={GLIDE}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-6 gap-x-3 place-items-center items-start w-full"
      >
        {teamAgents.map((agent) => {
          const activeBreak = breaks.find(
            b => b.agentEmail === agent.email && b.isActive
          );
          const todayBreaks = breaks.filter(
            b => b.agentEmail === agent.email && b.date === new Date().toISOString().split('T')[0]
          );
          const totalBreakMinutes = todayBreaks.reduce(
            (acc, b) => acc + Math.round(b.duration / 60),
            0
          );
          const isOwnPod = currentUser?.email === agent.email;

          return (
            <AgentPod
              key={agent.id}
              agent={agent}
              activeBreak={activeBreak}
              usedSlotsCount={todayBreaks.length}
              totalBreakMinutes={totalBreakMinutes}
              isOwnPod={isOwnPod}
              canManage={canManageTeam}
            />
          );
        })}
      </motion.div>
    </div>
  );
};
