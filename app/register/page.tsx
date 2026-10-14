"use client";

import React, { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import topicsData from "@/data/topics.json";

export default function RegisterPage() {
  const [submitted, setSubmitted] = useState(false);
  const [registrationRef, setRegistrationRef] = useState("");

  // Form Fields State
  const [paymentId, setPaymentId] = useState("");
  const [name, setName] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [category, setCategory] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [presentationType, setPresentationType] = useState<"Oral" | "Poster" | "">("");
  const [conferenceTheme, setConferenceTheme] = useState("");
  const [abstractFile, setAbstractFile] = useState<File | null>(null);
  const [foodPreference, setFoodPreference] = useState<"Vegetarian" | "Non-Vegetarian" | "">("");
  const [accommodationNeeded, setAccommodationNeeded] = useState<"Yes" | "No" | "">("");

  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    "Academic Faculty / Scientist",
    "Research Scholar / Ph.D. Student",
    "Postgraduate / Undergraduate Student",
    "Industry Delegate / R&D Specialist",
    "International Delegate"
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAbstractFile(e.target.files[0]);
      setErrorMsg("");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setAbstractFile(e.dataTransfer.files[0]);
      setErrorMsg("");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentId || !name || !organisation || !category || !email || !phone || !presentationType || !conferenceTheme || !foodPreference || !accommodationNeeded) {
      setErrorMsg("Please fill in all mandatory fields marked with an asterisk (*).");
      const firstInvalid = document.querySelector(".form-card");
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    const generatedCode = `IWCMPQC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    setRegistrationRef(generatedCode);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-[#d4e5dc] selection:bg-[#3ddc84]/30 selection:text-white">
      {/* ========================================== */}
      {/* 0. TOP NAVIGATION                          */}
      {/* ========================================== */}
      <Navbar />

      {/* ========================================== */}
      {/* 1. HERO HEADER                             */}
      {/* ========================================== */}
      <section className="relative lattice-pattern pt-28 sm:pt-32 pb-10 border-b border-[#3ddc84]/15">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 tracking-tight">
            Delegate Registration & Abstract Submission
          </h1>
          <p className="text-[#a2c4b5] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            International Workshop (22–24 Feb 2027, GRI) &amp; International Conference (25–27 Feb 2027, CUSAT). Complete payment via SBI Collect and enter the reference number below to finalize registration.
          </p>
        </div>
      </section>

      {/* ========================================== */}
      {/* 2. REGISTRATION WORKFLOW & FORM            */}
      {/* ========================================== */}
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Submission Success Screen */}
          {submitted ? (
            <div className="bg-[#0a120e] border border-[#3ddc84]/40 rounded-2xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-[#3ddc84]/15 border border-[#3ddc84] text-[#3ddc84] flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#3ddc84] font-semibold block mb-2">
                Registration Confirmed
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4">
                Thank You, {name}!
              </h2>
              <p className="text-[#a2c4b5] text-sm sm:text-base max-w-xl mx-auto mb-6 leading-relaxed">
                Your registration and abstract details have been successfully logged with the Secretariat. An official confirmation email with your invitation pass and venue clearance will be dispatched to <strong className="text-white">{email}</strong>.
              </p>

              <div className="bg-[#050b08] border border-[#1f3d2f] rounded-xl p-5 max-w-md mx-auto mb-8 text-left space-y-2">
                <div className="flex justify-between items-center text-xs text-[#719485] font-mono">
                  <span>REGISTRATION ID:</span>
                  <span className="text-white font-bold tracking-wider">{registrationRef}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-[#719485] font-mono">
                  <span>PAYMENT REFERENCE:</span>
                  <span className="text-[#3ddc84] font-semibold">{paymentId}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-[#719485] font-mono">
                  <span>DELEGATE CATEGORY:</span>
                  <span className="text-white">{category}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-[#719485] font-mono">
                  <span>PRESENTATION:</span>
                  <span className="text-white">{presentationType}</span>
                </div>
                {abstractFile && (
                  <div className="flex justify-between items-center text-xs text-[#719485] font-mono">
                    <span>ABSTRACT ATTACHED:</span>
                    <span className="text-white truncate max-w-[180px]">{abstractFile.name}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-[#050b08] hover:bg-[#12241b] text-white border border-[#3ddc84]/40 px-6 py-3 rounded-lg text-xs font-mono uppercase font-semibold transition-all cursor-pointer"
                >
                  Print Acknowledgement
                </button>
                <Link
                  href="/"
                  className="bg-[#3ddc84] hover:bg-[#4ade80] active:scale-95 text-black px-6 py-3 rounded-lg text-xs font-mono uppercase font-bold tracking-wider transition-all"
                >
                  Return to Home Page →
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Validation Warning Alert */}
              {errorMsg && (
                <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/50 text-red-200 text-sm flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="12" cy="16" r="0.75" />
                  </svg>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* ======================================================== */}
              {/* STEP 01: PAYMENT INSTRUCTIONS (SBI COLLECT)              */}
              {/* ======================================================== */}
              <div className="bg-[#08120e] rounded-xl border border-[#182e22] p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs font-mono text-[#719485] font-semibold tracking-wider">
                    01
                  </span>
                  <h2 className="text-sm sm:text-base font-bold font-mono tracking-wider uppercase text-white">
                    PAYMENT INSTRUCTIONS (SBI COLLECT)
                  </h2>
                  <div className="flex-1 h-[1px] bg-[#1a3326]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-[#040806] border border-[#14261d] p-4 rounded-lg">
                    <span className="text-[11px] font-mono uppercase text-[#3ddc84] block mb-1">Students &amp; Scholars</span>
                    <span className="font-serif text-2xl font-bold text-white block">₹1,500 – ₹2,500</span>
                    <p className="text-xs text-[#719485] mt-1">Valid student/scholar ID required upon check-in.</p>
                  </div>
                  <div className="bg-[#040806] border border-[#14261d] p-4 rounded-lg">
                    <span className="text-[11px] font-mono uppercase text-[#3ddc84] block mb-1">Faculty &amp; Academics</span>
                    <span className="font-serif text-2xl font-bold text-white block">₹3,000 – ₹4,500</span>
                    <p className="text-xs text-[#719485] mt-1">Access to all technical sessions &amp; conference kit.</p>
                  </div>
                  <div className="bg-[#040806] border border-[#14261d] p-4 rounded-lg">
                    <span className="text-[11px] font-mono uppercase text-[#3ddc84] block mb-1">Industry &amp; Global</span>
                    <span className="font-serif text-2xl font-bold text-white block">₹6,000 / $150</span>
                    <p className="text-xs text-[#719485] mt-1">Full proceedings, peer networking &amp; banquet pass.</p>
                  </div>
                </div>

                <div className="bg-[#050b08] border border-[#182e22] rounded-lg p-4 text-xs text-[#98b8ac] space-y-2 leading-relaxed">
                  <p className="font-semibold text-white">How to obtain your Payment Reference Number:</p>
                  <ol className="list-decimal list-inside space-y-1 text-[#719485]">
                    <li>Visit the State Bank of India e-Payment portal (<strong className="text-white">SBI Collect</strong>).</li>
                    <li>Select <strong className="text-[#3ddc84]">Educational Institutions</strong> → Search for host institute (<strong className="text-white">CUSAT / GRI</strong>).</li>
                    <li>Choose Payment Category: <strong className="text-[#3ddc84]">IWCMPQC 2027 Conference Fee</strong>.</li>
                    <li>Complete transaction and note the generated Reference Number (<strong className="text-white">DUXXXXXXXX</strong>).</li>
                  </ol>
                  <div className="pt-2">
                    <a
                      href="https://www.onlinesbi.sbi/sbicollect/icollecthome.htm"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#3ddc84] hover:underline"
                    >
                      <span>Open State Bank Collect in new tab</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* ======================================================== */}
              {/* STEP 02: REGISTRATION DETAILS (MATCHING SCREENSHOT)      */}
              {/* ======================================================== */}
              <div className="form-card bg-[#08120e] rounded-xl border border-[#182e22] p-6 sm:p-8 lg:p-10 shadow-xl space-y-6">
                
                {/* Header matching screenshot */}
                <div className="flex items-center gap-3 pb-2">
                  <span className="text-xs font-mono text-[#719485] font-semibold tracking-wider">
                    02
                  </span>
                  <h2 className="text-sm sm:text-base font-bold font-mono tracking-wider uppercase text-white">
                    REGISTRATION DETAILS
                  </h2>
                  <div className="flex-1 h-[1px] bg-[#1a3326]" />
                </div>

                {/* PAYMENT ID * */}
                <div>
                  <label className="font-mono text-xs font-semibold uppercase tracking-wider text-[#98b8ac] mb-2 block">
                    PAYMENT ID <span className="text-[#3ddc84]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={paymentId}
                    onChange={(e) => setPaymentId(e.target.value)}
                    placeholder="Enter SBI Collect Reference Number (e.g. DUXXXXXXXX)"
                    className="w-full bg-[#050b08] border border-[#182e22] rounded-lg px-4 py-3 text-sm text-[#e2eee7] placeholder-[#3f5d4f] focus:outline-none focus:border-[#3ddc84] focus:ring-1 focus:ring-[#3ddc84] transition-all font-mono"
                  />
                </div>

                {/* NAME * */}
                <div>
                  <label className="font-mono text-xs font-semibold uppercase tracking-wider text-[#98b8ac] mb-2 block">
                    NAME <span className="text-[#3ddc84]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-[#050b08] border border-[#182e22] rounded-lg px-4 py-3 text-sm text-[#e2eee7] placeholder-[#3f5d4f] focus:outline-none focus:border-[#3ddc84] focus:ring-1 focus:ring-[#3ddc84] transition-all"
                  />
                </div>

                {/* NAME OF ORGANISATION * */}
                <div>
                  <label className="font-mono text-xs font-semibold uppercase tracking-wider text-[#98b8ac] mb-2 block">
                    NAME OF ORGANISATION <span className="text-[#3ddc84]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={organisation}
                    onChange={(e) => setOrganisation(e.target.value)}
                    placeholder="Enter your organisation name"
                    className="w-full bg-[#050b08] border border-[#182e22] rounded-lg px-4 py-3 text-sm text-[#e2eee7] placeholder-[#3f5d4f] focus:outline-none focus:border-[#3ddc84] focus:ring-1 focus:ring-[#3ddc84] transition-all"
                  />
                </div>

                {/* CATEGORY * */}
                <div>
                  <label className="font-mono text-xs font-semibold uppercase tracking-wider text-[#98b8ac] mb-2 block">
                    CATEGORY <span className="text-[#3ddc84]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[#050b08] border border-[#182e22] rounded-lg px-4 py-3 text-sm text-[#e2eee7] appearance-none focus:outline-none focus:border-[#3ddc84] focus:ring-1 focus:ring-[#3ddc84] transition-all cursor-pointer pr-10"
                    >
                      <option value="" disabled>-- Select a Category --</option>
                      {categories.map((c) => (
                        <option key={c} value={c} className="bg-[#050b08] text-[#e2eee7]">
                          {c}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#719485]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* EMAIL * & PHONE NO. * (2 Columns) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono text-xs font-semibold uppercase tracking-wider text-[#98b8ac] mb-2 block">
                      EMAIL <span className="text-[#3ddc84]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-[#050b08] border border-[#182e22] rounded-lg px-4 py-3 text-sm text-[#e2eee7] placeholder-[#3f5d4f] focus:outline-none focus:border-[#3ddc84] focus:ring-1 focus:ring-[#3ddc84] transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-mono text-xs font-semibold uppercase tracking-wider text-[#98b8ac] mb-2 block">
                      PHONE NO. <span className="text-[#3ddc84]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full bg-[#050b08] border border-[#182e22] rounded-lg px-4 py-3 text-sm text-[#e2eee7] placeholder-[#3f5d4f] focus:outline-none focus:border-[#3ddc84] focus:ring-1 focus:ring-[#3ddc84] transition-all font-mono"
                    />
                  </div>
                </div>

                {/* PRESENTATION TYPE * */}
                <div>
                  <label className="font-mono text-xs font-semibold uppercase tracking-wider text-[#98b8ac] mb-3 block">
                    PRESENTATION TYPE <span className="text-[#3ddc84]">*</span>
                  </label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-white select-none group">
                      <input
                        type="radio"
                        name="presentationType"
                        value="Oral"
                        checked={presentationType === "Oral"}
                        onChange={() => setPresentationType("Oral")}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                        presentationType === "Oral"
                          ? "border-[#3ddc84] bg-[#3ddc84]"
                          : "border-[#3f5d4f] bg-[#050b08] group-hover:border-[#719485]"
                      }`}>
                        {presentationType === "Oral" && (
                          <div className="w-1.5 h-1.5 rounded-full bg-black" />
                        )}
                      </div>
                      <span>Oral</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-sm text-white select-none group">
                      <input
                        type="radio"
                        name="presentationType"
                        value="Poster"
                        checked={presentationType === "Poster"}
                        onChange={() => setPresentationType("Poster")}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                        presentationType === "Poster"
                          ? "border-[#3ddc84] bg-[#3ddc84]"
                          : "border-[#3f5d4f] bg-[#050b08] group-hover:border-[#719485]"
                      }`}>
                        {presentationType === "Poster" && (
                          <div className="w-1.5 h-1.5 rounded-full bg-black" />
                        )}
                      </div>
                      <span>Poster</span>
                    </label>
                  </div>
                </div>

                {/* CONFERENCE THEME * */}
                <div>
                  <label className="font-mono text-xs font-semibold uppercase tracking-wider text-[#98b8ac] mb-2 block">
                    CONFERENCE THEME <span className="text-[#3ddc84]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={conferenceTheme}
                      onChange={(e) => setConferenceTheme(e.target.value)}
                      className="w-full bg-[#050b08] border border-[#182e22] rounded-lg px-4 py-3 text-sm text-[#e2eee7] appearance-none focus:outline-none focus:border-[#3ddc84] focus:ring-1 focus:ring-[#3ddc84] transition-all cursor-pointer pr-10"
                    >
                      <option value="" disabled>-- Select a Theme --</option>
                      {topicsData.topics.map((t) => (
                        <option key={t.id} value={t.name} className="bg-[#050b08] text-[#e2eee7]">
                          Track {t.id}: {t.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#719485]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* ABSTRACT (WORD / DOCX) * */}
                <div>
                  <label className="font-mono text-xs font-semibold uppercase tracking-wider text-[#98b8ac] mb-2 block">
                    ABSTRACT (WORD / DOCX) <span className="text-[#3ddc84]">*</span>
                  </label>
                  
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border border-dashed rounded-xl py-10 px-6 text-center cursor-pointer transition-all ${
                      isDragging
                        ? "border-[#3ddc84] bg-[#3ddc84]/10"
                        : "border-[#1a3326] bg-[#050b08] hover:border-[#3f5d4f]"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".doc,.docx,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {/* Upload icon matching theme green */}
                    <div className="w-8 h-8 mx-auto text-[#3ddc84] mb-3 flex items-center justify-center">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>

                    {abstractFile ? (
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-white truncate max-w-sm mx-auto">
                          {abstractFile.name}
                        </p>
                        <p className="text-xs text-[#719485] font-mono">
                          {(abstractFile.size / (1024 * 1024)).toFixed(2)} MB · Click to replace
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <p className="text-sm text-[#d4e5dc]">
                          Drag and drop your abstract file here, or{" "}
                          <span className="text-[#3ddc84] font-semibold underline">browse</span>
                        </p>
                        <p className="text-xs text-[#719485] font-mono">
                          Supports DOC or DOCX (Max 10MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* FOOD PREFERENCE * & ACCOMMODATION NEEDED? * */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Food Preference */}
                  <div>
                    <label className="font-mono text-xs font-semibold uppercase tracking-wider text-[#98b8ac] mb-3 block">
                      FOOD PREFERENCE <span className="text-[#3ddc84]">*</span>
                    </label>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer text-sm text-white select-none group">
                        <input
                          type="radio"
                          name="foodPreference"
                          value="Vegetarian"
                          checked={foodPreference === "Vegetarian"}
                          onChange={() => setFoodPreference("Vegetarian")}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                          foodPreference === "Vegetarian"
                            ? "border-[#3ddc84] bg-[#3ddc84]"
                            : "border-[#3f5d4f] bg-[#050b08] group-hover:border-[#719485]"
                        }`}>
                          {foodPreference === "Vegetarian" && (
                            <div className="w-1.5 h-1.5 rounded-full bg-black" />
                          )}
                        </div>
                        <span>Vegetarian</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-sm text-white select-none group">
                        <input
                          type="radio"
                          name="foodPreference"
                          value="Non-Vegetarian"
                          checked={foodPreference === "Non-Vegetarian"}
                          onChange={() => setFoodPreference("Non-Vegetarian")}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                          foodPreference === "Non-Vegetarian"
                            ? "border-[#3ddc84] bg-[#3ddc84]"
                            : "border-[#3f5d4f] bg-[#050b08] group-hover:border-[#719485]"
                        }`}>
                          {foodPreference === "Non-Vegetarian" && (
                            <div className="w-1.5 h-1.5 rounded-full bg-black" />
                          )}
                        </div>
                        <span>Non-Vegetarian</span>
                      </label>
                    </div>
                  </div>

                  {/* Accommodation Needed? */}
                  <div>
                    <label className="font-mono text-xs font-semibold uppercase tracking-wider text-[#98b8ac] mb-3 block">
                      ACCOMMODATION NEEDED? <span className="text-[#3ddc84]">*</span>
                    </label>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer text-sm text-white select-none group">
                        <input
                          type="radio"
                          name="accommodationNeeded"
                          value="Yes"
                          checked={accommodationNeeded === "Yes"}
                          onChange={() => setAccommodationNeeded("Yes")}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                          accommodationNeeded === "Yes"
                            ? "border-[#3ddc84] bg-[#3ddc84]"
                            : "border-[#3f5d4f] bg-[#050b08] group-hover:border-[#719485]"
                        }`}>
                          {accommodationNeeded === "Yes" && (
                            <div className="w-1.5 h-1.5 rounded-full bg-black" />
                          )}
                        </div>
                        <span>Yes</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-sm text-white select-none group">
                        <input
                          type="radio"
                          name="accommodationNeeded"
                          value="No"
                          checked={accommodationNeeded === "No"}
                          onChange={() => setAccommodationNeeded("No")}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                          accommodationNeeded === "No"
                            ? "border-[#3ddc84] bg-[#3ddc84]"
                            : "border-[#3f5d4f] bg-[#050b08] group-hover:border-[#719485]"
                        }`}>
                          {accommodationNeeded === "No" && (
                            <div className="w-1.5 h-1.5 rounded-full bg-black" />
                          )}
                        </div>
                        <span>No</span>
                      </label>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Area: Required notice on Left, Submit Button on Right */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <p className="text-xs text-[#719485] font-mono order-2 sm:order-1">
                  Fields marked with <span className="text-[#3ddc84]">*</span> are required.
                </p>

                <button
                  type="submit"
                  className="order-1 sm:order-2 w-full sm:w-auto bg-[#3ddc84] hover:bg-[#4ade80] active:scale-95 text-black font-bold font-mono text-xs sm:text-sm tracking-wider uppercase px-8 py-3.5 rounded transition-all shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>SUBMIT REGISTRATION</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                  </svg>
                </button>
              </div>

            </form>
          )}

        </div>
      </main>

      {/* ========================================== */}
      {/* 3. FOOTER                                  */}
      {/* ========================================== */}
      <Footer />
    </div>
  );
}
