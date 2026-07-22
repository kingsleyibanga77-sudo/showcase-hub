import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { auth } from "../firebase";
import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = "service_oz62xty";
const EMAILJS_TEMPLATE_ID = "template_0fo013f";
const EMAILJS_PUBLIC_KEY = "uUuXugMU6l--bwDKw";

const REPORT_TYPES = [
  {
    id: "bug",
    label: "Bug Report",
    icon: "🐛",
    color: "from-red-500/20 to-orange-500/20",
    border: "border-red-500/20 hover:border-red-500/50",
    activeBorder: "border-red-500",
    activeBg: "bg-red-500/10",
    activeText: "text-red-400",
    desc: "Something isn't working as expected",
    githubLabel: "bug",
  },
  {
    id: "feature",
    label: "Feature Request",
    icon: "💡",
    color: "from-yellow-500/20 to-amber-500/20",
    border: "border-yellow-500/20 hover:border-yellow-500/50",
    activeBorder: "border-yellow-500",
    activeBg: "bg-yellow-500/10",
    activeText: "text-yellow-400",
    desc: "Suggest a new feature or improvement",
    githubLabel: "enhancement",
  },
  {
    id: "complaint",
    label: "General Complaint",
    icon: "📢",
    color: "from-violet-500/20 to-purple-500/20",
    border: "border-violet-500/20 hover:border-violet-500/50",
    activeBorder: "border-violet-500",
    activeBg: "bg-violet-500/10",
    activeText: "text-violet-400",
    desc: "General feedback or concerns",
    githubLabel: "question",
  },
];

const SEVERITY_OPTIONS = ["Low", "Medium", "High", "Critical"];

const FAQ_ITEMS = [
  {
    q: "Why can't I upload images from my device?",
    a: "Make sure you're clicking the '📁 Upload Files' tab inside the image uploader and then clicking the button. Your browser may also ask for permission to access files.",
  },
  {
    q: "My changes aren't saving after I refresh.",
    a: "All data is stored in your browser's localStorage. Clearing your browser data or using incognito mode will erase saved changes. We're working on cloud sync.",
  },
  {
    q: "The GitHub repos aren't loading.",
    a: "GitHub's API has rate limits. If you've loaded the page many times, you may need to wait a few minutes before repos appear again.",
  },
  {
    q: "I forgot my password.",
    a: "On the login page, click 'Forgot password?' and enter your email. You'll receive a reset link within a few minutes.",
  },
  {
    q: "How do I delete a project I added?",
    a: "Go to the project's detail page, click '✏️ Edit' in the top right, then scroll to the bottom and click the delete button.",
  },
  {
    q: "Can I use this on my phone?",
    a: "Yes! The site is fully mobile responsive. All features work on both desktop and mobile browsers.",
  },
];

