'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, TrendingUp } from 'lucide-react';
import { pricing, resortName } from '../utils/pricingCalculator';

interface TransactionLedgerProps {
  refreshToggle: boolean;
}

export default function TransactionLedger({ refreshToggle }: TransactionLedgerProps) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [refreshToggle]);

  return (
    <section className="glass-panel rounded-2xl p-6 border border-cyan-400/10 relative overflow-hidden flex flex-col gap-5 mt-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/40 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 font-outfit">
            <TrendingUp className="w-5.5 h-5.5 text-cyan-400 animate-pulse-slow" />
            📊 Promoter Booking & Transaction Ledger
          </h2>
          <p className="text-xs text-slate-400">Keep track of successful expo packages and locked promo vouchers.</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prospects..."
            className="bg-slate-950/60 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 transition"
          />
          <button
            type="button"
            onClick={fetchBookings}
            className="px-3 py-1.5 text-xs border border-slate-800 rounded-lg hover:bg-slate-900 text-slate-400 transition cursor-pointer"
          >
            Reload
          </button>
        </div>
      </div>

      {/* Ledger Statistics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-4 flex flex-col items-center">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Stored Bookings</span>
          <span className="text-2xl font-black text-slate-100 mt-1 font-mono">{bookings.length} groups</span>
        </div>
        <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-4 flex flex-col items-center">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Cumulative Stay Value</span>
          <span className="text-2xl font-black text-cyan-400 glow-cyan mt-1 font-mono">
            RM {bookings.filter(b => b.travelDatesConfirmed).reduce((sum, b) => sum + b.grandTotal, 0).toFixed(2)}
          </span>
        </div>
        <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-4 flex flex-col items-center">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Deposits Locked</span>
          <span className="text-2xl font-black text-coral-400 glow-coral mt-1 font-mono">
            RM {bookings.filter(b => !b.travelDatesConfirmed && b.lockPriceSelected).reduce((sum, b) => sum + b.grandTotal, 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Search Results / Booking Ledger Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-xs font-mono">Loading transaction ledger database...</div>
      ) : bookings.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-xs font-mono">No bookings saved yet. Successful deals will appear here automatically.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {bookings
            .filter(b => {
              const term = search.toLowerCase();
              return (
                b.customerName.toLowerCase().includes(term) ||
                (b.customerEmail && b.customerEmail.toLowerCase().includes(term)) ||
                (b.customerPhone && b.customerPhone.toLowerCase().includes(term)) ||
                (b.invoiceNumber && b.invoiceNumber.toLowerCase().includes(term))
              );
            })
            .map((b) => {
              const isExpanded = expandedId === b.id;
              const dateText = new Date(b.createdAt).toLocaleDateString('en-MY', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={b.id}
                  className={`bg-slate-950/40 border rounded-xl overflow-hidden transition-all ${
                    isExpanded ? 'border-cyan-500/30 bg-slate-950/60 shadow-md' : 'border-slate-855 hover:bg-slate-900/40'
                  }`}
                >
                  {/* Header Row */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : b.id)}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black font-mono ${
                        b.travelDatesConfirmed ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/20' : 'bg-coral-950 text-coral-400 border border-coral-500/20'
                      }`}>
                        {b.travelDatesConfirmed ? 'OK' : 'LOCK'}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-200">{b.customerName}</span>
                          {b.invoiceNumber && (
                            <span className="bg-slate-900 border border-slate-800 text-[8px] text-slate-400 px-1.5 py-0.5 rounded font-mono font-bold">
                              {b.invoiceNumber}
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono mt-0.5">{dateText}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end">
                        <span className={`text-xs font-extrabold font-mono ${b.travelDatesConfirmed ? 'text-cyan-400 glow-cyan' : 'text-coral-400 glow-coral'}`}>
                          RM {b.grandTotal.toFixed(2)}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">
                          {b.adultCount}A + {b.childCount}C {b.roomCount > 0 && `(${b.roomCount} Rm)`}
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* Expanded Details Body */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-slate-900/60 pt-3 flex flex-col gap-4 bg-slate-950/30 animate-fadeIn">
                      
                      {/* Package Breakdown Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] font-mono text-slate-400">
                        <div className="flex flex-col gap-1.5 bg-slate-950/60 p-3 rounded-lg border border-slate-900">
                          <span className="text-[9px] text-slate-500 font-bold uppercase">Stay Configuration</span>
                          {b.invoiceNumber && <div>• Invoice No: <span className="font-bold text-coral-glow font-mono">{b.invoiceNumber}</span></div>}
                          {b.customerEmail && <div>• Email: <span className="font-bold text-slate-200 font-mono">{b.customerEmail}</span></div>}
                          {b.customerPhone && <div>• Contact: <span className="font-bold text-slate-200 font-mono">{b.customerPhone}</span></div>}
                          <div>• Status: <span className="font-bold text-slate-200">{b.travelDatesConfirmed ? 'Confirmed Dates' : 'Lock Promo Price Deposit'}</span></div>
                          <div>• Room Type: <span className="font-bold text-slate-200">{pricing.roomCategories.find(r => r.id === b.roomCategoryId)?.name || b.roomCategoryId}</span></div>
                          <div>• Foreigner Tax: <span className="font-bold text-slate-200">{b.isForeigner ? 'Applied' : 'None (Malaysian)'}</span></div>
                          <div>• Add-ons: <span className="font-bold text-slate-200 font-mono">
                            {b.includeBoatTransfer && 'Boat'} {b.includeSnorkelingGear && 'Snorkel'} {b.scubaGearDays > 0 && `Scuba(${b.scubaGearDays}d)`}
                          </span></div>
                        </div>

                        <div className="flex flex-col gap-1 bg-slate-950/60 p-3 rounded-lg border border-slate-900">
                          <span className="text-[9px] text-slate-500 font-bold uppercase">Package selections</span>
                          {Array.isArray(b.packageSelections) && b.packageSelections.map((it: any, idx: number) => {
                            const pkg = pricing.packages.find(p => p.id === it.packageId);
                            return (
                              <div key={idx} className="text-slate-300">
                                - {pkg?.name || it.packageId} ({it.adultCount}A + {it.childCount}C)
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* WhatsApp text display */}
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] text-slate-500 font-bold uppercase font-mono">Saved Quote Receipt Text</span>
                        <textarea
                          readOnly
                          value={b.whatsappQuote}
                          rows={6}
                          className="w-full bg-slate-950/80 border border-slate-900 rounded-lg p-2.5 font-mono text-[9px] text-slate-350 focus:outline-none resize-none"
                        />
                      </div>

                      {/* Shared Actions for logged bookings */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(b.whatsappQuote);
                            alert('Quote copied to clipboard successfully!');
                          }}
                          className="bg-slate-900 border border-slate-800 text-slate-350 hover:bg-slate-850 hover:text-slate-200 text-[10px] font-bold rounded-lg px-3 py-2 cursor-pointer transition"
                        >
                          Copy saved text
                        </button>
                        <a
                          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(b.whatsappQuote)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-emerald-950/80 border border-emerald-800/40 text-emerald-400 hover:bg-emerald-900 text-[10px] font-bold rounded-lg px-3 py-2 cursor-pointer transition"
                        >
                          Resend to WhatsApp
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </section>
  );
}
