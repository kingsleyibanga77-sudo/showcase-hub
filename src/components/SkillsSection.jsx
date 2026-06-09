import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

// ============================================================
// AVAILABLE SKILLS LIBRARY (to pick from when adding)
// ============================================================
const AVAILABLE_SKILLS = {
  Frontend: [
    { name: "HTML", icon: "🌐" },
    { name: "CSS", icon: "🎨" },
    { name: "React", icon: "⚛️" },
    { name: "Tailwind", icon: "💨" },
    { name: "Vue.js", icon: "💚" },
    { name: "Next.js", icon: "▲" },
    { name: "TypeScript", icon: "🔷" },
    { name: "Redux", icon: "🔄" },
    { name: "Svelte", icon: "🔥" },
    { name: "Angular", icon: "🅰️" },
  ],
  Backend: [
    { name: "JavaScript", icon: "🟨" },
    { name: "Node.js", icon: "🟢" },
    { name: "Python", icon: "🐍" },
    { name: "Express.js", icon: "⚡" },
    { name: "Django", icon: "🎸" },
    { name: "FastAPI", icon: "🚀" },
    { name: "PHP", icon: "🐘" },
    { name: "Ruby", icon: "💎" },
    { name: "Java", icon: "☕" },
    { name: "Go", icon: "🐹" },
  ],
  Blockchain: [
    { name: "Web3", icon: "🌍" },
    { name: "Solidity", icon: "💎" },
    { name: "Ethers.js", icon: "⛓️" },
    { name: "Hardhat", icon: "🪖" },
    { name: "IPFS", icon: "📦" },
    { name: "Truffle", icon: "🍫" },
  ],
  Database: [
    { name: "MongoDB", icon: "🍃" },
    { name: "PostgreSQL", icon: "🐘" },
    { name: "MySQL", icon: "🐬" },
    { name: "Firebase", icon: "🔥" },
    { name: "Redis", icon: "⚡" },
    { name: "Supabase", icon: "⚡" },
  ],
  Tools: [
    { name: "Git", icon: "🔀" },
    { name: "GitHub", icon: "🐙" },
    { name: "Docker", icon: "🐳" },
    { name: "AWS", icon: "☁️" },
    { name: "Linux", icon: "🐧" },
    { name: "Figma", icon: "🎨" },
    { name: "VS Code", icon: "💻" },
    { name: "Postman", icon: "📮" },
  ],
};

// ============================================================
// DEFAULT SKILLS STATE
// ============================================================
const DEFAULT_SKILLS = {
  Frontend: [
    { name: "HTML", level: 90, icon: "🌐", projects: ["Portfolio Site", "Showcase Hub"] },
    { name: "CSS", level: 85, icon: "🎨", projects: ["Portfolio Site", "Showcase Hub"] },
    { name: "React", level: 70, icon: "⚛️", projects: ["Portfolio Site", "Showcase Hub", "Expense Tracker"] },
    { name: "Tailwind", level: 70, icon: "💨", projects: ["Portfolio Site", "Showcase Hub"] },
  ],
  Backend: [
    { name: "JavaScript", level: 75, icon: "🟨", projects: ["Portfolio Site", "Showcase Hub", "Expense Tracker"] },
    { name: "Node.js", level: 65, icon: "🟢", projects: ["Expense Tracker", "Explain My Data"] },
    { name: "Python", level: 65, icon: "🐍", projects: ["Explain My Data"] },
  ],
  Blockchain: [
    { name: "Web3", level: 60, icon: "🌍", projects: ["Web3 Voting App"] },
    { name: "Solidity", level: 60, icon: "💎", projects: ["Web3 Voting App"] },
  ],
  Tools: [
    { name: "Git", level: 80, icon: "🔀", projects: ["Portfolio Site", "Showcase Hub", "Expense Tracker"] },
    { name: "GitHub", level: 80, icon: "🐙", projects: ["Portfolio Site", "Showcase Hub", "Expense Tracker"] },
  ],
};

