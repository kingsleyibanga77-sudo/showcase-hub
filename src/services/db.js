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

// Save full user profile to Firestore
export const saveUserPrefs = async (userId, prefs) => {
  try {
    await setDoc(doc(db, "users", userId), {
      ...prefs,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    // Also save to localStorage as cache
    localStorage.setItem("user_prefs", JSON.stringify(prefs));
    return true;
  } catch (err) {
    console.error("Failed to save prefs:", err);
    return false;
  }
};

// Load user profile from Firestore
export const loadUserPrefs = async (userId) => {
  try {
    const snap = await getDoc(doc(db, "users", userId));
    if (snap.exists()) {
      const data = snap.data();
      // Cache locally
      localStorage.setItem("user_prefs", JSON.stringify(data));
      return data;
    }
    return null;
  } catch (err) {
    console.error("Failed to load prefs:", err);
    // Fall back to localStorage
    try {
      const saved = localStorage.getItem("user_prefs");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  }
};

// ============================================================
// PROJECTS
// ============================================================

// Save all custom projects
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
    return false;
  }
};

// Load custom projects
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

// Save deleted default project IDs
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
    return false;
  }
};

// ============================================================
// SKILLS
// ============================================================

// Save skills
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
    return false;
  }
};

// Load skills
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
    // Query Firestore for user with matching username
    const usersRef = collection(db, "users");
    const q = query(
      usersRef,
      where("username", "==", username.toLowerCase())
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      return snap.docs[0].data();
    }

    // Also try matching displayName as fallback
    const q2 = query(
      usersRef,
      where("username", "==", username)
    );
    const snap2 = await getDocs(q2);
    if (!snap2.empty) {
      return snap2.docs[0].data();
    }

    return null;
  } catch (err) {
    console.error("Failed to load public profile:", err);
    return null;
  }
};

// ============================================================
// LOAD ALL USER DATA AT ONCE (on login)
// ============================================================

export const loadAllUserData = async (userId) => {
  try {
    const snap = await getDoc(doc(db, "users", userId));
    if (snap.exists()) {
      const data = snap.data();
      // Cache everything to localStorage
      if (data.username || data.displayName) {
        localStorage.setItem("user_prefs", JSON.stringify(data));
      }
      if (data.customProjects) {
        localStorage.setItem("custom_projects", JSON.stringify(data.customProjects));
      }
      if (data.skills) {
        localStorage.setItem("user_skills", JSON.stringify(data.skills));
      }
      if (data.deletedDefaultProjects) {
        localStorage.setItem("deleted_default_projects", JSON.stringify(data.deletedDefaultProjects));
      }
      return data;
    }
    return null;
  } catch (err) {
    console.error("Failed to load all user data:", err);
    return null;
  }
};
