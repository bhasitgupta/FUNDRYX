import React from 'react';

export default function InsightStage() {
  return (
    <section id="why-fundryx" className="w-full bg-[#0e1814] text-white py-28 px-6 relative overflow-hidden">
      <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
        {/* Top Badge: WHY FUNDRYX */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-md text-[11px] font-title font-bold tracking-widest text-[#111614] uppercase mb-12 shadow-sm">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current text-[#111614]">
            <path d="M12 2a1 1 0 0 1 1 1v6.2l4.4-4.4a1 1 0 1 1 1.4 1.4L14.4 10.6H21a1 1 0 1 1 0 2h-6.6l4.4 4.4a1 1 0 1 1-1.4 1.4L13 14v6.2a1 1 0 1 1-2 0V14l-4.4 4.4a1 1 0 1 1-1.4-1.4l4.4-4.4H3a1 1 0 1 1 0-2h6.6L5.2 6.2a1 1 0 1 1 1.4-1.4L11 9.2V3a1 1 0 0 1 1-1z" />
          </svg>
          <span>WHY FUNDRYX</span>
        </div>

        {/* Big Impact Statement with "Things" Luxury Serif and 3 inline keycap tiles */}
        <h2 className="font-hero text-3xl md:text-5xl lg:text-6xl font-normal tracking-[-0.02em] text-[#f5f7f5] leading-[1.25] max-w-4xl mx-auto">
          Fundryx{' '}
          <span className="inline-flex items-center gap-1.5 align-middle mx-1">
            {/* Tile 1: Terracotta brown */}
            <span className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#5a382e] text-[#f5f7f5] shadow-inner">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M12 2a1 1 0 0 1 1 1v6.2l4.4-4.4a1 1 0 1 1 1.4 1.4L14.4 10.6H21a1 1 0 1 1 0 2h-6.6l4.4 4.4a1 1 0 1 1-1.4 1.4L13 14v6.2a1 1 0 1 1-2 0V14l-4.4 4.4a1 1 0 1 1-1.4-1.4l4.4-4.4H3a1 1 0 1 1 0-2h6.6L5.2 6.2a1 1 0 1 1 1.4-1.4L11 9.2V3a1 1 0 0 1 1-1z" />
              </svg>
            </span>
            {/* Tile 2: Tan beige */}
            <span className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#948373] text-[#111614] shadow-inner">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M12 2a1 1 0 0 1 1 1v6.2l4.4-4.4a1 1 0 1 1 1.4 1.4L14.4 10.6H21a1 1 0 1 1 0 2h-6.6l4.4 4.4a1 1 0 1 1-1.4 1.4L13 14v6.2a1 1 0 1 1-2 0V14l-4.4 4.4a1 1 0 1 1-1.4-1.4l4.4-4.4H3a1 1 0 1 1 0-2h6.6L5.2 6.2a1 1 0 1 1 1.4-1.4L11 9.2V3a1 1 0 0 1 1-1z" />
              </svg>
            </span>
            {/* Tile 3: Cream bone */}
            <span className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#eee8dc] text-[#111614] shadow-inner">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M12 2a1 1 0 0 1 1 1v6.2l4.4-4.4a1 1 0 1 1 1.4 1.4L14.4 10.6H21a1 1 0 1 1 0 2h-6.6l4.4 4.4a1 1 0 1 1-1.4 1.4L13 14v6.2a1 1 0 1 1-2 0V14l-4.4 4.4a1 1 0 1 1-1.4-1.4l4.4-4.4H3a1 1 0 1 1 0-2h6.6L5.2 6.2a1 1 0 1 1 1.4-1.4L11 9.2V3a1 1 0 0 1 1-1z" />
              </svg>
            </span>
          </span>{' '}
          gives controllers their evenings back: automatic reconciliation, live cash positions and reports your board will actually{' '}
          <span className="text-[#45544c] italic">read.</span>
        </h2>

        {/* 3 Metrics with "Strong" Didone Title font */}
        <div className="w-full mt-24 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#1e2f26] border-t border-[#1e2f26] pt-12">
          {/* Stat 1 */}
          <div className="flex flex-col items-center py-6 md:py-0 px-4">
            <span className="font-title text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">
              4,000+
            </span>
            <span className="font-body text-xs text-[#7e9487] font-normal tracking-wide">
              Finance teams & borrowers
            </span>
          </div>

          {/* Stat 2 */}
          <div className="flex flex-col items-center py-6 md:py-0 px-4">
            <span className="font-title text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">
              3.5×
            </span>
            <span className="font-body text-xs text-[#7e9487] font-normal tracking-wide">
              Faster capital deployment
            </span>
          </div>

          {/* Stat 3 */}
          <div className="flex flex-col items-center py-6 md:py-0 px-4">
            <span className="font-title text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">
              $12B
            </span>
            <span className="font-body text-xs text-[#7e9487] font-normal tracking-wide">
              Reconciled protocol volume
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
