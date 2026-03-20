import React, { useState } from "react";
import heroImage from "../assets/Herosection.png";
import { FaArrowRight } from "react-icons/fa6";
import { LuMessageSquare, LuGift, LuUsers } from "react-icons/lu";
import { CiTrophy } from "react-icons/ci";
import { CgMediaLive } from "react-icons/cg";
import { RiShieldLine } from "react-icons/ri";
import { IoCodeSlash } from "react-icons/io5";
import { GoStarFill } from "react-icons/go";
import { FiSearch, FiUser, FiMessageCircle, FiClock } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useGetPostsQuery, useGetPostsSortedByScoreQuery, useGetTagsQuery } from "../features/post/postsApi";
import SEO from "../components/SEO";

const HomePage = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  
  const { data: posts, isLoading: postsLoading } = useGetPostsQuery();
  const { data: trendingPosts } = useGetPostsSortedByScoreQuery();
  const { data: tags } = useGetTagsQuery();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/questions?search=${encodeURIComponent(searchInput)}`);
    }
  };

  // Dynamic stats calculation
  const stats = [
    { label: "Developers", value: posts ? Array.from(new Set(posts.map(p => p.ownerId))).length + "+" : "50K+" },
    { label: "Questions Answered", value: posts ? posts.length + "+" : "120K+" },
    { label: "XP Earned", value: posts ? (posts.reduce((acc, p) => acc + (p.score || 0), 0) * 10).toLocaleString() + "+" : "2M+" },
    { label: "Satisfaction", value: "98%" }
  ];

  return (
    <main className="bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white transition-colors duration-300">
      <SEO
        title="Home"
        description="MindStack is a free gamified Q&A platform for software developers. Ask programming questions, share answers, earn badges, tackle code challenges, and climb the leaderboard. Built by ISTAD in Phnom Penh, Cambodia."
        keywords="MindStack home, developer Q&A, coding questions, gamified learning, ISTAD, Phnom Penh, developer community"
      />
      {/* HERO */}
      <section className="relative text-center py-24 px-6 overflow-hidden">
        <img
          src={heroImage}
          alt="Developers collaborating"
          className="absolute inset-0 w-full h-full object-cover opacity-5"
        />
        <div className="relative max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
            Where developers
            <span className="block bg-linear-to-r from-blue-500 to-amber-400 bg-clip-text text-transparent">
              level up together
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-600 dark:text-gray-400 max-w-3xl mx-auto">
            The gamified Q&A platform that makes sharing knowledge rewarding.
            Ask questions, earn XP, unlock badges, and climb the leaderboard.
          </p>
          
          {/* Dynamic Search Interface (Added as requested previously but kept discreet) */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto mt-10 relative">
            <div className="flex items-center bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-1 shadow-lg focus-within:ring-2 focus-within:ring-blue-500 transition-all">
              <FiSearch className="ml-4 text-slate-400 w-5 h-5" />
              <input 
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search for questions, tags, or users..."
                className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-sm"
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition">
                Search
              </button>
            </div>
          </form>

          <div className="flex gap-4 flex-wrap justify-center mt-10">
            <Link
              to="/questions"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-semibold flex items-center gap-2 transition shadow-lg"
            >
              Start for free <FaArrowRight />
            </Link>
            <button 
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="border border-slate-300 dark:border-gray-700 px-8 py-3 rounded-2xl font-semibold hover:bg-slate-100 dark:hover:bg-gray-800 transition"
            >
              See how it works
            </button>
          </div>

          {/* Stats Section with Dynamic Data */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            {stats.map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-slate-500 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto border-t border-slate-100 dark:border-gray-900">
        <h2 className="text-4xl font-bold text-center mb-4">
          Everything you need to grow
        </h2>
        <p className="text-center text-slate-600 dark:text-gray-400 mb-16 max-w-xl mx-auto">
          A developer community built with gamification at its core.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: <LuMessageSquare />, title: "Q&A That Rewards" },
            { icon: <CiTrophy />, title: "Leaderboards" },
            { icon: <CgMediaLive />, title: "Daily Challenges" },
            { icon: <RiShieldLine />, title: "Level Up System" },
            { icon: <LuGift />, title: "Badges & Rewards" },
            { icon: <IoCodeSlash />, title: "Code-First UX" },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 p-8 rounded-2xl hover:shadow-xl transition"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-gray-800 rounded-xl mb-4 text-blue-600 text-xl">
                {item.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-slate-600 dark:text-gray-400 text-sm">
                Build reputation, earn XP, and grow within a thriving developer
                ecosystem.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6 bg-slate-100 dark:bg-gray-900 transition border-y border-slate-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">How it works</h2>
          <p className="text-slate-600 dark:text-gray-400 mb-16">
            Three simple steps to start leveling up.
          </p>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              ["01", "Ask or Answer"],
              ["02", "Earn XP & Badges"],
              ["03", "Climb the Ranks"],
            ].map(([step, title]) => (
              <div key={step}>
                <div className="text-blue-600 text-4xl font-bold mb-4">
                  {step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-slate-600 dark:text-gray-400">
                  Contribute knowledge and get rewarded instantly.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-24 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16">
          What devs are saying
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {trendingPosts ? (
            trendingPosts.slice(0, 3).map((post, i) => (
              <div
                key={post.id || i}
                className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 p-8 rounded-2xl shadow-sm"
              >
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, index) => (
                    <GoStarFill key={index} />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-gray-400 mb-6 italic line-clamp-3">
                  "{post.body ? post.body.replace(/<[^>]+>/g, '') : "This platform actually makes learning and sharing fun. The community is incredibly supportive."}"
                </p>
                <div className="border-t dark:border-gray-700 pt-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-gray-800 flex items-center justify-center font-bold text-xs uppercase text-blue-600 dark:text-blue-400">
                    {(post.ownerDisplayName || "UnknownDev")[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{post.ownerDisplayName || "Unknown Dev"}</p>
                    <p className="text-xs text-slate-500 dark:text-gray-400">
                      Community Contributor
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            [
              ["Sarah M.", "Senior Engineer @ Stripe"],
              ["James L.", "Full-Stack Dev"],
              ["Erwin W.", "Tech Lead @ Netflix"],
            ].map(([name, role], i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 p-8 rounded-2xl shadow-sm animate-pulse"
              >
                <div className="flex text-yellow-400 mb-4 opacity-50">
                  {[...Array(5)].map((_, idx) => (
                    <GoStarFill key={idx} />
                  ))}
                </div>
                <div className="h-16 bg-slate-100 dark:bg-gray-800 rounded mb-6"></div>
                <div className="border-t dark:border-gray-700 pt-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-gray-800"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 dark:bg-gray-800 rounded w-1/2"></div>
                    <div className="h-3 bg-slate-100 dark:bg-gray-800 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl text-center p-12 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16" />
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-4">Ready to level up?</h2>
            <p className="text-slate-600 dark:text-gray-400 mb-8 max-w-lg mx-auto">
              Join thousands of developers earning XP, unlocking achievements, and building the future of software.
            </p>
            <Link
              to="/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-3 rounded-2xl font-semibold inline-block transition shadow-lg hover:scale-105 active:scale-95"
            >
              Get Started for Free
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};
export default HomePage;