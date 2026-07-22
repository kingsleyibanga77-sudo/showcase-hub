import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";

// ============================================================
// USER PREFS
// ============================================================
export const saveUserPrefs = async (userId, prefs) => {
  try {
    await setDoc(doc(db, "users", userId), {
      ...prefs,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    localStorage.setItem("user_prefs", JSON.stringify(prefs));
    return true;
  } catch (err) {
    console.error("Failed to save prefs:", err);
    // Still save to localStorage as fallback
    localStorage.setItem("user_prefs", JSON.stringify(prefs));
    return false;
  }
};

export const loadUserPrefs = async (userId) => {
  try {
    const snap = await getDoc(doc(db, "users", userId));
    if (snap.exists()) {
      const data = snap.data();
      localStorage.setItem("user_prefs", JSON.stringify(data));
      return data;
    }
    return null;
  } catch (err) {
    console.error("Failed to load prefs:", err);
    try {
      const saved = localStorage.getItem("user_prefs");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  }
};

// ============================================================
// PROJECTS
// ============================================================
export const saveProjects = async (userId, projects) => {
  try {
    await setDoc(doc(db, "users", userId), {
      customProjects: projects,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    localStorage.setItem("custom_projects", JSON.stringify(projects));
    return true;
  } catch (err) {
    console.error("Failed to save projects:", err);
    localStorage.setItem("custom_projects", JSON.stringify(projects));
    return false;
  }
};

export const loadProjects = async (userId) => {
  try {
    const snap = await getDoc(doc(db, "users", userId));
    if (snap.exists()) {
      const projects = snap.data().customProjects || [];
      localStorage.setItem("custom_projects", JSON.stringify(projects));
      return projects;
    }
    return [];
  } catch (err) {
    console.error("Failed to load projects:", err);
    try {
      const saved = localStorage.getItem("custom_projects");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  }
};

export const saveDeletedDefaults = async (userId, deletedIds) => {
  try {
    await setDoc(doc(db, "users", userId), {
      deletedDefaultProjects: deletedIds,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    localStorage.setItem("deleted_default_projects", JSON.stringify(deletedIds));
    return true;
  } catch (err) {
    console.error("Failed to save deleted defaults:", err);
    localStorage.setItem("deleted_default_projects", JSON.stringify(deletedIds));
    return false;
  }
};

// ============================================================
// SKILLS
// ============================================================
export const saveSkills = async (userId, skills) => {
  try {
    await setDoc(doc(db, "users", userId), {
      skills,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    localStorage.setItem("user_skills", JSON.stringify(skills));
    return true;
  } catch (err) {
    console.error("Failed to save skills:", err);
    localStorage.setItem("user_skills", JSON.stringify(skills));
    return false;
  }
};

export const loadSkills = async (userId) => {
  try {
    const snap = await getDoc(doc(db, "users", userId));
    if (snap.exists()) {
      const skills = snap.data().skills || [];
      localStorage.setItem("user_skills", JSON.stringify(skills));
      return skills;
    }
    return [];
  } catch (err) {
    console.error("Failed to load skills:", err);
    try {
      const saved = localStorage.getItem("user_skills");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  }
};

// ============================================================
// PUBLIC VIEW — load by username
// ============================================================
export const loadPublicProfile = async (username) => {
  try {
    const usersRef = collection(db, "users");

    // Try exact match first
    const q = query(usersRef, where("username", "==", username));
    const snap = await getDocs(q);
    if (!snap.empty) return snap.docs[0].data();

    // Try lowercase
    const q2 = query(usersRef, where("username", "==", username.toLowerCase()));
    const snap2 = await getDocs(q2);
    if (!snap2.empty) return snap2.docs[0].data();

    // Try displayName as fallback
    const q3 = query(usersRef, where("displayName", "==", username));
    const snap3 = await getDocs(q3);
    if (!snap3.empty) return snap3.docs[0].data();

    return null;
  } catch (err) {
    console.error("Failed to load public profile:", err);
    return null;
  }
};

// ============================================================
// LOAD ALL USER DATA ON LOGIN
// ============================================================
export const loadAllUserData = async (userId) => {
  try {
    const snap = await getDoc(doc(db, "users", userId));
    if (snap.exists()) {
      const data = snap.data();

      // Cache everything to localStorage
      if (data) {
        // Prefs
        const existingPrefs = (() => {
          try {
            const s = localStorage.getItem("user_prefs");
            return s ? JSON.parse(s) : {};
          } catch { return {}; }
        })();
        localStorage.setItem("user_prefs", JSON.stringify({ ...existingPrefs, ...data }));

        // Projects
        if (Array.isArray(data.customProjects)) {
          localStorage.setItem("custom_projects", JSON.stringify(data.customProjects));
        }

        // Skills
        if (Array.isArray(data.skills)) {
          localStorage.setItem("user_skills", JSON.stringify(data.skills));
        }

        // Deleted defaults
        if (Array.isArray(data.deletedDefaultProjects)) {
          localStorage.setItem("deleted_default_projects", JSON.stringify(data.deletedDefaultProjects));
        }
      }

      return data;
    }
    return null;
  } catch (err) {
    console.error("Failed to load all user data:", err);
    return null;
  }
};
