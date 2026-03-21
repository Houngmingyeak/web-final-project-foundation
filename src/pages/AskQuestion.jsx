import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Sidebar from "../layout/Sidebar";
import {
  useCreatePostMutation,
  useGetTagsQuery,
  useCreateTagMutation,
} from "../features/post/postsApi";
import {
  FiEdit3,
  FiEye,
  FiTag,
  FiAlertCircle,
  FiCheckCircle,
  FiLoader,
  FiX,
  FiImage,
} from "react-icons/fi";
import { useUploadSingleImageMutation } from "../features/upload/uploadApi";
import { renderMarkdown } from "../utils/markdownRenderer";

const MAX_TAGS = 5;
const MIN_TITLE = 15;
const MIN_BODY = 30;

function TagChip({ tag, selected, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium border transition-all duration-200
        ${selected
          ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200 dark:shadow-blue-900/30"
          : disabled
            ? "bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed"
            : "bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-300 border-slate-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
        }`}
    >
      {selected && <FiX className="w-3 h-3" />}
      {tag}
    </button>
  );
}

function fieldState(value, min) {
  if (!value) return "idle";
  return value.trim().length >= min ? "ok" : "warn";
}

export default function AskQuestion() {
  const navigate = useNavigate();
  const [createPost, { isLoading }] = useCreatePostMutation();
  const [createTag, { isLoading: creatingTag }] = useCreateTagMutation();
  const [uploadImage, { isLoading: isUploadingImage }] = useUploadSingleImageMutation();
  const { data: availableTags = [], isLoading: tagsLoading } =
    useGetTagsQuery();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [bodyTab, setBodyTab] = useState("write");
  const [submitted, setSubmitted] = useState(false);

  const titleState = fieldState(title, MIN_TITLE);
  const bodyState = fieldState(body, MIN_BODY);
  const isValid =
    title.trim().length >= MIN_TITLE &&
    body.trim().length >= MIN_BODY &&
    tags.length > 0;

  const toggleTag = (tagObj) => {
    const exists = tags.some((t) => t.id === tagObj.id);
    if (exists) {
      setTags(tags.filter((t) => t.id !== tagObj.id));
    } else if (tags.length < MAX_TAGS) {
      setTags([...tags, tagObj]);
    }
  };

  const handleCreateTag = async () => {
    const name = newTagInput.trim();
    if (!name) return;
    if (tags.length >= MAX_TAGS) {
      toast.error(`You can only add up to ${MAX_TAGS} tags`);
      return;
    }
    try {
      const newTag = await createTag(name).unwrap();
      setTags((prev) => {
        if (prev.some((t) => t.id === newTag.id)) return prev;
        return [...prev, { id: newTag.id, tagName: newTag.tagName }];
      });
      setNewTagInput("");
      toast.success(`Tag "${newTag.tagName}" created and selected!`);
    } catch (err) {
      toast.error(
        err?.data?.message ?? "Failed to create tag. It may already exist.",
      );
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadImage(file).unwrap();
      if (result && result.uri) {
        setBody((prev) => prev + `\n![${file.name}](${result.uri})\n`);
        toast.success("Image uploaded!");
      }
    } catch (err) {
      toast.error("Failed to upload image");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!isValid) return;
    try {
      await createPost({
        title: title.trim(),
        body: body.trim(),
        postTypeId: 1,
        tagIds: tags.map((t) => t.id),
      }).unwrap();
      toast.success("Question posted successfully! +15 XP");
      navigate("/questions");
    } catch (err) {
      toast.error(
        err?.data?.message ?? "Failed to post question. Please try again.",
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="hidden lg:block shrink-0"><Sidebar /></div>

      <main className="flex-1 overflow-y-auto min-w-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Ask a Question
                </h1>
                <p className="text-slate-500 dark:text-gray-400 text-sm">
                  Get help from thousands of developers in our community
                </p>
              </div>
            </div>
          </div>

          <div>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-5"
            >
              {/* Card Container */}
              <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
                {/* 1. Title */}
                <div className="p-6">
                  <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-1.5">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-slate-400 dark:text-gray-500 mb-3">
                    Be specific and imagine you're asking a question to another person.
                  </p>
                  <div className="relative">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={150}
                      className={`w-full px-4 py-3 rounded-xl text-sm bg-slate-50 dark:bg-gray-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 border transition-all outline-none
                        ${submitted && titleState !== "ok"
                          ? "border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-400/30"
                          : titleState === "ok"
                            ? "border-emerald-400 dark:border-emerald-600 focus:ring-2 focus:ring-emerald-400/20"
                            : "border-slate-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400"
                        }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {titleState === "ok" && (
                        <FiCheckCircle className="w-4 h-4 text-emerald-500" />
                      )}
                      {submitted && titleState !== "ok" && (
                        <FiAlertCircle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between mt-2">
                    {submitted && titleState !== "ok" ? (
                      <p className="text-xs text-red-500">
                        Title must be at least {MIN_TITLE} characters
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 dark:text-gray-500">
                        Min {MIN_TITLE} characters
                      </p>
                    )}
                    <p
                      className={`text-xs ${title.length > 130 ? "text-orange-500" : "text-slate-400 dark:text-gray-500"}`}
                    >
                      {title.length}/150
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-gray-700" />

                {/* 2. Description */}
                <div className="p-6">
                  <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-1.5">
                    Description <span className="text-red-500">*</span>
                  </label>

                  <div className="flex justify-between items-center mb-3">
                    <div className="flex gap-1 bg-slate-100 dark:bg-gray-900 rounded-xl p-1 w-fit">
                      {["write", "preview"].map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setBodyTab(tab)}
                          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold capitalize
                            ${bodyTab === tab
                              ? "bg-white dark:bg-gray-700 text-slate-900 dark:text-white shadow-sm"
                              : "text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300"
                            }`}
                        >
                          {tab === "write" ? (
                            <FiEdit3 className="w-3 h-3" />
                          ) : (
                            <FiEye className="w-3 h-3" />
                          )}
                          {tab}
                        </button>
                      ))}
                    </div>

                    {bodyTab === "write" && (
                      <div className="relative border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 rounded-lg shadow-sm transition-colors overflow-hidden">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={isUploadingImage}
                          title="Upload image"
                        />
                        <button
                          type="button"
                          disabled={isUploadingImage}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-gray-300"
                        >
                          {isUploadingImage ? <FiLoader className="w-3 h-3 animate-spin" /> : <FiImage className="w-3 h-3 text-blue-500" />}
                          {isUploadingImage ? "Uploading..." : "Add Image"}
                        </button>
                      </div>
                    )}
                  </div>
                  {bodyTab === "write" ? (
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder={"Describe your problem in detail..."}
                      rows={12}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-mono bg-slate-50 dark:bg-gray-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500  transition-all 
                        ${submitted && bodyState !== "ok"
                          ? "border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-400/30"
                          : bodyState === "ok"
                            ? "border-emerald-400 dark:border-emerald-600 focus:ring-2 focus:ring-emerald-400/20"
                            : "border-slate-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400"
                        }`}
                    />
                  ) : (
                    <div
                      className="w-full min-h-[200px] px-4 py-3 rounded-xl text-sm bg-slate-50 dark:bg-gray-900 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-gray-700 prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }}
                    />
                  )}
                  <div className="flex justify-between mt-2">
                    {submitted && bodyState !== "ok" ? (
                      <p className="text-xs text-red-500">
                        Description must be at least {MIN_BODY} characters
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 dark:text-gray-500">
                        Min {MIN_BODY} characters · Markdown supported
                      </p>
                    )}
                    <p className="text-xs text-slate-400 dark:text-gray-500">
                      {body.length} chars
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-gray-700" />

                {/* 3. Tags with Creation Support */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-1.5">
                      <FiTag className="w-4 h-4 text-blue-500" />
                      Tags <span className="text-red-500">*</span>
                    </label>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full
                      ${tags.length >= MAX_TAGS
                          ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                          : "bg-slate-100 dark:bg-gray-700 text-slate-500 dark:text-gray-400"
                        }`}
                    >
                      {tags.length}/{MAX_TAGS} Selected
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-gray-500 mb-4">
                    Select existing tags or create a new one to describe your question.
                  </p>

                  {/* Selected Tags Area */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
                      {tags.map((tagObj) => (
                        <button
                          key={tagObj.id}
                          type="button"
                          onClick={() => toggleTag(tagObj)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white text-xs font-medium rounded-full hover:bg-red-500 transition-colors group"
                        >
                          {tagObj.tagName}
                          <FiX className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Tag Selection and Creation Input */}
                  <div className="space-y-4">
                    {/* Create New Tag Input */}
                    <div className="flex gap-2">
                       <input 
                         type="text"
                         value={newTagInput}
                         onChange={(e) => setNewTagInput(e.target.value)}
                         placeholder="Can't find a tag? Create one..."
                         className="flex-1 px-4 py-2 text-sm rounded-xl bg-slate-50 dark:bg-gray-900 text-slate-900 dark:text-white border border-slate-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-400/30 outline-none transition-all"
                       />
                       <button
                         type="button"
                         onClick={handleCreateTag}
                         disabled={creatingTag || !newTagInput.trim()}
                         className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-white disabled:opacity-50 transition-all"
                       >
                         {creatingTag ? <FiLoader className="animate-spin" /> : "Create Tag"}
                       </button>
                    </div>

                    {/* Available Tags list */}
                    <div className="flex flex-wrap gap-2">
                      {tagsLoading ? (
                        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-gray-500 py-1">
                          <FiLoader className="w-3.5 h-3.5 animate-spin" />
                          Loading…
                        </div>
                      ) : (
                        availableTags.map((tagObj) => (
                          <TagChip
                            key={tagObj.id}
                            tag={tagObj.tagName}
                            selected={tags.some((t) => t.id === tagObj.id)}
                            onClick={() => toggleTag(tagObj)}
                            disabled={
                              !tags.some((t) => t.id === tagObj.id) &&
                              tags.length >= MAX_TAGS
                            }
                          />
                        ))
                      )}
                    </div>
                  </div>

                  {submitted && tags.length === 0 && (
                    <p className="text-xs text-red-500 mt-4 flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3" /> Please add at least one tag
                    </p>
                  )}
                </div>

                {/* 4. Submit Row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4 bg-slate-50 dark:bg-gray-900/40">
                  <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-gray-400 font-medium">
                    +15 XP for asking a question
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl text-white transition-all
                        ${isLoading
                          ? "bg-blue-400 dark:bg-blue-700 cursor-not-allowed"
                          : "bg-blue-600 hover:-translate-y-0.5 active:translate-y-0 shadow-md shadow-blue-500/20"
                        }`}
                    >
                      {isLoading ? (
                        <>
                          <FiLoader className="w-4 h-4 animate-spin" />
                          Posting…
                        </>
                      ) : (
                        <>
                          <FiEdit3 className="w-4 h-4" />
                          Submit Question
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
            
          </div>
        </div>
      </main>
    </div>
  );
}
