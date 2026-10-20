import React from 'react';
import { X } from 'lucide-react';

export default function WalletModal({ isOpen, onClose, onSelectWallet }) {
  if (!isOpen) return null;

  const walletOptions = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: (
        <img
          src="/wallets/metamask.png"
          alt="MetaMask"
          className="w-16 h-16 object-contain drop-shadow-md"
        />
      ),
      hoverBorder: 'hover:border-[#E2761B]',
      hoverBg: 'hover:bg-[#E2761B]/10',
      glowColor: 'group-hover:shadow-[0_0_24px_rgba(226,118,27,0.3)]',
    },
    {
      id: 'coinbase',
      name: 'Coinbase',
      icon: (
        <img
          src="/wallets/coinbase.png"
          alt="Coinbase"
          className="w-16 h-16 rounded-2xl object-cover shadow-md"
        />
      ),
      hoverBorder: 'hover:border-[#0052FF]',
      hoverBg: 'hover:bg-[#0052FF]/10',
      glowColor: 'group-hover:shadow-[0_0_24px_rgba(0,82,255,0.3)]',
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: (
        <img
          src="/wallets/walletconnect.png"
          alt="WalletConnect"
          className="w-16 h-16 object-contain drop-shadow-md"
        />
      ),
      hoverBorder: 'hover:border-[#3B99FC]',
      hoverBg: 'hover:bg-[#3B99FC]/10',
      glowColor: 'group-hover:shadow-[0_0_24px_rgba(59,153,252,0.3)]',
    },
    {
      id: 'phantom',
      name: 'Phantom',
      icon: (
        <img
          src="/wallets/phantom.png"
          alt="Phantom"
          className="w-16 h-16 rounded-2xl object-cover shadow-md"
        />
      ),
      hoverBorder: 'hover:border-[#AB9FF2]',
      hoverBg: 'hover:bg-[#AB9FF2]/10',
      glowColor: 'group-hover:shadow-[0_0_24px_rgba(171,159,242,0.3)]',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-body">
      <div className="relative w-full max-w-lg bg-[#0c140f] border border-[#1e3325] rounded-3xl shadow-2xl p-6 sm:p-7 text-white overflow-hidden">
        {/* Ambient glow backgrounds */}
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-[#0052FF]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header with Fundryx Brand Emblem Only (No text, No Polygon Amoy) */}
        <div className="flex items-center justify-between pb-5 border-b border-[#1b2f23]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#142319] border border-[#233c2c] flex items-center justify-center shadow-inner text-emerald-400">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                <path d="M12 2a1 1 0 0 1 1 1v6.2l4.4-4.4a1 1 0 1 1 1.4 1.4L14.4 10.6H21a1 1 0 1 1 0 2h-6.6l4.4 4.4a1 1 0 1 1-1.4 1.4L13 14v6.2a1 1 0 1 1-2 0V14l-4.4 4.4a1 1 0 1 1-1.4-1.4l4.4-4.4H3a1 1 0 1 1 0-2h6.6L5.2 6.2a1 1 0 1 1 1.4-1.4L11 9.2V3a1 1 0 0 1 1-1z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Connect Wallet</h2>
              <p className="text-xs text-[#7e9988] mt-0.5">Select your institutional web provider</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#142319] hover:bg-[#1d3224] text-[#8ca395] hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-[#233c2c]"
            title="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* 2x2 Grid of Big Wallet Tiles (Original official logos, No descriptions) */}
        <div className="grid grid-cols-2 gap-3.5 sm:gap-4 my-6">
          {walletOptions.map((w) => (
            <button
              key={w.id}
              onClick={() => onSelectWallet(w.id)}
              className={`group relative flex flex-col items-center justify-center p-6 sm:p-7 rounded-2xl bg-[#111c15] border border-[#213829] ${w.hoverBorder} ${w.hoverBg} transition-all duration-200 cursor-pointer text-center hover:-translate-y-1 hover:scale-[1.02] shadow-md ${w.glowColor}`}
            >
              {/* Big authentic official icon */}
              <div className="mb-3.5 transform group-hover:scale-110 transition-transform duration-200 flex items-center justify-center">
                {w.icon}
              </div>

              {/* Wallet Name without description */}
              <span className="text-sm sm:text-base font-semibold text-white tracking-tight group-hover:text-white">
                {w.name}
              </span>

              {/* Subtle hover indicator */}
              <span className="mt-1 text-[11px] font-mono text-[#6c8574] group-hover:text-emerald-400 transition-colors">
                Connect →
              </span>
            </button>
          ))}
        </div>

        {/* Footer Note */}
        <div className="pt-3.5 border-t border-[#1b2f23] flex items-center justify-center text-xs text-[#7e9988]">
          <span>Select your wallet</span>
        </div>
      </div>
    </div>
  );
}
