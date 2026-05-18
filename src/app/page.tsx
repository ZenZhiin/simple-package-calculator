'use client';

import React, { useState, useMemo } from 'react';
import { 
  Calendar, Users, Anchor, Tag, Share2, Copy, Mail, Check, User, Lock, 
  HelpCircle, Percent, TrendingUp, Globe, FileText, ChevronDown, Plus, Trash2 
} from 'lucide-react';
import { 
  pricing, resortName, calculateQuotation, formatWhatsAppQuote, CalculationInput, CalculationResult, PackageSelectionItem 
} from '../utils/pricingCalculator';

export default function MideCalculatorPage() {
  // --- Promoter Input State ---
  const [customerName, setCustomerName] = useState('');
  const [travelDatesConfirmed, setTravelDatesConfirmed] = useState(false);
  const [roomCategoryId, setRoomCategoryId] = useState('standard');
  const [infantCount, setInfantCount] = useState(0);
  const [roomCount, setRoomCount] = useState(1);
  const [singleOccupancyRooms, setSingleOccupancyRooms] = useState(0);
  
  // Confirmed Date Surcharges (Simplified Toggles)
  const [weekendTravel, setWeekendTravel] = useState(false);
  const [peakSeason, setPeakSeason] = useState(false);
  const [superPeakSeason, setSuperPeakSeason] = useState(false);
  
  // Add-ons & Taxes
  const [isForeigner, setIsForeigner] = useState(false);
  const [includeBoatTransfer, setIncludeBoatTransfer] = useState(true);
  const [includeSnorkelingGear, setIncludeSnorkelingGear] = useState(false);
  const [scubaGearDays, setScubaGearDays] = useState(0);
  
  // Discounts
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [discountValue, setDiscountValue] = useState(0);

  // Lock Promo Price Toggle (if dates unconfirmed)
  const [lockPriceSelected, setLockPriceSelected] = useState(true);
  const [copied, setCopied] = useState(false);

  // --- Dynamic Package Array Selections State ---
  const [packageSelections, setPackageSelections] = useState<PackageSelectionItem[]>([
    { id: '1', packageId: 'fun_dive_3d2n', adultCount: 2, childCount: 0 }
  ]);

  // Derived properties from active packages list
  const { totalAdults, totalChildren, totalPax, hasDiverPackage } = useMemo(() => {
    let adults = 0;
    let kids = 0;
    let hasDiver = false;
    packageSelections.forEach(item => {
      adults += item.adultCount;
      kids += item.childCount;
      const pkg = pricing.packages.find(p => p.id === item.packageId);
      if (pkg && pkg.type === 'diver') hasDiver = true;
    });
    return { totalAdults: adults, totalChildren: kids, totalPax: adults + kids, hasDiverPackage: hasDiver };
  }, [packageSelections]);

  const { duration } = useMemo(() => {
    let maxNights = 2;
    packageSelections.forEach(item => {
      const pkg = pricing.packages.find(p => p.id === item.packageId);
      if (pkg && pkg.duration === '4D3N') maxNights = 3;
    });
    return { duration: maxNights === 3 ? '4D3N' : '3D2N' as '3D2N' | '4D3N' };
  }, [packageSelections]);

  // --- Package Selection Modifiers ---
  const addPackageRow = () => {
    const nextId = Math.random().toString(36).substr(2, 9);
    setPackageSelections(prev => [...prev, { id: nextId, packageId: 'fun_dive_3d2n', adultCount: 1, childCount: 0 }]);
  };

  const removePackageRow = (id: string) => {
    if (packageSelections.length <= 1) return;
    setPackageSelections(prev => prev.filter(item => item.id !== id));
  };

  const updatePackageRow = (id: string, updates: Partial<Omit<PackageSelectionItem, 'id'>>) => {
    setPackageSelections(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  // --- Calculate quotation dynamically ---
  const inputParams: CalculationInput = useMemo(() => ({
    travelDatesConfirmed,
    packageSelections,
    roomCategoryId,
    infantCount,
    roomCount,
    singleOccupancyRooms: travelDatesConfirmed ? singleOccupancyRooms : 0,
    weekendNights: travelDatesConfirmed && weekendTravel ? 1 : 0,
    schoolHolidayNights: travelDatesConfirmed && peakSeason ? 1 : 0,
    publicHolidayNights: travelDatesConfirmed && superPeakSeason ? 1 : 0,
    isSuperPeak: travelDatesConfirmed && superPeakSeason,
    isForeigner,
    includeBoatTransfer,
    includeSnorkelingGear,
    scubaGearDays: hasDiverPackage ? scubaGearDays : 0,
    discountType,
    discountValue,
    lockPriceSelected: !travelDatesConfirmed && lockPriceSelected
  }), [
    travelDatesConfirmed, packageSelections, roomCategoryId, infantCount, roomCount,
    singleOccupancyRooms, weekendTravel, peakSeason, superPeakSeason,
    isForeigner, includeBoatTransfer, includeSnorkelingGear, scubaGearDays, discountType,
    discountValue, lockPriceSelected, hasDiverPackage
  ]);

  const result: CalculationResult = useMemo(() => {
    return calculateQuotation(inputParams);
  }, [inputParams]);

  const roomName = useMemo(() => {
    const rm = pricing.roomCategories.find(r => r.id === roomCategoryId);
    return rm ? rm.name : 'Standard Room';
  }, [roomCategoryId]);

  // --- Sharing & Communication Links ---
  const formattedQuoteText = useMemo(() => {
    const greeting = customerName ? `Hi ${customerName},\n\n` : '';
    return greeting + formatWhatsAppQuote(inputParams, result, roomName);
  }, [inputParams, result, roomName, customerName]);

  const whatsappLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedQuoteText)}`;
  const emailMailto = `mailto:?subject=${encodeURIComponent('Quotation - ' + resortName)}&body=${encodeURIComponent(formattedQuoteText)}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedQuoteText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-10 flex flex-col gap-6">
      
      {/* --- FLOATING HEADER --- */}
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
              🌴 MIDE 2026 Promo Pricing & Smart Promoter Engine
            </p>
          </div>
        </div>
        
        {/* Customer Quick Reference Input */}
        <div className="flex flex-col gap-1.5 min-w-[240px] relative z-10">
          <label className="text-xs text-cyan-200 font-semibold tracking-wider uppercase flex items-center gap-1 font-outfit">
            <User className="w-3.5 h-3.5" /> Prospect Name
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="e.g. Jason Ho"
            className="w-full bg-slate-950/60 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
          />
        </div>
      </header>

      {/* --- MAIN WORKSPACE --- */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* --- LEFT FORM: 7 cols --- */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Section 1: Travel Dates & Booking Status */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-700/40 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 font-outfit">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  1. Travel Date Status
                </h2>
                <p className="text-xs text-slate-400">Ask the prospect if they have confirmed their travel dates.</p>
              </div>
              <div className="flex items-center gap-3 bg-slate-900/60 p-1.5 rounded-xl border border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setTravelDatesConfirmed(false)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${!travelDatesConfirmed ? 'bg-slate-800 text-cyan-400 border border-cyan-500/20' : 'text-slate-400'}`}
                >
                  Unconfirmed
                </button>
                <button
                  type="button"
                  onClick={() => setTravelDatesConfirmed(true)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${travelDatesConfirmed ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400'}`}
                >
                  Confirmed Date
                </button>
              </div>
            </div>

            {/* Travel Date Conditional Forms */}
            {travelDatesConfirmed ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                {/* Citizenship */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-300">Citizenship</span>
                  <div className="grid grid-cols-2 gap-2 bg-slate-950/40 p-1 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsForeigner(false)}
                      className={`py-1.5 text-xs font-semibold rounded transition ${!isForeigner ? 'bg-cyan-950/80 text-cyan-200 border border-cyan-500/30' : 'text-slate-400'}`}
                    >
                      Malaysian
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsForeigner(true)}
                      className={`py-1.5 text-xs font-semibold rounded transition ${isForeigner ? 'bg-cyan-950/80 text-cyan-200 border border-cyan-500/30' : 'text-slate-400'}`}
                    >
                      Foreigner
                    </button>
                  </div>
                </div>

                {/* Simplified Holiday/Weekend Surcharge Toggles */}
                <div className="sm:col-span-2 bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                    <span className="text-xs font-bold text-cyan-200 tracking-wider uppercase">Holiday & Weekend Surcharges</span>
                    <span className="text-[10px] text-slate-500">Select peak dates of travel</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="flex items-center gap-2.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 cursor-pointer hover:bg-slate-900 transition">
                      <input
                        type="checkbox"
                        checked={weekendTravel}
                        onChange={(e) => setWeekendTravel(e.target.checked)}
                        className="rounded border-slate-700 text-cyan-500 bg-slate-950 w-4.5 h-4.5"
                      />
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-200">Weekend Travel</span>
                        <span className="text-[8px] text-slate-500 font-mono">Touches Fri/Sat</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 cursor-pointer hover:bg-slate-900 transition">
                      <input
                        type="checkbox"
                        checked={peakSeason}
                        onChange={(e) => setPeakSeason(e.target.checked)}
                        className="rounded border-slate-700 text-cyan-500 bg-slate-950 w-4.5 h-4.5"
                      />
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-200">Peak Season</span>
                        <span className="text-[8px] text-slate-500 font-mono">School Holidays</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 cursor-pointer hover:bg-slate-900 transition">
                      <input
                        type="checkbox"
                        checked={superPeakSeason}
                        onChange={(e) => setSuperPeakSeason(e.target.checked)}
                        className="rounded border-slate-700 text-cyan-500 bg-slate-950 w-4.5 h-4.5"
                      />
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-200">Super Peak</span>
                        <span className="text-[8px] text-slate-500 font-mono">Public Holidays</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              /* Dates Unconfirmed - Price Lock Deposit */
              <div className="bg-gradient-to-br from-coral-950/20 via-slate-900/40 to-slate-950/60 border border-coral-500/25 rounded-2xl p-5 flex flex-col gap-4 animate-fadeIn">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-lg bg-coral-950/60 border border-coral-500/30 flex items-center justify-center text-coral-400 shadow-md">
                      <Lock className="w-5 h-5 animate-float" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-coral-200 uppercase tracking-wider font-outfit">🔒 MIDE Price Lock Guarantee</span>
                      <span className="text-[10px] text-slate-400">Lock promotion rates for 1 year with a deposit.</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lockPriceSelected}
                      onChange={(e) => setLockPriceSelected(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-coral-500"></div>
                  </label>
                </div>
                
                <p className="text-xs text-slate-300 leading-relaxed">
                  Prospect does not have fixed dates? Don't let them walk away! Lock today's expo promo prices for **only RM 100 per person**. Stays can be claimed anytime within **1 year** (until 18-May-2027).
                </p>

                {lockPriceSelected && (
                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 mt-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold font-mono">Lock Deposit Due Now</span>
                    <span className="text-sm font-black text-coral-glow glow-coral font-mono">
                      RM {(totalPax * pricing.lockPriceDepositPerPax).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Catalog Package (Multi-Package Editor) */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-slate-700/40 pb-3">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 font-outfit">
                <Anchor className="w-5 h-5 text-cyan-400" />
                2. Catalog Packages & Group Configuration
              </h2>
              <button
                type="button"
                onClick={addPackageRow}
                className="bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-bold rounded-lg px-2.5 py-1.5 flex items-center gap-1 hover:bg-cyan-900 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Package
              </button>
            </div>

            {/* Dynamic Array Row Editor */}
            <div className="flex flex-col gap-4">
              {packageSelections.map((item, index) => {
                return (
                  <div 
                    key={item.id} 
                    className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-3.5 relative overflow-hidden animate-fadeIn"
                  >
                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500 to-transparent"></div>
                    
                    {/* Index Indicator */}
                    <div className="text-[10px] font-bold text-slate-500 font-mono self-start sm:self-center">
                      #{index + 1}
                    </div>

                    {/* Package Dropdown */}
                    <div className="flex-1 w-full flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Promo stay Package</span>
                      <div className="relative">
                        <select
                          value={item.packageId}
                          onChange={(e) => updatePackageRow(item.id, { packageId: e.target.value })}
                          className="w-full appearance-none bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-8 py-2 text-xs text-slate-200 focus:outline-none cursor-pointer"
                        >
                          <optgroup label="🎓 PADI Certification Courses" className="bg-slate-950 text-slate-350">
                            <option value="padi_owc">PADI Open Water Course (OWC) - 4D3N</option>
                            <option value="padi_aowc">PADI Advanced Open Water (AOWC) - 4D3N</option>
                            <option value="padi_rescue_efr">PADI Rescue & EFR Course - 4D3N</option>
                          </optgroup>
                          <optgroup label="🐠 Leisure Fun Dives" className="bg-slate-950 text-slate-355">
                            <option value="fun_dive_3d2n">3D2N Fun Dive Package (2 Nights)</option>
                            <option value="fun_dive_4d3n">4D3N Fun Dive Package (3 Nights)</option>
                          </optgroup>
                          <optgroup label="🌴 Snorkeling Packages" className="bg-slate-950 text-slate-355">
                            <option value="snorkeling_3d2n">3D2N Snorkeling Package (2 Nights)</option>
                            <option value="snorkeling_4d3n">4D3N Snorkeling Package (3 Nights)</option>
                          </optgroup>
                        </select>
                        <div className="absolute right-2.5 top-3 text-slate-400 pointer-events-none">
                          <ChevronDown className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>

                    {/* Counter Group */}
                    <div className="flex gap-3 w-full sm:w-auto">
                      {/* Adult Counter */}
                      <div className="flex flex-col gap-1 bg-slate-900/40 p-2 rounded-lg border border-slate-800 items-center min-w-[76px] flex-1 sm:flex-initial">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Adults</span>
                        <div className="flex items-center gap-1.5">
                          <button type="button" onClick={() => updatePackageRow(item.id, { adultCount: Math.max(0, item.adultCount - 1) })} className="w-5 h-5 rounded bg-slate-800 text-[10px] font-bold text-slate-350">-</button>
                          <span className="text-xs font-bold text-slate-100 font-mono">{item.adultCount}</span>
                          <button type="button" onClick={() => updatePackageRow(item.id, { adultCount: item.adultCount + 1 })} className="w-5 h-5 rounded bg-slate-800 text-[10px] font-bold text-slate-350">+</button>
                        </div>
                      </div>

                      {/* Child Counter */}
                      <div className="flex flex-col gap-1 bg-slate-900/40 p-2 rounded-lg border border-slate-800 items-center min-w-[76px] flex-1 sm:flex-initial">
                        <span className="text-[9px] text-slate-400 font-bold uppercase flex items-center gap-0.5">Kids <span className="text-cyan-300 text-[8px] font-normal font-mono">(-40%)</span></span>
                        <div className="flex items-center gap-1.5">
                          <button type="button" onClick={() => updatePackageRow(item.id, { childCount: Math.max(0, item.childCount - 1) })} className="w-5 h-5 rounded bg-slate-800 text-[10px] font-bold text-slate-350">-</button>
                          <span className="text-xs font-bold text-slate-100 font-mono">{item.childCount}</span>
                          <button type="button" onClick={() => updatePackageRow(item.id, { childCount: item.childCount + 1 })} className="w-5 h-5 rounded bg-slate-800 text-[10px] font-bold text-slate-350">+</button>
                        </div>
                      </div>
                    </div>

                    {/* Remove Action */}
                    <button
                      type="button"
                      disabled={packageSelections.length <= 1}
                      onClick={() => removePackageRow(item.id)}
                      className="text-slate-500 hover:text-rose-400 disabled:opacity-20 p-2 border border-slate-800/80 rounded-lg hover:bg-slate-900 transition cursor-pointer self-end sm:self-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Global Room Category Grid */}
            <div className="flex flex-col gap-3 mt-1.5">
              <span className="text-xs font-bold text-slate-300">Select Global Room Category for stay upgrade</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pricing.roomCategories.map((rm) => {
                  const isSelected = roomCategoryId === rm.id;
                  const upgradeCost = rm.upgradeCostPerPax;
                  return (
                    <button
                      key={rm.id}
                      type="button"
                      onClick={() => setRoomCategoryId(rm.id)}
                      className={`text-left p-4 rounded-xl flex flex-col gap-1 transition-all cursor-pointer glass-card-interactive ${isSelected ? 'glass-card-selected' : ''}`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <span className={`text-xs font-bold ${isSelected ? 'text-cyan-300' : 'text-slate-100'}`}>{rm.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{rm.description}</p>
                      <div className="flex justify-between items-end mt-2 pt-2 border-t border-slate-800/80 w-full text-[10px] font-mono">
                        <span className="text-slate-500 font-bold">Upgrade Add-on:</span>
                        <span className="font-extrabold text-coral-glow glow-coral">
                          {upgradeCost === 0 ? 'Baseline (FOC)' : `+RM ${upgradeCost} /pax`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Room Occupancy configuration */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 font-outfit border-b border-slate-700/40 pb-3">
              <Users className="w-5 h-5 text-cyan-400" />
              3. Room Occupancy Allocation
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Infants Counter */}
              <div className="flex flex-col gap-1.5 bg-slate-950/40 border border-slate-800 rounded-xl p-3 items-center">
                <span className="text-xs font-bold text-slate-350">Infants Count</span>
                <div className="flex items-center gap-2 mt-1">
                  <button type="button" onClick={() => setInfantCount(prev => Math.max(0, prev - 1))} className="w-6.5 h-6.5 rounded bg-slate-800 text-xs font-bold text-slate-300">-</button>
                  <span className="text-sm font-bold text-slate-100 font-mono">{infantCount}</span>
                  <button type="button" onClick={() => setInfantCount(prev => prev + 1)} className="w-6.5 h-6.5 rounded bg-slate-800 text-xs font-bold text-slate-300">+</button>
                </div>
                <span className="text-[9px] text-slate-500 mt-0.5">0-3 yrs (FOC stay)</span>
              </div>

              {/* Room Count Counter */}
              <div className="flex flex-col gap-1.5 bg-slate-950/40 border border-slate-800 rounded-xl p-3 items-center">
                <span className="text-xs font-bold text-slate-350">Room Quantity</span>
                <div className="flex items-center gap-2 mt-1">
                  <button type="button" onClick={() => setRoomCount(prev => Math.max(1, prev - 1))} className="w-6.5 h-6.5 rounded bg-slate-800 text-xs font-bold text-slate-300">-</button>
                  <span className="text-sm font-bold text-slate-100 font-mono">{roomCount}</span>
                  <button type="button" onClick={() => setRoomCount(prev => prev + 1)} className="w-6.5 h-6.5 rounded bg-slate-800 text-xs font-bold text-slate-300">+</button>
                </div>
                <span className="text-[9px] text-slate-500 mt-0.5">Total Rooms Requested</span>
              </div>

              {/* Single Room Surcharges */}
              <div className="flex flex-col gap-1.5 bg-slate-950/40 border border-slate-800 rounded-xl p-3 items-center">
                <span className="text-xs font-bold text-slate-350">Single Occupancy Rooms</span>
                <div className="flex items-center gap-2 mt-1">
                  <button type="button" disabled={!travelDatesConfirmed} onClick={() => setSingleOccupancyRooms(prev => Math.max(0, prev - 1))} className="w-6.5 h-6.5 rounded bg-slate-800 disabled:opacity-30 text-xs font-bold text-slate-300">-</button>
                  <span className="text-sm font-bold text-slate-100 font-mono">{singleOccupancyRooms}</span>
                  <button type="button" disabled={!travelDatesConfirmed} onClick={() => setSingleOccupancyRooms(prev => Math.min(roomCount, prev + 1))} className="w-6.5 h-6.5 rounded bg-slate-800 disabled:opacity-30 text-xs font-bold text-slate-300">+</button>
                </div>
                <span className="text-[9px] text-slate-500 mt-0.5 font-mono">+RM 200/night surcharge</span>
              </div>

            </div>
          </div>

          {/* Section 4: Add-ons & Equipment */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 font-outfit border-b border-slate-700/40 pb-3">
              <Anchor className="w-5 h-5 text-cyan-400" />
              4. Optional Add-ons & Equipment Rentals
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <label className="flex items-center gap-3 bg-slate-950/40 hover:bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={includeBoatTransfer}
                  onChange={(e) => setIncludeBoatTransfer(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 bg-slate-950 w-4.5 h-4.5"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-200 font-outfit">Boat Transfer</span>
                  <span className="text-[9px] text-slate-400 font-mono">Adult: RM100, Child: RM79</span>
                </div>
              </label>

              <label className="flex items-center gap-3 bg-slate-950/40 hover:bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={includeSnorkelingGear}
                  onChange={(e) => setIncludeSnorkelingGear(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 bg-slate-950 w-4.5 h-4.5"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-200 font-outfit">Snorkeling Gear</span>
                  <span className="text-[9px] text-slate-400 font-mono">Full set flat RM 45 / pax</span>
                </div>
              </label>

              <div className="flex items-center gap-3 bg-slate-950/40 border border-slate-800 rounded-xl p-3 relative overflow-hidden">
                {!hasDiverPackage && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[0.5px] z-10 flex items-center justify-center">
                    <span className="text-[10px] text-slate-500 font-bold">Only for Scuba Divers</span>
                  </div>
                )}
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-200">
                    <span className="font-outfit">Scuba Gear</span>
                    <span className="text-coral-glow text-[10px] font-mono">RM 90/day</span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[10px]">
                    <span className="text-slate-400 font-mono">Days:</span>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setScubaGearDays(prev => Math.max(0, prev - 1))} className="w-5.5 h-5.5 rounded bg-slate-800 text-xs text-slate-300">-</button>
                      <span className="text-xs font-bold text-slate-200 font-mono">{scubaGearDays}</span>
                      <button type="button" onClick={() => setScubaGearDays(prev => prev + 1)} className="w-5.5 h-5.5 rounded bg-slate-800 text-xs text-slate-300">+</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Promos & Discounts */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 font-outfit border-b border-slate-700/40 pb-3">
              <Tag className="w-5 h-5 text-coral-glow glow-coral animate-pulse-slow" />
              5. MIDE Expo Promos & Discounts
            </h2>

            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => { setDiscountType('percentage'); setDiscountValue(0); }} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${discountValue === 0 ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-950/60 text-slate-500 border border-slate-800/80'}`}>No Discount</button>
              <button type="button" onClick={() => { setDiscountType('percentage'); setDiscountValue(5); }} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${discountValue === 5 && discountType === 'percentage' ? 'bg-cyan-950/80 text-cyan-200 border border-cyan-500/30' : 'bg-slate-950/60 text-slate-500 border border-slate-800/80'}`}>5% MIDE Promo</button>
              <button type="button" onClick={() => { setDiscountType('percentage'); setDiscountValue(10); }} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${discountValue === 10 && discountType === 'percentage' ? 'bg-cyan-950/80 text-cyan-200 border border-cyan-500/30' : 'bg-slate-950/60 text-slate-500 border border-slate-800/80'}`}>10% Expo Promo</button>
              <button type="button" onClick={() => { setDiscountType('flat'); setDiscountValue(100); }} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${discountValue === 100 && discountType === 'flat' ? 'bg-cyan-950/80 text-cyan-200 border border-cyan-500/30' : 'bg-slate-950/60 text-slate-500 border border-slate-800/80'}`}>RM 100 Early Bird</button>
              <button type="button" onClick={() => { setDiscountType('flat'); setDiscountValue(200); }} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${discountValue === 200 && discountType === 'flat' ? 'bg-cyan-950/80 text-cyan-200 border border-cyan-500/30' : 'bg-slate-950/60 text-slate-500 border border-slate-800/80'}`}>RM 200 Group Booking</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1.5">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-slate-350">Discount Type</span>
                <div className="grid grid-cols-2 gap-2 bg-slate-950/40 p-1 rounded-lg border border-slate-800">
                  <button type="button" onClick={() => setDiscountType('percentage')} className={`py-1.5 text-xs font-bold rounded transition ${discountType === 'percentage' ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/20' : 'text-slate-400'}`}>Percent (%)</button>
                  <button type="button" onClick={() => setDiscountType('flat')} className={`py-1.5 text-xs font-bold rounded transition ${discountType === 'flat' ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/20' : 'text-slate-400'}`}>Cash (RM)</button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-slate-355">Custom Deduction</span>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={discountValue || ''}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    placeholder="Enter discount..."
                    className="w-full bg-slate-950/60 border border-slate-700/60 rounded-lg pl-3 pr-8 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1"
                  />
                  <div className="absolute right-3 top-2 text-slate-500">
                    {discountType === 'percentage' ? <Percent className="w-3.5 h-3.5" /> : <span className="text-xs font-bold font-mono">RM</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- RIGHT INVOICE: 5 cols --- */}
        <section className="lg:col-span-5 lg:sticky lg:top-6 flex flex-col gap-6">
          
          <div className="glass-panel rounded-2xl border-cyan-500/25 shadow-cyan-950/20 shadow-2xl relative overflow-hidden flex flex-col gap-5 p-6">
            
            {/* Invoice Header */}
            <div className="flex justify-between items-start border-b border-slate-700/40 pb-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-widest flex items-center gap-1.5 font-mono">
                  <TrendingUp className="w-3.5 h-3.5" /> Live Quotation
                </span>
                <span className="text-base font-extrabold text-slate-100 font-outfit mt-0.5">
                  {!travelDatesConfirmed && lockPriceSelected ? '🔒 Price-Lock Guarantee' : '📋 Expo Proposal Invoice'}
                </span>
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
                {packageSelections.map((item) => {
                  const pkg = pricing.packages.find(p => p.id === item.packageId) || pricing.packages[0];
                  let basePrice = 0;
                  const totalGuests = packageSelections.reduce((sum, it) => sum + it.adultCount + it.childCount, 0);
                  const occupancy = totalGuests > 0 ? Math.ceil(totalGuests / roomCount) : 2;
                  
                  if (pkg.category === 'course') {
                    basePrice = roomCategoryId === 'dorm' ? pkg.rates.dorm : (occupancy >= 3 ? pkg.rates.triple_quad : pkg.rates.twin);
                  } else {
                    const touchWeekend = travelDatesConfirmed && weekendTravel;
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
                      <span className="font-bold text-slate-200">RM {rowTotal.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              {result.roomUpgradeTotal > 0 && (
                <div className="flex justify-between items-center border-t border-slate-800/40 pt-2">
                  <span className="text-slate-400">Room Upgrade Surcharge:</span>
                  <span className="font-bold text-slate-200 font-mono">RM {result.roomUpgradeTotal.toFixed(2)}</span>
                </div>
              )}

              {travelDatesConfirmed && result.singleOccupancyTotal > 0 && (
                <div className="flex justify-between items-center border-t border-slate-800/40 pt-2">
                  <span className="text-slate-400">Single Room Surcharge:</span>
                  <span className="font-bold text-slate-200">RM {result.singleOccupancyTotal.toFixed(2)}</span>
                </div>
              )}

              {travelDatesConfirmed && result.surcharges.grandSurchargesTotal > 0 && (
                <div className="flex justify-between items-start border-t border-slate-800/40 pt-2">
                  <span className="text-slate-400">Date Surcharges:</span>
                  <div className="text-right">
                    <span className="font-bold text-slate-200">RM {result.surcharges.grandSurchargesTotal.toFixed(2)}</span>
                    <div className="text-[9px] text-slate-500">
                      {result.surcharges.weekendTotal > 0 && `Wknd `}
                      {peakSeason && `Peak `}
                      {superPeakSeason && `Super Peak`}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center border-t border-slate-800/40 pt-2">
                <span className="text-slate-400">SST Tax ({pricing.taxSstPercentage}%):</span>
                <span className="font-bold text-slate-200">RM {result.sstTotal.toFixed(2)}</span>
              </div>

              {result.transfersTotal > 0 && (
                <div className="flex justify-between items-center border-t border-slate-800/40 pt-2">
                  <span className="text-slate-400">Boat Transfer:</span>
                  <span className="font-bold text-slate-200">RM {result.transfersTotal.toFixed(2)}</span>
                </div>
              )}

              {result.gearRental.grandGearTotal > 0 && (
                <div className="flex justify-between items-start border-t border-slate-800/40 pt-2">
                  <span className="text-slate-400">Gear Rentals:</span>
                  <div className="text-right">
                    <span className="font-bold text-slate-200">RM {result.gearRental.grandGearTotal.toFixed(2)}</span>
                    <div className="text-[9px] text-slate-500">
                      {includeSnorkelingGear && `Snorkeling Set `}
                      {scubaGearDays > 0 && `Scuba x${scubaGearDays}d`}
                    </div>
                  </div>
                </div>
              )}

              {travelDatesConfirmed && result.tourismTaxTotal > 0 && (
                <div className="flex justify-between items-center border-t border-slate-800/40 pt-2">
                  <span className="text-slate-400">Tourism Tax (RM10/rm/nt):</span>
                  <span className="font-bold text-slate-200">RM {result.tourismTaxTotal.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center border-t border-slate-700/50 pt-3 text-slate-200 font-bold">
                <span>Subtotal Value:</span>
                <span>RM {result.subtotal.toFixed(2)}</span>
              </div>

              {result.discountTotal > 0 && (
                <div className="flex justify-between items-center border-t border-slate-800/40 pt-2 text-coral-glow glow-coral font-bold">
                  <span>MIDE Expo Discount:</span>
                  <span>-RM {result.discountTotal.toFixed(2)}</span>
                </div>
              )}

              {!travelDatesConfirmed && lockPriceSelected && (
                <div className="flex justify-between items-center border-t border-cyan-500/20 pt-2.5 text-cyan-300 font-extrabold">
                  <span>Locked Package Value:</span>
                  <span>RM {result.estimatedFullPackageTotal.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* GRAND TOTAL DUE */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col items-center gap-1">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-extrabold font-mono">
                {!travelDatesConfirmed && lockPriceSelected ? '🔒 Deposit Payable Now' : 'Total Payable (MYR)'}
              </span>
              <span className={`text-3xl font-black tracking-tight font-inter ${!travelDatesConfirmed && lockPriceSelected ? 'text-coral-400 glow-coral' : 'text-cyan-400 glow-cyan'}`}>
                RM {result.grandTotal.toFixed(2)}
              </span>
              <span className="text-[9px] text-slate-500 text-center font-mono mt-1 leading-normal max-w-[240px]">
                {!travelDatesConfirmed && lockPriceSelected 
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
                className="w-full bg-slate-900 border border-slate-700/60 text-slate-200 rounded-xl py-3 px-2 flex items-center justify-center gap-2 text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
              >
                <Mail className="w-4 h-4 text-cyan-400" />
                <span>Send Email</span>
              </a>

              <a
                href={whatsappLink}
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
          </div>

          {/* Quick Notice */}
          <div className="bg-slate-950/40 border border-slate-855 rounded-2xl p-4 flex flex-col gap-1">
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
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="mt-8 py-6 border-t border-slate-800/40 text-center flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-[9px] text-slate-500">
        <span>
          © 2026 {resortName}. All rights reserved. Created for MIDE 2026.
        </span>
        <div className="flex items-center gap-3">
          <span className="bg-slate-950 border border-slate-855 px-2 py-0.5 rounded text-slate-400">Next.js App Router</span>
          <span className="bg-slate-950 border border-slate-855 px-2 py-0.5 rounded text-slate-400">Tailwind CSS v4</span>
        </div>
      </footer>
    </div>
  );
}
