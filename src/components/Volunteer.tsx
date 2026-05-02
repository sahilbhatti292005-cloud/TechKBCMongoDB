import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameState } from '../types';
import { CheckCircle, Clock, Vote, Lock } from 'lucide-react';
import { db, getServerTime } from '../lib/firebase';
import { ref, set, increment, update } from 'firebase/database';

interface VolunteerProps {
  gameState: GameState | null;
  teamId: string;
}

const Volunteer: React.FC<VolunteerProps> = ({ gameState, teamId }) => {
  const [selection, setSelection] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [voted, setVoted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Auto-re-registration logic
  useEffect(() => {
    if (gameState && teamId) {
      const teams = gameState.teams || [];
      const teamExists = teams.some(t => t.id === teamId);
      const teamHasName = teams.find(t => t.id === teamId)?.name;
      
      if (!teamExists || !teamHasName) {
        const storedName = localStorage.getItem('kbc_teamName');
        if (storedName) {
          console.log('Re-registering team:', teamId, storedName);
          const teamRef = ref(db, `gameState/teams/${teamId}`);
          update(teamRef, {
            id: teamId,
            name: storedName,
            initialPoints: 40,
            hotSeatPoints: 0,
            bonusPoints: 0,
            isCorrect: 0
          });
        }
      }
    }
  }, [gameState?.teams, teamId]);

  useEffect(() => {
    if (gameState?.timer.isRunning) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, (gameState.timer.endTime || 0) - getServerTime());
        setTimeLeft(Math.ceil(remaining / 1000));
        if (remaining === 0) clearInterval(interval);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setTimeLeft(0);
    }
  }, [gameState?.timer.isRunning, gameState?.timer.endTime]);

  useEffect(() => {
    // Team registration is handled in App.tsx login
  }, [teamId]);

  useEffect(() => {
    if (gameState?.phase === 'FFF_QUESTION') {
      setSubmitted(false);
      setSelection([]);
    }
    if (gameState?.phase === 'CROWD_SOURCE') {
      setVoted(false);
    }
  }, [gameState?.phase]);

  const handleSelect = async (index: number) => {
    if (selection.includes(index)) return;
    const newSelection = [...selection, index];
    setSelection(newSelection);

    if (newSelection.length === 4) {
      const timeTaken = Date.now() - (gameState?.timer.startTime || Date.now());
      await set(ref(db, `gameState/fffSubmissions/${teamId}`), {
        teamId,
        submission: newSelection,
        timeTaken
      });
      setSubmitted(true);
    }
  };

  const handleVote = async (option: string) => {
    await update(ref(db, 'gameState/crowdSourceVotes'), {
      [option]: increment(1)
    });
    setVoted(true);
  };

  if (!gameState) return (
    <div className="min-h-screen bg-[#0a0a2a] flex flex-col items-center justify-center text-white p-8 space-y-4">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <div className="text-xl font-bold uppercase tracking-widest">Cognos Tech KBC</div>
      <div className="text-xl font-bold">Connecting to Game...</div>
      <p className="text-gray-400 text-sm text-center">Waiting for the Admin to start the session.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a2a] text-white p-6 flex flex-col">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl font-bold">Volunteer Mode</h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest">Team: {localStorage.getItem('kbc_teamName')}</p>
        </div>
        <div className="bg-blue-600/20 px-3 py-1 rounded-full border border-blue-500/50 text-[10px] font-bold text-blue-400">
          CYCLE {gameState.cycle}
        </div>
      </header>

      <AnimatePresence mode="wait">
        {gameState.phase === 'LOBBY' && (
          <motion.div 
            key="lobby"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center space-y-4"
          >
            <Clock className="w-16 h-16 text-blue-500 opacity-50 animate-pulse" />
            <h2 className="text-2xl font-bold">Waiting for Admin...</h2>
            <p className="text-gray-400 text-sm">The game will start shortly. Please keep this screen open.</p>
          </motion.div>
        )}

        {(gameState.phase === 'FFF_QUESTION' || gameState.phase === 'FFF_OPTIONS') && (
          <motion.div 
            key="fff"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            <h2 className="text-xl font-bold mb-6 whitespace-pre-wrap">{gameState.currentQuestion?.text}</h2>
            
            {gameState.phase === 'FFF_OPTIONS' && !submitted ? (
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-xs text-blue-400 uppercase tracking-widest">Tap options in the correct order</p>
                  <div className={`text-xl font-mono font-bold ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
                    {timeLeft}s
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {gameState.currentQuestion?.options.map((opt, i) => {
                    const orderIndex = selection.indexOf(i);
                    return (
                      <button 
                        key={i} 
                        onClick={() => handleSelect(i)}
                        disabled={orderIndex !== -1 || timeLeft === 0}
                        className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                          orderIndex !== -1 
                            ? 'bg-blue-600/20 border-blue-500 text-blue-300 opacity-50' 
                            : timeLeft === 0
                            ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-[#1a1a4a] border-white/10 hover:border-blue-500'
                        }`}
                      >
                        <span className="font-bold">{opt}</span>
                        {orderIndex !== -1 && (
                          <span className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-black">
                            {orderIndex + 1}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                {selection.length > 0 && (
                  <button 
                    onClick={() => setSelection([])}
                    className="mt-4 text-xs text-gray-400 underline"
                  >
                    Reset Selection
                  </button>
                )}
              </div>
            ) : submitted ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                <CheckCircle className="w-20 h-20 text-green-500" />
                <h2 className="text-2xl font-bold">Answer Submitted!</h2>
                <p className="text-gray-400">Please wait for the results on the main screen.</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                <Clock className="w-12 h-12 text-blue-400 animate-spin-slow" />
                <p className="text-gray-400">Admin is reading the question...</p>
              </div>
            )}
          </motion.div>
        )}

        {gameState.phase === 'CROWD_SOURCE' && (
          <motion.div 
            key="crowd_source"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <Vote className="text-blue-400" />
                <h2 className="text-xl font-bold uppercase tracking-wider text-blue-400">Crowd Source</h2>
              </div>
              <div className={`text-2xl font-mono font-bold px-4 py-1 rounded-lg bg-black/40 border ${timeLeft <= 5 ? 'text-red-500 border-red-500/50 animate-pulse' : 'text-blue-400 border-blue-500/30'}`}>
                {timeLeft}s
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6 mb-6">
              <p className="text-xs text-blue-400 uppercase tracking-widest mb-2 font-bold">Question</p>
              <h3 className="text-xl font-bold leading-tight whitespace-pre-wrap">
                {gameState.currentQuestion?.text || "Question loading..."}
              </h3>
            </div>
            
            {teamId === gameState.hotSeatTeamId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                <Lock className="w-20 h-20 text-yellow-500/50" />
                <h2 className="text-2xl font-bold">You are in the Hot Seat!</h2>
                <p className="text-gray-400">You cannot vote in your own audience poll. Good luck!</p>
              </div>
            ) : timeLeft > 0 ? (
              !voted ? (
                <div className="grid grid-cols-1 gap-3">
                  {['A', 'B', 'C', 'D'].map((opt, index) => {
                    const optionText = gameState.currentQuestion?.options[index];
                    const isRemoved = gameState.removedOptions?.includes(index);
                    
                    if (isRemoved) return null;

                    return (
                      <button 
                        key={opt}
                        onClick={() => handleVote(opt)}
                        className="bg-[#1a1a4a] hover:bg-blue-600/40 p-4 rounded-xl border border-white/10 text-left flex items-center space-x-4 transition-all active:scale-[0.98] group"
                      >
                        <span className="w-10 h-10 bg-blue-600 group-hover:bg-blue-500 rounded-full flex items-center justify-center font-black text-lg shadow-lg shadow-blue-900/20">{opt}</span>
                        <span className="text-lg font-medium flex-1">{optionText || `Option ${opt}`}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                  <CheckCircle className="w-20 h-20 text-green-500" />
                  <h2 className="text-2xl font-bold">Vote Cast!</h2>
                  <p className="text-gray-400">Your vote has been recorded. Watch the screen for results.</p>
                </div>
              )
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                <Clock className="w-20 h-20 text-red-500/50" />
                <h2 className="text-2xl font-bold">Voting Closed</h2>
                <p className="text-gray-400">The 15-second voting period has ended. Results are on the main screen.</p>
              </div>
            )}
          </motion.div>
        )}

        {['HOT_SEAT', 'HOT_SEAT_QUESTION', 'HOT_SEAT_OPTIONS', 'FFF_RESULT', 'GAME_OVER'].includes(gameState.phase) && (
          <motion.div 
            key="locked"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center space-y-6"
          >
            <div className="relative">
              <Lock className="w-20 h-20 text-blue-500/50" />
              <motion.div 
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-dashed border-blue-500/30 rounded-full scale-150"
              />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Interface Locked</h2>
              <p className="text-gray-400 text-sm max-w-[250px] mx-auto">
                {gameState.phase === 'FFF_RESULT' 
                  ? "Fastest Finger results are being displayed. Check the main screen!" 
                  : gameState.phase === 'HOT_SEAT'
                  ? "A team is currently in the Hot Seat. Good luck to them!"
                  : "The game has concluded. Thank you for playing!"}
              </p>
            </div>
            <div className="pt-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 animate-pulse uppercase tracking-widest">
                Waiting for next round
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Volunteer;

