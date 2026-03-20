import React, { useState, useRef } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../firebase/config"; 
import { useLoginMutation } from "../features/auth/authApi";
import { selectIsAuthenticated } from "../features/auth/authSlice";
import { useOAuthSync } from "../hooks/useOAuthSync";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

function EyeIcon({ visible }) {
  const strokeClass = "stroke-gray-600 dark:stroke-gray-300";
  return visible ? (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M2 10C2 10 5 4 10 4C15 4 18 10 18 10C18 10 15 16 10 16C5 16 2 10 2 10Z"
        className={strokeClass}
        strokeWidth="1.5"
      />
      <path d="M3 3L17 17" className={strokeClass} strokeWidth="1.5" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M2 10C2 10 5 4 10 4C15 4 18 10 18 10C18 10 15 16 10 16C5 16 2 10 2 10Z"
        className={strokeClass}
        strokeWidth="1.5"
      />
      <circle
        cx="10"
        cy="10"
        r="2.5"
        className={strokeClass}
        strokeWidth="1.5"
      />
    </svg>
  );
}

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [login, { isLoading }] = useLoginMutation();
  const { syncOAuthUser, oauthLoading } = useOAuthSync();
  const popupPending = useRef(false); // ← prevents double-popup

  if (isAuthenticated) {
    return <Navigate to="/questions" replace />;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please enter email and password");
      return;
    }
    try {
      await login({
        email: formData.email,
        password: formData.password,
      }).unwrap();
      toast.success("Login successful! 🎉");
      navigate("/questions");
    } catch (err) {
      toast.error(err?.data?.message || "Login failed");
    }
  };

  // --- Google Sign In ---
  const handleGoogleSignIn = async () => {
    if (popupPending.current) return;
    popupPending.current = true;
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      const result = await signInWithPopup(auth, provider);
      const success = await syncOAuthUser(result.user, "Google");
      if (success) navigate("/questions");
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") return;
      toast.error(err?.message || "Login with Google failed.");
    } finally {
      popupPending.current = false;
    }
  };

  // --- GitHub Sign In ---
  const handleGithubSignIn = async () => {
    if (popupPending.current) return;
    popupPending.current = true;
    try {
      const provider = new GithubAuthProvider();
      provider.addScope("user:email");
      provider.addScope("read:user");
      const result = await signInWithPopup(auth, provider);
      const success = await syncOAuthUser(result.user, "GitHub");
      if (success) navigate("/questions");
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") return;
      toast.error("GitHub Login failed: " + err.message);
    } finally {
      popupPending.current = false;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-[520px] p-8 md:p-12 transition-colors duration-300">
        <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          Login To Your Account
        </h2>
        <p className="text-gray-500 dark:text-gray-300 mb-8">
          Welcome back! Please sign in to continue.
        </p>

        {/* Social login buttons */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            disabled={!!oauthLoading || popupPending.current}
            onClick={handleGoogleSignIn}
            className={`w-full h-12 rounded-xl font-semibold bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 hover:bg-sky-200 transition flex items-center justify-center gap-3 disabled:opacity-50`}
          >
            <FcGoogle className="w-6 h-6" />
            {oauthLoading === "google" ? "Connecting..." : "Google"}
          </button>
          
          <button
            type="button"
            disabled={!!oauthLoading || popupPending.current}
            onClick={handleGithubSignIn}
            className={`w-full h-12 rounded-xl font-semibold bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 transition flex items-center justify-center gap-3 disabled:opacity-50`}
          >
            <FaGithub className="w-6 h-6" />
            {oauthLoading === "github" ? "Connecting..." : "GitHub"}
          </button>
        </div>

        <div className="flex items-center mb-6">
          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
          <span className="px-3 text-gray-400 dark:text-gray-500 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full h-12 border border-blue-400 dark:border-blue-600 rounded-xl px-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />
          </div>

          <div className="mb-3">
            <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full h-12 border border-blue-400 dark:border-blue-600 rounded-xl px-4 pr-12 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <EyeIcon visible={showPassword} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember(!remember)}
                className="accent-blue-500"
              />
              Remember me
            </label>
            <Link to="/forgot-password" hidden className="text-sm text-blue-500 hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full h-12 rounded-xl font-semibold text-white transition-all duration-300 ${
              isLoading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 hover:shadow-lg"
            }`}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-gray-600 dark:text-gray-300 text-sm mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-500 font-semibold hover:underline">
            Create new account
          </Link>
        </p>
      </div>
    </div>
  );
}