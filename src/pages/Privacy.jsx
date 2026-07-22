import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const sections = [
  {
    title: "Information We Collect",
    content: [
      "Account information: When you create an account, we collect your email address, full name and display name.",
      "Profile data: Information you voluntarily provide such as your GitHub username, LinkedIn, Twitter/X, and YouTube handles.",
      "Project data: Projects, skills, images and case study content you add to your showcase.",
      "Usage data: We may collect basic analytics on how the platform is used to improve the experience.",
    ],
  },
  {
    title: "How We Use Your Information",
    content: [
      "To provide and maintain your personal showcase platform.",
      "To sync your data across devices through Firebase Firestore.",
      "To allow others to view your public portfolio when you share your link.",
      "To send password reset emails when requested.",
      "We do not sell your data to third parties.",
    ],
  },
  {
    title: "Data Storage",
    content: [
      "Your data is stored securely in Google Firebase Firestore and Firebase Authentication.",
      "Profile images are stored as URLs or base64 in your browser's local storage and Firestore.",
      "We use industry-standard encryption for data in transit and at rest.",
    ],
  },
  {
    title: "Public Portfolio",
    content: [
      "When you share your public portfolio link (/view/yourname), your profile, projects and skills become visible to anyone with the link.",
      "You can control what appears on your public profile through your Settings.",
      "You can make your portfolio private by not sharing your public link.",
    ],
  },
  {
    title: "Cookies",
    content: [
      "We use essential cookies to keep you signed in and maintain your session.",
      "We use local storage to cache your preferences and data for faster loading.",
      "We do not use advertising or tracking cookies.",
    ],
  },
  {
    title: "Your Rights",
    content: [
      "You can update or delete your account at any time from Settings → Account → Delete Account.",
      "Deleting your account permanently removes all your data from our systems.",
      "You can request a copy of your data by contacting us through the Support page.",
    ],
  },
  {
    title: "Contact",
    content: [
      "If you have questions about this Privacy Policy, please use the Support page to contact us.",
      "We will respond to all privacy-related inquiries within 7 business days.",
    ],
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#07071a] text-white">
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-5 md:px-8 py-4 bg-[#07071a]/80 backdrop-blur-md border-b border-white/5">
        <Link to="/welcome" className="font-black text-xl">
          SH<span className="text-violet-400">.</span>
          <span className="text-slate-500 text-sm font-normal ml-2 hidden sm:inline">Showcase Hub</span>
        </Link>
        <Link to="/welcome" className="text-xs tracking-widest uppercase text-slate-400 hover:text-white transition-colors">
          ← Back
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-28 pb-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <p className="text-violet-400 text-xs tracking-[0.4em] uppercase mb-3 font-semibold">✦ Legal</p>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Privacy Policy</h1>
          <p className="text-slate-400 text-sm">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
          <p className="text-slate-400 mt-4 leading-relaxed">
            Showcase Hub is committed to protecting your privacy. This policy explains what information we collect, how we use it and what rights you have.
          </p>
        </motion.div>

        <div className="space-y-10">
          {sections.map((section, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <h2 className="text-xl font-black text-white mb-4 flex items-center gap-3">
                <span className="text-violet-400 font-black text-sm">{String(i + 1).padStart(2, "0")}</span>
                {section.title}
              </h2>
              <ul className="space-y-3">
                {section.content.map((item, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <span className="text-violet-400 mt-1 flex-shrink-0">·</span>
                    <p className="text-slate-400 text-sm leading-relaxed">{item}</p>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap gap-4 text-xs text-slate-600">
          <Link to="/terms" className="hover:text-violet-400 transition-colors">Terms of Service</Link>
          <span>·</span>
          <Link to="/welcome" className="hover:text-violet-400 transition-colors">Home</Link>
          <span>·</span>
          <Link to="/support" className="hover:text-violet-400 transition-colors">Contact Support</Link>
        </div>
      </div>
    </div>
  );
}
