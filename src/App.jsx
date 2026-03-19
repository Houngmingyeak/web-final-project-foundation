// App.jsx
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Header from "./components/Header";
import Footer from "./components/Footer";
import { useTheme } from "./context/ThemeContext.jsx";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ChallengesPage = lazy(() => import("./pages/ChallengesPage"));
const QuestionsPage = lazy(() => import("./pages/QuestionPage"));
const BookmarkCard = lazy(() => import("./pages/BookMarkCard"));
const QuestionDetailPage = lazy(() => import("./pages/QuestionDetail"));
const AskQuestion = lazy(() => import("./pages/AskQuestion"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.jsx"));
const AboutPage = lazy(() => import("./pages/AboutUsPage.jsx"));
const Leaderboard = lazy(() => import("./pages/LeaderBoard.jsx"));
const Account = lazy(() => import("./pages/Account.jsx"));


function Layout() {
  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 bg-white dark:bg-gray-900 text-black dark:text-white">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  const { theme } = useTheme(); // get current theme

  return (
    <BrowserRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
    >
      <Suspense fallback={
        <div className={`flex justify-center items-center min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }>
        <Routes>
          {/* ── Standalone pages (no Header / Footer) ── */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* ── App pages (with Layout: Header + Footer) ── */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/challenges" element={<ChallengesPage />} />
            <Route path="/account" element={<Account />} />
            <Route path="/questions" element={<QuestionsPage />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/saves" element={<BookmarkCard />} />
            <Route path="/question/:id" element={<QuestionDetailPage />} />
            <Route path="/ask" element={<AskQuestion />} />
            <Route path="/about-us" element={<AboutPage />} />
            <Route path="/profile" element={<Account />} />
          </Route>
        </Routes>
      </Suspense>

      {/* Toast notifications respect current theme */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme === "dark" ? "dark" : "light"}
      />
    </BrowserRouter>
  );
}
