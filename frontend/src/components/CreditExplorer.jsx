import React, { useState } from 'react';

export default function CreditExplorer() {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [hoveredCell, setHoveredCell] = useState(null);

  // Heatmap months
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Matrix data for 12 months x 5 weeks
  const heatmapData = [
    [1, 1, 3, 2, 2], // Jan
    [2, 3, 2, 2, 3], // Feb
    [1, 2, 3, 3, 2], // Mar
    [2, 1, 4, 1, 2], // Apr
    [1, 2, 1, 1, 2], // May
    [1, 1, 2, 1, 1], // Jun
    [2, 1, 1, 2, 1], // Jul
    [1, 2, 2, 1, 2], // Aug
    [2, 2, 2, 1, 1], // Sep
    [1, 2, 2, 2, 2], // Oct
    [1, 1, 2, 2, 2], // Nov
    [2, 2, 2, 2, 2], // Dec
  ];

  const getHeatmapColor = (level) => {
    switch (level) {
      case 4: return 'bg-[#1a2e22]'; // darkest
      case 3: return 'bg-[#606d64]'; // medium dark
      case 2: return 'bg-[#9ba69e]'; // medium
      case 1: 
      default: return 'bg-[#d8dfda]'; // light
    }
  };

  return (
    <section id="inside-app" className="relative w-full py-28 px-6 overflow-hidden">
      {/* Swooping Emerald Satin Silk Background Texture */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/satin_bg.jpg"
          alt="Satin Emerald Texture"
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-[#0a140f]/75 mix-blend-multiply" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center text-center">
        {/* Pill Badge: INSIDE THE APP */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-md text-[11px] font-title font-bold tracking-widest text-[#111614] uppercase mb-8 shadow-sm">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current text-[#111614]">
            <path d="M12 2a1 1 0 0 1 1 1v6.2l4.4-4.4a1 1 0 1 1 1.4 1.4L14.4 10.6H21a1 1 0 1 1 0 2h-6.6l4.4 4.4a1 1 0 1 1-1.4 1.4L13 14v6.2a1 1 0 1 1-2 0V14l-4.4 4.4a1 1 0 1 1-1.4-1.4l4.4-4.4H3a1 1 0 1 1 0-2h6.6L5.2 6.2a1 1 0 1 1 1.4-1.4L11 9.2V3a1 1 0 0 1 1-1z" />
          </svg>
          <span>INSIDE THE APP</span>
        </div>

        {/* Title with "Things" Luxury Serif */}
        <h2 className="font-hero text-4xl md:text-6xl font-normal tracking-[-0.03em] text-white leading-[1.1] mb-4">
          Every account,
          <br />
          <span className="text-[#84968d] font-normal italic">one </span>
          <span className="text-white font-medium not-italic">ledger</span>
        </h2>

        {/* Subtitle */}
        <p className="font-body text-base md:text-lg text-[#9cb0a4] max-w-xl mx-auto mb-16 font-normal">
          Wallets and spending side by side, in the currency you think in.
        </p>

        {/* Two Feature Panels side by side */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
          
          {/* Card 1: Every currency, one balance */}
          <div className="bg-[#deded2] rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl border border-white/20">
            {/* Visual Preview Container */}
            <div className="w-full bg-[#111d17] p-5 rounded-2xl shadow-inner mb-6 relative">
              {/* White floating ledger card */}
              <div className="bg-white rounded-xl p-5 shadow-md">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-xs text-[#757d77] font-body font-medium">Total Balance</div>
                    <div className="text-2xl md:text-3xl font-title font-bold text-[#111614] tracking-tight mt-0.5">
                      $1,332,718.47
                    </div>
                    <div className="text-xs text-emerald-600 font-body font-medium mt-1">
                      +5.1% · This quarter
                    </div>
                  </div>
                  {/* Currency selector pill */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#f4f4f0] border border-[#d6d6ce] rounded-md text-xs font-body font-medium text-[#111614] cursor-pointer">
                    <span>🇺🇸 USD</span>
                    <span className="text-[10px]">▼</span>
                  </div>
                </div>

                {/* Wallets grid */}
                <div className="mt-4 pt-3 border-t border-[#ebebe6]">
                  <div className="text-[11px] font-title font-bold text-[#757d77] mb-2 uppercase tracking-wider">Wallets</div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-body">
                    {/* USD */}
                    <div className="p-2.5 rounded-lg bg-[#f9f9f6] border border-[#10b981]/40 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-[#525a54] font-medium">
                        <span>🇺🇸</span> <span>USD</span>
                      </div>
                      <div className="font-semibold text-[#111614] mt-1">$912,400.00</div>
                      <div className="text-[10px] text-emerald-600 font-medium">Active</div>
                    </div>

                    {/* EUR */}
                    <div className="p-2.5 rounded-lg bg-[#f9f9f6] border border-[#e5e5de]">
                      <div className="flex items-center gap-1.5 text-[#525a54] font-medium">
                        <span>🇪🇺</span> <span>EUR</span>
                      </div>
                      <div className="font-semibold text-[#111614] mt-1">€ 228,900.00</div>
                      <div className="text-[10px] text-emerald-600 font-medium">Active</div>
                    </div>

                    {/* GBP */}
                    <div className="p-2.5 rounded-lg bg-[#f9f9f6] border border-[#e5e5de]">
                      <div className="flex items-center gap-1.5 text-[#525a54] font-medium">
                        <span>🇬🇧</span> <span>GBP</span>
                      </div>
                      <div className="font-semibold text-[#111614] mt-1">£84,120.00</div>
                      <div className="text-[10px] text-emerald-600 font-medium">Active</div>
                    </div>

                    {/* JPY */}
                    <div className="p-2.5 rounded-lg bg-[#f9f9f6] border border-[#e5e5de]">
                      <div className="flex items-center gap-1.5 text-[#525a54] font-medium">
                        <span>🇯🇵</span> <span>JPY</span>
                      </div>
                      <div className="font-semibold text-[#111614] mt-1">¥9,820,000</div>
                      <div className="text-[10px] text-emerald-600 font-medium">Active</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Multi-Currency Balances Overview */}
            <div>
              <h3 className="text-xl font-title font-bold text-[#111614] mb-1">
                Every currency, one balance
              </h3>
              <p className="font-body text-sm text-[#525a54]">
                Click a wallet to see the whole company in its currency.
              </p>
            </div>
          </div>

          {/* Card 2: Spend heatmap */}
          <div className="bg-[#deded2] rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl border border-white/20">
            {/* Visual Preview Container */}
            <div className="w-full bg-[#111d17] p-5 rounded-2xl shadow-inner mb-6 relative">
              {/* White floating heatmap card */}
              <div className="bg-white rounded-xl p-5 shadow-md">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-xs text-[#757d77] font-body font-medium">Spending Overview</div>
                    <div className="text-2xl md:text-3xl font-title font-bold text-[#111614] tracking-tight mt-0.5">
                      $24,112.72 <span className="text-xs font-body font-normal text-[#757d77]">of $120,000.00</span>
                    </div>
                  </div>
                  {/* Yearly dropdown pill */}
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-[#f4f4f0] border border-[#d6d6ce] rounded-md text-xs font-body font-medium text-[#111614]">
                    <span>Yearly</span>
                    <span className="text-[10px]">▼</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-end gap-3 text-[11px] text-[#757d77] mb-3 font-body">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#606d64]"></span>
                    <span>&gt;$500</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#1a2e22]"></span>
                    <span>&gt;$900</span>
                  </div>
                </div>

                {/* Heatmap Grid: 12 Columns x 5 Rows */}
                <div className="grid grid-cols-12 gap-1.5 pt-2">
                  {months.map((m, colIdx) => (
                    <div key={m} className="flex flex-col gap-1.5 items-center">
                      {heatmapData[colIdx].map((level, rowIdx) => (
                        <div
                          key={rowIdx}
                          onMouseEnter={() => setHoveredCell(`${m} Wk ${rowIdx + 1}`)}
                          onMouseLeave={() => setHoveredCell(null)}
                          className={`w-full aspect-square rounded-xs cursor-pointer transition-transform hover:scale-125 ${getHeatmapColor(level)}`}
                          title={`${m} Week ${rowIdx + 1}`}
                        />
                      ))}
                      <span className="text-[9px] font-mono text-[#757d77] mt-1">{m}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 text-[11px] font-body text-[#757d77] text-center">
                  Hover a week to see what went out.
                </div>
              </div>
            </div>

            {/* Heatmap Metrics Overview */}
            <div>
              <h3 className="text-xl font-title font-bold text-[#111614] mb-1">
                Spend heatmap
              </h3>
              <p className="font-body text-sm text-[#525a54]">
                Week by week, so the spikes explain themselves.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
