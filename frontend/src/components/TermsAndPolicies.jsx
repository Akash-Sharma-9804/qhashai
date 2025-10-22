// src/pages/TermsAndPolicies.jsx
import React, { useEffect,useState } from "react";
import {  Link } from "react-router-dom";
import {
  Sun,
  Moon,

} from "lucide-react";

const TermsAndPolicies = () => {

    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("darkMode") === "true"; // default to false if not found
      });

  useEffect(() => {
    document.title = "Terms & Policies | QuantumHash";
  }, []);
const toggleTheme = () => {
    setDarkMode((prev) => {
      localStorage.setItem("darkMode", !prev);
      return !prev;
    });
  };
  

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);
  return (
    <div className="bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-200 min-h-screen">
      {/* Header */}
    <header className="sticky top-0 z-50 bg-gray-100 dark:bg-[#282828] border-b border-gray-300 dark:border-gray-700 px-6 py-4 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90">
  <div className="flex items-center justify-between max-w-7xl mx-auto">
    {/* Logo */}
    <div className="flex items-center">
  {/* Light Mode Logo */}
  <img
    src="/logoName.png"
    alt="QuantumHash Logo Light"
    className="h-9 w-auto max-w-[160px] block dark:hidden object-contain"
  />
  {/* Dark Mode Logo */}
  <img
    src="/dark_logo.png"
    alt="QuantumHash Logo Dark"
    className="h-9 w-auto max-w-[160px] hidden dark:block object-contain"
  />
</div>

<div className="flex items-center gap-4">
    <Link to="/" className=" px-3 py-2 rounded-lg text-sm
                 bg-[#282828] text-white dark:bg-slate-200 dark:text-black
                 hover:bg-slate-200 hover:text-black dark:hover:bg-[#282828] dark:hover:text-white
                 border border-black dark:border-white transition-all duration-300 ease-in-out">Home</Link>

    {/* Theme Toggle Button */}
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                 bg-[#282828] text-white dark:bg-slate-200 dark:text-black
                 hover:bg-slate-200 hover:text-black dark:hover:bg-[#282828] dark:hover:text-white
                 border border-black dark:border-white transition-all duration-300 ease-in-out"
    >
      {/* Animated Icon Swap */}
      <div className="relative w-5 h-5 flex-shrink-0">
        <div
          className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
            darkMode ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
          }`}
        >
          <Sun size={18} />
        </div>
        <div
          className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
            darkMode ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"
          }`}
        >
          <Moon size={18} />
        </div>
      </div>

      {/* Label */}
      {/* <span className="whitespace-nowrap">
        {darkMode ? "Light Mode" : "Dark Mode"}
      </span> */}
    </button>
</div>
  </div>
</header>



      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-10 space-y-12">
        {/* Privacy Policy */}
        <section>
          <h2 className="text-3xl font-bold mb-4 text-center">Privacy Policy</h2>
          <p className="mb-2 text-sm">Last Updated: June 2025</p>

          <p>
            This Privacy Policy governs the use of data by QuantumHash Corporation ("we", "us", "our"), 
            applicable to all services across our domains:
            <br />
            <span className="text-blue-400 block mt-2">
              quantumhash.me, qhashai.com, artlabss.com, quantumedu.in, asesystem.com
            </span>
          </p>

          <div className="space-y-4 mt-4 text-sm leading-relaxed">
            <p><strong>1. Scope:</strong> Applies to all data collected via our platforms and subsidiaries.</p>
            <p><strong>2. Data We Collect:</strong></p>
            <ul className="list-disc list-inside ml-4">
              <li>Account Data: Name, email, contact details</li>
              <li>Usage Data: IP, device, browser, cookies</li>
              <li>User Content: AI interactions, educational data, safety reports</li>
              <li>Subsidiary-specific data collection (e.g., chat logs, voice recordings, performance metrics)</li>
            </ul>

            <p><strong>3. How We Use Data:</strong> Service improvement, personalization, safety assurance. No third-party ads.</p>
            <p><strong>4. Data Sharing:</strong> Only with trusted vendors or internally under strict agreements. All secured.</p>
            <p><strong>5. Your Rights:</strong> Request data access, correction, or deletion. Email: <a href="mailto:privacy@quantumhash.me" className="text-blue-400">privacy@quantumhash.me</a></p>
            <p><strong>6. Children’s Privacy:</strong> COPPA and GDPR-K compliant for QuantumEdu. Parental consent is required.</p>
          </div>
        </section>

        <hr className="border-gray-300 dark:border-gray-700" />

        {/* Terms of Service */}
        <section>
          <h2 className="text-3xl font-bold mb-4 text-center">Terms of Service</h2>
          <p className="mb-2 text-sm">Last Updated: June 2025</p>

          <div className="space-y-4 text-sm leading-relaxed">
            <p><strong>1. Acceptance:</strong> Using our services means agreeing to these terms.</p>
            <p><strong>2. Account Responsibilities:</strong> Provide accurate info and secure your account access.</p>
            <p><strong>3. Platform Rules:</strong></p>
            <ul className="list-disc list-inside ml-4">
              <li>QhashAI: Don’t submit sensitive data. AI is for informational purposes only.</li>
              <li>ArtLabss: Voice data may be processed. Misuse not tolerated.</li>
              <li>QuantumEdu: Parental setup for minors. Misuse can result in suspension.</li>
              <li>ASE System: Reports must be accurate. Not a substitute for professional audits.</li>
            </ul>

            <p><strong>4. Intellectual Property:</strong> Users own their inputs. We own the platform and models.</p>
            <p><strong>5. Limitation of Liability:</strong> We’re not liable for errors or outcomes. Services are “as-is.”</p>
            <p><strong>6. Termination:</strong> We can suspend or remove access due to violations.</p>
            <p><strong>7. Governing Law:</strong> Governed by laws of Delaware, USA. Jurisdiction applies.</p>
            <p><strong>8. Contact:</strong> Email us for any support at <a href="mailto:support@quantumhash.me" className="text-blue-400">support@quantumhash.me</a></p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-300 dark:border-gray-800">
        © 2025 QuantumHash Corporation. All rights reserved.
      </footer>
    </div>
  );
};

export default TermsAndPolicies;