const categoryEmojis = {
  Frontend: "🎨",
  Backend: "⚙️",
  Blockchain: "⛓️",
  Database: "🗄️",
  Tools: "🛠️",
};

function getLevelColor(level) {
  if (level >= 80) return "from-cyan-400 to-blue-400";
  if (level >= 65) return "from-blue-400 to-purple-400";
  return "from-purple-400 to-pink-400";
}

function getLevelLabel(level) {
  if (level >= 80) return "Advanced";
  if (level >= 65) return "Intermediate";
  return "Familiar";
}

// ============================================================
// PROGRESS BAR
// ============================================================
function ProgressBar({ level, color }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <div ref={ref} className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: inView ? `${level}%` : 0 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        className={`h-full rounded-full bg-gradient-to-r ${color}`}
      />
    </div>
  );
}

// ============================================================
// ADD SKILL MODAL
// ============================================================
function AddSkillModal({ onClose, onAdd, existingSkills }) {
  const [selectedCategory, setSelectedCategory] = useState("Frontend");
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [proficiency, setProficiency] = useState(50);
  const [customName, setCustomName] = useState("");
  const [customIcon, setCustomIcon] = useState("⭐");
  const [isCustom, setIsCustom] = useState(false);

  const allExisting = Object.values(existingSkills).flat().map((s) => s.name);

  const handleAdd = () => {
    const name = isCustom ? customName.trim() : selectedSkill?.name;
    const icon = isCustom ? customIcon : selectedSkill?.icon;
    if (!name) return;

    onAdd({
      category: selectedCategory,
      skill: { name, icon, level: proficiency, projects: [] },
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col"
      >
        {/* Sticky Header */}
        <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div>
            <h3 className="text-slate-900 dark:text-white font-black text-xl">
              Add a Skill
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Pick from the library or add a custom one
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">

        {/* Category selector */}
        <div className="mb-4">
          <p className="text-xs tracking-widest uppercase text-slate-400 dark:text-slate-500 mb-2">
            Category
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.keys(AVAILABLE_SKILLS).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedSkill(null);
                }}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  selectedCategory === cat
                    ? "bg-cyan-500/20 border-cyan-500 text-cyan-600 dark:text-cyan-400"
                    : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-cyan-400"
                }`}
              >
                {categoryEmojis[cat] || "📁"} {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Toggle custom */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setIsCustom(false)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
              !isCustom
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                : "border-slate-200 dark:border-slate-700 text-slate-500"
            }`}
          >
            From Library
          </button>
          <button
            onClick={() => setIsCustom(true)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
              isCustom
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                : "border-slate-200 dark:border-slate-700 text-slate-500"
            }`}
          >
            Custom Skill
          </button>
        </div>

        {/* Skill picker */}
        {!isCustom ? (
          <div className="mb-4">
            <p className="text-xs tracking-widest uppercase text-slate-400 dark:text-slate-500 mb-2">
              Select Skill
            </p>
            <div className="grid grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {AVAILABLE_SKILLS[selectedCategory].map((skill) => {
                const alreadyAdded = allExisting.includes(skill.name);
                return (
                  <button
                    key={skill.name}
                    disabled={alreadyAdded}
                    onClick={() => setSelectedSkill(skill)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all ${
                      alreadyAdded
                        ? "opacity-30 cursor-not-allowed border-slate-100 dark:border-slate-800 text-slate-300"
                        : selectedSkill?.name === skill.name
                        ? "bg-cyan-500/20 border-cyan-500 text-cyan-600 dark:text-cyan-400"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-cyan-400"
                    }`}
                  >
                    <span>{skill.icon}</span>
                    <span className="truncate">{skill.name}</span>
                    {alreadyAdded && <span className="text-[10px]">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mb-4 flex gap-3">
            <div className="flex-shrink-0">
              <p className="text-xs tracking-widest uppercase text-slate-400 dark:text-slate-500 mb-2">
                Icon
              </p>
              <input
                type="text"
                value={customIcon}
                onChange={(e) => setCustomIcon(e.target.value)}
                maxLength={2}
                className="w-14 text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 text-lg focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex-1">
              <p className="text-xs tracking-widest uppercase text-slate-400 dark:text-slate-500 mb-2">
                Skill Name
              </p>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Three.js"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        )}

        {/* Proficiency slider */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs tracking-widest uppercase text-slate-400 dark:text-slate-500">
              Proficiency
            </p>
            <span className="text-cyan-500 dark:text-cyan-400 font-black text-sm">
              {proficiency}% — {getLevelLabel(proficiency)}
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={proficiency}
            onChange={(e) => setProficiency(Number(e.target.value))}
            className="w-full accent-cyan-500 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-300 dark:text-slate-700 mt-1">
            <span>Beginner</span>
            <span>Intermediate</span>
            <span>Advanced</span>
          </div>
        </div>

        {/* Preview */}
        <div className="mb-6 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-400 mb-2 tracking-widest uppercase">Preview</p>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">
              {isCustom ? customIcon : selectedSkill?.icon || "⭐"}
            </span>
            <span className="text-slate-900 dark:text-white font-bold text-sm">
              {isCustom ? customName || "Skill name" : selectedSkill?.name || "Select a skill"}
            </span>
            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${getLevelColor(proficiency)} text-white`}>
              {getLevelLabel(proficiency)}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${getLevelColor(proficiency)} transition-all duration-300`}
              style={{ width: `${proficiency}%` }}
            />
          </div>
        </div>

        </div>{/* end scrollable body */}

        {/* Sticky Footer Actions */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-xl text-sm hover:border-slate-300 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!isCustom ? !selectedSkill : !customName.trim()}
            className="flex-1 py-2.5 bg-cyan-500 text-white rounded-xl text-sm font-semibold hover:bg-cyan-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            Add Skill
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// SKILL CARD
// ============================================================
function SkillCard({ skill, index, activeSkills, toggleSkill, onEdit, onRemove, editMode }) {
  if (!skill || typeof skill !== "object") return null;
  const safeProjects = Array.isArray(skill.projects) ? skill.projects : [];
  const isActive = activeSkills.includes(skill.name);
  const color = getLevelColor(skill.level);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className={`relative rounded-xl p-4 border transition-all duration-300 ${
        editMode
          ? "bg-white dark:bg-slate-900/60 border-dashed border-slate-300 dark:border-slate-600"
          : isActive
          ? "bg-cyan-500/10 border-cyan-400 dark:border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)] cursor-pointer"
          : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-700/50 hover:border-cyan-300 dark:hover:border-cyan-500/40 hover:shadow-[0_4px_20px_rgba(6,182,212,0.1)] cursor-pointer"
      }`}
      onClick={() => !editMode && toggleSkill(skill.name)}
    >
      {/* Edit mode buttons */}
      {editMode && (
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(skill); }}
            className="w-6 h-6 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-500 text-xs flex items-center justify-center hover:bg-blue-500/20 transition-all"
          >
            ✏️
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(skill.name); }}
            className="w-6 h-6 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-center hover:bg-red-500/20 transition-all"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{skill.icon}</span>
          <span className="text-slate-900 dark:text-white font-bold text-sm">
            {skill.name}
          </span>
        </div>
        {!editMode && (
          <div className="flex flex-col items-end gap-1">
            <span className="text-cyan-500 dark:text-cyan-400 font-black text-sm">
              {skill.level}%
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${color} text-white font-medium`}>
              {getLevelLabel(skill.level)}
            </span>
          </div>
        )}
        {editMode && (
          <span className="text-cyan-500 dark:text-cyan-400 font-black text-sm">
            {skill.level}%
          </span>
        )}
      </div>

      <ProgressBar level={skill.level} color={color} />

      {!editMode && (
        <div className="mt-3 flex items-center justify-between">
          <span className="text-slate-400 dark:text-slate-600 text-xs">
            {safeProjects.length} project{safeProjects.length !== 1 ? "s" : ""}
          </span>
          <span className={`text-xs transition-colors duration-200 ${
            isActive ? "text-cyan-500 dark:text-cyan-400" : "text-slate-300 dark:text-slate-700"
          }`}>
            {isActive ? "✓ Selected" : "Click to filter"}
          </span>
        </div>
      )}

      {isActive && !editMode && safeProjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
          className="mt-3 pt-3 border-t border-cyan-400/20 flex flex-wrap gap-1"
        >
          {safeProjects.map((p) => (
            <span key={p} className="text-xs bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-md">
              {p}
            </span>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

// ============================================================
// EDIT SKILL MODAL
// ============================================================
function EditSkillModal({ skill, onClose, onSave }) {
  const [level, setLevel] = useState(skill.level);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-slate-900 dark:text-white font-black text-xl">
            Edit Skill
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>

        <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <span className="text-2xl">{skill.icon}</span>
          <div>
            <p className="text-slate-900 dark:text-white font-bold">{skill.name}</p>
            <p className="text-slate-400 text-xs">{getLevelLabel(level)}</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs tracking-widest uppercase text-slate-400 dark:text-slate-500">
              Proficiency
            </p>
            <span className="text-cyan-500 dark:text-cyan-400 font-black">
              {level}%
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
            className="w-full accent-cyan-500 cursor-pointer"
          />
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-3">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${getLevelColor(level)} transition-all duration-300`}
              style={{ width: `${level}%` }}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-xl text-sm hover:border-slate-300 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => { onSave(skill.name, level); onClose(); }}
            className="flex-1 py-2.5 bg-cyan-500 text-white rounded-xl text-sm font-semibold hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// MAIN SKILLS SECTION
