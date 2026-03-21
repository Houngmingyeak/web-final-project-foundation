import React from "react";
import Img from "../assets/istad.png";
import { CiFacebook, CiLinkedin } from "react-icons/ci";
import { PiTelegramLogo } from "react-icons/pi";
import { CgMail } from "react-icons/cg";
import imgMindStack from "../assets/mindstack.png";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-950  text-gray-900 dark:text-gray-200 py-12 px-6 md:px-12 lg:px-20 transition-colors duration-300 border-t border-gray-100 dark:border-gray-900">
      <div className="max-w-[1400px] mx-auto">
        
        {/* TOP SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-4 items-start pb-10">
          
          {/* Column 1: Sponsored */}
          <div className="flex flex-col items-center text-center space-y-4">
            <h3 className="text-xl font-bold">Sponsored and Organized by</h3>
            <img
              src={Img}
              alt="iSTAD Logo"
              className="w-52 h-auto object-contain"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-tight">
              Institute of Science and Technology <br /> Advance Development
            </p>
          </div>

          {/* Column 2: About Us */}
          <div className="flex flex-col items-center text-center space-y-4">
            <h3 className="text-blue-500 dark:text-blue-400 text-2xl font-bold">About us</h3>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 font-medium">
              {["Blog", "Careers", "Contact", "Press", "Follow Us"].map((item) => (
                <li key={item} className="hover:text-blue-500 cursor-pointer transition">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Get in touch */}
          <div className="flex flex-col items-center text-center space-y-5">
            <h3 className="text-xl font-bold">Get in touch with us</h3>
            <div className="flex gap-6">
              <CiFacebook className="text-3xl hover:text-blue-500 transition cursor-pointer" />
              <PiTelegramLogo className="text-3xl hover:text-blue-500 transition cursor-pointer" />
              <CgMail className="text-3xl hover:text-blue-500 transition cursor-pointer" />
              <CiLinkedin className="text-3xl hover:text-blue-500 transition cursor-pointer" />
            </div>
            <div className="w-full max-w-[280px] space-y-3">
              <input
                type="text"
                placeholder="write your message here ......."
                className="w-full px-4 py-2 rounded-xl border border-blue-400 dark:bg-gray-800 outline-none text-sm italic text-gray-400"
              />
              <p className="text-xs text-gray-500 leading-relaxed">
                Write your message here to get in touch <br /> give recommendation our website
              </p>
            </div>
          </div>

          {/* Column 4: Development By */}
          <div className="flex flex-col items-center text-center space-y-2">
            <h3 className="text-xl font-bold">Development by</h3>
            <img
              src={imgMindStack}
              alt="MindStack Logo"
              className="w-32 h-auto object-contain"
            />
            <p className="font-bold text-xl">MindStack</p>
          </div>
        </div>

        {/* HORIZONTAL LINE */}
        <div className="border-t border-gray-300 dark:border-gray-700 w-full mb-6"></div>

        {/* BOTTOM SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm gap-4">
          <div className="text-gray-700 dark:text-gray-400 font-medium">
            @2026 Copy right by MindStack
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-blue-500 font-medium">
            <a href="#" className="hover:underline">Term of Service</a>
            <a href="#" className="hover:underline">Cookies Settings</a>
            <a href="#" className="hover:underline">Privacy Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;