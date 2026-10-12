"use client";

import React, { useState } from "react";
import Image from "next/image";
import eventData from "@/data/event.json";
import aboutData from "@/data/about.json";
import topicsData from "@/data/topics.json";
import contactData from "@/data/contact.json";
import Threads from "@/components/Threads";

// Topic descriptions matching Stitch design system scope
const topicDescriptions: Record<number, string> = {
  1: "Abstract algebraic structures, finite fields, polynomial rings, group-based cryptography, and homomorphic frameworks for quantum-resilient cryptographic primitives.",
  2: "Euclidean lattice geometry, Shortest Vector Problem (SVP), Closest Vector Problem (CVP), multivariate quadratic systems, and supersingular elliptic curve isogenies.",
  3: "Spectral graph theory, matrix decompositions, eigenvalue analysis, and vector spaces applied to advanced quantum threat modeling and network vulnerability detection.",
  4: "Algebraic coding theory, Goppa codes, quasi-cyclic codes, rank-metric codes, and low-latency decoding algorithms resistant to quantum cryptanalysis.",
  5: "Hilbert and Banach spaces, operator algebras, and spectral theory for high-assurance anomaly detection, cryptographic telemetry, and secure signal analysis.",
  6: "Nonlinear dynamical systems, chaos theory, stability analysis, and feedback control architectures for cyber-physical security in mission-critical infrastructure.",
  7: "Differential equation frameworks, compartmental contagion modeling, and predictive propagation dynamics for cyber warfare defense and threat diffusion.",
  8: "Graph Laplacians, expander graphs, algebraic connectivity, and topological graphs for secure distributed consensus and quantum network routing.",
  9: "NP-hard combinatorial optimization, fuzzy relational equations, and heuristic search for cryptographic parameter tuning and side-channel resilience.",
  10: "Persistent homology, Simplicial complexes, and high-dimensional geometric data manifolds for post-quantum cryptographic protocol verification.",
  11: "Generalized extreme value distributions, heavy-tailed risk modeling, and tail-index estimators for catastrophic quantum cryptanalytic event forecasting.",
};

