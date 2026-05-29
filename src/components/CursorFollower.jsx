import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CursorFollower() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springX = useSpring(cursorX, { stiffness: 120, damping: 18 });
  const springY = useSpring(cursorY, { stiffness: 120, damping: 18 });

  useEffect(() => {
    const move = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [cursorX, cursorY]);

  return (
    <>
      {/* Outer ring */}
      <motion.div
        style={{ left: springX, top: springY }}
        className="fixed pointer-events-none z-[999] -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-cyan-400/60"
      />
      {/* Inner dot */}
      <motion.div
        style={{ left: cursorX, top: cursorY }}
        className="fixed pointer-events-none z-[999] -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-300"
      />
    </>
  );
}
