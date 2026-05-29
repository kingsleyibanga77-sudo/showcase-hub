import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_OPTIONS = ["Live", "In Progress", "Planned", "Archived"];
const YEAR_OPTIONS = ["2023", "2024", "2025", "2026", "2027"];
const TAG_OPTIONS = ["Web", "Blockchain", "Data", "Web3", "Mobile", "AI"];
const ALL_TECH = [
  "React", "Node.js", "Python", "Tailwind CSS", "Framer Motion",
  "Solidity", "Ethers.js", "MongoDB", "PostgreSQL", "Firebase",
  "TypeScript", "Next.js", "Express.js", "Chart.js", "Django",
  "FastAPI", "Redux", "Vue.js", "Docker", "AWS",
];

// ============================================================
// IMAGE UPLOADER
// ============================================================
function ImageUploader({ images, setImages }) {
  const [urlInput, setUrlInput] = useState("");
  const [activeTab, setActiveTab] = useState("upload");
  const fileRef = useRef(null);

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

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

    // Reset so same files can be re-selected
    e.target.value = "";
  };

  const addUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setImages((prev) => {
      const current = Array.isArray(prev) ? prev : [];
      return [...current, trimmed];
    });
    setUrlInput("");
  };

  const removeImage = (i) => {
    setImages((prev) => {
      const current = Array.isArray(prev) ? prev : [];
      return current.filter((_, idx) => idx !== i);
    });
  };

  const setCover = (i) => {
    setImages((prev) => {
      const current = Array.isArray(prev) ? [...prev] : [];
      const [selected] = current.splice(i, 1);
      return [selected, ...current];
    });
  };

  const safeImages = Array.isArray(images) ? images : [];

  return (
    <div>
      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        style={{ display: "none" }}
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-3">
        {["upload", "url"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs tracking-widest uppercase border transition-all ${
              activeTab === t
                ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
                : "border-slate-700 text-slate-500 hover:border-slate-600"
            }`}
          >
            {t === "upload" ? "📁 Upload Files" : "🔗 Add URL"}
          </button>
        ))}
      </div>

      {activeTab === "upload" && (
        <div className="mb-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full py-6 border-2 border-dashed border-slate-600 text-slate-400 rounded-xl text-sm hover:border-cyan-500 hover:text-cyan-400 transition-all"
          >
            📁 Click to select images from your device
            <p className="text-xs text-slate-600 mt-1">
              You can select multiple files at once
            </p>
          </button>
        </div>
      )}

      {activeTab === "url" && (
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrl(); } }}
            placeholder="https://example.com/screenshot.png"
            className="flex-1 bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500"
          />
          <button
            type="button"
            onClick={addUrl}
            className="px-4 py-2.5 bg-cyan-500 text-white rounded-xl text-sm font-semibold hover:bg-cyan-400 transition-all flex-shrink-0"
          >
            Add
          </button>
        </div>
      )}

      {/* Image previews */}
      {safeImages.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-slate-400 mb-2 tracking-widest uppercase">
            {safeImages.length} image{safeImages.length !== 1 ? "s" : ""} — hover to edit, ★ to set cover
          </p>
          <div className="grid grid-cols-3 gap-2">
            {safeImages.map((img, i) => (
              <div
                key={i}
                className="relative group rounded-xl overflow-hidden border border-slate-700 aspect-video bg-slate-800"
              >
                <img
                  src={img}
                  alt={`preview ${i}`}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = "https://placehold.co/200x120/1e293b/06b6d4?text=Error"; }}
                />
                {i === 0 && (
                  <div className="absolute top-1 left-1 bg-cyan-500 text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold">
                    Cover
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {i !== 0 && (
                    <button
                      type="button"
                      onClick={() => setCover(i)}
                      title="Set as cover"
                      className="w-7 h-7 rounded-full bg-cyan-500 text-white text-xs flex items-center justify-center hover:bg-cyan-400 transition-all"
                    >
                      ★
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    title="Remove"
                    className="w-7 h-7 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-400 transition-all"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN MODAL
// ============================================================
export default function AddProjectModal({ onClose, onAdd }) {
  const [step, setStep] = useState(1);
  const [images, setImages] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    overview: "",
    status: "Planned",
    year: "2026",
    tags: [],
    tech: [],
    github: "",
    live: "#",
    problem: "",
    solution: "",
    process: [""],
    results: [""],
    lessonsLearned: "",
    whatIdDoDifferently: "",
    timeline: [{ phase: "", duration: "", description: "" }],
  });

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const toggleTag = (tag) => {
    update("tags", form.tags.includes(tag)
      ? form.tags.filter((t) => t !== tag)
      : [...form.tags, tag]
    );
  };

  const toggleTech = (tech) => {
    update("tech", form.tech.includes(tech)
      ? form.tech.filter((t) => t !== tech)
      : [...form.tech, tech]
    );
  };

  const handleAdd = () => {
    if (!form.title.trim()) return;
    const safeImages = Array.isArray(images) ? images : [];
    const placeholder = `https://placehold.co/600x400/0f172a/06b6d4?text=${encodeURIComponent(form.title)}`;

    const newProject = {
      ...form,
      id: Date.now(),
      image: safeImages[0] || placeholder,
      images: safeImages.length > 0 ? safeImages : [placeholder],
      process: form.process.filter((p) => p.trim()),
      results: form.results.filter((r) => r.trim()),
      timeline: form.timeline.filter((t) => t.phase.trim()),
    };

    try {
      const saved = localStorage.getItem("custom_projects");
      const existing = saved ? JSON.parse(saved) : [];
      localStorage.setItem("custom_projects", JSON.stringify([...existing, newProject]));
    } catch {}

    onAdd(newProject);
    onClose();
  };

  const inputClass = "w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors";
  const labelClass = "text-xs tracking-widest uppercase text-slate-400 mb-2 block";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-slate-800 flex-shrink-0">
          <div>
            <h3 className="text-white font-black text-xl">Add New Project</h3>
            <p className="text-slate-500 text-xs mt-1">
              Step {step} of 3 — {step === 1 ? "Basic Info & Images" : step === 2 ? "Tech & Links" : "Case Study Details"}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-200 text-xl">✕</button>
        </div>

        {/* Step indicators */}
        <div className="flex px-6 py-3 gap-2 border-b border-slate-800 flex-shrink-0">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex-1 h-1 rounded-full transition-all duration-300 ${s <= step ? "bg-cyan-500" : "bg-slate-700"}`} />
          ))}
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Project Title *</label>
                    <input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="My Awesome Project" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Short Description *</label>
                    <textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="A brief one-line description..." rows={2} className={`${inputClass} resize-none`} />
                  </div>
                  <div>
                    <label className={labelClass}>Overview</label>
                    <textarea value={form.overview} onChange={(e) => update("overview", e.target.value)} placeholder="A longer overview..." rows={3} className={`${inputClass} resize-none`} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Status</label>
                      <select value={form.status} onChange={(e) => update("status", e.target.value)} className={inputClass}>
                        {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Year</label>
                      <select value={form.year} onChange={(e) => update("year", e.target.value)} className={inputClass}>
                        {YEAR_OPTIONS.map((y) => <option key={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Categories</label>
                    <div className="flex flex-wrap gap-2">
                      {TAG_OPTIONS.map((tag) => (
                        <button key={tag} type="button" onClick={() => toggleTag(tag)}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                            form.tags.includes(tag)
                              ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
                              : "border-slate-700 text-slate-500 hover:border-slate-500"
                          }`}
                        >{tag}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Project Images</label>
                    <p className="text-slate-600 text-xs mb-3">
                      Add screenshots or images. First image is the cover. Hover images to reorder or remove.
                    </p>
                    <ImageUploader images={images} setImages={setImages} />
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Tech Stack</label>
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                      {ALL_TECH.map((tech) => (
                        <button key={tech} type="button" onClick={() => toggleTech(tech)}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                            form.tech.includes(tech)
                              ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
                              : "border-slate-700 text-slate-500 hover:border-slate-500"
                          }`}
                        >{form.tech.includes(tech) ? "✓ " : ""}{tech}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>GitHub URL</label>
                    <input value={form.github} onChange={(e) => update("github", e.target.value)} placeholder="https://github.com/username/repo" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Live Demo URL (optional)</label>
                    <input value={form.live} onChange={(e) => update("live", e.target.value)} placeholder="https://yourproject.com" className={inputClass} />
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>The Problem</label>
                    <textarea value={form.problem} onChange={(e) => update("problem", e.target.value)} placeholder="What problem did this solve?" rows={3} className={`${inputClass} resize-none`} />
                  </div>
                  <div>
                    <label className={labelClass}>The Solution</label>
                    <textarea value={form.solution} onChange={(e) => update("solution", e.target.value)} placeholder="How did you solve it?" rows={3} className={`${inputClass} resize-none`} />
                  </div>
                  <div>
                    <label className={labelClass}>Process Steps</label>
                    {form.process.map((s, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input value={s} onChange={(e) => {
                          const updated = [...form.process];
                          updated[i] = e.target.value;
                          update("process", updated);
                        }} placeholder={`Step ${i + 1}`} className={inputClass} />
                        <button type="button" onClick={() => update("process", form.process.filter((_, idx) => idx !== i))}
                          className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all flex-shrink-0 flex items-center justify-center">✕</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => update("process", [...form.process, ""])}
                      className="text-xs tracking-widest uppercase text-cyan-500 border border-cyan-500/30 px-4 py-2 rounded-lg hover:bg-cyan-500/10 transition-all">
                      + Add Step
                    </button>
                  </div>
                  <div>
                    <label className={labelClass}>Results</label>
                    {form.results.map((r, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input value={r} onChange={(e) => {
                          const updated = [...form.results];
                          updated[i] = e.target.value;
                          update("results", updated);
                        }} placeholder={`Result ${i + 1}`} className={inputClass} />
                        <button type="button" onClick={() => update("results", form.results.filter((_, idx) => idx !== i))}
                          className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all flex-shrink-0 flex items-center justify-center">✕</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => update("results", [...form.results, ""])}
                      className="text-xs tracking-widest uppercase text-cyan-500 border border-cyan-500/30 px-4 py-2 rounded-lg hover:bg-cyan-500/10 transition-all">
                      + Add Result
                    </button>
                  </div>
                  <div>
                    <label className={labelClass}>Lessons Learned</label>
                    <textarea value={form.lessonsLearned} onChange={(e) => update("lessonsLearned", e.target.value)} placeholder="What did you learn?" rows={3} className={`${inputClass} resize-none`} />
                  </div>
                  <div>
                    <label className={labelClass}>What I'd Do Differently</label>
                    <textarea value={form.whatIdDoDifferently} onChange={(e) => update("whatIdDoDifferently", e.target.value)} placeholder="Reflection..." rows={3} className={`${inputClass} resize-none`} />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-800 flex-shrink-0">
          {step > 1 && (
            <button type="button" onClick={() => setStep((p) => p - 1)}
              className="px-5 py-2.5 border border-slate-700 text-slate-400 rounded-xl text-sm hover:border-slate-600 transition-all">
              ← Back
            </button>
          )}
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 border border-slate-700 text-slate-400 rounded-xl text-sm hover:border-slate-600 transition-all">
            Cancel
          </button>
          {step < 3 ? (
            <button
              type="button"
              onClick={() => { if (step === 1 && !form.title.trim()) return; setStep((p) => p + 1); }}
              disabled={step === 1 && !form.title.trim()}
              className="flex-1 py-2.5 bg-cyan-500 text-white rounded-xl text-sm font-semibold tracking-widest uppercase hover:bg-cyan-400 transition-all disabled:opacity-40 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              Next →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 py-2.5 bg-cyan-500 text-white rounded-xl text-sm font-semibold tracking-widest uppercase hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              ✓ Add Project
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
