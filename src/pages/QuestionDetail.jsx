import { useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { formatDistanceToNow } from "date-fns";
import {
  FiArrowLeft,
  FiBookmark,
  FiThumbsUp,
  FiThumbsDown,
  FiEdit2,
  FiTrash2,
  FiMessageSquare,
  FiEye,
  FiAward,
} from "react-icons/fi";
import { FaBookmark, FaThumbsUp, FaThumbsDown } from "react-icons/fa";
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
import {
  useGetVotesByUserQuery,
  useCreateVoteMutation,
  useUpdateVoteMutation,
  useDeleteVoteMutation,
  VOTE_UP,
  VOTE_DOWN,
} from "../features/vote/voteApi";
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

// ── Vote button component ─────────────────────────────────────────────────────
function VoteButton({ direction, count, state, onClick, disabled }) {
  const isUp = direction === "up";
  const isActive = state === (isUp ? "up" : "down");

  const Icon = isUp
    ? isActive
      ? FaThumbsUp
      : FiThumbsUp
    : isActive
      ? FaThumbsDown
      : FiThumbsDown;
  const activeClass = isUp
    ? "bg-emerald-500 text-white border-emerald-500"
    : "bg-red-500 text-white border-red-500";
  const hoverClass = isUp
    ? "hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400"
    : "hover:border-red-400 hover:text-red-500 dark:hover:text-red-400";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={isUp ? "Upvote" : "Downvote"}
      className={`flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-xl border transition-all duration-200 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed
        ${isActive
          ? activeClass
          : `bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 ${hoverClass}`
        }`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-[11px] leading-none">{count ?? 0}</span>
    </button>
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
  const { data: userVotesResponse } = useGetVotesByUserQuery(currentUser?.id, {
    skip: !isAuthenticated || !currentUser?.id,
  });

  // ── Mutations ─────────────────────────────────────────────────────────────
  const [addBookmark, { isLoading: adding }] = useAddBookmarkMutation();
  const [removeBookmark, { isLoading: removing }] = useRemoveBookmarkMutation();
  const [createAnswer, { isLoading: submittingAnswer }] =
    useCreateCommentMutation();
  const [createVote, { isLoading: votingCreate }] = useCreateVoteMutation();
  const [updateVote, { isLoading: votingUpdate }] = useUpdateVoteMutation();
  const [deleteVote, { isLoading: votingDelete }] = useDeleteVoteMutation();

  // ── Local state ───────────────────────────────────────────────────────────
  const postIdNum = parseInt(id, 10);
  const isSaved = bookmarks.some((post) => post.id === postIdNum);

  // voteMap: { [postId]: { voteId, direction: 'up'|'down'|null } }
  const [voteMap, setVoteMap] = useState({});

  // scores: { [postId]: number }  — local optimistic score adjustments
  const [scoreOverrides, setScoreOverrides] = useState({});

  const [answerContent, setAnswerContent] = useState("");
  const [answerCode, setAnswerCode] = useState("");
  const [localError, setLocalError] = useState("");

  const answers = currentPost?.comments || [];

  // Parse server votes
  const serverVotes = Array.isArray(userVotesResponse) ? userVotesResponse : [];

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getVoteState = (pid) => {
    // Priority: local optimistic map -> server fetched map
    if (voteMap[pid]) return voteMap[pid];

    const sVote = serverVotes.find((v) => v.postId === pid);
    if (sVote) {
      return { voteId: sVote.id, direction: sVote.voteType === "UpVote" || sVote.voteTypeId === VOTE_UP ? "up" : "down" };
    }
    return { voteId: null, direction: null };
  };

  const isVoting = votingCreate || votingUpdate || votingDelete;

  const scoreFor = (post) => {
    const override = scoreOverrides[post.id];
    return override ?? (post.score || 0);
  };

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
        toast.success("✅ Saved to bookmarks!");
      }
    } catch {
      toast.error("Failed to update bookmark");
    }
  };

  // ── VOTE HANDLER ──────────────────────────────────────────────────────────
  const handleVote = useCallback(
    async (targetPostId, direction) => {
      if (!isAuthenticated) {
        toast.error("Please log in to vote");
        return;
      }

      const voteTypeId = direction === "up" ? VOTE_UP : VOTE_DOWN;
      const { voteId, direction: currentDir } = getVoteState(targetPostId);
      const baseScore =
        scoreOverrides[targetPostId] ??
        answers.find((a) => a.id === targetPostId)?.score ??
        (currentPost?.id === targetPostId ? currentPost.score : 0) ??
        0;

      try {
        // Case 1: No existing vote → create new vote
        if (!voteId) {
          const result = await createVote({
            postId: targetPostId,
            voteTypeId,
          }).unwrap();
          setVoteMap((prev) => ({
            ...prev,
            [targetPostId]: { voteId: result.id, direction },
          }));
          setScoreOverrides((prev) => ({
            ...prev,
            [targetPostId]: baseScore + (direction === "up" ? 1 : -1),
          }));
          toast.success(direction === "up" ? "👍 Upvoted!" : "👎 Downvoted!");
        }
        // Case 2: Clicking the same direction → remove vote (undo)
        else if (currentDir === direction) {
          await deleteVote(voteId).unwrap();
          setVoteMap((prev) => ({
            ...prev,
            [targetPostId]: { voteId: null, direction: null },
          }));
          setScoreOverrides((prev) => ({
            ...prev,
            [targetPostId]: baseScore + (direction === "up" ? -1 : 1),
          }));
          toast.info("Vote removed");
        }
        // Case 3: Switching direction → update existing vote
        else {
          await updateVote({
            voteId,
            postId: targetPostId,
            voteTypeId,
          }).unwrap();
          setVoteMap((prev) => ({
            ...prev,
            [targetPostId]: { voteId, direction },
          }));
          const delta = direction === "up" ? 2 : -2; // flipping direction = ±2
          setScoreOverrides((prev) => ({
            ...prev,
            [targetPostId]: baseScore + delta,
          }));
          toast.success(
            direction === "up"
              ? "👍 Changed to Upvote"
              : "👎 Changed to Downvote",
          );
        }
      } catch (err) {
        toast.error(err?.data?.message || "Failed to register vote");
      }
    },
    [
      isAuthenticated,
      voteMap,
      scoreOverrides,
      currentPost,
      answers,
      createVote,
      updateVote,
      deleteVote,
    ],
  );

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
      toast.success("Answer posted! 🎉");
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

  const questionVote = getVoteState(currentPost.id);

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

              {/* Vote row */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide mr-1">
                  Vote this question:
                </span>
                <VoteButton
                  direction="up"
                  count={scoreFor(currentPost)}
                  state={questionVote.direction}
                  onClick={() => handleVote(currentPost.id, "up")}
                  disabled={isVoting}
                />
                <VoteButton
                  direction="down"
                  count={null}
                  state={questionVote.direction}
                  onClick={() => handleVote(currentPost.id, "down")}
                  disabled={isVoting}
                />
                {questionVote.voteId && (
                  <span className="text-[11px] text-gray-400 dark:text-gray-600 ml-1">
                    You{" "}
                    {questionVote.direction === "up" ? "upvoted" : "downvoted"}{" "}
                    •{" "}
                    <button
                      onClick={() =>
                        handleVote(currentPost.id, questionVote.direction)
                      }
                      className="underline hover:text-gray-600 dark:hover:text-gray-400"
                    >
                      undo
                    </button>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── ANSWERS ── */}
          <div className="mb-8">
            <h2 className="text-xl font-black mb-5 flex items-center gap-2">
              <FiAward className="text-blue-500" />
              {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
            </h2>

            <div className="space-y-4">
              {answers.map((answer) => {
                const answerVote = getVoteState(answer.id);
                return (
                  <div
                    key={answer.id}
                    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
                  >
                    {/* Matching accent bar on answer cards */}
                    <div className="h-0.5 w-full bg-gray-100 dark:bg-gray-800" />

                    <div className="p-5 sm:p-6 flex items-start gap-4">
                      {/* Vote column */}
                      <div className="flex flex-col items-center gap-2 shrink-0">
                        <VoteButton
                          direction="up"
                          count={scoreFor(answer)}
                          state={answerVote.direction}
                          onClick={() => handleVote(answer.id, "up")}
                          disabled={isVoting}
                        />
                        <VoteButton
                          direction="down"
                          count={null}
                          state={answerVote.direction}
                          onClick={() => handleVote(answer.id, "down")}
                          disabled={isVoting}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed mb-4 prose prose-sm dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(answer.text) }}
                        />
                        <div className="flex items-center justify-between gap-2 flex-wrap pt-3 border-t border-gray-200 dark:border-gray-800">
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
                          {answerVote.voteId && (
                            <span className="text-[10px] text-gray-400 dark:text-gray-600">
                              You{" "}
                              {answerVote.direction === "up"
                                ? "👍 upvoted"
                                : "👎 downvoted"}{" "}
                              •{" "}
                              <button
                                onClick={() =>
                                  handleVote(answer.id, answerVote.direction)
                                }
                                className="underline hover:text-gray-600"
                              >
                                undo
                              </button>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

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
