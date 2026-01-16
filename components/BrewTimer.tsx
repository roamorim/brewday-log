import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';
import { getSessionById, saveSession } from '../services/storageService';

interface BrewTimerProps {
  sessionId: string;
  defaultDuration?: number;
  onTimerChange?: () => void;
}

const BrewTimer: React.FC<BrewTimerProps> = ({ sessionId, defaultDuration = 60, onTimerChange }) => {
  const [duration, setDuration] = useState(defaultDuration);
  const [timeLeft, setTimeLeft] = useState(defaultDuration * 60);
  const [isActive, setIsActive] = useState(false);

  // Sync with persistent storage on mount
  useEffect(() => {
    const session = getSessionById(sessionId);
    if (session) {
      if (session.timerDurationMinutes) {
        setDuration(session.timerDurationMinutes);
      }

      if (session.timerIsRunning && session.timerEndTime) {
        const remaining = Math.max(0, Math.floor((session.timerEndTime - Date.now()) / 1000));
        setTimeLeft(remaining);
        setIsActive(remaining > 0);
      } else if (session.timerRemainingSeconds !== undefined) {
        // Load the paused state
        setTimeLeft(session.timerRemainingSeconds);
        setIsActive(false);
      } else if (session.timerDurationMinutes) {
        // Fallback to full duration
        setTimeLeft(session.timerDurationMinutes * 60);
      }
    }
  }, [sessionId]);

  // Tick logic
  useEffect(() => {
    let interval: number;

    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        const session = getSessionById(sessionId);
        if (session?.timerEndTime) {
          const remaining = Math.max(0, Math.floor((session.timerEndTime - Date.now()) / 1000));
          setTimeLeft(remaining);
          if (remaining <= 0) {
            setIsActive(false);
            updateSessionTimer(false, null, 0);
          }
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, sessionId]);

  const updateSessionTimer = (running: boolean, endTime: number | null, remaining: number | null) => {
    const session = getSessionById(sessionId);
    if (session) {
      session.timerIsRunning = running;
      if (endTime !== null) session.timerEndTime = endTime;
      if (remaining !== null) session.timerRemainingSeconds = remaining;
      session.timerDurationMinutes = duration;
      saveSession(session);
      if (onTimerChange) onTimerChange();
    }
  };

  const toggleTimer = () => {
    const newActive = !isActive;
    setIsActive(newActive);

    if (newActive) {
      // Start or Resume
      const endTime = Date.now() + (timeLeft * 1000);
      updateSessionTimer(true, endTime, null);
    } else {
      // Pause: Save exact remaining seconds
      updateSessionTimer(false, null, timeLeft);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    const newTimeLeft = duration * 60;
    setTimeLeft(newTimeLeft);
    updateSessionTimer(false, 0, newTimeLeft);
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    setDuration(val);
    if (!isActive) {
      const newTimeLeft = val * 60;
      setTimeLeft(newTimeLeft);
      const session = getSessionById(sessionId);
      if (session) {
        session.timerDurationMinutes = val;
        session.timerRemainingSeconds = newTimeLeft;
        saveSession(session);
        if (onTimerChange) onTimerChange();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mb-4">
      <div className="flex items-center gap-2 mb-3 text-amber-800 font-semibold">
        <Timer size={20} />
        <h3>Phase Timer</h3>
      </div>
      
      <div className="text-center mb-4">
        <div className={`text-5xl font-mono font-bold tabular-nums tracking-tighter transition-colors ${timeLeft === 0 ? 'text-red-500 animate-pulse' : 'text-gray-800'}`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="flex gap-2">
         <button 
           onClick={toggleTimer}
           className={`flex-1 py-2 px-4 rounded-lg font-medium flex justify-center items-center gap-2 transition-colors ${
             isActive 
               ? 'bg-amber-200 text-amber-900 hover:bg-amber-300' 
               : 'bg-amber-600 text-white hover:bg-amber-700'
           }`}
         >
           {isActive ? <><Pause size={18}/> Pause</> : <><Play size={18}/> Start</>}
         </button>
         
         <button 
           onClick={resetTimer}
           className="px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
         >
           <RotateCcw size={18} />
         </button>
      </div>
      
      {!isActive && (
        <div className="mt-4 pt-3 border-t border-amber-200/50 flex items-center justify-between text-sm">
          <label className="text-amber-900">Duration (min):</label>
          <input 
            type="number" 
            value={duration} 
            onChange={handleDurationChange}
            className="w-16 p-1 text-center border border-amber-200 rounded bg-white text-gray-800"
          />
        </div>
      )}
    </div>
  );
};

export default BrewTimer;