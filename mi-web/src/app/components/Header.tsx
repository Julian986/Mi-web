"use client";

import React, { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-bl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="filter-sha flex items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md"></div>
              <span className="text-xl font-bold text-white">Julian Dev</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#skills" className="text-gray-300 hover:text-white transition-colors">
              Skills
            </a>
            <a href="#about" className="text-gray-300 hover:text-white transition-colors">
              About
            </a>
            <a href="#projects" className="text-gray-300 hover:text-white transition-colors">
              Projects
            </a>
            <a href="#contact" className="text-gray-300 hover:text-white transition-colors">
              Contact
            </a>
            <div className="relative group">
              <button className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1">
                <span>Pages</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            {/* Desktop buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                Hire Me
              </button>
              <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                Resume
              </button>
              <button className="text-gray-400 hover:text-white p-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="text-gray-400 hover:text-white p-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-gray-400 hover:text-white p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#skills" className="block px-3 py-2 text-gray-300 hover:text-white">
                Skills
              </a>
              <a href="#about" className="block px-3 py-2 text-gray-300 hover:text-white">
                About
              </a>
              <a href="#projects" className="block px-3 py-2 text-gray-300 hover:text-white">
                Projects
              </a>
              <a href="#contact" className="block px-3 py-2 text-gray-300 hover:text-white">
                Contact
              </a>
              <div className="px-3 py-2">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full mb-2">
                  Hire Me
                </button>
                <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg w-full">
                  Resume
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
