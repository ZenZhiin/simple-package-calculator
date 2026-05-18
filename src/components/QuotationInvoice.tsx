'use client';

import React, { useState } from 'react';
import {
  TrendingUp, Check, Copy, Mail, Globe, FileText, Lock, Share2, HelpCircle
} from 'lucide-react';
import {
  pricing, resortName, CalculationInput, CalculationResult
} from '../utils/pricingCalculator';

interface QuotationInvoiceProps {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  invoiceNumber?: string;
  result: CalculationResult;
  inputParams: CalculationInput;
  roomName: string;
  formattedQuoteText: string;
  whatsappLink: string;
  emailMailto: string;
  duration: '3D2N' | '4D3N';
  totalPax: number;
  hasDiverPackage: boolean;
  onSaveSuccess: () => void;
}

export default function QuotationInvoice({
  customerName,
  customerEmail = '',
  customerPhone = '',
  invoiceNumber = '',
  result,
  inputParams,
  roomName,
  formattedQuoteText,
  whatsappLink,
  emailMailto,
  duration,
  totalPax,
  hasDiverPackage,
  onSaveSuccess
}: QuotationInvoiceProps) {
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Trigger silent or manual logging
  const handleSaveBooking = async (silent = false) => {
    if (!customerName || customerName.trim() === '') {
      if (!silent) alert('Prospect Name is required to save booking!');
      return;
    }

    if (!silent) setSaveStatus('saving');
    try {
      const payload = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || null,
        customerPhone: customerPhone.trim() || null,
        invoiceNumber: invoiceNumber.trim() || null,
        travelDatesConfirmed: inputParams.travelDatesConfirmed,
        roomCategoryId: inputParams.roomCategoryId,
        roomCount: inputParams.roomCount,
        adultCount: result.totalAdults,
        childCount: result.totalChildren,
        infantCount: inputParams.infantCount,
        weekendTravel: inputParams.weekendNights > 0,
        peakSeason: inputParams.schoolHolidayNights > 0,
        superPeakSeason: inputParams.publicHolidayNights > 0,
        isForeigner: inputParams.isForeigner,
        includeBoatTransfer: inputParams.includeBoatTransfer,
        includeSnorkelingGear: inputParams.includeSnorkelingGear,
        scubaGearDays: inputParams.scubaGearDays,
        discountType: inputParams.discountType,
        discountValue: inputParams.discountValue,
        lockPriceSelected: inputParams.lockPriceSelected,
        grandTotal: result.grandTotal,
        whatsappQuote: formattedQuoteText,
        packageSelections: inputParams.packageSelections
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        if (!silent) {
          setSaveStatus('success');
          setTimeout(() => setSaveStatus('idle'), 3000);
        }
        onSaveSuccess(); // Refresh ledger
      } else {
        if (!silent) setSaveStatus('error');
      }
    } catch (err) {
      console.error('Error logging deal:', err);
      if (!silent) setSaveStatus('error');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedQuoteText);
    setCopied(true);
    // Auto-save silently to track deals
    handleSaveBooking(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="glass-panel rounded-2xl border-cyan-500/25 shadow-cyan-950/20 shadow-2xl relative overflow-hidden flex flex-col gap-5 p-6">

      {/* Invoice Header */}
      <div className="flex justify-between items-start border-b border-slate-700/40 pb-4">
        <div className="flex flex-col">
          <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-widest flex items-center gap-1.5 font-mono">
            <TrendingUp className="w-3.5 h-3.5 animate-pulse-slow" /> Live Quotation
          </span>
          <span className="text-base font-extrabold text-slate-100 font-outfit mt-0.5">
            {!inputParams.travelDatesConfirmed && inputParams.lockPriceSelected ? '🔒 Price-Lock Guarantee' : '📋 Expo Proposal Invoice'}
          </span>
          {invoiceNumber && (
            <span className="text-[9px] font-bold text-coral-glow font-mono mt-1.5 bg-coral-950/60 border border-coral-500/30 px-2 py-0.5 rounded self-start">
              📄 Invoice: {invoiceNumber}
            </span>
          )}
        </div>
        <div className="bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-mono text-xs px-2.5 py-1 rounded-lg font-bold">
          {duration}
        </div>
      </div>

      {/* Calculations Breakdown */}
      <div className="flex flex-col gap-3 font-mono text-xs text-slate-300">

        {/* Itemized Base Packages Listing */}
        <div className="flex flex-col gap-2 border-b border-slate-800/40 pb-3">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Accommodation Packages:</span>
          {inputParams.packageSelections.map((item) => {
            const pkg = pricing.packages.find(p => p.id === item.packageId) || pricing.packages[0];
            let basePrice = 0;
            const totalGuests = inputParams.packageSelections.reduce((sum, it) => sum + it.adultCount + it.childCount, 0);
            const occupancy = totalGuests > 0 ? Math.ceil(totalGuests / inputParams.roomCount) : 2;

            if (pkg.category === 'course') {
              basePrice = inputParams.roomCategoryId === 'dorm' ? pkg.rates.dorm : (occupancy >= 3 ? pkg.rates.triple_quad : pkg.rates.twin);
            } else {
              const touchWeekend = inputParams.travelDatesConfirmed && inputParams.weekendNights > 0;
              const ratesTable = touchWeekend ? pkg.rates.weekend : pkg.rates.weekday;
              basePrice = occupancy >= 4 ? (ratesTable.dorm_quad || ratesTable.quad) : (occupancy === 3 ? ratesTable.triple : ratesTable.twin);
            }

            const childPrice = Math.round(basePrice * 0.6);
            const rowTotal = (item.adultCount * basePrice) + (item.childCount * childPrice);

            return (
              <div key={item.id} className="flex justify-between items-start text-xs font-mono text-slate-300">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-200">{pkg.name}</span>
                  <span className="text-[9px] text-slate-500 mt-0.5">
                    {item.adultCount > 0 && `${item.adultCount}A × RM${basePrice}`}
                    {item.childCount > 0 && ` + ${item.childCount}C × RM${childPrice}`}
                  </span>
                </div>
                <span className="font-bold text-slate-200 font-mono">RM {rowTotal.toFixed(2)}</span>
              </div>
            );
          })}
        </div>

        {result.roomUpgradeTotal > 0 && (
          <div className="flex justify-between items-center border-t border-slate-800/40 pt-2">
            <span className="text-slate-400 font-bold">Room Upgrade Surcharge:</span>
            <span className="font-bold text-slate-200 font-mono">RM {result.roomUpgradeTotal.toFixed(2)}</span>
          </div>
        )}

        {inputParams.travelDatesConfirmed && result.singleOccupancyTotal > 0 && (
          <div className="flex justify-between items-center border-t border-slate-800/40 pt-2">
            <span className="text-slate-400">Single Room Surcharge:</span>
            <span className="font-bold text-slate-200 font-mono">RM {result.singleOccupancyTotal.toFixed(2)}</span>
          </div>
        )}

        {inputParams.travelDatesConfirmed && result.surcharges.grandSurchargesTotal > 0 && (
          <div className="flex justify-between items-start border-t border-slate-800/40 pt-2">
            <span className="text-slate-400">Date Surcharges:</span>
            <div className="text-right">
              <span className="font-bold text-slate-200 font-mono">RM {result.surcharges.grandSurchargesTotal.toFixed(2)}</span>
              <div className="text-[9px] text-slate-500 font-mono">
                {result.surcharges.weekendTotal > 0 && `Wknd `}
                {inputParams.schoolHolidayNights > 0 && `Peak `}
                {inputParams.publicHolidayNights > 0 && `Super Peak`}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center border-t border-slate-800/40 pt-2">
          <span className="text-slate-400">SST Tax ({pricing.taxSstPercentage}%):</span>
          <span className="font-bold text-slate-200 font-mono">RM {result.sstTotal.toFixed(2)}</span>
        </div>

        {result.transfersTotal > 0 && (
          <div className="flex justify-between items-center border-t border-slate-800/40 pt-2">
            <span className="text-slate-400">Boat Transfer:</span>
            <span className="font-bold text-slate-200 font-mono">RM {result.transfersTotal.toFixed(2)}</span>
          </div>
        )}

        {result.gearRental.grandGearTotal > 0 && (
          <div className="flex justify-between items-start border-t border-slate-800/40 pt-2">
            <span className="text-slate-400">Gear Rentals:</span>
            <div className="text-right">
              <span className="font-bold text-slate-200 font-mono">RM {result.gearRental.grandGearTotal.toFixed(2)}</span>
              <div className="text-[9px] text-slate-500 font-mono">
                {inputParams.includeSnorkelingGear && `Snorkeling Set `}
                {inputParams.scubaGearDays > 0 && `Scuba x${inputParams.scubaGearDays}d`}
              </div>
            </div>
          </div>
        )}

        {inputParams.travelDatesConfirmed && result.tourismTaxTotal > 0 && (
          <div className="flex justify-between items-center border-t border-slate-800/40 pt-2">
            <span className="text-slate-400">Tourism Tax (RM10/rm/nt):</span>
            <span className="font-bold text-slate-200 font-mono">RM {result.tourismTaxTotal.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between items-center border-t border-slate-700/50 pt-3 text-slate-200 font-bold">
          <span>Subtotal Value:</span>
          <span className="font-mono">RM {result.subtotal.toFixed(2)}</span>
        </div>

        {result.discountTotal > 0 && (
          <div className="flex justify-between items-center border-t border-slate-800/40 pt-2 text-coral-glow glow-coral font-bold">
            <span>MIDE Expo Discount:</span>
            <span className="font-mono">-RM {result.discountTotal.toFixed(2)}</span>
          </div>
        )}

        {!inputParams.travelDatesConfirmed && inputParams.lockPriceSelected && (
          <div className="flex justify-between items-center border-t border-cyan-500/20 pt-2.5 text-cyan-300 font-extrabold">
            <span>Locked Package Value:</span>
            <span className="font-mono">RM {result.estimatedFullPackageTotal.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* GRAND TOTAL DUE */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col items-center gap-1">
        <span className="text-[9px] text-slate-500 uppercase tracking-widest font-extrabold font-mono">
          {!inputParams.travelDatesConfirmed && inputParams.lockPriceSelected ? '🔒 Deposit Payable Now' : 'Total Payable (MYR)'}
        </span>
        <span className={`text-3xl font-black tracking-tight font-inter ${!inputParams.travelDatesConfirmed && inputParams.lockPriceSelected ? 'text-coral-400 glow-coral' : 'text-cyan-400 glow-cyan'}`}>
          RM {result.grandTotal.toFixed(2)}
        </span>
        <span className="text-[9px] text-slate-500 text-center font-mono mt-1 leading-normal max-w-[240px]">
          {!inputParams.travelDatesConfirmed && inputParams.lockPriceSelected
            ? 'Locks promotion package prices in full for 1 calendar year (valid until 18-May-2027).'
            : 'Includes food, stays, boat transfers, and resort scheduled items.'}
        </span>
      </div>

      {/* Sharing actions header */}
      <div className="flex items-center gap-2 border-t border-slate-800 pt-4">
        <Share2 className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wide font-outfit">Share Proposal Receipt</span>
      </div>

      {/* Dynamic Promoter Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={copyToClipboard}
          className="w-full bg-slate-900 border border-slate-700/60 text-slate-200 rounded-xl py-3 px-2 flex items-center justify-center gap-2 text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-cyan-400" />
              <span>Copy Quote</span>
            </>
          )}
        </button>

        <a
          href={emailMailto}
          onClick={() => handleSaveBooking(true)}
          className="w-full bg-slate-900 border border-slate-700/60 text-slate-200 rounded-xl py-3 px-2 flex items-center justify-center gap-2 text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
        >
          <Mail className="w-4 h-4 text-cyan-400" />
          <span>Send Email</span>
        </a>

        <a
          href={whatsappLink}
          onClick={() => handleSaveBooking(true)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full col-span-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 rounded-xl py-3.5 px-3 flex items-center justify-center gap-2.5 text-xs font-black hover:from-emerald-400 hover:to-teal-500 shadow-lg transition cursor-pointer"
        >
          <Globe className="w-4 h-4" />
          <span className="tracking-wide uppercase font-outfit">Share WhatsApp Receipt</span>
        </a>

        <button
          type="button"
          onClick={() => window.print()}
          className="w-full col-span-2 border border-slate-850 hover:bg-slate-950 text-slate-400 rounded-lg py-2 flex items-center justify-center gap-1.5 text-[10px] transition cursor-pointer font-mono"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Print Invoice / Save PDF</span>
        </button>
      </div>

      {/* Database logging button */}
      <div className="border-t border-slate-800/80 pt-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => handleSaveBooking(false)}
          disabled={saveStatus === 'saving' || !customerName || customerName.trim() === ''}
          className={`w-full py-3.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black transition cursor-pointer ${saveStatus === 'success'
              ? 'bg-emerald-500 text-slate-950 glow-emerald'
              : saveStatus === 'error'
                ? 'bg-rose-500 text-slate-950 glow-rose'
                : !customerName || customerName.trim() === ''
                  ? 'bg-slate-800/40 text-slate-500 border border-slate-850 cursor-not-allowed'
                  : 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900 shadow-md'
            }`}
        >
          {saveStatus === 'saving' ? (
            <span>Saving booking deal...</span>
          ) : saveStatus === 'success' ? (
            <>
              <Check className="w-4 h-4 text-slate-950" />
              <span className="text-slate-950">Logged Successfully!</span>
            </>
          ) : saveStatus === 'error' ? (
            <span>Error Logging Deal! Try again</span>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Log Successful Transaction</span>
            </>
          )}
        </button>
        {(!customerName || customerName.trim() === '') && (
          <span className="text-[9px] text-center text-slate-500">
            * Fill in Prospect Name to enable database logging
          </span>
        )}
      </div>

      {/* Quick notice guide */}
      <div className="bg-slate-950/40 border border-slate-855 rounded-2xl p-4 flex flex-col gap-1 mt-1">
        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 font-outfit">
          <HelpCircle className="w-4 h-4 text-cyan-400" /> Quick Reference Guide
        </span>
        <ul className="text-[10px] text-slate-400 leading-relaxed list-disc list-inside flex flex-col gap-1 mt-1 font-mono">
          <li>Infants (0-3 yrs) are free of charge (FOC).</li>
          <li>Children (4-12 yrs) receive a 40% discount off package.</li>
          <li>Weekend travel touches a Friday and/or Saturday night stay.</li>
          <li>SST is 8% and applies to packages + upgrades + dates.</li>
          <li>Tourism Tax of RM 10/room/night applies only to foreign passports.</li>
        </ul>
      </div>

    </div>
  );
}
