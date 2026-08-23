import { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  formatFn?: (n: number) => string;
  duration?: number;
}

export function AnimatedNumber({ value, formatFn, duration = 800 }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value);
  const displayRef = useRef(value);

  useEffect(() => {
    const from = displayRef.current;
    const start = performance.now();
    let raf = 0;

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (value - from) * eased;
      displayRef.current = current;
      setDisplay(current);
      if (progress < 1) raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  const formatted = formatFn ? formatFn(display) : Math.round(display).toLocaleString();
  return <>{formatted}</>;
}
