import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GameState } from '../types';
import { FFF_QUESTION_SETS, HOT_SEAT_QUESTIONS } from '../constants';
import { Play, Eye, Lock, Trophy, UserCheck, RefreshCw, CheckCircle, XCircle, Zap, Pause, Square, Users, AlertTriangle, Split, Phone, Bell } from 'lucide-react';
import { db, getServerTime } from '../lib/firebase';
import { ref, update, set, remove } from 'firebase/database';

interface AdminLaptopProps {
  gameState: GameState | null;
}

const AdminLaptop: React.FC<AdminLaptopProps> = ({ gameState }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [questionIndices, setQuestionIndices] = useState({ easy: 0, medium: 0, hard: 0 });
  const [timeLeft, setTimeLeft] = useState(0);
  const [pendingDifficulty, setPendingDifficulty] = useState<'easy' | 'medium' | 'hard' | null>(null);
  const lockAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const fffTimerAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const crowdSourceAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const lastFffTimerTriggerRef = React.useRef<number | null>(null);
  const lastCrowdSourceTriggerRef = React.useRef<number | null>(null);
  const isFirstRender = React.useRef(true);

  React.useEffect(() => {
    const lockAudio = new Audio('/soundeffect/lockoption.mp3');
    const fffAudio = new Audio('/soundeffect/ffftimer.mp3');
    const csAudio = new Audio('/soundeffect/crowdsource.mp3');
    lockAudioRef.current = lockAudio;
    fffTimerAudioRef.current = fffAudio;
    crowdSourceAudioRef.current = csAudio;
    return () => {
      lockAudio.pause();
      lockAudio.src = "";
      fffAudio.pause();
      fffAudio.src = "";
      csAudio.pause();
      csAudio.src = "";
    };
  }, []);

  // Sync triggers on mount to prevent play-on-mount
  React.useEffect(() => {
    if (gameState && isFirstRender.current) {
      lastFffTimerTriggerRef.current = gameState.fffTimerTrigger || null;
      lastCrowdSourceTriggerRef.current = gameState.crowdSourceTrigger || null;
      isFirstRender.current = false;
    }
  }, [gameState]);

  // Handle FFF Timer sound from database trigger
  React.useEffect(() => {
    const audio = fffTimerAudioRef.current;
    if (!audio || !gameState?.fffTimerTrigger) return;

    if (gameState.fffTimerTrigger !== lastFffTimerTriggerRef.current) {
      audio.pause();
      audio.currentTime = 0;
      audio.play().catch(err => console.warn("FFF Timer audio play failed:", err));
      lastFffTimerTriggerRef.current = gameState.fffTimerTrigger;
    }
  }, [gameState?.fffTimerTrigger]);

  // Handle Crowd Source sound from database trigger
  React.useEffect(() => {
    const audio = crowdSourceAudioRef.current;
    if (!audio || !gameState?.crowdSourceTrigger) return;

    if (gameState.crowdSourceTrigger !== lastCrowdSourceTriggerRef.current) {
      audio.pause();
      audio.currentTime = 0;
      audio.play().catch(err => console.warn("Crowd Source audio play failed:", err));
      lastCrowdSourceTriggerRef.current = gameState.crowdSourceTrigger;
    }
  }, [gameState?.crowdSourceTrigger]);

  const playLockSound = () => {
    const audio = lockAudioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.play().catch(err => console.warn("Lock audio play failed:", err));
    }
  };

  const playFffTimerSound = () => {
    // Handled by useEffect now
  };

  const stopLockSound = () => {
    const audio = lockAudioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  };

  React.useEffect(() => {
    if (gameState?.timer.isRunning) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, (gameState.timer.endTime || 0) - getServerTime());
        setTimeLeft(Math.ceil(remaining / 1000));
        
        // Auto-end call timer
        if (gameState.phase === 'CALL_DEV' && remaining === 0) {
          sendAction('END_CALL_LIFELINE');
        }
        
        if (remaining === 0) clearInterval(interval);
      }, 100);
      return () => clearInterval(interval);
    } else if (gameState?.timer.isPaused) {
      setTimeLeft(Math.ceil(gameState.timer.remainingTime / 1000));
    } else {
      setTimeLeft(0);
    }
  }, [gameState?.timer.isRunning, gameState?.timer.isPaused, gameState?.timer.endTime, gameState?.timer.remainingTime]);

  const sendAction = async (action: string, payload: any = {}) => {
    const gameRef = ref(db, 'gameState');

    // Interrupt lock sound for any action other than LOCK_OPTION
    if (action !== 'LOCK_OPTION') {
      stopLockSound();
    }

    switch (action) {
      case 'BELL_SMALL':
        await update(gameRef, { bellSmallTrigger: getServerTime() });
        break;
      case 'BELL_LARGE':
        await update(gameRef, { bellLargeTrigger: getServerTime() });
        break;
      case 'START_FFF':
        if (!gameState) return;
        const fffInitDuration = 15000;
        await update(gameRef, {
          phase: 'FFF_QUESTION',
          currentQuestion: payload.question,
          currentQuestionId: payload.question.id,
          fffSubmissions: null,
          lockedOption: null,
          revealCorrect: false,
          removedOptions: null,
          showBottomLeaderboard: true,
          questionTrigger: getServerTime(),
          'timer/isRunning': false,
          'timer/isPaused': false,
          'timer/startTime': null,
          'timer/endTime': null,
          'timer/remainingTime': fffInitDuration,
          'timer/duration': fffInitDuration,
          'timer/type': 'FFF'
        });
        // Reset team FFF stats
        (gameState.teams || []).forEach(async (t) => {
          await update(ref(db, `gameState/teams/${t.id}`), { isCorrect: 0, fffTime: null });
        });
        break;
      case 'REFRESH_FFF': {
        if (!gameState) return;
        const currentCycle = gameState.cycle || 1;
        const questionSet = FFF_QUESTION_SETS[(currentCycle - 1) % FFF_QUESTION_SETS.length];
        const fffRefreshDuration = 15000;
        
        await update(gameRef, {
          phase: 'FFF_QUESTION',
          currentQuestion: questionSet.alternate,
          currentQuestionId: questionSet.alternate.id,
          fffSubmissions: null,
          lockedOption: null,
          revealCorrect: false,
          removedOptions: null,
          'timer/isRunning': false,
          'timer/isPaused': false,
          'timer/startTime': null,
          'timer/endTime': null,
          'timer/remainingTime': fffRefreshDuration,
          'timer/duration': fffRefreshDuration,
          'timer/type': 'FFF'
        });
        // Reset team FFF stats
        (gameState.teams || []).forEach(async (t) => {
          await update(ref(db, `gameState/teams/${t.id}`), { isCorrect: 0, fffTime: null });
        });
        break;
      }
      case 'SHOW_FFF_OPTIONS':
        const fffDuration = 15000;
        await update(gameRef, {
          phase: 'FFF_OPTIONS',
          fffTimerTrigger: getServerTime(),
          'timer/duration': fffDuration,
          'timer/startTime': getServerTime(),
          'timer/endTime': getServerTime() + fffDuration,
          'timer/remainingTime': fffDuration,
          'timer/isRunning': true,
          'timer/isPaused': false,
          'timer/type': 'FFF'
        });
        break;
      case 'LOCK_FFF':
        await update(gameRef, {
          phase: 'FFF_RESULT',
          showBottomLeaderboard: false,
          'timer/isRunning': false,
          'timer/isPaused': false,
          'timer/startTime': null,
          'timer/endTime': null,
          'timer/remainingTime': 0,
          'timer/type': null
        });
        calculateFFFResults();
        break;
      case 'SHOW_LEADERBOARD':
        await update(gameRef, {
          showBottomLeaderboard: false
        });
        break;
      case 'SEND_TO_HOT_SEAT':
        await update(gameRef, {
          phase: 'HOT_SEAT',
          hotSeatTeamId: payload.teamId,
          fffWinnerTrigger: getServerTime(),
          showBottomLeaderboard: false,
          lifelines: { debugHelp: false, callDev: false, crowdSource: false },
          lockedOption: null,
          revealCorrect: false,
          'timer/isRunning': false,
          'timer/isPaused': false,
          'timer/startTime': null,
          'timer/endTime': null,
          'timer/remainingTime': 0,
          'timer/type': null
        });
        break;
      case 'START_HOT_SEAT_QUESTION': {
        const diff = payload.question.difficulty as 'easy' | 'medium' | 'hard';
        const duration = diff === 'easy' ? 30000 : diff === 'medium' ? 45000 : 60000;
        await update(gameRef, {
          phase: 'HOT_SEAT_QUESTION',
          currentQuestion: payload.question,
          currentQuestionId: payload.question.id,
          lockedOption: null,
          revealCorrect: false,
          removedOptions: null,
          savedRemainingTime: null,
          savedDuration: null,
          questionTrigger: getServerTime(),
          'timer/isRunning': false,
          'timer/isPaused': false,
          'timer/startTime': null,
          'timer/endTime': null,
          'timer/remainingTime': duration,
          'timer/duration': duration,
          'timer/type': 'HOT_SEAT'
        });
        break;
      }
      case 'RESET_HOT_SEAT_UI':
        await update(gameRef, {
          phase: 'HOT_SEAT',
          lockedOption: null,
          revealCorrect: false,
          removedOptions: null,
          activeLifeline: null,
          crowdSourceVotes: null,
          'timer/isRunning': false,
          'timer/isPaused': false,
          'timer/startTime': null,
          'timer/endTime': null,
          'timer/remainingTime': 0,
          'timer/type': null
        });
        break;
      case 'SHOW_HOT_SEAT_OPTIONS':
        if (!gameState) return;
        const hsDuration = selectedDifficulty === 'easy' ? 30000 : selectedDifficulty === 'medium' ? 45000 : 60000;
        await update(gameRef, {
          phase: 'HOT_SEAT_OPTIONS',
          'timer/duration': hsDuration,
          'timer/startTime': getServerTime(),
          'timer/endTime': getServerTime() + hsDuration,
          'timer/remainingTime': hsDuration,
          'timer/isRunning': true,
          'timer/isPaused': false,
          'timer/type': 'HOT_SEAT'
        });
        break;
      case 'START_TIMER':
        if (!gameState) return;
        const duration = payload.duration || 30000;
        await update(gameRef, {
          'timer/duration': duration,
          'timer/startTime': getServerTime(),
          'timer/endTime': getServerTime() + duration,
          'timer/remainingTime': duration,
          'timer/isRunning': true,
          'timer/isPaused': false,
          'timer/type': payload.type || 'HOT_SEAT'
        });
        break;
      case 'PAUSE_TIMER': {
        if (!gameState || !gameState.timer.isRunning) return;
        const remaining = Math.max(0, (gameState.timer.endTime || 0) - getServerTime());
        await update(gameRef, {
          'timer/isRunning': false,
          'timer/isPaused': true,
          'timer/remainingTime': remaining
        });
        break;
      }
      case 'RESUME_TIMER':
        if (!gameState || !gameState.timer.isPaused) return;
        await update(gameRef, {
          activeLifeline: null,
          'timer/isRunning': true,
          'timer/isPaused': false,
          'timer/startTime': getServerTime(),
          'timer/endTime': getServerTime() + gameState.timer.remainingTime
        });
        break;
      case 'STOP_TIMER':
        await update(gameRef, {
          'timer/isRunning': false,
          'timer/isPaused': false,
          'timer/startTime': null,
          'timer/endTime': null,
          'timer/remainingTime': 0,
          'timer/type': null
        });
        break;
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
      case 'REVEAL_CORRECT':
        await update(gameRef, {
          revealCorrect: true,
          answerTrigger: getServerTime(),
          'timer/isRunning': false,
          'timer/isPaused': false,
          'timer/startTime': null,
          'timer/endTime': null,
          'timer/remainingTime': 0,
          'timer/type': null
        });
        break;
      case 'UPDATE_SCORE':
        const team = (gameState.teams || []).find(t => t.id === payload.teamId);
        if (team) {
          const updates: any = {};
          if (payload.type === 'hotSeat') updates.hotSeatPoints = (team.hotSeatPoints || 0) + payload.amount;
          if (payload.type === 'bonus') updates.bonusPoints = (team.bonusPoints || 0) + payload.amount;
          await update(ref(db, `gameState/teams/${payload.teamId}`), updates);
        }
        break;
      case 'ACTIVATE_LIFELINE': {
        if (!gameState) return;
        const lifeline = payload.lifeline;
        const isAlreadyActive = gameState.activeLifeline === lifeline;
        
        if (isAlreadyActive) {
          // Deactivate and resume
          await update(gameRef, {
            activeLifeline: null,
            'timer/isRunning': true,
            'timer/isPaused': false,
            'timer/startTime': getServerTime(),
            'timer/endTime': getServerTime() + gameState.timer.remainingTime
          });
        } else {
          // Activate and pause
          const deduction = lifeline === 'debugHelp' ? -20 : lifeline === 'callDev' ? -10 : -5;
          const team = (gameState.teams || []).find(t => t.id === gameState.hotSeatTeamId);
          
          if (team) {
            await update(ref(db, `gameState/teams/${gameState.hotSeatTeamId}`), {
              hotSeatPoints: (team.hotSeatPoints || 0) + deduction
            });
          }

          const remaining = gameState.timer.isRunning ? Math.max(0, (gameState.timer.endTime || 0) - getServerTime()) : gameState.timer.remainingTime;

          await update(gameRef, {
            activeLifeline: lifeline,
            [`lifelines/${lifeline}`]: true,
            'timer/isRunning': false,
            'timer/isPaused': true,
            'timer/remainingTime': remaining
          });
        }
        break;
      }
      case 'ACTIVATE_VOTING':
        if (!gameState) return;
        const votingDuration = 10000;
        await update(gameRef, {
          phase: 'CROWD_SOURCE',
          activeLifeline: null,
          removedOptions: null,
          crowdSourceVotes: { A: 0, B: 0, C: 0, D: 0 },
          crowdSourceTrigger: getServerTime(),
          savedRemainingTime: gameState.timer.remainingTime,
          savedDuration: gameState.timer.duration,
          savedPhase: gameState.phase,
          'timer/duration': votingDuration,
          'timer/startTime': getServerTime(),
          'timer/endTime': getServerTime() + votingDuration,
          'timer/remainingTime': votingDuration,
          'timer/isRunning': true,
          'timer/isPaused': false,
          'timer/type': 'HOT_SEAT'
        });
        break;
      case 'START_CALL_TIMER':
        if (!gameState) return;
        const callDuration = 60000;
        await update(gameRef, {
          phase: 'CALL_DEV',
          savedRemainingTime: gameState.timer.remainingTime,
          savedDuration: gameState.timer.duration,
          savedPhase: gameState.phase,
          'timer/duration': callDuration,
          'timer/startTime': getServerTime(),
          'timer/endTime': getServerTime() + callDuration,
          'timer/remainingTime': callDuration,
          'timer/isRunning': true,
          'timer/isPaused': false,
          'timer/type': 'HOT_SEAT'
        });
        break;
      case 'END_CALL_LIFELINE':
        if (!gameState) return;
        const callRemaining = gameState.savedRemainingTime || 0;
        const callOriginalDuration = gameState.savedDuration || 30000;
        const callOriginalPhase = gameState.savedPhase || 'HOT_SEAT_OPTIONS';
        await update(gameRef, {
          phase: callOriginalPhase,
          activeLifeline: null,
          'timer/isRunning': true,
          'timer/isPaused': false,
          'timer/startTime': getServerTime(),
          'timer/endTime': getServerTime() + callRemaining,
          'timer/remainingTime': callRemaining,
          'timer/duration': callOriginalDuration,
          savedRemainingTime: null,
          savedDuration: null,
          savedPhase: null
        });
        break;
      case 'RESUME_QUESTION': {
        if (!gameState) return;
        const remaining = gameState.savedRemainingTime || 0;
        const originalDuration = gameState.savedDuration || 30000;
        const originalPhase = gameState.savedPhase || 'HOT_SEAT_OPTIONS';
        await update(gameRef, {
          phase: originalPhase,
          'timer/isRunning': true,
          'timer/isPaused': false,
          'timer/startTime': getServerTime(),
          'timer/endTime': getServerTime() + remaining,
          'timer/remainingTime': remaining,
          'timer/duration': originalDuration,
          savedRemainingTime: null,
          savedDuration: null,
          savedPhase: null
        });
        break;
      }
      case 'REFRESH_QUESTION': {
        if (!gameState) return;
        const diff = payload.difficulty as 'easy' | 'medium' | 'hard';
        const newAltIndex = (questionIndices[diff] + 1) % 3;
        setQuestionIndices(prev => ({ ...prev, [diff]: newAltIndex }));
        setSelectedDifficulty(diff);
        
        const questionIndex = ((gameState.cycle - 1) * 3 + newAltIndex) % HOT_SEAT_QUESTIONS[diff].length;
        const newQuestion = HOT_SEAT_QUESTIONS[diff][questionIndex];
        const duration = diff === 'easy' ? 30000 : diff === 'medium' ? 45000 : 60000;
        
        await update(gameRef, {
          phase: 'HOT_SEAT_QUESTION',
          currentQuestion: newQuestion,
          currentQuestionId: newQuestion.id,
          lockedOption: null,
          revealCorrect: false,
          removedOptions: null,
          'timer/isRunning': false,
          'timer/isPaused': false,
          'timer/startTime': null,
          'timer/endTime': null,
          'timer/remainingTime': duration,
          'timer/duration': duration,
          'timer/type': 'HOT_SEAT'
        });
        break;
      }
      case 'REMOVE_INCORRECT_OPTIONS': {
        if (!gameState || !gameState.currentQuestion) return;
        
        const correctIndex = gameState.currentQuestion.correctIndex;
        if (correctIndex === undefined) return;

        const incorrectIndices = [0, 1, 2, 3].filter(i => i !== correctIndex);
        
        // Pick 2 random incorrect indices
        const shuffled = [...incorrectIndices].sort(() => Math.random() - 0.5);
        const removed = shuffled.slice(0, 2);

        await update(gameRef, {
          activeLifeline: null,
          removedOptions: removed,
          'timer/isRunning': true,
          'timer/isPaused': false,
          'timer/startTime': getServerTime(),
          'timer/endTime': getServerTime() + gameState.timer.remainingTime
        });
        break;
      }
      case 'TOGGLE_TIME_OUT': {
        if (!gameState) return;
        const newTimeOutState = !gameState.isTimeOut;
        
        if (newTimeOutState) {
          // Entering Time Out: Pause timer
          const remaining = gameState.timer.isRunning 
            ? Math.max(0, (gameState.timer.endTime || 0) - getServerTime()) 
            : gameState.timer.remainingTime;
            
          await update(gameRef, { 
            isTimeOut: true,
            'timer/isRunning': false,
            'timer/isPaused': true,
            'timer/remainingTime': remaining
          });
        } else {
          // Exiting Time Out: Resume timer
          await update(gameRef, { 
            isTimeOut: false,
            'timer/isRunning': true,
            'timer/isPaused': false,
            'timer/startTime': getServerTime(),
            'timer/endTime': getServerTime() + (gameState.timer.remainingTime || 0)
          });
        }
        break;
      }
      case 'RESET_GAME':
        await set(gameRef, {
          phase: 'LOBBY',
          cycle: 1,
          teams: null,
          currentQuestion: null,
          currentQuestionId: null,
          hotSeatTeamId: null,
          lifelines: { debugHelp: false, callDev: false, crowdSource: false },
          activeLifeline: null,
          showBottomLeaderboard: true,
          savedRemainingTime: null,
          savedDuration: null,
          savedPhase: null,
          lockedOption: null,
          revealCorrect: false,
          removedOptions: null,
          isTimeOut: false,
          questionTrigger: null,
          answerTrigger: null,
          lockTrigger: null,
          fffTimerTrigger: null,
          crowdSourceTrigger: null,
          fffWinnerTrigger: null,
          bellSmallTrigger: null,
          bellLargeTrigger: null,
          timer: {
            duration: 0,
            startTime: null,
            endTime: null,
            remainingTime: 0,
            isRunning: false,
            isPaused: false,
            type: null
          }
        });
        break;
      case 'NEXT_CYCLE':
        setQuestionIndices({ easy: 0, medium: 0, hard: 0 });
        await update(gameRef, {
          cycle: (gameState.cycle || 1) + 1,
          phase: 'LOBBY',
          showBottomLeaderboard: true
        });
        break;
      case 'PREVIOUS_CYCLE':
        setQuestionIndices({ easy: 0, medium: 0, hard: 0 });
        await update(gameRef, {
          cycle: Math.max(1, (gameState.cycle || 1) - 1),
          phase: 'LOBBY',
          showBottomLeaderboard: true
        });
        break;
      case 'REFRESH_TEAMS':
        // Not really needed for Firebase as it's real-time
        break;
    }
  };

  const calculateFFFResults = () => {
    if (!gameState || !gameState.currentQuestion) return;
    const correctOrder = gameState.currentQuestion.correctOrder;
    const submissions = gameState.fffSubmissions || {};
    
    (gameState.teams || []).forEach(async (team) => {
      const sub = submissions[team.id];
      const isCorrect = sub ? JSON.stringify(sub.submission) === JSON.stringify(correctOrder) : false;
      // If no submission, we set a very high time so they appear at the bottom
      const fffTime = sub ? sub.timeTaken : 999999999; 
      
      const teamRef = ref(db, `gameState/teams/${team.id}`);
      await update(teamRef, {
        isCorrect: isCorrect ? 1 : 0,
        fffTime: fffTime
      });
    });
  };

  if (!gameState) {
    return (
      <div className="min-h-screen bg-[#0a0a2a] text-white flex flex-col items-center justify-center p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Database Initializing...</h1>
          <p className="text-gray-400">If this is your first time, click the button below to setup the game.</p>
        </div>
        <button 
          onClick={() => sendAction('RESET_GAME')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center shadow-lg shadow-blue-500/20 transition-all"
        >
          <RefreshCw className="w-5 h-5 mr-2" /> INITIALIZE GAME DATABASE
        </button>
      </div>
    );
  }

  const currentHotSeatQuestion = HOT_SEAT_QUESTIONS[selectedDifficulty][((gameState.cycle - 1) * 3 + questionIndices[selectedDifficulty]) % HOT_SEAT_QUESTIONS[selectedDifficulty].length];
  const currentFFFQuestionSet = FFF_QUESTION_SETS[(gameState.cycle - 1) % FFF_QUESTION_SETS.length];
  const currentFFFQuestion = currentFFFQuestionSet.main;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-center bg-[#1a1a4a] p-6 rounded-2xl border border-white/10">
        <div>
          <h1 className="text-2xl font-bold">Admin Control Panel</h1>
          <p className="text-gray-400 text-sm">Cycle {gameState.cycle} / 10 • Status: <span className="text-blue-400 font-mono">{gameState.phase}</span></p>
        </div>
        <div className="flex space-x-4">
          <div className="flex bg-[#0a0a2a] rounded-lg p-1 border border-white/5 mr-2">
            <button 
              onClick={() => sendAction('BELL_SMALL')}
              className="p-2 hover:bg-red-500/20 text-red-500 rounded-md transition-all"
              title="Small Bell (fffwinner)"
            >
              <Bell className="w-5 h-5" />
            </button>
            <button 
              onClick={() => sendAction('BELL_LARGE')}
              className="p-2 hover:bg-green-500/20 text-green-500 rounded-md transition-all"
              title="Large Bell (kbclarge)"
            >
              <Bell className="w-6 h-6" />
            </button>
          </div>
          <button onClick={() => sendAction('REFRESH_TEAMS')} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh Teams
          </button>
          <button onClick={() => sendAction('PREVIOUS_CYCLE')} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center">
            <RefreshCw className="w-4 h-4 mr-2" /> Previous Cycle
          </button>
          <button onClick={() => sendAction('NEXT_CYCLE')} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center">
            <Play className="w-4 h-4 mr-2" /> Next Cycle
          </button>
          <button 
            onClick={() => {
              if (confirm("Are you sure you want to reset the entire game? This will delete all teams and scores.")) {
                sendAction('RESET_GAME');
              }
            }} 
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Reset Game
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Fastest Finger First Controls */}
        <section className="bg-[#1a1a4a] p-6 rounded-2xl border border-white/10 space-y-6">
          <h2 className="text-xl font-bold flex items-center"><Zap className="mr-2 text-yellow-500" /> Fastest Finger First</h2>
          {gameState.timer.type === 'FFF' && (
            <div className="text-center py-2 bg-[#0a0a2a] rounded-xl border border-white/5">
              <span className="text-2xl font-mono font-bold text-blue-400">{timeLeft}s</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <AdminButton 
              icon={<Play />} label="Start FFF" 
              onClick={() => sendAction('START_FFF', { question: currentFFFQuestion })} 
              active={gameState.phase === 'LOBBY'}
            />
            <AdminButton 
              icon={<Eye />} label="Show Options" 
              onClick={() => sendAction('SHOW_FFF_OPTIONS')} 
              active={gameState.phase === 'FFF_QUESTION'}
            />
            <AdminButton 
              icon={<Lock />} label="Lock Submissions" 
              onClick={() => sendAction('LOCK_FFF')} 
              active={gameState.phase === 'FFF_OPTIONS'}
            />
            <AdminButton 
              icon={<Trophy />} label="Show Leaderboard" 
              onClick={() => sendAction('SHOW_LEADERBOARD')} 
              active={gameState.phase === 'FFF_RESULT'}
            />
            <AdminButton 
              icon={<RefreshCw />} label="Refresh FFF" 
              onClick={() => sendAction('REFRESH_FFF')} 
              active={['FFF_QUESTION', 'FFF_OPTIONS', 'FFF_RESULT', 'LOBBY'].includes(gameState.phase)}
              variant="danger"
            />
          </div>
          
          {gameState.phase === 'FFF_RESULT' ? (
            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase">Select Winner for Hot Seat</h3>
              <div className="space-y-2">
                {(gameState.teams || [])
                  .filter(t => t.isCorrect === 1)
                  .sort((a, b) => {
                    // First priority: Correctness (1 comes before 0)
                    if (a.isCorrect !== b.isCorrect) {
                      return b.isCorrect - a.isCorrect;
                    }
                    // Second priority: Time (ascending)
                    const timeA = (a.fffTime && a.fffTime < 999999) ? a.fffTime : 999999999;
                    const timeB = (b.fffTime && b.fffTime < 999999) ? b.fffTime : 999999999;
                    return timeA - timeB;
                  })
                  .map((team, index) => (
                    <button 
                      key={team.id || index}
                      onClick={() => sendAction('SEND_TO_HOT_SEAT', { teamId: team.id })}
                      className="w-full bg-[#0a0a2a] hover:bg-blue-900/30 p-3 rounded-xl border border-white/5 flex justify-between items-center transition-colors"
                    >
                      <span className="font-bold">{team.name}</span>
                      <span className="font-mono text-blue-400">
                        {team.fffTime && isFinite(team.fffTime) && team.fffTime < 999999 ? `${(team.fffTime / 1000).toFixed(3)}s` : '--'}
                      </span>
                    </button>
                  ))}
                
                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-2">Manual Override (Select Any Team)</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {(gameState.teams || []).map((team, index) => (
                      <button 
                        key={team.id || index}
                        onClick={() => sendAction('SEND_TO_HOT_SEAT', { teamId: team.id })}
                        className="bg-[#1a1a4a] hover:bg-blue-600/20 p-2 rounded-lg text-xs font-bold border border-white/5 truncate"
                      >
                        {team.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 pt-4 border-t border-white/10">
              <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-2">Quick Select (Hot Seat)</h4>
              <div className="grid grid-cols-2 gap-2">
                {(gameState.teams || []).map((team, index) => (
                  <button 
                    key={team.id || index}
                    onClick={() => sendAction('SEND_TO_HOT_SEAT', { teamId: team.id })}
                    className="bg-[#1a1a4a] hover:bg-blue-600/20 p-2 rounded-lg text-xs font-bold border border-white/5 truncate"
                  >
                    {team.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Hot Seat Controls */}
        <section className="bg-[#1a1a4a] p-6 rounded-2xl border border-white/10 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center"><UserCheck className="mr-2 text-blue-500" /> Hot Seat Control</h2>
            <button 
              onClick={() => sendAction('TOGGLE_TIME_OUT')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all border-2 ${gameState.isTimeOut ? 'bg-red-600 border-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-red-600/10 border-red-500/30 text-red-500 hover:bg-red-600/20'}`}
            >
              {gameState.isTimeOut ? 'EXIT TIME OUT' : 'TIME OUT'}
            </button>
          </div>
          <div className="flex space-x-2 mb-4">
            {(['easy', 'medium', 'hard'] as const).map(d => (
              <button 
                key={d}
                onClick={() => {
                  if (selectedDifficulty === d) return;
                  
                  const isQuestionActive = ['HOT_SEAT_QUESTION', 'HOT_SEAT_OPTIONS', 'CROWD_SOURCE'].includes(gameState?.phase || '');
                  
                  if (isQuestionActive) {
                    setPendingDifficulty(d);
                  } else {
                    setSelectedDifficulty(d);
                    setQuestionIndices(prev => ({ ...prev, [d]: 0 }));
                    sendAction('RESET_HOT_SEAT_UI');
                  }
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-colors ${selectedDifficulty === d ? 'bg-blue-600 border-blue-400' : 'bg-[#0a0a2a] border-white/10 text-gray-500'}`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {(['easy', 'medium', 'hard'] as const).map(d => (
              <button 
                key={`refresh-${d}`}
                onClick={() => sendAction('REFRESH_QUESTION', { difficulty: d })}
                className="bg-gray-800 hover:bg-gray-700 text-[10px] py-1 rounded border border-white/10 font-bold uppercase tracking-tighter"
              >
                Refresh {d}
              </button>
            ))}
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-gray-400">Question {questionIndices[selectedDifficulty] + 1}</span>
            <button 
              onClick={() => setQuestionIndices(prev => ({ ...prev, [selectedDifficulty]: (prev[selectedDifficulty] + 1) % HOT_SEAT_QUESTIONS[selectedDifficulty].length }))}
              className="text-xs text-blue-400 hover:underline"
            >
              Next Question
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <AdminButton 
              icon={<Play />} label="Show Question" 
              onClick={() => sendAction('START_HOT_SEAT_QUESTION', { question: currentHotSeatQuestion })} 
              active={gameState.phase === 'HOT_SEAT' || gameState.phase === 'HOT_SEAT_QUESTION' || gameState.phase === 'HOT_SEAT_OPTIONS' || gameState.phase === 'CROWD_SOURCE'}
            />
            <AdminButton 
              icon={<Eye />} label="Show Options" 
              onClick={() => sendAction('SHOW_HOT_SEAT_OPTIONS')} 
              active={gameState.phase === 'HOT_SEAT_QUESTION' || gameState.phase === 'CROWD_SOURCE'}
            />
            <div className="bg-[#0a0a2a] p-4 rounded-2xl border border-white/10 flex flex-col space-y-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase text-center">Timer Controls</span>
              <div className="text-2xl font-mono font-bold text-center text-blue-400 mb-1">
                {timeLeft}s
              </div>
              <div className="flex space-x-2">
                {!gameState.timer.isRunning && !gameState.timer.isPaused ? (
                  <button 
                    onClick={() => {
                      const dur = selectedDifficulty === 'easy' ? 30000 : selectedDifficulty === 'medium' ? 45000 : 60000;
                      sendAction('START_TIMER', { duration: dur, type: 'HOT_SEAT' });
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 p-2 rounded-lg flex items-center justify-center"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                ) : gameState.timer.isRunning ? (
                  <button 
                    onClick={() => sendAction('PAUSE_TIMER')}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 p-2 rounded-lg flex items-center justify-center"
                  >
                    <Pause className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    onClick={() => sendAction('RESUME_TIMER')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 p-2 rounded-lg flex items-center justify-center"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={() => sendAction('STOP_TIMER')}
                  className="flex-1 bg-red-600 hover:bg-red-700 p-2 rounded-lg flex items-center justify-center"
                >
                  <Square className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="bg-[#0a0a2a] p-4 rounded-2xl border border-white/10 flex flex-col space-y-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase text-center">Lock Option</span>
              <div className="grid grid-cols-4 gap-1">
                {['A', 'B', 'C', 'D'].map((opt, i) => {
                  const isRemoved = gameState.removedOptions?.includes(i);
                  return (
                    <button 
                      key={opt}
                      disabled={isRemoved}
                      onClick={() => sendAction('LOCK_OPTION', { optionIndex: i })}
                      className={`py-2 rounded-lg text-xs font-bold border transition-all ${isRemoved ? 'opacity-0 pointer-events-none' : gameState.lockedOption === i ? 'bg-yellow-600 border-yellow-400 text-white' : 'bg-[#1a1a4a] border-white/10 text-gray-400'}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
            <AdminButton 
              icon={<Eye />} label="Reveal Correct" 
              onClick={() => sendAction('REVEAL_CORRECT')} 
              active={(gameState.phase === 'HOT_SEAT_OPTIONS' || gameState.phase === 'CROWD_SOURCE') && gameState.lockedOption !== null && !gameState.revealCorrect}
            />
            <AdminButton 
              icon={<CheckCircle />} label="Mark Correct" 
              onClick={() => sendAction('UPDATE_SCORE', { teamId: gameState.hotSeatTeamId, type: 'hotSeat', amount: selectedDifficulty === 'easy' ? 30 : selectedDifficulty === 'medium' ? 50 : 100 })} 
              active={(gameState.phase === 'HOT_SEAT_OPTIONS' || gameState.phase === 'CROWD_SOURCE') && gameState.revealCorrect}
              variant="success"
            />
            <AdminButton 
              icon={<XCircle />} label="Mark Wrong" 
              onClick={() => sendAction('UPDATE_SCORE', { teamId: gameState.hotSeatTeamId, type: 'hotSeat', amount: 0 })} 
              active={(gameState.phase === 'HOT_SEAT_OPTIONS' || gameState.phase === 'CROWD_SOURCE') && gameState.revealCorrect}
              variant="danger"
            />
          </div>

          <div className="mt-6 flex flex-col space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <button 
                disabled={gameState.lifelines.debugHelp && gameState.activeLifeline !== 'debugHelp'}
                onClick={() => sendAction('ACTIVATE_LIFELINE', { lifeline: 'debugHelp' })} 
                className={`p-3 rounded-xl text-xs font-bold border transition-all ${gameState.lifelines.debugHelp && gameState.activeLifeline !== 'debugHelp' ? 'opacity-50 cursor-not-allowed grayscale' : gameState.activeLifeline === 'debugHelp' ? 'bg-purple-600 border-purple-400 text-white' : 'bg-purple-600/20 hover:bg-purple-600/40 border-purple-500/50 text-purple-100'}`}
              >
                DEBUG HELP (-20)
              </button>
              <button 
                disabled={gameState.lifelines.callDev && gameState.activeLifeline !== 'callDev'}
                onClick={() => sendAction('ACTIVATE_LIFELINE', { lifeline: 'callDev' })} 
                className={`p-3 rounded-xl text-xs font-bold border transition-all ${gameState.lifelines.callDev && gameState.activeLifeline !== 'callDev' ? 'opacity-50 cursor-not-allowed grayscale' : gameState.activeLifeline === 'callDev' ? 'bg-orange-600 border-orange-400 text-white' : 'bg-orange-600/20 hover:bg-orange-600/40 border-orange-500/50 text-orange-100'}`}
              >
                CALL DEV (-10)
              </button>
              <button 
                disabled={gameState.lifelines.crowdSource && gameState.activeLifeline !== 'crowdSource' && gameState.phase !== 'CROWD_SOURCE'}
                onClick={() => sendAction('ACTIVATE_LIFELINE', { lifeline: 'crowdSource' })} 
                className={`p-3 rounded-xl text-xs font-bold border transition-all ${gameState.lifelines.crowdSource && gameState.activeLifeline !== 'crowdSource' && gameState.phase !== 'CROWD_SOURCE' ? 'opacity-50 cursor-not-allowed grayscale' : gameState.activeLifeline === 'crowdSource' || gameState.phase === 'CROWD_SOURCE' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-blue-600/20 hover:bg-blue-600/40 border-blue-500/50 text-blue-100'}`}
              >
                CROWDSOURCE (-5)
              </button>
            </div>
            
            {gameState.activeLifeline === 'debugHelp' && (
              <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => sendAction('REMOVE_INCORRECT_OPTIONS')}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg text-sm font-bold shadow-lg shadow-purple-500/20 flex items-center justify-center space-x-2"
              >
                <Split className="w-4 h-4" />
                <span>REMOVE INCORRECT OPTIONS</span>
              </motion.button>
            )}

            {gameState.activeLifeline === 'callDev' && (
              <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => sendAction(gameState.phase === 'CALL_DEV' ? 'END_CALL_LIFELINE' : 'START_CALL_TIMER')}
                className={`w-full ${gameState.phase === 'CALL_DEV' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20'} text-white py-2 rounded-lg text-sm font-bold shadow-lg flex items-center justify-center space-x-2`}
              >
                <Phone className="w-4 h-4" />
                <span>{gameState.phase === 'CALL_DEV' ? 'END CALL DEV LIFELINE' : 'START CALL TIMER (60s)'}</span>
              </motion.button>
            )}

            {gameState.activeLifeline === 'crowdSource' && gameState.phase !== 'CROWD_SOURCE' && (
              <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => sendAction('ACTIVATE_VOTING')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2"
              >
                <Users className="w-4 h-4" />
                <span>ACTIVATE VOTING (10s)</span>
              </motion.button>
            )}

            {gameState.phase === 'CROWD_SOURCE' && (
              <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => sendAction('RESUME_QUESTION')}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-bold shadow-lg shadow-green-500/20 flex items-center justify-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>RESUME QUESTION</span>
              </motion.button>
            )}
          </div>
        </section>
      </div>

      {/* Team Management */}
      <section className="bg-[#1a1a4a] p-6 rounded-2xl border border-white/10">
        <h2 className="text-xl font-bold mb-6">Teams Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(gameState.teams || []).map((team, index) => (
            <div key={team.id || index} className="bg-[#0a0a2a] p-4 rounded-xl border border-white/5 relative overflow-hidden">
              {gameState.hotSeatTeamId === team.id && <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />}
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold truncate pr-2">{team.name}</span>
                <span className="text-xs font-mono text-blue-400">ID: {team.id}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Score: <span className="text-white font-mono">{40 + (team.hotSeatPoints || 0) + (team.bonusPoints || 0)}</span></span>
                <span>FFF: <span className="text-white font-mono">
                  {team.fffTime && isFinite(team.fffTime) && team.fffTime < 999999 ? `${(team.fffTime / 1000).toFixed(3)}s` : '--'}
                </span></span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Level Switch Confirmation Modal */}
      {pendingDifficulty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1a1a4a] w-full max-w-md rounded-3xl border border-blue-500/30 p-8 space-y-6 shadow-2xl shadow-blue-500/10">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-blue-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Switch Difficulty?</h3>
                <p className="text-gray-400 text-sm">
                  A question is already active. Switching level will reset the current question. Do you want to continue?
                </p>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <button 
                onClick={() => {
                  setSelectedDifficulty(pendingDifficulty);
                  sendAction('RESET_HOT_SEAT_UI');
                  setPendingDifficulty(null);
                }}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all"
              >
                Yes, Switch
              </button>
              <button 
                onClick={() => setPendingDifficulty(null)}
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-gray-300 rounded-2xl font-bold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminButton: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void, active: boolean, variant?: 'default' | 'success' | 'danger' }> = ({ icon, label, onClick, active, variant = 'default' }) => {
  const baseStyles = "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all text-center space-y-2";
  const activeStyles = {
    default: "bg-blue-600/20 border-blue-500 text-blue-100 hover:bg-blue-600/30",
    success: "bg-green-600/20 border-green-500 text-green-100 hover:bg-green-600/30",
    danger: "bg-red-600/20 border-red-500 text-red-100 hover:bg-red-600/30"
  };
  const disabledStyles = "bg-[#0a0a2a] border-white/5 text-gray-600 cursor-not-allowed opacity-50";

  return (
    <button 
      onClick={active ? onClick : undefined}
      className={`${baseStyles} ${active ? activeStyles[variant] : disabledStyles}`}
    >
      <div className="w-8 h-8">{icon}</div>
      <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
};

export default AdminLaptop;
