import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const statusColors = {
  Live: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30",
  "In Progress": "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
  Planned: "bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/30",
  Archived: "bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/30",
};

const tagColors = {
  Web: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  Blockchain: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  Data: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  Web3: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  Mobile: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  AI: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
};

// ============================================================
// IMAGE CAROUSEL — with auto-play
// ============================================================
function ImageCarousel({ images, title }) {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isRandom, setIsRandom] = useState(false);
  const intervalRef = useRef(null);

  const safeImages = Array.isArray(images) && images.length > 0
    ? images
    : ["https://placehold.co/600x400/0f172a/06b6d4?text=No+Image"];
  const hasMultiple = safeImages.length > 1;

  const getNextIndex = useCallback(() => {
    if (isRandom) {
      let next;
      do { next = Math.floor(Math.random() * safeImages.length); }
      while (next === current && safeImages.length > 1);
      return next;
    }
    return (current + 1) % safeImages.length;
  }, [current, isRandom, safeImages.length]);

  // Auto-play
  useEffect(() => {
    if (!hasMultiple || !isPlaying) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => {
        if (isRandom) {
          let next;
          do { next = Math.floor(Math.random() * safeImages.length); }
          while (next === prev && safeImages.length > 1);
          return next;
        }
        return (prev + 1) % safeImages.length;
      });
    }, 3000);
    return () => clearInterval(intervalRef.current);
  }, [hasMultiple, isPlaying, isRandom, safeImages.length]);

  const prev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    clearInterval(intervalRef.current);
    setCurrent((p) => (p === 0 ? safeImages.length - 1 : p - 1));
  };

  const next = (e) => {
    e.preventDefault();
    e.stopPropagation();
    clearInterval(intervalRef.current);
    setCurrent((p) => (p === safeImages.length - 1 ? 0 : p + 1));
  };

  const togglePlay = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPlaying((p) => !p);
  };

  const toggleRandom = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRandom((p) => !p);
  };

  return (
    <div className="relative overflow-hidden h-44 bg-slate-100 dark:bg-slate-800">
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={safeImages[current]}
          alt={title}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = "https://placehold.co/600x400/0f172a/06b6d4?text=No+Image"; }}
        />
      </AnimatePresence>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-transparent to-transparent" />

      {hasMultiple && (
        <>
          {/* Prev/Next arrows */}
          <button onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/50 text-white text-xs flex items-center justify-center hover:bg-black/70 transition-all backdrop-blur-sm"
          >‹</button>
          <button onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/50 text-white text-xs flex items-center justify-center hover:bg-black/70 transition-all backdrop-blur-sm"
          >›</button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1">
            {safeImages.map((_, i) => (
              <button key={i}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrent(i); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "bg-cyan-400 w-4" : "bg-white/50 w-1.5"}`}
              />
            ))}
          </div>

          {/* Top right controls — play/pause + random */}
          <div className="absolute top-3 right-3 z-10 flex gap-1">
            {/* Random toggle */}
            <button onClick={toggleRandom}
              title={isRandom ? "Switch to in-order" : "Switch to random"}
              className={`w-6 h-6 rounded-md text-[10px] flex items-center justify-center transition-all backdrop-blur-sm ${
                isRandom
                  ? "bg-cyan-500/80 text-white"
                  : "bg-black/40 text-white/70 hover:bg-black/60"
              }`}
            >
              🔀
            </button>

            {/* Play/Pause toggle */}
            <button onClick={togglePlay}
              title={isPlaying ? "Pause slideshow" : "Play slideshow"}
              className="w-6 h-6 rounded-md bg-black/40 text-white/70 text-[10px] flex items-center justify-center hover:bg-black/60 transition-all backdrop-blur-sm"
            >
              {isPlaying ? "⏸" : "▶"}
            </button>
          </div>

          {/* Image count */}
          <div className="absolute bottom-3 right-3 z-10">
            <span className="text-[10px] text-white/70 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
              {current + 1}/{safeImages.length}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// DELETE CONFIRM MODAL
// ============================================================
function DeleteModal({ project, onConfirm, onCancel, isDefault }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-red-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-xl flex-shrink-0">🗑️</div>
          <div>
            <h3 className="text-white font-black text-lg">Delete Project</h3>
            <p className="text-slate-500 text-xs">This will hide the project from your showcase.</p>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 mb-4">
          <p className="text-slate-300 text-sm font-semibold truncate">{project.title}</p>
          <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{project.description}</p>
        </div>

        {isDefault && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-3 py-2 mb-4">
            <p className="text-yellow-400 text-xs">
              ⚠️ This is a default project. Deleting it will hide it from your showcase but it can be restored later from Settings.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 border border-slate-700 text-slate-400 rounded-xl text-sm hover:border-slate-600 transition-all"
          >
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-400 transition-all"
          >
            🗑️ Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// PROJECT CARD
// ============================================================
export default function ProjectCard({ project, index, onDelete, isCustom }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const isDefault = !isCustom;

  const images = Array.isArray(project.images) && project.images.length > 0
    ? project.images
    : project.image
    ? [project.image]
    : [];

  const handleConfirmDelete = () => {
    // For custom projects also remove from localStorage
    if (isCustom) {
      try {
        const saved = localStorage.getItem("custom_projects");
        const existing = saved ? JSON.parse(saved) : [];
        const updated = existing.filter((p) => p.id !== project.id);
        localStorage.setItem("custom_projects", JSON.stringify(updated));
        localStorage.removeItem(`project_${project.id}`);
      } catch {}
    }
    setShowDeleteModal(false);
    onDelete && onDelete(project.id);
  };

  return (
    <>
      <AnimatePresence>
        {showDeleteModal && (
          <DeleteModal
            project={project}
            onConfirm={handleConfirmDelete}
            onCancel={() => setShowDeleteModal(false)}
            isDefault={isDefault}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        whileHover={{ y: -6 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        className="group relative bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden hover:border-cyan-400 dark:hover:border-cyan-500/40 transition-all duration-300 hover:shadow-[0_4px_30px_rgba(6,182,212,0.15)] dark:hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]"
      >
        {/* Status badge */}
        <div className="absolute top-3 right-3 z-20">
          <span className={`text-xs px-2 py-1 rounded-md border backdrop-blur-sm ${statusColors[project.status] || statusColors["Planned"]}`}>
            {project.status}
          </span>
        </div>

        {/* Year badge */}
        <div className="absolute top-3 left-3 z-20">
          <span className="text-xs text-white bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm">
            {project.year}
          </span>
        </div>

        {/* Delete button — only for custom projects */}
        {isCustom && (
          <div className="absolute top-10 left-3 z-20">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDeleteModal(true); }}
              className="w-7 h-7 rounded-full bg-red-500/80 text-white text-xs flex items-center justify-center hover:bg-red-500 transition-all backdrop-blur-sm opacity-0 group-hover:opacity-100"
              title="Delete project"
            >
              🗑️
            </motion.button>
          </div>
        )}

        {/* Image Carousel */}
        <ImageCarousel images={images} title={project.title} />

        {/* Content */}
        <div className="p-4 md:p-5">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {project.tags?.map((tag) => (
              <span key={tag} className={`text-xs px-2 py-1 rounded-md border ${
                tagColors[tag] || "bg-slate-100 dark:bg-slate-500/10 text-slate-500 border-slate-200 dark:border-slate-500/20"
              }`}>
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3 className="text-slate-900 dark:text-white font-bold text-base md:text-lg mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-200">
            {project.title}
          </h3>

          {/* Description */}
          <p className="text-slate-500 dark:text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2">
            {project.description}
          </p>

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.tech?.slice(0, 4).map((t) => (
              <span key={t} className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-transparent px-2 py-1 rounded-md">
                {t}
              </span>
            ))}
            {project.tech?.length > 4 && (
              <span className="text-xs text-slate-400 dark:text-slate-600 px-2 py-1">
                +{project.tech.length - 4} more
              </span>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Link to={`/project/${project.id}`}
              className="flex-1 text-center text-xs tracking-widest uppercase py-2 bg-cyan-500/10 border border-cyan-500/40 text-cyan-600 dark:text-cyan-400 rounded-lg hover:bg-cyan-500/20 transition-all duration-200"
            >
              View Details
            </Link>
            <a href={project.github} target="_blank" rel="noreferrer"
              className="flex-1 text-center text-xs tracking-widest uppercase py-2 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-lg hover:border-slate-400 transition-all duration-200"
            >
              GitHub
            </a>
          </div>
        </div>
      </motion.div>
    </>
  );
}
