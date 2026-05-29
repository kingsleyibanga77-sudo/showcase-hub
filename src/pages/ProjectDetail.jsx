import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import defaultProjects from "../data/projects";

const statusColors = {
  Live: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30",
  "In Progress": "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
  Planned: "bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/30",
};

const STATUS_OPTIONS = ["Live", "In Progress", "Planned", "Archived"];
const YEAR_OPTIONS = ["2023", "2024", "2025", "2026", "2027"];
const ALL_TECH = [
  "React", "Node.js", "Python", "Tailwind CSS", "Framer Motion",
  "Solidity", "Ethers.js", "Web3.js", "MongoDB", "PostgreSQL",
  "Firebase", "TypeScript", "Next.js", "Express.js", "Chart.js",
  "Recharts", "Django", "FastAPI", "Redux", "Vue.js",
];

function loadProject(id, defaults) {
  try {
    const saved = localStorage.getItem(`project_${id}`);
    return saved ? JSON.parse(saved) : defaults;
  } catch { return defaults; }
}

function saveProject(id, data) {
  localStorage.setItem(`project_${id}`, JSON.stringify(data));
}

// ============================================================
// IMAGE CAROUSEL
// ============================================================
function ImageCarousel({ images, title }) {
  const [current, setCurrent] = useState(0);
  const safeImages = Array.isArray(images) && images.length > 0
    ? images
    : ["https://placehold.co/600x400/0f172a/06b6d4?text=No+Image"];
  const hasMultiple = safeImages.length > 1;

  const prev = () => setCurrent((p) => p === 0 ? safeImages.length - 1 : p - 1);
  const next = () => setCurrent((p) => p === safeImages.length - 1 ? 0 : p + 1);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm mb-8 md:mb-10">
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={safeImages[current]}
          alt={title}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="w-full object-cover"
          onError={(e) => { e.target.src = "https://placehold.co/600x400/0f172a/06b6d4?text=Image+Error"; }}
        />
      </AnimatePresence>

      {hasMultiple && (
        <>
          {/* Arrows */}
          <button onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-all backdrop-blur-sm text-lg"
          >‹</button>
          <button onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-all backdrop-blur-sm text-lg"
          >›</button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {safeImages.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "bg-cyan-400 w-5" : "bg-white/50 w-1.5"}`}
              />
            ))}
          </div>

          {/* Count */}
          <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            {current + 1} / {safeImages.length}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// IMAGE EDITOR (for edit mode)
// ============================================================
function ImageEditor({ images, setImages }) {
  const [urlInput, setUrlInput] = useState("");
  const [activeTab, setActiveTab] = useState("upload");
  const fileRef = useRef(null);
  const safeImages = Array.isArray(images) ? images : [];

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImages((prev) => {
          const current = Array.isArray(prev) ? prev : [];
          return [...current, ev.target.result];
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const addUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setImages((prev) => [...(Array.isArray(prev) ? prev : []), trimmed]);
    setUrlInput("");
  };

  const removeImage = (i) => {
    setImages((prev) => (Array.isArray(prev) ? prev : []).filter((_, idx) => idx !== i));
  };

  const setCover = (i) => {
    setImages((prev) => {
      const arr = Array.isArray(prev) ? [...prev] : [];
      const [sel] = arr.splice(i, 1);
      return [sel, ...arr];
    });
  };

  return (
    <div className="space-y-3">
      <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: "none" }} />

      {/* Tabs */}
      <div className="flex gap-2">
        {["upload", "url"].map((t) => (
          <button key={t} type="button" onClick={() => setActiveTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs tracking-widest uppercase border transition-all ${
              activeTab === t
                ? "bg-cyan-500/20 border-cyan-500 text-cyan-600 dark:text-cyan-400"
                : "border-slate-300 dark:border-slate-700 text-slate-500 hover:border-slate-400"
            }`}
          >
            {t === "upload" ? "📁 Upload" : "🔗 URL"}
          </button>
        ))}
      </div>

      {activeTab === "upload" && (
        <button type="button" onClick={() => fileRef.current?.click()}
          className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-400 rounded-xl text-sm hover:border-cyan-500 hover:text-cyan-500 transition-all"
        >
          📁 Click to add images from device
        </button>
      )}

      {activeTab === "url" && (
        <div className="flex gap-2">
          <input type="text" value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrl(); } }}
            placeholder="https://example.com/image.png"
            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-cyan-500/40 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
          />
          <button type="button" onClick={addUrl} className="px-4 py-2 bg-cyan-500 text-white rounded-xl text-sm font-semibold hover:bg-cyan-400 transition-all flex-shrink-0">Add</button>
        </div>
      )}

      {/* Preview grid */}
      {safeImages.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {safeImages.map((img, i) => (
            <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-slate-100 dark:bg-slate-800">
              <img src={img} alt={`img ${i}`} className="w-full h-full object-cover"
                onError={(e) => { e.target.src = "https://placehold.co/200x120/1e293b/06b6d4?text=Error"; }}
              />
              {i === 0 && (
                <div className="absolute top-1 left-1 bg-cyan-500 text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold">Cover</div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                {i !== 0 && (
                  <button type="button" onClick={() => setCover(i)} title="Set as cover"
                    className="w-6 h-6 rounded-full bg-cyan-500 text-white text-xs flex items-center justify-center hover:bg-cyan-400">★</button>
                )}
                <button type="button" onClick={() => removeImage(i)} title="Remove"
                  className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-400">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {safeImages.length === 0 && (
        <p className="text-slate-400 text-xs text-center py-2">No images added yet.</p>
      )}
    </div>
  );
}

// ============================================================
// EDITABLE TEXT
// ============================================================
function EditableText({ value, onChange, editMode, multiline = false, className = "" }) {
  if (!editMode) return <p className={className}>{value}</p>;
  if (multiline) {
    return (
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4}
        className="w-full bg-slate-50 dark:bg-slate-800 border border-cyan-500/40 text-slate-700 dark:text-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 resize-none transition-colors"
      />
    );
  }
  return (
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-50 dark:bg-slate-800 border border-cyan-500/40 text-slate-700 dark:text-slate-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
    />
  );
}

// ============================================================
// CASE SECTION
// ============================================================
function CaseSection({ index, label, title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.6 }}
      className="mb-10 md:mb-14"
    >
      <div className="flex items-center gap-3 mb-3 md:mb-4">
        <span className="text-cyan-500 dark:text-cyan-400 font-black text-sm w-6">
          {String(index).padStart(2, "0")}
        </span>
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        <span className="text-slate-400 dark:text-slate-600 text-xs tracking-widest uppercase flex-shrink-0">{label}</span>
      </div>
      <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-4">{title}</h2>
      {children}
    </motion.div>
  );
}

