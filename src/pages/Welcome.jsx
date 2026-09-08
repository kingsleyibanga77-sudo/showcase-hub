import { useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const FEATURES = [
  { icon: "🗂️", title: "Showcase Projects", desc: "Display your work in a beautifully designed case study format. Tell the full story — problem, solution, process, results.", color: "from-cyan-500/20 to-blue-500/20", border: "border-cyan-500/20 hover:border-cyan-500/50", glow: "rgba(6,182,212,0.15)" },
  { icon: "🧠", title: "Track Your Skills", desc: "Visualize your proficiency across languages and tools. Filter projects by skill and watch your growth over time.", color: "from-violet-500/20 to-purple-500/20", border: "border-violet-500/20 hover:border-violet-500/50", glow: "rgba(139,92,246,0.15)" },
  { icon: "🔗", title: "GitHub Integration", desc: "Automatically pull your latest repositories from GitHub. Your showcase stays fresh without any manual updates.", color: "from-blue-500/20 to-indigo-500/20", border: "border-blue-500/20 hover:border-blue-500/50", glow: "rgba(59,130,246,0.15)" },
  { icon: "✦", title: "Personalized Identity", desc: "Your own hexagon monogram, custom colors, and a loading screen that's uniquely yours. No two profiles look the same.", color: "from-pink-500/20 to-rose-500/20", border: "border-pink-500/20 hover:border-pink-500/50", glow: "rgba(236,72,153,0.15)" },
];

const STEPS = [
  { title: "Create Account", desc: "Sign up with email or Google in seconds. No credit card required.", icon: "🔐" },
  { title: "Set Up Profile", desc: "Enter your name, pick your monogram colors and personalize your identity.", icon: "🎨" },
  { title: "Start Showcasing", desc: "Add projects, connect GitHub and let your work speak for itself.", icon: "🚀" },
];

const STATS = [
  { value: 10, suffix: "+", label: "Project Templates" },
  { value: 40, suffix: "+", label: "Skills Tracked" },
  { value: 100, suffix: "%", label: "Customizable" },
  { value: 1, suffix: " Click", label: "GitHub Sync" },
];

const MARQUEE_ITEMS = [
  "React", "Node.js", "Python", "Solidity", "Web3", "Tailwind CSS",
  "Framer Motion", "Firebase", "GitHub API", "TypeScript", "MongoDB",
  "PostgreSQL", "Docker", "AWS", "Figma", "Next.js", "Express.js",
];

const FOOTER_LINKS = {
  Platform: [
    { label: "Get Started", to: "/login" },
    { label: "Projects Showcase", to: "/projects" },
    { label: "Skills Tracker", to: "/projects" },
    { label: "GitHub Sync", to: "/settings" },
    { label: "Personalization", to: "/settings" },
  ],
  "Stay Connected": [
    { label: "GitHub", href: "https://github.com", external: true },
    { label: "LinkedIn", href: "https://linkedin.com", external: true },
    { label: "Twitter / X", href: "https://x.com", external: true },
    { label: "YouTube", href: "https://youtube.com", external: true },
  ],
  Support: [
    { label: "Report a Bug", to: "/support" },
    { label: "FAQs", to: "/support" },
    { label: "Contact Support", to: "/support" },
    { label: "Release Notes", href: "https://github.com/showcase-hub-app/showcase-hub/releases", external: true },
  ],
  Legal: [
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Terms of Service", to: "/terms" },
    { label: "Cookie Policy", to: "/privacy" },
  ],
};

function Counter({ value, suffix }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / 1800, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(value);
    };
    requestAnimationFrame(step);
  }, [inView, value]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function Marquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="overflow-hidden py-4 relative">
      <div className="absolute left-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-r from-[#07071a] to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-l from-[#07071a] to-transparent z-10" />
      <motion.div animate={{ x: [0, -50 * MARQUEE_ITEMS.length] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="flex gap-3 whitespace-nowrap">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/20 text-slate-400 text-xs md:text-sm bg-violet-500/5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function FeatureCard({ feature, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, boxShadow: `0 20px 60px ${feature.glow}` }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className={`relative rounded-2xl border p-5 md:p-6 bg-gradient-to-br ${feature.color} ${feature.border} transition-all duration-300 overflow-hidden`}
    >
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
      <div className="relative z-10">
        <span className="text-3xl md:text-4xl mb-3 md:mb-4 block">{feature.icon}</span>
        <h3 className="text-white font-black text-base md:text-lg mb-2">{feature.title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
      </div>
    </motion.div>
  );
}

function MockPreview() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ["Loading", "Projects", "Skills", "Case Study"];

  const previews = [
    <div className="bg-slate-950 rounded-xl p-6 flex flex-col items-center justify-center h-40 md:h-48">
      <div className="w-14 h-14 mb-3 relative flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border border-dashed border-cyan-500/30" />
        <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-black text-xs">SH</div>
      </div>
      <p className="text-slate-500 text-xs tracking-widest uppercase">Loading assets...</p>
      <div className="w-28 h-px bg-slate-800 mt-3 overflow-hidden rounded-full">
        <motion.div animate={{ width: ["0%", "100%"] }} transition={{ duration: 2, repeat: Infinity }} className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" />
      </div>
    </div>,

    <div className="bg-slate-950 rounded-xl p-3 h-40 md:h-48 overflow-hidden">
      <p className="text-cyan-400 text-xs tracking-widest uppercase mb-2">✦ My Work</p>
      <div className="grid grid-cols-3 gap-1.5">
        {["Portfolio", "Expense", "Web3"].map((p, i) => (
          <div key={i} className="bg-slate-900 rounded-lg p-1.5 border border-slate-800">
            <div className="h-8 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded mb-1.5" />
            <p className="text-white text-xs font-bold truncate">{p}</p>
            <p className="text-slate-600 text-[10px]">React</p>
          </div>
        ))}
      </div>
    </div>,

    <div className="bg-slate-950 rounded-xl p-3 h-40 md:h-48">
      <p className="text-cyan-400 text-xs tracking-widest uppercase mb-2">✦ Skills</p>
      <div className="space-y-2">
        {[["React", 70], ["Python", 65], ["Web3", 60], ["Node", 65]].map(([skill, level]) => (
          <div key={skill} className="flex items-center gap-2">
            <span className="text-slate-400 text-xs w-12">{skill}</span>
            <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} whileInView={{ width: `${level}%` }} viewport={{ once: true }} transition={{ duration: 1 }} className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" />
            </div>
            <span className="text-cyan-400 text-xs">{level}%</span>
          </div>
        ))}
      </div>
    </div>,

    <div className="bg-slate-950 rounded-xl p-3 h-40 md:h-48">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400">Live</span>
        <span className="text-slate-600 text-xs">2026</span>
      </div>
      <p className="text-white font-black text-base mb-2">Portfolio Site</p>
      <div className="space-y-1.5">
        {["01 — Problem", "02 — Solution", "03 — Process"].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-slate-600 text-xs">{s}</span>
          </div>
        ))}
      </div>
    </div>,
  ];

  return (
    <div className="bg-[#0d0d1f] border border-violet-500/20 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(139,92,246,0.1)]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800/50 bg-slate-900/50">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        <div className="flex-1 mx-2 bg-slate-800 rounded-md px-2 py-1 text-[10px] text-slate-500 truncate">localhost:3000</div>
      </div>
      <div className="flex border-b border-slate-800/50 overflow-x-auto">
        {tabs.map((tab, i) => (
          <button key={i} onClick={() => setActiveTab(i)}
            className={`flex-shrink-0 flex-1 py-2 text-[10px] md:text-xs transition-all ${activeTab === i ? "text-violet-400 border-b border-violet-500" : "text-slate-600 hover:text-slate-400"}`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="p-3 md:p-4">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {previews[activeTab]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================
// FOOTER
// ============================================================
function FAQItem({ item, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04 }}
      className="border border-white/10 rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white/5 hover:bg-white/10 transition-colors"
      >
        <span className="text-white font-semibold text-sm pr-4">{item.q}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-slate-400 flex-shrink-0 text-xs"
        >▾</motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 py-4 bg-white/[0.02] border-t border-white/10">
              <p className="text-slate-400 text-sm leading-relaxed">{item.a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Footer() {
function Footer() {
  // Load user social links if logged in
  const prefs = (() => {
    try {
      const saved = localStorage.getItem("user_prefs");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  })();

  const socialLinks = [
    {
      label: "GitHub",
      href: prefs?.githubUsername
        ? `https://github.com/${prefs.githubUsername}`
        : "https://github.com",
    },
    {
      label: "LinkedIn",
      href: prefs?.linkedinUrl
        ? `https://linkedin.com/in/${prefs.linkedinUrl}`
        : "https://linkedin.com",
    },
    {
      label: "Twitter / X",
      href: prefs?.twitterUrl
        ? `https://x.com/${prefs.twitterUrl}`
        : "https://x.com",
    },
    {
      label: "YouTube",
      href: prefs?.youtubeUrl
        ? `https://youtube.com/${prefs.youtubeUrl}`
        : "https://youtube.com",
    },
  ];

  const dynamicFooterLinks = {
    ...FOOTER_LINKS,
    "Stay Connected": socialLinks.map((s) => ({ ...s, external: true })),
  };

  return (
    <footer className="border-t border-white/5 bg-[#050512]">
      {/* Main footer links */}
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
          {Object.entries(dynamicFooterLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-white font-bold text-sm mb-4">{section}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a href={link.href} target="_blank" rel="noreferrer"
                        className="text-slate-500 hover:text-violet-400 text-sm transition-colors duration-200"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link to={link.to} className="text-slate-500 hover:text-violet-400 text-sm transition-colors duration-200">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="font-black text-lg text-white">
              SH<span className="text-violet-400">.</span>
            </span>
            <span className="text-slate-600 text-xs">Showcase Hub</span>
          </div>

          <p className="text-slate-600 text-xs text-center">
            © {new Date().getFullYear()} Showcase Hub. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer"
              className="text-slate-600 hover:text-violet-400 text-xs transition-colors"
            >
              GitHub
            </a>
            <span className="text-slate-800">·</span>
            <Link to="/privacy" className="text-slate-600 hover:text-violet-400 text-xs transition-colors">Privacy</Link>
            <span className="text-slate-800">·</span>
            <Link to="/terms" className="text-slate-600 hover:text-violet-400 text-xs transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================================
// MAIN WELCOME PAGE
// ============================================================
export default function Welcome() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <div className="min-h-screen bg-[#07071a] text-white overflow-x-hidden">

      {/* NAVBAR */}
      <motion.nav initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-5 md:px-8 py-4 bg-[#07071a]/80 backdrop-blur-md border-b border-white/5"
      >
        <div className="font-black text-lg md:text-xl">
          SH<span className="text-violet-400">.</span>
          <span className="text-slate-500 text-xs md:text-sm font-normal ml-1 md:ml-2 hidden sm:inline">Showcase</span>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Link to="/login" className="text-xs tracking-widest uppercase text-slate-400 hover:text-white transition-colors hidden sm:block">Sign In</Link>
          <Link to="/login" className="text-xs tracking-widest uppercase px-4 md:px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)]">
            Get Started
          </Link>
        </div>
      </motion.nav>

      {/* HERO */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-5 md:px-8 text-center overflow-hidden pt-20">
        <div className="absolute inset-0">
          <motion.div
            animate={{ background: ["radial-gradient(ellipse at 30% 40%, rgba(139,92,246,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(6,182,212,0.08) 0%, transparent 60%)", "radial-gradient(ellipse at 70% 40%, rgba(139,92,246,0.12) 0%, transparent 60%), radial-gradient(ellipse at 30% 60%, rgba(6,182,212,0.08) 0%, transparent 60%)", "radial-gradient(ellipse at 30% 40%, rgba(139,92,246,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(6,182,212,0.08) 0%, transparent 60%)"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0"
          />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        <motion.div style={{ y: heroY }} className="relative z-10 max-w-4xl w-full">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs tracking-widest uppercase mb-6 md:mb-8"
          >
            <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            Your Developer Showcase Platform
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-7xl font-black leading-none mb-4 md:mb-6"
          >
            Show the world
            <br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }}>
              what you've built
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8 md:mb-10 px-2"
          >
            Showcase Hub is a personal developer portfolio platform. Showcase your projects as case studies, track your skills, sync with GitHub, and present yourself like a pro.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link to="/login" className="px-7 md:px-8 py-3 md:py-4 rounded-xl font-bold text-sm tracking-widest uppercase text-white text-center transition-all shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:scale-105"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }}
            >
              Get Started — Free
            </Link>
            <a href="#features" className="px-7 md:px-8 py-3 md:py-4 rounded-xl font-bold text-sm tracking-widest uppercase border border-white/10 text-slate-300 hover:border-violet-500/50 hover:text-white transition-all hover:scale-105 text-center">
              See Features →
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
            className="flex flex-wrap justify-center gap-2 md:gap-3 mt-8 md:mt-12"
          >
            {["✓ Free to use", "✓ GitHub sync", "✓ Personalized monogram", "✓ Dark & light mode"].map((badge) => (
              <span key={badge} className="text-xs text-slate-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">{badge}</span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* STATS */}
      <section className="py-12 md:py-16 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto px-5 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {STATS.map(({ value, suffix, label }, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
              <p className="text-2xl md:text-3xl font-black text-transparent bg-clip-text mb-1" style={{ backgroundImage: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }}>
                <Counter value={value} suffix={suffix} />
              </p>
              <p className="text-slate-500 text-xs tracking-widest uppercase">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-16 md:py-24 px-5 md:px-8 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10 md:mb-16">
          <p className="text-violet-400 text-xs tracking-[0.4em] uppercase mb-3 font-semibold">✦ What You Get</p>
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            Everything you need to
            <br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }}>stand out</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">Built specifically for developers who want their work to make an impression.</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
          {FEATURES.map((feature, i) => <FeatureCard key={i} feature={feature} index={i} />)}
        </div>
      </section>

      {/* PREVIEW */}
      <section className="py-16 md:py-24 px-5 md:px-8 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8 md:mb-12">
          <p className="text-violet-400 text-xs tracking-[0.4em] uppercase mb-3 font-semibold">✦ See It In Action</p>
          <h2 className="text-3xl md:text-4xl font-black mb-3">A peek inside</h2>
          <p className="text-slate-400 text-sm">Click the tabs to explore different parts of the platform.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <MockPreview />
        </motion.div>
      </section>

      {/* MARQUEE */}
      <section className="py-12 md:py-16 border-y border-white/5 bg-white/[0.02]">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-6 md:mb-8">
          <p className="text-slate-500 text-xs tracking-[0.4em] uppercase px-4">Track skills across all major technologies</p>
        </motion.div>
        <Marquee />
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 md:py-24 px-5 md:px-8 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10 md:mb-16">
          <p className="text-violet-400 text-xs tracking-[0.4em] uppercase mb-3 font-semibold">✦ How It Works</p>
          <h2 className="text-3xl md:text-5xl font-black">
            Up and running in
            <span className="text-transparent bg-clip-text ml-2 md:ml-3" style={{ backgroundImage: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }}>minutes</span>
          </h2>
        </motion.div>
        <div className="grid sm:grid-cols-3 gap-6">
          {STEPS.map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-xl md:text-2xl relative"
                style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.2))", border: "1px solid rgba(139,92,246,0.3)" }}
              >
                {step.icon}
                <span className="absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 rounded-full text-xs font-black flex items-center justify-center text-white"
                  style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }}
                >{i + 1}</span>
              </div>
              <h3 className="text-white font-black text-base md:text-lg mb-2">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 px-5 md:px-8 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10 md:mb-16">
          <p className="text-violet-400 text-xs tracking-[0.4em] uppercase mb-3 font-semibold">✦ FAQ</p>
          <h2 className="text-3xl md:text-5xl font-black mb-4">Common Questions</h2>
          <p className="text-slate-400 text-sm">Everything you need to know about Showcase Hub.</p>
        </motion.div>
        <div className="space-y-3">
          {[
            { q: "Is Showcase Hub free?", a: "Yes, completely free. Create an account and start showcasing your projects with no credit card required." },
            { q: "Who can see my projects?", a: "By default your showcase is private. You can share a public view-only link with anyone — they can browse your projects without making any changes." },
            { q: "Can I use this as my portfolio?", a: "Absolutely. That's exactly what it's built for. Share your public link with recruiters, clients or anyone you want to impress." },
            { q: "What happens to my data?", a: "Your data is stored securely in Firebase Firestore and syncs across all your devices. It's tied to your account and only accessible by you." },
            { q: "Can I add projects without images?", a: "Yes. If you don't upload images, a placeholder with your project name is shown. You can always add images later by editing the project." },
            { q: "How do I connect my GitHub?", a: "Go to Settings → Profile and enter your GitHub username. Your latest repositories will automatically appear on your Projects page." },
            { q: "Can I delete a project?", a: "Yes. Hover over any project card and a delete button appears. Default projects can be hidden and restored later from Settings → Personalization." },
            { q: "What is the difference between Full Name and Display Name?", a: "Your Full Name is set once during onboarding and is permanent — it's used for your monogram initials. Your Display Name is shown on your Landing page and can be changed freely." },
            { q: "Can I customize the look of my showcase?", a: "Yes. Go to Settings → Personalization to change your monogram colors, tagline, floating skill badges and stats." },
            { q: "Can I use this on my phone?", a: "Yes. Showcase Hub is fully mobile responsive and works on all screen sizes and browsers." },
            { q: "How do I report a bug?", a: "Go to the Support page from the navbar once logged in. You can submit bug reports, feature requests or general feedback." },
          ].map((item, i) => (
            <FAQItem key={i} item={item} index={i} />
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 md:py-24 px-5 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            animate={{ background: ["radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.15) 0%, transparent 70%)", "radial-gradient(ellipse at 50% 50%, rgba(6,182,212,0.12) 0%, transparent 70%)", "radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.15) 0%, transparent 70%)"] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute inset-0"
          />
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative z-10 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            Ready to showcase
            <br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }}>your work?</span>
          </h2>
          <p className="text-slate-400 mb-8 md:mb-10 leading-relaxed text-sm md:text-base px-2">
            Join and start building your developer showcase today. Free, personalized, and built for developers like you.
          </p>
          <Link to="/login" className="inline-block px-8 md:px-10 py-3 md:py-4 rounded-xl font-bold text-sm tracking-widest uppercase text-white transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)", boxShadow: "0 0 40px rgba(139,92,246,0.4)" }}
          >
            Get Started — It's Free →
          </Link>
        </motion.div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
