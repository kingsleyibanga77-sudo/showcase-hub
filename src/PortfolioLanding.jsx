import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

// ============================================================
// CURSOR FOLLOWER
// ============================================================
function CursorFollower() {
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
      {/* Outer glow ring */}
      <motion.div
        style={{ left: springX, top: springY }}
        className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-cyan-400/60 mix-blend-screen"
      />
      {/* Inner dot */}
      <motion.div
        style={{ left: cursorX, top: cursorY }}
        className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-300"
      />
    </>
  );
}

// ============================================================
// SPOTLIGHT BUTTON
// ============================================================
function SpotlightButton({ children, href, primary }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative inline-block"
    >
      {/* Darkening overlay on surrounding area */}
      {hovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-10 pointer-events-none"
        />
      )}
      <motion.span
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.97 }}
        className={`relative z-20 inline-block px-8 py-3 rounded-xl font-semibold text-sm tracking-widest uppercase transition-all duration-300 cursor-pointer ${
          primary
            ? "bg-cyan-500 text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:shadow-[0_0_50px_rgba(34,211,238,0.8)]"
            : "border border-cyan-500/60 text-cyan-300 hover:border-cyan-300 hover:bg-cyan-500/10"
        }`}
      >
        {children}
      </motion.span>
    </a>
  );
}

