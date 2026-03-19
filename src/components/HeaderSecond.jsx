import React from "react";
import MindStack from "../assets/mindstack.png";
import { GoSun } from "react-icons/go";
import { Link } from "react-router-dom";
import { IoIosSearch } from "react-icons/io";

export default function HeaderSecond() {
  return (
    <header className="w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-3 px-6 md:px-16">
        {/* Logo Section */}
        <Link to="/">
        <div className="flex items-center space-x-2">
          <img src={MindStack} alt="" className="w-8 h-8" />
          <p className="text-xl font-bold text-gray-900">MindStack</p>
        </div>
        </Link>

        {/* Search Bar Section */}
        {/* <form className="w-lg h-10 ">
          <div className="relative">
            <IoIosSearch />
            <input
              type="search"
              id="search"
              className="block w-full p-2 mt-1 ps-9 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-2xl focus:ring-brand focus:border-brand shadow-xs placeholder:text-body "
              placeholder="Search here ..."
            />
          </div>
        </form> */}
        <form className="flex items-center">
          <div className="relative group">
            {/* The Icon (Always visible) */}
            <div className="absolute inset-y-0 left-0 flex items-center ps-3">
              <IoIosSearch className="w-5 h-5 text-gray-500" />
            </div>

            {/* The Input: Hidden by default on mobile, expands/shows on desktop */}
            <input
              type="search"
              className="block w-10 md:w-full p-2 ps-10 transition-all duration-300 bg-neutral-secondary-medium border border-default-medium text-sm rounded-2xl focus:w-64 md:focus:w-full focus:ring-brand"
              placeholder="Search..."
            />
          </div>
        </form>
        {/* Action Buttons Section */}
        <div className="flex items-center space-y-0 space-x-4">
          {/* Theme Toggle Button */}
          <button className="p-2 bg-gray-50 text-gray-600 rounded-xl border border-gray-200 hover:bg-gray-100 transition">
            <GoSun />
          </button>

          {/* Ask Questions Button */}
          <button className="hidden lg:flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-sm">
            <span>Ask Question</span>
          </button>
          <button className="bg-gray-200 w-9 h-9 rounded-2xl ">
            <span className="text-center">AC</span>
          </button>
        </div>
      </div>
    </header>
  );
}
