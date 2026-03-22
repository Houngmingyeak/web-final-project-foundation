import { GoTrophy } from "react-icons/go";
import Sidebar from "../layout/Sidebar";
import SEO from "../components/SEO";
import { LuMedal, LuCrown } from "react-icons/lu";
import { FiUser } from "react-icons/fi";
import { useGetPostsSortedByScoreQuery } from "../features/post/postsApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../features/auth/authSlice";
import { useGetProfileQuery } from "../features/profile/profileApi";
import { useAuthImage } from "../hooks/useAuthImage";

// ── Derive user rankings from posts ─────────────────────────────────────
function buildRankings(posts) {
  const map = {};
  posts.forEach((post) => {
    const id = post.ownerId;
    if (!map[id]) {
      map[id] = {
        id,
        name: post.ownerDisplayName ?? "Unknown",
        initials: (post.ownerDisplayName ?? "??")
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
        totalScore: 0,
        totalViews: 0,
        posts: 0,
        comments: 0,
      };
    }
    map[id].totalScore += post.score ?? 0;
    map[id].totalViews += post.viewCount ?? 0;
    map[id].posts += 1;
    map[id].comments += post.comments?.length ?? 0;
  });

  return Object.values(map)
    .sort((a, b) => b.totalScore - a.totalScore || b.totalViews - a.totalViews)
    .map((u, i) => ({ ...u, rank: i + 1 }));
}

// ── Avatar ───────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "from-blue-400 to-indigo-500",
  "from-violet-400 to-purple-500",
  "from-emerald-400 to-teal-500",
  "from-orange-400 to-amber-500",
  "from-rose-400 to-pink-500",
  "from-sky-400 to-cyan-500",
];

