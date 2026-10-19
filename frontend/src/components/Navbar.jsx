import React, { useState } from 'react';

export default function Navbar({ wallet, onConnect, onDisconnect, activeTab, setActiveTab }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const formatAddr = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-6 md:px-8 py-5 pointer-events-none transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
        {/* Left: Pill Logo + Green Menu Toggle */}
        <div className="flex items-center gap-2">
          {/* Logo Pill */}
          <div 
            onClick={() => setActiveTab('hero')} 
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#cacac0] rounded-lg shadow-xs cursor-pointer hover:border-[#9e9e94] transition-colors"
          >
            {/* Asterisk flower logo */}
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#111614] fill-current" aria-hidden="true">
              <path d="M12 2a1 1 0 0 1 1 1v6.2l4.4-4.4a1 1 0 1 1 1.4 1.4L14.4 10.6H21a1 1 0 1 1 0 2h-6.6l4.4 4.4a1 1 0 1 1-1.4 1.4L13 14v6.2a1 1 0 1 1-2 0V14l-4.4 4.4a1 1 0 1 1-1.4-1.4l4.4-4.4H3a1 1 0 1 1 0-2h6.6L5.2 6.2a1 1 0 1 1 1.4-1.4L11 9.2V3a1 1 0 0 1 1-1z" />
            </svg>
            <span className="text-sm font-semibold tracking-tight text-[#111614]">fundryx.</span>
          </div>

          {/* Dark Green Menu Button [=] */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            className="w-8 h-8 rounded-lg bg-[#263e34] hover:bg-[#1f332b] flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors"
          >
            <span className="w-3.5 h-[1.8px] bg-white rounded-full"></span>
            <span className="w-3.5 h-[1.8px] bg-white rounded-full"></span>
          </button>
        </div>

        {/* Center Spacer */}
        <div className="hidden md:block" />

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2">
          {wallet.address ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onDisconnect}
                title="Disconnect wallet"
                className="bg-[#263e34] hover:bg-[#1f332b] text-white text-xs font-medium px-3.5 py-1.5 rounded-md shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="font-mono">{formatAddr(wallet.address)}</span>
              </button>
              <button
                onClick={() => setActiveTab('terminal')}
                className="bg-white hover:bg-[#f6f6f2] border border-[#cacac0] text-[#111614] text-xs font-medium px-3.5 py-1.5 rounded-md shadow-xs transition-all cursor-pointer"
              >
                Terminal
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onConnect}
                className="bg-[#263e34] hover:bg-[#1f332b] text-white text-xs font-medium px-4 py-1.5 rounded-md shadow-xs transition-all cursor-pointer"
              >
                Log in
              </button>
              <button
                onClick={() => {
                  onConnect();
                  setActiveTab('terminal');
                }}
                className="bg-white hover:bg-[#f6f6f2] border border-[#cacac0] text-[#111614] text-xs font-medium px-4 py-1.5 rounded-md shadow-xs transition-all cursor-pointer"
              >
                Sign up
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 max-w-7xl mx-auto p-4 bg-white border border-[#cacac0] rounded-xl shadow-lg flex flex-col gap-3 text-sm">
          <button 
            onClick={() => { setActiveTab('terminal'); setMobileMenuOpen(false); }}
            className="text-left py-1 text-[#111614] hover:text-emerald-700 font-medium"
          >
            Capital Pool & Lending
          </button>
          <button 
            onClick={() => { setActiveTab('why-fundryx'); setMobileMenuOpen(false); }}
            className="text-left py-1 text-[#111614] hover:text-emerald-700 font-medium"
          >
            Why Fundryx (Credit Scoring)
          </button>
          <button 
            onClick={() => { setActiveTab('inside-app'); setMobileMenuOpen(false); }}
            className="text-left py-1 text-[#111614] hover:text-emerald-700 font-medium"
          >
            Ledger & Heatmap
          </button>
          <button 
            onClick={() => { setActiveTab('contracts'); setMobileMenuOpen(false); }}
            className="text-left py-1 text-[#111614] hover:text-emerald-700 font-medium"
          >
            Institutional Contract Transparency
          </button>
        </div>
      )}
    </header>
  );
}
