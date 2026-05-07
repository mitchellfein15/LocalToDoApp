import React, { useEffect, useMemo, useState } from 'react';
import './WidgetCards.css';

function TimerWidget() {
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) {
      return undefined;
    }

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [running]);

  const formatted = useMemo(() => {
    const mins = Math.floor(seconds / 60);
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  }, [seconds]);

  return (
    <div className="timer-floating-widget">
      <div className="timer-label">Focus</div>
      <div className="timer-value">{formatted}</div>
      <div className="timer-actions">
        <button onClick={() => setRunning(!running)}>{running ? 'Pause' : 'Start'}</button>
        <button
          onClick={() => {
            setRunning(false);
            setSeconds(25 * 60);
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default TimerWidget;
