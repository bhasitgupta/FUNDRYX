import React, { useState } from "react";
import { ArrowLeft, Shield } from "lucide-react";

interface ChooseCryptoWalletLoginProps {
  onSelectWallet?: (walletId: string) => void;
  onBack?: () => void;
  connectedAddress?: string | null;
}

const MetaMaskIcon = ({ size = 48 }) => (
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

const CoinbaseIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <circle cx="50" cy="50" r="50" fill="#0052FF" />
    <rect x="32" y="32" width="36" height="36" rx="8" fill="white" />
    <rect x="42" y="42" width="16" height="16" rx="3.5" fill="#0052FF" />
  </svg>
);

const WalletConnectIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <circle cx="50" cy="50" r="50" fill="#3B99FC" />
    <path
      d="M28 39C40.15 27 59.85 27 72 39L74.4 41.4C75.2 42.2 75.2 43.4 74.4 44.2L68.8 49.8C68.4 50.2 67.8 50.2 67.4 49.8L63.8 46.2C56.2 38.6 43.8 38.6 36.2 46.2L32.4 50C32 50.4 31.4 50.4 31 50L25.4 44.4C24.6 43.6 24.6 42.4 25.4 41.6L28 39ZM79.6 51.4L84.4 56.2C85.2 57 85.2 58.2 84.4 59L63.8 79.6C63 80.4 61.8 80.4 61 79.6L46.8 65.4C46.4 65 45.8 65 45.4 65.4L32.2 78.6C31.4 79.4 30.2 79.4 29.4 78.6L8.8 58C8 57.2 8 56 8.8 55.2L13.6 50.4C14.4 49.6 15.6 49.6 16.4 50.4L29.8 63.8C30.2 64.2 30.8 64.2 31.2 63.8L44.4 50.6C45.2 49.8 46.4 49.8 47.2 50.6L60.4 63.8C60.8 64.2 61.4 64.2 61.8 63.8L76.8 51.4C77.6 50.6 78.8 50.6 79.6 51.4Z"
      fill="white"
    />
  </svg>
);

const PhantomIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <circle cx="50" cy="50" r="50" fill="#AB9FF2" />
    <path
      d="M72 50C72 61.0457 63.0457 70 52 70C47.95 70 44.2 68.75 41.1 66.6L33 70L34.7 61.8C31.6 58.4 29.7 54 29.7 49.3C29.7 38.2543 38.6543 29.3 49.7 29.3C62.0163 29.3 72 38.5817 72 50Z"
      fill="#534BAE"
    />
    <circle cx="44" cy="48" r="4.5" fill="white" />
    <circle cx="56" cy="48" r="4.5" fill="white" />
  </svg>
);

const WALLET_LIST = [
  {
    id: "metamask",
    name: "MetaMask",
    icon: <MetaMaskIcon size={52} />,
    hoverBorder: "hover:border-[#E2761B]",
    hoverBg: "hover:bg-[#E2761B]/10",
    glowColor: "hover:shadow-[0_0_24px_rgba(226,118,27,0.3)]",
    tag: "Popular",
    tagColor: "bg-[#E2761B]/20 text-[#F6851B] border-[#E2761B]/40",
  },
  {
    id: "coinbase",
    name: "Coinbase",
    icon: <CoinbaseIcon size={52} />,
    hoverBorder: "hover:border-[#0052FF]",
    hoverBg: "hover:bg-[#0052FF]/10",
    glowColor: "hover:shadow-[0_0_24px_rgba(0,82,255,0.3)]",
    tag: "EVM",
    tagColor: "bg-[#0052FF]/20 text-[#3B99FC] border-[#0052FF]/40",
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    icon: <WalletConnectIcon size={52} />,
    hoverBorder: "hover:border-[#3B99FC]",
    hoverBg: "hover:bg-[#3B99FC]/10",
    glowColor: "hover:shadow-[0_0_24px_rgba(59,153,252,0.3)]",
    tag: "QR Mobile",
    tagColor: "bg-[#3B99FC]/20 text-[#60A5FA] border-[#3B99FC]/40",
  },
  {
    id: "phantom",
    name: "Phantom",
    icon: <PhantomIcon size={52} />,
    hoverBorder: "hover:border-[#AB9FF2]",
    hoverBg: "hover:bg-[#AB9FF2]/10",
    glowColor: "hover:shadow-[0_0_24px_rgba(171,159,242,0.3)]",
    tag: "Multi-Chain",
    tagColor: "bg-[#AB9FF2]/20 text-[#C4B5FD] border-[#AB9FF2]/40",
  },
];

