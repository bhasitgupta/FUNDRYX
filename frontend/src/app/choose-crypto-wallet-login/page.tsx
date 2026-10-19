import React from "react";
import ChooseCryptoWalletLogin from "@/components/creative-tim/blocks/choose-crypto-wallet-login";

interface PageProps {
  onSelectWallet?: (walletId: string) => void;
  onBack?: () => void;
  connectedAddress?: string | null;
}

export default function ChooseCryptoWalletLoginPage({
  onSelectWallet,
  onBack,
  connectedAddress,
}: PageProps) {
  return (
    <ChooseCryptoWalletLogin
      onSelectWallet={onSelectWallet}
      onBack={onBack}
      connectedAddress={connectedAddress}
    />
  );
}
