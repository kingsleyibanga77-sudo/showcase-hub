import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  updateProfile,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { auth } from "../firebase";
import { HexagonMonogram } from "../components/LoadingScreen";
import { useTheme } from "../context/ThemeContext";

const COLOR_PRESETS = [
  { name: "Cyan & Blue", color1: "#06b6d4", color2: "#3b82f6" },
  { name: "Purple & Pink", color1: "#8b5cf6", color2: "#ec4899" },
  { name: "Gold & Orange", color1: "#f59e0b", color2: "#ef4444" },
  { name: "Green & Teal", color1: "#10b981", color2: "#06b6d4" },
  { name: "Rose & Purple", color1: "#f43f5e", color2: "#8b5cf6" },
  { name: "Indigo & Cyan", color1: "#6366f1", color2: "#22d3ee" },
];

const TABS = ["Profile", "Personalization", "Account"];

// ============================================================
// IMAGE MODAL
// ============================================================
function ImageModal({ onClose, onSave, onDelete, currentImage }) {
  const [tab, setTab] = useState("url");
  const [url, setUrl] = useState(
    currentImage && !currentImage.includes("placehold") ? currentImage : ""
  );
  const [preview, setPreview] = useState(currentImage || "");
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target.result);
      setUrl(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700 rounded-2xl p-5 md:p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-white font-black text-lg">Profile Image</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-xl">✕</button>
        </div>

        <div className="flex gap-2 mb-4">
          {["url", "upload"].map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-xs tracking-widest uppercase border transition-all ${
                tab === t
                  ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
                  : "border-slate-700 text-slate-500"
              }`}
            >
              {t === "url" ? "🔗 URL" : "📁 Upload"}
            </button>
          ))}
        </div>

        {tab === "url" && (
          <input type="text" value={url}
            onChange={(e) => { setUrl(e.target.value); setPreview(e.target.value); }}
            placeholder="https://example.com/photo.jpg"
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 mb-4"
          />
        )}

        {tab === "upload" && (
          <div className="mb-4">
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-full py-8 border border-dashed border-slate-600 text-slate-400 rounded-xl text-sm hover:border-cyan-500 hover:text-cyan-400 transition-all"
            >
              📁 Click to select image from device
            </button>
          </div>
        )}

        {preview && (
          <div className="mb-5 text-center">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-cyan-500/40 mx-auto">
              <img src={preview} alt="preview" className="w-full h-full object-cover"
                onError={() => setPreview("")}
              />
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {currentImage && !currentImage.includes("placehold") && (
            <button onClick={() => { onDelete(); onClose(); }}
              className="px-3 py-2.5 border border-red-500/30 text-red-400 rounded-xl text-sm hover:bg-red-500/10 transition-all"
            >
              🗑️
            </button>
          )}
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-700 text-slate-400 rounded-xl text-sm">Cancel</button>
          <button onClick={() => { if (url) { onSave(url); onClose(); } }} disabled={!url}
            className="flex-1 py-2.5 bg-cyan-500 text-white rounded-xl text-sm font-semibold hover:bg-cyan-400 transition-all disabled:opacity-40"
          >
            Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// DELETE ACCOUNT MODAL
// ============================================================
function DeleteAccountModal({ onClose, onDeleted }) {
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isGoogleUser =
    auth.currentUser?.providerData?.[0]?.providerId === "google.com";

  const handleDelete = async () => {
    setError("");
    if (confirmText !== "DELETE") return setError('Type "DELETE" to confirm.');
    setLoading(true);
    try {
      if (!isGoogleUser && password) {
        const credential = EmailAuthProvider.credential(
          auth.currentUser.email,
          password
        );
        await reauthenticateWithCredential(auth.currentUser, credential);
      }
      localStorage.clear();
      await deleteUser(auth.currentUser);
      onDeleted();
    } catch (err) {
      if (err.code === "auth/wrong-password") setError("Incorrect password.");
      else if (err.code === "auth/requires-recent-login")
        setError("Please sign out and sign in again before deleting.");
      else setError("Failed to delete. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-red-500/30 rounded-2xl p-5 md:p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-xl flex-shrink-0">⚠️</div>
          <div>
            <h3 className="text-white font-black text-lg">Delete Account</h3>
            <p className="text-slate-500 text-xs">This action is permanent and cannot be undone.</p>
          </div>
        </div>

        {step === 1 && (
          <div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-5">
              <p className="text-red-400 text-sm font-semibold mb-2">This will permanently delete:</p>
              <ul className="text-slate-400 text-sm space-y-1">
                <li>• Your account and profile</li>
                <li>• All saved project data</li>
                <li>• Your personalization settings</li>
                <li>• All local data on this device</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 border border-slate-700 text-slate-400 rounded-xl text-sm">Cancel</button>
              <button onClick={() => setStep(2)}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-400 transition-all"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            {!isGoogleUser && (
              <div className="mb-4">
                <label className="text-xs tracking-widest uppercase text-slate-400 mb-2 block">Confirm Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500"
                />
              </div>
            )}

            <div className="mb-5">
              <label className="text-xs tracking-widest uppercase text-slate-400 mb-2 block">
                Type <span className="text-red-400 font-bold">DELETE</span> to confirm
              </label>
              <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2">{error}</p>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3 border border-slate-700 text-slate-400 rounded-xl text-sm">← Back</button>
              <button onClick={handleDelete}
                disabled={loading || confirmText !== "DELETE"}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-400 transition-all disabled:opacity-40"
              >
                {loading ? "Deleting..." : "🗑️ Delete"}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// MAIN SETTINGS
// ============================================================
export default function Settings() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("Profile");
  const [savedMsg, setSavedMsg] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const loadPrefs = () => {
    try {
      const s = localStorage.getItem("user_prefs");
      return s ? JSON.parse(s) : {};
    } catch { return {}; }
  };

  const prefs = loadPrefs();
  const [displayName, setDisplayName] = useState(
    prefs.displayName || auth.currentUser?.displayName || ""
  );
  const [profileImage, setProfileImage] = useState(prefs.profileImage || "");
  const [selectedPreset, setSelectedPreset] = useState(
    Math.max(COLOR_PRESETS.findIndex((p) => p.color1 === prefs.color1), 0)
  );
  const [useCustom, setUseCustom] = useState(
    !!prefs.color1 && !COLOR_PRESETS.some((p) => p.color1 === prefs.color1)
  );
  const [customColor1, setCustomColor1] = useState(prefs.color1 || "#06b6d4");
  const [customColor2, setCustomColor2] = useState(prefs.color2 || "#3b82f6");

  const color1 = useCustom ? customColor1 : (COLOR_PRESETS[selectedPreset]?.color1 || "#06b6d4");
  const color2 = useCustom ? customColor2 : (COLOR_PRESETS[selectedPreset]?.color2 || "#3b82f6");

  const getInitials = (name) => {
    const parts = name.trim().split(" ");
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
  };

  const initials = getInitials(displayName || "KI");

  const savePrefs = (extra = {}) => {
    const current = loadPrefs();
    localStorage.setItem(
      "user_prefs",
      JSON.stringify({
        ...current,
        displayName: displayName.trim(),
        initials: getInitials(displayName),
        color1,
        color2,
        ...extra,
      })
    );
  };

  const handleSave = async () => {
    setError("");
    if (!displayName.trim()) return setError("Name cannot be empty.");
    if (displayName.trim().split(" ").length < 2)
      return setError("Please enter both first and last name.");
    setLoading(true);
    try {
      await updateProfile(auth.currentUser, { displayName: displayName.trim() });
      savePrefs();
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveImage = (imageUrl) => {
    setProfileImage(imageUrl);
    const current = loadPrefs();
    localStorage.setItem(
      "user_prefs",
      JSON.stringify({ ...current, profileImage: imageUrl })
    );
  };

  const handleDeleteImage = () => {
    setProfileImage("");
    const current = loadPrefs();
    delete current.profileImage;
    localStorage.setItem("user_prefs", JSON.stringify(current));
  };

  const inputClass = `w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors ${
    isDark
      ? "bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-600"
      : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400"
  }`;

  return (
    <>
      <AnimatePresence>
        {showImageModal && (
          <ImageModal
            onClose={() => setShowImageModal(false)}
            onSave={handleSaveImage}
            onDelete={handleDeleteImage}
            currentImage={profileImage}
          />
        )}
        {showDeleteModal && (
          <DeleteAccountModal
            onClose={() => setShowDeleteModal(false)}
            onDeleted={() => navigate("/welcome")}
          />
        )}
      </AnimatePresence>

      <div className={`min-h-screen pt-20 md:pt-24 px-5 md:px-10 lg:px-20 pb-20 transition-colors duration-300 ${
        isDark ? "bg-slate-950" : "bg-slate-100"
      }`}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-6 md:mb-10">
          <p className="text-cyan-500 dark:text-cyan-400 text-xs tracking-[0.3em] uppercase mb-2 font-semibold">✦ Preferences</p>
          <h1 className={`text-3xl md:text-4xl font-black mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>Settings</h1>
          <p className="text-slate-500 text-sm">Manage your profile, personalization and account.</p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-4 md:gap-8 max-w-4xl">

          {/* ===== SIDEBAR TABS ===== */}
          {/* Mobile: horizontal scrollable row | Desktop: vertical sidebar */}
          <div className="md:w-48 flex-shrink-0">
            <div className={`flex md:flex-col rounded-2xl border overflow-hidden overflow-x-auto md:overflow-x-visible ${
              isDark ? "bg-slate-900/60 border-slate-700/50" : "bg-white border-slate-200"
            }`}>
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 text-xs tracking-widest uppercase transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab
                      ? isDark
                        ? "text-cyan-400 bg-cyan-500/10 border-b-2 md:border-b-0 md:border-r-2 border-cyan-500"
                        : "text-cyan-600 bg-cyan-500/10 border-b-2 md:border-b-0 md:border-r-2 border-cyan-500"
                      : isDark
                      ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-base">
                    {tab === "Profile" ? "👤" : tab === "Personalization" ? "🎨" : "🔐"}
                  </span>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* ===== CONTENT ===== */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className={`rounded-2xl border p-5 md:p-6 ${
                  isDark ? "bg-slate-900/60 border-slate-700/50" : "bg-white border-slate-200"
                }`}
              >

                {/* ===== PROFILE ===== */}
                {activeTab === "Profile" && (
                  <div>
                    <h2 className={`text-xl font-black mb-5 ${isDark ? "text-white" : "text-slate-900"}`}>
                      Profile Settings
                    </h2>

                    {/* Avatar row */}
                    <div className={`flex flex-wrap items-center gap-4 mb-6 p-4 rounded-xl border ${
                      isDark ? "border-slate-700 bg-slate-800/30" : "border-slate-200 bg-slate-50"
                    }`}>
                      {/* Profile photo */}
                      <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-cyan-500/40">
                          {profileImage ? (
                            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <div className={`w-full h-full flex items-center justify-center ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
                              <span className="text-slate-500 text-xs text-center px-1">No photo</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => setShowImageModal(true)}
                          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-cyan-500 text-white text-xs flex items-center justify-center hover:bg-cyan-400 transition-all shadow-lg"
                        >
                          ✏️
                        </button>
                      </div>

                      {/* Monogram */}
                      <div style={{ filter: `drop-shadow(0 0 10px ${color1}60)` }}>
                        <HexagonMonogram initials={initials} color1={color1} color2={color2} size={55} />
                      </div>

                      {/* Name + photo actions */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                          {displayName || "Your Name"}
                        </p>
                        <p className="text-slate-500 text-xs truncate">{auth.currentUser?.email}</p>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          <button
                            onClick={() => setShowImageModal(true)}
                            className="text-xs text-cyan-500 dark:text-cyan-400 hover:text-cyan-400 transition-colors"
                          >
                            {profileImage ? "Change photo" : "Add photo"}
                          </button>
                          {profileImage && (
                            <>
                              <span className="text-slate-500">·</span>
                              <button
                                onClick={handleDeleteImage}
                                className="text-xs text-red-400 hover:text-red-300 transition-colors"
                              >
                                Remove
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Name input */}
                    <div className="mb-4">
                      <label className="text-xs tracking-widest uppercase text-slate-400 mb-2 block">Full Name</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="First Last"
                        className={inputClass}
                      />
                      <p className="text-slate-500 text-xs mt-1">
                        Appears on your loading screen and landing page.
                      </p>
                    </div>

                    {/* Email (read only) */}
                    <div className="mb-6">
                      <label className="text-xs tracking-widest uppercase text-slate-400 mb-2 block">Email Address</label>
                      <input
                        type="email"
                        value={auth.currentUser?.email || ""}
                        readOnly
                        className={`${inputClass} opacity-50 cursor-not-allowed`}
                      />
                      <p className="text-slate-500 text-xs mt-1">Email cannot be changed here.</p>
                    </div>

                    {error && (
                      <p className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2">{error}</p>
                    )}

                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="w-full sm:w-auto px-6 py-3 bg-cyan-500 text-white rounded-xl text-sm font-semibold tracking-widest uppercase hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50"
                    >
                      {loading ? "Saving..." : savedMsg ? "✓ Saved!" : "Save Profile"}
                    </button>
                  </div>
                )}

                {/* ===== PERSONALIZATION ===== */}
                {activeTab === "Personalization" && (
                  <div>
                    <h2 className={`text-xl font-black mb-5 ${isDark ? "text-white" : "text-slate-900"}`}>
                      Personalization
                    </h2>

                    {/* Dark mode toggle */}
                    <div className={`flex items-center justify-between p-4 rounded-xl border mb-6 ${
                      isDark ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-slate-50"
                    }`}>
                      <div>
                        <p className={`font-semibold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>Dark Mode</p>
                        <p className="text-slate-500 text-xs">Switch between dark and light theme</p>
                      </div>
                      <motion.button
                        onClick={toggleTheme}
                        whileTap={{ scale: 0.9 }}
                        className={`relative w-14 h-7 rounded-full border transition-all duration-300 flex items-center px-1 flex-shrink-0 ${
                          isDark ? "bg-slate-700 border-slate-600" : "bg-slate-200 border-slate-300"
                        }`}
                      >
                        <motion.div
                          animate={{ x: isDark ? 0 : 28 }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                            isDark ? "bg-slate-500" : "bg-white shadow-sm"
                          }`}
                        >
                          {isDark ? "🌙" : "☀️"}
                        </motion.div>
                      </motion.button>
                    </div>

                    {/* Monogram preview */}
                    <div className="flex flex-col items-center mb-6">
                      <motion.div
                        animate={{
                          filter: [
                            `drop-shadow(0 0 8px ${color1}60)`,
                            `drop-shadow(0 0 16px ${color1}90)`,
                            `drop-shadow(0 0 8px ${color1}60)`,
                          ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <HexagonMonogram initials={initials} color1={color1} color2={color2} size={80} />
                      </motion.div>
                      <p className="text-slate-500 text-xs mt-2 tracking-widest uppercase">Monogram Preview</p>
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
                                : "border-transparent hover:border-slate-500"
                            }`}
                            style={{ background: `linear-gradient(135deg, ${preset.color1}, ${preset.color2})` }}
                          >
                            {!useCustom && selectedPreset === i && (
                              <span className="absolute inset-0 flex items-center justify-center text-white text-xs">✓</span>
                            )}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => setUseCustom((p) => !p)}
                        className={`w-full py-2 rounded-xl border text-xs tracking-widest uppercase transition-all ${
                          useCustom
                            ? "border-cyan-500 text-cyan-400 bg-cyan-500/10"
                            : isDark
                            ? "border-slate-700 text-slate-500 hover:border-slate-600"
                            : "border-slate-200 text-slate-400 hover:border-slate-300"
                        }`}
                      >
                        {useCustom ? "✓ Custom Colors Active" : "Use Custom Colors"}
                      </button>

                      {useCustom && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-3 grid grid-cols-2 gap-3"
                        >
                          {[
                            ["Color 1", customColor1, setCustomColor1],
                            ["Color 2", customColor2, setCustomColor2],
                          ].map(([label, val, setter]) => (
                            <div key={label}>
                              <p className="text-xs text-slate-500 mb-1">{label}</p>
                              <div className={`flex items-center gap-2 border rounded-xl px-3 py-2 ${
                                isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                              }`}>
                                <input
                                  type="color"
                                  value={val}
                                  onChange={(e) => setter(e.target.value)}
                                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                                />
                                <span className="text-slate-400 text-xs font-mono truncate">{val}</span>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </div>

                    {error && (
                      <p className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2">{error}</p>
                    )}

                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="w-full sm:w-auto px-6 py-3 bg-cyan-500 text-white rounded-xl text-sm font-semibold tracking-widest uppercase hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50"
                    >
                      {loading ? "Saving..." : savedMsg ? "✓ Saved!" : "Save Changes"}
                    </button>
                  </div>
                )}

                {/* ===== ACCOUNT ===== */}
                {activeTab === "Account" && (
                  <div>
                    <h2 className={`text-xl font-black mb-5 ${isDark ? "text-white" : "text-slate-900"}`}>
                      Account
                    </h2>

                    {/* Account info cards */}
                    <div className={`p-4 rounded-xl border mb-3 ${
                      isDark ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-slate-50"
                    }`}>
                      <p className={`font-semibold text-sm mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>Signed in as</p>
                      <p className="text-slate-500 text-sm truncate">{auth.currentUser?.email}</p>
                    </div>

                    <div className={`p-4 rounded-xl border mb-6 ${
                      isDark ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-slate-50"
                    }`}>
                      <p className={`font-semibold text-sm mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>Account created</p>
                      <p className="text-slate-500 text-sm">
                        {auth.currentUser?.metadata?.creationTime
                          ? new Date(auth.currentUser.metadata.creationTime).toLocaleDateString("en-US", {
                              year: "numeric", month: "long", day: "numeric",
                            })
                          : "Unknown"}
                      </p>
                    </div>

                    {/* Sign out */}
                    <button
                      onClick={async () => { await auth.signOut(); navigate("/welcome"); }}
                      className={`w-full py-3 border rounded-xl text-sm tracking-widest uppercase transition-all mb-3 ${
                        isDark
                          ? "border-slate-600 text-slate-400 hover:bg-slate-800/50"
                          : "border-slate-300 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      🚪 Sign Out
                    </button>

                    {/* Divider */}
                    <div className={`my-5 h-px ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />

                    {/* Danger zone */}
                    <div className="border border-red-500/20 rounded-xl p-4">
                      <p className="text-red-400 font-bold text-sm mb-1">⚠️ Danger Zone</p>
                      <p className="text-slate-500 text-xs mb-4">
                        Deleting your account is permanent. All your data and settings will be erased and cannot be recovered.
                      </p>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="w-full py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm tracking-widest uppercase hover:bg-red-500/20 transition-all font-semibold"
                      >
                        🗑️ Delete Account
                      </button>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}