// ============================================================
// TIMELINE
// ============================================================
function Timeline({ phases, editMode, onChange }) {
  const updatePhase = (i, field, val) =>
    onChange(phases.map((p, idx) => idx === i ? { ...p, [field]: val } : p));
  const addPhase = () => onChange([...phases, { phase: "New Phase", duration: "1 day", description: "" }]);
  const removePhase = (i) => onChange(phases.filter((_, idx) => idx !== i));

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-4">
        {phases.map((phase, i) => (
          <div key={i} className="relative flex gap-3 pl-10 md:pl-12">
            <div className="absolute left-0 w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
            </div>
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 md:p-4 flex-1 min-w-0">
              {editMode ? (
                <div className="space-y-2">
                  <div className="flex gap-2 flex-wrap">
                    <input value={phase.phase} onChange={(e) => updatePhase(i, "phase", e.target.value)} placeholder="Phase"
                      className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-800 border border-cyan-500/40 text-slate-700 dark:text-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
                    />
                    <input value={phase.duration} onChange={(e) => updatePhase(i, "duration", e.target.value)} placeholder="Duration"
                      className="w-24 bg-slate-50 dark:bg-slate-800 border border-cyan-500/40 text-slate-700 dark:text-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
                    />
                    <button onClick={() => removePhase(i)} className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs hover:bg-red-500/20 flex items-center justify-center flex-shrink-0">✕</button>
                  </div>
                  <textarea value={phase.description} onChange={(e) => updatePhase(i, "description", e.target.value)} rows={2}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-cyan-500/40 text-slate-700 dark:text-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none resize-none"
                  />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                    <h4 className="text-slate-900 dark:text-white font-bold text-sm">{phase.phase}</h4>
                    <span className="text-xs text-cyan-500 dark:text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-md flex-shrink-0">{phase.duration}</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-500 text-sm">{phase.description}</p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      {editMode && (
        <button onClick={addPhase} className="mt-4 ml-10 text-xs tracking-widest uppercase text-cyan-500 border border-cyan-500/30 px-4 py-2 rounded-lg hover:bg-cyan-500/10 transition-all">
          + Add Phase
        </button>
      )}
    </div>
  );
}

// ============================================================
// PROCESS STEPS
// ============================================================
function ProcessSteps({ steps, editMode, onChange }) {
  const updateStep = (i, val) => onChange(steps.map((s, idx) => idx === i ? val : s));
  const addStep = () => onChange([...steps, "New step"]);
  const removeStep = (i) => onChange(steps.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      {steps.map((step, i) => (
        <div key={i} className="flex items-start gap-3">
          <span className="text-cyan-500 dark:text-cyan-400 font-black text-sm flex-shrink-0 mt-2">{String(i + 1).padStart(2, "0")}</span>
          {editMode ? (
            <div className="flex gap-2 flex-1">
              <input value={step} onChange={(e) => updateStep(i, e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-cyan-500/40 text-slate-700 dark:text-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
              />
              <button onClick={() => removeStep(i)} className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs hover:bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">✕</button>
            </div>
          ) : (
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{step}</p>
          )}
        </div>
      ))}
      {editMode && (
        <button onClick={addStep} className="ml-8 text-xs tracking-widest uppercase text-cyan-500 border border-cyan-500/30 px-4 py-2 rounded-lg hover:bg-cyan-500/10 transition-all">
          + Add Step
        </button>
      )}
    </div>
  );
}

// ============================================================
// RESULTS LIST
// ============================================================
function ResultsList({ results, editMode, onChange }) {
  const updateResult = (i, val) => onChange(results.map((r, idx) => idx === i ? val : r));
  const addResult = () => onChange([...results, "New result"]);
  const removeResult = (i) => onChange(results.filter((_, idx) => idx !== i));

  return (
    <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
      {results.map((result, i) => (
        <div key={i} className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 flex items-start gap-3">
          <span className="text-cyan-400 text-lg flex-shrink-0">✦</span>
          {editMode ? (
            <div className="flex gap-2 flex-1">
              <textarea value={result} onChange={(e) => updateResult(i, e.target.value)} rows={2}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-cyan-500/40 text-slate-700 dark:text-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none"
              />
              <button onClick={() => removeResult(i)} className="w-6 h-6 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 text-xs hover:bg-red-500/20 flex items-center justify-center flex-shrink-0">✕</button>
            </div>
          ) : (
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{result}</p>
          )}
        </div>
      ))}
      {editMode && (
        <button onClick={addResult} className="bg-white dark:bg-slate-900/60 border border-dashed border-cyan-500/40 rounded-xl p-4 text-cyan-500 dark:text-cyan-400 text-xs tracking-widest uppercase hover:bg-cyan-500/5 transition-all">
          + Add Result
        </button>
      )}
    </div>
  );
}

// ============================================================
// TECH SELECTOR
// ============================================================
function TechSelector({ tech, editMode, onChange }) {
  const toggle = (t) => onChange(tech.includes(t) ? tech.filter((x) => x !== t) : [...tech, t]);

  if (!editMode) {
    return (
      <div className="flex flex-wrap gap-2">
        {tech.map((t) => (
          <span key={t} className="text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 md:px-4 py-1.5 md:py-2 rounded-xl shadow-sm">{t}</span>
        ))}
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-slate-400 mb-3">Selected — click to remove:</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {tech.map((t) => (
          <button key={t} onClick={() => toggle(t)} className="text-sm text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded-xl hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all">
            {t} ✕
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-400 mb-2">Click to add:</p>
      <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
        {ALL_TECH.filter((t) => !tech.includes(t)).map((t) => (
          <button key={t} onClick={() => toggle(t)} className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl hover:border-cyan-400 hover:text-cyan-600 transition-all">
            + {t}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function ProjectDetail({ customProjects = [] }) {
  const { id } = useParams();

  const allProjects = [...defaultProjects, ...customProjects, ...(() => {
    try { const s = localStorage.getItem("custom_projects"); return s ? JSON.parse(s) : []; } catch { return []; }
  })()];

  const defaultProject = allProjects.find((p) => p.id === parseInt(id) || p.id === id);
  const [project, setProject] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [saved, setSaved] = useState(false);
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (defaultProject) {
      const loaded = loadProject(defaultProject.id, defaultProject);
      setProject(loaded);
      // Init images from loaded project
      const imgs = Array.isArray(loaded.images) && loaded.images.length > 0
        ? loaded.images
        : loaded.image ? [loaded.image] : [];
      setImages(imgs);
    }
  }, [id]);

  if (!defaultProject || !project) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center px-5">
        <p className="text-slate-500 dark:text-slate-400 text-xl mb-4">Project not found.</p>
        <Link to="/projects" className="text-cyan-500 text-sm tracking-widest uppercase">Back to Projects</Link>
      </div>
    );
  }

  const update = (field, value) => setProject((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    const updated = { ...project, images, image: images[0] || project.image };
    saveProject(project.id, updated);
    setProject(updated);
    setSaved(true);
    setEditMode(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    localStorage.removeItem(`project_${project.id}`);
    setProject(defaultProject);
    const imgs = Array.isArray(defaultProject.images) && defaultProject.images.length > 0
      ? defaultProject.images
      : defaultProject.image ? [defaultProject.image] : [];
    setImages(imgs);
    setEditMode(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 pt-20 md:pt-28 pb-20 transition-colors duration-300">

      {/* ===== HERO ===== */}
      <div className="px-5 md:px-10 lg:px-20 mb-10 md:mb-16">

        {/* Top bar */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-between items-center gap-3 mb-6 md:mb-8"
        >
          <Link to="/projects" className="text-slate-400 dark:text-slate-500 text-xs tracking-widest uppercase hover:text-cyan-500 transition-colors">
            ← Back
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            {saved && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-500 text-xs tracking-widest uppercase">✓ Saved</motion.span>
            )}
            {editMode && (
              <>
                <button onClick={handleReset} className="text-xs tracking-widest uppercase px-3 py-2 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-all">Reset</button>
                <button onClick={handleSave} className="text-xs tracking-widest uppercase px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]">Save</button>
              </>
            )}
            <button onClick={() => setEditMode((p) => !p)}
              className={`text-xs tracking-widest uppercase px-4 py-2 rounded-lg border transition-all ${
                editMode
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                  : "border-slate-300 dark:border-slate-700 text-slate-500 hover:border-slate-400"
              }`}
            >
              {editMode ? "✕ Cancel" : "✏️ Edit"}
            </button>
          </div>
        </motion.div>

        {/* Edit banner */}
        <AnimatePresence>
          {editMode && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="mb-5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl px-4 py-3 flex items-center gap-3"
            >
              <span className="text-cyan-500 text-lg flex-shrink-0">✏️</span>
              <div>
                <p className="text-cyan-600 dark:text-cyan-400 text-sm font-semibold">Edit Mode Active</p>
                <p className="text-slate-500 text-xs">Make changes then click Save to persist them.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl mb-6 md:mb-8">
          <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <span className={`text-xs px-3 py-1 rounded-md border ${statusColors[project.status]}`}>{project.status}</span>
            <span className="text-slate-400 dark:text-slate-600 text-xs">{project.year}</span>
            {project.tags?.map((tag) => (
              <span key={tag} className="text-xs text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-md">{tag}</span>
            ))}
          </div>

          {editMode ? (
            <input value={project.title} onChange={(e) => update("title", e.target.value)}
              className="w-full text-3xl md:text-4xl font-black bg-transparent border-b-2 border-cyan-500/40 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 mb-4 pb-2"
            />
          ) : (
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 leading-tight">{project.title}</h1>
          )}

          <EditableText value={project.overview || project.description} onChange={(v) => update("overview", v)} editMode={editMode} multiline
            className="text-slate-500 dark:text-slate-400 text-base md:text-lg leading-relaxed"
          />
        </motion.div>

        {/* IMAGE SECTION */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {editMode ? (
            <div className="mb-8 p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 rounded-2xl">
              <p className="text-cyan-500 dark:text-cyan-400 text-xs tracking-[0.3em] uppercase mb-3 font-semibold">✦ Project Images</p>
              <p className="text-slate-500 text-xs mb-4">
                Add multiple screenshots. First image is the cover shown in the card. Use ★ to set a different cover.
              </p>
              <ImageEditor images={images} setImages={setImages} />
            </div>
          ) : (
            <ImageCarousel images={images} title={project.title} />
          )}
        </motion.div>

        {/* Quick info bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
        >
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 md:p-4">
            <p className="text-xs text-slate-400 dark:text-slate-600 tracking-widest uppercase mb-2">Status</p>
            {editMode ? (
              <select value={project.status} onChange={(e) => update("status", e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-cyan-500/40 text-slate-700 dark:text-slate-300 rounded-lg px-2 py-1 text-sm focus:outline-none"
              >
                {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            ) : (
              <span className={`text-xs px-2 py-1 rounded-md border ${statusColors[project.status]}`}>{project.status}</span>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 md:p-4">
            <p className="text-xs text-slate-400 dark:text-slate-600 tracking-widest uppercase mb-2">Year</p>
            {editMode ? (
              <select value={project.year} onChange={(e) => update("year", e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-cyan-500/40 text-slate-700 dark:text-slate-300 rounded-lg px-2 py-1 text-sm focus:outline-none"
              >
                {YEAR_OPTIONS.map((y) => <option key={y}>{y}</option>)}
              </select>
            ) : (
              <p className="text-slate-900 dark:text-white font-bold text-sm">{project.year}</p>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 md:p-4">
            <p className="text-xs text-slate-400 dark:text-slate-600 tracking-widest uppercase mb-2">Stack</p>
            <p className="text-slate-900 dark:text-white font-bold text-sm truncate">
              {project.tech?.slice(0, 2).join(", ")}{project.tech?.length > 2 ? "..." : ""}
            </p>
            {editMode && <p className="text-cyan-500 text-xs mt-1">Edit in Details below</p>}
          </div>

          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 md:p-4">
            <p className="text-xs text-slate-400 dark:text-slate-600 tracking-widest uppercase mb-2">Images</p>
            <p className="text-slate-900 dark:text-white font-bold text-sm">{images.length} photo{images.length !== 1 ? "s" : ""}</p>
            {editMode && <p className="text-cyan-500 text-xs mt-1">Edit above ↑</p>}
          </div>
        </motion.div>
      </div>

      {/* ===== DETAILS SECTION ===== */}
      <div className="px-5 md:px-10 lg:px-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mb-8 md:mb-10">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            <span className="text-slate-400 dark:text-slate-600 text-xs tracking-[0.4em] uppercase font-semibold flex-shrink-0">✦ Details</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>
        </motion.div>

        <div className="max-w-3xl">

          <CaseSection index={1} label="The Problem" title="What needed solving?">
            <EditableText value={project.problem} onChange={(v) => update("problem", v)} editMode={editMode} multiline className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base" />
          </CaseSection>

          <CaseSection index={2} label="The Solution" title="How I solved it">
            <EditableText value={project.solution} onChange={(v) => update("solution", v)} editMode={editMode} multiline className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base" />
          </CaseSection>

          <CaseSection index={3} label="The Process" title="How I built it">
            <ProcessSteps steps={project.process || []} editMode={editMode} onChange={(v) => update("process", v)} />
          </CaseSection>

          <CaseSection index={4} label="Timeline" title="Development stages">
            <Timeline phases={project.timeline || []} editMode={editMode} onChange={(v) => update("timeline", v)} />
          </CaseSection>

          <CaseSection index={5} label="The Results" title="What was achieved">
            <ResultsList results={project.results || []} editMode={editMode} onChange={(v) => update("results", v)} />
          </CaseSection>

          <CaseSection index={6} label="Lessons Learned" title="What I took away">
            <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-4 md:p-6">
              <EditableText value={project.lessonsLearned} onChange={(v) => update("lessonsLearned", v)} editMode={editMode} multiline className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base" />
            </div>
          </CaseSection>

          <CaseSection index={7} label="Reflection" title="What I'd do differently">
            <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-4 md:p-6">
              <EditableText value={project.whatIdDoDifferently} onChange={(v) => update("whatIdDoDifferently", v)} editMode={editMode} multiline className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base" />
            </div>
          </CaseSection>

          {/* Tech Stack */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10 md:mb-14 pt-8 md:pt-10 border-t border-slate-200 dark:border-slate-800">
            <p className="text-cyan-500 dark:text-cyan-400 text-xs tracking-[0.3em] uppercase mb-4 font-semibold">✦ Tech Stack</p>
            <TechSelector tech={project.tech || []} editMode={editMode} onChange={(v) => update("tech", v)} />
          </motion.div>

          {/* Links */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10 md:mb-14">
            <p className="text-cyan-500 dark:text-cyan-400 text-xs tracking-[0.3em] uppercase mb-4 font-semibold">✦ Links</p>
            {editMode ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-400 mb-1 tracking-widest uppercase">GitHub URL</p>
                  <input value={project.github} onChange={(e) => update("github", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-cyan-500/40 text-slate-700 dark:text-slate-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1 tracking-widest uppercase">Live Demo URL</p>
                  <input value={project.live} onChange={(e) => update("live", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-cyan-500/40 text-slate-700 dark:text-slate-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <a href={project.github} target="_blank" rel="noreferrer"
                  className="flex items-center justify-between px-4 md:px-5 py-3 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl hover:border-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all text-sm"
                >
                  View on GitHub <span>→</span>
                </a>
                {project.live !== "#" && (
                  <a href={project.live} target="_blank" rel="noreferrer"
                    className="flex items-center justify-between px-4 md:px-5 py-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 rounded-xl hover:bg-cyan-500/20 transition-all text-sm"
                  >
                    Live Demo <span>→</span>
                  </a>
                )}
              </div>
            )}
          </motion.div>

          {/* Save button */}
          <AnimatePresence>
            {editMode && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
                <button onClick={handleReset} className="px-4 md:px-5 py-3 border border-red-500/30 text-red-400 rounded-xl text-sm hover:bg-red-500/10 transition-all">Reset</button>
                <button onClick={handleSave} className="flex-1 py-3 bg-cyan-500 text-white rounded-xl text-sm font-semibold hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]">✓ Save All Changes</button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next Project */}
          {(() => {
            const currentIndex = defaultProjects.findIndex((p) => p.id === project.id);
            const nextProject = defaultProjects[currentIndex + 1];
            if (!nextProject) return null;
            return (
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12 md:mt-16 pt-8 md:pt-10 border-t border-slate-200 dark:border-slate-800">
                <p className="text-slate-400 dark:text-slate-600 text-xs tracking-widest uppercase mb-4">Next Project</p>
                <Link to={`/project/${nextProject.id}`}
                  className="group flex items-center justify-between bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-4 md:p-6 hover:border-cyan-400 dark:hover:border-cyan-500/40 transition-all duration-300"
                >
                  <div className="min-w-0 mr-4">
                    <h3 className="text-slate-900 dark:text-white font-black text-lg md:text-xl mb-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate">{nextProject.title}</h3>
                    <p className="text-slate-500 dark:text-slate-500 text-sm line-clamp-1">{nextProject.description}</p>
                  </div>
                  <span className="text-slate-400 group-hover:text-cyan-500 text-2xl transition-colors flex-shrink-0">→</span>
                </Link>
              </motion.div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