// ============================================================
export default function SkillsSection({ activeSkills, toggleSkill, clearSkills, onFilterBySkill }) {
  const [skills, setSkills] = useState(() => {
    try {
      // Load from user_skills (set during onboarding or previously saved)
      const saved = localStorage.getItem("user_skills");
      if (saved) {
        const skillArray = JSON.parse(saved);
        if (Array.isArray(skillArray) && skillArray.length > 0) {
          // Convert flat array to category object
          const grouped = {};
          skillArray.forEach((skill) => {
            const cat = skill.category || "Other";
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push({
              name: skill.name,
              level: skill.level || 50,
              icon: skill.icon || "⭐",
            });
          });
          return grouped;
        }
      }
      // Load from skills_data (previously saved from edit mode)
      const skillsData = localStorage.getItem("skills_data");
      if (skillsData) return JSON.parse(skillsData);
      // Return empty object — no default skills
      return {};
    } catch { return {}; }
  });
  const [editMode, setEditMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);

  // Save skills to localStorage whenever they change
  const saveSkills = (updatedSkills) => {
    try {
      localStorage.setItem("skills_data", JSON.stringify(updatedSkills));
      // Also update user_skills flat array
      const flat = Object.entries(updatedSkills).flatMap(([category, categorySkills]) =>
        categorySkills.map((s, i) => ({
          id: Date.now() + i,
          name: s.name,
          level: s.level,
          icon: s.icon,
          category,
        }))
      );
      localStorage.setItem("user_skills", JSON.stringify(flat));
      // Sync to Firestore if user is logged in
      import("../services/db").then(({ saveSkills: saveToDb }) => {
        import("../firebase").then(({ auth }) => {
          if (auth.currentUser) saveToDb(auth.currentUser.uid, flat);
        });
      });
    } catch {}
  };

  const handleAddSkill = ({ category, skill }) => {
    setSkills((prev) => {
      const updated = {
        ...prev,
        [category]: [...(prev[category] || []), skill],
      };
      saveSkills(updated);
      return updated;
    });
  };

  const handleRemoveSkill = (category, skillName) => {
    setSkills((prev) => {
      const updated = {
        ...prev,
        [category]: prev[category].filter((s) => s.name !== skillName),
      };
      saveSkills(updated);
      return updated;
    });
  };

  const handleEditSkill = (skillName, newLevel) => {
    setSkills((prev) => {
      const updated = {};
      for (const cat in prev) {
        updated[cat] = prev[cat].map((s) =>
          s.name === skillName ? { ...s, level: newLevel } : s
        );
      }
      return updated;
    });
  };

  const allSkillsFlat = Object.values(skills).flat();

  return (
    <>
      {/* Modals */}
      <AnimatePresence>
        {showAddModal && (
          <AddSkillModal
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddSkill}
            existingSkills={skills}
          />
        )}
        {editingSkill && (
          <EditSkillModal
            skill={editingSkill}
            onClose={() => setEditingSkill(null)}
            onSave={handleEditSkill}
          />
        )}
      </AnimatePresence>

      <div className="mt-24">
        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          <span className="text-slate-400 dark:text-slate-600 text-xs tracking-widest uppercase">Skills</span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-10"
        >
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <p className="text-cyan-500 dark:text-cyan-400 text-xs tracking-[0.3em] uppercase mb-2 font-semibold">
                ✦ What I Know
              </p>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-3">
                Skills & Proficiency
              </h2>
              <p className="text-slate-500 dark:text-slate-500 max-w-lg text-sm leading-relaxed">
                {editMode
                  ? "Edit mode — adjust proficiency or remove skills."
                  : "Select one or more skills to filter matching projects above."}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-shrink-0">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 text-xs tracking-widest uppercase px-4 py-2 bg-cyan-500 text-white rounded-xl hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              >
                + Add Skill
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditMode((p) => !p)}
                className={`flex items-center gap-2 text-xs tracking-widest uppercase px-4 py-2 rounded-xl border transition-all ${
                  editMode
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                    : "border-slate-300 dark:border-slate-700 text-slate-500 hover:border-slate-400"
                }`}
              >
                {editMode ? "✓ Done" : "✏️ Edit"}
              </motion.button>
            </div>
          </div>

          {/* Active filters */}
          {activeSkills.length > 0 && !editMode && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex flex-wrap items-center gap-2"
            >
              <span className="text-slate-400 text-xs tracking-widest uppercase">
                Filtering by:
              </span>
              {activeSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className="inline-flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-3 py-1 text-cyan-600 dark:text-cyan-400 text-xs font-semibold hover:bg-cyan-500/20 transition-all"
                >
                  {skill} <span className="text-cyan-400/60">✕</span>
                </button>
              ))}
              <button
                onClick={clearSkills}
                className="text-slate-400 hover:text-red-400 text-xs tracking-widest uppercase transition-colors ml-1"
              >
                Clear all
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Skill Groups */}
        <div className="space-y-10">
          {Object.keys(skills).length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-16 border border-slate-200 dark:border-slate-800 rounded-2xl"
            >
              <p className="text-4xl mb-3">🧠</p>
              <p className="text-slate-500 dark:text-slate-400 text-lg font-semibold mb-2">No skills added yet</p>
              <p className="text-slate-400 dark:text-slate-600 text-sm mb-4">
                Click <span className="text-cyan-500">✏️ Edit Skills</span> to add your first skill.
              </p>
            </motion.div>
          ) : (
            Object.entries(skills).map(([category, categorySkills]) => {
              if (!Array.isArray(categorySkills) || categorySkills.length === 0) return null;
              return (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">{categoryEmojis[category] || "📁"}</span>
                    <h3 className="text-slate-700 dark:text-slate-300 font-bold text-sm tracking-widest uppercase">
                      {category}
                    </h3>
                    <span className="text-slate-400 dark:text-slate-600 text-xs">
                      ({categorySkills.length})
                    </span>
                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {categorySkills.map((skill, index) => (
                      <SkillCard
                        key={skill.name}
                        skill={skill}
                        index={index}
                        activeSkills={activeSkills}
                        toggleSkill={(name) => {
                          toggleSkill(name);
                          onFilterBySkill();
                        }}
                      editMode={editMode}
                      onEdit={setEditingSkill}
                      onRemove={(name) => handleRemoveSkill(category, name)}
                    />
                  ))}
                </div>
              </div>
            );
          })
          )}
        </div>
      </div>
    </>
  );
}
