import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { AuthLoadingScreen } from "../components/LoadingScreen";

// ============================================================
// INPUT FIELD
// ============================================================
function InputField({ label, type, value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="mb-4">
      <label className="text-xs tracking-widest uppercase text-slate-400 dark:text-slate-500 mb-2 block">
        {label}
      </label>
      <div
        className={`relative flex items-center bg-white dark:bg-slate-900 border rounded-xl transition-all duration-200 ${
          focused
            ? "border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
            : "border-slate-200 dark:border-slate-700"
        }`}
      >
        <input
          type={isPassword && showPassword ? "text" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none rounded-xl"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="px-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs transition-colors"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// SOCIAL BUTTON
// ============================================================
function SocialButton({ onClick, icon, label, loading }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 text-sm font-medium hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 disabled:opacity-50"
    >
      <span className="text-lg">{icon}</span>
      {label}
    </motion.button>
  );
}

// ============================================================
// MAIN LOGIN PAGE
// ============================================================
export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const clearMessages = () => { setError(""); setSuccess(""); };

  const handleEmailAuth = async () => {
    clearMessages();
    if (!email || !password) return setError("Please fill in all fields.");
    if (mode === "signup" && password !== confirmPassword)
      return setError("Passwords don't match.");
    if (password.length < 6)
      return setError("Password must be at least 6 characters.");

    setLoading(true);
    try {
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/");
    } catch (err) {
      setLoading(false);
      switch (err.code) {
        case "auth/user-not-found":
          setError("No account found with this email.");
          break;
        case "auth/wrong-password":
          setError("Incorrect password. Try again.");
          break;
        case "auth/email-already-in-use":
          setError("An account with this email already exists.");
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        case "auth/too-many-requests":
          setError("Too many attempts. Please try again later.");
          break;
        default:
          setError("Something went wrong. Please try again.");
      }
    }
  };

  const handleGoogle = async () => {
    clearMessages();
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/");
    } catch (err) {
      setLoading(false);
      setError("Google sign-in failed. Please try again.");
    }
  };

  const handleReset = async () => {
    clearMessages();
    if (!email) return setError("Please enter your email address first.");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Reset email sent! Check your inbox.");
      setMode("login");
    } catch (err) {
      setError("Could not send reset email. Check the address and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Auth loading overlay */}
      <AnimatePresence>
        {loading && <AuthLoadingScreen />}
      </AnimatePresence>

      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center px-4 transition-colors duration-300 cursor-none">

        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              background: [
                "radial-gradient(ellipse at 30% 40%, rgba(6,182,212,0.08) 0%, transparent 60%)",
                "radial-gradient(ellipse at 70% 60%, rgba(139,92,246,0.08) 0%, transparent 60%)",
                "radial-gradient(ellipse at 30% 40%, rgba(6,182,212,0.08) 0%, transparent 60%)",
              ],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0"
          />
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(6,182,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative z-10 w-full max-w-md">

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <Link to="/" className="inline-block">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                KI<span className="text-cyan-400">.</span>
              </span>
            </Link>
            <p className="text-slate-400 text-xs tracking-widest uppercase mt-2">
              Showcase Hub
            </p>
          </motion.div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-800">
              {["login", "signup"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setMode(tab); clearMessages(); }}
                  className={`flex-1 py-4 text-xs tracking-widest uppercase font-semibold transition-all duration-200 ${
                    mode === tab
                      ? "text-cyan-500 dark:text-cyan-400 border-b-2 border-cyan-500"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
                >
                  {tab === "login" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="mb-6"
                >
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {mode === "login" && "Welcome back"}
                    {mode === "signup" && "Create your account"}
                    {mode === "reset" && "Reset your password"}
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">
                    {mode === "login" && "Sign in to access your showcase"}
                    {mode === "signup" && "Join and start showcasing your work"}
                    {mode === "reset" && "We'll send you a reset link"}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Error / Success */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-500 text-sm"
                  >
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-green-500 text-sm"
                  >
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>

              <InputField label="Email Address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />

              {mode !== "reset" && (
                <InputField label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
              )}

              {mode === "signup" && (
                <InputField label="Confirm Password" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••••" />
              )}

              {mode === "login" && (
                <div className="text-right mb-4">
                  <button
                    onClick={() => { setMode("reset"); clearMessages(); }}
                    className="text-xs text-cyan-500 dark:text-cyan-400 hover:text-cyan-600 transition-colors tracking-wide"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={mode === "reset" ? handleReset : handleEmailAuth}
                disabled={loading}
                className="w-full py-3 bg-cyan-500 text-white rounded-xl font-semibold text-sm tracking-widest uppercase hover:bg-cyan-400 transition-all duration-200 shadow-[0_0_25px_rgba(6,182,212,0.35)] disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {mode === "login" && "Sign In"}
                {mode === "signup" && "Create Account"}
                {mode === "reset" && "Send Reset Link"}
              </motion.button>

              {mode === "reset" && (
                <button
                  onClick={() => { setMode("login"); clearMessages(); }}
                  className="w-full text-xs text-slate-400 hover:text-slate-600 transition-colors tracking-widest uppercase mb-4"
                >
                  ← Back to Sign In
                </button>
              )}

              {mode !== "reset" && (
                <>
                  <div className="flex items-center gap-3 my-5">
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                    <span className="text-slate-300 dark:text-slate-600 text-xs">or continue with</span>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                  </div>
                  <SocialButton
                    onClick={handleGoogle}
                    icon="🔵"
                    label="Continue with Google"
                    loading={loading}
                  />
                </>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-6"
          >
            <Link
              to="/"
              className="text-slate-400 text-xs tracking-widest uppercase hover:text-cyan-500 transition-colors"
            >
              ← Back to Showcase
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
}