// Contextual badges for organizer tabs
const organizerBadges: Record<string, string> = {
  gri: "Deemed to be University · Tamil Nadu",
  cmmqc: "Host: Workshop (22–24 Feb)",
  cusat: "NAAC A+ Accredited · Kerala",
  "cusat-maths": "Host: Conference (25–27 Feb)",
};

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeOrganizerTab, setActiveOrganizerTab] = useState(0);

  // About IWCMPQC section from data/about.json
  const iwcmpqcAbout = aboutData.sections.find((s) => s.id === "iwcmpqc");

  // Institutional tabs from data/about.json (excluding the general about section)
  const organizerSections = aboutData.sections.filter((s) => s.id !== "iwcmpqc");
  const activeSection = organizerSections[activeOrganizerTab] || organizerSections[0];

  const griOrg = eventData.organizers.find((o) => o.id === "gri") || eventData.organizers[0];
  const cusatOrg = eventData.organizers.find((o) => o.id === "cusat") || eventData.organizers[1];

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream text-brand-ink selection:bg-brand-sage selection:text-brand-forest">
      {/* ========================================== */}
      {/* 0. STICKY TOP NAVIGATION                   */}
      {/* ========================================== */}
      <header className="sticky top-0 z-50 bg-brand-forest/95 nav-blur border-b border-brand-sage/20 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <a
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-brand-accent rounded-lg p-1"
            href="#hero"
          >
            <div className="w-10 h-10 rounded-md bg-brand-forestDark border border-brand-sage/40 flex items-center justify-center text-brand-accent font-serif font-bold text-xl shadow-inner group-hover:border-brand-accent transition-colors">
              Ψ
            </div>
            <div>
              <span className="font-serif font-bold tracking-wide text-brand-cream text-lg block leading-none">
                {eventData.shortName}
              </span>
              <span className="text-[11px] text-brand-sage tracking-widest font-mono uppercase">
                {eventData.dates.display}
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium">
            <a
              className="text-brand-cream/80 hover:text-brand-accent px-3 py-2 rounded-md transition-colors"
              href="#hero"
            >
              Home
            </a>
            <a
              className="text-brand-cream/80 hover:text-brand-accent px-3 py-2 rounded-md transition-colors"
              href="#about"
            >
              About
            </a>
            <a
              className="text-brand-cream/80 hover:text-brand-accent px-3 py-2 rounded-md transition-colors"
              href="#organizers"
            >
              Organizers
            </a>
            <a
              className="text-brand-cream/80 hover:text-brand-accent px-3 py-2 rounded-md transition-colors"
              href="#topics"
            >
              Topics
            </a>
            <a
              className="text-brand-cream/80 hover:text-brand-accent px-3 py-2 rounded-md transition-colors"
              href="#contact"
            >
              Contact
            </a>
            <a
              className="ml-4 bg-brand-accent text-brand-forestDark hover:bg-[#f0b58e] active:scale-95 font-semibold text-xs tracking-wider uppercase px-4 py-2.5 rounded-md transition-all shadow-sm flex items-center gap-1.5"
              href="#contact"
            >
              <span>Inquire / Register</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </a>
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
          <div className="md:hidden bg-brand-forestDark border-b border-brand-sage/20 px-4 pt-2 pb-6 space-y-2" id="mobileMenu">
            <a
              className="block text-brand-cream/90 hover:text-brand-accent py-2 px-3 rounded hover:bg-brand-forest"
              href="#hero"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </a>
            <a
              className="block text-brand-cream/90 hover:text-brand-accent py-2 px-3 rounded hover:bg-brand-forest"
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </a>
            <a
              className="block text-brand-cream/90 hover:text-brand-accent py-2 px-3 rounded hover:bg-brand-forest"
              href="#organizers"
              onClick={() => setMobileMenuOpen(false)}
            >
              Organizers
            </a>
            <a
              className="block text-brand-cream/90 hover:text-brand-accent py-2 px-3 rounded hover:bg-brand-forest"
              href="#topics"
              onClick={() => setMobileMenuOpen(false)}
            >
              Topics to Cover
            </a>
            <a
              className="block text-brand-cream/90 hover:text-brand-accent py-2 px-3 rounded hover:bg-brand-forest"
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact & Conveners
            </a>
          </div>
        )}
      </header>

      {/* ========================================== */}
      {/* 1. HERO SECTION                            */}
      {/* ========================================== */}
      <section className="relative lattice-pattern text-brand-cream overflow-hidden py-16 lg:py-24 border-b border-brand-forestLight/60" id="hero">
        {/* Dynamic Wave Threads Background from React Bits */}
        <div className="absolute inset-0 z-0 opacity-70 pointer-events-none" aria-hidden="true">
          <Threads
            color="#8FBFA8"
            accentColor="#E8A87C"
            lineCount={90}
            thickness={0.6}
            softness={1.3}
            amplitude={1.7}
            distance={0.4}
            waves={1.05}
            speed={0.6}
            split={0.04}
            fray={0.5}
            angle={25}
            taper={0.6}
            brightness={1.4}
            parting={0}
            enableMouseInteraction={true}
            fade={0.2}
            opacity={0.85}
          />
        </div>

        {/* Cryptographic Mathematical Decorative Background Chalk Elements */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-[1]" aria-hidden="true">
          <div className="chalk-formula text-3xl lg:text-5xl top-8 right-12 absolute opacity-40">
            ∫ f(x) dx
          </div>
          <div className="chalk-formula text-4xl lg:text-6xl bottom-16 right-20 absolute opacity-50">
            e^{"{"}iπ{"}"} + 1 = 0
          </div>
          <div className="chalk-formula text-2xl lg:text-3xl top-1/2 left-8 -translate-y-1/2 absolute opacity-30 font-mono">
            Λ = {"{"} Σ v_i z_i | z_i ∈ ℤ {"}"}
          </div>
          <div className="chalk-formula text-3xl bottom-8 left-1/4 absolute opacity-25">
            SVP_γ(L) ⊆ LWE_{"{"}n,q,χ{"}"}
          </div>
          <svg className="absolute -right-20 -bottom-20 w-96 h-96 text-brand-sage/10" fill="currentColor" viewBox="0 0 200 200">
            <polygon fill="none" points="100,10 190,60 190,160 100,190 10,160 10,60" stroke="currentColor" strokeDasharray="4,4" strokeWidth="1.5" />
            <line stroke="currentColor" strokeWidth="1" x1="100" x2="100" y1="10" y2="190" />
            <line stroke="currentColor" strokeWidth="1" x1="10" x2="190" y1="60" y2="160" />
            <line stroke="currentColor" strokeWidth="1" x1="10" x2="190" y1="160" y2="60" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" id="hero-container">
          <div className="max-w-4xl">
            {/* Event Badge with Accent Highlight */}
            <div className="inline-flex items-center gap-3 bg-brand-forestDark/80 border border-brand-sage/40 px-3.5 py-1.5 rounded-full mb-6 text-xs sm:text-sm font-mono tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-accent animate-ping" />
              <span className="text-brand-accent font-bold">{eventData.shortName}</span>
              <span className="text-brand-sage">|</span>
              <span className="text-brand-cream/90 font-medium">{eventData.dates.display}</span>
            </div>

            {/* Main Title */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.15]">
              {eventData.title}
            </h1>

            {/* Tagline */}
            <p className="text-base sm:text-xl text-brand-cream/80 max-w-3xl mb-10 leading-relaxed font-sans font-light">
              Bridging Hard Mathematical Formulations, Lattice-Based Proofs, and Resilient Quantum-Era Cybersecurity
            </p>

            {/* Dual Institutional Collaboration Badges with Logos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              {/* Org 1: GRI */}
              <div className="bg-brand-forestDark/85 border border-brand-sage/30 rounded-xl p-4 flex items-center gap-4 hover:border-brand-sage transition-all">
                <div className="w-14 h-14 shrink-0 rounded-lg bg-white/10 border border-brand-sage/20 flex items-center justify-center p-1.5 overflow-hidden">
                  <Image
                    src={`/${griOrg.logo}`}
                    alt="GRI Logo"
                    width={56}
                    height={56}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-wider text-brand-accent uppercase block">
                    {griOrg.type} ({griOrg.dates.display})
                  </span>
                  <div className="font-semibold text-white text-sm line-clamp-1">{griOrg.department}</div>
                  <div className="text-xs text-brand-sage/90">{griOrg.institution}</div>
                </div>
              </div>

              {/* Org 2: CUSAT */}
              <div className="bg-brand-forestDark/85 border border-brand-sage/30 rounded-xl p-4 flex items-center gap-4 hover:border-brand-sage transition-all">
                <div className="w-14 h-14 shrink-0 rounded-lg bg-white/10 border border-brand-sage/20 flex items-center justify-center p-1.5 overflow-hidden">
                  <Image
                    src={`/${cusatOrg.logo}`}
                    alt="CUSAT Logo"
                    width={56}
                    height={56}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-wider text-brand-accent uppercase block">
                    {cusatOrg.type} ({cusatOrg.dates.display})
                  </span>
                  <div className="font-semibold text-white text-sm line-clamp-1">{cusatOrg.department}</div>
                  <div className="text-xs text-brand-sage/90">{cusatOrg.institution}</div>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#topics"
                className="bg-brand-accent text-brand-forestDark hover:bg-[#f0b58e] active:scale-95 font-semibold text-sm px-6 py-3.5 rounded-lg transition-all shadow-md flex items-center gap-2"
              >
                <span>Explore {topicsData.topics.length} Conference Tracks</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </a>
              <a
                href="#about"
                className="bg-transparent hover:bg-brand-forestLight/60 text-brand-cream border border-brand-sage/40 hover:border-brand-sage px-6 py-3.5 rounded-lg text-sm font-medium transition-all"
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
      <section className="py-20 bg-brand-cream border-b border-brand-border" id="about">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-[2px] bg-brand-accent" />
            <span className="text-xs uppercase font-mono tracking-widest text-brand-forest font-semibold">
              Event Overview
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-forest mb-8 leading-tight">
            {iwcmpqcAbout?.title || "About IWCMPQC 2027"}
          </h2>

          <div className="prose prose-lg text-brand-ink/90 leading-relaxed space-y-6 text-base sm:text-lg" id="about-intro-paragraphs">
            {iwcmpqcAbout?.paragraphs.map((p, idx) => (
              <p key={idx} className="leading-relaxed text-brand-ink/85">
                {p}
              </p>
            ))}
          </div>

          {/* Quick Highlights Bar */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-brand-border/70">
            <div className="bg-white/80 p-5 rounded-lg border border-brand-border shadow-xs">
              <div className="text-xs font-mono uppercase text-brand-inkMuted mb-1">
                Part 1: International Workshop
              </div>
              <div className="font-serif text-xl font-bold text-brand-forest">
                {griOrg.dates.display}
              </div>
              <div className="text-sm text-brand-inkMuted mt-1">
                Foundational Mathematical Frameworks & Hands-on Quantum Labs ({griOrg.location})
              </div>
            </div>

            <div className="bg-white/80 p-5 rounded-lg border border-brand-border shadow-xs">
              <div className="text-xs font-mono uppercase text-brand-inkMuted mb-1">
                Part 2: International Conference
              </div>
              <div className="font-serif text-xl font-bold text-brand-forest">
                {cusatOrg.dates.display}
              </div>
              <div className="text-sm text-brand-inkMuted mt-1">
                Peer-Reviewed Papers, Keynotes & Cryptanalytic Defenses ({cusatOrg.location})
              </div>
            </div>

            <div className="bg-white/80 p-5 rounded-lg border border-brand-border shadow-xs">
              <div className="text-xs font-mono uppercase text-brand-inkMuted mb-1">
                Target Community
              </div>
              <div className="font-serif text-xl font-bold text-brand-forest">
                Global PQC Assembly
              </div>
              <div className="text-sm text-brand-inkMuted mt-1">
                Cryptographers, Mathematicians, Cybersecurity Engineers & R&D Leaders
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 3. ORGANIZERS (TABS & CARDS)               */}
      {/* ========================================== */}
      <section className="py-20 bg-brand-creamMuted/60 border-b border-brand-border" id="organizers">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-8 h-[2px] bg-brand-accent" />
              <span className="text-xs uppercase font-mono tracking-widest text-brand-forest font-semibold">
                Institutional Partnership
              </span>
              <span className="w-8 h-[2px] bg-brand-accent" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-forest mb-4">
              Organizing Institutions & Centres
            </h2>
            <p className="text-brand-inkMuted text-base sm:text-lg">
              IWCMPQC 2027 unites pioneering institutions in mathematical sciences and quantum computation from Tamil Nadu and Kerala.
            </p>
          </div>

          {/* Partner Logos Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* GRI Card */}
            <div className="bg-white p-6 rounded-xl border border-brand-border shadow-sm flex flex-col sm:flex-row items-center gap-6">
              <div className="w-28 h-28 shrink-0 bg-brand-cream rounded-lg border border-brand-border flex flex-col items-center justify-center p-2 text-center overflow-hidden">
                <Image
                  src={`/${griOrg.logo}`}
                  alt="GRI Logo"
                  width={96}
                  height={96}
                  className="max-h-20 max-w-full object-contain"
                />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-brand-forest">
                  {griOrg.institution}
                </h3>
                <p className="text-xs text-brand-inkMuted mb-2">
                  (Deemed to be University) · MoE, Govt. of India · {griOrg.location}
                </p>
                <p className="text-sm text-brand-ink/80">
                  Hosting the International Workshop on PQC Foundations ({griOrg.dates.display}) via CMMQC.
                </p>
              </div>
            </div>

            {/* CUSAT Card */}
            <div className="bg-white p-6 rounded-xl border border-brand-border shadow-sm flex flex-col sm:flex-row items-center gap-6">
              <div className="w-28 h-28 shrink-0 bg-brand-cream rounded-lg border border-brand-border flex flex-col items-center justify-center p-2 text-center overflow-hidden">
                <Image
                  src={`/${cusatOrg.logo}`}
                  alt="CUSAT Logo"
                  width={96}
                  height={96}
                  className="max-h-20 max-w-full object-contain"
                />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-brand-forest">
                  {cusatOrg.institution}
                </h3>
                <p className="text-xs text-brand-inkMuted mb-2">
                  {cusatOrg.department} · NAAC A+ Accredited · {cusatOrg.location}
                </p>
                <p className="text-sm text-brand-ink/80">
                  Hosting the International Conference on PQC Applications ({cusatOrg.dates.display}).
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Tabbed View for Detailed About Sections */}
          <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
            {/* Tab Buttons Container */}
            <div className="flex flex-wrap border-b border-brand-border bg-brand-cream/60 p-2 gap-2" id="organizer-tab-buttons" role="tablist">
              {organizerSections.map((section, idx) => (
                <button
                  key={section.id}
                  onClick={() => setActiveOrganizerTab(idx)}
                  className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    idx === activeOrganizerTab
                      ? "bg-brand-forest text-white shadow-sm font-semibold"
                      : "text-brand-ink/70 hover:text-brand-forest hover:bg-white/80"
                  }`}
                  role="tab"
                  aria-selected={idx === activeOrganizerTab}
                >
                  {section.title}
                </button>
              ))}
            </div>

            {/* Tab Content Display Panel */}
            <div className="p-6 sm:p-10 min-h-[300px]" id="organizer-tab-content">
              {activeSection && (
                <div className="max-w-4xl transition-opacity duration-300">
                  <div className="inline-block bg-brand-sageLight text-brand-forest border border-brand-sage/40 text-xs font-mono font-semibold px-3 py-1 rounded-full mb-4">
                    {organizerBadges[activeSection.id] || "Academic Partner"}
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-brand-forest mb-6">
                    {activeSection.title}
                  </h3>
                  <div className="space-y-4 text-brand-ink/85 text-base sm:text-lg leading-relaxed">
                    {activeSection.paragraphs.map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 4. TOPICS TO BE COVERED                    */}
      {/* ========================================== */}
      <section className="py-20 bg-brand-cream border-b border-brand-border relative" id="topics">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-[2px] bg-brand-accent" />
              <span className="text-xs uppercase font-mono tracking-widest text-brand-forest font-semibold">
                Scope & Call for Research
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-forest mb-4">
              {topicsData.title}
            </h2>
            <p className="text-brand-inkMuted text-base sm:text-lg">
              The {topicsData.topics.length} core focus tracks spanning theoretical mathematical formulations, NIST standards, cryptanalysis, and hardware implementations in post-quantum ecosystems.
            </p>
          </div>

          {/* Topics Grid Container */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="topics-grid">
            {topicsData.topics.map((t) => {
              const trackNum = String(t.id).padStart(2, "0");
              const desc = topicDescriptions[t.id] || "Advanced research models, algebraic formulations, and post-quantum application architectures.";

              return (
                <div
                  key={t.id}
                  className="bg-white p-6 rounded-xl border border-brand-border hover:border-brand-forest/60 hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-xs font-bold text-brand-accent bg-brand-forest px-2.5 py-1 rounded">
                        T{trackNum}
                      </span>
                      <span className="text-brand-sage font-mono text-xs">Track {trackNum}</span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-brand-forest mb-3 group-hover:text-brand-forestLight leading-snug">
                      {t.name}
                    </h3>
                    <p className="text-brand-inkMuted text-xs sm:text-sm leading-relaxed">
                      {desc}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-brand-border/60 flex items-center justify-between text-xs text-brand-inkMuted">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-brand-forest font-medium">
                      Inviting Papers
                    </span>
                    <svg
                      className="w-4 h-4 text-brand-sage group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Call for Papers Banner Box (Chalkboard style matching reference palette) */}
          <div className="mt-14 rounded-2xl bg-brand-forest text-brand-cream p-8 sm:p-10 relative overflow-hidden border border-brand-forestLight shadow-lg">
            <div className="absolute -right-10 -bottom-10 opacity-20 font-serif text-8xl italic text-brand-sage pointer-events-none select-none" aria-hidden="true">
              LWE
            </div>
            <div className="relative z-10 max-w-2xl">
              <span className="text-xs font-mono uppercase tracking-widest text-brand-accent font-semibold block mb-2">
                CALL FOR PAPERS & RESEARCH POSTERS
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-3">
                Proofs and Patterns in Quantum-Safe Cryptography
              </h3>
              <p className="text-brand-cream/80 text-sm sm:text-base leading-relaxed mb-6">
                Original research manuscripts, review papers, and technical implementation blueprints in any of the {topicsData.topics.length} conference tracks are invited for peer-reviewed presentation and proceedings.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <a
                  className="bg-brand-accent text-brand-forestDark hover:bg-[#f0b58e] active:scale-95 font-semibold text-sm px-6 py-3 rounded-lg transition-all shadow-md inline-flex items-center gap-2"
                  href="#contact"
                >
                  <span>Submit Abstract / Contact Conveners</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </a>
                <span className="text-xs text-brand-sage font-mono">
                  Proceedings indexed with leading academic publishers
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 5. CONTACT & CONVENERS                     */}
      {/* ========================================== */}
      <section className="py-20 bg-brand-creamMuted/40" id="contact">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-8 h-[2px] bg-brand-accent" />
              <span className="text-xs uppercase font-mono tracking-widest text-brand-forest font-semibold">
                Secretariat
              </span>
              <span className="w-8 h-[2px] bg-brand-accent" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-forest mb-4">
              {contactData.title || "Contact & Conveners"}
            </h2>
            <p className="text-brand-inkMuted text-base sm:text-lg">
              For workshop registrations, paper submissions, accommodation inquiries, and sponsorship partnerships, reach out directly to the event conveners.
            </p>
          </div>

          {/* Contact Directory Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto" id="contact-cards-container">
            {contactData.contacts.map((c) => (
              <div
                key={c.name}
                className="bg-white rounded-2xl border border-brand-border p-8 shadow-sm hover:border-brand-sage transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-sageLight/40 rounded-bl-full pointer-events-none -z-0" />

                <div className="relative z-10">
                  <span className="inline-block bg-brand-forest text-brand-accent text-xs font-mono uppercase tracking-wider font-semibold px-3 py-1 rounded-md mb-4">
                    {c.role}
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-brand-forest mb-1">
                    {c.name}
                  </h3>
                  <p className="text-sm font-semibold text-brand-ink mb-1">{c.designation}</p>
                  <p className="text-xs text-brand-inkMuted leading-relaxed mb-6">
                    {c.department}
                    <br />
                    <span className="font-medium text-brand-forest">{c.institution}</span>
                  </p>

                  <div className="text-xs text-brand-forestLight bg-brand-cream/80 p-3 rounded-lg border border-brand-border/60 mb-6">
                    <span className="font-semibold block mb-0.5 text-brand-forest">Inquiry Focus:</span>
                    Conference Paper Submissions, Review Process, Registrations & Venue Inquiries
                  </div>

                  {/* Clickable tel and mailto links */}
                  <div className="space-y-3 pt-4 border-t border-brand-border text-sm">
                    <a
                      href={`tel:${c.phone.replace(/[^0-9+]/g, "")}`}
                      className="flex items-center gap-3 text-brand-forest hover:text-brand-accent font-mono transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-brand-cream border border-brand-border flex items-center justify-center text-brand-forest group-hover:border-brand-accent transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                      <span>{c.phone}</span>
                    </a>

                    <a
                      href={`mailto:${c.email}`}
                      className="flex items-center gap-3 text-brand-forest hover:text-brand-accent font-mono transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-brand-cream border border-brand-border flex items-center justify-center text-brand-forest group-hover:border-brand-accent transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                      <span className="break-all">{c.email}</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Inquiry / Advisory Note */}
          <div className="mt-12 p-6 rounded-xl bg-white border border-brand-border text-center text-sm text-brand-inkMuted max-w-2xl mx-auto shadow-2xs">
            <span className="font-semibold text-brand-forest">Note for International Delegates:</span> Official invitation letters for visa processing and travel clearance are issued by the respective host institutions upon registration confirmation.
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 6. FOOTER                                  */}
      {/* ========================================== */}
      <footer className="bg-brand-forestDark text-brand-cream border-t border-brand-forestLight/50 py-14 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 pb-10 border-b border-brand-forest/60">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-brand-forest border border-brand-sage/40 flex items-center justify-center text-brand-accent font-serif font-bold text-lg">
                  Ψ
                </div>
                <span className="font-serif font-bold text-xl text-brand-cream">
                  {eventData.shortName}
                </span>
              </div>
              <p className="text-xs text-brand-accent font-mono tracking-wide" id="footer-dates-banner">
                {eventData.dates.display}
              </p>
              <p className="text-sm text-brand-cream/70 max-w-md leading-relaxed">
                {eventData.title}
              </p>
            </div>

            <div>
              <h4 className="text-xs uppercase font-mono tracking-wider text-brand-sage font-semibold mb-4">
                Quick Navigation
              </h4>
              <ul className="space-y-2 text-sm text-brand-cream/80">
                <li>
                  <a className="hover:text-brand-accent transition-colors" href="#hero">
                    Home & Event Overview
                  </a>
                </li>
                <li>
                  <a className="hover:text-brand-accent transition-colors" href="#about">
                    About IWCMPQC
                  </a>
                </li>
                <li>
                  <a className="hover:text-brand-accent transition-colors" href="#organizers">
                    Participating Institutions
                  </a>
                </li>
                <li>
                  <a className="hover:text-brand-accent transition-colors" href="#topics">
                    Topics & Scope
                  </a>
                </li>
                <li>
                  <a className="hover:text-brand-accent transition-colors" href="#contact">
                    Conveners & Inquiries
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs uppercase font-mono tracking-wider text-brand-sage font-semibold mb-4">
                Organized By
              </h4>
              <div className="space-y-3 text-xs text-brand-cream/80" id="footer-organizers-list">
                {eventData.organizers.map((org) => (
                  <div key={org.id} className="border-l-2 border-brand-sage/40 pl-3">
                    <div className="font-medium text-brand-cream">{org.institution}</div>
                    <div className="text-[11px] text-brand-cream/60">
                      {org.department} ({org.type}) · {org.location}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-cream/60 font-mono">
            <p>© 2027 IWCMPQC Joint Academic Secretariat. All rights reserved.</p>
            <p>
              Gandhigram Rural Institute (GRI) & Cochin University of Science and Technology (CUSAT)
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
