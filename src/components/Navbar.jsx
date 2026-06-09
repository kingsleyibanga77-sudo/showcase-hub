import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ onAddProject }) {
  const [scrolled, setScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);

  const prefs = (() => {
    try {
      const saved = localStorage.getItem("user_prefs");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  })();

  // Load projects for dropdown
  const allProjects = (() => {
    try {
      const custom = localStorage.getItem("custom_projects");
      const customProjects = custom ? JSON.parse(custom) : [];
      const deleted = localStorage.getItem("deleted_default_projects");
      const deletedIds = deleted ? JSON.parse(deleted) : [];
      const { default: defaultProjects } = require("../data/projects");
      const visibleDefaults = defaultProjects.filter((p) => !deletedIds.includes(p.id));
      return [...visibleDefaults, ...customProjects];
    } catch { return []; }
  })();

  const displayName = prefs?.displayName || user?.displayName || user?.email || "User";
  const initials = prefs?.initials || displayName[0]?.toUpperCase() || "U";
  const color1 = prefs?.color1 || "#06b6d4";
  const color2 = prefs?.color2 || "#3b82f6";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/welcome");
  };

  const navBg = scrolled || mobileOpen
    ? isDark
      ? "bg-slate-950/95 backdrop-blur-md border-b border-slate-800/60"
      : "bg-white/95 backdrop-blur-md border-b border-slate-200"
    : "";

  return (
    <>
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${navBg}`}
      >
        <div className="flex justify-between items-center px-6 md:px-10 py-4">

          {/* Logo */}
          <Link
            to="/home"
            className={`font-black text-xl tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}
          >
            KI<span className="text-cyan-400">.</span>
            <span className={`text-sm font-normal ml-2 hidden sm:inline ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              Showcase
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex gap-6 items-center">

            {/* Projects dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onMouseEnter={() => setShowDropdown(true)}
                onMouseLeave={() => setShowDropdown(false)}
                onClick={() => setShowDropdown((p) => !p)}
                className={`flex items-center gap-1 text-xs tracking-widest uppercase transition-colors duration-200 ${
                  location.pathname === "/projects"
                    ? "text-cyan-400"
                    : isDark ? "text-slate-400 hover:text-cyan-400" : "text-slate-500 hover:text-cyan-500"
                }`}
              >
                Projects
                <motion.span animate={{ rotate: showDropdown ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-[10px] mt-0.5">▾</motion.span>
              </button>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    onMouseEnter={() => setShowDropdown(true)}
                    onMouseLeave={() => setShowDropdown(false)}
                    className={`absolute top-full left-0 mt-2 w-52 rounded-2xl border shadow-2xl overflow-hidden ${
                      isDark ? "bg-slate-900 border-slate-700/50" : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="p-1.5">
                      <Link to="/projects" onClick={() => setShowDropdown(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
                          isDark ? "text-slate-300 hover:bg-slate-800 hover:text-cyan-400" : "text-slate-600 hover:bg-slate-50 hover:text-cyan-600"
                        }`}
                      >
                        <span className="text-base">🗂️</span>
                        <div>
                          <p className="font-semibold tracking-wider uppercase">View Projects</p>
                          <p className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>Browse your showcase</p>
                        </div>
                      </Link>

                      <button onClick={() => { setShowDropdown(false); onAddProject && onAddProject(); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
                          isDark ? "text-slate-300 hover:bg-slate-800 hover:text-cyan-400" : "text-slate-600 hover:bg-slate-50 hover:text-cyan-600"
                        }`}
                      >
                        <span className="text-base">➕</span>
                        <div className="text-left">
                          <p className="font-semibold tracking-wider uppercase">Add Project</p>
                          <p className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>Create a new entry</p>
                        </div>
                      </button>

                      {/* Projects list */}
                      {allProjects.length > 0 && (
                        <>
                          <div className={`my-1 h-px ${isDark ? "bg-slate-800" : "bg-slate-100"}`} />
                          <p className={`px-3 py-1 text-[10px] tracking-widest uppercase ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                            Your Projects
                          </p>
                          <div className="max-h-44 overflow-y-auto">
                            {allProjects.map((project) => (
                              <Link key={project.id} to={`/project/${project.id}`}
                                onClick={() => setShowDropdown(false)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all ${
                                  isDark ? "text-slate-400 hover:bg-slate-800 hover:text-cyan-400" : "text-slate-500 hover:bg-slate-50 hover:text-cyan-600"
                                }`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 flex-shrink-0" />
                                <span className="truncate flex-1 font-medium">{project.title}</span>
                                <span className={`text-[9px] flex-shrink-0 ${
                                  project.status === "Live" ? "text-green-400" :
                                  project.status === "In Progress" ? "text-yellow-400" :
                                  "text-slate-600"
                                }`}>{project.status}</span>
                              </Link>
                            ))}
                          </div>
                        </>
                      )}

                      <div className={`my-1 h-px ${isDark ? "bg-slate-800" : "bg-slate-100"}`} />

                      <Link to="/settings" onClick={() => setShowDropdown(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
                          isDark ? "text-slate-300 hover:bg-slate-800 hover:text-cyan-400" : "text-slate-600 hover:bg-slate-50 hover:text-cyan-600"
                        }`}
                      >
                        <span className="text-base">⚙️</span>
                        <div>
                          <p className="font-semibold tracking-wider uppercase">Settings</p>
                          <p className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>Personalize your hub</p>
                        </div>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* GitHub */}
            <a href="https://github.com/kingsleyibanga77-sudo" target="_blank" rel="noreferrer"
              className="text-xs tracking-widest uppercase px-4 py-2 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-500/10 transition-all duration-200"
            >
              GitHub
            </a>

            {/* Theme toggle */}
            <motion.button onClick={toggleTheme} whileTap={{ scale: 0.9 }}
              className={`relative w-14 h-7 rounded-full border transition-all duration-300 flex items-center px-1 ${
                isDark ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-300"
              }`}
            >
              <motion.div
                animate={{ x: isDark ? 0 : 28 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${isDark ? "bg-slate-600" : "bg-white shadow-sm"}`}
              >
                {isDark ? "🌙" : "☀️"}
              </motion.div>
            </motion.button>

            {/* User avatar */}
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setShowUserMenu((p) => !p)}
                className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm text-white hover:scale-110 transition-transform"
                style={{ background: `linear-gradient(135deg, ${color1}, ${color2})` }}
              >
                {initials}
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute top-full right-0 mt-2 w-52 rounded-2xl border shadow-2xl overflow-hidden ${
                      isDark ? "bg-slate-900 border-slate-700/50" : "bg-white border-slate-200"
                    }`}
                  >
                    <div className={`px-4 py-3 border-b ${isDark ? "border-slate-800" : "border-slate-100"}`}>
                      <p className={`font-bold text-sm truncate ${isDark ? "text-white" : "text-slate-900"}`}>{displayName}</p>
                      <p className="text-slate-500 text-xs truncate">{user?.email}</p>
                    </div>
                    <div className="p-1.5">
                      <Link to="/settings" onClick={() => setShowUserMenu(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
                          isDark ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span>⚙️</span>
                        <span className="tracking-widest uppercase font-semibold">Settings</span>
                      </Link>

                      <button
                        onClick={() => {
                          const shareUrl = `${window.location.origin}/view/${encodeURIComponent(prefs?.username || displayName)}`;
                          navigator.clipboard.writeText(shareUrl);
                          setShowUserMenu(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
                          isDark ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span>🔗</span>
                        <span className="tracking-widest uppercase font-semibold">Copy Share Link</span>
                      </button>

                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <span>🚪</span>
                        <span className="tracking-widest uppercase font-semibold">Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile right side */}
          <div className="flex md:hidden items-center gap-3">
            {/* Theme toggle - mobile */}
            <motion.button onClick={toggleTheme} whileTap={{ scale: 0.9 }}
              className={`relative w-12 h-6 rounded-full border flex items-center px-0.5 ${
                isDark ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-300"
              }`}
            >
              <motion.div
                animate={{ x: isDark ? 0 : 24 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${isDark ? "bg-slate-600" : "bg-white shadow-sm"}`}
              >
                {isDark ? "🌙" : "☀️"}
              </motion.div>
            </motion.button>

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen((p) => !p)}
              className={`flex flex-col gap-1.5 p-2 rounded-lg transition-colors ${
                isDark ? "hover:bg-slate-800" : "hover:bg-slate-100"
              }`}
            >
              <motion.span
                animate={{ rotate: mobileOpen ? 45 : 0, y: mobileOpen ? 7 : 0 }}
                className={`block w-5 h-0.5 transition-colors ${isDark ? "bg-slate-300" : "bg-slate-700"}`}
              />
              <motion.span
                animate={{ opacity: mobileOpen ? 0 : 1 }}
                className={`block w-5 h-0.5 ${isDark ? "bg-slate-300" : "bg-slate-700"}`}
              />
              <motion.span
                animate={{ rotate: mobileOpen ? -45 : 0, y: mobileOpen ? -7 : 0 }}
                className={`block w-5 h-0.5 ${isDark ? "bg-slate-300" : "bg-slate-700"}`}
              />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`md:hidden border-t overflow-hidden ${
                isDark ? "border-slate-800 bg-slate-950" : "border-slate-200 bg-white"
              }`}
            >
              <div className="px-6 py-4 space-y-1">
                {/* User info */}
                <div className={`flex items-center gap-3 p-3 rounded-xl mb-3 ${isDark ? "bg-slate-900" : "bg-slate-50"}`}>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-white flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${color1}, ${color2})` }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className={`font-bold text-sm truncate ${isDark ? "text-white" : "text-slate-900"}`}>{displayName}</p>
                    <p className="text-slate-500 text-xs truncate">{user?.email}</p>
                  </div>
                </div>

                {/* Links */}
                {[
                  { label: "🏠 Home", to: "/home" },
                  { label: "🗂️ View Projects", to: "/projects" },
                  { label: "⚙️ Settings", to: "/settings" },
                  { label: "🛟 Support", to: "/support" },
                  { label: "ℹ️ Welcome Page", to: "/welcome" },
                ].map(({ label, to }) => (
                  <Link key={to} to={to}
                    className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      location.pathname === to
                        ? "text-cyan-400 bg-cyan-500/10"
                        : isDark ? "text-slate-300 hover:bg-slate-800 hover:text-white" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {label}
                  </Link>
                ))}

                <button
                  onClick={() => { setMobileOpen(false); onAddProject && onAddProject(); }}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-cyan-400 hover:bg-cyan-500/10 transition-all"
                >
                  ➕ Add Project
                </button>

                <a href="https://github.com/kingsleyibanga77-sudo" target="_blank" rel="noreferrer"
                  className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isDark ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  🐙 GitHub
                </a>

                <div className={`my-2 h-px ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />

                <button onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all"
                >
                  🚪 Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
