typescriptreact
'use client';

import React, { useState, useEffect } from 'react';

interface QuizTimerProps {
  timeLimit: number; // Time limit in minutes
  onTimeEnd: () => void; // Callback function when time runs out
}

const QuizTimer: React.FC<QuizTimerProps> = ({ timeLimit, onTimeEnd }) => {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60); // State in seconds

  useEffect(() => {
    if (timeRemaining <= 0) {
      onTimeEnd();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer); // Cleanup the interval on component unmount
  }, [timeRemaining, onTimeEnd]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
  };

  return (
    <div className="text-lg font-semibold">
      Time Remaining: {formatTime(timeRemaining)}
    </div>
  );
};

export default QuizTimer;