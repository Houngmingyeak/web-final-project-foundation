import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { formatDistanceToNow, format } from "date-fns";
import {
  FiMessageSquare,
  FiHelpCircle,
  FiTrendingUp,
  FiAward as FiAwardIcon,
  FiEye,
  FiUser,
  FiCode,
  FiClock,
  FiTag,
  FiStar,
  FiExternalLink,
} from "react-icons/fi";
import { useGetUserByIdQuery } from "../features/profile/profileApi";
import { useAuthImage } from "../hooks/useAuthImage";
import Sidebar from "../layout/Sidebar";

// ── Badge Card ────────────────────────────────────────────────────────────
function BadgeCard({ count, label, color }) {
  return (
    <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-900/30 rounded-xl hover:shadow-sm transition-shadow">
      <span className={`text-2xl font-black ${color}`}>{count}</span>
      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">
        {label}
      </span>
    </div>
  );
}

// ── Question Row ───────────────────────────────────────────────────────────
function QuestionRow({ q }) {
  return (
    <Link
      to={`/question/${q.id}`}
      className="group flex items-start gap-4 p-4 sm:p-5 hover:bg-gray-50/80 dark:hover:bg-gray-800/60 transition-all border-b border-gray-100 dark:border-gray-800/60 last:border-0"
    >
      <div className="shrink-0 flex flex-col items-center gap-1.5 pt-0.5 w-12">
        <div className="flex items-center gap-1 text-emerald-500 dark:text-emerald-400 text-[13px] font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md w-full justify-center">
          <FiStar className="w-3.5 h-3.5" />
          {q.score ?? 0}
        </div>
        <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500 text-xs font-medium mt-1">
          <FiMessageSquare className="w-3.5 h-3.5" />
          {q.comments?.length ?? 0}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[16px] font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
          {q.title}
        </p>
        {q.tagResponses?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {q.tagResponses.slice(0, 4).map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg translate-y-0 hover:-translate-y-px transition-transform"
              >
                <FiTag className="w-2.5 h-2.5" />
                {t.tagName}
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3 text-[12px] font-medium text-gray-500">
          <span className="flex items-center gap-1.5">
            <FiClock className="w-3.5 h-3.5" />
            {q.creationDate
              ? formatDistanceToNow(new Date(q.creationDate + "Z"), {
                  addSuffix: true,
                })
              : "Recently"}
          </span>
          <span className="flex items-center gap-1.5">
            <FiEye className="w-3.5 h-3.5" />
            {q.viewCount ?? 0} views
          </span>
        </div>
      </div>
      <FiExternalLink className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 shrink-0 mt-1 transition-colors hidden sm:block" />
    </Link>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <aside className="shrink-0 lg:w-64">
        <Sidebar className="hidden lg:flex" />
      </aside>
      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 animate-pulse min-w-0 max-w-5xl mx-auto w-full">
        <div className="bg-white dark:bg-gray-800 rounded-4xl p-6 sm:p-10 flex flex-col sm:flex-row gap-8 items-center sm:items-start border border-gray-100 dark:border-gray-800">
          <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0 border-4 border-gray-50 dark:border-gray-900" />
          <div className="flex-1 space-y-4 w-full text-center sm:text-left pt-3">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-xl mx-auto sm:mx-0" />
            <div className="h-5 w-32 bg-gray-100 dark:bg-gray-700/50 rounded-xl mx-auto sm:mx-0" />
            <div className="h-16 w-full max-w-lg bg-gray-100 dark:bg-gray-700/50 rounded-2xl mt-6 mx-auto sm:mx-0" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserProfile() {
  const { id } = useParams();
  const { data: profile, isLoading, error } = useGetUserByIdQuery(id);
  
  const avatarSrc = useAuthImage(profile?.profileImage);
  const [activeTab, setActiveTab] = useState("questions");

  if (isLoading) return <PageSkeleton />;
  
  if (error || !profile) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <aside className="shrink-0 lg:w-64">
          <Sidebar className="hidden lg:flex" />
        </aside>
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="text-center max-w-md bg-white dark:bg-gray-800 p-8 sm:p-12 rounded-4xl shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-gray-800">
            <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiUser className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">User Not Found</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">We couldn't locate this user's profile. They might have been removed or never existed.</p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors w-full sm:w-auto"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Content extraction
  const questions = profile.questions ?? [];
  const comments = profile.comments ?? [];
  
  // Stats calculation
  const upVotes = profile.upVotes ?? 0;
  const downVotes = profile.downVotes ?? 0;
  const reputation = profile.reputation ?? 0;
  
  // Custom XP and Badges Logic matching Account
  const calculatedXp = (reputation * 15) + (questions.length * 10) + (comments.length * 15) + (upVotes * 5) - (downVotes * 2);
  const xpEarned = Math.max(0, calculatedXp);

  const badges = { 
    gold: Math.max(0, Math.floor(reputation / 100) + Math.floor(upVotes / 50)),
    silver: Math.max(0, Math.floor(reputation / 50) + Math.floor(questions.length / 10)), 
    bronze: Math.max(0, Math.floor(reputation / 10) + Math.floor(comments.length / 5) + 1)
  };

  const activities = [
    ...questions.map(q => ({
      id: `q-${q.id}`,
      type: "question",
      title: "Asked a Question",
      description: q.title,
      date: q.creationDate ? new Date(q.creationDate + "Z") : new Date(),
      link: `/question/${q.id}`,
      icon: FiHelpCircle,
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/20",
    })),
    ...comments.map(c => ({
      id: `c-${c.id}`,
      type: "answer",
      title: "Answered a Question",
      description: c.text || c.body || "",
      date: c.creationDate ? new Date(c.creationDate + "Z") : new Date(),
      link: `/question/${c.postId || c.post?.id || ""}`,
      icon: FiMessageSquare,
      color: "text-purple-500 bg-purple-50 dark:bg-purple-500/20",
    })),
  ].sort((a, b) => b.date - a.date);

  const tabs = [
    { id: "questions", label: "Questions", count: questions.length },
    { id: "answers", label: "Answers", count: comments.length },
    { id: "activity", label: "Recent Activity", count: activities.length },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <aside className="shrink-0 lg:w-64">
        <Sidebar className="hidden lg:flex" />
      </aside>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 min-w-0">
        <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 pb-10">
          
          {/* Header Profile Info */}
          <div className="relative bg-white dark:bg-gray-800 rounded-4xl border border-gray-100 dark:border-gray-800 shadow-xs overflow-hidden">
            {profile.coverImage ? (
                <div className="h-32 sm:h-48 w-full">
                   <img src={profile.coverImage} className="w-full h-full object-cover" alt="Cover" />
                </div>
            ) : (
                <div className="h-32 sm:h-48 w-full bg-linear-to-r from-blue-600 to-indigo-600 opacity-90" />
            )}
            <div className="px-6 pb-8 sm:px-10 sm:pb-10 pt-0 flex flex-col sm:flex-row items-center sm:items-end text-center sm:text-left gap-6 sm:gap-8 -mt-16 sm:-mt-20 relative z-10">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-xl shrink-0 border-4 border-white dark:border-gray-800 relative z-20">
                {avatarSrc ? (
                  <img src={avatarSrc} alt={profile.displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-indigo-500 to-purple-600 text-white text-5xl font-black uppercase">
                    {profile.displayName?.charAt(0) ?? "U"}
                  </div>
                )}
              </div>
              <div className="flex-1 mb-2">
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                  {profile.displayName || profile.username || "Anonymous"}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 font-medium mt-1.5 flex items-center justify-center sm:justify-start gap-2">
                  <FiClock className="w-4 h-4 opacity-70" /> 
                  Joined {profile.creationDate ? format(new Date(profile.creationDate + "Z"), "MMMM yyyy") : "recently"}
                </p>
                {profile.bio && (
                  <p className="text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl mt-4">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Left Column: Stats & Badges */}
            <div className="xl:col-span-1 space-y-6 sm:space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 sm:p-7 shadow-sm">
                <h2 className="text-[14px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <FiTrendingUp className="text-blue-500 w-5 h-5" /> Key Stats
                </h2>
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <FiCode className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="block text-2xl font-black text-gray-900 dark:text-white leading-none">{xpEarned}</span>
                        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1 block">XP Earned</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                      <FiHelpCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="block text-2xl font-black text-gray-900 dark:text-white leading-none">{questions.length}</span>
                        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1 block">Questions Asked</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <FiMessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="block text-2xl font-black text-gray-900 dark:text-white leading-none">{comments.length}</span>
                        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1 block">Answers Given</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 sm:p-7 shadow-sm">
                <h2 className="text-[14px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <FiAwardIcon className="text-amber-500 w-5 h-5" /> Top Badges
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  <BadgeCard count={badges.gold} label="Gold" color="text-yellow-500" />
                  <BadgeCard count={badges.silver} label="Silver" color="text-gray-400 dark:text-gray-300" />
                  <BadgeCard count={badges.bronze} label="Bronze" color="text-amber-600" />
                </div>
              </div>
            </div>

            {/* Right Column: Tabbed Content */}
            <div className="xl:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm flex flex-col h-full min-h-[600px]">
                {/* Custom Tab Bar */}
                <div className="flex border-b border-gray-100 dark:border-gray-800 overflow-x-auto hide-scrollbar bg-gray-50/30 dark:bg-gray-900/20">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 min-w-[130px] px-4 py-5 text-[15px] font-bold transition-all whitespace-nowrap relative ${
                        activeTab === tab.id
                          ? "text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                      }`}
                    >
                      {tab.label} <span className="ml-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700/50 text-[12px]">{tab.count}</span>
                      {activeTab === tab.id && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 dark:bg-blue-400" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex-1 bg-white dark:bg-gray-800">
                  {activeTab === "questions" && (
                    <div>
                      {questions.length === 0 ? (
                        <div className="py-24 text-center px-4">
                          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/10 text-blue-500 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-5 rotate-3">
                            <FiHelpCircle className="w-8 h-8" />
                          </div>
                          <p className="text-[18px] font-bold text-gray-900 dark:text-white mb-2">No questions yet</p>
                          <p className="text-[15px] text-gray-500 dark:text-gray-400">This user hasn't asked anything to the community.</p>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          {questions.map((q) => (
                            <QuestionRow key={q.id} q={q} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "answers" && (
                     <div>
                      {comments.length === 0 ? (
                        <div className="py-24 text-center px-4">
                          <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/10 text-purple-500 dark:text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-5 -rotate-3">
                            <FiMessageSquare className="w-8 h-8" />
                          </div>
                          <p className="text-[18px] font-bold text-gray-900 dark:text-white mb-2">No answers yet</p>
                          <p className="text-[15px] text-gray-500 dark:text-gray-400">This user hasn't provided any answers.</p>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          {comments.map((c) => (
                            <Link
                              key={c.id}
                              to={`/question/${c.postId}`}
                              className="group block p-5 sm:p-6 hover:bg-gray-50/80 dark:hover:bg-gray-800/60 transition-colors border-b border-gray-100 dark:border-gray-800/60 last:border-0"
                            >
                              <div className="flex items-start gap-4">
                                <div className="mt-0.5 shrink-0 w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-xl text-gray-400 dark:text-gray-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                                  <FiMessageSquare className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[16px] text-gray-700 dark:text-gray-300 leading-relaxed group-hover:text-gray-900 dark:group-hover:text-white line-clamp-2 md:line-clamp-none whitespace-pre-line">
                                    "{c.text || c.body}"
                                  </p>
                                  <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-3 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                                    <FiClock className="w-3.5 h-3.5" />
                                    {c.creationDate ? formatDistanceToNow(new Date(c.creationDate + "Z"), { addSuffix: true }) : "Recently"}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "activity" && (
                    <div className="p-6 sm:p-8">
                      {activities.length === 0 ? (
                        <div className="py-16 text-center text-gray-500">No activity recorded.</div>
                      ) : (
                        <div className="space-y-6 border-l-2 border-gray-100 dark:border-gray-800 ml-5">
                          {activities.slice(0, 15).map((act, idx) => (
                            <div key={act.id + idx} className="relative pl-8 group">
                                <div className={`absolute -left-[1.3rem] top-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs ring-4 ring-white dark:ring-gray-800 transition-transform group-hover:scale-110 ${act.color}`}>
                                  <act.icon className="w-4 h-4" />
                                </div>
                              <div className="bg-gray-50 dark:bg-gray-900/30 p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-gray-800 group-hover:border-blue-100 dark:group-hover:border-blue-800 transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                    <h4 className="text-[15px] font-black text-gray-900 dark:text-white uppercase tracking-wide">{act.title}</h4>
                                    <p className="text-[12px] font-bold text-gray-400 dark:text-gray-500 flex items-center gap-1 shrink-0">
                                    <FiClock className="w-3 h-3" />
                                    {formatDistanceToNow(act.date, { addSuffix: true })}
                                    </p>
                                </div>
                                <Link to={act.link} className="inline-block text-[15px] font-medium text-gray-600 dark:text-gray-300 mt-1 hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2 md:line-clamp-none">
                                  "{act.description}"
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
