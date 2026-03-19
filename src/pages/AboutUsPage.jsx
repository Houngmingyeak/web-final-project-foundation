import { FaArrowRight } from "react-icons/fa6";
import SEO from "../components/SEO";
import { FaAngleRight } from "react-icons/fa";
import { CgMediaLive } from "react-icons/cg";
import { RiShieldLine } from "react-icons/ri";
import { FiUsers } from "react-icons/fi";
import CherPhengPic from "../assets/images/CherPhengPic.jpg";
import CherCheatPic from "../assets/images/CherCheatPic.JPG";
import YeakPic from "../assets/images/YeakPic.webp";
import SoriyaPic from "../assets/images/SoriyaPic.jpg";
import VanPic from "../assets/images/LokBongPic.png";
import SaveunPic from "../assets/images/SavaunPic.png";
import LongfuPic from "../assets/images/LongfuPic.jpg";
import ReachPic from "../assets/images/ReachPic.webp";
import TeviPic from "../assets/images/TeviPic.webp";
import abtus_background from "../assets/images/abtus_background.png";

const mentors = [
  { name: "Kim Chansopheng", role: "Mentor", photo: CherPhengPic },
  { name: "Srorng Sokcheat", role: "Mentor", photo: CherCheatPic },
];

const team = [
  { name: "Houng Mingyeak", role: "Leader", photo: YeakPic },
  { name: "Yin Soriya", role: "Sub-Leader", photo: SoriyaPic },
  { name: "Vin Van", role: "Member", photo: VanPic },
  { name: "Chhorn Saveun", role: "Member", photo: SaveunPic },
  { name: "Lim Longfou", role: "Member", photo: LongfuPic },
  { name: "Ches Sovanreach", role: "Member", photo: ReachPic },
  { name: "Chamreun Molikatevy", role: "Member", photo: TeviPic },
];

const palette = [
  "#4A7CFF",
  "#6C5CE7",
  "#00B894",
  "#E17055",
  "#0984E3",
  "#FDCB6E",
];

function Avatar({ name, size = 150, photo }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const color = palette[name.charCodeAt(0) % palette.length];

  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          objectPosition: "center top",
        }}
        className="block"
        onError={(e) => {
          e.target.style.display = "none";
          e.target.nextSibling.style.display = "flex";
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: `${color}22`,
      }}
      className="flex items-center justify-center font-bold"
    >
      {initials}
    </div>
  );
}

