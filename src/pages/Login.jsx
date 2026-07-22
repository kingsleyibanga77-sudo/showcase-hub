import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { AuthLoadingScreen } from "../components/LoadingScreen";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // login | signup | forgot
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const getErrorMessage = (code) => {
    switch (code) {
      case "auth/user-not-found": return "No account found with this email.";
      case "auth/wrong-password": return "Incorrect password.";
      case "auth/email-already-in-use": return "An account with this email already exists.";
      case "auth/weak-password": return "Password must be at least 6 characters.";
      case "auth/invalid-email": return "Please enter a valid email address.";
      case "auth/too-many-requests": return "Too many attempts. Please try again later.";
      case "auth/popup-closed-by-user": return "Google sign-in was cancelled.";
      default: return "Something went wrong. Please try again.";
    }
  };

  const handleSubmit = async () => {
    setError("");
    if (!email.trim() || !password.trim()) return setError("Please fill in all fields.");
    if (mode === "signup" && password !== confirmPassword)
      return setError("Passwords do not match.");

    setLoading(true);
    try {
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
        // New user — go to setup
        navigate("/setup");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        // Check if user has completed setup
        const prefs = (() => {
          try {
            const saved = localStorage.getItem("user_prefs");
            return saved ? JSON.parse(saved) : null;
          } catch { return null; }
        })();
        navigate(prefs ? "/home" : "/setup");
      }
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const isNewUser = result._tokenResponse?.isNewUser;
      const prefs = (() => {
        try {
          const saved = localStorage.getItem("user_prefs");
          return saved ? JSON.parse(saved) : null;
        } catch { return null; }
      })();
      if (isNewUser || !prefs) {
        navigate("/setup");
      } else {
        navigate("/home");
      }
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setError("");
    if (!email.trim()) return setError("Please enter your email address.");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <AuthLoadingScreen />;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(rgba(6,182,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,1) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Back to Welcome */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
          <Link to="/welcome" className="inline-flex items-center gap-2 text-slate-500 hover:text-cyan-400 text-xs tracking-widest uppercase transition-colors">
            ← Welcome Page
          </Link>
        </motion.div>

        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <Link to="/welcome" className="inline-block">
            <span className="font-black text-3xl text-white">
              SH<span className="text-cyan-400">.</span>
            </span>
          </Link>
          <p className="text-slate-500 text-sm mt-2">
            {mode === "login" ? "Sign in to your showcase" :
             mode === "signup" ? "Create your showcase" :
             "Reset your password"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl"
        >
          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>

              {/* Mode tabs */}
              {mode !== "forgot" && (
                <div className="flex gap-1 mb-6 bg-slate-800 rounded-xl p-1">
                  {["login", "signup"].map((m) => (
                    <button key={m} onClick={() => { setMode(m); setError(""); }}
                      className={`flex-1 py-2 rounded-lg text-xs tracking-widest uppercase transition-all ${
                        mode === m ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {m === "login" ? "Sign In" : "Sign Up"}
                    </button>
                  ))}
                </div>
              )}

              {/* Forgot password success */}
              {mode === "forgot" && resetSent && (
                <div className="text-center py-4 mb-4">
                  <div className="text-4xl mb-3">📧</div>
                  <p className="text-white font-bold mb-2">Check your email</p>
                  <p className="text-slate-400 text-sm">
                    We sent a reset link to <span className="text-cyan-400">{email}</span>
                  </p>
                  <button onClick={() => { setMode("login"); setResetSent(false); }}
                    className="mt-4 text-cyan-400 text-sm hover:text-cyan-300 transition-colors"
                  >
                    ← Back to sign in
                  </button>
                </div>
              )}

              {!resetSent && (
                <div className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="text-xs tracking-widest uppercase text-slate-400 mb-2 block">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (mode === "forgot" ? handleReset() : handleSubmit())}
                      placeholder="you@example.com"
                      className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>

                  {/* Password */}
                  {mode !== "forgot" && (
                    <div>
                      <label className="text-xs tracking-widest uppercase text-slate-400 mb-2 block">Password</label>
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        placeholder="••••••••"
                        className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>
                  )}

                  {/* Confirm password */}
                  {mode === "signup" && (
                    <div>
                      <label className="text-xs tracking-widest uppercase text-slate-400 mb-2 block">Confirm Password</label>
                      <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        placeholder="••••••••"
                        className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>
                  )}

                  {/* Forgot password link */}
                  {mode === "login" && (
                    <div className="text-right">
                      <button onClick={() => { setMode("forgot"); setError(""); }}
                        className="text-xs text-slate-500 hover:text-cyan-400 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2">{error}</p>
                  )}

                  {/* Submit */}
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={mode === "forgot" ? handleReset : handleSubmit}
                    className="w-full py-3 rounded-xl font-semibold text-sm tracking-widest uppercase text-slate-950 bg-cyan-500 hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                  >
                    {mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
                  </motion.button>

                  {/* Back from forgot */}
                  {mode === "forgot" && (
                    <button onClick={() => { setMode("login"); setError(""); }}
                      className="w-full text-center text-sm text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      ← Back to sign in
                    </button>
                  )}

                  {/* Divider */}
                  {mode !== "forgot" && (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-slate-800" />
                        <span className="text-slate-600 text-xs">or</span>
                        <div className="h-px flex-1 bg-slate-800" />
                      </div>

                      {/* Google */}
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={handleGoogle}
                        className="w-full py-3 rounded-xl font-semibold text-sm tracking-widest uppercase text-slate-300 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                      </motion.button>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <p className="text-center text-slate-600 text-xs mt-6">
          By continuing you agree to our{" "}
          <Link to="/terms" className="text-slate-500 hover:text-cyan-400 transition-colors">Terms</Link>
          {" "}and{" "}
          <Link to="/privacy" className="text-slate-500 hover:text-cyan-400 transition-colors">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
