import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheck, FiShield, FiLock, FiGlobe, FiEye } from "react-icons/fi";

const ModalWrapper = ({ isOpen, onClose, title, children, icon: Icon }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                  <Icon className="w-5 h-5" />
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {children}
          </div>

          {/* Footer - Only shown if needed, can be injected or standard */}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export const TermsModal = ({ isOpen, onClose }) => {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Terms of Service" icon={FiLock}>
      <div className="space-y-4 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
        <p className="font-medium text-gray-900 dark:text-white">
          Last updated: March 20, 2026
        </p>
        <p>
          Welcome to MindStack. By accessing or using our platform, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
        </p>

        <section className="space-y-2">
          <h4 className="font-bold text-gray-800 dark:text-gray-200">1. License and Use</h4>
          <p>
            MindStack grants you a limited, non-assignable, and non-exclusive license to use the service for personal and educational purposes in accordance with these terms.
          </p>
        </section>

        <section className="space-y-2">
          <h4 className="font-bold text-gray-800 dark:text-gray-200">2. User Accounts & Responsibility</h4>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials. You must immediately notify us of any unauthorized use. You agree not to post malicious, offensive, or illegal content.
          </p>
        </section>

        <section className="space-y-2">
          <h4 className="font-bold text-gray-800 dark:text-gray-200">3. Termination of Services</h4>
          <p>
            We reserve the right to suspend or terminate your account at our sole discretion, without notice, for conduct that violates these Terms or is harmful to other users or our business interests.
          </p>
        </section>

        <section className="space-y-2">
          <h4 className="font-bold text-gray-800 dark:text-gray-200">4. Limitations of Liability</h4>
          <p>
            MindStack is provided "as is" and "as available". We do not warrant that the service will be uninterrupted or error-free. In no event shall MindStack be liable for any indirect or consequential damages.
          </p>
        </section>
      </div>
      <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
        <button
          onClick={onClose}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-sm shadow-blue-200 dark:shadow-blue-900/30"
        >
          I Understand
        </button>
      </div>
    </ModalWrapper>
  );
};

export const CookiesSettingsModal = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    essential: true,
    preferences: true,
    analytics: false,
    marketing: false,
  });

  const handleToggle = (key) => {
    if (key === 'essential') return; // Cannot toggle essential
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const cookieTypes = [
    {
      key: 'essential',
      title: 'Essential Cookies',
      description: 'Necessary for the website to function, such as authentication and security features. These cannot be disabled.',
      icon: FiLock,
    },
    {
      key: 'preferences',
      title: 'Preferences Cookies',
      description: 'Used to remember your settings, such as theme choice (dark/light) and preferred interface setup.',
      icon: FiGlobe,
    },
    {
      key: 'analytics',
      title: 'Analytics Cookies',
      description: 'Help us understand how visitors interact with the site, allowing us to enhance performance and features.',
      icon: FiEye,
    },
    {
      key: 'marketing',
      title: 'Marketing Cookies',
      description: 'Used to provide more relevant advertising and measure the effectiveness of our campaigns.',
      icon: FiGlobe,
    },
  ];

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Cookie Settings" icon={FiGlobe}>
      <div className="space-y-5">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          We use cookies to enhance your experience. You can manage your preferences for non-essential cookies below.
        </p>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {cookieTypes.map((cookie) => (
            <div key={cookie.key} className="py-4 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h5 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <cookie.icon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  {cookie.title}
                </h5>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-md">
                  {cookie.description}
                </p>
              </div>
              
              <button
                onClick={() => handleToggle(cookie.key)}
                disabled={cookie.key === 'essential'}
                className={`w-11 h-6 rounded-full flex items-center px-1 transition-colors relative cursor-pointer ${
                  settings[cookie.key] ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                } ${cookie.key === 'essential' ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                    settings[cookie.key] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 font-bold">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-sm shadow-blue-200 dark:shadow-blue-900/30 flex items-center gap-2"
          >
            <FiCheck className="w-4 h-4" /> Save Preferences
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export const PrivacySettingsModal = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    profilePublic: true,
    emailNotifications: true,
    searchIndexing: false,
    activityLog: true,
  });

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const privacyOptions = [
    {
      key: 'profilePublic',
      title: 'Public Profile',
      description: 'Allow other users to view your stats, posts, and details on your profile page.',
    },
    {
      key: 'emailNotifications',
      title: 'Email Notifications',
      description: 'Receive core updates, digest summaries, and account-related alerts to your inbox.',
    },
    {
      key: 'searchIndexing',
      title: 'Search Engine Indexing',
      description: 'Allow Google and other search engines to index your posts and user page.',
    },
    {
      key: 'activityLog',
      title: 'Activity Sharing',
      description: 'Let other users see which topics or posts you are active on (Recent Activity).',
    },
  ];

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Privacy Settings" icon={FiShield}>
      <div className="space-y-5">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage how your data is handled and what information you share with others on the MindStack platform.
        </p>

        <div className="space-y-4">
          {privacyOptions.map((opt) => (
            <div key={opt.key} className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h5 className="font-bold text-gray-800 dark:text-gray-200 text-sm">
                  {opt.title}
                </h5>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm">
                  {opt.description}
                </p>
              </div>
              
              <button
                onClick={() => handleToggle(opt.key)}
                className={`w-11 h-6 rounded-full flex items-center px-1 transition-colors relative cursor-pointer ${
                  settings[opt.key] ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                    settings[opt.key] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 font-bold">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-sm shadow-blue-200 dark:shadow-blue-900/30 flex items-center gap-2"
          >
             Save Changes
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};
