import { useEffect, useState } from "react";

interface CountdownProps {
  expiresAt: string;
}

const formatRemaining = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((unit) => String(unit).padStart(2, "0"))
    .join(":");
};

const Countdown = ({ expiresAt }: CountdownProps) => {
  const [remaining, setRemaining] = useState(
    () => new Date(expiresAt).getTime() - Date.now()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(new Date(expiresAt).getTime() - Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const expired = remaining <= 0;

  return (
    <span
      className={`font-mono text-sm font-semibold ${
        expired ? "text-red-500" : "text-amber-600"
      }`}
    >
      {expired ? "Expired" : formatRemaining(remaining)}
    </span>
  );
};

export default Countdown;
