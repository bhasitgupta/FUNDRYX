import React from 'react';
import { X } from 'lucide-react';

const MetaMaskIcon = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 318 318" fill="none">
    <path d="M274.1 35.5L174.6 109.4L193 65.8L274.1 35.5Z" fill="#E17726" stroke="#E17726" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M43.9 35.5L142.3 109.4L124.9 65.8L43.9 35.5Z" fill="#E27625" stroke="#E27625" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M238.3 206.8L211.8 247.4L268.5 263L284.8 207.7L238.3 206.8Z" fill="#E27625" stroke="#E27625" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M33.2 207.7L49.5 263L106.2 247.4L79.7 206.8L33.2 207.7Z" fill="#E27625" stroke="#E27625" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M96.8 136.2L74.8 169.6L130.8 172.1L128.9 111.4L96.8 136.2Z" fill="#E27625" stroke="#E27625" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M221.2 136.2L188.7 110.8L187.2 172.1L243.2 169.6L221.2 136.2Z" fill="#E27625" stroke="#E27625" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M106.2 247.4L138.8 230.9L111.6 208.1L106.2 247.4Z" fill="#D5BFB2" stroke="#D5BFB2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M211.8 247.4L206.4 208.1L179.2 230.9L211.8 247.4Z" fill="#D5BFB2" stroke="#D5BFB2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M179.2 230.9L206.4 208.1L187.2 172.1L174.6 230.9H179.2Z" fill="#233447" stroke="#233447" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M111.6 208.1L138.8 230.9H143.4L130.8 172.1L111.6 208.1Z" fill="#233447" stroke="#233447" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M138.8 230.9L106.2 247.4L144.9 268.4L143.4 230.9H138.8Z" fill="#CC6228" stroke="#CC6228" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M174.6 230.9L173.1 268.4L211.8 247.4L179.2 230.9H174.6Z" fill="#CC6228" stroke="#CC6228" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M211.8 247.4L173.1 268.4L177.7 289.4L211.8 247.4Z" fill="#E27525" stroke="#E27525" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M106.2 247.4L140.3 289.4L144.9 268.4L106.2 247.4Z" fill="#E27525" stroke="#E27525" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M144.9 268.4L140.3 289.4L159 299.9L177.7 289.4L173.1 268.4L159 275.9L144.9 268.4Z" fill="#F5841F" stroke="#F5841F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CoinbaseIcon = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <rect width="100" height="100" rx="22" fill="#0052FF" />
    <path fillRule="evenodd" clipRule="evenodd" d="M50 20C33.4315 20 20 33.4315 20 50C20 66.5685 33.4315 80 50 80C66.5685 80 80 66.5685 80 50C80 33.4315 66.5685 20 50 20ZM42.5 38.5C40.2909 38.5 38.5 40.2909 38.5 42.5V57.5C38.5 59.7091 40.2909 61.5 42.5 61.5H57.5C59.7091 61.5 61.5 59.7091 61.5 57.5V42.5C61.5 40.2909 59.7091 38.5 57.5 38.5H42.5Z" fill="white"/>
  </svg>
);

const WalletConnectIcon = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <rect width="100" height="100" rx="22" fill="#3B99FC" />
    <path
      d="M28 39C40.15 27 59.85 27 72 39L74.4 41.4C75.2 42.2 75.2 43.4 74.4 44.2L68.8 49.8C68.4 50.2 67.8 50.2 67.4 49.8L63.8 46.2C56.2 38.6 43.8 38.6 36.2 46.2L32.4 50C32 50.4 31.4 50.4 31 50L25.4 44.4C24.6 43.6 24.6 42.4 25.4 41.6L28 39ZM79.6 51.4L84.4 56.2C85.2 57 85.2 58.2 84.4 59L63.8 79.6C63 80.4 61.8 80.4 61 79.6L46.8 65.4C46.4 65 45.8 65 45.4 65.4L32.2 78.6C31.4 79.4 30.2 79.4 29.4 78.6L8.8 58C8 57.2 8 56 8.8 55.2L13.6 50.4C14.4 49.6 15.6 49.6 16.4 50.4L29.8 63.8C30.2 64.2 30.8 64.2 31.2 63.8L44.4 50.6C45.2 49.8 46.4 49.8 47.2 50.6L60.4 63.8C60.8 64.2 61.4 64.2 61.8 63.8L76.8 51.4C77.6 50.6 78.8 50.6 79.6 51.4Z"
      fill="white"
    />
  </svg>
);

const PhantomIcon = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <rect width="100" height="100" rx="22" fill="#534BAE" />
    <path
      d="M74 50C74 61.05 65.05 70 54 70C49.95 70 46.2 68.75 43.1 66.6L35 70L36.7 61.8C33.6 58.4 31.7 54 31.7 49.3C31.7 38.25 40.65 29.3 51.7 29.3C64.02 29.3 74 38.58 74 50Z"
      fill="#AB9FF2"
    />
    <circle cx="46" cy="48" r="4.5" fill="white" />
    <circle cx="58" cy="48" r="4.5" fill="white" />
  </svg>
);

export default function WalletModal({ isOpen, onClose, onSelectWallet }) {
  if (!isOpen) return null;

  const walletOptions = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: <MetaMaskIcon size={60} />,
      hoverBorder: 'hover:border-[#E2761B]',
      hoverBg: 'hover:bg-[#E2761B]/10',
      glowColor: 'group-hover:shadow-[0_0_24px_rgba(226,118,27,0.3)]',
    },
    {
      id: 'coinbase',
      name: 'Coinbase',
      icon: <CoinbaseIcon size={60} />,
      hoverBorder: 'hover:border-[#0052FF]',
      hoverBg: 'hover:bg-[#0052FF]/10',
      glowColor: 'group-hover:shadow-[0_0_24px_rgba(0,82,255,0.3)]',
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: <WalletConnectIcon size={60} />,
      hoverBorder: 'hover:border-[#3B99FC]',
      hoverBg: 'hover:bg-[#3B99FC]/10',
      glowColor: 'group-hover:shadow-[0_0_24px_rgba(59,153,252,0.3)]',
    },
    {
      id: 'phantom',
      name: 'Phantom',
      icon: <PhantomIcon size={60} />,
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

        {/* 2x2 Grid of Big Wallet Tiles (Original logos, No descriptions) */}
        <div className="grid grid-cols-2 gap-3.5 sm:gap-4 my-6">
          {walletOptions.map((w) => (
            <button
              key={w.id}
              onClick={() => onSelectWallet(w.id)}
              className={`group relative flex flex-col items-center justify-center p-6 sm:p-7 rounded-2xl bg-[#111c15] border border-[#213829] ${w.hoverBorder} ${w.hoverBg} transition-all duration-200 cursor-pointer text-center hover:-translate-y-1 hover:scale-[1.02] shadow-md ${w.glowColor}`}
            >
              {/* Big authentic official icon */}
              <div className="mb-3.5 transform group-hover:scale-110 transition-transform duration-200">
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
