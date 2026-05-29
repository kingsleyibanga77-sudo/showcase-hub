import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Welcome from "./pages/Welcome";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import ProjectDetail from "./pages/ProjectDetail";
import Login from "./pages/Login";
import UserSetup from "./pages/UserSetup";
import Settings from "./pages/Settings";
import AddProjectModal from "./components/AddProjectModal";
import PageTransition from "./components/PageTransition";
import LoadingScreen from "./components/LoadingScreen";
import ScrollProgress from "./components/ScrollProgress";
import CursorFollower from "./components/CursorFollower";
import { useTheme } from "./context/ThemeContext";
import { useAuth } from "./context/AuthContext";
import Support from "./pages/Support";

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
// NAVBAR WITH ADD PROJECT
// ============================================================
function NavbarWithModal({ onAddProject }) {
  return <Navbar onAddProject={onAddProject} />;
}

// ============================================================
// ANIMATED ROUTES
// ============================================================
function AnimatedRoutes() {
  const location = useLocation();
  const { user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [customProjects, setCustomProjects] = useState([]);

  const handleAddProject = (project) => {
  setCustomProjects((prev) => {
    const updated = [...prev, project];
    try {
      localStorage.setItem("custom_projects", JSON.stringify(updated));
    } catch {}
    return updated;
  });
};

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

          <Route path="/welcome" element={
            <PageTransition><Welcome /></PageTransition>
          } />

          <Route path="/login" element={
            user ? <Navigate to="/home" /> : <PageTransition><Login /></PageTransition>
          } />

          <Route path="/setup" element={
            !user ? <Navigate to="/login" /> : <PageTransition><UserSetup /></PageTransition>
          } />

          <Route path="/home" element={
            <ProtectedRoute>
              <PageTransition><Landing /></PageTransition>
            </ProtectedRoute>
          } />

          <Route path="/projects" element={
            <ProtectedRoute>
              <PageTransition>
                <ScrollProgress />
                <NavbarWithModal onAddProject={() => setShowAddModal(true)} />
                <Home
                  customProjects={customProjects}
                  onAddProject={() => setShowAddModal(true)}
                />
              </PageTransition>
            </ProtectedRoute>
          } />

          <Route path="/project/:id" element={
            <ProtectedRoute>
              <PageTransition>
                <ScrollProgress />
                <NavbarWithModal onAddProject={() => setShowAddModal(true)} />
                <ProjectDetail customProjects={customProjects} />
              </PageTransition>
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <PageTransition>
                <ScrollProgress />
                <NavbarWithModal onAddProject={() => setShowAddModal(true)} />
                <Settings />
              </PageTransition>
            </ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/welcome" />} />
          <Route path="*" element={<Navigate to="/welcome" />} />

<Route
  path="/support"
  element={
    <ProtectedRoute>
      <PageTransition>
        <ScrollProgress />
        <Navbar onAddProject={() => setShowAddModal(true)} />
        <Support />
      </PageTransition>
    </ProtectedRoute>
  }
/>
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
