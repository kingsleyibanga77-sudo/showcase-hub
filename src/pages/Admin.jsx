import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, doc, deleteDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

// ============================================================
// ADMIN EMAIL — only this account can access
// ============================================================
const ADMIN_EMAIL = "kingsleyibanga076@gmail.com";

// ============================================================
// USER DETAIL MODAL
// ============================================================
function UserModal({ user, onClose, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState("");

  const handleDelete = async () => {
    if (confirm !== "DELETE") return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "users", user.id));
      onDelete(user.id);
      onClose();
    } catch (err) {
      console.error("Failed to delete:", err);
    } finally {
      setDeleting(false);
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
        className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-white font-black text-lg">User Details</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-xl">✕</button>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-4 mb-5 p-4 bg-slate-800/50 rounded-xl">
          <div className="w-14 h-14 rounded-full flex items-center justify-center font-black text-xl text-white flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${user.color1 || "#06b6d4"}, ${user.color2 || "#3b82f6"})` }}
          >
            {user.initials || "?"}
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold truncate">{user.fullName || user.displayName || "—"}</p>
            <p className="text-slate-400 text-xs truncate">{user.email || "No email"}</p>
            <p className="text-cyan-400 text-xs">@{user.username || "no username"}</p>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            ["Full Name", user.fullName || "—"],
            ["Display Name", user.username || "—"],
            ["GitHub", user.githubUsername || "—"],
            ["LinkedIn", user.linkedinUrl || "—"],
            ["Twitter", user.twitterUrl || "—"],
            ["Projects", (user.customProjects?.length || 0) + " custom"],
            ["Skills", (user.skills?.length || 0) + " skills"],
            ["Tagline", user.tagline || "—"],
          ].map(([label, value]) => (
            <div key={label} className="bg-slate-800/50 rounded-xl p-3">
              <p className="text-slate-500 text-xs tracking-widest uppercase mb-1">{label}</p>
              <p className="text-slate-200 text-sm truncate">{value}</p>
            </div>
          ))}
        </div>

        {/* Projects list */}
        {user.customProjects?.length > 0 && (
          <div className="mb-5">
            <p className="text-xs tracking-widest uppercase text-slate-400 mb-2">Custom Projects</p>
            <div className="space-y-2">
              {user.customProjects.map((p, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                  <span className="text-slate-300 text-xs truncate flex-1">{p.title}</span>
                  <span className={`text-[10px] flex-shrink-0 ${
                    p.status === "Live" ? "text-green-400" :
                    p.status === "In Progress" ? "text-yellow-400" : "text-slate-500"
                  }`}>{p.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Danger zone */}
        <div className="border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 font-bold text-sm mb-1">⚠️ Delete User Data</p>
          <p className="text-slate-500 text-xs mb-3">
            This removes the user's Firestore data. Their Firebase Auth account remains active.
          </p>
          <input
            type="text"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder='Type "DELETE" to confirm'
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 mb-3"
          />
          <button
            onClick={handleDelete}
            disabled={confirm !== "DELETE" || deleting}
            className="w-full py-2.5 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm font-semibold hover:bg-red-500/30 transition-all disabled:opacity-40"
          >
            {deleting ? "Deleting..." : "🗑️ Delete User Data"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// MAIN ADMIN PAGE
// ============================================================
export default function Admin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [stats, setStats] = useState({ total: 0, withProjects: 0, withSkills: 0 });
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
      setUnauthorized(true);
      setLoading(false);
      return;
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const snap = await getDocs(collection(db, "users"));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUsers(data);
      setStats({
        total: data.length,
        withProjects: data.filter((u) => u.customProjects?.length > 0).length,
        withSkills: data.filter((u) => u.skills?.length > 0).length,
      });
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setStats((prev) => ({ ...prev, total: prev.total - 1 }));
  };

  const filtered = users.filter((u) =>
    (u.fullName || u.displayName || u.username || u.email || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Unauthorized screen
  if (unauthorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-5 text-center">
        <div className="text-6xl mb-6">🔒</div>
        <h1 className="text-white font-black text-3xl mb-3">Access Denied</h1>
        <p className="text-slate-400 text-sm mb-6 max-w-sm">
          This page is restricted to administrators only.
        </p>
        <button onClick={() => navigate("/home")}
          className="text-xs tracking-widest uppercase px-6 py-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-400 transition-all"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {selectedUser && (
          <UserModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            onDelete={handleDeleteUser}
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-slate-950 px-5 md:px-10 lg:px-20 pt-10 pb-20">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-red-400 text-xs tracking-[0.3em] uppercase mb-1 font-semibold">🔒 Admin Only</p>
              <h1 className="text-3xl md:text-4xl font-black text-white">Admin Dashboard</h1>
              <p className="text-slate-500 text-sm mt-1">Manage all Showcase Hub accounts</p>
            </div>
            <div className="flex gap-3">
              <button onClick={fetchUsers}
                className="text-xs tracking-widest uppercase px-4 py-2.5 border border-slate-700 text-slate-400 rounded-xl hover:border-slate-500 transition-all"
              >
                🔄 Refresh
              </button>
              <button onClick={() => navigate("/home")}
                className="text-xs tracking-widest uppercase px-4 py-2.5 border border-slate-700 text-slate-400 rounded-xl hover:border-slate-500 transition-all"
              >
                ← Back
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Users", value: stats.total, icon: "👥", color: "cyan" },
            { label: "Have Projects", value: stats.withProjects, icon: "🗂️", color: "violet" },
            { label: "Have Skills", value: stats.withSkills, icon: "🧠", color: "green" },
          ].map((stat) => (
            <motion.div key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4 md:p-5"
            >
              <span className="text-2xl mb-2 block">{stat.icon}</span>
              <p className="text-2xl md:text-3xl font-black text-white mb-1">{stat.value}</p>
              <p className="text-slate-500 text-xs tracking-widest uppercase">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name, username or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:max-w-sm bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Users list */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-800" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-800 rounded mb-2 w-3/4" />
                    <div className="h-3 bg-slate-800/50 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 border border-slate-800 rounded-2xl">
            <p className="text-slate-500 text-lg">No users found.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((user, i) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                onClick={() => setSelectedUser(user)}
                className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5 cursor-pointer hover:border-cyan-500/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-base text-white flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${user.color1 || "#06b6d4"}, ${user.color2 || "#3b82f6"})` }}
                  >
                    {user.initials || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-bold text-sm truncate">{user.fullName || user.displayName || "Unnamed"}</p>
                    <p className="text-slate-500 text-xs truncate">{user.email || user.id}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {user.username && (
                    <span className="text-xs bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-md">
                      @{user.username}
                    </span>
                  )}
                  {user.githubUsername && (
                    <span className="text-xs bg-slate-800 border border-slate-700 text-slate-400 px-2 py-0.5 rounded-md">
                      🐙 {user.githubUsername}
                    </span>
                  )}
                </div>

                <div className="flex gap-4 text-xs text-slate-500">
                  <span>🗂️ {user.customProjects?.length || 0} projects</span>
                  <span>🧠 {user.skills?.length || 0} skills</span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-[10px] text-slate-600">
                    {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "Unknown date"}
                  </span>
                  <span className="text-[10px] text-cyan-500 tracking-widest uppercase">View →</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
