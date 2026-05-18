'use client';

import React from 'react';
import Link from 'next/link';
import { Anchor, Calculator } from 'lucide-react';
import { resortName } from '../../utils/pricingCalculator';
import TransactionLedger from '../../components/TransactionLedger';

export default function TransactionsDashboardPage() {
  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-10 flex flex-col gap-6">
      
      {/* --- FLOATING CRM HEADER --- */}
      <header className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-cyan-400/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-400 to-coral-glow flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Anchor className="w-6 h-6 animate-float" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-200 to-coral-glow bg-clip-text text-transparent font-outfit uppercase">
              {resortName}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium font-outfit">
              📊 Transaction Tracking & CRM Dashboard
            </p>
          </div>
        </div>
        
        {/* Quick Route back to Calculator */}
        <div className="relative z-10 self-start md:self-center">
          <Link
            href="/"
            className="bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-black rounded-xl px-4 py-3 flex items-center gap-2 hover:bg-cyan-900 shadow-md transition cursor-pointer font-outfit"
          >
            <Calculator className="w-4 h-4 animate-pulse-slow" />
            <span>🧮 BACK TO CALCULATOR</span>
          </Link>
        </div>
      </header>

      {/* --- FULL-WIDTH TRANSACTION LEDGER --- */}
      <main className="w-full">
        <TransactionLedger refreshToggle={false} />
      </main>

      {/* --- CRM FOOTER --- */}
      <footer className="mt-8 py-6 border-t border-slate-800/40 text-center flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-[9px] text-slate-500">
        <span>
          © 2026 {resortName}. All rights reserved. Created for MIDE 2026.
        </span>
        <div className="flex items-center gap-3">
          <span className="bg-slate-950 border border-slate-855 px-2 py-0.5 rounded text-slate-400">Next.js App Router</span>
          <span className="bg-slate-950 border border-slate-855 px-2 py-0.5 rounded text-slate-400">Supabase DB</span>
          <span className="bg-slate-950 border border-slate-855 px-2 py-0.5 rounded text-slate-400">Prisma SQL</span>
        </div>
      </footer>
    </div>
  );
}