const Avatar = ({ initials, index = 0, size = "md", isMe = false, avatarSrc = null }) => {
  const sizeClass =
    size === "lg"
      ? "w-14 h-14 text-base"
      : size === "sm"
        ? "w-9 h-9 text-xs"
        : "w-12 h-12 text-sm";
  const color = isMe
    ? "from-blue-500 to-violet-600"
    : AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <div
      className={`${sizeClass} rounded-full overflow-hidden bg-linear-to-br ${color} flex items-center justify-center font-bold text-white shrink-0 ${isMe ? "ring-2 ring-blue-400 ring-offset-2 dark:ring-offset-gray-800" : ""}`}
    >
      {isMe && avatarSrc ? (
        <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
};

// ── Score Bar ────────────────────────────────────────────────────────────
const ScoreBar = ({ score, max, isMe = false }) => {
  const pct = max > 0 ? Math.max(0, Math.min(100, (score / max) * 100)) : 0;
  return (
    <div className="flex-1 h-1.5 bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${isMe
            ? "bg-linear-to-r from-blue-500 to-violet-500"
            : "bg-linear-to-r from-slate-400 to-slate-500 dark:from-gray-500 dark:to-gray-400"
          }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

// ── My Score Banner ──────────────────────────────────────────────────────
function MyScoreBanner({ user, maxScore, avatarSrc }) {
  return (
    <div className="mb-6 bg-linear-to-r from-blue-600 to-violet-600 rounded-2xl p-5  dark:shadow-blue-900/40 text-white">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-lg ring-2 ring-white/40">
            {avatarSrc ? (
              <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              user.initials
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <FiUser className="w-3.5 h-3.5 opacity-70" />
              <span className="text-white/80 text-xs font-medium">
                Your Ranking
              </span>
            </div>
            <p className="font-bold text-lg">{user.name}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-4 sm:mt-0 w-full sm:w-auto">
          <div className="text-center">
            <p className="text-white/70 text-[10px] sm:text-xs font-medium mb-0.5">Rank</p>
            <p className="text-xl sm:text-2xl font-black">#{user.rank}</p>
          </div>
          <div className="w-px h-8 sm:h-10 bg-white/20" />
          <div className="text-center">
            <p className="text-white/70 text-[10px] sm:text-xs font-medium mb-0.5">
              Score
            </p>
            <p className="text-xl sm:text-2xl font-black">
              {user.totalScore.toLocaleString()}
            </p>
          </div>
          <div className="w-px h-8 sm:h-10 bg-white/20" />
          <div className="text-center">
            <p className="text-white/70 text-[10px] sm:text-xs font-medium mb-0.5">Posts</p>
            <p className="text-xl sm:text-2xl font-black">{user.posts}</p>
          </div>
          <div className="w-px h-8 sm:h-10 bg-white/20 hidden sm:block" />
          <div className="text-center hidden sm:block">
            <p className="text-white/70 text-[10px] sm:text-xs font-medium mb-0.5">Views</p>
            <p className="text-xl sm:text-2xl font-black">
              {user.totalViews.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Score bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-white/70 mb-1.5">
          <span>Score progress vs. #1</span>
          <span>
            {maxScore > 0 ? Math.round((user.totalScore / maxScore) * 100) : 0}%
          </span>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-700"
            style={{
              width: `${maxScore > 0 ? Math.min(100, (user.totalScore / maxScore) * 100) : 0}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="flex flex-col gap-4 animate-pulse">
    <div className="h-32 bg-linear-to-r from-blue-200 to-violet-200 dark:from-blue-900/40 dark:to-violet-900/40 rounded-2xl mb-2" />
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 flex flex-col items-center gap-3 border border-slate-200 dark:border-gray-700"
        >
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-gray-700" />
          <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-gray-700" />
          <div className="h-4 w-24 rounded bg-slate-200 dark:bg-gray-700" />
          <div className="h-3 w-16 rounded bg-slate-200 dark:bg-gray-700" />
        </div>
      ))}
    </div>
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className="bg-white dark:bg-gray-800 rounded-xl px-5 py-3.5 flex items-center gap-3.5 border border-slate-200 dark:border-gray-700"
      >
        <div className="w-6 h-4 rounded bg-slate-200 dark:bg-gray-700" />
        <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-gray-700" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded bg-slate-200 dark:bg-gray-700" />
          <div className="h-2.5 w-full rounded bg-slate-200 dark:bg-gray-700" />
        </div>
        <div className="h-5 w-12 rounded bg-slate-200 dark:bg-gray-700" />
      </div>
    ))}
  </div>
);

// ── Main ─────────────────────────────────────────────────────────────────
export default function Leaderboard() {
  const { data: posts, isLoading, isError } = useGetPostsSortedByScoreQuery();
  const currentUser = useSelector(selectCurrentUser);

  const { data: profile } = useGetProfileQuery(undefined, { skip: !currentUser });
  const myAvatarSrc = useAuthImage(profile?.profileImage ?? null);

  const users = posts ? buildRankings(posts) : [];
  const top3 = users.length >= 3 ? [users[1], users[0], users[2]] : users;
  const rankOrder = [2, 1, 3];
  const rest = users.slice(3);
  const maxScore = users[0]?.totalScore ?? 1;

  // Find the logged-in user in the leaderboard
  const meInBoard = currentUser
    ? users.find(
      (u) =>
        u.id === currentUser.id ||
        u.name?.toLowerCase() === currentUser.displayName?.toLowerCase(),
    )
    : null;

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-gray-900 font-sans transition-colors duration-300">
      <SEO title="Leaderboard" description="See who is leading the high contributors rating on MindStack based on responses, scores, and XP earned." />
      <aside>
        <Sidebar className="hidden lg:flex" />
      </aside>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-[26px] text-black dark:text-white">
              <GoTrophy />
            </span>
            <h1 className="text-[24px] font-bold text-slate-900 dark:text-white">
              Leaderboard
            </h1>
            {!isLoading && !isError && (
              <span className="text-sm text-slate-400 dark:text-gray-500 font-medium">
                {users.length} contributors
              </span>
            )}
          </div>
        </div>

        {/* Loading / Error */}
        {isLoading && <Skeleton />}

        {isError && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Failed to load leaderboard
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Could not connect to the server. Please try again later.
            </p>
          </div>
        )}

        {!isLoading && !isError && users.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">🏆</div>
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              No data yet
            </p>
          </div>
        )}

        {!isLoading && !isError && users.length > 0 && (
          <>
            {/* ── "You" Banner ─────────────────────────────────── */}
            {meInBoard && (
              <MyScoreBanner user={meInBoard} maxScore={maxScore} avatarSrc={myAvatarSrc} />
            )}

            {/* ── Top 3 Podium ─────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
              {top3.map((user, i) => {
                const rank = rankOrder[i] ?? i + 1;
                const isMe = meInBoard?.id === user.id;
                return (
                  <div
                    key={user.id}
                    className={`rounded-2xl px-5 py-6 flex flex-col items-center border 
                      transition-all duration-300 hover:-translate-y-2 
                      ${isMe
                        ? "bg-linear-to-br from-blue-50 to-violet-50 dark:from-blue-900/30 dark:to-violet-900/30 border-blue-300 dark:border-blue-600 hover:shadow-blue-200 dark:hover:shadow-blue-900/40"
                        : "bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700 "
                      }`}
                  >
                    {/* Medal / Crown */}
                    <div className="mb-3 relative">
                      {rank === 1 ? (
                        <LuCrown className="text-[28px] text-yellow-500" />
                      ) : (
                        <LuMedal
                          className="text-[22px]"
                          color={rank === 2 ? "#94a3b8" : "#f97316"}
                        />
                      )}
                      {isMe && (
                        <span className="absolute -top-1 -right-5 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </div>

                    <Avatar
                      initials={user.initials}
                      index={user.rank - 1}
                      size="lg"
                      isMe={isMe}
                      avatarSrc={isMe ? myAvatarSrc : null}
                    />

                    <p className="mt-3 font-semibold text-slate-900 dark:text-white text-[16px] text-center truncate max-w-full">
                      {user.name}
                    </p>

                    <div className="flex items-center gap-1.5 mt-1 mb-3">
                      <span className="text-amber-500 font-bold text-[15px]">
                        {user.totalScore.toLocaleString()}
                      </span>
                      <span className="text-[12px] text-slate-400 dark:text-gray-500">
                        score
                      </span>
                    </div>

                    <div className="w-full flex items-center gap-2">
                      <ScoreBar
                        score={user.totalScore}
                        max={maxScore}
                        isMe={isMe}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Ranked List (4th+) ────────────────────────────── */}
            {rest.length > 0 && (
              <div className="flex flex-col gap-2.5">
                {rest.map((user) => {
                  const isMe = meInBoard?.id === user.id;
                  return (
                    <div
                      key={user.id}
                      id={isMe ? "my-leaderboard-row" : undefined}
                      className={`rounded-xl px-5 py-3.5 flex items-center gap-3.5 shadow-sm
                        transition-all duration-300 hover:-translate-y-1 hover:shadow-lg
                        ${isMe
                          ? "bg-linear-to-r from-blue-50 to-violet-50 dark:from-blue-900/20 dark:to-violet-900/20 border-2 border-blue-400 dark:border-blue-500 hover:border-blue-500 dark:hover:border-blue-400"
                          : "bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700"
                        }`}
                    >
                      {/* Rank badge */}
                      <span
                        className={`text-[15px] font-bold w-6 text-center shrink-0 ${isMe ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-gray-500"}`}
                      >
                        #{user.rank}
                      </span>

                      <Avatar
                        initials={user.initials}
                        index={user.rank - 1}
                        size="sm"
                        isMe={isMe}
                        avatarSrc={isMe ? myAvatarSrc : null}
                      />

                      {/* Name + bar */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <p
                            className={`font-semibold text-[15px] truncate ${isMe ? "text-blue-700 dark:text-blue-300" : "text-slate-900 dark:text-white"}`}
                          >
                            {user.name}
                          </p>
                          {isMe && (
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 rounded-full shrink-0">
                              You
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <ScoreBar
                            score={user.totalScore}
                            max={maxScore}
                            isMe={isMe}
                          />
                        </div>
                      </div>

                      {/* Right side */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                          className={`font-bold text-[15px] ${isMe ? "text-blue-600 dark:text-blue-400" : "text-amber-500"}`}
                        >
                          {user.totalScore.toLocaleString()}
                          <span className="text-[11px] text-slate-400 dark:text-gray-500 font-normal ml-1">
                            score
                          </span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
