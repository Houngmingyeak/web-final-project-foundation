import React, { useState } from "react";
import Img from "../assets/istad.png";
import { CiFacebook, CiLinkedin, CiTwitter } from "react-icons/ci";
import { PiTelegramLogo } from "react-icons/pi";
import { CgMail } from "react-icons/cg";
import { FaYoutube, FaInstagram } from "react-icons/fa6";
import imgMindStack from "../assets/mindstack.png";
import { Link } from "react-router-dom";
import { RiTiktokLine } from "react-icons/ri";
import { TermsModal, CookiesSettingsModal, PrivacySettingsModal } from "./LegalModals";

const Footer = () => {
  const [activeModal, setActiveModal] = useState(null); // 'terms', 'cookies', 'privacy'

  return (
    <footer className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-200 py-12 px-6 md:px-12 lg:px-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* TOP SECTION: Grid updated to sm:grid-cols-2 lg:grid-cols-4 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 border-b border-gray-200 dark:border-gray-700 pb-12">
          {/* Column 1: Sponsored */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left md:ml-6">
            <h3 className="text-xl font-bold mb-4">
              Sponsored and Organized by
            </h3>
            <img
              src={Img}
              alt="iSTAD Logo"
              className="w-40 h-20 object-contain"
            />
            <p className="pt-3 text-sm max-w-[240px]">
              Institute of Science and Technology Advance Development
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div className="flex flex-col items-center sm:items-start md:ml-48">
            <h3 className="text-blue-600 dark:text-blue-400 text-xl font-bold mb-4">
              Navigation
            </h3>
            <ul className="space-y-2 text-center sm:text-left">
              {[
                { label: "Home", to: "/" },
                { label: "Questions", to: "/questions" },
                { label: "Leaderboard", to: "/leaderboard" },
                { label: "Challenges", to: "/challenges" },
                { label: "About Us", to: "/about-us" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Get in touch */}
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-bold mb-4">Get in touch</h3>
            <div className="flex gap-4 mb-4 flex-wrap justify-center sm:justify-start">
              <a href="https://www.facebook.com/istad.co" target="_blank" rel="noreferrer" title="Facebook"><CiFacebook className="text-2xl hover:text-blue-600 transition" /></a>
              <a href="https://twitter.com/mindstack" target="_blank" rel="noreferrer" title="X (Twitter)"><CiTwitter className="text-2xl hover:text-blue-400 transition" /></a>
              <a href="https://instagram.com/mindstack" target="_blank" rel="noreferrer" title="Instagram"><FaInstagram className="text-xl hover:text-pink-600 transition mt-0.5" /></a>
              <a href="https://youtube.com/mindstack" target="_blank" rel="noreferrer" title="YouTube"><FaYoutube className="text-xl hover:text-red-600 transition mt-0.5" /></a>
              <a href="https://linkedin.com/company/mindstack" target="_blank" rel="noreferrer" title="LinkedIn"><CiLinkedin className="text-2xl hover:text-blue-700 transition" /></a>
              <a href="https://t.me/istadkh" target="_blank" rel="noreferrer" title="Telegram"><PiTelegramLogo className="text-2xl hover:text-blue-500 transition" /></a>
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-xs text-center sm:text-left mt-2 mb-4 space-y-1">
              <p>📍 St 32, Institute of Science & Technology</p>
              <p>Phnom Penh, Cambodia</p>
              <p>📞 +855 000 000</p>
            </div>
            <form className="w-full max-w-xs">
              <input
                type="text"
                placeholder="Write your message here..."
                className="w-full p-3 rounded-2xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </form>
          </div>

          {/* Column 4: Developed By */}
          <div className="flex flex-col items-center  md:ml-38 lg:items-end text-center lg:text-right">
            <h3 className="text-xl font-bold mb-2">Developed by</h3>
            <img
              src={imgMindStack}
              alt="MindStack Logo"
              className="w-28 h-28 object-contain"
            />
            <p className="font-bold">MindStack</p>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm pt-8 gap-4">
          <div className="text-gray-500 dark:text-gray-400">
            ©2026 Copyright by MindStack
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-blue-600 dark:text-blue-400">
            {[
              { id: "terms", label: "Term of Service" },
              { id: "cookies", label: "Cookies Settings" },
              { id: "privacy", label: "Privacy Settings" },
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => setActiveModal(link.id)}
                className="hover:underline whitespace-nowrap bg-transparent border-none cursor-pointer text-blue-600 dark:text-blue-400 font-medium"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <TermsModal isOpen={activeModal === "terms"} onClose={() => setActiveModal(null)} />
      <CookiesSettingsModal isOpen={activeModal === "cookies"} onClose={() => setActiveModal(null)} />
      <PrivacySettingsModal isOpen={activeModal === "privacy"} onClose={() => setActiveModal(null)} />
    </footer>
  );
};

export default Footer;
