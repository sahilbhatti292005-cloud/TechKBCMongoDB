import React, { useState, useEffect, useRef } from 'react';
import { GameState } from '../types';
import { UserCheck, Trash2, AlertTriangle, Bell } from 'lucide-react';
import { db, getServerTime } from '../lib/firebase';
import { ref, update, remove } from 'firebase/database';

interface AdminMobileProps {
  gameState: GameState | null;
}

const AdminMobile: React.FC<AdminMobileProps> = ({ gameState }) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const lockAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio('/soundeffect/lockoption.mp3');
    lockAudioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  const playLockSound = () => {
    const audio = lockAudioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.play().catch(err => console.warn("Lock audio play failed:", err));
    }
  };

  const stopLockSound = () => {
    const audio = lockAudioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  };

  const sendAction = async (action: string, payload: any = {}) => {
    if (!gameState) return;
    const gameRef = ref(db, 'gameState');

    // Interrupt lock sound for any action other than LOCK_OPTION
    if (action !== 'LOCK_OPTION') {
      stopLockSound();
    }

    switch (action) {
      case 'LOCK_OPTION': {
        if (!gameState) return;
        const isCurrentlyLocked = gameState.lockedOption === payload.optionIndex;
        
        playLockSound();
        
        if (isCurrentlyLocked) {
          // Unlock and resume timer
          await update(gameRef, { 
            lockedOption: null,
            lockTrigger: getServerTime(),
            'timer/isRunning': true,
            'timer/isPaused': false,
            'timer/startTime': getServerTime(),
            'timer/endTime': getServerTime() + (gameState.timer.remainingTime || 0)
          });
        } else {
          // Lock and pause timer
          const remaining = gameState.timer.isRunning 
            ? Math.max(0, (gameState.timer.endTime || 0) - getServerTime()) 
            : gameState.timer.remainingTime;
            
          await update(gameRef, { 
            lockedOption: payload.optionIndex,
            lockTrigger: getServerTime(),
            'timer/isRunning': false,
            'timer/isPaused': true,
            'timer/remainingTime': remaining
          });
        }
        break;
      }
      case 'BELL_SMALL':
        await update(gameRef, { bellSmallTrigger: getServerTime() });
        break;
      case 'BELL_LARGE':
        await update(gameRef, { bellLargeTrigger: getServerTime() });
        break;
      case 'UPDATE_SCORE':
        const team = gameState.teams.find(t => t.id === payload.teamId);
        if (team) {
          const updates: any = {};
          if (payload.type === 'hotSeat') updates.hotSeatPoints = (team.hotSeatPoints || 0) + payload.amount;
          if (payload.type === 'bonus') updates.bonusPoints = (team.bonusPoints || 0) + payload.amount;
          await update(ref(db, `gameState/teams/${payload.teamId}`), updates);
        }
        break;
      case 'DELETE_TEAM':
        const tid = payload.teamId;
        if (!tid) return;
        await remove(ref(db, `gameState/teams/${tid}`));
        if (gameState.fffSubmissions && gameState.fffSubmissions[tid]) {
          await remove(ref(db, `gameState/fffSubmissions/${tid}`));
        }
        if (gameState.hotSeatTeamId === tid) {
          await update(gameRef, { hotSeatTeamId: null });
        }
        setSelectedTeamId(null);
        setShowDeleteConfirm(false);
        break;
    }
  };

  const updateScore = (amount: number, type: 'hotSeat' | 'bonus' = 'hotSeat') => {
    if (!selectedTeamId) return;
    sendAction('UPDATE_SCORE', { teamId: selectedTeamId, amount, type });
  };

  if (!gameState) return (
    <div className="p-8 text-center space-y-4 text-white">
      <div className="text-blue-400 animate-pulse font-bold text-xl uppercase tracking-widest">Cognos Tech KBC</div>
      <div className="text-blue-400 animate-pulse font-bold">Connecting to Firebase...</div>
      <p className="text-xs text-gray-500">If this persists, the Admin may need to initialize the game.</p>
    </div>
  );

  const selectedTeam = gameState.teams.find(t => t.id === selectedTeamId);

  return (
    <div className="p-4 bg-[#0a0a2a] min-h-screen text-white space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Score Control</h1>
        <div className="flex items-center space-x-3">
          <div className="flex bg-[#1a1a4a] rounded-lg p-1 border border-white/10">
            <button 
              onClick={() => sendAction('BELL_SMALL')}
              className="p-2 text-red-500 active:bg-red-500/20 rounded-md transition-all"
            >
              <Bell className="w-5 h-5" />
            </button>
            <button 
              onClick={() => sendAction('BELL_LARGE')}
              className="p-2 text-green-500 active:bg-green-500/20 rounded-md transition-all"
            >
              <Bell className="w-6 h-6" />
            </button>
          </div>
          <div className="text-xs font-mono text-blue-400 uppercase tracking-widest">Cycle {gameState.cycle}</div>
        </div>
      </header>

      {/* Team Selection */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select Team</label>
          {gameState.hotSeatTeamId && (
            <button 
              onClick={() => setSelectedTeamId(gameState.hotSeatTeamId)}
              className="text-[10px] bg-blue-600/20 text-blue-400 px-2 py-1 rounded border border-blue-500/50 font-bold"
            >
              SELECT HOT SEAT
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(gameState.teams || []).map(team => (
            <button 
              key={team.id}
              onClick={() => setSelectedTeamId(team.id)}
              className={`p-3 rounded-xl border text-sm font-bold transition-all ${selectedTeamId === team.id ? 'bg-blue-600 border-blue-400' : 'bg-[#1a1a4a] border-white/10 text-gray-400'}`}
            >
              {team.name}
            </button>
          ))}
        </div>
      </div>

      {selectedTeam && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-[#1a1a4a] p-6 rounded-2xl border border-white/10 text-center">
            <div className="text-xs text-gray-400 uppercase mb-1">Current Score for {selectedTeam.name}</div>
            <div className="text-5xl font-mono font-black text-yellow-500">
              {40 + ((selectedTeam.hotSeatPoints as number) || 0) + ((selectedTeam.bonusPoints as number) || 0)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ScoreButton label="+30" onClick={() => updateScore(30)} variant="success" />
            <ScoreButton label="-30" onClick={() => updateScore(-30)} variant="danger" />
            <ScoreButton label="+50" onClick={() => updateScore(50)} variant="success" />
            <ScoreButton label="-50" onClick={() => updateScore(-50)} variant="danger" />
            <ScoreButton label="+100" onClick={() => updateScore(100)} variant="success" />
            <ScoreButton label="-100" onClick={() => updateScore(-100)} variant="danger" />
            <ScoreButton label="+20 Bonus" onClick={() => updateScore(20, 'bonus')} variant="bonus" />
            <ScoreButton label="-20 Bonus" onClick={() => updateScore(-20, 'bonus')} variant="bonus" />
            <ScoreButton label="-5 Crowd" onClick={() => updateScore(-5)} variant="danger" />
            <ScoreButton label="+5 Recovery" onClick={() => updateScore(5)} variant="success" />
            <ScoreButton label="-10 Call" onClick={() => updateScore(-10)} variant="danger" />
            <ScoreButton label="+10 Recovery" onClick={() => updateScore(10)} variant="success" />
            <ScoreButton label="-20 Debug" onClick={() => updateScore(-20)} variant="danger" />
            <ScoreButton label="+20 Recovery" onClick={() => updateScore(20)} variant="success" />
          </div>

          <div className="pt-6 border-t border-white/10">
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full p-4 rounded-xl bg-red-600/10 border border-red-500/50 text-red-500 font-bold flex items-center justify-center space-x-2 active:bg-red-600/20 transition-all"
            >
              <Trash2 className="w-5 h-5" />
              <span>DELETE TEAM PERMANENTLY</span>
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1a1a4a] w-full max-w-sm rounded-3xl border border-red-500/30 p-8 space-y-6 shadow-2xl shadow-red-500/10">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Delete Team?</h3>
                <p className="text-gray-400 text-sm">
                  Are you sure you want to delete <span className="text-white font-bold">"{selectedTeam.name}"</span> permanently? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <button 
                onClick={() => sendAction('DELETE_TEAM', { teamId: selectedTeam.id })}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold shadow-lg shadow-red-600/20 transition-all"
              >
                Yes, Delete
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-gray-300 rounded-2xl font-bold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {!selectedTeam && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 space-y-4">
          <UserCheck className="w-12 h-12 opacity-20" />
          <p className="text-sm">Select a team to start controlling scores</p>
        </div>
      )}
    </div>
  );
};

const ScoreButton: React.FC<{ label: string, onClick: () => void, variant: 'success' | 'danger' | 'bonus' }> = ({ label, onClick, variant }) => {
  const styles = {
    success: "bg-green-600/20 border-green-500 text-green-400 active:bg-green-600/40",
    danger: "bg-red-600/20 border-red-500 text-red-400 active:bg-red-600/40",
    bonus: "bg-yellow-600/20 border-yellow-500 text-yellow-400 active:bg-yellow-600/40"
  };

  return (
    <button 
      onClick={onClick}
      className={`p-6 rounded-2xl border-2 font-black text-xl transition-all ${styles[variant]}`}
    >
      {label}
    </button>
  );
};

export default AdminMobile;
