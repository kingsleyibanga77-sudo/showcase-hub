import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { auth } from "./firebase";
import Navbar from "./components/Navbar";
import Welcome from "./pages/Welcome";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import ProjectDetail from "./pages/ProjectDetail";
import Login from "./pages/Login";
import UserSetup from "./pages/UserSetup";
import Settings from "./pages/Settings";
import Support from "./pages/Support";
import PublicView from "./pages/PublicView";
import AddProjectModal from "./components/AddProjectModal";
import PageTransition from "./components/PageTransition";
import LoadingScreen from "./components/LoadingScreen";
import ScrollProgress from "./components/ScrollProgress";
import CursorFollower from "./components/CursorFollower";
import { useTheme } from "./context/ThemeContext";
import { useAuth } from "./context/AuthContext";
import { saveProjects, saveDeletedDefaults } from "./services/db";
import defaultProjects from "./data/projects";

// ============================================================
// PROTECTED ROUTE
// ============================================================
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  const prefs = (() => {
    try {
      const saved = localStorage.getItem("user_prefs");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  })();
  if (!prefs) return <Navigate to="/setup" />;
  return children;
}

// ============================================================
// ANIMATED ROUTES
// ============================================================
function AnimatedRoutes() {
  const location = useLocation();
  const { user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);

  const [customProjects, setCustomProjects] = useState(() => {
    try {
      const saved = localStorage.getItem("custom_projects");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [deletedDefaults, setDeletedDefaults] = useState(() => {
    try {
      const saved = localStorage.getItem("deleted_default_projects");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Add project — saves to state, localStorage and Firestore
  const handleAddProject = async (project) => {
    setCustomProjects((prev) => {
      const updated = [...prev, project];
      try {
        localStorage.setItem("custom_projects", JSON.stringify(updated));
        if (auth.currentUser) {
          saveProjects(auth.currentUser.uid, updated);
        }
      } catch {}
      return updated;
    });
  };

  // Delete project — handles both default and custom
  const handleDeleteProject = (id) => {
    const isDefault = defaultProjects.some((p) => p.id === id);
    if (isDefault) {
      setDeletedDefaults((prev) => {
        const updated = [...prev, id];
        try {
          localStorage.setItem("deleted_default_projects", JSON.stringify(updated));
          if (auth.currentUser) {
            saveDeletedDefaults(auth.currentUser.uid, updated);
          }
        } catch {}
        return updated;
      });
    } else {
      setCustomProjects((prev) => {
        const updated = prev.filter((p) => p.id !== id);
        try {
          localStorage.setItem("custom_projects", JSON.stringify(updated));
          localStorage.removeItem(`project_${id}`);
          if (auth.currentUser) {
            saveProjects(auth.currentUser.uid, updated);
          }
        } catch {}
        return updated;
      });
    }
  };

  const NavbarWithModal = () => (
    <Navbar onAddProject={() => setShowAddModal(true)} />
  );

  return (
    <>
      <AnimatePresence>
        {showAddModal && (
          <AddProjectModal
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddProject}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>

          {/* Public routes */}
          <Route path="/welcome" element={
            <PageTransition><Welcome /></PageTransition>
          } />

          <Route path="/login" element={
            user ? <Navigate to="/home" /> : <PageTransition><Login /></PageTransition>
          } />

          <Route path="/setup" element={
            !user ? <Navigate to="/login" /> : <PageTransition><UserSetup /></PageTransition>
          } />

          {/* Public view — no auth required */}
          <Route path="/view/:username" element={
            <PageTransition><PublicView /></PageTransition>
          } />

          {/* Protected routes */}
          <Route path="/home" element={
            <ProtectedRoute>
              <PageTransition><Landing /></PageTransition>
            </ProtectedRoute>
          } />

          <Route path="/projects" element={
            <ProtectedRoute>
              <PageTransition>
                <ScrollProgress />
                <NavbarWithModal />
                <Home
                  customProjects={customProjects}
                  deletedDefaults={deletedDefaults}
                  onAddProject={() => setShowAddModal(true)}
                  onDelete={handleDeleteProject}
                />
              </PageTransition>
            </ProtectedRoute>
          } />

          <Route path="/project/:id" element={
            <ProtectedRoute>
              <PageTransition>
                <ScrollProgress />
                <NavbarWithModal />
                <ProjectDetail customProjects={customProjects} />
              </PageTransition>
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <PageTransition>
                <ScrollProgress />
                <NavbarWithModal />
                <Settings />
              </PageTransition>
            </ProtectedRoute>
          } />

          <Route path="/support" element={
            <ProtectedRoute>
              <PageTransition>
                <ScrollProgress />
                <NavbarWithModal />
                <Support />
              </PageTransition>
            </ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/welcome" />} />
          <Route path="*" element={<Navigate to="/welcome" />} />

        </Routes>
      </AnimatePresence>
    </>
  );
}

// ============================================================
// THEMED APP
// ============================================================
function ThemedApp() {
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();
  const { user } = useAuth();

  return (
    <div className={`${isDark ? "dark bg-slate-950" : "bg-slate-100"} min-h-screen cursor-none transition-colors duration-300`}>
      <CursorFollower />
      {loading && <LoadingScreen onComplete={() => setLoading(false)} user={user} />}
      {!loading && <AnimatedRoutes />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemedApp />
    </BrowserRouter>
  );
}
