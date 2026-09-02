import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CursorFollower() {
  const [enabled, setEnabled] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springX = useSpring(cursorX, { stiffness: 120, damping: 18 });
  const springY = useSpring(cursorY, { stiffness: 120, damping: 18 });

  useEffect(() => {
    const pointerQuery = window.matchMedia("(pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const updateEnabled = () => setEnabled(pointerQuery.matches && motionQuery.matches);
    updateEnabled();
    pointerQuery.addEventListener("change", updateEnabled);
    motionQuery.addEventListener("change", updateEnabled);
    return () => {
      pointerQuery.removeEventListener("change", updateEnabled);
      motionQuery.removeEventListener("change", updateEnabled);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    const move = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [enabled, cursorX, cursorY]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        aria-hidden="true"
        style={{ left: springX, top: springY }}
        className="fixed pointer-events-none z-[999] -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
      />
      <motion.div
        aria-hidden="true"
        style={{ left: cursorX, top: cursorY }}
        className="fixed pointer-events-none z-[999] -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.9)]"
      />
    </>
  );
}