function MemberCard({ name, role, photo }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const color = palette[name.charCodeAt(0) % palette.length];

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-10 py-12 flex flex-col items-center w-80">
      <div className="rounded-full p-1 mb-6 bg-gradient-to-br from-[#4A7CFF] to-[#1a3fcc]">
        <div className="rounded-full overflow-hidden w-55 h-55 flex items-center justify-center bg-white dark:bg-gray-800">
          {photo ? (
            <>
              <img
                src={photo}
                alt={name}
                className="w-55 h-55 rounded-full object-cover object-top block"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div
                style={{ backgroundColor: `${color}22`, color, fontSize: 66 }}
                className="w-55 h-55 rounded-full hidden items-center justify-center font-bold"
              >
                {initials}
              </div>
            </>
          ) : (
            <Avatar name={name} size={220} />
          )}
        </div>
      </div>
      <p className="text-xl font-bold text-gray-900 dark:text-white mb-1.5">
        {name}
      </p>
      <p className="text-base text-gray-500 dark:text-gray-400 mb-6">{role}</p>
      <div className="flex gap-6">
        <button
          className="text-gray-900 dark:text-gray-300 hover:text-[#4A7CFF] dark:hover:text-[#4A7CFF] transition-colors p-0 flex items-center"
          title="Facebook"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
          </svg>
        </button>
        <button
          className="text-gray-900 dark:text-gray-300 hover:text-[#4A7CFF] dark:hover:text-[#4A7CFF] transition-colors p-0 flex items-center"
          title="Telegram"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
          </svg>
        </button>
        <button
          className="text-gray-900 dark:text-gray-300 hover:text-[#4A7CFF] dark:hover:text-[#4A7CFF] transition-colors p-0 flex items-center"
          title="GitHub"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="font-sans bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white min-h-screen transition-colors duration-300">
      <SEO title="About Us" description="Learn more about MindStack, a gamified knowledge-sharing developers support platform." />
      {/* HERO */}

      <div className="relative h-screen overflow-hidden">
        <div className="relative h-full">
          <div className="w-full h-full">
            <img
              src={abtus_background}
              alt="Developers collaborating"
              className="w-full h-full object-cover opacity-7"
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4 sm:px-6 md:px-8 w-full">
              <h2 className="font-extrabold text-black dark:text-white leading-tight">
                <div className="text-[24px] sm:text-[40px] md:text-[56px] lg:text-[72px] whitespace-nowrap">
                  Ask Answer Collaborate Grow
                </div>
                <div className="text-[22px] sm:text-[34px] md:text-[50px] lg:text-[72px] whitespace-nowrap bg-[linear-gradient(90deg,rgba(60,131,246,1)_0%,rgba(245,159,10,1)_91%)] bg-clip-text text-transparent">
                  Built by learners, for learners
                </div>
              </h2>

              <p className="text-[13px] sm:text-[15px] md:text-[17px] lg:text-[20px] text-slate-600 dark:text-gray-400 mt-3 sm:mt-4 md:mt-6 max-w-xs sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto">
                our community-driven forum encourages open discussion, knowledge
                sharing, and continuous improvement in the world of technology.
              </p>

              <div className="flex gap-3 sm:gap-4 flex-wrap justify-center items-center mb-6 sm:mb-8 md:mb-10 lg:mb-12 mt-4 sm:mt-6 md:mt-8">
                <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 sm:px-7 md:px-8 py-2 sm:py-3 rounded-2xl font-semibold hover:bg-blue-700 transition text-sm sm:text-base">
                  <a href="/questions" className="flex items-center gap-2">
                    Start for free
                    <FaArrowRight className="mt-0.5 sm:mt-1" />
                  </a>
                </div>
                <div className="inline-flex items-center gap-2 border border-gray-200 dark:border-gray-700 text-black dark:text-white px-5 sm:px-7 md:px-8 py-2 sm:py-3 rounded-2xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm sm:text-base">
                  <a href="#" className="flex items-center gap-2">
                    See how it works
                    <FaAngleRight className="mt-0.5 sm:mt-1" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purpose */}
      <div className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 max-w-6xl mx-auto text-center">
        <h2 className="text-[clamp(24px,3.5vw,44px)] font-bold tracking-tight mb-3 text-gray-900 dark:text-white">
          Our Purpose
        </h2>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed mb-8 sm:mb-10 md:mb-12 lg:mb-13">
          To share knowledge and resources that help learners and developers
          improve their skills.
        </p>
        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-16 gap-y-6 sm:gap-y-8 text-left w-full max-w-[1100px]">
            {/* Mission Card */}
            <div className="bg-slate-50 dark:bg-gray-950 w-full md:w-[380px] lg:w-[520px] min-h-[220px] md:min-h-[250px] lg:h-[275px] p-5 sm:p-6 md:p-8 rounded-xl border border-slate-200 dark:border-gray-700 flex flex-col mx-auto">
              <div className="flex items-center justify-center bg-blue-100 dark:bg-blue-900 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl mb-3 sm:mb-4">
                <RiShieldLine className="text-blue-600 dark:text-blue-400 text-[20px] sm:text-[25px]" />
              </div>
              <h3 className="text-[16px] sm:text-[18px] font-semibold text-slate-900 dark:text-white mb-2 sm:mb-3">
                Mission
              </h3>
              <p className="text-slate-600 dark:text-gray-400 text-[13px] sm:text-[14px] md:text-[15px] leading-relaxed">
                To build an interactive, inclusive, and user-friendly forum
                where individuals can freely exchange ideas, ask questions, and
                share valuable knowledge. We aim to create a supportive
                environment that encourages collaboration, critical thinking.
              </p>
            </div>

            {/* Vision Card */}
            <div className="bg-slate-50 dark:bg-gray-950 w-full md:w-[380px] lg:w-[520px] min-h-[220px] md:min-h-[250px] lg:h-[275px] p-5 sm:p-6 md:p-8 rounded-xl border border-slate-200 dark:border-gray-700 flex flex-col mx-auto">
              <div className="flex items-center justify-center bg-blue-100 dark:bg-blue-900 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl mb-3 sm:mb-4">
                <CgMediaLive className="text-blue-600 dark:text-blue-400 text-[24px] sm:text-[30px]" />
              </div>
              <h3 className="text-[16px] sm:text-[18px] font-semibold text-slate-900 dark:text-white mb-2 sm:mb-3">
                Vision
              </h3>
              <p className="text-slate-600 dark:text-gray-400 text-[13px] sm:text-[14px] md:text-[15px] leading-relaxed">
                To become a leading and trusted knowledge-sharing platform that
                inspires innovation, continuous learning, and meaningful
                collaboration worldwide. We envision a global community where
                knowledge is accessible to everyone.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="bg-blue-50/50 dark:bg-gray-950 py-14 sm:py-16 md:py-20 px-4 sm:px-6 pb-16 sm:pb-20 md:pb-25">
        <div className="max-w-7xl mx-auto text-center">
          <p className="flex items-center justify-center gap-2 text-xs font-semibold tracking-wider text-black dark:text-white mb-2.5">
            <FiUsers className="text-sm" />
            Lead by Developers
          </p>
          <h2 className="text-[clamp(20px,3vw,36px)] font-bold tracking-tight mb-6 sm:mb-8 md:mb-9 text-gray-900 dark:text-white">
            Our Mentors
          </h2>
          <div className="flex justify-center gap-4 sm:gap-6 flex-wrap mb-10 sm:mb-12 md:mb-15">
            {mentors.map((m) => (
              <MemberCard key={m.name} {...m} />
            ))}
          </div>
          <h2 className="text-[clamp(20px,3vw,36px)] font-bold tracking-tight mb-6 sm:mb-8 md:mb-9 text-gray-900 dark:text-white">
            Our Team
          </h2>
          <div className="flex justify-center gap-4 sm:gap-6 flex-wrap mb-4 sm:mb-6">
            {team.slice(0, 2).map((m) => (
              <MemberCard key={m.name} {...m} />
            ))}
          </div>
          <div className="flex justify-center gap-4 sm:gap-6 flex-wrap mb-4 sm:mb-6">
            {team.slice(2, 5).map((m) => (
              <MemberCard key={m.name} {...m} />
            ))}
          </div>
          <div className="flex justify-center gap-4 sm:gap-6 flex-wrap">
            {team.slice(5).map((m) => (
              <MemberCard key={m.name} {...m} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
