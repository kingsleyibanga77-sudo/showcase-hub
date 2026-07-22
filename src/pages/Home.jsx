import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import ProjectCard from "../components/ProjectCard";
import SkillsSection from "../components/SkillsSection";
import defaultProjects from "../data/projects";

const filters = ["Web", "Blockchain", "Data", "Web3"];
const GITHUB_USERNAME = (() => {
  try {
    const prefs = localStorage.getItem("user_prefs");
    const parsed = prefs ? JSON.parse(prefs) : null;
    return parsed?.githubUsername || null;
  } catch { return null; }
})();

// ============================================================
// GITHUB REPO CARD
// ============================================================
function GitHubCard({ repo, index }) {
  return (
    <motion.a
      href={repo.html_url}
      target="_blank"
      rel="noreferrer"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="group block bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-4 md:p-5 hover:border-cyan-400 dark:hover:border-cyan-500/40 transition-all duration-300 hover:shadow-[0_4px_30px_rgba(6,182,212,0.15)]"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-cyan-400" />
        </div>
        <span className="text-slate-400 dark:text-slate-600 text-xs group-hover:text-cyan-500 transition-colors">→</span>
      </div>
      <h3 className="text-slate-900 dark:text-white font-bold text-sm md:text-base mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-200">
        {repo.name}
      </h3>
      <p className="text-slate-500 dark:text-slate-500 text-xs leading-relaxed mb-3 md:mb-4 line-clamp-2">
        {repo.description || "No description provided."}
      </p>
      <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-600 flex-wrap">
        {repo.language && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            {repo.language}
          </span>
        )}
        <span>⭐ {repo.stargazers_count}</span>
        <span>🍴 {repo.forks_count}</span>
      </div>
    </motion.a>
  );
}

