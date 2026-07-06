import React, { useMemo } from 'react';

interface Sparkle {
  id: number;
  x: number; // percentage width
  y: number; // percentage height
  size: number; // pixels
  delay: number; // seconds
  duration: number; // seconds
}

export default function BackgroundSparkles() {
  // Generate a fixed set of sparkles so it's performance-friendly and doesn't re-render/re-generate
  const sparkles = useMemo(() => {
    const pool: Sparkle[] = [];
    // 24 sparkles is perfect: dense enough to feel magical, small enough for zero performance cost
    for (let i = 0; i < 24; i++) {
      pool.push({
        id: i,
        // Distribute nicely across the screen
        x: Math.random() * 100,
        y: Math.random() * 100,
        // Varied sizes (8px to 16px)
        size: 8 + Math.random() * 10,
        // Staggered delays so they twinkle asynchronously
        delay: Math.random() * 8,
        duration: 4 + Math.random() * 4,
      });
    }
    return pool;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true" id="background-sparkle-container">
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="absolute"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
          }}
        >
          {/* Sparkle SVG representing a 4-point magical star */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-full h-full text-emerald-500/15 dark:text-[#34d399]/40 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)] animate-sparkle-twinkle"
            style={{
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
            }}
          >
            <path
              d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z"
              fill="currentColor"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}