// ============================================================
// FLOATING PROFILE IMAGE
// ============================================================
function FloatingImage() {
  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Animated gradient rings */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute w-72 h-72 rounded-full border border-cyan-500/20"
        style={{ borderStyle: "dashed" }}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute w-56 h-56 rounded-full border border-blue-400/30"
        style={{ borderStyle: "dashed" }}
      />

      {/* Glow pulse */}
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-48 h-48 rounded-full bg-cyan-500/20 blur-2xl"
      />

      {/* Profile image container - floating animation */}
      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 w-44 h-44 rounded-full p-[3px]"
        style={{
          background: "linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6)",
        }}
      >
        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
          {/* Replace src with your actual photo */}
          <img
            src="https://placehold.co/200x200/0f172a/06b6d4?text=KI"
            alt="Kingsley Ibanga"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      </motion.div>

      {/* Floating tech badges */}
      {[
        { label: "React", angle: 0, radius: 130 },
        { label: "Node.js", angle: 72, radius: 130 },
        { label: "Web3", angle: 144, radius: 130 },
        { label: "Python", angle: 216, radius: 130 },
        { label: "Data", angle: 288, radius: 130 },
      ].map(({ label, angle, radius }) => {
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;
        return (
          <motion.div
            key={label}
            animate={{ y: [y - 4, y + 4, y - 4] }}
            transition={{
              duration: 3 + angle * 0.01,
              repeat: Infinity,
              ease: "easeInOut",
              delay: angle * 0.01,
            }}
            style={{ position: "absolute", left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
            className="-translate-x-1/2 -translate-y-1/2 bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs px-2 py-1 rounded-lg backdrop-blur-sm"
          >
            {label}
          </motion.div>
        );
      })}
    </div>
  );
}

// ============================================================
// HERO SECTION (Split Panel)
// ============================================================
function Hero() {
  const ref = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [8, -8]), { stiffness: 80, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-8, 8]), { stiffness: 80, damping: 20 });

  const handleMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  return (
    <section
      ref={ref}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen grid md:grid-cols-2 overflow-hidden"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{
            background: [
              "radial-gradient(ellipse at 20% 50%, rgba(6,182,212,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.1) 0%, transparent 60%)",
              "radial-gradient(ellipse at 60% 80%, rgba(139,92,246,0.12) 0%, transparent 60%), radial-gradient(ellipse at 20% 20%, rgba(6,182,212,0.08) 0%, transparent 60%)",
              "radial-gradient(ellipse at 20% 50%, rgba(6,182,212,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.1) 0%, transparent 60%)",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0"
        />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(rgba(6,182,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Divider line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent hidden md:block z-10" />

      {/* LEFT PANEL - Text */}
      <motion.div
        style={{ rotateX, rotateY, transformPerspective: 1000 }}
        className="relative z-10 flex flex-col justify-center px-10 md:px-16 py-24"
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-cyan-400 text-xs tracking-[0.3em] uppercase mb-4 font-medium"
        >
          ✦ Welcome to my portfolio
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-5xl md:text-6xl font-black mb-2 leading-none"
          style={{ fontFamily: "'Segoe UI', sans-serif" }}
        >
          <span className="text-white">Kingsley</span>
          <br />
          <span
            className="text-transparent bg-clip-text"
            style={{ backgroundImage: "linear-gradient(90deg, #06b6d4, #3b82f6)" }}
          >
            Ibanga
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-3 my-5"
        >
          <div className="h-px w-8 bg-cyan-500" />
          <p className="text-slate-400 text-sm tracking-widest uppercase">
            Developer · Data Engineer · Web3 Builder
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-slate-500 max-w-sm leading-relaxed mb-10 text-sm"
        >
          I craft scalable systems, data-driven solutions, and modern Web3
          applications. Let's build something extraordinary.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex gap-4 flex-wrap"
        >
          <SpotlightButton href="#projects" primary>
            Explore Work
          </SpotlightButton>
          <SpotlightButton href="#contact">
            Contact Me
          </SpotlightButton>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex gap-8 mt-12"
        >
          {[["3+", "Years Exp."], ["15+", "Projects"], ["5+", "Technologies"]].map(([num, label]) => (
            <div key={label}>
              <p className="text-2xl font-bold text-cyan-400">{num}</p>
              <p className="text-slate-500 text-xs tracking-wider uppercase">{label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* RIGHT PANEL - Floating Image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 flex items-center justify-center py-24"
      >
        <FloatingImage />
      </motion.div>
    </section>
  );
}

// ============================================================
// NAVBAR
// ============================================================
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-40 flex justify-between items-center px-10 py-4 transition-all duration-300 ${
        scrolled ? "bg-slate-950/90 backdrop-blur-md border-b border-slate-800/60" : ""
      }`}
    >
      <div className="text-white font-black text-xl tracking-tight">
        KI<span className="text-cyan-400">.</span>
      </div>
      <div className="flex gap-8 text-sm text-slate-400">
        {["Projects", "About", "Contact"].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            className="hover:text-cyan-400 transition-colors duration-200 tracking-wider uppercase text-xs"
          >
            {item}
          </a>
        ))}
      </div>
    </motion.nav>
  );
}

// ============================================================
// PROJECTS
// ============================================================
const projects = [
  { title: "Project One", desc: "A scalable web platform built with React and Node.js.", tech: ["React", "Node.js", "MongoDB"] },
  { title: "Project Two", desc: "Blockchain-based solution using Solidity smart contracts.", tech: ["Solidity", "Web3.js", "Ethereum"] },
  { title: "Project Three", desc: "End-to-end data engineering pipeline with real-time analytics.", tech: ["Python", "Apache Kafka", "PostgreSQL"] },
];

function Projects() {
  return (
    <section id="projects" className="px-10 md:px-20 py-24 border-t border-slate-800/50">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <p className="text-cyan-400 text-xs tracking-[0.3em] uppercase mb-2">✦ Portfolio</p>
        <h2 className="text-4xl font-black text-white mb-12">Selected Work</h2>
      </motion.div>
      <div className="grid md:grid-cols-3 gap-6">
        {projects.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="group relative bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]"
          >
            <div className="absolute top-4 right-4 text-slate-600 group-hover:text-cyan-400 transition-colors text-lg">→</div>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">{p.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">{p.desc}</p>
            <div className="flex flex-wrap gap-2">
              {p.tech.map((t) => (
                <span key={t} className="text-xs text-cyan-400/70 bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 rounded-md">
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ============================================================
// ABOUT
// ============================================================
function About() {
  return (
    <section id="about" className="px-10 md:px-20 py-24 border-t border-slate-800/50">
      <div className="max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-cyan-400 text-xs tracking-[0.3em] uppercase mb-2">✦ About</p>
          <h2 className="text-4xl font-black text-white mb-6">Who I Am</h2>
          <p className="text-slate-400 leading-relaxed mb-4">
            I'm a Software and Web Developer specializing in building efficient systems,
            data-driven solutions, and blockchain applications. I enjoy solving complex
            problems and turning ideas into reality.
          </p>
          <p className="text-slate-500 leading-relaxed">
            When I'm not coding, I'm exploring emerging technologies in Web3,
            sharpening my skills, and working on projects that push boundaries.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// CONTACT
// ============================================================
function Contact() {
  return (
    <section id="contact" className="px-10 md:px-20 py-24 border-t border-slate-800/50">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <p className="text-cyan-400 text-xs tracking-[0.3em] uppercase mb-2">✦ Let's Talk</p>
        <h2 className="text-4xl font-black text-white mb-4">Get In Touch</h2>
        <p className="text-slate-500 mb-8 max-w-md">
          Have a project in mind or want to collaborate? I'd love to hear from you.
        </p>
        <div className="flex gap-4 flex-wrap">
          <SpotlightButton href="mailto:youremail@gmail.com" primary>Email Me</SpotlightButton>
          <SpotlightButton href="https://linkedin.com/in/yourprofile">LinkedIn</SpotlightButton>
          <SpotlightButton href="https://github.com/yourusername">GitHub</SpotlightButton>
        </div>
      </motion.div>
    </section>
  );
}

// ============================================================
// FOOTER
// ============================================================
function Footer() {
  return (
    <footer className="px-10 md:px-20 py-8 border-t border-slate-800/50 flex justify-between items-center text-slate-600 text-xs">
      <span>© 2026 Kingsley Ibanga</span>
      <span className="text-cyan-500/50">Designed & Built with React</span>
    </footer>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function PortfolioLanding() {
  return (
    <div className="bg-slate-950 text-white min-h-screen cursor-none">
      <CursorFollower />
      <Navbar />
      <Hero />
      <Projects />
      <About />
      <Contact />
      <Footer />
    </div>
  );
}
