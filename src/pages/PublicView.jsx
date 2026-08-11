import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import defaultProjects from "../data/projects";

// ============================================================
// MINI IMAGE CAROUSEL
// ============================================================
function MiniCarousel({ images, title }) {
  const [current, setCurrent] = useState(0);
  const safeImages = Array.isArray(images) && images.length > 0
    ? images
    : [`https://placehold.co/600x400/0f172a/06b6d4?text=${encodeURIComponent(title)}`];
  const hasMultiple = safeImages.length > 1;

  return (
    <div className="relative h-44 overflow-hidden bg-slate-800 rounded-t-2xl">
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={safeImages[current]}
          alt={title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full object-cover"
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
      {hasMultiple && (
        <>
          <button aria-label="Previous image" onClick={() => setCurrent((p) => p === 0 ? safeImages.length - 1 : p - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 text-white text-xs flex items-center justify-center backdrop-blur-sm"
          >‹</button>
          <button aria-label="Next image" onClick={() => setCurrent((p) => p === safeImages.length - 1 ? 0 : p + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 text-white text-xs flex items-center justify-center backdrop-blur-sm"
          >›</button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {safeImages.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all ${i === current ? "bg-cyan-400 w-4" : "bg-white/40 w-1.5"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// PROJECT CARD (view only)
// ============================================================
function ViewCard({ project, index }) {
  const images = Array.isArray(project.images) && project.images.length > 0
    ? project.images
    : project.image ? [project.image] : [];

  const statusColors = {
    Live: "bg-green-500/10 text-green-400 border-green-500/30",
    "In Progress": "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    Planned: "bg-slate-500/10 text-slate-400 border-slate-500/30",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="bg-slate-900/60 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-cyan-500/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]"
    >
      <div className="relative">
        <MiniCarousel images={images} title={project.title} />
        <div className="absolute top-3 right-3 z-10">
          <span className={`text-xs px-2 py-1 rounded-md border backdrop-blur-sm ${statusColors[project.status] || statusColors["Planned"]}`}>
            {project.status}
          </span>
        </div>
        <div className="absolute top-3 left-3 z-10">
          <span className="text-xs text-white bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm">
            {project.year}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {project.tags?.map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              {tag}
            </span>
          ))}
        </div>
        <h3 className="text-white font-bold text-base mb-1">{project.title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed mb-3 line-clamp-2">{project.description}</p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tech?.slice(0, 4).map((t) => (
            <span key={t} className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-md">{t}</span>
          ))}
          {project.tech?.length > 4 && (
            <span className="text-xs text-slate-500 px-2 py-1">+{project.tech.length - 4} more</span>
          )}
        </div>
        <div className="flex gap-2">
          {project.github && project.github !== "#" && (
            <a href={project.github} target="_blank" rel="noreferrer"
              className="flex-1 text-center text-xs tracking-widest uppercase py-2 border border-slate-700 text-slate-400 rounded-lg hover:border-slate-500 transition-all"
            >
              GitHub
            </a>
          )}
          {project.live && project.live !== "#" && (
            <a href={project.live} target="_blank" rel="noreferrer"
              className="flex-1 text-center text-xs tracking-widest uppercase py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-lg hover:bg-cyan-500/20 transition-all"
            >
              Live Demo
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// MAIN PUBLIC VIEW
// ============================================================
export default function PublicView() {
  const { username } = useParams();
  const [prefs, setPrefs] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Load from localStorage (same device only for now)
    try {
      const savedPrefs = localStorage.getItem("user_prefs");
      const parsedPrefs = savedPrefs ? JSON.parse(savedPrefs) : null;

      if (!parsedPrefs) {
        setNotFound(true);
        return;
      }

      // Match username (case insensitive)
      const storedUsername = (parsedPrefs.username || parsedPrefs.displayName || "").toLowerCase();
      const requestedUsername = (username || "").toLowerCase();

      if (storedUsername !== requestedUsername && requestedUsername !== "preview") {
        setNotFound(true);
        return;
      }

      setPrefs(parsedPrefs);

      // Load projects
      const savedCustom = localStorage.getItem("custom_projects");
      const customProjects = savedCustom ? JSON.parse(savedCustom) : [];
      const deletedDefaults = (() => {
        try {
          const s = localStorage.getItem("deleted_default_projects");
          return s ? JSON.parse(s) : [];
        } catch { return []; }
      })();
      const visibleDefaults = defaultProjects.filter((p) => !deletedDefaults.includes(p.id));
      setProjects([...visibleDefaults, ...customProjects]);

      // Load skills
      const savedSkills = localStorage.getItem("user_skills");
      if (savedSkills) setSkills(JSON.parse(savedSkills));

    } catch {
      setNotFound(true);
    }
  }, [username]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayName = prefs?.username || prefs?.displayName || "Developer";
  const nameParts = displayName.trim().split(" ");
  const isSingleWord = nameParts.length === 1;
  const color1 = prefs?.color1 || "#06b6d4";
  const color2 = prefs?.color2 || "#3b82f6";
  const tagline = prefs?.tagline || "Developer · Data Engineer · Web3 Builder";
  const stats = prefs?.stats || [
    { value: "3+", label: "Years Exp." },
    { value: "10+", label: "Projects" },
    { value: "5+", label: "Technologies" },
  ];

  // Not found screen
  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-5 text-center">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="text-white font-black text-3xl mb-3">Profile Not Found</h1>
        <p className="text-slate-400 text-sm mb-6 max-w-sm">
          The portfolio you're looking for doesn't exist or hasn't been made public yet.
        </p>
        <Link to="/welcome"
          className="text-xs tracking-widest uppercase px-6 py-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-400 transition-all"
        >
          Create Your Own →
        </Link>
      </div>
    );
  }

  if (!prefs) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* View-only banner */}
      <div className="bg-cyan-500/10 border-b border-cyan-500/20 px-5 py-2 flex items-center justify-between">
        <p className="text-cyan-400 text-xs tracking-widest uppercase">
          👁️ View Only — Portfolio of {displayName}
        </p>
        <div className="flex items-center gap-3">
          <button onClick={handleCopyLink}
            className="text-xs tracking-widest uppercase text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {copied ? "✓ Copied!" : "🔗 Copy Link"}
          </button>
          <Link to="/welcome"
            className="text-xs tracking-widest uppercase text-slate-500 hover:text-slate-300 transition-colors"
          >
            Create Yours →
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            animate={{
              background: [
                "radial-gradient(ellipse at 20% 50%, rgba(6,182,212,0.08) 0%, transparent 60%)",
                "radial-gradient(ellipse at 80% 50%, rgba(139,92,246,0.08) 0%, transparent 60%)",
                "radial-gradient(ellipse at 20% 50%, rgba(6,182,212,0.08) 0%, transparent 60%)",
              ],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute inset-0"
          />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "linear-gradient(rgba(6,182,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />
        </div>

        <div className="relative z-10 px-5 md:px-16 pt-16 pb-16 max-w-4xl mx-auto text-center">
          {/* Profile image or monogram */}
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}
            className="flex justify-center mb-6"
          >
            {prefs.profileImage ? (
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-cyan-500/40"
                style={{ boxShadow: `0 0 30px ${color1}40` }}
              >
                <img src={prefs.profileImage} alt={displayName} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full flex items-center justify-center text-white font-black text-2xl"
                style={{ background: `linear-gradient(135deg, ${color1}, ${color2})`, boxShadow: `0 0 30px ${color1}40` }}
              >
                {prefs.initials || displayName[0]?.toUpperCase() || "S"}
              </div>
            )}
          </motion.div>

          {/* Name */}
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black leading-none mb-4"
          >
            {isSingleWord ? (
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: `linear-gradient(90deg, ${color1}, ${color2})` }}
              >
                {nameParts[0]}
              </span>
            ) : (
              <>
                <span className="text-white">{nameParts[0]}</span>
                <br />
                <span className="text-transparent bg-clip-text"
                  style={{ backgroundImage: `linear-gradient(90deg, ${color1}, ${color2})` }}
                >
                  {nameParts.slice(1).join(" ")}
                </span>
              </>
            )}
          </motion.h1>

          {/* Tagline */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-slate-400 text-xs tracking-widest uppercase mb-6"
          >
            {tagline}
          </motion.p>

          {/* Stats */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="flex justify-center gap-8 mb-8"
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-bold text-transparent bg-clip-text"
                  style={{ backgroundImage: `linear-gradient(135deg, ${color1}, ${color2})` }}
                >
                  {stat.value}
                </p>
                <p className="text-slate-500 text-xs tracking-wider uppercase">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Skills */}
          {skills.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
              className="flex flex-wrap justify-center gap-2 mb-2"
            >
              {skills.slice(0, 10).map((skill) => (
                <span key={skill.id || skill.name}
                  className="text-xs px-3 py-1.5 rounded-full border border-slate-700 text-slate-400 bg-slate-900/60"
                >
                  {skill.name}
                </span>
              ))}
              {skills.length > 10 && (
                <span className="text-xs px-3 py-1.5 rounded-full border border-slate-700 text-slate-500">
                  +{skills.length - 10} more
                </span>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Projects */}
      <div className="px-5 md:px-10 lg:px-20 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mb-8 text-center"
        >
          <p className="text-cyan-400 text-xs tracking-[0.3em] uppercase mb-2 font-semibold">✦ Portfolio</p>
          <h2 className="text-3xl md:text-4xl font-black text-white">Projects</h2>
        </motion.div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {projects.map((project, index) => (
              <ViewCard key={project.id} project={project} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-slate-800 rounded-2xl">
            <p className="text-slate-500">No projects added yet.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 px-5 py-6 text-center">
        <p className="text-slate-600 text-xs mb-2">
          Portfolio powered by <span className="text-cyan-500">Showcase Hub</span>
        </p>
        <Link to="/welcome"
          className="text-xs tracking-widest uppercase text-slate-500 hover:text-cyan-400 transition-colors"
        >
          Create your own showcase →
        </Link>
      </div>
    </div>
  );
}
