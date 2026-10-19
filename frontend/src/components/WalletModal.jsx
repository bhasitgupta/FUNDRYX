import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

const MetaMaskIcon = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
    <path d="M29.07 4.23L17.7 12.63 20.07 6.87 29.07 4.23z" fill="#E2761B" />
    <path d="M2.93 4.23L11.8 6.83 14.3 12.63 2.93 4.23z" fill="#E4761B" />
    <path d="M25.03 22.47L22.2 26.83 28.2 28.5 29.83 22.63 25.03 22.47z" fill="#E4761B" />
    <path d="M2.17 22.63L3.8 28.5 9.8 26.83 6.97 22.47 2.17 22.63z" fill="#E4761B" />
    <path d="M9.53 14.37L7.47 17.5 13.57 17.8 13.37 11.23 9.53 14.37z" fill="#E4761B" />
    <path d="M22.47 14.37L18.57 11.17 18.43 17.8 24.53 17.5 22.47 14.37z" fill="#E4761B" />
    <path d="M9.8 26.83L13.23 25.1 10.37 22.6 9.8 26.83z" fill="#D7C1B3" />
    <path d="M22.2 26.83L21.63 22.6 18.77 25.1 22.2 26.83z" fill="#D7C1B3" />
    <path d="M13.23 25.1L18.77 25.1 16 28.93 13.23 25.1z" fill="#233447" />
    <path d="M18.77 25.1L21.63 22.6 18.43 17.8 13.57 17.8 10.37 22.6 13.23 25.1 18.77 25.1z" fill="#CD6116" />
  </svg>
);

const CoinbaseIcon = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#0052FF"/>
    <rect x="10.5" y="10.5" width="11" height="11" rx="2.5" fill="white"/>
    <rect x="13.5" y="13.5" width="5" height="5" rx="1" fill="#0052FF"/>
  </svg>
);

const WalletConnectIcon = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="16" fill="#3B99FC"/>
    <path d="M9.5 12.5C13.09 8.91 18.91 8.91 22.5 12.5L23.2 13.2C23.4 13.4 23.4 13.7 23.2 13.9L21.6 15.5C21.5 15.6 21.3 15.6 21.2 15.5L20.2 14.5C17.88 12.18 14.12 12.18 11.8 14.5L10.7 15.6C10.6 15.7 10.4 15.7 10.3 15.6L8.7 14C8.5 13.8 8.5 13.5 8.7 13.3L9.5 12.5ZM25.4 15.4L26.8 16.8C27 17 27 17.3 26.8 17.5L20.8 23.5C20.6 23.7 20.3 23.7 20.1 23.5L16 19.4C15.9 19.3 15.8 19.3 15.7 19.4L11.9 23.2C11.7 23.4 11.4 23.4 11.2 23.2L5.2 17.2C5 17 5 16.7 5.2 16.5L6.6 15.1C6.8 14.9 7.1 14.9 7.3 15.1L11.2 19C11.3 19.1 11.4 19.1 11.5 19L15.3 15.2C15.5 15 15.8 15 16 15.2L19.8 19C19.9 19.1 20 19.1 20.1 19L24.7 15.4C24.9 15.2 25.2 15.2 25.4 15.4Z" fill="white"/>
  </svg>
);

const PhantomIcon = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="16" fill="#AB9FF2"/>
    <path d="M22.5 16C22.5 19.59 19.59 22.5 16 22.5C14.7 22.5 13.5 22.1 12.5 21.4L10 22.5L10.5 19.8C9.5 18.7 9 17.4 9 16C9 12.41 11.91 9.5 16 9.5C20.09 9.5 22.5 12.41 22.5 16Z" fill="#534BAE"/>
    <circle cx="14" cy="15.5" r="1.5" fill="white"/>
    <circle cx="18" cy="15.5" r="1.5" fill="white"/>
  </svg>
);

export default function WalletModal({ isOpen, onClose, onSelectWallet }) {
  if (!isOpen) return null;

  const walletOptions = [
    {
      id: 'metamask',
      name: 'MetaMask',
      desc: 'Connect using MetaMask browser extension',
      icon: <MetaMaskIcon />,
      badge: 'Popular',
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      desc: 'Connect via Coinbase app or extension',
      icon: <CoinbaseIcon />,
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      desc: 'Scan QR code with any mobile Web3 wallet',
      icon: <WalletConnectIcon />,
    },
    {
      id: 'phantom',
      name: 'Phantom',
      desc: 'Multi-chain Web3 wallet',
      icon: <PhantomIcon />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-body">
      <div className="relative w-full max-w-md bg-[#121d17] border border-[#23382c] rounded-2xl shadow-2xl p-6 text-white overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1f3328]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1c2e25] border border-[#2b4739] flex items-center justify-center text-emerald-400">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-normal font-body">Connect Wallet</h2>
              <p className="text-xs text-[#8ca395] font-body">Select your institutional or Web3 provider</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1c2e25] hover:bg-[#263e34] text-[#8ca395] hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Wallets List */}
        <div className="mt-4 space-y-2.5">
          {walletOptions.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => onSelectWallet(wallet.id)}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all text-left cursor-pointer group ${
                wallet.highlight
                  ? 'bg-gradient-to-r from-[#1c2e25] to-[#15231c] border-emerald-500/40 hover:border-emerald-400 shadow-md'
                  : 'bg-[#15231c]/60 hover:bg-[#1c2e25] border-[#23382c] hover:border-[#355241]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                  {wallet.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors font-body">
                      {wallet.name}
                    </span>
                    {wallet.badge && (
                      <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {wallet.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#8ca395] mt-0.5 font-body">{wallet.desc}</p>
                </div>
              </div>
              <span className="text-xs text-[#8ca395] group-hover:text-white group-hover:translate-x-1 transition-all">
                →
              </span>
            </button>
          ))}
        </div>

        {/* Security Footer Note */}
        <div className="mt-5 pt-3.5 border-t border-[#1f3328] flex items-center justify-between text-[11px] text-[#728579] font-body">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Non-custodial connection</span>
          </span>
          <span>Terms & Disclosures apply</span>
        </div>
      </div>
    </div>
  );
}
