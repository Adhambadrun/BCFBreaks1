import React, { useState } from 'react';
import { User, BreakRecord } from '../../types';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { SNAP, GLIDE, AMBIENT_LOOP, COIN_FLIP_TRANSITION } from '../../styles/motion-presets';
import { Coffee, UtensilsCrossed, Phone, Gift, ShieldAlert, XCircle, AlertTriangle, Eye, Camera, UserX, CheckCircle, Flame } from 'lucide-react';
import { playSound } from '../../lib/sound';

interface AgentPodProps {
  agent: User;
  activeBreak?: BreakRecord;
  usedSlotsCount: number;
  totalBreakMinutes: number;
  isOwnPod: boolean;
  canManage: boolean;
}

export const AgentPod: React.FC<AgentPodProps> = ({
  agent,
  activeBreak,
  usedSlotsCount,
  totalBreakMinutes,
  isOwnPod,
  canManage,
}) => {
  const {
    currentUser,
    startBreak,
    endBreak,
    openModal,
    wcTracking,
    warnings,
    shiftConfig,
  } = useApp();

  const [isHovered, setIsHovered] = useState(false);
  const [showConfirmBreakType, setShowConfirmBreakType] = useState<string | null>(null);

  const isOnBreak = !!activeBreak?.isActive;
  const isAgentRole = currentUser?.role === 'agent';
  const isSelf = currentUser?.email === agent.email;

  // Active warning on this agent
  const agentWarning = warnings.find(w => w.agentEmail === agent.email && w.status === 'active');
  const agentWc = wcTracking[agent.email]?.totalWCTime || 0;

  // 1. Daily cumulative 60m budget ring math
  const maxBudget = agentWarning ? agentWarning.penalties.maxBreakTime : 60;
  const progressPercent = Math.min(100, Math.round((totalBreakMinutes / maxBudget) * 100));
  const strokeDashoffset = 440 - (440 * progressPercent) / 100;

  // 2. Active Break Slot Depletion Math (Depletes from Green -> Yellow -> Orange -> Crimson)
  const totalSlotSeconds = activeBreak?.breakType === 'bonus'
    ? 600
    : activeBreak?.breakType === 'wc'
    ? 1200
    : (shiftConfig.maxSlotDuration || 15) * 60;

  const breakDuration = activeBreak?.duration || 0;
  const remainingSeconds = Math.max(0, totalSlotSeconds - breakDuration);
  const remainingRatio = Math.max(0, Math.min(1, remainingSeconds / totalSlotSeconds));
  const remainingPercent = Math.round(remainingRatio * 100);
  const isOvertime = breakDuration > totalSlotSeconds;

  // Circumference for r=76 in 180x180 viewBox: 2 * Math.PI * 76 = 477.52
  const activeCircumference = 477.52;
  const activeStrokeDashoffset = activeCircumference * (1 - remainingRatio);

  // Dynamic status color based on remaining break time
  const getDynamicGradientColor = (ratio: number, overtime: boolean) => {
    if (overtime) return '#FF003C';
    if (ratio > 0.6) return '#00FF88'; // Plenty of time remaining (green)
    if (ratio > 0.3) return '#FFD700'; // Moderate time (yellow/gold)
    if (ratio > 0.15) return '#FF8800'; // Low time (orange)
    return '#FF003C'; // Urgent / near end (crimson)
  };

  const currentDepletionColor = getDynamicGradientColor(remainingRatio, isOvertime);

  // Timer format MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (seconds: number) => {
    if (seconds < 600) return 'text-emerald-400'; // 0-10m
    if (seconds < 780) return 'text-yellow-400'; // 10-13m
    if (seconds < 900) return 'text-orange-400'; // 13-15m
    return 'text-crimson animate-pulse'; // 15m+
  };

  const handleStartBreakConfirm = (type: any) => {
    const res = startBreak(agent.email, type);
    setShowConfirmBreakType(null);
    setIsHovered(false);
  };

  const handleEndBreak = () => {
    if (activeBreak) {
      endBreak(activeBreak.breakId, isSelf ? undefined : currentUser?.email);
    }
  };

  // Radial menu buttons for agent (5 positions: 12, 2, 5, 7, 10 o'clock)
  const agentRadialButtons = [
    { type: 'regular', label: 'Regular', icon: Coffee, color: 'text-cyan', angle: -90, disabled: false },
    { type: 'wc', label: 'WC', icon: () => <span className="font-bold text-sm">🚻</span>, color: 'text-blue-400', angle: -18, disabled: agentWc >= 1200 },
    { type: 'meal', label: 'Meal', icon: UtensilsCrossed, color: 'text-orange-400', angle: 54, disabled: false },
    { type: 'personal', label: 'Call', icon: Phone, color: 'text-purple-400', angle: 126, disabled: false },
    { type: 'bonus', label: 'Bonus', icon: Gift, color: 'text-gold', angle: 198, disabled: agent.totalBonusReceived <= 0 },
  ];

  // Admin radial menu buttons for supervisors/admins (8 positions)
  const adminRadialButtons = [
    { action: 'force_end', label: 'Force End', icon: XCircle, color: 'text-crimson', angle: -90, show: isOnBreak },
    { action: 'warning', label: 'Warn', icon: AlertTriangle, color: 'text-yellow-400', angle: -45, show: true },
    { action: 'bonus', label: 'Bonus', icon: Gift, color: 'text-gold', angle: 0, show: true },
    { action: 'report', label: 'Report', icon: Eye, color: 'text-cyan', angle: 45, show: true },
    { action: 'picture', label: 'Picture', icon: Camera, color: 'text-purple-400', angle: 90, show: true },
    { action: 'block', label: agent.isBlocked ? 'Unblock' : 'Block', icon: ShieldAlert, color: agent.isBlocked ? 'text-emerald-400' : 'text-crimson', angle: 135, show: true },
    { action: 'remove', label: 'Hold', icon: UserX, color: 'text-zinc-400', angle: 180, show: true },
  ];

  return (
    <div
      className="relative flex flex-col items-center justify-center m-2 md:m-4 select-none group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowConfirmBreakType(null);
      }}
    >
      {/* OUTER CIRCULAR POD CONTAINER (180px desktop, 140px tablet) */}
      <div className="relative w-[150px] h-[150px] sm:w-[170px] sm:h-[170px] lg:w-[180px] lg:h-[180px] rounded-full flex items-center justify-center">
        
        {/* Layer 1: Background Glass Disc */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-b from-zinc-900/90 to-black border transition-all duration-300 ${
            isOnBreak
              ? isOvertime
                ? 'border-crimson shadow-[0_0_35px_rgba(255,0,60,0.6)] animate-pulse'
                : 'border-cyan/40 shadow-[0_0_30px_rgba(0,229,255,0.25)]'
              : agent.isBlocked
              ? 'border-crimson/50 shadow-[0_0_30px_rgba(255,0,60,0.3)]'
              : agentWarning
              ? 'border-yellow-400/50 shadow-[0_0_25px_rgba(255,204,0,0.25)]'
              : 'border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.6)]'
          }`}
        />

        {/* Layer 2: SVG Progress Ring (Active Break Depletion vs Cumulative Budget) */}
        <svg viewBox="0 0 180 180" className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
          <defs>
            {/* Green to Crimson Linear Gradient for Active Break Depletion */}
            <linearGradient id={`breakGradient-${agent.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00FF88" />
              <stop offset="25%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#EAB308" />
              <stop offset="75%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#FF003C" />
            </linearGradient>

            {/* Glowing filter for high-visibility telemetry */}
            <filter id={`breakGlow-${agent.id}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="3.5"
                floodColor={currentDepletionColor}
                floodOpacity="0.8"
              />
            </filter>
          </defs>

          {/* Background Track Circle */}
          <circle
            cx="90"
            cy="90"
            r="76"
            className={isOnBreak ? 'stroke-zinc-800/80' : 'stroke-zinc-800/60'}
            strokeWidth={isOnBreak ? '7' : '6'}
            fill="transparent"
          />

          {/* ACTIVE BREAK RING: Circular progress ring that visually depletes as remaining break time decreases */}
          {isOnBreak ? (
            <circle
              cx="90"
              cy="90"
              r="76"
              stroke={`url(#breakGradient-${agent.id})`}
              strokeWidth="7"
              strokeDasharray={activeCircumference}
              strokeDashoffset={activeStrokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              filter={`url(#breakGlow-${agent.id})`}
              className="transition-all duration-1000 ease-linear"
            />
          ) : (
            /* Cumulative Daily 60m Budget Ring (for idle agents, visible per privacy matrix) */
            (!isAgentRole || isSelf) && (
              <circle
                cx="90"
                cy="90"
                r="70"
                stroke={
                  progressPercent < 50
                    ? '#00FF88'
                    : progressPercent < 80
                    ? '#FFD700'
                    : progressPercent < 95
                    ? '#FF8800'
                    : '#FF003C'
                }
                strokeWidth="5"
                strokeDasharray="440"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            )
          )}
        </svg>

        {/* Layer 4: Center Core (Avatar OR 3D Coin-flip Digital Timer) */}
        <div
          className="relative w-[110px] h-[110px] sm:w-[124px] sm:h-[124px] lg:w-[130px] lg:h-[130px] rounded-full overflow-hidden flex items-center justify-center cursor-pointer transition-transform group-hover:scale-102"
          onClick={() => {
            if (isOnBreak && (isSelf || canManage)) {
              handleEndBreak();
            } else if (canManage) {
              openModal('agentDetail', { agent });
            }
          }}
        >
          <AnimatePresence mode="wait">
            {isOnBreak ? (
              // Active Break Timer View (Only show duration to self or supervisor/admin per Privacy Matrix)
              <motion.div
                key="timer"
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={COIN_FLIP_TRANSITION}
                className={`w-full h-full bg-black/90 flex flex-col items-center justify-center p-2 rounded-full border ${
                  isOvertime ? 'border-crimson shadow-[inset_0_0_15px_rgba(255,0,60,0.5)]' : 'border-cyan/40'
                }`}
              >
                <div className="text-[10px] font-orbitron uppercase font-semibold flex items-center gap-1" style={{ color: currentDepletionColor }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: currentDepletionColor }} />
                  {activeBreak.breakType.toUpperCase()}
                </div>
                
                {/* Duration Privacy Guard: Teammates cannot see exact elapsed seconds */}
                {isAgentRole && !isSelf ? (
                  <div className="font-orbitron font-bold text-sm text-cyan mt-1">
                    ON BREAK
                  </div>
                ) : (
                  <>
                    <div className={`font-orbitron font-extrabold text-xl sm:text-2xl leading-none my-0.5 ${getTimerColor(activeBreak.duration)}`}>
                      {formatTimer(isOvertime ? activeBreak.duration : remainingSeconds)}
                    </div>
                    <div className="text-[9px] font-orbitron font-semibold tracking-tight" style={{ color: currentDepletionColor }}>
                      {isOvertime ? 'OVERTIME' : `${remainingPercent}% REMAINING`}
                    </div>
                  </>
                )}

                <div className="text-[8px] font-inter text-zinc-400 mt-0.5">
                  {isSelf || canManage ? 'Click to Return' : 'Occupied'}
                </div>
              </motion.div>
            ) : (
              // Idle Avatar View
              <motion.div
                key="avatar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative w-full h-full"
              >
                <img
                  src={agent.avatarUrl}
                  alt={agent.name}
                  className={`w-full h-full object-cover rounded-full filter ${
                    agent.isBlocked ? 'grayscale brightness-75' : ''
                  }`}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Online Status Dot */}
                <div className="absolute bottom-1 right-1/2 translate-x-1/2 flex items-center gap-1 bg-black/80 px-2 py-0.5 rounded-full border border-white/10">
                  <span className={`w-2 h-2 rounded-full ${agent.isBlocked ? 'bg-crimson' : 'bg-emerald-400 animate-pulse'}`} />
                  <span className="text-[9px] font-orbitron text-zinc-300">
                    {agent.isBlocked ? 'BLOCKED' : 'READY'}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Layer 5: Inner Bottom Arc 5 Slot Dots */}
        {(!isAgentRole || isSelf) && (
          <div className="absolute bottom-1.5 flex items-center gap-1.5 z-20">
            {[1, 2, 3, 4, 5].map(slot => {
              const isUsed = slot <= usedSlotsCount;
              const isActiveSlot = isOnBreak && slot === usedSlotsCount + 1;
              return (
                <div
                  key={slot}
                  className={`w-2 h-2 rounded-full transition-all ${
                    isActiveSlot
                      ? 'bg-cyan shadow-[0_0_8px_#00E5FF] animate-ping'
                      : isUsed
                      ? 'bg-yellow-400 shadow-[0_0_6px_#FFCC00]'
                      : 'border border-white/20 bg-black/40'
                  }`}
                />
              );
            })}
          </div>
        )}

        {/* Layer 7: Orbiting Badges */}
        {/* YOU Badge */}
        {isSelf && (
          <div className="absolute -top-1 -left-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-orbitron font-extrabold text-[9px] px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(255,204,0,0.6)] z-20 animate-bounce">
            YOU
          </div>
        )}

        {/* Warning Badge (if active warning) */}
        {agentWarning && (
          <div
            title={`Warning Level ${agentWarning.level}: ${agentWarning.reason}`}
            className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-black z-20 shadow-lg ${
              agentWarning.level === 1
                ? 'bg-yellow-400 text-black'
                : agentWarning.level === 2
                ? 'bg-orange-500 text-white'
                : 'bg-crimson text-white animate-pulse'
            }`}
          >
            {agentWarning.level === 1 ? '⚠️' : agentWarning.level === 2 ? '🔶' : '🟥'}
          </div>
        )}

        {/* Bonus Badge (if agent has bonus balance) */}
        {agent.totalBonusReceived > 0 && !agentWarning && (
          <div
            title={`+10m Bonus Break Available (${agent.totalBonusReceived})`}
            className="absolute -bottom-1 -right-1 bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-orbitron font-bold text-[9px] px-1.5 py-0.5 rounded-full shadow-[0_0_8px_rgba(0,255,136,0.5)] z-20"
          >
            🎁 +10m
          </div>
        )}

        {/* Birthday Badge */}
        {agent.birthday === '08-28' && (
          <div
            title="Birthday Shift! 🎂 Soft confetti active"
            className="absolute top-1/2 -right-3 text-lg z-20 animate-spin"
            style={{ animationDuration: '6s' }}
          >
            🎂
          </div>
        )}

        {/* HOVER RADIAL MENU: AGENT ON OWN POD */}
        <AnimatePresence>
          {isHovered && isSelf && !isOnBreak && !agent.isBlocked && !showConfirmBreakType && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={SNAP}
              className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center"
            >
              {agentRadialButtons.map((btn, idx) => {
                // Radial math (100px orbital radius from center)
                const radius = 86;
                const rad = (btn.angle * Math.PI) / 180;
                const x = radius * Math.cos(rad);
                const y = radius * Math.sin(rad);

                const IconComponent = btn.icon;

                return (
                  <motion.button
                    key={btn.type}
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{ scale: 1, x, y }}
                    exit={{ scale: 0, x: 0, y: 0 }}
                    transition={{ ...SNAP, delay: idx * 0.04 }}
                    disabled={btn.disabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!btn.disabled) {
                        playSound('click');
                        setShowConfirmBreakType(btn.type);
                      }
                    }}
                    title={btn.label}
                    className={`absolute pointer-events-auto w-10 h-10 rounded-full flex items-center justify-center shadow-xl border backdrop-blur-xl transition-transform hover:scale-115 ${
                      btn.disabled
                        ? 'bg-zinc-900/90 border-zinc-700 opacity-40 cursor-not-allowed text-zinc-500'
                        : 'bg-zinc-950/90 border-white/20 hover:border-yellow-400 ' + btn.color
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* HOVER RADIAL MENU: SUPERVISOR / ADMIN ON MANAGED POD */}
        <AnimatePresence>
          {isHovered && canManage && !isSelf && !showConfirmBreakType && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={SNAP}
              className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center"
            >
              {adminRadialButtons.filter(b => b.show).map((btn, idx) => {
                const radius = 90;
                const rad = (btn.angle * Math.PI) / 180;
                const x = radius * Math.cos(rad);
                const y = radius * Math.sin(rad);

                const IconComponent = btn.icon;

                return (
                  <motion.button
                    key={btn.action}
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{ scale: 1, x, y }}
                    exit={{ scale: 0, x: 0, y: 0 }}
                    transition={{ ...SNAP, delay: idx * 0.04 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      playSound('click');
                      if (btn.action === 'force_end') {
                        handleEndBreak();
                      } else if (btn.action === 'warning') {
                        openModal('warning', { agent });
                      } else if (btn.action === 'bonus') {
                        openModal('bonus', { agent });
                      } else if (btn.action === 'report') {
                        openModal('agentReport', { agent });
                      } else if (btn.action === 'picture') {
                        openModal('changePicture', { agent });
                      } else if (btn.action === 'block') {
                        openModal('blockAgent', { agent });
                      } else if (btn.action === 'remove') {
                        openModal('removeAgent', { agent });
                      }
                    }}
                    title={btn.label}
                    className={`absolute pointer-events-auto w-9 h-9 rounded-full flex items-center justify-center shadow-2xl border backdrop-blur-xl transition-transform hover:scale-115 bg-zinc-950/95 border-white/20 hover:border-yellow-400 ${btn.color}`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* BREAK CONFIRMATION OVERLAY MODAL (Inside Pod Core) */}
        <AnimatePresence>
          {showConfirmBreakType && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={GLIDE}
              className="absolute inset-0 z-40 bg-black/95 rounded-full flex flex-col items-center justify-center p-3 text-center border-2 border-yellow-400 shadow-2xl"
            >
              <div className="text-[10px] font-orbitron text-zinc-300 uppercase tracking-wider">
                Start {showConfirmBreakType}?
              </div>
              <div className="text-[9px] text-zinc-400 mb-2">
                {showConfirmBreakType === 'bonus' ? 'Free 10m' : showConfirmBreakType === 'wc' ? '20m daily' : '15m slot max'}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStartBreakConfirm(showConfirmBreakType)}
                  className="px-2.5 py-1 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-orbitron font-bold shadow-md transition-transform hover:scale-105"
                >
                  PUNCH
                </button>
                <button
                  onClick={() => setShowConfirmBreakType(null)}
                  className="px-2 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-orbitron"
                >
                  CANCEL
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* POD LABEL (Below Pod) */}
      <div className="mt-2 text-center max-w-[160px]">
        <div className="font-orbitron font-bold text-xs sm:text-sm text-zinc-100 uppercase tracking-wide truncate flex items-center justify-center gap-1">
          <span>{agent.name.split(' ')[0]}</span>
          {agent.powerEmoji && <span className="text-xs">{agent.powerEmoji}</span>}
        </div>

        {/* Time Budget Label (Privacy-Aware) */}
        {(!isAgentRole || isSelf) && (
          <div className="font-teko text-base sm:text-lg text-yellow-400 leading-none">
            {totalBreakMinutes}m / {maxBudget}m
          </div>
        )}

        {/* Personal Motto (Displayed on hover) */}
        {agent.personalMotto && isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] italic text-zinc-400 truncate mt-0.5"
          >
            "{agent.personalMotto}"
          </motion.div>
        )}
      </div>
    </div>
  );
};
