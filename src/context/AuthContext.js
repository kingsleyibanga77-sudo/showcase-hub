import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { loadAllUserData } from "../services/db";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Load ALL data from Firestore and merge into localStorage
          const firestoreData = await loadAllUserData(firebaseUser.uid);

          if (firestoreData) {
            // Merge Firestore data into localStorage — Firestore wins on conflicts
            const existing = (() => {
              try {
                const s = localStorage.getItem("user_prefs");
                return s ? JSON.parse(s) : {};
              } catch { return {}; }
            })();

            const merged = { ...existing, ...firestoreData };
            localStorage.setItem("user_prefs", JSON.stringify(merged));

            // Sync projects
            if (firestoreData.customProjects) {
              localStorage.setItem("custom_projects", JSON.stringify(firestoreData.customProjects));
            }

            // Sync skills
            if (firestoreData.skills) {
              localStorage.setItem("user_skills", JSON.stringify(firestoreData.skills));
              // Also build skills_data grouped object
              const grouped = {};
              firestoreData.skills.forEach((skill) => {
                const cat = skill.category || "Other";
                if (!grouped[cat]) grouped[cat] = [];
                grouped[cat].push({
                  name: skill.name,
                  level: skill.level || 50,
                  icon: skill.icon || "⭐",
                  projects: skill.projects || [],
                });
              });
              localStorage.setItem("skills_data", JSON.stringify(grouped));
            }

            // Sync deleted defaults
            if (firestoreData.deletedDefaultProjects) {
              localStorage.setItem(
                "deleted_default_projects",
                JSON.stringify(firestoreData.deletedDefaultProjects)
              );
            }
          }
        } catch (err) {
          console.error("Failed to load user data from Firestore:", err);
          // Fall back to localStorage — data still works offline
        }

        setUser(firebaseUser);
      } else {
        setUser(null);
        // Don't clear localStorage on logout — preserve for next login
      }

      setDataLoaded(true);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, dataLoaded, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
