import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/auth/authSlice';
import { useGetProfileQuery } from '../features/profile/profileApi';
import { useAuthImage } from '../hooks/useAuthImage';
import { FiSearch, FiMoon, FiSun, FiMenu, FiX, FiUser, FiHash, FiMessageSquare } from 'react-icons/fi';
import { SlNote } from 'react-icons/sl';
import MindStack from '../assets/Mindstack.png';
import { useTheme } from '../context/ThemeContext';
import { useSearchUsersQuery, useSearchTagsQuery, useSearchCommentsQuery } from '../features/search/searchApi';
import { navItems } from '../layout/Sidebar';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { data: profile } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
  });
  const avatarSrc = useAuthImage(profile?.profileImage ?? null);

  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);

  // Mobile Menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAppSidebarOpen, setIsAppSidebarOpen] = useState(false);

  // Close mobile menus when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsAppSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: usersData, isFetching: usersLoading } = useSearchUsersQuery(debouncedQuery, { skip: debouncedQuery.length < 2 });
  const { data: tagsData, isFetching: tagsLoading } = useSearchTagsQuery(debouncedQuery, { skip: debouncedQuery.length < 2 });
  const { data: commentsData, isFetching: commentsLoading } = useSearchCommentsQuery(debouncedQuery, { skip: debouncedQuery.length < 2 });

  const isSearching = usersLoading || tagsLoading || commentsLoading;

  // const isHomePage = location.pathname === "/";
  const isHomePage =
    location.pathname === "/" || location.pathname === "/about-us";

  const navLinks = [
    { label: "Features", to: "/features " },
    { label: "Testimonials", to: "/testimonials" },
    { label: "About Us", to: "/aboutus" },
  ];

  if (isHomePage) {
    return (
      <header className="w-full bg-white dark:bg-gray-950 sticky top-0 z-50 transition-colors duration-300">
        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center dark:shadow-blue-900/30">
                <img src={MindStack} alt="" />
              </div>
              <span className="text-[22px] font-black text-gray-900 dark:text-white tracking-tight">
                MindStack
              </span>
            </Link>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-7 flex-1 justify-center">
              {[
                { label: "Features", id: "features" },
                { label: "Testimonials", id: "testimonials" },
                { label: "About Us", id: null },
              ].map(({ label, id }) =>
                id ? (
                  <button
                    key={label}
                    onClick={() =>
                      document
                        .getElementById(id)
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="text-[15px] font-medium text-gray-600 dark:text-gray-300
                      hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-transparent border-none cursor-pointer"
                  >
                    {label}
                  </button>
                ) : (
                  <Link
                    key={label}
                    to="/about-us"
                    className="text-[15px] font-medium text-gray-600 dark:text-gray-300
                      hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {label}
                  </Link>
                ),
              )}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-3 shrink-0">
              <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleTheme} />

              {isAuthenticated ? (
                <Link
                  to="/questions"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-bold rounded-full transition-all hover:-translate-y-0.5 shadow-sm shadow-blue-200 dark:shadow-blue-900/30"
                >
                  Question
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="hidden sm:block text-[14px] font-semibold text-gray-700 dark:text-gray-200
                      hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-2"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    className="hidden sm:flex items-center px-5 py-2 bg-blue-600 hover:bg-blue-700
                      text-white text-[14px] font-bold rounded-full transition-all
                      hover:-translate-y-0.5 shadow-sm shadow-blue-200 dark:shadow-blue-900/30"
                  >
                    Sign up free
                  </Link>
                </>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-gray-950 flex flex-col pt-2 pb-6 px-6 gap-5 animate-in slide-in-from-top-2 z-40">
              <nav className="flex flex-col gap-4">
                {[
                  { label: "Features", id: "features" },
                  { label: "Testimonials", id: "testimonials" },
                  { label: "About Us", id: null },
                ].map(({ label, id }) =>
                  id ? (
                    <button
                      key={label}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="text-left text-[16px] font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 py-2 border-b border-gray-100 dark:border-gray-800"
                    >
                      {label}
                    </button>
                  ) : (
                    <Link
                      key={label}
                      to="/about-us"
                      className="text-left text-[16px] font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 py-2 border-b border-gray-100 dark:border-gray-800"
                    >
                      {label}
                    </Link>
                  )
                )}
              </nav>

              <div className="flex flex-col gap-3 mt-2">
                {isAuthenticated ? (
                  <Link
                    to="/questions"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-[15px] font-bold rounded-xl text-center transition-colors shadow-sm shadow-blue-200 dark:shadow-blue-900/30"
                  >
                    Go to App
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="w-full py-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 text-[15px] font-bold rounded-xl text-center transition-colors border border-gray-200 dark:border-gray-700"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-[15px] font-bold rounded-xl text-center transition-colors shadow-sm shadow-blue-200 dark:shadow-blue-900/30"
                    >
                      Sign up free
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
    );
  }

  // APP HEADER
  return (
    <header className="w-full bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Hamburger + Logo */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          <button
            onClick={() => setIsAppSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <FiMenu className="w-5 h-5" />
          </button>

          <Link
            to="/"
            className="flex items-center gap-2 shrink-0 group"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-lg transition-transform group-hover:scale-105">
              <img src={MindStack} alt="" />
            </div>
            <span className="text-lg font-black text-gray-900 dark:text-white tracking-tight hidden sm:block">
              MindStack
            </span>
          </Link>
        </div>

        {/* 2. Global Search Input */}
        <div className="flex-1 max-w-2xl px-4" ref={searchRef}>
          <div className="relative group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search questions, topics, or tags..."
              className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />

            {/* Dropdown with results */}
            {isSearchOpen && debouncedQuery.length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/50 overflow-hidden z-50">
                <div className="max-h-96 overflow-y-auto w-full">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                      Searching...
                    </div>
                  ) : (usersData?.length === 0 && tagsData?.length === 0 && commentsData?.length === 0) ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                      No results found for "{debouncedQuery}".
                    </div>
                  ) : (
                    <div className="py-2">
                      {/* Users */}
                      {usersData && usersData.length > 0 && (
                        <div className="px-4 py-2">
                          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase flex items-center gap-2 mb-2">
                            <FiUser /> Users
                          </h3>
                          <div className="space-y-1">
                            {usersData.slice(0, 5).map(user => (
                              <Link key={user.id || user.userId} to={`/profile/${user.id || user.userId}`} className="block px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 transition-colors">
                                <span className="text-sm font-medium dark:text-gray-200">{user.displayName || user.username}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {tagsData && tagsData.length > 0 && (
                        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800">
                          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase flex items-center gap-2 mb-2">
                            <FiHash /> Tags
                          </h3>
                          <div className="space-y-1">
                            {tagsData.slice(0, 5).map(tag => (
                              <Link key={tag.id} to={`/questions`} className="block px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 transition-colors" onClick={() => setIsSearchOpen(false)}>
                                <span className="text-sm font-medium dark:text-gray-200">{tag.tagName}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Comments */}
                      {commentsData && commentsData.length > 0 && (
                        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800">
                          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase flex items-center gap-2 mb-2">
                            <FiMessageSquare /> Comments
                          </h3>
                          <div className="space-y-1">
                            {commentsData.slice(0, 5).map(comment => (
                              <Link key={comment.id} to={`/question/${comment.postId}`} className="block px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 transition-colors" onClick={() => setIsSearchOpen(false)}>
                                <span className="text-sm font-medium dark:text-gray-200 line-clamp-1">{comment.content}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ask Button + Dark Mode + Avatar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {isAuthenticated && (
            <Link
              to="/ask"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all hover:-translate-y-0.5 shadow-sm shadow-blue-200 dark:shadow-blue-900/30"
            >
              <span className="text-base leading-none">
                <SlNote />
              </span>
              Ask question
            </Link>
          )}

          <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleTheme} />

          {isAuthenticated ? (
            <Link to="/account" className="relative group block shrink-0">
              <div className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-800 overflow-hidden bg-gray-100 dark:bg-gray-800 transition-all group-hover:border-blue-500 dark:group-hover:border-blue-400 group-hover:shadow-lg group-hover:shadow-blue-500/10">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt="User Avatar"
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm">
                    {profile?.displayName?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-gray-950 rounded-full shadow-sm shadow-emerald-500/50"></div>
            </Link>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors border border-transparent"
            >
              Log in
            </Link>
          )}
        </div>
      </div>

      {/* App Mobile Sidebar Overlay */}
      {isAppSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-100 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsAppSidebarOpen(false)}
          />

          {/* Slide-in Panel */}
          <div className="relative w-72 max-w-[80vw] bg-white dark:bg-gray-950 h-full shadow-2xl flex flex-col animate-in slide-in-from-left-full duration-300">
            {/* Header of Sidebar */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 dark:border-gray-800">
              <span className="text-[20px] font-black text-gray-900 dark:text-white tracking-tight">
                Menu
              </span>
              <button
                onClick={() => setIsAppSidebarOpen(false)}
                className="p-2 -mr-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Nav list */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
              {navItems.map(({ label, path, icon }) => (
                <Link
                  key={label}
                  to={path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[15px] transition-colors ${location.pathname === path
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                >
                  <span className="text-[20px]">{icon}</span>
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

function ThemeToggle({ isDarkMode, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={isDarkMode ? "Light mode" : "Dark mode"}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        border: isDarkMode ? "1.5px solid #374151" : "1.5px solid #e5e7eb",
        background: isDarkMode
          ? "linear-gradient(135deg, #1f2937 0%, #111827 100%)"
          : "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
        cursor: "pointer",
        transition: "all 0.25s ease",
        outline: "none",
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: isDarkMode ? "#fbbf24" : "#3b82f6",
          transition: "all 0.25s ease",
        }}
      >
        {isDarkMode ? (
          <FiSun style={{ width: "20px", height: "20px", strokeWidth: 2.5 }} />
        ) : (
          <FiMoon style={{ width: "20px", height: "20px", strokeWidth: 2.5 }} />
        )}
      </span>
    </button>
  );
}
