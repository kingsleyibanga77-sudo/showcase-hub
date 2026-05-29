import { useState } from "react";
import { motion } from "framer-motion";
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

export default function UserSetup() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const getInitials = (name) => {
    const parts = name.trim().split(" ");
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
  };

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [customColor1, setCustomColor1] = useState("#06b6d4");
  const [customColor2, setCustomColor2] = useState("#3b82f6");
  const [useCustom, setUseCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const color1 = useCustom ? customColor1 : COLOR_PRESETS[selectedPreset].color1;
  const color2 = useCustom ? customColor2 : COLOR_PRESETS[selectedPreset].color2;
  const initials = getInitials(displayName || "KI");

  const handleSave = async () => {
    if (!displayName.trim()) return setError("Please enter your name.");
    if (displayName.trim().split(" ").length < 2)
      return setError("Please enter both first and last name.");

    setLoading(true);
    try {
      await updateProfile(auth.currentUser, { displayName: displayName.trim() });
      localStorage.setItem(
        "user_prefs",
        JSON.stringify({
          initials: getInitials(displayName),
          color1,
          color2,
          displayName: displayName.trim(),
        })
      );
      navigate("/");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 cursor-none">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(6,182,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <p className="text-cyan-400 text-xs tracking-[0.4em] uppercase mb-2">
            ✦ One last step
          </p>
          <h1 className="text-3xl font-black text-white mb-2">
            Set Up Your Profile
          </h1>
          <p className="text-slate-500 text-sm">
            Personalize your monogram — this appears on your loading screen.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl"
        >
          {/* Live preview */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              animate={{
                filter: [
                  `drop-shadow(0 0 8px ${color1}60)`,
                  `drop-shadow(0 0 20px ${color1}90)`,
                  `drop-shadow(0 0 8px ${color1}60)`,
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <HexagonMonogram
                initials={initials}
                color1={color1}
                color2={color2}
                size={100}
              />
            </motion.div>
            <p className="text-slate-500 text-xs mt-3 tracking-widest uppercase">
              Live Preview
            </p>
          </div>

          {/* Name input */}
          <div className="mb-6">
            <label className="text-xs tracking-widest uppercase text-slate-400 mb-2 block">
              Full Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="First Last"
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <p className="text-slate-600 text-xs mt-1">
              Your initials will be generated automatically from your name.
            </p>
          </div>

          {/* Color presets */}
          <div className="mb-4">
            <label className="text-xs tracking-widest uppercase text-slate-400 mb-3 block">
              Monogram Color
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {COLOR_PRESETS.map((preset, i) => (
                <button
                  key={i}
                  onClick={() => { setSelectedPreset(i); setUseCustom(false); }}
                  className={`relative h-10 rounded-xl border-2 transition-all duration-200 overflow-hidden ${
                    !useCustom && selectedPreset === i
                      ? "border-white scale-105"
                      : "border-transparent hover:border-slate-600"
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${preset.color1}, ${preset.color2})`,
                  }}
                >
                  {!useCustom && selectedPreset === i && (
                    <span className="absolute inset-0 flex items-center justify-center text-white text-xs">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Custom color toggle */}
            <button
              onClick={() => setUseCustom((p) => !p)}
              className={`w-full py-2 rounded-xl border text-xs tracking-widest uppercase transition-all ${
                useCustom
                  ? "border-cyan-500 text-cyan-400 bg-cyan-500/10"
                  : "border-slate-700 text-slate-500 hover:border-slate-600"
              }`}
            >
              {useCustom ? "✓ Custom Colors" : "Use Custom Colors"}
            </button>

            {/* Custom color pickers */}
            {useCustom && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 grid grid-cols-2 gap-3"
              >
                <div>
                  <p className="text-xs text-slate-500 mb-1">Color 1</p>
                  <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
                    <input
                      type="color"
                      value={customColor1}
                      onChange={(e) => setCustomColor1(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-slate-400 text-xs font-mono">{customColor1}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Color 2</p>
                  <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
                    <input
                      type="color"
                      value={customColor2}
                      onChange={(e) => setCustomColor2(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-slate-400 text-xs font-mono">{customColor2}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2">
              {error}
            </p>
          )}

          {/* Save button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm tracking-widest uppercase text-white transition-all disabled:opacity-50"
            style={{
              background: `linear-gradient(135deg, ${color1}, ${color2})`,
              boxShadow: `0 0 25px ${color1}40`,
            }}
          >
            {loading ? "Saving..." : "Complete Setup →"}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
