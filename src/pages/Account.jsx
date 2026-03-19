import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { logout } from "../features/auth/authSlice";
import {
  useGetProfileQuery,
  useUploadProfileImageMutation,
  useUpdateUserMutation,
  useUpdatePasswordMutation,
} from "../features/profile/profileApi";
import { useGetBookmarksQuery } from "../features/bookmark/bookmarkApi";
import { useAuthImage } from "../hooks/useAuthImage";
import { formatDistanceToNow, format } from "date-fns";
import {
  FiEdit2,
  FiCamera,
  FiMessageSquare,
  FiHelpCircle,
  FiBookmark,
  FiActivity,
  FiEye,
  FiStar,
  FiClock,
  FiX,
  FiUploadCloud,
  FiThumbsUp,
  FiThumbsDown,
  FiLogOut,
  FiAward,
  FiCalendar,
  FiUser,
  FiMail,
  FiShield,
  FiTrendingUp,
  FiExternalLink,
  FiTag,
  FiCheck,
  FiLock,
  FiEyeOff,
  FiKey,
  FiHome,
  FiGrid,
  FiAward as FiAwardIcon,
  FiUsers,
  FiBarChart2,
  FiTarget,
  FiZap,
  FiTerminal,
  FiCode
} from "react-icons/fi";
import AccountProfileDropdown from "../components/AccountProfileDropdown";

import Sidebar from "../layout/Sidebar";
import mindstack from "../assets/mindstack.png";

