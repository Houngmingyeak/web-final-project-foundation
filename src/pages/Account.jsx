import React, { useState, useEffect } from "react";
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
  FiActivity,
  FiEye,
  FiStar,
  FiClock,
  FiX,
  FiUploadCloud,
  FiCalendar,
  FiUser,
  FiMail,
  FiShield,
  FiExternalLink,
  FiTag,
  FiCheck,
  FiLock,
  FiEyeOff,
  FiKey,
} from "react-icons/fi";
import AccountProfileDropdown from "../components/AccountProfileDropdown";
import Sidebar from "../layout/Sidebar";

// ── Question Row ───────────────────────────────────────────────────────────
function QuestionRow({ q }) {
  return (
    <Link
      to={`/question/${q.id}`}
      className="group flex items-start gap-4 px-4 py-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-200"
    >
      {/* Score / stats column */}
      <div className="shrink-0 flex flex-col items-center gap-1.5 min-w-[44px] pt-0.5">
        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
          <FiStar className="w-3 h-3" /> {q.score ?? 0}
        </div>
        <div className="flex items-center gap-1 text-gray-400 text-xs">
          <FiEye className="w-3 h-3" /> {q.viewCount ?? 0}
        </div>
        <div className="flex items-center gap-1 text-gray-400 text-xs">
          <FiMessageSquare className="w-3 h-3" /> {q.comments?.length ?? 0}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
          {q.title}
        </p>
        {q.tagResponses?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {q.tagResponses.slice(0, 3).map((t) => (
              <span key={t.id} className="text-[10px] font-semibold px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full">
                {t.tagName}
              </span>
            ))}
          </div>
        )}
        <p className="text-[11px] text-gray-400 flex items-center gap-1">
          <FiClock className="w-3 h-3" />
          {q.creationDate ? formatDistanceToNow(new Date(q.creationDate + "Z"), { addSuffix: true }) : "Recently"}
        </p>
      </div>
      <FiExternalLink className="w-4 h-4 text-gray-300 group-hover:text-blue-400 shrink-0 mt-1 transition-colors" />
    </Link>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <aside className="shrink-0"><Sidebar className="hidden lg:flex" /></aside>
      <div className="flex-1 animate-pulse min-w-0">
        <div className="h-64 bg-linear-to-br from-blue-600 to-violet-700" />
        <div className="max-w-3xl mx-auto px-4 -mt-16 space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-28 h-28 rounded-full bg-gray-200 dark:bg-gray-700 ring-4 ring-white dark:ring-gray-950" />
            <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            <div className="h-4 w-28 bg-gray-100 dark:bg-gray-800 rounded-lg" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 dark:bg-gray-900 rounded-2xl" />
            ))}
          </div>
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
  const [uploadImage,    { isLoading: isUploading }]  = useUploadProfileImageMutation();
  const [updateUser,     { isLoading: isUpdating }]   = useUpdateUserMutation();
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

  const [activeTab, setActiveTab] = useState("questions");
  const [isEditing, setIsEditing] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [isPwOpen, setIsPwOpen] = useState(false);
  const [formData, setFormData] = useState({ displayName: "", bio: "" });
  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "", confirmedNewPassword: "" });
  const [showPw, setShowPw] = useState({ old: false, new: false, confirm: false });
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (profile) setFormData({ displayName: profile.displayName || "", bio: profile.bio || "" });
  }, [profile]);

  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const closeAvatarModal = () => { setIsAvatarOpen(false); setPreviewImage(null); setSelectedFile(null); setIsDragging(false); };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try { await uploadImage(selectedFile).unwrap(); toast.success("Profile photo updated! ✨"); closeAvatarModal(); }
    catch (err) { toast.error(err?.data?.message || "Upload failed"); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try { await updateUser({ username: formData.displayName, bio: formData.bio }).unwrap(); toast.success("Profile saved! 🚀"); setIsEditing(false); }
    catch (err) { toast.error(err?.data?.message || "Update failed"); }
  };

  const closePwModal = () => { setIsPwOpen(false); setPwForm({ oldPassword: "", newPassword: "", confirmedNewPassword: "" }); setShowPw({ old: false, new: false, confirm: false }); };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmedNewPassword } = pwForm;
    if (!oldPassword || !newPassword || !confirmedNewPassword) { toast.error("Please fill in all password fields"); return; }
    if (newPassword.length < 8) { toast.error("New password must be at least 8 characters"); return; }
    if (newPassword !== confirmedNewPassword) { toast.error("New passwords do not match"); return; }
    try { await updatePassword({ oldPassword, newPassword, confirmedNewPassword }).unwrap(); toast.success("Password changed successfully! 🔒"); closePwModal(); }
    catch (err) { toast.error(err?.data?.message || "Failed to change password. Check your current password."); }
  };

  const handleLogout = () => { dispatch(logout()); toast.info("Logged out"); navigate("/login"); };

  if (isLoading) return <PageSkeleton />;
  if (error || !profile)
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        <aside className="shrink-0"><Sidebar className="hidden lg:flex" /></aside>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-5xl mb-4">👾</div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Couldn't load profile</h2>
            <button onClick={() => window.location.reload()} className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">Retry</button>
          </div>
        </div>
      </div>
    );

  const questions = profile.questions ?? [];
  const comments = profile.comments ?? [];
  const memberSince = profile.creationDate ? format(new Date(profile.creationDate + "Z"), "MMM yyyy") : "—";

  const activities = [
    ...questions.map((q) => ({
      id: `q-${q.id}`, type: "question", title: "Asked a Question",
      description: q.title, date: q.creationDate ? new Date(q.creationDate + "Z") : new Date(),
      link: `/question/${q.id}`, icon: FiHelpCircle, color: "text-white bg-blue-500",
    })),
    ...comments.map((c) => ({
      id: `c-${c.id}`, type: "answer", title: "Answered a Question",
      description: c.text || c.body || "",
      date: c.creationDate ? new Date(c.creationDate + "Z") : new Date(),
      link: `/question/${c.postId || ""}`, icon: FiMessageSquare, color: "text-white bg-purple-500",
    })),
  ].sort((a, b) => b.date - a.date);

  const tabs = [
    { id: "questions", label: "Questions", count: questions.length, icon: FiHelpCircle },
    { id: "answers",   label: "Answers",   count: comments.length,  icon: FiMessageSquare },
    { id: "activity",  label: "Activity",  count: activities.length, icon: FiActivity },
  ];

  const initials = profile.displayName?.slice(0, 2).toUpperCase() ?? "U";

  const stats = [
    { icon: FiHelpCircle,    label: "Questions",     value: questions.length,         bg: "bg-blue-500",    light: "bg-blue-50 dark:bg-blue-500/10",   text: "text-blue-600 dark:text-blue-400" },
    { icon: FiMessageSquare, label: "Answers",        value: comments.length,          bg: "bg-purple-500",  light: "bg-purple-50 dark:bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" },
    { icon: FiStar,          label: "Reputation",     value: profile?.reputation ?? 0, bg: "bg-amber-500",   light: "bg-amber-50 dark:bg-amber-500/10",   text: "text-amber-600 dark:text-amber-400" },
    { icon: FiEye,           label: "Profile Views",  value: profile?.views ?? 0,      bg: "bg-emerald-500", light: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Sidebar — hidden on mobile */}
      <aside className="shrink-0 hidden lg:block">
        <Sidebar />
      </aside>

      <div className="flex-1 overflow-y-auto min-w-0">

        {/* ══════════════════════════════════════════════════════════════════
            HERO — tall gradient with floating orbs, no rounding
        ══════════════════════════════════════════════════════════════════ */}
        <div className="relative h-60 sm:h-72 overflow-hidden bg-linear-to-135deg from-blue-600 via-indigo-600 to-violet-700">
          {/* Decorative orbs */}
          <div className="absolute -top-16 -left-16 w-72 h-72 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-24 right-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-40 h-40 bg-blue-300/10 rounded-full blur-xl" />

          {/* Member badge — top right */}
          <div className="absolute top-5 right-5 flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full">
            <FiCalendar className="w-3.5 h-3.5 text-white/80" />
            <span className="text-white/80 text-xs font-semibold">Since {memberSince}</span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            PROFILE IDENTITY — avatar, name, actions (centered on mobile)
        ══════════════════════════════════════════════════════════════════ */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-14 sm:-mt-16 pb-6">

            {/* Left: avatar + name */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
              {/* Avatar with camera hover */}
              <div className="relative group shrink-0">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden ring-4 ring-white dark:ring-gray-950">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-blue-500 to-violet-600 text-white text-4xl font-black">
                      {initials}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setIsAvatarOpen(true)}
                  className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  <FiCamera className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Name + email */}
              <div className="pb-1 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight">
                  {profile.displayName}
                </h1>
                <p className="text-sm text-gray-400 dark:text-gray-500 flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                  <FiMail className="w-4 h-4" />
                  {profile.email}
                </p>
              </div>
            </div>

            {/* Right: settings dropdown */}
            <div className="flex justify-center sm:justify-end pb-1">
              <AccountProfileDropdown
                profile={profile}
                onEditProfile={() => setIsEditing(true)}
                onChangePassword={() => setIsPwOpen(true)}
              />
            </div>
          </div>

          {/* Bio */}
          <div className="mb-8">
            {profile.bio ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl">
                {profile.bio}
              </p>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-600 transition-colors"
              >
                <FiEdit2 className="w-3.5 h-3.5" /> Add a bio
              </button>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════════
              STATS — 4 colorful flat tiles, no border/shadow
          ══════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {stats.map((s) => (
              <div key={s.label} className={`${s.light} rounded-2xl px-4 py-5 flex flex-col gap-2`}>
                <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon className="w-4.5 h-4.5 text-white" />
                </div>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{s.value}</p>
                <p className={`text-xs font-semibold ${s.text}`}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* ══════════════════════════════════════════════════════════════
              TABS — pill-style selector, no border
          ══════════════════════════════════════════════════════════════ */}
          <div className="mb-6">
            {/* Pill tab row */}
            <div className="inline-flex bg-gray-100 dark:bg-gray-900 rounded-2xl p-1 gap-1 overflow-x-auto scrollbar-hide w-full sm:w-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 flex-1 sm:flex-none justify-center ${
                    activeTab === tab.id
                      ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
                >
                  <tab.icon className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold min-w-[20px] text-center ${
                    activeTab === tab.id
                      ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              TAB CONTENT — all flat, no border/shadow
          ══════════════════════════════════════════════════════════════ */}

          {/* Questions */}
          {activeTab === "questions" && (
            <div className="pb-10">
              {questions.length === 0 ? (
                <div className="py-20 text-center bg-gray-100/50 dark:bg-gray-900/50 rounded-3xl">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiHelpCircle className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium mb-4">No questions yet</p>
                  <Link to="/ask" className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors">
                    Ask your first question
                  </Link>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
                  {questions.map((q, i) => (
                    <div key={q.id}>
                      <QuestionRow q={q} />
                      {i < questions.length - 1 && <div className="mx-4 h-px bg-gray-100 dark:bg-gray-800" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Answers */}
          {activeTab === "answers" && (
            <div className="pb-10">
              {comments.length === 0 ? (
                <div className="py-20 text-center bg-gray-100/50 dark:bg-gray-900/50 rounded-3xl">
                  <div className="w-16 h-16 bg-purple-50 dark:bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiMessageSquare className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No answers yet</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden space-y-px">
                  {comments.map((c) => (
                    <Link key={c.id} to={`/question/${c.postId}`}
                      className="group flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center shrink-0 mt-0.5">
                        <FiMessageSquare className="w-4 h-4 text-purple-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 dark:text-gray-200 line-clamp-2 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{c.text}</p>
                        <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                          <FiClock className="w-3 h-3" />
                          {c.creationDate ? formatDistanceToNow(new Date(c.creationDate + "Z"), { addSuffix: true }) : "Recently"}
                        </p>
                      </div>
                      <FiExternalLink className="w-4 h-4 text-gray-300 group-hover:text-blue-400 shrink-0 transition-colors mt-0.5" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Activity */}
          {activeTab === "activity" && (
            <div className="pb-10">
              {activities.length === 0 ? (
                <div className="py-20 text-center bg-gray-100/50 dark:bg-gray-900/50 rounded-3xl">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiActivity className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-400 dark:text-gray-500 font-medium">No activity yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((act) => (
                    <div key={act.id} className="flex gap-4 items-start">
                      {/* Icon dot */}
                      <div className={`w-9 h-9 rounded-xl ${act.color} flex items-center justify-center shrink-0 mt-0.5`}>
                        <act.icon className="w-4 h-4" />
                      </div>
                      {/* Card */}
                      <div className="flex-1 min-w-0 bg-white dark:bg-gray-900 rounded-2xl px-4 py-3">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{act.title}</span>
                          <span className="text-[11px] text-gray-400 shrink-0">
                            {formatDistanceToNow(act.date, { addSuffix: true })}
                          </span>
                        </div>
                        <Link to={act.link} className="block">
                          <p className="text-sm text-gray-700 dark:text-gray-200 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
                            {act.description?.replace(/!\[.*?\]\(.*?\)/g, "📷 [Image]")}
                          </p>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>{/* /max-w-4xl */}
      </div>{/* /flex-1 */}

      {/* ══════════════════════════════════════════════════════════════════
          EDIT PROFILE MODAL
      ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl overflow-hidden">
              {/* Gradient top bar */}
              <div className="h-1 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500" />
              <div className="flex items-center justify-between px-6 sm:px-8 py-5">
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30"><FiUser className="w-4 h-4 text-blue-500" /></div>
                    Edit Profile
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Identity & Bio</p>
                </div>
                <button onClick={() => setIsEditing(false)} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all">
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSave} className="px-6 sm:px-8 pb-8 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Display Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" required value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-900 dark:text-white font-semibold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                      placeholder="e.g. John Doe" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Biography</label>
                  <textarea rows={4} value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all resize-none"
                    placeholder="Tell us about yourself..." />
                  <p className={`text-[10px] text-right font-bold ${formData.bio.length > 500 ? "text-red-500" : "text-gray-400"}`}>{formData.bio.length}/500</p>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-3 text-sm font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-2xl transition-all">Discard</button>
                  <button type="submit" disabled={isUpdating} className="flex-[1.5] flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl transition-all disabled:opacity-60">
                    {isUpdating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiCheck className="w-4 h-4" /> Save Changes</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════
          AVATAR UPLOAD MODAL
      ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isAvatarOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5">
                <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30"><FiCamera className="w-4 h-4 text-emerald-500" /></div>
                  Update Photo
                </h3>
                <button onClick={closeAvatarModal} disabled={isUploading} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-xl transition-all">
                  <FiX className="w-4 h-4" />
                </button>
              </div>
              <div className="px-6 pb-6 flex flex-col items-center gap-5">
                <div className="relative">
                  <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-gray-100 dark:ring-gray-800">
                    {previewImage ? <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                      : avatarSrc ? <img src={avatarSrc} alt="Current" className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-linear-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-3xl font-black">{initials}</div>}
                  </div>
                  {isUploading && <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center"><div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" /></div>}
                </div>
                <label
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]); }}
                  className={`w-full py-8 flex flex-col items-center justify-center rounded-2xl cursor-pointer transition-all gap-2 ${isDragging ? "bg-blue-50 dark:bg-blue-900/20" : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-full"><FiUploadCloud className="w-5 h-5" /></div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{selectedFile ? selectedFile.name : "Choose a photo"}</p>
                  <p className="text-[11px] text-gray-400">or drag and drop</p>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => processFile(e.target.files[0])} disabled={isUploading} />
                </label>
                <div className="flex gap-3 w-full">
                  <button onClick={closeAvatarModal} disabled={isUploading} className="flex-1 py-3 text-sm font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-2xl transition-all">Cancel</button>
                  <button onClick={handleUpload} disabled={!selectedFile || isUploading} className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold rounded-2xl transition-all disabled:opacity-50">Update Photo</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════
          CHANGE PASSWORD MODAL
      ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isPwOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl overflow-hidden">
              <div className="h-1 bg-linear-to-r from-amber-400 via-orange-500 to-rose-500" />
              <div className="flex items-center justify-between px-6 sm:px-8 py-5">
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/30"><FiShield className="w-4 h-4 text-amber-500" /></div>
                    Security Settings
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Protect Your Account</p>
                </div>
                <button onClick={closePwModal} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-xl transition-all"><FiX className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleChangePassword} className="px-6 sm:px-8 pb-8 space-y-5">
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-start gap-3">
                  <FiLock className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-900/70 dark:text-amber-200/70 leading-relaxed">New password must be at least <strong className="text-amber-600 dark:text-amber-400">8 characters</strong>.</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Current Password</label>
                  <div className="relative">
                    <FiKey className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type={showPw.old ? "text" : "password"} required value={pwForm.oldPassword}
                      onChange={(e) => setPwForm({ ...pwForm, oldPassword: e.target.value })}
                      className="w-full pl-11 pr-12 py-3.5 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-900 dark:text-white font-semibold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
                      placeholder="Enter current password" />
                    <button type="button" onClick={() => setShowPw({ ...showPw, old: !showPw.old })} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-500 transition-colors">
                      {showPw.old ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">New Password</label>
                    <div className="relative">
                      <input type={showPw.new ? "text" : "password"} required value={pwForm.newPassword}
                        onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                        className="w-full px-4 py-3.5 pr-11 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-900 dark:text-white font-semibold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
                        placeholder="8+ characters" />
                      <button type="button" onClick={() => setShowPw({ ...showPw, new: !showPw.new })} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-500 transition-colors">
                        {showPw.new ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Confirm Password</label>
                    <div className="relative">
                      <input type={showPw.confirm ? "text" : "password"} required value={pwForm.confirmedNewPassword}
                        onChange={(e) => setPwForm({ ...pwForm, confirmedNewPassword: e.target.value })}
                        className={`w-full px-4 py-3.5 pr-11 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-900 dark:text-white font-semibold placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                          pwForm.confirmedNewPassword && pwForm.newPassword !== pwForm.confirmedNewPassword
                            ? "ring-2 ring-red-400/30"
                            : pwForm.confirmedNewPassword && pwForm.newPassword === pwForm.confirmedNewPassword
                            ? "ring-2 ring-emerald-400/30"
                            : "focus:ring-amber-500/30"}`}
                        placeholder="Repeat it" />
                      <button type="button" onClick={() => setShowPw({ ...showPw, confirm: !showPw.confirm })} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-500 transition-colors">
                        {showPw.confirm ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="min-h-[18px]">
                  {pwForm.confirmedNewPassword && pwForm.newPassword !== pwForm.confirmedNewPassword && (
                    <p className="text-red-500 text-[11px] font-bold flex items-center gap-1"><FiX className="w-3.5 h-3.5" /> Passwords do not match</p>
                  )}
                  {pwForm.confirmedNewPassword && pwForm.newPassword === pwForm.confirmedNewPassword && (
                    <p className="text-emerald-500 text-[11px] font-bold flex items-center gap-1"><FiCheck className="w-3.5 h-3.5" /> Ready to update</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={closePwModal} className="flex-1 py-3 text-sm font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-2xl transition-all">Cancel</button>
                  <button type="submit" disabled={isChangingPw || (pwForm.confirmedNewPassword && pwForm.newPassword !== pwForm.confirmedNewPassword)}
                    className="flex-[1.5] flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-2xl transition-all disabled:opacity-50">
                    {isChangingPw ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiShield className="w-4 h-4" /> Secure Account</>}
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

