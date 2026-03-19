import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { formatDistanceToNow } from "date-fns";
import Sidebar from "../layout/Sidebar";
import SEO from "../components/SEO";
import { useGetPostsByUserQuery } from "../features/post/postsApi";
import { selectCurrentUser } from "../features/auth/authSlice";
import { LuSwords } from "react-icons/lu";
import {
  FiEye,
  FiMessageSquare,
  FiTag,
  FiZap,
  FiAward,
  FiSearch,
  FiAlertCircle,
  FiExternalLink,
  FiFilter,
  FiBarChart2,
  FiFileText,
  FiStar,
} from "react-icons/fi";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeStats(posts) {
  const totalScore = posts.reduce((s, p) => s + (p.score ?? 0), 0);
  const totalViews = posts.reduce((s, p) => s + (p.viewCount ?? 0), 0);
  const totalComments = posts.reduce(
    (s, p) => s + (p.comments?.length ?? 0),
    0,
  );
  const allTags = posts.flatMap(
    (p) => p.tagResponses?.map((t) => t.tagName) ?? [],
  );
  const uniqueTags = [...new Set(allTags)];
  const bestPost =
    [...posts].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0] ?? null;
  return { totalScore, totalViews, totalComments, uniqueTags, bestPost };
}

function getDifficultyMeta(score, views, comments) {
  const heat = score * 3 + comments + Math.floor(views / 10);
  if (heat >= 15)
    return {
      label: "Hot 🔥",
      color:
        "text-orange-500 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
    };
  if (heat >= 5)
    return {
      label: "Active ⚡",
      color:
        "text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    };
  return {
    label: "New 🌱",
    color:
      "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
  };
}

const TAG_PALETTE = [
  "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300",
  "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300",
  "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
  "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300",
];

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, gradient }) {
  return (
    <div
      className={`rounded-2xl p-5 flex items-center gap-4 shadow-sm border ${gradient}`}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/30 dark:bg-white/10 text-white text-xl">
        {icon}
      </div>
      <div>
        <p className="text-white/75 text-xs font-medium">{label}</p>
        <p className="text-white font-black text-2xl leading-tight">{value}</p>
        {sub && <p className="text-white/60 text-[11px] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Challenge Milestone Card ─────────────────────────────────────────────────

function MilestoneCard({ icon, title, desc, current, target, xp, color }) {
  const pct =
    target === 0 ? 0 : Math.min(100, Math.round((current / target) * 100));
  const done = current >= target;
  return (
    <div
      className={`relative bg-white dark:bg-gray-800 rounded-2xl border p-5 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md
      ${done ? "border-emerald-300 dark:border-emerald-700" : "border-slate-200 dark:border-gray-700"}`}
    >
      {done && (
        <span className="absolute top-4 right-4 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
          ✓ Complete
        </span>
      )}
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${color}`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-slate-900 dark:text-white text-[15px]">
            {title}
          </p>
          <p className="text-slate-400 dark:text-gray-500 text-[13px] mt-0.5">
            {desc}
          </p>
        </div>
      </div>
      <div className="w-full h-1.5 bg-slate-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${done ? "bg-linear-to-r from-emerald-400 to-emerald-500" : "bg-linear-to-r from-blue-500 to-violet-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-slate-500 dark:text-gray-400 font-medium">
          {current}/{target}
        </span>
        <span className="flex items-center gap-1 text-[13px] font-bold text-slate-700 dark:text-gray-200">
          <FiZap className="text-amber-500" />
          {xp} XP
        </span>
      </div>
    </div>
  );
}

// ─── Post Row ─────────────────────────────────────────────────────────────────

function PostRow({ post, index }) {
  const diff = getDifficultyMeta(
    post.score ?? 0,
    post.viewCount ?? 0,
    post.comments?.length ?? 0,
  );
  const timeAgo = post.creationDate
    ? formatDistanceToNow(new Date(post.creationDate + "Z"), { addSuffix: true })
    : "";

  return (
    <div
      className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-5 py-4
      transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-gray-600 group"
    >
      <div className="flex items-start gap-4">
        {/* Index */}
        <span className="w-7 h-7 shrink-0 rounded-lg bg-slate-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-gray-400 mt-0.5">
          {index + 1}
        </span>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <Link
              to={`/question/${post.id}`}
              className="text-[15px] font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1 group-hover:underline underline-offset-2"
            >
              {post.title}
            </Link>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${diff.color}`}
            >
              {diff.label}
            </span>
          </div>

          <p className="text-slate-500 dark:text-gray-400 text-[13px] mt-1 line-clamp-2">
            {post.body}
          </p>

          {/* Tags */}
          {post.tagResponses?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {post.tagResponses.map((t, ti) => (
                <span
                  key={t.id}
                  className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${TAG_PALETTE[ti % TAG_PALETTE.length]}`}
                >
                  <FiTag className="w-2.5 h-2.5" />
                  {t.tagName}
                </span>
              ))}
            </div>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-4 mt-2.5 text-[12px] text-slate-400 dark:text-gray-500">
            <span className="flex items-center gap-1">
              <FiStar className="w-3 h-3 text-amber-400" />
              {post.score ?? 0} score
            </span>
            <span className="flex items-center gap-1">
              <FiEye className="w-3 h-3" />
              {post.viewCount ?? 0} views
            </span>
            <span className="flex items-center gap-1">
              <FiMessageSquare className="w-3 h-3" />
              {post.comments?.length ?? 0} comments
            </span>
            <span className="ml-auto">{timeAgo}</span>
          </div>
        </div>

        {/* Link icon */}
        <Link
          to={`/question/${post.id}`}
          className="shrink-0 p-1.5 text-slate-300 dark:text-gray-600 hover:text-blue-500 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
        >
          <FiExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-2xl bg-slate-200 dark:bg-gray-700"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-36 rounded-2xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700"
          />
        ))}
      </div>
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="h-24 rounded-xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700"
        />
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  "Newest",
  "Most Viewed",
  "Most Commented",
  "Highest Score",
];

export default function ChallengesPage() {
  const currentUser = useSelector(selectCurrentUser);
  const userId = currentUser?.id;

  const {
    data: posts = [],
    isLoading,
    isError,
    refetch,
  } = useGetPostsByUserQuery(userId, {
    skip: !userId,
  });

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Newest");
  const [tagFilter, setTagFilter] = useState("All");

  // ── Derived stats ──────────────────────────────────────────────────────
  const stats = computeStats(posts);

  // ── Build milestones from real data ───────────────────────────────────
  const milestones = [
    {
      icon: "📝",
      title: "First Question",
      desc: "Post your first question",
      current: Math.min(posts.length, 1),
      target: 1,
      xp: 50,
      color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    },
    {
      icon: "🔥",
      title: "Active Poster",
      desc: "Post 5 questions",
      current: Math.min(posts.length, 5),
      target: 5,
      xp: 150,
      color:
        "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
    },
    {
      icon: "👁",
      title: "Attention Getter",
      desc: "Get 20 total views",
      current: Math.min(stats.totalViews, 20),
      target: 20,
      xp: 100,
      color: "bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400",
    },
    {
      icon: "💬",
      title: "Discussion Starter",
      desc: "Receive 5 comments",
      current: Math.min(stats.totalComments, 5),
      target: 5,
      xp: 120,
      color:
        "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
    },
    {
      icon: "🏷",
      title: "Tag Explorer",
      desc: "Use 3 different tags",
      current: Math.min(stats.uniqueTags.length, 3),
      target: 3,
      xp: 80,
      color:
        "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    },
    {
      icon: "⭐",
      title: "Score Seeker",
      desc: "Earn a score on any post",
      current: posts.some((p) => (p.score ?? 0) > 0) ? 1 : 0,
      target: 1,
      xp: 200,
      color:
        "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    },
  ];

  // ── All unique tags for filter pill ───────────────────────────────────
  const allTags = ["All", ...stats.uniqueTags];

  // ── Filter + Sort posts ───────────────────────────────────────────────
  let filtered = posts.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.body.toLowerCase().includes(q) ||
      p.tagResponses?.some((t) => t.tagName.toLowerCase().includes(q));
    const matchTag =
      tagFilter === "All" ||
      p.tagResponses?.some((t) => t.tagName === tagFilter);
    return matchSearch && matchTag;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sort === "Newest")
      return new Date(b.creationDate + "Z") - new Date(a.creationDate + "Z");
    if (sort === "Most Viewed") return (b.viewCount ?? 0) - (a.viewCount ?? 0);
    if (sort === "Most Commented")
      return (b.comments?.length ?? 0) - (a.comments?.length ?? 0);
    if (sort === "Highest Score") return (b.score ?? 0) - (a.score ?? 0);
    return 0;
  });

  const completedMilestones = milestones.filter(
    (m) => m.current >= m.target,
  ).length;

  // ── Not logged in ─────────────────────────────────────────────────────
  if (!userId) {
    return (
      <div className="flex min-h-screen bg-slate-100 dark:bg-gray-900">
        <SEO title="Dashboard" description="Login to track your challenges and activity stats rewards on MindStack." />
        <aside className="shrink-0">
          <Sidebar className="hidden lg:flex" />
        </aside>
        <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
              Sign in Required
            </h2>
            <p className="text-slate-500 dark:text-gray-400 mb-6">
              Log in to see your personal challenges and activity.
            </p>
            <Link
              to="/login"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
            >
              Log In
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-gray-900 transition-colors duration-300">
      <SEO title="Dashboard" description="Track your scores, milestones, and daily activity rewards on MindStack." />
      <aside className="shrink-0">
        <Sidebar className="hidden lg:flex" />
      </aside>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 overflow-y-auto min-w-0">
        {isLoading && <Skeleton />}

        {isError && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <FiAlertCircle className="w-12 h-12 text-red-400 mb-3" />
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Failed to load challenges
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              Could not connect to the server. Please try again.
            </p>
            <button
              onClick={() => refetch()}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {/* ── Page Header ────────────────────────────────────── */}
            <div className="mb-6">
              <h1 className="text-[26px] font-black text-slate-900 dark:text-white flex items-center gap-3">
                <LuSwords className="text-indigo-500" /> Dashboard & Challenges
              </h1>
              <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                Track your progress, stats, and climb through the milestones!
              </p>
            </div>

            {/* ── Stats Overview ──────────────────────────────────── */}
            <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<FiStar />}
                label="Total Score"
                value={stats.totalScore}
                gradient="bg-linear-to-br from-amber-400 to-orange-500 border-transparent shadow-orange-500/20"
              />
              <StatCard
                icon={<FiEye />}
                label="Total Views"
                value={stats.totalViews}
                gradient="bg-linear-to-br from-blue-400 to-blue-600 border-transparent shadow-blue-500/20"
              />
              <StatCard
                icon={<FiMessageSquare />}
                label="Comments Received"
                value={stats.totalComments}
                gradient="bg-linear-to-br from-violet-400 to-purple-600 border-transparent shadow-purple-500/20"
              />
              <StatCard
                icon={<FiTag />}
                label="Unique Tags Used"
                value={stats.uniqueTags.length}
                gradient="bg-linear-to-br from-emerald-400 to-teal-500 border-transparent shadow-emerald-500/20"
              />
            </div>
            {/* ── Best Post Banner ──────────────────────────────── */}
            {stats.bestPost && (
              <div className="mb-6 bg-linear-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <span className="text-2xl shrink-0">🏆</span>
                <div className="flex-1 min-w-0 w-full sm:w-auto">
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    Your Best Post
                  </p>
                  <Link
                    to={`/question/${stats.bestPost.id}`}
                    className="text-[15px] font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate block"
                  >
                    {stats.bestPost.title}
                  </Link>
                </div>
                <div className="flex items-center gap-4 shrink-0 text-sm font-semibold">
                  <span className="text-amber-600 dark:text-amber-400">
                    ⭐ {stats.bestPost.score ?? 0} score
                  </span>
                  <span className="text-slate-500 dark:text-gray-400">
                    👁 {stats.bestPost.viewCount ?? 0} views
                  </span>
                </div>
              </div>
            )}

            {/* ── Milestones ────────────────────────────────────── */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[17px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FiAward className="text-amber-500" /> Milestones
                </h2>
                <span className="text-sm text-slate-500 dark:text-gray-400 font-medium">
                  {completedMilestones} of {milestones.length} complete
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {milestones.map((m) => (
                  <MilestoneCard key={m.title} {...m} />
                ))}
              </div>
            </div>

            {/* ── Posts / Activity ──────────────────────────────── */}
            <div className="mb-7">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h2 className="text-[17px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FiFileText className="text-indigo-500" /> Your Posts
                </h2>

                {/* Search & Filters */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative shrink-0 flex-1 sm:flex-none sm:w-64">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search posts..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white"
                    />
                  </div>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="shrink-0 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 py-2 px-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white"
                  >
                    {SORT_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tag Filters */}
              {allTags.length > 1 && (
                <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-2 scrollbar-hide">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setTagFilter(tag)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${tagFilter === tag
                          ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                          : "bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-300 border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700"
                        }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}

              {/* Post List */}
              {filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filtered.map((p, i) => (
                    <PostRow key={p.id} post={p} index={i} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-slate-300 dark:border-gray-700 flex flex-col items-center">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="text-slate-500 dark:text-gray-400 font-medium text-[15px]">No posts match your filters</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