// ── Navigation Item ───────────────────────────────────────────────────────
function NavItem({ icon: Icon, label, to, active, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
        active
          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold"
          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

// ── Badge Card ────────────────────────────────────────────────────────────
function BadgeCard({ count, label, color, bgColor }) {
  return (
    <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
      <span className={`text-2xl font-black ${color}`}>{count}</span>
      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div>
          <p className="text-xl font-black text-gray-900 dark:text-white">
            {value ?? 0}
          </p>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Question Row ───────────────────────────────────────────────────────────
function QuestionRow({ q }) {
  return (
    <Link
      to={`/question/${q.id}`}
      className="group flex items-start gap-4 p-4 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/10 border border-transparent hover:border-blue-100 dark:hover:border-blue-800 transition-all"
    >
      <div className="shrink-0 flex flex-col items-center gap-1 pt-0.5">
        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
          <FiStar className="w-3 h-3" />
          {q.score ?? 0}
        </div>
        <div className="flex items-center gap-1 text-slate-400 text-xs">
          <FiEye className="w-3 h-3" />
          {q.viewCount ?? 0}
        </div>
        <div className="flex items-center gap-1 text-slate-400 text-xs">
          <FiMessageSquare className="w-3 h-3" />
          {q.comments?.length ?? 0}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-1.5">
          {q.title}
        </p>
        {q.tagResponses?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {q.tagResponses.slice(0, 3).map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md"
              >
                <FiTag className="w-2.5 h-2.5" />
                {t.tagName}
              </span>
            ))}
          </div>
        )}
        <p className="text-[11px] text-slate-400 flex items-center gap-1">
          <FiClock className="w-3 h-3" />
          {q.creationDate
            ? formatDistanceToNow(new Date(q.creationDate + "Z"), { addSuffix: true })
            : "Recently"}
        </p>
      </div>
      <FiExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-400 shrink-0 mt-1 transition-colors" />
    </Link>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <aside className="shrink-0">
        <Sidebar className="hidden lg:flex" />
      </aside>
      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 animate-pulse min-w-0">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 flex gap-6">
          <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1 space-y-3 pt-4">
            <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-1/4 bg-gray-100 dark:bg-gray-700 rounded" />
            <div className="h-4 w-2/3 bg-gray-100 dark:bg-gray-700 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-white dark:bg-gray-800 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function Account() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data: profile, isLoading, error } = useGetProfileQuery();
  const [uploadImage, { isLoading: isUploading }] = useUploadProfileImageMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [updatePassword, { isLoading: isChangingPw }] = useUpdatePasswordMutation();
  const { data: bookmarks = [] } = useGetBookmarksQuery();

  // Process profile image
  let profilImageSplit = profile?.profileImage;
  if (profilImageSplit?.includes("localhost:8070")) {
    profilImageSplit = profilImageSplit.replace(
      "http://localhost:8070/api/v1/profile-images",
      "https://forum-istad-api.cheat.casa/api/v1/media"
    );
  }
  const avatarSrc = useAuthImage(profilImageSplit);

  // State
  const [activeTab, setActiveTab] = useState("achievements"); // Defaulting to achievements to show off the design
  const [isEditing, setIsEditing] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [isPwOpen, setIsPwOpen] = useState(false);
  const [formData, setFormData] = useState({ displayName: "", bio: "" });
  const [pwForm, setPwForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmedNewPassword: "",
  });
  const [showPw, setShowPw] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  // Avatar upload state
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (profile)
      setFormData({
        displayName: profile.displayName || "",
        bio: profile.bio || "",
      });
  }, [profile]);

  // ── File helpers ──
  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };
  const closeAvatarModal = () => {
    setIsAvatarOpen(false);
    setPreviewImage(null);
    setSelectedFile(null);
    setIsDragging(false);
  };

  // ── Handlers ──
  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      await uploadImage(selectedFile).unwrap();
      toast.success("Profile photo updated! ✨");
      closeAvatarModal();
    } catch (err) {
      toast.error(err?.data?.message || "Upload failed");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateUser({
        username: formData.displayName,
        bio: formData.bio,
      }).unwrap();
      toast.success("Profile saved! 🚀");
      setIsEditing(false);
    } catch (err) {
      toast.error(err?.data?.message || "Update failed");
    }
  };

  const closePwModal = () => {
    setIsPwOpen(false);
    setPwForm({ oldPassword: "", newPassword: "", confirmedNewPassword: "" });
    setShowPw({ old: false, new: false, confirm: false });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmedNewPassword } = pwForm;
    if (!oldPassword || !newPassword || !confirmedNewPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmedNewPassword) {
      toast.error("New passwords do not match");
      return;
    }
    try {
      await updatePassword({
        oldPassword,
        newPassword,
        confirmedNewPassword,
      }).unwrap();
      toast.success("Password changed successfully! 🔒");
      closePwModal();
    } catch (err) {
      toast.error(
        err?.data?.message ||
        "Failed to change password. Check your current password."
      );
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.info("Logged out");
    navigate("/login");
  };

  if (isLoading) return <PageSkeleton />;
  if (error || !profile)
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <aside className="shrink-0">
          <Sidebar className="hidden lg:flex" />
        </aside>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-5xl mb-4">👾</div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              Couldn't load profile
            </h2>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );

  const questions = profile.questions ?? [];
  const comments = profile.comments ?? [];
  const savedCount = bookmarks.length;
  const memberSince = profile.creationDate
    ? format(new Date(profile.creationDate + "Z"), "MMM yyyy")
    : "—";

  const activities = [
    ...questions.map((q) => ({
      id: `q-${q.id}`,
      type: "question",
      title: "Asked a Question",
      description: q.title,
      date: q.creationDate ? new Date(q.creationDate + "Z") : new Date(),
      link: `/question/${q.id}`,
      icon: FiHelpCircle,
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/20",
    })),
    ...comments.map((c) => ({
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

  // Mock stats
  const badges = { gold: 3, silver: 8, bronze: 15 };
  const stats = {
    xpEarned: 4720,
    questions: questions.length,
    answers: comments.length,
    challenges: 12,
    reputation: profile?.reputation ?? 0,
    views: profile?.views ?? 0,
    upVotes: profile?.upVotes ?? 0,
    downVotes: profile?.downVotes ?? 0,
  };

  // ── New Categorized Achievements Data ──
  const achievementCategories = [
    {
      title: "Getting Started",
      description: "First steps into the community.",
      achievements: [
        { id: 1, title: "First Login", description: "Successfully created an account and logged in.", icon: FiTerminal, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30", progress: 1, total: 1, completed: true, date: "2023-10-10" },
        { id: 2, title: "Profile Complete", description: "Added a bio and uploaded an avatar.", icon: FiUser, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/30", progress: 2, total: 2, completed: true, date: "2023-10-12" },
        { id: 3, title: "Hello World", description: "Asked your very first question.", icon: FiHelpCircle, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/30", progress: 1, total: 1, completed: true, date: "2023-10-15" },
      ]
    },
    {
      title: "Community & Engagement",
      description: "Interacting and helping others grow.",
      achievements: [
        { id: 4, title: "Helpful Hand", description: "Answer 50 questions to aid the community.", icon: FiMessageSquare, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/30", progress: 32, total: 50, completed: false },
        { id: 5, title: "Crowd Favorite", description: "Accumulate 1,000 total upvotes across posts.", icon: FiThumbsUp, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30", progress: 1000, total: 1000, completed: true, date: "2024-01-05" },
        { id: 6, title: "Trendsetter", description: "Have a question viewed over 500 times.", icon: FiEye, color: "text-indigo-500", bg: "bg-indigo-100 dark:bg-indigo-900/30", progress: 500, total: 500, completed: true, date: "2024-02-15" },
        { id: 7, title: "Streak Master", description: "Log in and contribute for 7 consecutive days.", icon: FiZap, color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/30", progress: 4, total: 7, completed: false },
      ]
    },
    {
      title: "Expertise & Quality",
      description: "Recognized for excellent answers and skills.",
      achievements: [
        { id: 8, title: "Gold Standard", description: "Receive 5 gold badges for excellent answers.", icon: FiAwardIcon, color: "text-yellow-500", bg: "bg-yellow-100 dark:bg-yellow-900/30", progress: 3, total: 5, completed: false },
        { id: 9, title: "Code Guru", description: "Provide 10 answers with accepted code blocks.", icon: FiCode, color: "text-rose-500", bg: "bg-rose-100 dark:bg-rose-900/30", progress: 10, total: 10, completed: true, date: "2024-03-01" },
        { id: 10, title: "Problem Solver", description: "Have your answer accepted as the correct solution 20 times.", icon: FiCheck, color: "text-teal-500", bg: "bg-teal-100 dark:bg-teal-900/30", progress: 14, total: 20, completed: false },
      ]
    }
  ];

  // Calculate total progress
  const totalAchievements = achievementCategories.reduce((acc, cat) => acc + cat.achievements.length, 0);
  const unlockedAchievements = achievementCategories.reduce((acc, cat) => acc + cat.achievements.filter(a => a.completed).length, 0);
  const overallProgress = (unlockedAchievements / totalAchievements) * 100;

  const tabs = [
    { id: "questions", label: "Questions", count: questions.length },
    { id: "answers", label: "Answers", count: comments.length },
    { id: "achievements", label: "Achievements", count: unlockedAchievements },
    { id: "activity", label: "Activity", count: activities.length },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <aside className="shrink-0">
        <Sidebar className="hidden lg:flex" />
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 min-w-0">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Profile Header */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6">
              {/* Avatar */}
              <div className="relative group shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-blue-500 to-indigo-600 text-white text-2xl font-bold">
                      {profile.displayName?.charAt(0).toUpperCase() ?? "U"}
                    </div>
                  )}
                  <button
                    onClick={() => setIsAvatarOpen(true)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full"
                  >
                    <FiCamera className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.displayName}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {profile.email}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 max-w-xl">
                  {profile.bio || "No bio yet."}
                </p>
              </div>

              {/* Unified Action Dropdown */}
              <div className="mt-4 sm:mt-0">
                <AccountProfileDropdown 
                  profile={profile}
                  onEditProfile={() => setIsEditing(true)}
                  onChangePassword={() => setIsPwOpen(true)}
                />
              </div>
            </div>
          </div>

          {/* Badges Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Badges
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <BadgeCard
                count={badges.gold}
                label="Gold"
                color="text-yellow-500"
                bgColor="bg-yellow-50 dark:bg-yellow-900/20"
              />
              <BadgeCard
                count={badges.silver}
                label="Silver"
                color="text-gray-400"
                bgColor="bg-gray-50 dark:bg-gray-700"
              />
              <BadgeCard
                count={badges.bronze}
                label="Bronze"
                color="text-amber-600"
                bgColor="bg-amber-50 dark:bg-amber-900/20"
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={FiTrendingUp}
              label="XP Earned"
              value={stats.xpEarned}
              color="text-blue-600"
              bg="bg-blue-50 dark:bg-blue-900/20"
            />
            <StatCard
              icon={FiHelpCircle}
              label="Questions"
              value={stats.questions}
              color="text-green-600"
              bg="bg-green-50 dark:bg-green-900/20"
            />
            <StatCard
              icon={FiMessageSquare}
              label="Answers"
              value={stats.answers}
              color="text-purple-600"
              bg="bg-purple-50 dark:bg-purple-900/20"
            />
            <StatCard
              icon={FiAwardIcon}
              label="Challenges"
              value={stats.challenges}
              color="text-orange-600"
              bg="bg-orange-50 dark:bg-orange-900/20"
            />
            
            <StatCard
              icon={FiStar}
              label="Reputation"
              value={stats.reputation}
              color="text-amber-500"
              bg="bg-amber-50 dark:bg-amber-900/20"
            />
            <StatCard
              icon={FiEye}
              label="Views"
              value={stats.views}
              color="text-sky-500"
              bg="bg-sky-50 dark:bg-sky-900/20"
            />
            <StatCard
              icon={FiThumbsUp}
              label="UpVotes"
              value={stats.upVotes}
              color="text-emerald-500"
              bg="bg-emerald-50 dark:bg-emerald-500/20"
            />
            <StatCard
              icon={FiThumbsDown}
              label="DownVotes"
              value={stats.downVotes}
              color="text-rose-500"
              bg="bg-rose-50 dark:bg-rose-900/20"
            />
          </div>

          {/* Tabs Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto hide-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[120px] px-4 py-3 text-sm font-semibold transition-all border-b-2 -mb-px whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-4 sm:p-6">
              {activeTab === "questions" && (
                <div>
                  {questions.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-gray-500 dark:text-gray-400">
                        No questions yet
                      </p>
                      <Link
                        to="/ask"
                        className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700"
                      >
                        Ask a Question
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700 -mx-4 sm:-mx-6">
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
                    <div className="py-12 text-center">
                      <p className="text-gray-500 dark:text-gray-400">
                        No answers yet
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {comments.map((c) => (
                        <Link
                          key={c.id}
                          to={`/question/${c.postId}`}
                          className="block p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                        >
                          <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2">
                            {c.text}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {c.creationDate
                              ? formatDistanceToNow(new Date(c.creationDate + "Z"), {
                                  addSuffix: true,
                                })
                              : "Recently"}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── NEW ACHIEVEMENTS TAB NO LEVEL ── */}
              {activeTab === "achievements" && (
                <div className="space-y-10">
                  
                  {/* Overall Progress Header */}
                  <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                      <div>
                        <h3 className="text-2xl font-black flex items-center gap-2 mb-1">
                          <FiAward className="w-7 h-7 text-blue-200" /> Trophies & Milestones
                        </h3>
                        <p className="text-blue-100 text-sm font-medium">
                          You have unlocked <strong className="text-white text-base">{unlockedAchievements}</strong> out of {totalAchievements} total achievements.
                        </p>
                      </div>
                      <div className="w-full sm:w-1/3 space-y-2 shrink-0">
                        <div className="flex justify-between items-center text-xs font-bold text-blue-200 uppercase tracking-wider">
                          <span>Completion</span>
                          <span>{Math.round(overallProgress)}%</span>
                        </div>
                        <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                          <div 
                            className="h-full bg-white rounded-full transition-all duration-1000 ease-out relative"
                            style={{ width: `${overallProgress}%` }}
                          >
                            <div className="absolute inset-0 bg-white/40 w-full h-full animate-[shimmer_2s_infinite] -skew-x-12" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Categories Grid */}
                  <div className="space-y-10">
                    {achievementCategories.map((category, idx) => (
                      <div key={idx} className="space-y-4">
                        <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                            {category.title}
                          </h4>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                            {category.description}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {category.achievements.map((ach) => (
                            <div 
                              key={ach.id} 
                              className={`relative p-5 rounded-2xl transition-all duration-300 overflow-hidden ${
                                ach.completed 
                                  ? 'bg-white dark:bg-gray-800 border-2 border-transparent shadow-md hover:-translate-y-1' 
                                  : 'bg-gray-50/50 dark:bg-gray-800/40 border-2 border-dashed border-gray-200 dark:border-gray-700/60 opacity-80'
                              }`}
                            >
                              {/* Background Gradient for completed */}
                              {ach.completed && (
                                <div className={`absolute inset-0 opacity-5 bg-linear-to-br from-transparent to-${ach.color.split('-')[1]}-500`} />
                              )}
                              
                              <div className="relative flex gap-4 z-10">
                                {/* Icon Container */}
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${ach.completed ? ach.bg : 'bg-gray-200 dark:bg-gray-700'}`}>
                                  <ach.icon className={`w-7 h-7 ${ach.completed ? ach.color : 'text-gray-400 dark:text-gray-500'}`} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                  <div className="flex justify-between items-start mb-1 gap-2">
                                    <h5 className={`text-base font-bold truncate ${ach.completed ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                      {ach.title}
                                    </h5>
                                    {ach.completed && (
                                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm">
                                        <FiCheck className="w-3.5 h-3.5" />
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                                    {ach.description}
                                  </p>
                                  
                                  {/* Progress / Status */}
                                  <div className="mt-auto">
                                    {ach.completed ? (
                                      <div className="text-[11px] font-bold text-emerald-500 flex items-center gap-1.5 uppercase tracking-wide">
                                        <FiCalendar className="w-3.5 h-3.5" />
                                        Unlocked {format(new Date(ach.date), "MMM d, yyyy")}
                                      </div>
                                    ) : (
                                      <div className="space-y-1.5">
                                        <div className="flex justify-between items-end">
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                            In Progress
                                          </span>
                                          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                                            {ach.progress} / {ach.total}
                                          </span>
                                        </div>
                                        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                          <div 
                                            className="h-full bg-gray-400 dark:bg-gray-500 rounded-full transition-all duration-500"
                                            style={{ width: `${(ach.progress / ach.total) * 100}%` }}
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "activity" && (
                <div className="text-left">
                  {activities.length === 0 ? (
                    <div className="py-12 text-center">
                      <FiActivity className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 font-medium">
                        No activity yet
                      </p>
                    </div>
                  ) : (
                    <div className="relative border-l-2 border-gray-100 dark:border-gray-700/50 my-2 ml-[15px] sm:ml-[19px] space-y-6 sm:space-y-8">
                      {activities.map((act) => (
                        <div key={act.id} className="relative pl-7 sm:pl-8 group">
                          {/* Timeline dot */}
                          <div
                            className={`absolute -left-[15px] top-1.5 w-[28px] h-[28px] rounded-full flex items-center justify-center border-[3.5px] border-white dark:border-gray-800 ${act.color} z-10 shadow-sm`}
                          >
                            <act.icon className="w-3 h-3" />
                          </div>

                          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between gap-4 mb-2.5">
                              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                {act.title}
                              </h4>
                              <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 shrink-0 mt-0.5 uppercase tracking-wider">
                                {formatDistanceToNow(act.date, {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>

                            <Link
                              to={act.link}
                              className="block group/link bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors border border-transparent hover:border-blue-100 dark:hover:border-blue-800"
                            >
                              <p className="text-gray-600 dark:text-gray-300 text-[13px] sm:text-sm leading-relaxed line-clamp-2 group-hover/link:text-blue-600 dark:group-hover/link:text-blue-400 transition-colors">
                                {act.description?.replace(
                                  /!\[.*?\]\(.*?\)/g,
                                  "📷 [Image attached]"
                                )}
                              </p>
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

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden"
            >
              <div className="relative h-2 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500" />
              <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      <FiUser className="w-5 h-5" />
                    </div>
                    Edit Profile
                  </h3>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest">
                    Identity & Bio
                  </p>
                </div>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSave} className="px-8 py-8 space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                    Display Name
                  </label>
                  <div className="relative group">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="text"
                      required
                      value={formData.displayName}
                      onChange={(e) =>
                        setFormData({ ...formData, displayName: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white font-bold placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 ml-1">
                    This is your public name seen by other members.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                    Biography
                  </label>
                  <textarea
                    rows={4}
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white font-medium placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none leading-relaxed"
                    placeholder="Tell us about yourself, your skills, or what you're building..."
                  />
                  <div className="flex justify-between items-center px-1">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">
                      Markdown is supported.
                    </p>
                    <p className={`text-[10px] font-bold ${formData.bio.length > 500 ? 'text-red-500' : 'text-gray-400'}`}>
                      {formData.bio.length}/500
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    disabled={isUpdating}
                    className="flex-1 py-3.5 text-sm font-black text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-2xl transition-all"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-[1.5] flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-2xl transition-all shadow-lg shadow-blue-500/25 active:scale-95 disabled:opacity-60"
                  >
                    {isUpdating ? (
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <FiCheck className="w-5 h-5" /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Avatar Upload Modal */}
      <AnimatePresence>
        {isAvatarOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                    <FiCamera className="w-4.5 h-4.5" />
                  </div>
                  Update Photo
                </h3>
                <button
                  onClick={closeAvatarModal}
                  disabled={isUploading}
                  className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
                >
                  <FiX className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="p-8 flex flex-col items-center gap-6">
                {/* Preview Circle */}
                <div className="relative group">
                  <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl group-hover:shadow-blue-500/10 transition-shadow">
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : avatarSrc ? (
                      <img src={avatarSrc} alt="Current" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-black">
                        {profile.displayName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/40 rounded-3xl backdrop-blur-xs flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <label
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]); }}
                  className={`w-full py-8 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer transition-all gap-2
                    ${isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"}`}
                >
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-full">
                    <FiUploadCloud className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                      {selectedFile ? selectedFile.name : "Choose a new photo"}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">
                      Or drag and drop here
                    </p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => processFile(e.target.files[0])} disabled={isUploading} />
                </label>
              </div>

              <div className="px-8 pb-8 flex gap-3">
                <button
                  onClick={closeAvatarModal}
                  disabled={isUploading}
                  className="flex-1 py-3 text-sm font-black text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="flex-[2] flex items-center justify-center gap-2 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-black rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  Update Photo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {isPwOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden"
            >
              <div className="relative h-2 bg-linear-to-r from-amber-400 via-orange-500 to-rose-500" />
              <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                      <FiShield className="w-5 h-5" />
                    </div>
                    Security Settings
                  </h3>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest">
                    Protect Your Account
                  </p>
                </div>
                <button
                  onClick={closePwModal}
                  className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleChangePassword} className="px-8 py-8 space-y-6">
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-2xl flex items-start gap-3">
                  <div className="p-1.5 bg-white dark:bg-amber-900/40 rounded-lg shadow-sm">
                    <FiLock className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-xs text-amber-900/70 dark:text-amber-200/70 leading-relaxed font-medium">
                    Ensure your new password contains at least <strong className="text-amber-600 dark:text-amber-400 font-bold">8 characters</strong>, including letters and numbers for maximum security.
                  </p>
                </div>

                {/* Current Password */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                    Verify Identity
                  </label>
                  <div className="relative group">
                    <FiKey className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                    <input
                      type={showPw.old ? "text" : "password"}
                      required
                      value={pwForm.oldPassword}
                      onChange={(e) => setPwForm({ ...pwForm, oldPassword: e.target.value })}
                      className="w-full pl-12 pr-12 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white font-bold placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw({ ...showPw, old: !showPw.old })}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-500 transition-colors"
                    >
                      {showPw.old ? <FiEyeOff className="w-4.5 h-4.5" /> : <FiEye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                      New Password
                    </label>
                    <div className="relative group">
                      <input
                        type={showPw.new ? "text" : "password"}
                        required
                        value={pwForm.newPassword}
                        onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                        className="w-full px-4 py-3.5 pr-11 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white font-bold placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-mono"
                        placeholder="8+ characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw({ ...showPw, new: !showPw.new })}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-500 transition-colors"
                      >
                        {showPw.new ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                      Finalize
                    </label>
                    <div className="relative group">
                      <input
                        type={showPw.confirm ? "text" : "password"}
                        required
                        value={pwForm.confirmedNewPassword}
                        onChange={(e) => setPwForm({ ...pwForm, confirmedNewPassword: e.target.value })}
                        className={`w-full px-4 py-3.5 pr-11 bg-gray-50 dark:bg-gray-800/50 border rounded-2xl text-gray-900 dark:text-white font-bold placeholder-gray-400 focus:outline-none focus:ring-4 transition-all font-mono
                          ${pwForm.confirmedNewPassword && pwForm.newPassword !== pwForm.confirmedNewPassword 
                            ? "border-red-400 focus:ring-red-400/10 focus:border-red-400" 
                            : pwForm.confirmedNewPassword && pwForm.newPassword === pwForm.confirmedNewPassword 
                            ? "border-emerald-400 focus:ring-emerald-400/10 focus:border-emerald-400" 
                            : "border-gray-200 dark:border-gray-700 focus:ring-amber-500/10 focus:border-amber-500"}`}
                        placeholder="Repeat it"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw({ ...showPw, confirm: !showPw.confirm })}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-500 transition-colors"
                      >
                        {showPw.confirm ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Validation Feedback */}
                <div className="min-h-[20px]">
                  {pwForm.confirmedNewPassword && pwForm.newPassword !== pwForm.confirmedNewPassword && (
                    <div className="flex items-center gap-1.5 text-red-500 text-[11px] font-black uppercase tracking-wider animate-in fade-in slide-in-from-left-2 transition-all">
                      <FiX className="w-4 h-4" /> Passwords do not match
                    </div>
                  )}
                  {pwForm.confirmedNewPassword && pwForm.newPassword === pwForm.confirmedNewPassword && (
                    <div className="flex items-center gap-1.5 text-emerald-500 text-[11px] font-black uppercase tracking-wider animate-in fade-in slide-in-from-left-2 transition-all">
                      <FiCheck className="w-4 h-4" /> Ready to Update
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closePwModal}
                    className="flex-1 py-3.5 text-sm font-black text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-2xl transition-all"
                  >
                    Keep Old
                  </button>
                  <button
                    type="submit"
                    disabled={isChangingPw || (pwForm.confirmedNewPassword && pwForm.newPassword !== pwForm.confirmedNewPassword)}
                    className="flex-[1.5] flex items-center justify-center gap-2 py-3.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-black rounded-2xl transition-all shadow-lg shadow-amber-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isChangingPw ? (
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <FiShield className="w-5 h-5" /> Secure Account
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}