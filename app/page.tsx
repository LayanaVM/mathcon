"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import eventData from "@/data/event.json";
import aboutData from "@/data/about.json";
import topicsData from "@/data/topics.json";
import contactData from "@/data/contact.json";
import LatticeOrb from "@/components/LatticeOrb";
import ProfileCard from "@/components/ProfileCard";

export default function Home() {
  const organizersSectionRef = useRef<HTMLElement>(null);
  const cardsTrackRef = useRef<HTMLDivElement>(null);
  const [translateX, setTranslateX] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!organizersSectionRef.current || !cardsTrackRef.current) return;
      const section = organizersSectionRef.current;
      const track = cardsTrackRef.current;
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const scrollableDistance = section.offsetHeight - windowHeight;

      if (scrollableDistance <= 0) return;

      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollableDistance));

      const maxScroll = Math.max(0, track.scrollWidth - window.innerWidth + 96);
      setTranslateX(progress * maxScroll);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const scrollStep = (direction: "left" | "right") => {
    if (!organizersSectionRef.current) return;
    const section = organizersSectionRef.current;
    const windowHeight = window.innerHeight;
    const scrollableDistance = section.offsetHeight - windowHeight;
    const delta = direction === "right" ? scrollableDistance / 3 : -scrollableDistance / 3;
    window.scrollBy({ top: delta, behavior: "smooth" });
  };

  // About IWCMPQC section from data/about.json
  const iwcmpqcAbout = aboutData.sections.find((s) => s.id === "iwcmpqc");

  // Institutional sections from data/about.json (excluding the general about section)
  const organizerSections = aboutData.sections.filter((s) => s.id !== "iwcmpqc");

  const griOrg = eventData.organizers.find((o) => o.id === "gri") || eventData.organizers[0];
  const cusatOrg = eventData.organizers.find((o) => o.id === "cusat") || eventData.organizers[1];

  return (
    <div className="min-h-screen flex flex-col bg-black text-[#d4e5dc] selection:bg-[#3ddc84]/30 selection:text-white">
      {/* ========================================== */}
      {/* ========================================== */}
      {/* 0. TOP NAVIGATION (ATTACHED TO TOP, TRANSPARENT) */}
      {/* ========================================== */}
      <Navbar />

      {/* ========================================== */}
      {/* 1. HERO SECTION                            */}
      {/* ========================================== */}
      <section className="relative lattice-pattern text-brand-cream overflow-hidden pt-28 sm:pt-32 lg:pt-36 pb-36 sm:pb-32 lg:pb-32 border-b border-[#3ddc84]/15 min-h-[96vh] flex items-center justify-center" id="hero">
        {/* Lattice Orb 3D WebGL Visualization */}
        <LatticeOrb />

        {/* Deep contrast dark vignette / gradient overlay to keep background dark pure black and typography legible */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 pointer-events-none z-[1]" aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" id="hero-container">
          <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
            {/* Main Title - Center Aligned */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4 leading-[1.15] text-center max-w-4xl">
              {eventData.title}
            </h1>

            {/* Date below Main Heading as h2 */}
            <h2 className="text-lg sm:text-2xl font-mono text-brand-accent tracking-wider mb-10 sm:mb-12 text-center font-medium">
              {eventData.dates.display}
            </h2>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="#topics"
                className="bg-brand-accent text-black font-bold hover:bg-[#4ade80] active:scale-95 text-sm px-6 py-3.5 rounded-lg transition-all shadow-md flex items-center gap-2"
              >
                <span>Explore {topicsData.topics.length} Conference Tracks</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </a>
              <a
                href="#about"
                className="bg-transparent hover:bg-[#3ddc84]/10 text-white border border-[#3ddc84]/40 hover:border-[#3ddc84] px-6 py-3.5 rounded-lg text-sm font-medium transition-all"
              >
                Read Event Scope & Rationale
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 2. ABOUT IWCMPQC                           */}
      {/* ========================================== */}
      <section className="py-20 bg-black border-b border-[#3ddc84]/15 scroll-mt-24" id="about">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              {iwcmpqcAbout?.title || "About IWCMPQC 2027"}
            </h2>
          </div>

          <div className="text-[#d4e5dc] leading-relaxed space-y-6 text-base sm:text-lg" id="about-intro-paragraphs">
            {iwcmpqcAbout?.paragraphs.map((p, idx) => (
              <p key={idx} className="leading-relaxed text-[#d4e5dc]/90">
                {p}
              </p>
            ))}
          </div>

          {/* Joint Institutional Collaboration (GRI × CUSAT) */}
          <div className="mt-12 pt-8 border-t border-[#3ddc84]/15" id="about-joint-institutions">
            <div className="text-center mb-4">
              <span className="text-xs font-mono uppercase tracking-widest text-[#3ddc84] font-semibold">
                Joint Organizing Institutions & Academic Partners
              </span>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 lg:gap-12 w-full">
              {/* Org 1: GRI */}
              <div className="flex-1 text-center md:text-right">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug mb-1">
                  {griOrg.institution}
                </h3>
                <p className="text-xs sm:text-sm text-[#a2c4b5] font-sans leading-relaxed">
                  {griOrg.department}
                </p>
              </div>

              {/* Big '×' in between */}
              <div
                className="shrink-0 flex items-center justify-center text-brand-accent font-serif font-light text-3xl sm:text-4xl lg:text-5xl select-none leading-none opacity-80 py-1"
                aria-label="collaborates with"
              >
                ×
              </div>

              {/* Org 2: CUSAT */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug mb-1">
                  {cusatOrg.institution}
                </h3>
                <p className="text-xs sm:text-sm text-[#a2c4b5] font-sans leading-relaxed">
                  {cusatOrg.department}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 3. ORGANIZING INSTITUTIONS (SCROLL PINNED) */}
      {/* ========================================== */}
      <section
        ref={organizersSectionRef}
        className="relative bg-black border-b border-[#3ddc84]/15 min-h-[300vh] scroll-mt-24"
        id="organizers"
      >
        <div className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden bg-black z-20 px-4 sm:px-8 lg:px-16 pt-24 pb-8">
          {/* Header Row with Title & Scroll Progress Indicator */}
          <div className="max-w-7xl mx-auto w-full mb-6 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#3ddc84]/20">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                  Organizing Institutions & Centres
                </h2>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollStep("left")}
                  aria-label="Previous card"
                  className="w-9 h-9 rounded-lg bg-[#0a0f0d] border border-[#3ddc84]/30 text-[#3ddc84] hover:bg-[#3ddc84] hover:text-black transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => scrollStep("right")}
                  aria-label="Next card"
                  className="w-9 h-9 rounded-lg bg-[#0a0f0d] border border-[#3ddc84]/30 text-[#3ddc84] hover:bg-[#3ddc84] hover:text-black transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Horizontal Track of 4 Cards */}
          <div className="w-full overflow-hidden">
            <div
              ref={cardsTrackRef}
              className="flex gap-6 will-change-transform py-3 items-stretch"
              style={{
                transform: `translateX(-${translateX}px)`,
                transition: "transform 0.08s ease-out",
              }}
            >
              {organizerSections.map((section) => {
                const logoSrc =
                  section.id === "gri" || section.id === "cmmqc"
                    ? `/${griOrg.logo}`
                    : `/${cusatOrg.logo}`;

                return (
                  <div
                    key={section.id}
                    className="w-[320px] sm:w-[480px] lg:w-[540px] shrink-0 bg-[#0a0f0d] rounded-2xl border border-[#3ddc84]/25 p-6 sm:p-8 shadow-2xl flex flex-col justify-start group relative overflow-hidden"
                  >
                    {/* Corner ambient glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#3ddc84]/10 rounded-bl-full pointer-events-none group-hover:bg-[#3ddc84]/20 transition-all" />

                    <div className="relative z-10">
                      {/* Logo and Title */}
                      <div className="flex items-start gap-4 mb-5">
                        <div className="w-14 h-14 shrink-0 bg-white/95 rounded-lg border border-white/20 p-1.5 flex items-center justify-center overflow-hidden shadow-inner">
                          <Image
                            src={logoSrc}
                            alt={`${section.title} Logo`}
                            width={56}
                            height={56}
                            className="max-h-11 max-w-full object-contain"
                          />
                        </div>
                        <div>
                          <h3 className="font-serif text-xl sm:text-2xl font-bold text-white group-hover:text-[#3ddc84] transition-colors leading-snug">
                            {section.title}
                          </h3>
                        </div>
                      </div>

                      {/* Paragraphs directly from about.json */}
                      <div className="space-y-3.5 text-[#d4e5dc] text-xs sm:text-sm leading-relaxed">
                        {section.paragraphs.map((p, pIdx) => (
                          <p key={pIdx}>{p}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 4. TOPICS TO BE COVERED                    */}
      {/* ========================================== */}
      <section className="py-20 bg-black border-b border-[#3ddc84]/15 relative scroll-mt-24" id="topics">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              {topicsData.title}
            </h2>
            <p className="text-[#a2c4b5] text-base sm:text-lg">
              The {topicsData.topics.length} core focus tracks spanning theoretical mathematical formulations, NIST standards, cryptanalysis, and hardware implementations in post-quantum ecosystems.
            </p>
          </div>

          {/* Topics Grid Container */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center" id="topics-grid">
            {topicsData.topics.map((t) => (
              <ProfileCard
                key={t.id}
                name={t.name}
                avatarUrl={`/assets/topics/topic-${t.id}.svg?v=2`}
                tiltStrength={10}
                radius={16}
                enableTilt={true}
                theme="dark"
                backdropColor="#0a0f0d"
                className="w-full"
              />
            ))}
          </div>

          {/* Call for Papers Banner Box */}
          <div className="mt-14 rounded-2xl bg-[#0a0f0d] text-white p-8 sm:p-10 relative overflow-hidden border border-[#3ddc84]/25 shadow-2xl">
            <div className="absolute -right-10 -bottom-10 opacity-15 font-serif text-8xl italic text-[#3ddc84] pointer-events-none select-none" aria-hidden="true">
              LWE
            </div>
            <div className="relative z-10 max-w-2xl">
              <span className="text-xs font-mono uppercase tracking-widest text-[#3ddc84] font-semibold block mb-2">
                CALL FOR PAPERS & RESEARCH POSTERS
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-3">
                Proofs and Patterns in Quantum-Safe Cryptography
              </h3>
              <p className="text-[#d4e5dc] text-sm sm:text-base leading-relaxed mb-6">
                Original research manuscripts, review papers, and technical implementation blueprints in any of the {topicsData.topics.length} conference tracks are invited for peer-reviewed presentation and proceedings.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  className="bg-brand-accent text-black font-bold hover:bg-[#4ade80] active:scale-95 text-sm px-6 py-3 rounded-lg transition-all shadow-md inline-flex items-center gap-2"
                  href="/register"
                >
                  <span>Submit Abstract / Register Online</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 5. CONTACT & CONVENERS                     */}
      {/* ========================================== */}
      <section className="py-20 bg-black border-b border-[#3ddc84]/15 scroll-mt-24" id="contact">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              {contactData.title || "Contact Details"}
            </h2>
            <p className="text-[#a2c4b5] text-base sm:text-lg">
              For registrations, paper submissions, accommodation inquiries, and partnerships, reach out directly to the event convener.
            </p>
          </div>

          {/* Contact Details (Clean & Unboxed) */}
          <div className="max-w-2xl mx-auto text-center" id="contact-cards-container">
            {contactData.contacts.map((c) => (
              <div key={c.name} className="flex flex-col items-center">
                <span className="text-xs font-mono uppercase tracking-widest text-[#3ddc84] font-semibold block mb-2">
                  {c.role}
                </span>
                <h3 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-2">
                  {c.name}
                </h3>
                <p className="text-base font-semibold text-[#3ddc84] mb-1">{c.designation}</p>
                <p className="text-sm text-[#a2c4b5] leading-relaxed mb-8">
                  {c.department} · <span className="font-medium text-white">{c.institution}</span>
                </p>

                {/* Clickable tel and mailto links */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 pt-6 border-t border-[#3ddc84]/20 text-sm w-full">
                  <a
                    href={`tel:${c.phone.replace(/[^0-9+]/g, "")}`}
                    className="flex items-center gap-3 text-[#3ddc84] hover:text-white font-mono transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#0a0f0d] border border-[#3ddc84]/30 flex items-center justify-center text-[#3ddc84] group-hover:bg-[#3ddc84] group-hover:text-black transition-all shadow-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                    <span className="text-base font-medium">{c.phone}</span>
                  </a>

                  <a
                    href={`mailto:${c.email}`}
                    className="flex items-center gap-3 text-[#3ddc84] hover:text-white font-mono transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#0a0f0d] border border-[#3ddc84]/30 flex items-center justify-center text-[#3ddc84] group-hover:bg-[#3ddc84] group-hover:text-black transition-all shadow-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                    <span className="text-base font-medium break-all">{c.email}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 6. FOOTER                                  */}
      {/* ========================================== */}
      <Footer />
    </div>
  );
}
