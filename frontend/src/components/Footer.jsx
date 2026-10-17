import React from 'react';

export default function Footer({ onAction }) {
  return (
    <footer className="w-full bg-[#0d1712] text-white pt-24 pb-16 px-6 relative border-t border-[#18261e]">
      <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Top squircle with emblem */}
        <div className="w-12 h-12 rounded-xl bg-[#20362b] flex items-center justify-center mb-8 shadow-sm">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current">
            <path d="M12 2a1 1 0 0 1 1 1v6.2l4.4-4.4a1 1 0 1 1 1.4 1.4L14.4 10.6H21a1 1 0 1 1 0 2h-6.6l4.4 4.4a1 1 0 1 1-1.4 1.4L13 14v6.2a1 1 0 1 1-2 0V14l-4.4 4.4a1 1 0 1 1-1.4-1.4l4.4-4.4H3a1 1 0 1 1 0-2h6.6L5.2 6.2a1 1 0 1 1 1.4-1.4L11 9.2V3a1 1 0 0 1 1-1z" />
          </svg>
        </div>

        {/* Big Closing CTA Headline with "Things" Luxury Serif */}
        <h2 className="font-hero text-4xl md:text-6xl font-normal tracking-[-0.03em] text-white leading-[1.1] mb-4">
          Your next close,{' '}
          <span className="text-[#6f8076] font-normal italic">already half done.</span>
        </h2>

        {/* Subtitle */}
        <p className="font-body text-sm md:text-base text-[#8ca395] mb-8 font-normal">
          Free for 30 days. No card, no sales call.
        </p>

        {/* Dual Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-24">
          <button 
            onClick={() => onAction && onAction('terminal')}
            className="font-body px-6 py-2.5 rounded-md bg-white hover:bg-[#f6f6f2] text-[#111614] text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            Start free trial
          </button>
          <button 
            onClick={() => onAction && onAction('contracts')}
            className="font-body px-6 py-2.5 rounded-md bg-transparent hover:bg-white/5 border border-[#2b3f33] text-white text-xs font-medium transition-all cursor-pointer"
          >
            Request demo
          </button>
        </div>

        {/* Footer Navigation Columns */}
        <div className="w-full grid grid-cols-2 md:grid-cols-5 gap-8 text-left pt-12 border-t border-[#1a2d22]">
          {/* Brand info */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-white fill-current">
                <path d="M12 2a1 1 0 0 1 1 1v6.2l4.4-4.4a1 1 0 1 1 1.4 1.4L14.4 10.6H21a1 1 0 1 1 0 2h-6.6l4.4 4.4a1 1 0 1 1-1.4 1.4L13 14v6.2a1 1 0 1 1-2 0V14l-4.4 4.4a1 1 0 1 1-1.4-1.4l4.4-4.4H3a1 1 0 1 1 0-2h6.6L5.2 6.2a1 1 0 1 1 1.4-1.4L11 9.2V3a1 1 0 0 1 1-1z" />
              </svg>
              <span className="text-sm font-semibold tracking-tight text-white font-title">fundryx.</span>
            </div>
            <p className="font-body text-xs text-[#718579] max-w-xs leading-relaxed">
              Bank-grade risk scoring. SOC 2 Type II compliant on Polygon Amoy.
            </p>
          </div>

          {/* Product links */}
          <div className="flex flex-col gap-2.5 text-xs text-[#8ca395] font-body">
            <span className="text-white font-title text-[11px] font-bold tracking-wider uppercase mb-1">Product</span>
            <a href="#terminal" className="hover:text-white transition-colors">Wallets</a>
            <a href="#terminal" className="hover:text-white transition-colors">Reporting</a>
            <a href="#inside-app" className="hover:text-white transition-colors">Forecasting</a>
            <a href="#contracts" className="hover:text-white transition-colors">Integrations</a>
          </div>

          {/* Company links */}
          <div className="flex flex-col gap-2.5 text-xs text-[#8ca395] font-body">
            <span className="text-white font-title text-[11px] font-bold tracking-wider uppercase mb-1">Company</span>
            <a href="#why-fundryx" className="hover:text-white transition-colors">About</a>
            <a href="#why-fundryx" className="hover:text-white transition-colors">Careers</a>
            <a href="#why-fundryx" className="hover:text-white transition-colors">Press</a>
            <a href="#why-fundryx" className="hover:text-white transition-colors">Contact</a>
          </div>

          {/* Resources links */}
          <div className="flex flex-col gap-2.5 text-xs text-[#8ca395] font-body">
            <span className="text-white font-title text-[11px] font-bold tracking-wider uppercase mb-1">Resources</span>
            <a href="#contracts" className="hover:text-white transition-colors">Docs</a>
            <a href="#contracts" className="hover:text-white transition-colors">Security</a>
            <a href="#contracts" className="hover:text-white transition-colors">Status</a>
            <a href="#contracts" className="hover:text-white transition-colors">Changelog</a>
          </div>
        </div>

        {/* Copyright subtext */}
        <div className="w-full mt-12 pt-6 flex flex-col md:flex-row items-center justify-between text-[11px] text-[#55695d] font-body">
          <span>© 2026 Fundryx Protocol. All rights reserved.</span>
          <span className="mt-2 md:mt-0 font-mono">Chain ID: 80002 (Polygon Amoy)</span>
        </div>
      </div>
    </footer>
  );
}
