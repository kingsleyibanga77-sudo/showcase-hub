import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

// ============================================================
// IMAGE MODAL
// ============================================================
function ImageModal({ onClose, onSave, onDelete, currentImage }) {
  const [tab, setTab] = useState("url");
  const [url, setUrl] = useState(currentImage && !currentImage.includes("placehold") ? currentImage : "");
  const [preview, setPreview] = useState(currentImage || "");
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setPreview(ev.target.result); setUrl(ev.target.result); };
    reader.readAsDataURL(file);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-white font-black text-lg">Change Profile Image</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-xl">✕</button>
        </div>
        <div className="flex gap-2 mb-5">
          {["url", "upload"].map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-xs tracking-widest uppercase border transition-all ${
                tab === t ? "bg-cyan-500/20 border-cyan-500 text-cyan-400" : "border-slate-700 text-slate-500"
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
              📁 Click to select image
            </button>
          </div>
        )}
        {preview && (
          <div className="mb-5 text-center">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-cyan-500/40 mx-auto">
              <img src={preview} alt="preview" className="w-full h-full object-cover" onError={() => setPreview("")} />
            </div>
          </div>
        )}
        <div className="flex gap-3">
          {currentImage && !currentImage.includes("placehold") && (
            <button onClick={() => { onDelete(); onClose(); }}
              className="px-4 py-2.5 border border-red-500/30 text-red-400 rounded-xl text-sm hover:bg-red-500/10 transition-all"
            >🗑️</button>
          )}
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-700 text-slate-400 rounded-xl text-sm">Cancel</button>
          <button onClick={() => { if (url) { onSave(url); onClose(); } }} disabled={!url}
            className="flex-1 py-2.5 bg-cyan-500 text-white rounded-xl text-sm font-semibold hover:bg-cyan-400 transition-all disabled:opacity-40"
          >Save</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// FLOATING IMAGE
