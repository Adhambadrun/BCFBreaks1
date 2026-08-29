import React from 'react';
import { useApp } from '../../context/AppContext';
import { GlassPanel } from '../shared/GlassPanel';
import { Zap, Shield, User, Award } from 'lucide-react';
import { playSound } from '../../lib/sound';

export const LoginCard: React.FC = () => {
  const { loginAs, users } = useApp();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <GlassPanel
        material="thick"
        concentricRadius="xl"
        className="w-full max-w-md p-8 border border-white/20 shadow-[0_0_80px_rgba(0,0,0,0.8)] text-center space-y-6"
      >
        {/* Animated Brand Header */}
        <div>
          <div className="w-18 h-18 mx-auto rounded-full overflow-hidden border-2 border-crimson shadow-[0_0_25px_rgba(255,0,60,0.5)] mb-3">
            <img
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80"
              alt="STRIKERS"
              className="w-full h-full object-cover animate-pulse"
              referrerPolicy="no-referrer"
            />
          </div>

          <h1 className="font-orbitron font-black text-4xl text-transparent bg-clip-text bg-gradient-to-r from-crimson via-orange-400 to-yellow-400 tracking-wider">
            BREAK
          </h1>

          <p className="text-xs text-zinc-400 font-inter mt-1.5">
            Sign in with your work Google account to continue.
          </p>
        </div>

        {/* Real Google Identity Services target */}
        <div className="flex flex-col items-center justify-center gap-3">
          <div id="google-signin-button" className="min-h-[44px] flex justify-center" />

          {/* Quick Sign-In Persona Presets for Immediate Demo Access */}
          <div className="w-full pt-4 border-t border-white/10 space-y-2 text-left">
            <div className="text-[10px] font-orbitron text-zinc-400 uppercase tracking-wider text-center">
              Quick Role Authentication (Instant Demo)
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => loginAs('adhambadraan@gmail.com')}
                className="flex items-center justify-between p-2.5 rounded-xl bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <div>
                    <div className="text-xs font-orbitron font-bold">Adham Badran (Developer)</div>
                    <div className="text-[10px] text-zinc-400">adhambadraan@gmail.com · Tier 1 God Mode ⚡</div>
                  </div>
                </div>
                <span className="text-[10px] font-orbitron text-yellow-400 uppercase font-bold">Sign In →</span>
              </button>

              <button
                onClick={() => loginAs('karim.admin@strikers.com')}
                className="flex items-center justify-between p-2.5 rounded-xl bg-crimson/10 hover:bg-crimson/20 border border-crimson/40 text-red-300 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-crimson" />
                  <div>
                    <div className="text-xs font-orbitron font-bold">Karim Mansour (Admin)</div>
                    <div className="text-[10px] text-zinc-400">karim.admin@strikers.com · Tier 2 System</div>
                  </div>
                </div>
                <span className="text-[10px] font-orbitron text-red-400 uppercase font-bold">Sign In →</span>
              </button>

              <button
                onClick={() => loginAs('tarek.zaki@strikers.com')}
                className="flex items-center justify-between p-2.5 rounded-xl bg-cyan/10 hover:bg-cyan/20 border border-cyan/40 text-cyan transition-all"
              >
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-cyan" />
                  <div>
                    <div className="text-xs font-orbitron font-bold">Tarek Zaki (Supervisor)</div>
                    <div className="text-[10px] text-zinc-400">tarek.zaki@strikers.com · Tier 3 STRIKERS</div>
                  </div>
                </div>
                <span className="text-[10px] font-orbitron text-cyan uppercase font-bold">Sign In →</span>
              </button>

              <button
                onClick={() => loginAs('solomon@bcflights.com')}
                className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 transition-all"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-xs font-orbitron font-bold">Solomon Kane (Agent)</div>
                    <div className="text-[10px] text-zinc-400">solomon@bcflights.com · Tier 4 Sales Floor</div>
                  </div>
                </div>
                <span className="text-[10px] font-orbitron text-emerald-400 uppercase font-bold">Sign In →</span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-zinc-500 font-inter">
          Official Google Identity Services integration. Shift operating hours 10 PM – 6 AM Cairo Time.
        </p>
      </GlassPanel>
    </div>
  );
};
