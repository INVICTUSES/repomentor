"use client";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden>
      <div className="absolute inset-0 bg-grid opacity-40" />

      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="floating-symbols">
        {["{ }", "</>", "git", "npm", "src/", "README", "PR", "fork"].map(
          (symbol, i) => (
            <span
              key={symbol}
              className="floating-symbol"
              style={{
                left: `${10 + i * 11}%`,
                animationDelay: `${i * 1.2}s`,
                animationDuration: `${14 + i * 2}s`,
              }}
            >
              {symbol}
            </span>
          )
        )}
      </div>

      <div className="scan-line" />
    </div>
  );
}
