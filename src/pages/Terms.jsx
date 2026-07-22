import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const sections = [
  {
    title: "Acceptance of Terms",
    content: [
      "By creating an account or using Showcase Hub, you agree to these Terms of Service.",
      "If you do not agree with any part of these terms, you may not use the platform.",
      "We reserve the right to update these terms at any time. Continued use after changes constitutes acceptance.",
    ],
  },
  {
    title: "Your Account",
    content: [
      "You are responsible for maintaining the security of your account and password.",
      "You must provide accurate information when creating your account.",
      "You may not use another person's account without permission.",
      "You must be at least 13 years old to create an account.",
      "We reserve the right to suspend or terminate accounts that violate these terms.",
    ],
  },
  {
    title: "Acceptable Use",
    content: [
      "You may use Showcase Hub only for lawful purposes and in accordance with these terms.",
      "You may not upload content that is illegal, harmful, threatening, abusive or offensive.",
      "You may not attempt to gain unauthorized access to any part of the platform.",
      "You may not use the platform to spam, phish or conduct fraudulent activities.",
      "You may not impersonate other individuals or organizations.",
    ],
  },
  {
    title: "Your Content",
    content: [
      "You retain ownership of all content you upload to Showcase Hub.",
      "By uploading content, you grant us a license to store and display it as part of your showcase.",
      "You are solely responsible for the content you publish on your public portfolio.",
      "We reserve the right to remove content that violates these terms.",
    ],
  },
  {
    title: "Public Portfolio",
    content: [
      "When you share your public portfolio link, your content becomes visible to anyone with that link.",
      "You are responsible for what you choose to make public.",
      "Showcase Hub is not responsible for how third parties use or share your public portfolio link.",
    ],
  },
  {
    title: "Service Availability",
    content: [
      "We strive to maintain high availability but do not guarantee uninterrupted access.",
      "We may temporarily suspend the service for maintenance or updates.",
      "We reserve the right to modify or discontinue features with reasonable notice.",
    ],
  },
  {
    title: "Limitation of Liability",
    content: [
      "Showcase Hub is provided on an 'as is' basis without warranties of any kind.",
      "We are not liable for any indirect, incidental or consequential damages.",
      "Our total liability shall not exceed the amount you paid us in the past 12 months (which is zero for free accounts).",
    ],
  },
  {
    title: "Termination",
    content: [
      "You may delete your account at any time from Settings → Account → Delete Account.",
      "We may terminate your account for violations of these terms with or without notice.",
      "Upon termination, your data will be permanently deleted from our systems.",
    ],
  },
  {
    title: "Contact",
    content: [
      "For questions about these Terms of Service, please use the Support page.",
      "Legal notices should be sent through the Contact Support option.",
    ],
  },
];

export default function Terms() {
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
          <h1 className="text-4xl md:text-5xl font-black mb-4">Terms of Service</h1>
          <p className="text-slate-400 text-sm">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
          <p className="text-slate-400 mt-4 leading-relaxed">
            These Terms of Service govern your use of Showcase Hub. Please read them carefully before using the platform.
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
          <Link to="/privacy" className="hover:text-violet-400 transition-colors">Privacy Policy</Link>
          <span>·</span>
          <Link to="/welcome" className="hover:text-violet-400 transition-colors">Home</Link>
          <span>·</span>
          <Link to="/support" className="hover:text-violet-400 transition-colors">Contact Support</Link>
        </div>
      </div>
    </div>
  );
}
