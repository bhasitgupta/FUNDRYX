import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";

interface ChooseCryptoWalletLoginProps {
  onSelectWallet?: (walletId: string) => void;
  onBack?: () => void;
  connectedAddress?: string | null;
}

const WALLET_LIST = [
  {
    id: "metamask",
    name: "MetaMask",
    icon: (
      <img
        src="/wallets/metamask.png"
        alt="MetaMask"
        className="w-16 h-16 object-contain drop-shadow-md"
      />
    ),
    hoverBorder: "hover:border-[#E2761B]",
    hoverBg: "hover:bg-[#E2761B]/10",
    glowColor: "hover:shadow-[0_0_24px_rgba(226,118,27,0.3)]",
  },
  {
    id: "coinbase",
    name: "Coinbase",
    icon: (
      <img
        src="/wallets/coinbase.png"
        alt="Coinbase"
        className="w-16 h-16 rounded-2xl object-cover shadow-md"
      />
    ),
    hoverBorder: "hover:border-[#0052FF]",
    hoverBg: "hover:bg-[#0052FF]/10",
    glowColor: "hover:shadow-[0_0_24px_rgba(0,82,255,0.3)]",
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    icon: (
      <img
        src="/wallets/walletconnect.png"
        alt="WalletConnect"
        className="w-16 h-16 object-contain drop-shadow-md"
      />
    ),
    hoverBorder: "hover:border-[#3B99FC]",
    hoverBg: "hover:bg-[#3B99FC]/10",
    glowColor: "hover:shadow-[0_0_24px_rgba(59,153,252,0.3)]",
  },
  {
    id: "phantom",
    name: "Phantom",
    icon: (
      <img
        src="/wallets/phantom.png"
        alt="Phantom"
        className="w-16 h-16 rounded-2xl object-cover shadow-md"
      />
    ),
    hoverBorder: "hover:border-[#AB9FF2]",
    hoverBg: "hover:bg-[#AB9FF2]/10",
    glowColor: "hover:shadow-[0_0_24px_rgba(171,159,242,0.3)]",
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
        </div>

        {/* Brand Header with Pure Vector Emblem (No text, No Polygon Amoy) */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#142319] border border-[#233c2c] mb-3 shadow-inner text-emerald-400">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" aria-hidden="true">
              <path d="M12 2a1 1 0 0 1 1 1v6.2l4.4-4.4a1 1 0 1 1 1.4 1.4L14.4 10.6H21a1 1 0 1 1 0 2h-6.6l4.4 4.4a1 1 0 1 1-1.4 1.4L13 14v6.2a1 1 0 1 1-2 0V14l-4.4 4.4a1 1 0 1 1-1.4-1.4l4.4-4.4H3a1 1 0 1 1 0-2h6.6L5.2 6.2a1 1 0 1 1 1.4-1.4L11 9.2V3a1 1 0 0 1 1-1z" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Connect Wallet
          </h2>
          <p className="text-xs sm:text-sm text-[#7e9988] mt-1 max-w-sm mx-auto">
            Select your institutional web provider
          </p>
        </div>

        {/* 2x2 Big Tiles Grid (Original official logos, No descriptions) */}
        <div className="grid grid-cols-2 gap-3.5 sm:gap-4 my-6">
          {WALLET_LIST.map((w) => {
            const isThisConnecting = connectingId === w.id;
            return (
              <button
                key={w.id}
                onClick={() => handleWalletClick(w.id)}
                disabled={connectingId !== null}
                className={`group relative flex flex-col items-center justify-center p-6 sm:p-7 rounded-2xl bg-[#111c15] border border-[#213829] ${w.hoverBorder} ${w.hoverBg} transition-all duration-200 cursor-pointer text-center hover:-translate-y-1 hover:scale-[1.02] shadow-md ${w.glowColor}`}
              >
                {/* Big official logo */}
                <div className="mb-3.5 transform group-hover:scale-110 transition-transform duration-200 flex items-center justify-center">
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
        <div className="pt-3.5 border-t border-[#1b2f23] flex items-center justify-center text-xs text-[#7e9988]">
          <span>Select your wallet</span>
        </div>
      </div>
    </div>
  );
}
