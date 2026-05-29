import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

// ============================================================
// HEXAGON SVG COMPONENT
// ============================================================
export function HexagonMonogram({ initials, color1 = "#06b6d4", color2 = "#3b82f6", size = 100 }) {
  const id = `hex-grad-${initials}`;
  const w = size;
  const h = size * 1.1547;
  const cx = w / 2;
  const cy = h / 2;
  const r = w / 2 - 4;

  // Hexagon points
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - 30);
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
        <filter id={`glow-${initials}`}>
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer glow hexagon */}
      <polygon
        points={points}
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="2"
        opacity="0.4"
        filter={`url(#glow-${initials})`}
      />

      {/* Inner filled hexagon */}
      <polygon
        points={points}
        fill={`url(#${id})`}
        opacity="0.15"
      />

      {/* Border */}
      <polygon
        points={points}
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="1.5"
      />

      {/* Initials */}
      <text
        x={cx}
        y={cy + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize={size * 0.28}
        fontWeight="900"
        fontFamily="'Segoe UI', sans-serif"
        letterSpacing="2"
      >
        {initials}
      </text>
    </svg>
  );
}

// ============================================================
// AUTH LOADING - shown during login/signup
// ============================================================
export function AuthLoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center"
    >
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(6,182,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="relative w-20 h-20">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ rotate: 360 }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: i * 0.3 }}
              style={{ position: "absolute", inset: 0, rotate: i * 120 + "deg" }}
            >
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
                style={{
                  position: "absolute", top: 0, left: "50%",
                  transform: "translateX(-50%)",
                  width: "12px", height: "12px",
                  borderRadius: "50%", backgroundColor: "#22d3ee",
                }}
              />
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <span className="text-slate-400 text-sm tracking-[0.3em] uppercase">Loading</span>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              className="text-cyan-400 text-sm"
            >
              .
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// SITE LOADING - personalized with user monogram
// ============================================================
export default function LoadingScreen({ onComplete, user }) {
  const [show, setShow] = useState(true);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);

  // Get user initials and color from localStorage
  const prefs = (() => {
    try {
      const saved = localStorage.getItem("user_prefs");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  const getInitials = () => {
    if (prefs?.initials) return prefs.initials;
    if (user?.displayName) {
      const parts = user.displayName.trim().split(" ");
      return (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
    }
    if (user?.email) return user.email[0].toUpperCase();
    return "KI";
  };

  const color1 = prefs?.color1 || "#06b6d4";
  const color2 = prefs?.color2 || "#3b82f6";
  const initials = getInitials().toUpperCase();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) { clearInterval(interval); setPhase(1); return 100; }
        const inc = prev < 70 ? 1.2 : prev < 90 ? 0.6 : 0.3;
        return Math.min(prev + inc, 100);
      });
    }, 30);

    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 800);
    }, 3800);

    return () => { clearInterval(interval); clearTimeout(timer); };
  }, [onComplete]);

  const statusText = () => {
    if (phase === 1) return "Welcome";
    if (progress < 40) return "Initializing...";
    if (progress < 75) return "Loading assets...";
    return "Almost ready...";
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(6,182,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          <motion.div
            animate={{
              background: [
                `radial-gradient(ellipse at 40% 50%, ${color1}15 0%, transparent 60%)`,
                `radial-gradient(ellipse at 60% 50%, ${color2}15 0%, transparent 60%)`,
                `radial-gradient(ellipse at 40% 50%, ${color1}15 0%, transparent 60%)`,
              ],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0"
          />

          <div className="relative z-10 flex flex-col items-center">
            {/* Expanding rings behind hexagon */}
            <div className="relative w-40 h-40 mb-6 flex items-center justify-center">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: [0.5, 1.5 + i * 0.3, 0.5], opacity: [0, 0.3 - i * 0.08, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: i * 0.7 }}
                  style={{
                    position: "absolute",
                    width: 80 + i * 20 + "px",
                    height: 80 + i * 20 + "px",
                    borderRadius: "50%",
                    border: `1px solid ${color1}60`,
                  }}
                />
              ))}

              {/* Hexagon monogram */}
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <motion.div
                  animate={{ filter: ["drop-shadow(0 0 8px " + color1 + "60)", "drop-shadow(0 0 16px " + color1 + "90)", "drop-shadow(0 0 8px " + color1 + "60)"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <HexagonMonogram
                    initials={initials}
                    color1={color1}
                    color2={color2}
                    size={90}
                  />
                </motion.div>
              </motion.div>
            </div>

            {/* Name */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-slate-500 text-xs tracking-[0.5em] uppercase mb-8"
            >
              {user?.displayName || "Showcase Hub"}
            </motion.p>

            {/* Progress bar */}
            <div className="w-56 mb-3">
              <div className="w-full h-px bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: progress + "%",
                    background: `linear-gradient(90deg, ${color1}, ${color2})`,
                  }}
                />
              </div>
            </div>

            <motion.p
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-slate-600 text-xs font-mono tracking-widest"
            >
              {statusText()}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
