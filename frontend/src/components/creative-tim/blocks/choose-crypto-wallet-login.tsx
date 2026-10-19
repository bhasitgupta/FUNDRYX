import React, { useState } from "react";
import { ArrowLeft, Check, Shield, Search } from "lucide-react";

interface ChooseCryptoWalletLoginProps {
  onSelectWallet?: (walletId: string) => void;
  onBack?: () => void;
  connectedAddress?: string | null;
}

const WALLET_LIST = [
  {
    id: "metamask",
    name: "MetaMask",
    desc: "Browser extension & mobile app",
    icon: "https://v3.material-tailwind.com/icon/metamask.svg",
    popular: true,
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    desc: "Self-custody crypto wallet",
    icon: "https://v3.material-tailwind.com/icon/coinbase.svg",
    popular: true,
  },
  {
    id: "trust",
    name: "Trust Wallet",
    desc: "Multi-chain crypto wallet",
    icon: "https://v3.material-tailwind.com/icon/trust.svg",
  },
  {
    id: "phantom",
    name: "Phantom",
    desc: "EVM & Solana supported",
    icon: "https://raw.githubusercontent.com/phantom/sign-in-with-phantom/main/assets/phantom-icon-purple.svg",
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    desc: "Connect 400+ mobile wallets via QR",
    icon: "https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Logo/Blue%20(Default)/Logo.svg",
  },
];

export default function ChooseCryptoWalletLogin({
  onSelectWallet,
  onBack,
  connectedAddress,
}: ChooseCryptoWalletLoginProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string>("metamask");
  const [isConnecting, setIsConnecting] = useState(false);

  const filtered = WALLET_LIST.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.desc.toLowerCase().includes(search.toLowerCase())
  );

  const handleConnectClick = () => {
    setIsConnecting(true);
    if (onSelectWallet) {
      onSelectWallet(selected);
    }
    setTimeout(() => setIsConnecting(false), 800);
  };

  return (
    <div className="min-h-screen bg-[#080d0a] text-white flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-lg rounded-2xl bg-[#0e1712] border border-[#1d2f23] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-emerald-700/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between mb-6">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Back to Portal</span>
            </button>
          )}
          <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-[11px] font-mono text-emerald-400">
            <Shield size={12} />
            <span>Polygon Amoy Verified</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
            Choose Your Wallet
          </h2>
          <p className="text-sm text-[#8fa799] max-w-sm mx-auto">
            Select an institutional or Web3 wallet for non-custodial access to Fundryx credit pools.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5c7265]"
          />
          <input
            id="wallet-search"
            type="text"
            placeholder="Search through 50+ wallets available..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#14221a] border border-[#22392b] text-sm text-white placeholder-[#5c7265] focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Wallet Options List */}
        <div className="space-y-2 mb-6 max-h-[300px] overflow-y-auto pr-1">
          {filtered.map((item) => {
            const isSelected = selected === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelected(item.id)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition cursor-pointer ${
                  isSelected
                    ? "bg-emerald-950/40 border-emerald-500 text-white shadow-sm shadow-emerald-950/50"
                    : "bg-[#121d17] border-[#1d2f23] text-[#c0d0c6] hover:bg-[#16251d] hover:border-[#2b4433]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center shrink-0">
                    <img
                      src={item.icon}
                      alt={item.name}
                      className="w-5 h-5 object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm truncate text-white">
                        {item.name}
                      </span>
                      {item.popular && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Popular
                        </span>
                      )}
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#71877b] block truncate">
                      {item.desc}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 ml-3">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? "bg-emerald-500 border-emerald-500 text-black"
                        : "border-[#2b4433] bg-transparent"
                    }`}
                  >
                    {isSelected && <Check size={12} strokeWidth={3} />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Primary Action Button */}
        <button
          onClick={handleConnectClick}
          disabled={isConnecting}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black shadow-lg shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2"
        >
          {isConnecting ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Connecting...
            </span>
          ) : (
            <span>Connect {WALLET_LIST.find((w) => w.id === selected)?.name || "Wallet"}</span>
          )}
        </button>

        {/* Footer info */}
        <div className="mt-5 text-center">
          <p className="text-[11px] text-[#61776b]">
            Upon signing in, you consent to abide by our{" "}
            <a href="#terms" className="text-emerald-400 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#terms" className="text-emerald-400 hover:underline">
              Risk Disclosures
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
