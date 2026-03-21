import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { formatDistanceToNow } from "date-fns";
import {
  FiArrowLeft,
  FiBookmark,
  FiEdit2,
  FiMessageSquare,
  FiEye,
  FiAward,
} from "react-icons/fi";
import { FaBookmark } from "react-icons/fa";
import { toast } from "react-toastify";
import {
  useGetPostByIdQuery,
  useCreateCommentMutation,
} from "../features/post/postsApi";
import {
  useGetBookmarksQuery,
  useAddBookmarkMutation,
  useRemoveBookmarkMutation,
} from "../features/bookmark/bookmarkApi";
import { renderMarkdown } from "../utils/markdownRenderer";
import {
  selectCurrentUser,
  selectIsAuthenticated,
} from "../features/auth/authSlice";
import Sidebar from "../layout/Sidebar";

// ── Loading skeleton ─────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 bg-gray-100 dark:bg-gray-800 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}


// ── Main Component ────────────────────────────────────────────────────────────
export default function QuestionDetailPage() {
  const { id } = useParams();
  const currentUser = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // ── Queries ──────────────────────────────────────────────────────────────
  const {
    data: currentPost,
    isLoading: postLoading,
    error: postError,
  } = useGetPostByIdQuery(id);
  const { data: bookmarks = [] } = useGetBookmarksQuery(undefined, {
    skip: !isAuthenticated,
  });
  // ── Mutations ─────────────────────────────────────────────────────────────
  const [addBookmark, { isLoading: adding }] = useAddBookmarkMutation();
  const [removeBookmark, { isLoading: removing }] = useRemoveBookmarkMutation();
  const [createAnswer, { isLoading: submittingAnswer }] =
    useCreateCommentMutation();

  // ── Local state ───────────────────────────────────────────────────────────
  const postIdNum = parseInt(id, 10);
  const isSaved = bookmarks.some((post) => post.id === postIdNum);

  const [answerContent, setAnswerContent] = useState("");
  const [answerCode, setAnswerCode] = useState("");
  const [localError, setLocalError] = useState("");

  const answers = currentPost?.comments || [];

  // ── Bookmark ──────────────────────────────────────────────────────────────
  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to save questions");
      return;
    }
    try {
      if (isSaved) {
        await removeBookmark(postIdNum).unwrap();
        toast.success("Removed from saves");
      } else {
        await addBookmark(postIdNum).unwrap();
        toast.success("Saved to bookmarks!");
      }
    } catch {
      toast.error("Failed to update bookmark");
    }
  };



  // ── Post answer ───────────────────────────────────────────────────────────
  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Please log in to post an answer");
      return;
    }
    if (!answerContent.trim()) {
      setLocalError("Answer cannot be empty");
      return;
    }
    setLocalError("");
    try {
      let textToPost = answerContent.trim();
      if (answerCode.trim())
        textToPost += `\n\n\`\`\`\n${answerCode.trim()}\n\`\`\``;
      if (textToPost.length < 5) {
        setLocalError("Answer must be at least 5 characters.");
        return;
      }
      if (textToPost.length > 500) {
        setLocalError("Answer cannot exceed 500 characters.");
        return;
      }
      await createAnswer({ postId: postIdNum, text: textToPost }).unwrap();
      toast.success("Answer posted!");
      setAnswerContent("");
      setAnswerCode("");
    } catch (err) {
      setLocalError(
        err?.data?.validationErrors?.text ??
        err?.data?.message ??
        "Failed to post answer",
      );
    }
  };

  // ── Render guards ─────────────────────────────────────────────────────────
  if (postLoading) return <Skeleton />;
  if (postError || !currentPost)
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-950">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">Question not found</p>
          <Link
            to="/questions"
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl"
          >
            Back to Questions
          </Link>
        </div>
      </div>
    );



  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Hide Sidebar on mobile/tablet strictly */}
      <div className="hidden lg:block shrink-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 w-full min-w-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back */}
          <Link
            to="/questions"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-500 hover:text-blue-600 mb-6 group"
          >
            <FiArrowLeft className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Questions
          </Link>

          {/* ── QUESTION CARD ── */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm mb-6 overflow-hidden">
            {/* Accent bar — was an empty <div /> before */}
            <div className="h-1 w-full bg-blue-500" />

            <div className="p-6 sm:p-8">
              {/* Title row */}
              <div className="flex items-start justify-between gap-3 mb-5">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight flex-1">
                  {currentPost.title}
                </h1>

                {/* Bookmark */}
                <button
                  onClick={handleToggleBookmark}
                  disabled={adding || removing}
                  title={isSaved ? "Remove from saves" : "Save question"}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold shrink-0 border transition-all
                  ${isSaved
                      ? "bg-amber-50 dark:bg-amber-900/30 text-amber-500 border-amber-300 dark:border-amber-700"
                      : "bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700 hover:text-amber-500 hover:border-amber-300"
                    } disabled:opacity-50`}
                >
                  {isSaved ? (
                    <FaBookmark className="w-4 h-4" />
                  ) : (
                    <FiBookmark className="w-4 h-4" />
                  )}
                  {isSaved ? "Saved" : "Save"}
                </button>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-5">
                <span className="flex items-center gap-1">
                  <FiEye className="w-3.5 h-3.5" /> {currentPost.viewCount}{" "}
                  views
                </span>
                <span className="flex items-center gap-1">
                  <FiMessageSquare className="w-3.5 h-3.5" /> {answers.length}{" "}
                  answers
                </span>
                <span>
                  Asked by{" "}
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {currentPost.ownerDisplayName}
                  </span>{" "}
                  •{" "}
                  {formatDistanceToNow(new Date(currentPost.creationDate + "Z"), {
                    addSuffix: true,
                  })}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {currentPost.tagResponses?.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-semibold border border-blue-100 dark:border-blue-800"
                  >
                    {tag.tagName}
                  </span>
                ))}
              </div>

              {/* Body */}
              <div
                className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed mb-6 prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(currentPost.body) }}
              />


            </div>
          </div>

          {/* ── ANSWERS ── */}
          <div className="mb-8">
            <h2 className="text-xl font-black mb-5 flex items-center gap-2">
              <FiAward className="text-blue-500" />
              {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
            </h2>

            <div className="space-y-4">
              {answers.map((answer) => (
                  <div
                    key={answer.id}
                    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
                  >
                    {/* Matching accent bar on answer cards */}
                    <div className="h-0.5 w-full bg-gray-100 dark:bg-gray-800" />

                    <div className="p-5 sm:p-6">
                      <div
                        className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed mb-4 prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(answer.text) }}
                      />
                      <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-gray-200 dark:border-gray-800">
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          Answered by{" "}
                          <span className="font-semibold text-gray-600 dark:text-gray-300">
                            {answer.userDisplayName}
                          </span>{" "}
                          •{" "}
                          {formatDistanceToNow(
                            new Date(answer.creationDate + "Z"),
                            { addSuffix: true },
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
              ))}

              {answers.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                  <FiMessageSquare className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-400 dark:text-gray-500 font-medium">
                    No answers yet
                  </p>
                  <p className="text-gray-300 dark:text-gray-600 text-sm mt-1">
                    Be the first to answer this question!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── POST ANSWER ── */}
          {currentUser ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden mb-8">
              <div className="h-1 w-full bg-blue-500" />
              <div className="p-6 sm:p-8">
                <h2 className="text-xl font-black mb-5 flex items-center gap-2">
                  <FiEdit2 className="text-blue-500" /> Your Answer
                </h2>

                {localError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-sm">
                    {localError}
                  </div>
                )}

                <form onSubmit={handlePostAnswer} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                      Solution
                    </label>
                    <textarea
                      value={answerContent}
                      onChange={(e) => setAnswerContent(e.target.value)}
                      placeholder="Share your solution..."
                      disabled={submittingAnswer}
                      minLength={5}
                      maxLength={500}
                      className="w-full min-h-32 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm transition-all resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                    />
                    <p className="text-[11px] text-gray-400 mt-1 text-right">
                      {answerContent.length}/500
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                      Code Snippet{" "}
                      <span className="font-normal text-gray-400">
                        (optional)
                      </span>
                    </label>
                    <textarea
                      value={answerCode}
                      onChange={(e) => setAnswerCode(e.target.value)}
                      placeholder="Paste your code here..."
                      disabled={submittingAnswer}
                      className="w-full min-h-24 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-mono text-sm transition-all resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingAnswer || !answerContent.trim()}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-bold rounded-xl transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:translate-y-0 shadow-sm"
                  >
                    {submittingAnswer ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Posting…
                      </>
                    ) : (
                      <>
                        <FiEdit2 className="w-4 h-4" /> Post Answer
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-8 text-center mb-8">
              <FiMessageSquare className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 mb-4 font-medium">
                Sign in to post an answer
              </p>
              <Link
                to="/login"
                className="inline-block px-6 py-3 bg-blue-500 text-white font-bold rounded-xl transition-all hover:-translate-y-0.5 shadow-sm"
              >
                Log In to Answer
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
