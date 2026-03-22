import React, { useState } from "react";
import { FaRegEye, FaBookmark, FaRegBookmark } from "react-icons/fa";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { FiArrowUp } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useGetUserByIdQuery } from "../features/profile/profileApi";
import { useAuthImage } from "../hooks/useAuthImage";

function ChatIcon() {
  return <IoChatboxEllipsesOutline />;
}

function EyeIcon() {
  return <FaRegEye />;
}

export default function QuestionCard({ question, isBookmarked, onToggleBookmark }) {
  if (!question) return null;

  const { author = {}, comments = 0, views = 0, score, time = "", id } = question;

  const { data: userProfile } = useGetUserByIdQuery(author.id, {
    skip: !author.id,
  });
  const avatarSrc = useAuthImage(userProfile?.profileImage);

  const [imgError, setImgError] = useState(false);

  React.useEffect(() => {
    if (avatarSrc) setImgError(false);
  }, [avatarSrc]);

  return (
    <Link to={`/question/${id}`}>
      <div
        className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                   rounded-lg px-5 py-4 hover:border-gray-300 dark:hover:border-gray-600 
                   hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
      >


        {/* Title */}
        <h3 className="text-[18px] font-bold text-gray-900 dark:text-white hover:text-blue-600 
                       dark:hover:text-blue-400 transition-colors leading-snug mb-1.5 pr-8">
          {question.title}
        </h3>

        {/* Excerpt */}
        <p className="text-[16px] text-gray-500 dark:text-gray-400 leading-relaxed mb-3 line-clamp-1">
          {question.excerpt?.replace(/!\[.*?\]\(.*?\)/g, '')}
        </p>

        {/* Tags */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {question.tags.map((tag) => (
            <span key={tag}
              className="px-2.5 py-0.5 rounded-full text-[13px] font-medium 
                         bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 
                         border border-blue-100 dark:border-blue-800">
              {tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full ${author.color || "bg-gray-400"} 
                             flex items-center justify-center text-[13px] font-bold text-white shrink-0 overflow-hidden`}>
              {avatarSrc && !imgError ? (
                <img 
                  src={avatarSrc} 
                  alt={author.name} 
                  className="w-full h-full object-cover" 
                  onError={() => setImgError(true)} 
                />
              ) : (
                author.initials || "?"
              )}
            </span>
            <span className="text-[14px] text-gray-600 dark:text-gray-300 font-medium line-clamp-1">
              {author.name || "Unknown"}
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 text-gray-500 dark:text-gray-400 text-[13px] sm:text-[14px]">
            {score !== undefined && (
              <span className={`flex items-center gap-0.5 font-semibold shrink-0 ${
                score > 0 ? "text-emerald-500" : score < 0 ? "text-red-500" : "text-gray-400 dark:text-gray-500"
              }`}>
                <FiArrowUp className={`w-3.5 h-3.5 ${score < 0 ? "rotate-180" : ""}`} />
                {score}
              </span>
            )}
            <span className="flex items-center gap-1 shrink-0"><ChatIcon />{comments}</span>
            <span className="flex items-center gap-1 shrink-0">
              <EyeIcon />
              {typeof views === "number" ? views.toLocaleString() : views}
            </span>
            <span>{time}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}