export default function ChooseCryptoWalletLogin({
  onSelectWallet,
  onBack,
  connectedAddress,
}: ChooseCryptoWalletLoginProps) {
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const handleWalletClick = (walletId: string) => {
    setConnectingId(walletId);
    if (onSelectWallet) {
      onSelectWallet(walletId);
    }
    setTimeout(() => setConnectingId(null), 1200);
  };

  return (
    <div className="min-h-screen bg-[#080d0a] text-white flex items-center justify-center p-4 md:p-8 font-body">
      <div className="w-full max-w-lg rounded-3xl bg-[#0c140f] border border-[#1e3325] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-[#0052FF]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1b2f23]">
          {onBack ? (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Back to Portal</span>
            </button>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-[11px] font-mono text-emerald-400">
            <Shield size={12} />
            <span>Polygon Amoy Verified</span>
          </div>
        </div>

        {/* Brand Header with Fundryx Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-14 px-4 py-2 rounded-2xl bg-[#142319] border border-[#233c2c] mb-3 shadow-inner">
            <img
              src="/fundryx-logo.png"
              alt="Fundryx"
              className="h-8 w-auto object-contain"
            />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Connect to Fundryx
          </h2>
          <p className="text-xs sm:text-sm text-[#7e9988] mt-1 max-w-sm mx-auto">
            Select an institutional Web3 provider for zero-collateral capital facilities.
          </p>
        </div>

        {/* 2x2 Big Tiles Grid */}
        <div className="grid grid-cols-2 gap-3.5 sm:gap-4 my-6">
          {WALLET_LIST.map((w) => {
            const isThisConnecting = connectingId === w.id;
            return (
              <button
                key={w.id}
                onClick={() => handleWalletClick(w.id)}
                disabled={connectingId !== null}
                className={`group relative flex flex-col items-center justify-center p-5 sm:p-6 rounded-2xl bg-[#111c15] border border-[#213829] ${w.hoverBorder} ${w.hoverBg} transition-all duration-200 cursor-pointer text-center hover:-translate-y-1 hover:scale-[1.02] shadow-md ${w.glowColor}`}
              >
                {/* Tag */}
                {w.tag && (
                  <span
                    className={`absolute top-2.5 right-2.5 text-[10px] font-medium uppercase px-2 py-0.5 rounded-full border ${w.tagColor}`}
                  >
                    {w.tag}
                  </span>
                )}

                {/* Big official logo */}
                <div className="mb-3.5 transform group-hover:scale-110 transition-transform duration-200">
                  {w.icon}
                </div>

                {/* Name without description */}
                <span className="text-sm sm:text-base font-semibold text-white tracking-tight">
                  {w.name}
                </span>

                {/* Status indicator */}
                <span className="mt-1 text-[11px] font-mono text-[#6c8574] group-hover:text-emerald-400 transition-colors">
                  {isThisConnecting ? "Connecting..." : "Connect →"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-3.5 border-t border-[#1b2f23] flex items-center justify-between text-[11px] text-[#6d8475]">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Non-custodial connection</span>
          </span>
          <span className="font-mono text-[#526659]">Chain ID: 80002</span>
        </div>
      </div>
    </div>
  );
}
