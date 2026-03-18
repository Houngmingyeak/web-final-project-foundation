import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { formatDistanceToNow } from "date-fns";
import Sidebar from "../layout/Sidebar";
import {
  useGetBookmarksQuery,
  useRemoveBookmarkMutation,
} from "../features/bookmark/bookmarkApi";
import { selectCurrentUser } from "../features/auth/authSlice";
import { FaBookmark } from "react-icons/fa";
import {
  FiSearch,
  FiTrash2,
  FiEye,
  FiMessageSquare,
  FiTag,
  FiAlertCircle,
  FiExternalLink,
  FiStar,
  FiRefreshCw,
} from "react-icons/fi";
import { toast } from "react-toastify";

// ── Tag colour palette ─────────────────────────────────────────────────────
const TAG_PALETTE = [
  "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300",
  "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300",
  "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
  "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300",
];

// ── Skeleton ───────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-5"
        >
          <div className="h-5 w-3/4 rounded bg-slate-200 dark:bg-gray-700 mb-3" />
          <div className="h-4 w-full rounded bg-slate-100 dark:bg-gray-700/60 mb-3" />
          <div className="flex gap-2">
            <div className="h-5 w-14 rounded-full bg-blue-100 dark:bg-blue-900/30" />
            <div className="h-5 w-20 rounded-full bg-blue-100 dark:bg-blue-900/30" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Bookmark Card ──────────────────────────────────────────────────────────
