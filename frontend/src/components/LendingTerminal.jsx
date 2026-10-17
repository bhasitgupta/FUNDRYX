import React, { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, CheckCircle, ShieldCheck, DollarSign } from 'lucide-react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, ERC20_ABI, LENDING_POOL_ABI } from '../utils/contracts';

export default function LendingTerminal({ wallet, poolStats, onConnect, onRefresh }) {
  const [activeTab, setActiveTab] = useState('deposit');
  const [depositAmount, setDepositAmount] = useState('1000');
  const [borrowAmount, setBorrowAmount] = useState('100');
  const [repayAmount, setRepayAmount] = useState('100');
  const [repayLoanId, setRepayLoanId] = useState('0x0000000000000000000000000000000000000000000000000000000000000001');

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const [loans, setLoans] = useState([
    {
      id: '0x0000000000000000000000000000000000000000000000000000000000000001',
      principal: '150 FDX',
      due: 'In 6 days',
      status: 'Active',
      repaid: '0 FDX',
    },
    {
      id: '0x0000000000000000000000000000000000000000000000000000000000000002',
      principal: '100 FDX',
      due: 'Completed',
      status: 'Repaid',
      repaid: '100 FDX',
    },
  ]);

  const handleDeposit = async () => {
    if (!wallet.signer) {
      if (onConnect) onConnect();
      else alert('Please connect your Web3 wallet first.');
      return;
    }
    setLoading(true);
    setStatusMsg({ type: 'info', text: 'Submitting deposit transaction to protocol network...' });
    try {
      const tokenContract = new ethers.Contract(CONTRACT_ADDRESSES.FundryxToken, ERC20_ABI, wallet.signer);
      const poolContract = new ethers.Contract(CONTRACT_ADDRESSES.LendingPool, LENDING_POOL_ABI, wallet.signer);
      const parsedAmount = ethers.parseEther(depositAmount);

      setStatusMsg({ type: 'info', text: 'Step 1/2: Approving FDX allowance...' });
      const approveTx = await tokenContract.approve(CONTRACT_ADDRESSES.LendingPool, parsedAmount);
      await approveTx.wait();

      setStatusMsg({ type: 'info', text: 'Step 2/2: Depositing liquidity...' });
      const depositTx = await poolContract.deposit(parsedAmount);
      await depositTx.wait();

      setStatusMsg({ type: 'success', text: `Successfully deposited ${depositAmount} FDX into LendingPool!` });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: err.reason || err.message || 'Deposit failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async () => {
    if (!wallet.signer) {
      if (onConnect) onConnect();
      else alert('Please connect your Web3 wallet first.');
      return;
    }
    setLoading(true);
    setStatusMsg({ type: 'info', text: 'Submitting uncollateralized borrow request...' });
    try {
      const poolContract = new ethers.Contract(CONTRACT_ADDRESSES.LendingPool, LENDING_POOL_ABI, wallet.signer);
      const parsedAmount = ethers.parseEther(borrowAmount);

      const borrowTx = await poolContract.borrow(parsedAmount, 1);
      const receipt = await borrowTx.wait();

      setStatusMsg({ type: 'success', text: `Approved! Borrowed ${borrowAmount} FDX onchain.` });
      setLoans((prev) => [
        {
          id: receipt.hash.slice(0, 32) + '...',
          principal: `${borrowAmount} FDX`,
          due: 'In 7 days',
          status: 'Active',
          repaid: '0 FDX',
        },
        ...prev,
      ]);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: err.reason || err.message || 'Borrow failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRepay = async () => {
    if (!wallet.signer) {
      if (onConnect) onConnect();
      else alert('Please connect your Web3 wallet first.');
      return;
    }
    setLoading(true);
    setStatusMsg({ type: 'info', text: 'Submitting repayment to protocol network...' });
    try {
      const tokenContract = new ethers.Contract(CONTRACT_ADDRESSES.FundryxToken, ERC20_ABI, wallet.signer);
      const poolContract = new ethers.Contract(CONTRACT_ADDRESSES.LendingPool, LENDING_POOL_ABI, wallet.signer);
      const parsedAmount = ethers.parseEther(repayAmount);

      setStatusMsg({ type: 'info', text: 'Step 1/2: Approving FDX repayment allowance...' });
      const approveTx = await tokenContract.approve(CONTRACT_ADDRESSES.LendingPool, parsedAmount);
      await approveTx.wait();

      setStatusMsg({ type: 'info', text: 'Step 2/2: Confirming repayment...' });
      const repayTx = await poolContract.repay(repayLoanId, parsedAmount);
      await repayTx.wait();

      setStatusMsg({ type: 'success', text: `Successfully repaid ${repayAmount} FDX. Credit score updated!` });
      setLoans((prev) =>
        prev.map((l) => (l.id === repayLoanId ? { ...l, status: 'Repaid', repaid: `${repayAmount} FDX` } : l))
      );
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: err.reason || err.message || 'Repayment failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleMintTokens = async () => {
    if (!wallet.signer) {
      if (onConnect) onConnect();
      else alert('Please connect your Web3 wallet first.');
      return;
    }
    setLoading(true);
    setStatusMsg({ type: 'info', text: 'Minting 10,000 FDX test tokens...' });
    try {
      const tokenContract = new ethers.Contract(CONTRACT_ADDRESSES.FundryxToken, ERC20_ABI, wallet.signer);
      const mintTx = await tokenContract.mint(wallet.address, ethers.parseEther('10000'));
      await mintTx.wait();
      setStatusMsg({ type: 'success', text: 'Minted 10,000 FDX to your address!' });
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: err.reason || 'Mint failed. (Deployer only).' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-10">
        <div>
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 mb-3 text-xs text-[#8ca395] font-medium tracking-tight">
            <span className="font-title text-[10px] tracking-wider uppercase text-emerald-400">Stage III</span>
            <span>·</span>
            <span className="text-[#ecebe1] font-semibold font-title text-[11px] tracking-wider uppercase">Capital Operations</span>
          </div>
          <h2 className="font-title text-3xl md:text-5xl font-bold tracking-tight text-white">
            Capital Pool & Lending Portal
          </h2>
          <p className="font-body text-sm text-[#9da59f] mt-2 max-w-xl">
            Deploy capital into uncollateralized lending vaults or request liquidity governed by deterministic credit policies.
          </p>
        </div>

        <button
          onClick={handleMintTokens}
          disabled={loading}
          className="font-body inline-flex items-center gap-2 px-4 py-2.5 bg-[#1c2e25] hover:bg-[#233b2e] border border-[#2d4739] text-[#ecebe1] text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
        >
          <DollarSign size={14} className="text-emerald-400" />
          <span>Mint 10,000 Test FDX</span>
        </button>
      </div>

      {statusMsg && (
        <div
          className={`mb-6 p-4 rounded-xl text-xs font-mono flex items-center justify-between border ${
            statusMsg.type === 'success'
              ? 'bg-[#152e22] border-emerald-600/50 text-emerald-300'
              : statusMsg.type === 'error'
              ? 'bg-[#331818] border-rose-700/50 text-rose-300'
              : 'bg-[#152336] border-sky-700/50 text-sky-300'
          }`}
        >
          <span>{statusMsg.text}</span>
          <button onClick={() => setStatusMsg(null)} className="ml-2 font-bold cursor-pointer">✕</button>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Terminal Card */}
        <div className="lg:col-span-7 bg-[#15231c] rounded-2xl p-6 md:p-8 border border-[#23382c] shadow-xl flex flex-col justify-between">
          <div>
            {/* Action Tabs */}
            <div className="flex border-b border-[#23382c] pb-4 gap-2">
              {[
                { id: 'deposit', label: 'Deposit Liquidity', icon: ArrowDownLeft },
                { id: 'borrow', label: 'Borrow Capital', icon: ArrowUpRight },
                { id: 'repay', label: 'Repay Loan', icon: CheckCircle },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`font-body flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs transition font-semibold cursor-pointer ${
                      isActive
                        ? 'bg-[#263e34] text-white shadow-xs border border-[#3b594b]'
                        : 'text-[#8ca395] hover:text-white hover:bg-[#1a2c23]'
                    }`}
                  >
                    <Icon size={13} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Form */}
            <div className="mt-6">
              {activeTab === 'deposit' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-title text-[10px] uppercase text-[#8ca395]">Asset: Fundryx Token</span>
                    <span className="font-mono text-[10px] text-[#8ca395]">
                      Vault: {CONTRACT_ADDRESSES.LendingPool.slice(0, 10)}...
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="0.0"
                      className="font-title w-full bg-[#0e1814] border border-[#23382c] rounded-xl px-4 py-3.5 text-2xl font-bold text-white focus:outline-none focus:border-emerald-500"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-[#8ca395]">
                      FDX
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 text-xs font-body text-[#8ca395]">
                    <div>
                      <div>Target Protocol Yield</div>
                      <div className="font-title text-emerald-400 font-bold text-sm mt-0.5">7.80% APY</div>
                    </div>
                    <div>
                      <div>Reserve Headroom</div>
                      <div className="font-title text-white font-bold text-sm mt-0.5">100% Solvency Guard</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'borrow' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-title text-[10px] uppercase text-[#8ca395]">Uncollateralized Credit Line</span>
                    <span className="font-title text-[10px] text-emerald-400 font-semibold">Tier 1 Qualified</span>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      value={borrowAmount}
                      onChange={(e) => setBorrowAmount(e.target.value)}
                      placeholder="0.0"
                      className="font-title w-full bg-[#0e1814] border border-[#23382c] rounded-xl px-4 py-3.5 text-2xl font-bold text-white focus:outline-none focus:border-emerald-500"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-[#8ca395]">
                      FDX
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 text-xs font-body text-[#8ca395]">
                    <div>
                      <div>Dynamic Fixed APR</div>
                      <div className="font-title text-white font-bold text-sm mt-0.5">5.20%</div>
                    </div>
                    <div>
                      <div>Repayment Term</div>
                      <div className="font-title text-white font-bold text-sm mt-0.5">7-Day Flexible Cycle</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'repay' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-title text-[10px] uppercase text-[#8ca395]">Select Loan ID to Settle</span>
                    <span className="font-mono text-[10px] text-emerald-400">Score +25 On Repay</span>
                  </div>

                  <select
                    value={repayLoanId}
                    onChange={(e) => setRepayLoanId(e.target.value)}
                    className="w-full bg-[#0e1814] border border-[#23382c] rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none"
                  >
                    {loans.map((loan) => (
                      <option key={loan.id} value={loan.id}>
                        {loan.id.slice(0, 18)}... ({loan.principal}) - {loan.status}
                      </option>
                    ))}
                  </select>

                  <div className="relative">
                    <input
                      type="number"
                      value={repayAmount}
                      onChange={(e) => setRepayAmount(e.target.value)}
                      placeholder="0.0"
                      className="font-title w-full bg-[#0e1814] border border-[#23382c] rounded-xl px-4 py-3.5 text-2xl font-bold text-white focus:outline-none focus:border-emerald-500"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-[#8ca395]">
                      FDX
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#23382c]">
            <button
              onClick={activeTab === 'deposit' ? handleDeposit : activeTab === 'borrow' ? handleBorrow : handleRepay}
              disabled={loading}
              className="font-body w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-[#263e34] hover:from-emerald-500 hover:to-[#2e4c3f] text-white font-semibold text-xs tracking-wide shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Processing Onchain…' : activeTab === 'deposit' ? 'Confirm Deposit' : activeTab === 'borrow' ? 'Execute Uncollateralized Loan' : 'Settle Repayment'}
            </button>
          </div>
        </div>

        {/* Live Ledger / Pool Health Card */}
        <div className="lg:col-span-5 bg-[#15231c] rounded-2xl p-6 md:p-8 border border-[#23382c] shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#23382c]">
              <span className="font-title text-[11px] font-bold uppercase tracking-wider text-white">Live Loans Ledger</span>
              <span className="text-[10px] font-mono text-emerald-400">Autonomous Settlement Engine</span>
            </div>

            <div className="mt-4 space-y-3">
              {loans.map((loan) => (
                <div key={loan.id} className="p-3 bg-[#0e1814] rounded-xl border border-[#23382c] text-xs">
                  <div className="flex justify-between items-center font-title font-semibold text-white">
                    <span>{loan.principal}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${loan.status === 'Active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' : 'bg-stone-900 text-stone-400'}`}>
                      {loan.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-[10px] text-[#8ca395] font-mono">
                    <span>Due: {loan.due}</span>
                    <span>{loan.id.slice(0, 14)}...</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#23382c] flex items-center justify-between text-xs text-[#8ca395]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Immutable Ledger</span>
            </span>
            <span className="font-mono text-[10px] text-emerald-400">Verifiable Repayment Records</span>
          </div>
        </div>
      </div>
    </div>
  );
}
