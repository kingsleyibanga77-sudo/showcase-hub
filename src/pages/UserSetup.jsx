import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import { HexagonMonogram } from "../components/LoadingScreen";

const COLOR_PRESETS = [
  { name: "Cyan & Blue", color1: "#06b6d4", color2: "#3b82f6" },
  { name: "Purple & Pink", color1: "#8b5cf6", color2: "#ec4899" },
  { name: "Gold & Orange", color1: "#f59e0b", color2: "#ef4444" },
  { name: "Green & Teal", color1: "#10b981", color2: "#06b6d4" },
  { name: "Rose & Purple", color1: "#f43f5e", color2: "#8b5cf6" },
  { name: "Indigo & Cyan", color1: "#6366f1", color2: "#22d3ee" },
];

const SKILL_CATEGORIES = [
  {
    category: "Frontend",
    color: "cyan",
    skills: ["React", "Vue.js", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
  },
  {
    category: "Backend",
    color: "blue",
    skills: ["Node.js", "Express.js", "Django", "FastAPI", "GraphQL", "REST APIs"],
  },
  {
    category: "Languages",
    color: "violet",
    skills: ["JavaScript", "Python", "TypeScript", "Rust", "Go", "Java"],
  },
  {
    category: "Database",
    color: "green",
    skills: ["MongoDB", "PostgreSQL", "MySQL", "Firebase", "Redis", "Supabase"],
  },
  {
    category: "Web3 / Blockchain",
    color: "pink",
    skills: ["Solidity", "Ethers.js", "Web3.js", "Hardhat", "IPFS", "Smart Contracts"],
  },
  {
    category: "Data & AI",
    color: "orange",
    skills: ["Pandas", "NumPy", "TensorFlow", "PyTorch", "Scikit-learn", "Chart.js"],
  },
  {
    category: "DevOps & Tools",
    color: "slate",
    skills: ["Docker", "AWS", "GitHub Actions", "Vercel", "Linux", "CI/CD"],
  },
];

const TUTORIAL_STEPS = [
  {
    icon: "🗂️",
    title: "Add Your Projects",
    desc: "Go to Projects → Add Project. Fill in the details, upload screenshots and write a case study. Your projects are the heart of your showcase.",
  },
  {
    icon: "🧠",
    title: "Track Your Skills",
    desc: "On the Projects page, scroll down to the Skills section. Add your proficiency level for each skill — they show as animated progress bars.",
  },
  {
    icon: "🎨",
    title: "Personalize Everything",
    desc: "Go to Settings → Personalization to change your monogram colors, tagline, floating badges and stats shown on your Landing page.",
  },
  {
    icon: "🔗",
    title: "Share Your Portfolio",
    desc: "Your showcase is shareable as a view-only portfolio link. Anyone with the link can browse your projects without being able to make changes.",
  },
];

const STEPS = ["Your Name", "Display Name", "Skills", "Monogram", "Tutorial"];

const colorMap = {
  cyan: { active: "bg-cyan-500/20 border-cyan-500 text-cyan-400", text: "text-cyan-400" },
  blue: { active: "bg-blue-500/20 border-blue-500 text-blue-400", text: "text-blue-400" },
  violet: { active: "bg-violet-500/20 border-violet-500 text-violet-400", text: "text-violet-400" },
  green: { active: "bg-green-500/20 border-green-500 text-green-400", text: "text-green-400" },
  pink: { active: "bg-pink-500/20 border-pink-500 text-pink-400", text: "text-pink-400" },
  orange: { active: "bg-orange-500/20 border-orange-500 text-orange-400", text: "text-orange-400" },
  slate: { active: "bg-slate-500/20 border-slate-500 text-slate-300", text: "text-slate-400" },
};

export default function UserSetup() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tutorialStep, setTutorialStep] = useState(0);

  const [fullName, setFullName] = useState(user?.displayName || "");
  const [displayName, setDisplayName] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [useCustom, setUseCustom] = useState(false);
  const [customColor1, setCustomColor1] = useState("#06b6d4");
  const [customColor2, setCustomColor2] = useState("#3b82f6");

  const color1 = useCustom ? customColor1 : COLOR_PRESETS[selectedPreset].color1;
  const color2 = useCustom ? customColor2 : COLOR_PRESETS[selectedPreset].color2;

  const getInitials = (name) => {
    const parts = name.trim().split(" ");
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
  };

  const initials = getInitials(fullName || "KI");

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleNext = () => {
    setError("");
    if (step === 0) {
      if (!fullName.trim()) return setError("Please enter your full name.");
      if (fullName.trim().split(" ").length < 2)
        return setError("Please enter both first and last name.");
      setStep(1);
    } else if (step === 1) {
      if (!displayName.trim()) return setError("Please enter a display name.");
      if (displayName.trim().length < 2)
        return setError("Display name must be at least 2 characters.");
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleSave = async () => {
  setLoading(true);
  try {
    await updateProfile(auth.currentUser, { displayName: fullName.trim() });

    const prefs = {
      fullName: fullName.trim(),
      displayName: fullName.trim(),
      username: displayName.trim().toLowerCase(),
      initials: getInitials(fullName),
      color1,
      color2,
    };

    // Save to Firestore + localStorage
    const { saveUserPrefs, saveSkills } = await import("../services/db");
    await saveUserPrefs(auth.currentUser.uid, prefs);

    if (selectedSkills.length > 0) {
      const skillData = selectedSkills.map((skill, i) => ({
        id: Date.now() + i,
        name: skill,
        level: 50,
        category: SKILL_CATEGORIES.find((c) =>
          c.skills.includes(skill)
        )?.category || "Other",
      }));
      await saveSkills(auth.currentUser.uid, skillData);
    }

    navigate("/home");
  } catch {
    setError("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(6,182,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-xl">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <p className="text-cyan-400 text-xs tracking-[0.4em] uppercase mb-2">✦ Welcome aboard</p>
          <h1 className="text-3xl font-black text-white mb-1">Set Up Your Profile</h1>
          <p className="text-slate-500 text-sm">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
        </motion.div>

        <div className="flex gap-1.5 mb-6">
          {STEPS.map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= step ? "bg-cyan-500" : "bg-slate-800"}`} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-6"
            >

              {/* STEP 0 — FULL NAME */}
              {step === 0 && (
                <div>
                  <div className="flex flex-col items-center mb-6">
                    <motion.div
                      animate={{ filter: [`drop-shadow(0 0 8px ${color1}60)`, `drop-shadow(0 0 20px ${color1}90)`, `drop-shadow(0 0 8px ${color1}60)`] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <HexagonMonogram initials={initials} color1={color1} color2={color2} size={80} />
                    </motion.div>
                    <p className="text-slate-500 text-xs mt-2 tracking-widest uppercase">Monogram Preview</p>
                  </div>
                  <label className="text-xs tracking-widest uppercase text-slate-400 mb-2 block">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleNext()}
                    placeholder="First Last"
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors mb-2"
                  />
                  <p className="text-slate-600 text-xs">
                    ⚠️ Your full name is permanent and cannot be changed after setup.
                  </p>
                </div>
              )}

              {/* STEP 1 — DISPLAY NAME */}
              {step === 1 && (
                <div>
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-2xl mx-auto mb-3">✏️</div>
                    <p className="text-white font-bold">{fullName}</p>
                    <p className="text-slate-500 text-xs mt-1">Full name locked in ✓</p>
                  </div>
                  <label className="text-xs tracking-widest uppercase text-slate-400 mb-2 block">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleNext()}
                    placeholder="e.g. Kingsley, KI, King..."
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors mb-2"
                  />
                  <p className="text-slate-600 text-xs">
                    Shown as the big heading on your Landing page. Can be changed anytime in Settings.
                  </p>
                </div>
              )}

              {/* STEP 2 — SKILLS */}
              {step === 2 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-white font-black text-lg">Select Your Skills</h3>
                      <p className="text-slate-500 text-xs mt-0.5">Auto-added to your Skills section.</p>
                    </div>
                    <span className="text-cyan-400 text-xs font-bold bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
                      {selectedSkills.length} selected
                    </span>
                  </div>

                  <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                    {SKILL_CATEGORIES.map((cat) => {
                      const colors = colorMap[cat.color];
                      return (
                        <div key={cat.category}>
                          <p className={`text-xs tracking-widest uppercase font-semibold mb-2 ${colors.text}`}>
                            {cat.category}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {cat.skills.map((skill) => (
                              <button key={skill} onClick={() => toggleSkill(skill)}
                                className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                                  selectedSkills.includes(skill)
                                    ? colors.active
                                    : "border-slate-700 text-slate-400 hover:border-slate-600"
                                }`}
                              >
                                {selectedSkills.includes(skill) ? "✓ " : ""}{skill}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-slate-600 text-xs mt-3 text-center">
                    You can add more skills anytime from the Projects page.
                  </p>
                </div>
              )}

              {/* STEP 3 — MONOGRAM */}
              {step === 3 && (
                <div>
                  <div className="flex flex-col items-center mb-6">
                    <motion.div
                      animate={{ filter: [`drop-shadow(0 0 8px ${color1}60)`, `drop-shadow(0 0 20px ${color1}90)`, `drop-shadow(0 0 8px ${color1}60)`] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <HexagonMonogram initials={initials} color1={color1} color2={color2} size={90} />
                    </motion.div>
                    <p className="text-slate-500 text-xs mt-2 tracking-widest uppercase">Live Preview</p>
                  </div>

                  <label className="text-xs tracking-widest uppercase text-slate-400 mb-3 block">Monogram Color</label>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {COLOR_PRESETS.map((preset, i) => (
                      <button key={i} onClick={() => { setSelectedPreset(i); setUseCustom(false); }}
                        className={`relative h-10 rounded-xl border-2 transition-all duration-200 overflow-hidden ${
                          !useCustom && selectedPreset === i ? "border-white scale-105" : "border-transparent hover:border-slate-600"
                        }`}
                        style={{ background: `linear-gradient(135deg, ${preset.color1}, ${preset.color2})` }}
                      >
                        {!useCustom && selectedPreset === i && (
                          <span className="absolute inset-0 flex items-center justify-center text-white text-xs">✓</span>
                        )}
                      </button>
                    ))}
                  </div>

                  <button onClick={() => setUseCustom((p) => !p)}
                    className={`w-full py-2 rounded-xl border text-xs tracking-widest uppercase transition-all mb-3 ${
                      useCustom ? "border-cyan-500 text-cyan-400 bg-cyan-500/10" : "border-slate-700 text-slate-500 hover:border-slate-600"
                    }`}
                  >
                    {useCustom ? "✓ Custom Colors Active" : "Use Custom Colors"}
                  </button>

                  {useCustom && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="grid grid-cols-2 gap-3">
                      {[["Color 1", customColor1, setCustomColor1], ["Color 2", customColor2, setCustomColor2]].map(([label, val, setter]) => (
                        <div key={label}>
                          <p className="text-xs text-slate-500 mb-1">{label}</p>
                          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
                            <input type="color" value={val} onChange={(e) => setter(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0" />
                            <span className="text-slate-400 text-xs font-mono">{val}</span>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}

              {/* STEP 4 — TUTORIAL */}
              {step === 4 && (
                <div>
                  <div className="text-center mb-6">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={tutorialStep}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="text-5xl mb-4"
                      >
                        {TUTORIAL_STEPS[tutorialStep].icon}
                      </motion.div>
                    </AnimatePresence>
                    <h3 className="text-white font-black text-xl mb-2">
                      {TUTORIAL_STEPS[tutorialStep].title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
                      {TUTORIAL_STEPS[tutorialStep].desc}
                    </p>
                  </div>

                  <div className="flex justify-center gap-2 mb-5">
                    {TUTORIAL_STEPS.map((_, i) => (
                      <button key={i} onClick={() => setTutorialStep(i)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          i === tutorialStep ? "bg-cyan-400 w-6" : "bg-slate-700 w-2 hover:bg-slate-600"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex gap-3 mb-3">
                    {tutorialStep > 0 && (
                      <button onClick={() => setTutorialStep((p) => p - 1)}
                        className="px-4 py-2.5 border border-slate-700 text-slate-400 rounded-xl text-xs hover:border-slate-600 transition-all"
                      >
                        ← Prev
                      </button>
                    )}
                    {tutorialStep < TUTORIAL_STEPS.length - 1 ? (
                      <button onClick={() => setTutorialStep((p) => p + 1)}
                        className="flex-1 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs hover:bg-slate-700 transition-all"
                      >
                        Next tip →
                      </button>
                    ) : (
                      <div className="flex-1 py-2.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl text-xs text-center">
                        ✓ You're all caught up!
                      </div>
                    )}
                  </div>

                  <p className="text-slate-600 text-xs text-center">
                    Find help anytime from the Support page in the navbar.
                  </p>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {error && (
            <div className="px-6 pb-2">
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2">{error}</p>
            </div>
          )}

          <div className="flex gap-3 px-6 pb-6 pt-2">
            {step > 0 && (
              <button onClick={() => { setStep((p) => p - 1); setError(""); }}
                className="px-5 py-3 border border-slate-700 text-slate-400 rounded-xl text-sm hover:border-slate-600 transition-all"
              >
                ← Back
              </button>
            )}

            {step === 2 && (
              <button onClick={() => { setSelectedSkills([]); setStep(3); }}
                className="px-5 py-3 border border-slate-700 text-slate-500 rounded-xl text-sm hover:border-slate-600 transition-all"
              >
                Skip
              </button>
            )}

            {step < 4 ? (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                className="flex-1 py-3 rounded-xl font-semibold text-sm tracking-widest uppercase text-white transition-all"
                style={{ background: `linear-gradient(135deg, ${color1}, ${color2})`, boxShadow: `0 0 25px ${color1}40` }}
              >
                {step === 2
                  ? `Continue with ${selectedSkills.length} skill${selectedSkills.length !== 1 ? "s" : ""}`
                  : "Next →"}
              </motion.button>
            ) : (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={loading}
                className="flex-1 py-3 rounded-xl font-semibold text-sm tracking-widest uppercase text-white transition-all disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${color1}, ${color2})`, boxShadow: `0 0 25px ${color1}40` }}
              >
                {loading ? "Setting up..." : "🚀 Launch My Showcase"}
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