// `post` is a full post object from bookMarkList
function BookmarkItem({ post, onRemove, removing }) {
  const timeAgo = post.creationDate
    ? formatDistanceToNow(new Date(post.creationDate + "Z"), { addSuffix: true })
    : "";

  return (
    <div
      className="relative bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-5
      transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-blue-200 dark:hover:border-blue-700 group"
    >
      {/* Remove button — appears on hover */}
      <button
        onClick={() => onRemove(post.id)}
        disabled={removing}
        className="absolute top-4 right-4 flex items-center gap-1 text-[12px] font-semibold
          text-slate-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400
          hover:bg-red-50 dark:hover:bg-red-900/20 px-2.5 py-1.5 rounded-lg
          transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
        title="Remove bookmark"
      >
        <FiTrash2 className="w-3.5 h-3.5" /> Remove
      </button>

      {/* Saved badge + time */}
      <div className="flex items-center gap-2 mb-3">
        <FaBookmark className="text-amber-400 w-3.5 h-3.5 shrink-0" />
        <span className="text-[11px] font-semibold text-amber-500 dark:text-amber-400 uppercase tracking-wide">
          Saved
        </span>
        {timeAgo && (
          <span className="text-[11px] text-slate-400 dark:text-gray-500 ml-auto pr-20">
            Asked {timeAgo}
          </span>
        )}
      </div>

      {/* Title */}
      <Link
        to={`/question/${post.id}`}
        className="block text-[16px] font-bold text-slate-900 dark:text-white
          hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2 pr-20 line-clamp-2"
      >
        {post.title}
      </Link>

      {/* Body excerpt */}
      {post.body && (
        <p className="text-[13px] text-slate-500 dark:text-gray-400 mb-3 line-clamp-2">
          {post.body}
        </p>
      )}

      {/* Tags */}
      {post.tagResponses?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tagResponses.map((t, ti) => (
            <span
              key={t.id}
              className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md
                ${TAG_PALETTE[ti % TAG_PALETTE.length]}`}
            >
              <FiTag className="w-2.5 h-2.5" />
              {t.tagName}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between gap-3 mt-3 pt-3
        border-t border-slate-100 dark:border-gray-700 flex-wrap"
      >
        {/* Author */}
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/40 flex items-center
            justify-center text-blue-600 dark:text-blue-400 text-[10px] font-bold shrink-0"
          >
            {post.ownerDisplayName?.slice(0, 2).toUpperCase() ?? "??"}
          </div>
          <span className="text-[13px] text-slate-600 dark:text-gray-300 font-medium">
            {post.ownerDisplayName ?? "Unknown"}
          </span>
        </div>

        {/* Stats + View link */}
        <div className="flex items-center gap-3 text-[12px] text-slate-400 dark:text-gray-500">
          <span className="flex items-center gap-1">
            <FiStar className="w-3 h-3 text-amber-400" />
            {post.score ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <FiEye className="w-3 h-3" />
            {post.viewCount ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <FiMessageSquare className="w-3 h-3" />
            {post.comments?.length ?? 0}
          </span>
          <Link
            to={`/question/${post.id}`}
            className="flex items-center gap-1 text-blue-500 hover:text-blue-600
              dark:text-blue-400 font-semibold hover:underline"
          >
            <FiExternalLink className="w-3 h-3" /> View
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function BookmarkCard() {
  const currentUser = useSelector(selectCurrentUser);
  const [search, setSearch] = useState("");
  const [removingId, setRemovingId] = useState(null);

  // bookmarks = array of full post objects (from bookMarkList)
  const {
    data: bookmarks = [],
    isLoading,
    isError,
    refetch,
  } = useGetBookmarksQuery(undefined, { skip: !currentUser });

  const [removeBookmark] = useRemoveBookmarkMutation();

  const handleRemove = async (postId) => {
    setRemovingId(postId);
    try {
      await removeBookmark(postId).unwrap();
      toast.success("Bookmark removed");
    } catch {
      toast.error("Failed to remove bookmark");
    } finally {
      setRemovingId(null);
    }
  };

  // Filter bookmarks by search query
  const filtered = bookmarks.filter((post) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      post.title?.toLowerCase().includes(q) ||
      post.body?.toLowerCase().includes(q) ||
      post.ownerDisplayName?.toLowerCase().includes(q) ||
      post.tagResponses?.some((t) => t.tagName.toLowerCase().includes(q))
    );
  });

  // ── Not logged in ──────────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <aside className="shrink-0">
          <Sidebar className="hidden lg:flex" />
        </aside>
        <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
              Sign in Required
            </h2>
            <p className="text-slate-500 dark:text-gray-400 mb-6">
              Log in to view your saved questions.
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors duration-300">
      <aside className="shrink-0">
        <Sidebar className="hidden lg:flex" />
      </aside>

      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0">
        {/* ── Profile Banner ──────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl bg-linear-to-br from-blue-500 to-violet-500
              flex items-center justify-center font-bold text-white text-lg shrink-0"
            >
              {currentUser.displayName?.slice(0, 2).toUpperCase() ?? "ME"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {currentUser.displayName ?? "My Saves"}
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1.5 text-amber-500 font-medium">
                  <FaBookmark className="w-3 h-3" />
                  {bookmarks.length} saved question
                  {bookmarks.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Toolbar ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
          <div>
            <h3 className="text-[18px] font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FaBookmark className="text-amber-400 w-4 h-4" /> All Saves
            </h3>
            <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-0.5">
              {filtered.length !== bookmarks.length
                ? `${filtered.length} of ${bookmarks.length} saved items`
                : `${bookmarks.length} saved item${bookmarks.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        {/* ── States ──────────────────────────────────────────── */}
        {isLoading && <Skeleton />}

        {!isLoading && isError && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FiAlertCircle className="w-10 h-10 text-red-400 mb-3" />
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Failed to load bookmarks
            </p>
            <button
              onClick={() => refetch()}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !isError && bookmarks.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-24 text-center
            bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700"
          >
            <div className="text-5xl mb-4">🔖</div>
            <p className="text-xl font-semibold text-slate-700 dark:text-gray-300 mb-2">
              No saved questions yet
            </p>
            <p className="text-slate-400 dark:text-gray-500 text-sm mb-6 max-w-sm">
              Hit the <strong className="text-amber-500">Save</strong> button on
              any question to find it here instantly.
            </p>
            <Link
              to="/questions"
              className="px-6 py-2.5 bg-linear-to-r from-blue-600 to-violet-600
                hover:from-blue-700 hover:to-violet-700 text-white text-sm font-bold rounded-xl
                transition-all shadow-md shadow-blue-200 dark:shadow-blue-900/30"
            >
              Browse Questions
            </Link>
          </div>
        )}

        {!isLoading &&
          !isError &&
          bookmarks.length > 0 &&
          filtered.length === 0 && (
            <div
              className="flex flex-col items-center justify-center py-16 text-center
            bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700"
            >
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-lg font-semibold text-slate-700 dark:text-gray-300 mb-1">
                No results found
              </p>
              <p className="text-slate-400 dark:text-gray-500 text-sm">
                Try a different search term.
              </p>
            </div>
          )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map((post) => (
              <BookmarkItem
                key={post.id}
                post={post}
                onRemove={handleRemove}
                removing={removingId === post.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}