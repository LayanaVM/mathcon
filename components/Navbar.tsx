"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import eventData from "@/data/event.json";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isRegisterPage = pathname === "/register";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-black/90 backdrop-blur-md border-b border-[#3ddc84]/15 shadow-xl"
          : "bg-transparent"
      }`}
    >
      <div className="w-full px-5 sm:px-10 lg:px-16 xl:px-20 h-16 sm:h-20 lg:h-24 flex items-center justify-between">
        <Link
          className="flex items-center group focus:outline-none focus:ring-2 focus:ring-brand-accent rounded-lg p-1"
          href={isRegisterPage ? "/" : "/#hero"}
        >
          <span className="font-serif font-bold tracking-wide text-brand-cream text-lg sm:text-2xl block leading-none">
            {eventData.shortName}
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-8 xl:gap-10 text-base lg:text-lg font-medium">
          <Link
            className="text-brand-cream/90 hover:text-brand-accent px-3 py-2 rounded-md transition-colors"
            href={isRegisterPage ? "/" : "/#hero"}
          >
            Home
          </Link>
          <Link
            className="text-brand-cream/90 hover:text-brand-accent px-3 py-2 rounded-md transition-colors"
            href={isRegisterPage ? "/#about" : "#about"}
          >
            About
          </Link>
          <Link
            className="text-brand-cream/90 hover:text-brand-accent px-3 py-2 rounded-md transition-colors"
            href={isRegisterPage ? "/#topics" : "#topics"}
          >
            Topics
          </Link>
          <Link
            className="text-brand-cream/90 hover:text-brand-accent px-3 py-2 rounded-md transition-colors"
            href={isRegisterPage ? "/#contact" : "#contact"}
          >
            Contact
          </Link>
          <Link
            className={`ml-4 lg:ml-6 text-black font-bold active:scale-95 text-sm sm:text-base tracking-wider uppercase px-6 py-2.5 rounded-md transition-all shadow-md flex items-center gap-2 ${
              isRegisterPage
                ? "bg-[#3ddc84] ring-2 ring-[#3ddc84]/40 hover:bg-[#4ade80]"
                : "bg-brand-accent hover:bg-[#4ade80]"
            }`}
            href="/register"
          >
            <span>Register</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </Link>
        </nav>

        {/* Mobile Menu Toggle Button */}
        <button
          aria-label="Toggle Navigation Menu"
          className="md:hidden text-brand-cream hover:text-brand-accent p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand-accent"
          id="mobileMenuBtn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-forestDark/95 backdrop-blur-md border-b border-brand-sage/20 px-6 pt-3 pb-6 space-y-2 shadow-2xl" id="mobileMenu">
          <Link
            className="block text-brand-cream/90 hover:text-brand-accent text-base font-medium py-2 px-3 rounded hover:bg-brand-forest/60 transition-colors"
            href={isRegisterPage ? "/" : "/#hero"}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            className="block text-brand-cream/90 hover:text-brand-accent text-base font-medium py-2 px-3 rounded hover:bg-brand-forest/60 transition-colors"
            href={isRegisterPage ? "/#about" : "#about"}
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </Link>
          <Link
            className="block text-brand-cream/90 hover:text-brand-accent text-base font-medium py-2 px-3 rounded hover:bg-brand-forest/60 transition-colors"
            href={isRegisterPage ? "/#topics" : "#topics"}
            onClick={() => setMobileMenuOpen(false)}
          >
            Topics to Cover
          </Link>
          <Link
            className="block text-brand-cream/90 hover:text-brand-accent text-base font-medium py-2 px-3 rounded hover:bg-brand-forest/60 transition-colors"
            href={isRegisterPage ? "/#contact" : "#contact"}
            onClick={() => setMobileMenuOpen(false)}
          >
            Contact & Conveners
          </Link>
          <a
            className="flex items-center justify-between text-brand-cream/90 hover:text-brand-accent text-base font-medium py-2 px-3 rounded hover:bg-brand-forest/60 transition-colors"
            href="/assets/topics/mathcon.pdf"
            download="mathcon.pdf"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span>Download Brochure</span>
            <svg className="w-4 h-4 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </a>
          <Link
            className="block bg-brand-accent text-black font-bold text-center text-sm uppercase tracking-wider py-2.5 px-3 rounded mt-2"
            href="/register"
            onClick={() => setMobileMenuOpen(false)}
          >
            Register Online →
          </Link>
        </div>
      )}
    </header>
  );
}