// ============================================================
function FloatingImage({ onImageClick, profileImage, isDark }) {
  return (
    <div className="relative flex items-center justify-center w-full h-full min-h-[300px]">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute w-48 h-48 md:w-80 md:h-80 rounded-full border border-cyan-500/20" style={{ borderStyle: "dashed" }}
      />
      <motion.div animate={{ rotate: -360 }} transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        className="absolute w-40 h-40 md:w-64 md:h-64 rounded-full border border-blue-400/20" style={{ borderStyle: "dashed" }}
      />
      <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 3.5, repeat: Infinity }}
        className="absolute w-32 h-32 md:w-52 md:h-52 rounded-full bg-cyan-500/15 blur-3xl"
      />

      <motion.div animate={{ y: [-8, 8, -8] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 w-32 h-32 md:w-48 md:h-48 rounded-full p-[3px] cursor-pointer group"
        style={{ background: "linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6)" }}
        onClick={onImageClick}
      >
        <div className={`w-full h-full rounded-full overflow-hidden relative ${isDark ? "bg-slate-900" : "bg-slate-100"}`}>
          <img
            src={profileImage || "https://placehold.co/200x200/0f172a/06b6d4?text=KI"}
            alt="Profile"
            className="w-full h-full object-cover rounded-full"
          />
          <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <p className="text-white text-xs font-semibold">📷 Change</p>
          </div>
        </div>
      </motion.div>

      {/* Desktop badges */}
      <div className="hidden md:block">
        {[
          { label: "React", angle: 0 },
          { label: "Node.js", angle: 72 },
          { label: "Web3", angle: 144 },
          { label: "Python", angle: 216 },
          { label: "Data", angle: 288 },
        ].map(({ label, angle }) => {
          const radius = 140;
          const rad = (angle * Math.PI) / 180;
          const x = Math.cos(rad) * radius;
          const y = Math.sin(rad) * radius;
          return (
            <motion.div key={label}
              animate={{ y: [y - 5, y + 5, y - 5] }}
              transition={{ duration: 3 + angle * 0.01, repeat: Infinity, delay: angle * 0.01 }}
              style={{ position: "absolute", left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
              className={`-translate-x-1/2 -translate-y-1/2 border text-xs px-3 py-1 rounded-lg backdrop-blur-sm ${
                isDark
                  ? "bg-slate-900/90 border-cyan-500/30 text-cyan-300"
                  : "bg-white/90 border-cyan-500/30 text-cyan-600 shadow-sm"
              }`}
            >
              {label}
            </motion.div>
          );
        })}
      </div>

      {/* Mobile badges */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 flex justify-center flex-wrap gap-2 px-4">
        {["React", "Node.js", "Web3", "Python"].map((label) => (
          <span key={label} className={`border text-xs px-2 py-1 rounded-lg ${
            isDark
              ? "bg-slate-900/90 border-cyan-500/30 text-cyan-300"
              : "bg-white/90 border-cyan-500/30 text-cyan-600 shadow-sm"
          }`}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// WHAT'S INSIDE
// ============================================================
function WhatsInside({ isDark }) {
  const items = [
    { icon: "🗂️", title: "Projects", desc: "Case study style project pages with problem, solution, process and results." },
    { icon: "🧠", title: "Skills", desc: "Track proficiency across all your languages and tools with animated bars." },
    { icon: "🔗", title: "GitHub", desc: "Live repository sync — your latest work always up to date." },
    { icon: "⚙️", title: "Settings", desc: "Full personalization — colors, monogram, profile image and more." },
  ];

  return (
    <section className="relative z-10 px-6 md:px-16 pb-16 md:pb-24">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px flex-1 bg-cyan-500/20" />
          <p className="text-cyan-500 dark:text-cyan-400 text-xs tracking-[0.4em] uppercase font-semibold flex-shrink-0">✦ What's Inside</p>
          <div className="h-px flex-1 bg-cyan-500/20" />
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {items.map((item, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-2xl p-4 border transition-all duration-300 hover:border-cyan-500/30 ${
              isDark
                ? "bg-slate-900/60 border-cyan-500/10"
                : "bg-white border-slate-200 shadow-sm hover:shadow-md"
            }`}
          >
            <span className="text-2xl mb-2 block">{item.icon}</span>
            <p className={`font-bold text-sm mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>{item.title}</p>
            <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ============================================================
// LANDING FOOTER BAR
// ============================================================
function LandingFooter({ isDark }) {
  return (
    <footer className={`relative z-10 border-t ${
      isDark ? "border-cyan-500/10 bg-slate-950/80" : "border-slate-200 bg-white/80"
    }`}>
      <div className="px-6 md:px-16 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <span className={`font-black text-lg ${isDark ? "text-white" : "text-slate-900"}`}>
            KI<span className="text-cyan-400">.</span>
          </span>
          <span className="text-slate-500 text-xs">Showcase Hub</span>
        </div>

        <div className="flex items-center gap-4">
          {[
            { label: "GitHub", href: "https://github.com/kingsleyibanga77-sudo" },
            { label: "LinkedIn", href: "#" },
            { label: "Twitter", href: "#" },
          ].map(({ label, href }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer"
              className={`text-xs transition-colors duration-200 ${
                isDark ? "text-slate-600 hover:text-cyan-400" : "text-slate-400 hover:text-cyan-600"
              }`}
            >
              {label}
            </a>
          ))}
        </div>

        <div className={`flex items-center gap-3 text-xs ${isDark ? "text-slate-700" : "text-slate-400"}`}>
          <Link to="/welcome" className="hover:text-slate-500 transition-colors">Privacy</Link>
          <span>·</span>
          <Link to="/welcome" className="hover:text-slate-500 transition-colors">Terms</Link>
          <span>·</span>
          <span>© {new Date().getFullYear()} KI.</span>
        </div>
      </div>
    </footer>
  );
}

// ============================================================
// MAIN LANDING PAGE
// ============================================================
export default function Landing() {
  const navigate = useNavigate();
  const ref = useRef(null);
  const { isDark } = useTheme();
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const prefs = (() => {
    try { const s = localStorage.getItem("user_prefs"); return s ? JSON.parse(s) : null; } catch { return null; }
  })();

  const [profileImage, setProfileImage] = useState(prefs?.profileImage || "");
  const firstName = prefs?.displayName?.split(" ")[0] || "there";

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [6, -6]), { stiffness: 80, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-6, 6]), { stiffness: 80, damping: 20 });

  const handleMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleSaveImage = (imageUrl) => {
    setProfileImage(imageUrl);
    try {
      const s = localStorage.getItem("user_prefs");
      const current = s ? JSON.parse(s) : {};
      localStorage.setItem("user_prefs", JSON.stringify({ ...current, profileImage: imageUrl }));
    } catch {}
  };

  const handleDeleteImage = () => {
    setProfileImage("");
    try {
      const s = localStorage.getItem("user_prefs");
      const current = s ? JSON.parse(s) : {};
      delete current.profileImage;
      localStorage.setItem("user_prefs", JSON.stringify(current));
    } catch {}
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={`relative min-h-screen overflow-hidden cursor-none flex flex-col transition-colors duration-300 ${
        isDark ? "bg-slate-950" : "bg-slate-50"
      }`}
    >
      <AnimatePresence>
        {showImageModal && (
          <ImageModal
            onClose={() => setShowImageModal(false)}
            onSave={handleSaveImage}
            onDelete={handleDeleteImage}
            currentImage={profileImage}
          />
        )}
      </AnimatePresence>

      {/* Background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{
            background: isDark
              ? [
                  "radial-gradient(ellipse at 20% 50%, rgba(6,182,212,0.10) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.08) 0%, transparent 60%)",
                  "radial-gradient(ellipse at 70% 80%, rgba(139,92,246,0.10) 0%, transparent 60%), radial-gradient(ellipse at 20% 20%, rgba(6,182,212,0.07) 0%, transparent 60%)",
                  "radial-gradient(ellipse at 20% 50%, rgba(6,182,212,0.10) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.08) 0%, transparent 60%)",
                ]
              : [
                  "radial-gradient(ellipse at 20% 50%, rgba(6,182,212,0.07) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.05) 0%, transparent 60%)",
                  "radial-gradient(ellipse at 70% 80%, rgba(139,92,246,0.06) 0%, transparent 60%), radial-gradient(ellipse at 20% 20%, rgba(6,182,212,0.05) 0%, transparent 60%)",
                  "radial-gradient(ellipse at 20% 50%, rgba(6,182,212,0.07) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.05) 0%, transparent 60%)",
                ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0"
        />
        <div
          className={`absolute inset-0 ${isDark ? "opacity-[0.03]" : "opacity-[0.04]"}`}
          style={{
            backgroundImage: `linear-gradient(${isDark ? "rgba(6,182,212,1)" : "rgba(6,182,212,0.4)"} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? "rgba(6,182,212,1)" : "rgba(6,182,212,0.4)"} 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Divider */}
      <div className={`absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent hidden md:block z-10`} />

      {/* Main hero */}
      <div className="relative z-10 grid md:grid-cols-2 flex-1">

        {/* LEFT — Text */}
        <motion.div
          style={{ rotateX, rotateY, transformPerspective: 1000 }}
          className="flex flex-col justify-center px-6 md:px-16 pt-28 pb-8 md:py-32"
        >
          <motion.p
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
  className="text-cyan-500 dark:text-cyan-400 text-xs tracking-[0.4em] uppercase mb-4 font-medium"
>
  ✦ Welcome,
</motion.p>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="text-5xl sm:text-6xl md:text-7xl font-black leading-none mb-4"
          >
            <span className={isDark ? "text-white" : "text-slate-900"}>
  {prefs?.displayName?.split(" ")[0] || "Kingsley"}
</span>
<br />
<span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg, #06b6d4, #3b82f6)" }}>
  {prefs?.displayName?.split(" ")[1] || "Ibanga"}
</span>
          </motion.h1>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
            className="flex items-center gap-3 my-4"
          >
            <div className="h-px w-8 bg-cyan-500 flex-shrink-0" />
            <p className={`text-xs tracking-widest uppercase ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Developer · Data Engineer · Web3 Builder
            </p>
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className={`max-w-sm leading-relaxed mb-8 text-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}
          >
            I build scalable web apps, data pipelines, and Web3 solutions. Turning complex problems into clean, elegant code.
          </motion.p>

          {/* Buttons */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
            className="flex gap-3 flex-wrap"
          >
            {hoveredBtn && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="fixed inset-0 bg-black/30 z-10 pointer-events-none"
              />
            )}

            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              onMouseEnter={() => setHoveredBtn("explore")}
              onMouseLeave={() => setHoveredBtn(null)}
              onClick={() => navigate("/projects")}
              className="relative z-20 px-6 py-3 rounded-xl font-semibold text-sm tracking-widest uppercase bg-cyan-500 text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:shadow-[0_0_50px_rgba(34,211,238,0.7)] transition-all duration-300"
            >
              Explore Work
            </motion.button>

            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              onMouseEnter={() => setHoveredBtn("github")}
              onMouseLeave={() => setHoveredBtn(null)}
              onClick={() => window.open("https://github.com/kingsleyibanga77-sudo", "_blank")}
              className={`relative z-20 px-6 py-3 rounded-xl font-semibold text-sm tracking-widest uppercase border transition-all duration-300 ${
                isDark
                  ? "border-cyan-500/60 text-cyan-300 hover:border-cyan-300 hover:bg-cyan-500/10"
                  : "border-cyan-500/60 text-cyan-600 hover:border-cyan-500 hover:bg-cyan-500/10"
              }`}
            >
              GitHub
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
            className="flex gap-6 mt-10"
          >
            {[["3+", "Years Exp."], ["10+", "Projects"], ["5+", "Technologies"]].map(([num, label]) => (
              <div key={label}>
                <p className="text-xl md:text-2xl font-bold text-cyan-500 dark:text-cyan-400">{num}</p>
                <p className={`text-xs tracking-wider uppercase ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  {label}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* RIGHT — Floating Image */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}
          className="flex items-center justify-center py-8 md:py-32 px-6"
        >
          <FloatingImage
            onImageClick={() => setShowImageModal(true)}
            profileImage={profileImage}
            isDark={isDark}
          />
        </motion.div>
      </div>

      {/* What's Inside */}
      <WhatsInside isDark={isDark} />

      {/* Footer */}
      <LandingFooter isDark={isDark} />
    </div>
  );
}