// ============================================================
// SUCCESS MODAL
// ============================================================
function SuccessModal({ type, onClose }) {
  const reportType = REPORT_TYPES.find((r) => r.id === type);
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
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700 rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
          className="text-5xl mb-4"
        >
          ✅
        </motion.div>
        <h3 className="text-white font-black text-xl mb-2">Report Submitted!</h3>
        <p className="text-slate-400 text-sm mb-2">
          Your <span className="text-cyan-400">{reportType?.label}</span> has been received.
        </p>
        <p className="text-slate-500 text-xs mb-6">
          We'll look into it and get back to you if needed. Thank you for helping improve Showcase Hub!
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 bg-cyan-500 text-white rounded-xl text-sm font-semibold hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
        >
          Done
        </button>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// FAQ ITEM
// ============================================================
function FAQItem({ item, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="border border-slate-200 dark:border-slate-700/50 rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <span className="text-slate-900 dark:text-white font-semibold text-sm pr-4">{item.q}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-slate-400 flex-shrink-0 text-xs"
        >
          ▾
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-700/50">
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{item.a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================
// MAIN SUPPORT PAGE
// ============================================================
export default function Support() {
  const user = auth.currentUser;
  const [selectedType, setSelectedType] = useState("bug");
  const [severity, setSeverity] = useState("Medium");
  const [subject, setSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("report");

  const selectedTypeData = REPORT_TYPES.find((r) => r.id === selectedType);

  // Build GitHub issue URL
  const buildGitHubUrl = () => {
    const title = encodeURIComponent(finalSubject || `[${selectedTypeData?.label}] Issue`);
    const body = encodeURIComponent(
      `**Type:** ${selectedTypeData?.label}\n**Severity:** ${severity}\n\n**Description:**\n${description}\n\n${
        selectedType === "bug" && steps ? `**Steps to reproduce:**\n${steps}` : ""
      }\n\n**Reported by:** ${user?.email || "Anonymous"}`
    );
    const labels = encodeURIComponent(selectedTypeData?.githubLabel || "");
    return `https://github.com/showcase-hub-app/showcase-hub/issues/new?title=${title}&body=${body}&labels=${labels}`;
  };

  const finalSubject = subject === "other" ? customSubject : subject;

  const handleSubmit = async () => {
    setError("");
    if (!finalSubject.trim()) return setError("Please enter a subject.");
    if (!description.trim()) return setError("Please describe the issue.");

    setLoading(true);
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_email: user?.email || "Anonymous",
          from_name: user?.displayName || user?.email || "Anonymous",
          report_type: selectedTypeData?.label,
          subject: finalSubject,
          severity: selectedType === "bug" ? severity : "N/A",
          description,
          steps: selectedType === "bug" && steps ? steps : "N/A",
        },
        EMAILJS_PUBLIC_KEY
      );
      setShowSuccess(true);
      setSubject("");
      setCustomSubject("");
      setDescription("");
      setSteps("");
      setSeverity("Medium");
    } catch (err) {
      console.error("EmailJS error:", err);
      setError("Failed to send. Please try the GitHub Issues option instead.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors";

  return (
    <>
      <AnimatePresence>
        {showSuccess && (
          <SuccessModal type={selectedType} onClose={() => setShowSuccess(false)} />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 pt-20 md:pt-28 px-5 md:px-10 lg:px-20 pb-20 transition-colors duration-300">

        {/* ===== HEADER ===== */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 md:mb-12"
        >
          <p className="text-cyan-500 dark:text-cyan-400 text-xs tracking-[0.3em] uppercase mb-2 font-semibold">
            ✦ Help Center
          </p>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-3">
            Support
          </h1>
          <p className="text-slate-500 dark:text-slate-500 max-w-lg text-sm leading-relaxed">
            Found a bug? Have a suggestion? Need help? We're here for it.
            Submit a report or browse the FAQs below.
          </p>

          {/* User info */}
          {user && (
            <div className="mt-4 inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl px-4 py-2">
              <span className="text-cyan-500 dark:text-cyan-400 text-xs">Reporting as:</span>
              <span className="text-slate-700 dark:text-slate-300 text-xs font-semibold">{user.email}</span>
            </div>
          )}
        </motion.div>

        {/* ===== SECTION TOGGLE ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-8 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {[
            { id: "report", label: "📝 Submit Report" },
            { id: "faq", label: "❓ FAQs" },
            { id: "github", label: "🐙 GitHub Issues" },
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex-shrink-0 text-xs tracking-widest uppercase px-5 py-2.5 rounded-xl border transition-all duration-200 ${
                activeSection === section.id
                  ? "bg-cyan-500/20 border-cyan-500 text-cyan-600 dark:text-cyan-400"
                  : "border-slate-300 dark:border-slate-700 text-slate-500 hover:border-cyan-400 hover:text-cyan-600"
              }`}
            >
              {section.label}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">

          {/* ===== SUBMIT REPORT ===== */}
          {activeSection === "report" && (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl"
            >
              {/* Report type selector */}
              <div className="mb-6">
                <p className="text-xs tracking-widest uppercase text-slate-400 dark:text-slate-500 mb-3 font-semibold">
                  Report Type
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {REPORT_TYPES.map((type) => (
                    <motion.button
                      key={type.id}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedType(type.id)}
                      className={`relative p-4 rounded-2xl border text-left transition-all duration-200 ${
                        selectedType === type.id
                          ? `${type.activeBg} ${type.activeBorder} border-2`
                          : `bg-white dark:bg-slate-900/60 ${type.border} border`
                      }`}
                    >
                      <span className="text-2xl mb-2 block">{type.icon}</span>
                      <p className={`font-bold text-sm mb-1 ${
                        selectedType === type.id
                          ? type.activeText
                          : "text-slate-900 dark:text-white"
                      }`}>
                        {type.label}
                      </p>
                      <p className="text-slate-500 dark:text-slate-500 text-xs leading-relaxed">
                        {type.desc}
                      </p>
                      {selectedType === type.id && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center">
                          <span className="text-white text-[10px]">✓</span>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Severity — only for bugs */}
              {selectedType === "bug" && (
                <div className="mb-5">
                  <p className="text-xs tracking-widest uppercase text-slate-400 dark:text-slate-500 mb-3 font-semibold">
                    Severity
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {SEVERITY_OPTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSeverity(s)}
                        className={`text-xs px-4 py-2 rounded-lg border transition-all ${
                          severity === s
                            ? s === "Critical"
                              ? "bg-red-500/20 border-red-500 text-red-400"
                              : s === "High"
                              ? "bg-orange-500/20 border-orange-500 text-orange-400"
                              : s === "Medium"
                              ? "bg-yellow-500/20 border-yellow-500 text-yellow-400"
                              : "bg-green-500/20 border-green-500 text-green-400"
                            : "border-slate-300 dark:border-slate-700 text-slate-500 hover:border-slate-400"
                        }`}
                      >
                        {s === "Critical" ? "🔴" : s === "High" ? "🟠" : s === "Medium" ? "🟡" : "🟢"} {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Form */}
              <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 md:p-6 space-y-4">

                {/* Subject */}
                <div>
                  <label className="text-xs tracking-widest uppercase text-slate-400 mb-2 block">
                    Subject *
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">— Select a subject —</option>
                    {selectedType === "bug" && (
                      <>
                        <option>Image carousel not working</option>
                        <option>Cannot upload images</option>
                        <option>GitHub repos not loading</option>
                        <option>Login / sign-up issue</option>
                        <option>Project not saving</option>
                        <option>Dark/light mode not working</option>
                        <option>Page not loading correctly</option>
                        <option>Mobile layout issue</option>
                        <option>Filters not working</option>
                        <option>Settings not saving</option>
                        <option value="other">Other</option>
                      </>
                    )}
                    {selectedType === "feature" && (
                      <>
                        <option>Add a new section to landing page</option>
                        <option>More theme/color options</option>
                        <option>Export portfolio as PDF</option>
                        <option>Custom domain support</option>
                        <option>Social media sharing</option>
                        <option>More skill categories</option>
                        <option>Project collaboration feature</option>
                        <option>Analytics dashboard</option>
                        <option>Email notifications</option>
                        <option value="other">Other</option>
                      </>
                    )}
                    {selectedType === "complaint" && (
                      <>
                        <option>Navigation is confusing</option>
                        <option>UI is hard to use</option>
                        <option>Too slow / poor performance</option>
                        <option>Missing feature I expected</option>
                        <option>Content or wording issue</option>
                        <option>Privacy concern</option>
                        <option>Account issue</option>
                        <option value="other">Other</option>
                      </>
                    )}
                  </select>

                  {/* Custom subject input when "Other" is selected */}
                  {subject === "other" && (
                    <motion.input
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      type="text"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      placeholder="Describe your subject..."
                      className={`${inputClass} mt-2`}
                    />
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs tracking-widest uppercase text-slate-400 mb-2 block">
                    {selectedType === "bug" ? "What happened? *" : "Description *"}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder={
                      selectedType === "bug"
                        ? "Describe what you expected to happen vs what actually happened..."
                        : selectedType === "feature"
                        ? "Describe the feature you'd like to see and why it would be useful..."
                        : "Describe your feedback or concern in detail..."
                    }
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {/* Steps to reproduce — only for bugs */}
                {selectedType === "bug" && (
                  <div>
                    <label className="text-xs tracking-widest uppercase text-slate-400 mb-2 block">
                      Steps to Reproduce (optional)
                    </label>
                    <textarea
                      value={steps}
                      onChange={(e) => setSteps(e.target.value)}
                      rows={3}
                      placeholder={"1. Go to projects page\n2. Click on a project card\n3. See the error"}
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                )}

                {/* Reporter info (auto-filled) */}
                <div className={`p-3 rounded-xl border text-xs ${
                  "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                }`}>
                  <p className="text-slate-400 dark:text-slate-500 mb-1 tracking-widest uppercase">Auto-filled</p>
                  <p className="text-slate-600 dark:text-slate-400">
                    <span className="text-slate-400">Email:</span> {user?.email || "Not logged in"}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    <span className="text-slate-400">Subject:</span> {finalSubject || "—"}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    <span className="text-slate-400">Type:</span> {selectedTypeData?.label}
                    {selectedType === "bug" && ` · Severity: ${severity}`}
                  </p>
                </div>

                {error && (
                  <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2">
                    {error}
                  </p>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 py-3 bg-cyan-500 text-white rounded-xl text-sm font-semibold tracking-widest uppercase hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        />
                        Sending...
                      </span>
                    ) : (
                      "📨 Submit Report"
                    )}
                  </motion.button>

                  <a
                    href={buildGitHubUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-3 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-semibold tracking-widest uppercase hover:border-cyan-400 hover:text-cyan-600 transition-all text-center"
                  >
                    🐙 Open GitHub Issue
                  </a>
                </div>

                <p className="text-slate-400 dark:text-slate-600 text-xs text-center">
                  Both methods notify us. GitHub Issues are public and trackable.
                </p>
              </div>
            </motion.div>
          )}

          {/* ===== FAQs ===== */}
          {activeSection === "faq" && (
            <motion.div
              key="faq"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                  Frequently Asked Questions
                </h2>
                <p className="text-slate-500 text-sm">
                  Quick answers to common questions. Can't find what you need?
                  <button
                    onClick={() => setActiveSection("report")}
                    className="text-cyan-500 dark:text-cyan-400 ml-1 hover:text-cyan-600 transition-colors"
                  >
                    Submit a report →
                  </button>
                </p>
              </motion.div>

              <div className="space-y-3">
                {FAQ_ITEMS.map((item, index) => (
                  <FAQItem key={index} item={item} index={index} />
                ))}
              </div>

              {/* Still need help */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mt-8 p-5 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl text-center"
              >
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                  Still can't find what you're looking for?
                </p>
                <button
                  onClick={() => setActiveSection("report")}
                  className="text-xs tracking-widest uppercase px-6 py-2.5 bg-cyan-500 text-white rounded-xl hover:bg-cyan-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                >
                  Submit a Support Request
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* ===== GITHUB ISSUES ===== */}
          {activeSection === "github" && (
            <motion.div
              key="github"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl"
            >
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                  GitHub Issues
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  GitHub Issues are public, trackable and the fastest way to get a response.
                  You can see all open issues, track progress and comment on existing ones.
                </p>
              </motion.div>

              {/* Quick issue buttons */}
              <div className="grid gap-4 mb-6">
                {REPORT_TYPES.map((type, i) => (
                  <motion.a
                    key={type.id}
                    href={`https://github.com/showcase-hub-app/showcase-hub/issues/new?labels=${type.githubLabel}&template=${type.id}.md`}
                    target="_blank"
                    rel="noreferrer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ x: 4 }}
                    className={`flex items-center gap-4 p-4 rounded-2xl border bg-gradient-to-br ${type.color} ${type.border} transition-all duration-200`}
                  >
                    <span className="text-3xl flex-shrink-0">{type.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 dark:text-white font-bold text-sm mb-0.5">{type.label}</p>
                      <p className="text-slate-500 dark:text-slate-500 text-xs">{type.desc}</p>
                    </div>
                    <span className="text-slate-400 dark:text-slate-600 text-lg flex-shrink-0">→</span>
                  </motion.a>
                ))}
              </div>

              {/* View all issues */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🐙</span>
                  <div>
                    <p className="text-slate-900 dark:text-white font-bold text-sm">View All Issues</p>
                    <p className="text-slate-500 text-xs">See open bugs, feature requests and discussions</p>
                  </div>
                </div>
                <a
                  href="https://github.com/showcase-hub-app/showcase-hub/issues"
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full text-center py-3 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-xs tracking-widest uppercase hover:border-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all"
                >
                  Open GitHub Issues Page →
                </a>
              </motion.div>

              {/* Tip */}
              <p className="text-slate-400 dark:text-slate-600 text-xs text-center mt-4">
                You'll need a GitHub account to open issues.
                <button onClick={() => setActiveSection("report")} className="text-cyan-500 dark:text-cyan-400 ml-1 hover:text-cyan-600">
                  Use the form instead →
                </button>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== QUICK LINKS FOOTER ===== */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 md:mt-20 pt-8 border-t border-slate-200 dark:border-slate-800 max-w-2xl"
        >
          <p className="text-xs tracking-widest uppercase text-slate-400 dark:text-slate-600 mb-4">
            Quick Links
          </p>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "← Back to Projects", to: "/projects" },
              { label: "⚙️ Settings", to: "/settings" },
              { label: "🏠 Home", to: "/home" },
              { label: "ℹ️ Welcome Page", to: "/welcome" },
            ].map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className="text-xs tracking-widest uppercase px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-xl hover:border-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all"
              >
                {label}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
}
