import React from "react";
import Link from "next/link";
import eventData from "@/data/event.json";

export default function Footer() {
  return (
    <footer className="bg-black/75 backdrop-blur-[2px] text-brand-cream border-t border-[#3ddc84]/20 py-14 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 pb-10 border-b border-[#3ddc84]/15">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center">
              <span className="font-serif font-bold text-xl text-white">
                {eventData.shortName}
              </span>
            </div>
            <p className="text-xs text-brand-accent font-mono tracking-wide" id="footer-dates-banner">
              {eventData.dates.display}
            </p>
            <p className="text-sm text-[#d4e5dc]/80 max-w-md leading-relaxed">
              {eventData.title}
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase font-mono tracking-wider text-[#3ddc84] font-semibold mb-4">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-sm text-[#d4e5dc]/80">
              <li>
                <Link className="hover:text-brand-accent transition-colors" href="/#hero">
                  Home & Event Overview
                </Link>
              </li>
              <li>
                <Link className="hover:text-brand-accent transition-colors" href="/#about">
                  About IWCMPQC
                </Link>
              </li>
              <li>
                <Link className="hover:text-brand-accent transition-colors" href="/#organizers">
                  Participating Institutions
                </Link>
              </li>
              <li>
                <Link className="hover:text-brand-accent transition-colors" href="/#topics">
                  Topics & Scope
                </Link>
              </li>
              <li>
                <Link className="hover:text-brand-accent transition-colors" href="/#contact">
                  Conveners & Inquiries
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase font-mono tracking-wider text-[#3ddc84] font-semibold mb-4">
              Organized By
            </h4>
            <div className="space-y-3 text-xs text-[#d4e5dc]/80" id="footer-organizers-list">
              {eventData.organizers.map((org) => (
                <div key={org.id} className="border-l-2 border-[#3ddc84]/40 pl-3">
                  <div className="font-medium text-white">{org.institution}</div>
                  <div className="text-[11px] text-[#a2c4b5]">
                    {org.department} ({org.type}) · {org.location}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#a2c4b5] font-mono">
          <p>© 2027 IWCMPQC Joint Academic Secretariat. All rights reserved.</p>
          <p>
            Gandhigram Rural Institute (GRI) &amp; Cochin University of Science and Technology (CUSAT)
          </p>
        </div>
      </div>
    </footer>
  );
}