// ============================================================
// HOME PAGE
// ============================================================
export default function Home({ customProjects = [], onAddProject, deletedDefaults = [], onDelete }) {
  const [activeFilters, setActiveFilters] = useState([]);
  const [search, setSearch] = useState("");
  const [activeSkills, setActiveSkills] = useState([]);
  const [repos, setRepos] = useState([]);
  const [repoLoading, setRepoLoading] = useState(true);
  const [repoError, setRepoError] = useState(false);
  const projectsRef = useRef(null);

  const [localCustom] = useState(() => {
    try {
      const saved = localStorage.getItem("custom_projects");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Filter out deleted defaults then combine all projects
  const allProjects = [
    ...defaultProjects.filter((p) => !deletedDefaults.includes(p.id)),
    ...localCustom,
    ...customProjects,
  ];

  const handleDelete = (id) => {
    onDelete && onDelete(id);
  };

  useEffect(() => {
    if (!GITHUB_USERNAME) {
      setRepoLoading(false);
      return;
    }
    const fetchRepos = async () => {
      try {
        const res = await fetch(
          `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setRepos(data);
      } catch {
        setRepoError(true);
      } finally {
        setRepoLoading(false);
      }
    };
    fetchRepos();
  }, []);

  // Category filters
  const toggleFilter = (filter) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  const clearFilters = () => setActiveFilters([]);

  // Skill filters
  const toggleSkill = (skillName) => {
    setActiveSkills((prev) =>
      prev.includes(skillName)
        ? prev.filter((s) => s !== skillName)
        : [...prev, skillName]
    );
  };

  const clearSkills = () => setActiveSkills([]);

  const handleFilterBySkill = () => {
    projectsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Combined filter logic
  const filtered = allProjects.filter((project) => {
    const matchesFilter =
      activeFilters.length === 0 ||
      activeFilters.every((f) => project.tags.includes(f));
    const matchesSearch =
      project.title.toLowerCase().includes(search.toLowerCase()) ||
      project.description.toLowerCase().includes(search.toLowerCase());
    const matchesSkills =
      activeSkills.length === 0 ||
      activeSkills.every((skill) =>
        project.tech.some((t) => t.toLowerCase().includes(skill.toLowerCase()))
      );
    return matchesFilter && matchesSearch && matchesSkills;
  });

  const filterSummary = [...activeFilters, ...activeSkills];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 pt-24 md:pt-28 px-5 md:px-10 lg:px-20 pb-20 transition-colors duration-300">

      {/* ===== HEADER ===== */}
      <motion.div
        ref={projectsRef}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mb-8 md:mb-12 scroll-mt-28"
      >
        <p className="text-cyan-500 dark:text-cyan-400 text-xs tracking-[0.3em] uppercase mb-2 font-semibold">
          ✦ My Work
        </p>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 md:mb-4">
          Project Showcase
        </h1>
        <p className="text-slate-500 dark:text-slate-500 max-w-lg leading-relaxed text-sm">
          A collection of projects I've built across web development,
          blockchain, and data engineering.
        </p>
      </motion.div>

      {/* Active filters banner */}
      {(activeFilters.length > 0 || activeSkills.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex flex-wrap items-center gap-2"
        >
          <span className="text-slate-500 dark:text-slate-400 text-xs tracking-widest uppercase">
            Filtering by:
          </span>
          {activeFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => toggleFilter(filter)}
              className="inline-flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-3 py-1 text-cyan-600 dark:text-cyan-400 text-xs font-semibold hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all"
            >
              {filter} <span className="opacity-60">✕</span>
            </button>
          ))}
          {activeSkills.map((skill) => (
            <button
              key={skill}
              onClick={() => toggleSkill(skill)}
              className="inline-flex items-center gap-1 bg-violet-500/10 border border-violet-500/30 rounded-lg px-3 py-1 text-violet-600 dark:text-violet-400 text-xs font-semibold hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all"
            >
              {skill} <span className="opacity-60">✕</span>
            </button>
          ))}
          <button
            onClick={() => { clearFilters(); clearSkills(); }}
            className="text-slate-400 hover:text-red-400 text-xs tracking-widest uppercase transition-colors ml-1"
          >
            Clear all
          </button>
        </motion.div>
      )}

      {/* Search + Add */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5"
      >
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 sm:max-w-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors duration-200 shadow-sm"
        />
        <motion.button
          onClick={onAddProject}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center gap-2 text-xs tracking-widest uppercase px-5 py-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
        >
          ➕ Add Project
        </motion.button>
      </motion.div>

      {/* Category Filters — multi-select */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="flex gap-2 mb-8 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => toggleFilter(filter)}
            className={`flex-shrink-0 text-xs tracking-widest uppercase px-4 py-2 rounded-lg border transition-all duration-200 ${
              activeFilters.includes(filter)
                ? "bg-cyan-500/20 border-cyan-500 text-cyan-600 dark:text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                : "border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-500 hover:border-cyan-400 hover:text-cyan-600 dark:hover:border-slate-500 dark:hover:text-slate-300"
            }`}
          >
            {activeFilters.includes(filter) ? "✓ " : ""}{filter}
          </button>
        ))}

        {activeFilters.length > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={clearFilters}
            className="flex-shrink-0 text-xs tracking-widest uppercase px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
          >
            Clear ✕
          </motion.button>
        )}
      </motion.div>

      {/* Results count */}
      <p className="text-slate-400 dark:text-slate-600 text-xs tracking-widest uppercase mb-5">
        Showing {filtered.length} of {allProjects.length} projects
        {filterSummary.length > 0 && ` · ${filterSummary.join(" + ")}`}
      </p>

      {/* Projects Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filtered.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              isCustom={true}
              onDelete={handleDelete}
            />
          ))}

          {/* Big Add Project card */}
          <motion.button
            onClick={onAddProject}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6, boxShadow: "0 0 30px rgba(6,182,212,0.15)" }}
            whileTap={{ scale: 0.98 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center gap-4 bg-white dark:bg-slate-900/60 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 hover:border-cyan-500 dark:hover:border-cyan-500/60 transition-all duration-300 min-h-[320px] group"
          >
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center group-hover:bg-cyan-500/20 transition-all duration-300">
              <span className="text-3xl">➕</span>
            </div>
            <div className="text-center">
              <p className="text-slate-900 dark:text-white font-black text-lg mb-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                Add New Project
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-sm leading-relaxed max-w-[180px]">
                Showcase another project in your portfolio
              </p>
            </div>
            <span className="text-xs tracking-widest uppercase px-5 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 rounded-xl group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300">
              Get Started →
            </span>
          </motion.button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 border border-slate-200 dark:border-slate-800 rounded-2xl"
        >
          <p className="text-slate-400 dark:text-slate-600 text-lg mb-3">
            No projects match your filters.
          </p>
          <button
            onClick={() => { clearFilters(); clearSkills(); }}
            className="text-cyan-500 dark:text-cyan-400 text-sm tracking-widest uppercase hover:text-cyan-600 transition-colors"
          >
            Clear all filters
          </button>
        </motion.div>
      )}

      {/* ===== SKILLS SECTION ===== */}
      <SkillsSection
        activeSkills={activeSkills}
        toggleSkill={toggleSkill}
        clearSkills={clearSkills}
        onFilterBySkill={handleFilterBySkill}
      />

      {/* ===== GITHUB REPOS ===== */}
      <div className="mt-20 md:mt-24">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          <span className="text-slate-400 dark:text-slate-600 text-xs tracking-widest uppercase flex-shrink-0">
            GitHub Activity
          </span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 md:mb-10"
        >
          <p className="text-cyan-500 dark:text-cyan-400 text-xs tracking-[0.3em] uppercase mb-2 font-semibold">
            ✦ Live From GitHub
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2">
            Latest Repositories
          </h2>
          <p className="text-slate-500 dark:text-slate-500 max-w-lg text-sm leading-relaxed">
            My most recently updated repos, fetched live from GitHub.
          </p>
        </motion.div>

        {repoLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 mb-4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded mb-2 w-3/4" />
                <div className="h-3 bg-slate-100 dark:bg-slate-800/50 rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {repoError && (
          <div className="text-center py-12 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <p className="text-slate-400 dark:text-slate-600 mb-2">Couldn't load GitHub repos.</p>
            <a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noreferrer"
              className="text-cyan-500 dark:text-cyan-400 text-sm tracking-widest uppercase hover:text-cyan-600"
            >
              Visit GitHub Profile →
            </a>
          </div>
        )}

        {!repoLoading && !repoError && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {repos.map((repo, index) => (
                <GitHubCard key={repo.id} repo={repo} index={index} />
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-8 md:mt-10"
            >
              <a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noreferrer"
                className="inline-block text-xs tracking-widest uppercase px-6 md:px-8 py-3 border border-cyan-500/50 text-cyan-600 dark:text-cyan-400 rounded-xl hover:bg-cyan-500/10 transition-all duration-200"
              >
                View All Repositories →
              </a>
            </motion.div>
          </>
        )}
      </div>

      {/* Page footer */}
      <div className="mt-16 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 dark:text-slate-600">
        <span>© {new Date().getFullYear()} Showcase Hub</span>
        <div className="flex items-center gap-3">
          <Link to="/welcome" className="hover:text-violet-400 transition-colors">About</Link>
          <span>·</span>
          <Link to="/support" className="hover:text-cyan-400 transition-colors">Support</Link>
          <span>·</span>
          <Link to="/welcome" className="hover:text-cyan-400 transition-colors">← Welcome Page</Link>
        </div>
      </div>
    </div>
  );
}
