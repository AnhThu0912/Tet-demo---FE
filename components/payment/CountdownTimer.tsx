import React, { useState, useEffect, useCallback } from "react";

export interface CountdownTimerProps {
  /** Total seconds to count down from */
  totalSeconds: number;
  onExpire: () => void;
  /** Optional: format as "MM:SS" */
  className?: string;
}

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  totalSeconds,
  onExpire,
  className = "",
}) => {
  const [remaining, setRemaining] = useState(totalSeconds);
  const [expired, setExpired] = useState(false);

  const tick = useCallback(() => {
    setRemaining((prev) => {
      if (prev <= 1) {
        setExpired(true);
        onExpire();
        return 0;
      }
      return prev - 1;
    });
  }, [onExpire]);

  useEffect(() => {
    if (expired) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick, expired]);

  return (
    <div className={`text-sm font-medium text-gray-600 ${className}`}>
      {expired ? (
        <span className="text-red-600">Giao dịch đã hết hạn</span>
      ) : (
        <>
          <span className="text-gray-500">Thời gian còn lại: </span>
          <span className="font-mono font-semibold text-gray-800">
            {formatTime(remaining)}
          </span>
        </>
      )}
    </div>
  );
};

export default CountdownTimer;
export { formatTime };
