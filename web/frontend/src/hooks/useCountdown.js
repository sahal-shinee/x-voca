import { useState, useEffect, useCallback } from 'react';

export function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
    isExpired: false,
  });

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft((prev) => ({ ...prev, isExpired: true }));
      return;
    }

    const calculateTimeLeft = () => {
      const target = new Date(targetDate).getTime();
      const now = Date.now();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          total: 0,
          isExpired: true,
        });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        total: difference,
        isExpired: false,
      });
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

// Format countdown for display
export function formatCountdown(timeLeft) {
  if (timeLeft.isExpired) {
    return { display: 'LIVE NOW', isLive: true };
  }

  const { days, hours, minutes, seconds } = timeLeft;

  if (days > 0) {
    return {
      display: `${days}d ${hours}h ${minutes}m`,
      isLive: false,
    };
  }

  if (hours > 0) {
    return {
      display: `${hours}h ${minutes}m ${seconds}s`,
      isLive: false,
    };
  }

  return {
    display: `${minutes}m ${seconds}s`,
    isLive: false,
  };
}

export default useCountdown;
