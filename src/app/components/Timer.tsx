"use client";
import React, { useState, useEffect } from 'react';

interface TimerProps {
startTime: number | null;
endTime: number | null;
isFinished: boolean;
isStarted: boolean;
className?: string;
countdownMode?: boolean;
countdownTime?: number;
onTimeUp?: () => void;
}

const Timer: React.FC<TimerProps> = ({ 
startTime, 
endTime, 
isFinished, 
isStarted,
className = "",
countdownMode = false,
countdownTime = 30000, // 30 seconds default
onTimeUp
}) => {
const [elapsedTime, setElapsedTime] = useState<number>(countdownMode ? countdownTime : 0);
const [timerColor, setTimerColor] = useState<string>("text-black");

useEffect(() => {
let intervalId: NodeJS.Timeout;

if (isStarted && !isFinished) {
    // Update timer every 100ms for smoother display
    intervalId = setInterval(() => {
    const currentTime = Date.now();
    
    if (countdownMode) {
        // Countdown mode - subtract elapsed time from countdown time
        const timeElapsed = currentTime - (startTime || currentTime);
        const remainingTime = Math.max(0, countdownTime - timeElapsed);
        setElapsedTime(remainingTime);
        
        // Change color based on remaining time
        if (remainingTime < 10000) { // Less than 10 seconds
            setTimerColor("text-orange-500");
        }
        if (remainingTime < 5000) { // Less than 5 seconds
            setTimerColor("text-red-500");
        }
        
        // Call onTimeUp when countdown reaches zero
        if (remainingTime === 0 && onTimeUp) {
            onTimeUp();
        }
    } else {
        // Normal mode - count up
        const timeElapsed = currentTime - (startTime || currentTime);
        setElapsedTime(timeElapsed);

        // Change color based on elapsed time
        if (timeElapsed > 60000) { // After 1 minute
            setTimerColor("text-orange-500");
        }
        if (timeElapsed > 120000) { // After 2 minutes
            setTimerColor("text-red-500");
        }
    }
    }, 100);
} else if (isFinished && startTime && endTime) {
    // Set final time when finished
    if (countdownMode) {
        setElapsedTime(0); // Show 0 when finished in countdown mode
    } else {
        setElapsedTime(endTime - startTime);
    }
}

return () => {
    if (intervalId) {
    clearInterval(intervalId);
    }
};
}, [startTime, endTime, isFinished, isStarted, countdownMode, countdownTime, onTimeUp]);

// Format time as mm:ss.ms or ss.ms for countdown
const formatTime = (ms: number): string => {
const minutes = Math.floor(ms / 60000);
const seconds = Math.floor((ms % 60000) / 1000);
const milliseconds = Math.floor((ms % 1000) / 10); // Only show 2 digits of ms

if (countdownMode) {
    // For countdown mode, only show seconds and milliseconds if less than 1 minute
    if (minutes === 0) {
        return `${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    }
}

return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
};

return (
<div className={`timer-container ${className}`}>
    <div className={`timer ${timerColor} font-mono text-xl font-bold flex items-center justify-center`}>
    <span className="timer-icon mr-2">⏱️</span>
    <span className="timer-value">{formatTime(elapsedTime)}</span>
    </div>
</div>
);
};

export default Timer;