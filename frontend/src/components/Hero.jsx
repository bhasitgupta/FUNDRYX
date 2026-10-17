import React from 'react';

export default function Hero({ wallet, poolStats, onExplore }) {
  return (
    <section id="hero" className="relative min-h-[92vh] lg:min-h-screen w-full pt-28 pb-16 px-6 lg:px-12 flex flex-col justify-between overflow-hidden">
      
      {/* Background Circuit SVG with animated flow */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none select-none z-0" 
        viewBox="0 0 1440 850" 
        fill="none" 
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {/* Left Circuit Tracks */}
        <path d="M 0 160 H 280 V 260 H 180 V 460 H 100 V 620 H 30" stroke="#b8b8ac" strokeWidth="1.2" />
        <path d="M 0 160 H 280 V 260 H 180 V 460 H 100 V 620 H 30" stroke="#8c8c80" strokeWidth="1.2" className="animate-circuit-flow" />

        {/* Left-to-Center Feed */}
        <path d="M 360 80 V 160 H 480 V 380 H 560" stroke="#b8b8ac" strokeWidth="1.2" />

        {/* Right Circuit Tracks */}
        <path d="M 1440 160 H 1160 V 260 H 1260 V 440 H 1340 V 640 H 1140" stroke="#b8b8ac" strokeWidth="1.2" />
        <path d="M 1440 160 H 1160 V 260 H 1260 V 440 H 1340 V 640 H 1140" stroke="#8c8c80" strokeWidth="1.2" className="animate-circuit-flow" />

        {/* Right-to-Center Feed */}
        <path d="M 1080 80 V 160 H 960 V 440 H 880" stroke="#b8b8ac" strokeWidth="1.2" />
      </svg>

      {/* Circuit Nodes / Chips pinned to tracks */}
      <div className="absolute inset-0 pointer-events-none select-none z-5 overflow-hidden" aria-hidden="true">
        {/* Left chips */}
        <div className="circuit-chip top-36 left-[18%] px-3 py-0.5">. .</div>
        <div className="circuit-chip top-56 left-[11%] px-2.5 py-0.5">$</div>
        <div className="circuit-chip top-[380px] left-[6%] px-2.5 py-0.5">=</div>
        <div className="circuit-chip bottom-48 left-[5%] px-2.5 py-0.5">%</div>
        <div className="circuit-chip bottom-24 left-[2%] px-2.5 py-0.5">↗</div>

        {/* Right chips */}
        <div className="circuit-chip top-36 right-[18%] px-3 py-0.5">. .</div>
        <div className="circuit-chip top-56 right-[11%] px-2.5 py-0.5">$</div>
        <div className="circuit-chip top-[380px] right-[6%] px-2.5 py-0.5">=</div>
        <div className="circuit-chip bottom-48 right-[11%] px-2.5 py-0.5">%</div>

        {/* Center overhead chips */}
        <div className="circuit-chip top-36 left-[33%] px-2.5 py-0.5">º</div>
        <div className="circuit-chip top-36 right-[33%] px-2.5 py-0.5">º</div>

        {/* Floating white asterisk tile on right */}
        <div className="absolute top-[340px] right-[7%] w-10 h-10 bg-white rounded-lg shadow-sm border border-[#c2c2b6] flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#111614] fill-current">
            <path d="M12 2a1 1 0 0 1 1 1v6.2l4.4-4.4a1 1 0 1 1 1.4 1.4L14.4 10.6H21a1 1 0 1 1 0 2h-6.6l4.4 4.4a1 1 0 1 1-1.4 1.4L13 14v6.2a1 1 0 1 1-2 0V14l-4.4 4.4a1 1 0 1 1-1.4-1.4l4.4-4.4H3a1 1 0 1 1 0-2h6.6L5.2 6.2a1 1 0 1 1 1.4-1.4L11 9.2V3a1 1 0 0 1 1-1z" />
          </svg>
        </div>
      </div>

      {/* TOP DECK: Eyebrow, Headline, Subtitle, CTA Buttons */}
      <div className="max-w-4xl mx-auto w-full relative z-10 flex flex-col items-center text-center mt-6">
        
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 mb-4 text-xs text-[#525a54] font-medium tracking-tight">
          <span className="font-title uppercase tracking-wider text-[11px]">Governed by</span>
          <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-xs bg-[#ea580c] text-white">
            <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 fill-current">
              <path d="M10 3L4.5 8.5 2 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="text-[#111614] font-semibold font-title tracking-wider text-[11px]">Polygon Amoy Smart Contracts</span>
        </div>

        {/* Hero Headline: Proportional, Elegant Didone Serif */}
        <h1 className="font-hero text-4xl sm:text-6xl lg:text-[68px] tracking-[-0.025em] text-[#111614] leading-[1.08] max-w-3xl mx-auto">
          Lend and borrow
          <br />
          <span className="text-[#84968d] italic font-normal">in a single </span>
          <span className="text-[#111614] not-italic font-semibold">transaction</span>
        </h1>

        {/* Subtitle */}
        <p className="font-body mt-4 text-sm md:text-base text-[#525a54] max-w-md mx-auto font-normal leading-relaxed">
          Deterministic credit scoring, non-custodial capital pools, and AI risk telemetry from one calm workspace.
        </p>

        {/* Dual CTA Buttons */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => onExplore('terminal')}
            className="font-body px-5 py-2.5 rounded-md bg-[#263e34] hover:bg-[#1f332b] text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            Start free trial
          </button>
          <button
            onClick={() => onExplore('contracts')}
            className="font-body px-5 py-2.5 rounded-md bg-white hover:bg-[#f6f6f2] border border-[#cacac0] text-[#111614] text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            Request demo
          </button>
        </div>
      </div>

      {/* LOWER DECK: Perfectly Centered Gold Vault Device + Left Teaser + Right Cards */}
      <div className="relative w-full max-w-7xl mx-auto mt-10 md:mt-12 min-h-[240px] flex flex-col lg:flex-row items-center lg:items-end justify-between gap-6 z-10">
        
        {/* Left Column: /why/ teaser statement */}
        <div className="w-full lg:max-w-[270px] text-left pb-2 order-2 lg:order-1">
          <div className="text-xs font-mono text-[#525a54] flex items-center gap-1.5 mb-2">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#111614] fill-current">
              <path d="M12 2a1 1 0 0 1 1 1v6.2l4.4-4.4a1 1 0 1 1 1.4 1.4L14.4 10.6H21a1 1 0 1 1 0 2h-6.6l4.4 4.4a1 1 0 1 1-1.4 1.4L13 14v6.2a1 1 0 1 1-2 0V14l-4.4 4.4a1 1 0 1 1-1.4-1.4l4.4-4.4H3a1 1 0 1 1 0-2h6.6L5.2 6.2a1 1 0 1 1 1.4-1.4L11 9.2V3a1 1 0 0 1 1-1z" />
            </svg>
            <span className="font-title tracking-wider uppercase text-[10px]">/why/</span>
          </div>
          <p className="font-body text-xs text-[#111614] leading-relaxed">
            <strong className="font-semibold">Fundryx matches every borrower</strong> to its onchain credit score, flags anomalies via AI risk telemetry, and settles capital pools before you close your books.
          </p>
        </div>

        {/* Center: EXACT DEAD-CENTER Gold Protocol Vault Device Model */}
        <div className="lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:bottom-6 z-20 flex flex-col items-center justify-center order-1 lg:order-2">
          {/* Auto-sync · live chip */}
          <div className="mb-2.5 inline-flex items-center gap-1.5 px-3 py-0.5 bg-white border border-[#c2c2b6] rounded-full text-xs font-medium text-[#111614] shadow-xs">
            <span className="pulse-dot" />
            <span className="font-body text-[10px]">Auto-sync · live</span>
          </div>

          {/* Project-specific Luxury Gold Credit Vault Device */}
          <div className="relative group cursor-pointer animate-float-device">
            {/* Device Container: Luxury Brushed Gold Squircle */}
            <div className="w-48 h-48 md:w-52 md:h-52 rounded-[36px] bg-gradient-to-br from-[#ebd3a6] via-[#dfbe87] to-[#bc9658] p-1 shadow-[0_20px_45px_-12px_rgba(180,130,50,0.32)] border border-amber-200/60 relative overflow-hidden transition-transform duration-500 hover:scale-105">
              
              {/* Inner Bevel & Shimmer */}
              <div className="w-full h-full rounded-[32px] bg-gradient-to-b from-[#f3e1be] via-[#dfbe88] to-[#c79d5a] p-4 flex flex-col items-center justify-between shadow-inner relative">
                
                {/* Top Subtle Hardware Label */}
                <div className="w-full flex items-center justify-between text-[8px] font-mono tracking-widest text-[#694f27]/80 uppercase">
                  <span>FDX·V1</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-700/60 inline-block" />
                  <span>80002</span>
                </div>

                {/* Center Recessed Obsidian Emblem */}
                <div className="w-20 h-20 rounded-[22px] bg-[#1a231d] shadow-[inset_0_4px_10px_rgba(0,0,0,0.6),0_2px_4px_rgba(255,255,255,0.4)] border border-[#3b4c41]/50 flex items-center justify-center relative group-hover:border-amber-400/50 transition-colors">
                  {/* Fundryx 6-Petal Asterisk in Brushed Gold */}
                  <svg viewBox="0 0 24 24" className="w-10 h-10 text-[#dfbe87] fill-current drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                    <path d="M12 2a1 1 0 0 1 1 1v6.2l4.4-4.4a1 1 0 1 1 1.4 1.4L14.4 10.6H21a1 1 0 1 1 0 2h-6.6l4.4 4.4a1 1 0 1 1-1.4 1.4L13 14v6.2a1 1 0 1 1-2 0V14l-4.4 4.4a1 1 0 1 1-1.4-1.4l4.4-4.4H3a1 1 0 1 1 0-2h6.6L5.2 6.2a1 1 0 1 1 1.4-1.4L11 9.2V3a1 1 0 0 1 1-1z" />
                  </svg>
                  <div className="absolute inset-0 rounded-[22px] bg-gradient-to-tr from-transparent via-white/5 to-white/15 pointer-events-none" />
                </div>

                {/* Bottom Protocol Telemetry Label */}
                <div className="text-center">
                  <div className="text-[9px] font-title tracking-[0.18em] text-[#4d391b] font-bold uppercase">
                    Fundryx Vault
                  </div>
                  <div className="text-[7.5px] font-mono text-[#785b31] tracking-wider">
                    NON-CUSTODIAL ENGINE
                  </div>
                </div>

                {/* Specular sheen corner */}
                <div className="absolute top-1.5 left-4 right-4 h-6 bg-gradient-to-b from-white/30 to-transparent rounded-t-[28px] pointer-events-none" />
              </div>
            </div>

            {/* Warm underglow shadow */}
            <div className="absolute -bottom-4 inset-x-6 h-8 bg-amber-500/25 blur-xl rounded-full -z-10 animate-warm-pulse" />
          </div>
        </div>

        {/* Right Column: Live Dark Forest Finance Cards */}
        <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3 pb-2 z-10 order-3">
          {/* Card 1: Cash Out / Borrows */}
          <div className="w-full sm:w-44 bg-[#15231c] text-white p-3.5 rounded-xl border border-[#23382c] shadow-md">
            <div className="flex items-center justify-between text-xs text-[#8ca395] mb-1">
              <span className="font-title text-[10px] font-medium tracking-wide">Cash Out</span>
              <span className="flex items-center gap-1 cursor-pointer text-[9px]">
                <span>📅</span>
                <span>Month</span>
                <span>▼</span>
              </span>
            </div>
            <div className="text-[9px] text-[#698072] mb-1.5 font-mono">Polygon Amoy Borrows</div>

            <div className="text-base font-title font-bold tracking-tight text-white mb-1.5">
              $ {poolStats.totalBorrowed ? poolStats.totalBorrowed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '48,210.40'}
            </div>

            {/* Metric Pill */}
            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs bg-[#1c2e25] text-[9px] text-[#93b3a0] mb-2.5">
              <span>▼ 4.2%</span>
              <span className="text-[#647c6d]">from last month</span>
            </div>

            {/* Donut Chart & Legend */}
            <div className="flex items-center gap-2 pt-1.5 border-t border-[#1f3328]">
              <svg className="w-7 h-7 shrink-0" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#233a2d"
                  strokeWidth="3.5"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="3.5"
                  strokeDasharray="65, 100"
                />
              </svg>
              <div className="text-[8px] space-y-0.5 text-[#8ca395] font-mono leading-tight">
                <div>● FDX Prime $31k</div>
                <div>● Short-term $6.8k</div>
              </div>
            </div>
          </div>

          {/* Card 2: Cash In / Deposits */}
          <div className="w-full sm:w-44 bg-[#15231c] text-white p-3.5 rounded-xl border border-[#23382c] shadow-md">
            <div className="flex items-center justify-between text-xs text-[#8ca395] mb-1">
              <span className="font-title text-[10px] font-medium tracking-wide">Cash In</span>
              <span className="flex items-center gap-1 cursor-pointer text-[9px]">
                <span>📅</span>
                <span>Month</span>
                <span>▼</span>
              </span>
            </div>
            <div className="text-[9px] text-[#698072] mb-1.5 font-mono">Liquidity Pool TVL</div>

            <div className="text-base font-title font-bold tracking-tight text-white mb-1.5">
              $ {poolStats.totalDeposits ? poolStats.totalDeposits.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '126,400.00'}
            </div>

            {/* Metric Pill */}
            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs bg-[#1c2e25] text-[9px] text-emerald-400 mb-2.5">
              <span>▲ 11.8%</span>
              <span className="text-[#647c6d]">from last month</span>
            </div>

            {/* Donut Chart & Legend */}
            <div className="flex items-center gap-2 pt-1.5 border-t border-[#1f3328]">
              <svg className="w-7 h-7 shrink-0" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#233a2d"
                  strokeWidth="3.5"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeDasharray="80, 100"
                />
              </svg>
              <div className="text-[8px] space-y-0.5 text-[#8ca395] font-mono leading-tight">
                <div>● Liquidity $98k</div>
                <div>● Reserve $21k</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
