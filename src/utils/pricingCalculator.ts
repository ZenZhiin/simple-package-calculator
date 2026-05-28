import pricingData from '../config/pricing.json';

export interface RoomCategory {
  id: string;
  name: string;
  description: string;
  upgradeCostPerPax: number;
}

export interface ResortPackage {
  id: string;
  name: string;
  duration: '3D2N' | '4D3N';
  type: 'snorkeler' | 'diver';
  category: 'course' | 'fundive' | 'snorkeling';
  rates: any;
}

export interface PricingConfig {
  resortName: string;
  currency: string;
  taxSstPercentage: number;
  tourismTaxPerRoomNight: number;
  singleOccupancySurchargePerNight: number;
  lockPriceDepositPerPax: number;
  lockPriceValidityYears: number;
  surcharges: {
    peakSeasonPerPax: number;
    superPeakSeasonPerPax: number;
  };
  transfers: {
    boatTransfer: { adult: number; child: number };
  };
  gearRental: {
    snorkelingGearSet: number;
    scubaEquipmentPerDay: number;
  };
  roomCategories: RoomCategory[];
  packages: ResortPackage[];
}

export const pricing: PricingConfig = pricingData as unknown as PricingConfig;

export const resortName = process.env.NEXT_PUBLIC_RESORT_NAME || pricing.resortName || 'Tenggol Coral Beach Resort';

export interface PackageSelectionItem {
  id: string;
  packageId: string;
  adultCount: number;
  childCount: number;
}

export interface CalculationInput {
  travelDatesConfirmed: boolean;
  packageSelections: PackageSelectionItem[];
  roomCategoryId: string;
  infantCount: number;
  roomCount: number;
  singleOccupancyRooms: number;
  weekendNights: number;
  schoolHolidayNights: number;
  publicHolidayNights: number;
  isSuperPeak: boolean;
  isForeigner: boolean;
  includeBoatTransfer: boolean;
  includeSnorkelingGear: boolean;
  scubaGearDays: number;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  lockPriceSelected: boolean;
  customerEmail?: string;
  customerPhone?: string;
  invoiceNumber?: string;
}

export interface CalculationResult {
  nights: number;
  duration: '3D2N' | '4D3N';
  totalAdults: number;
  totalChildren: number;
  totalPax: number;
  basePackageTotal: number;
  roomUpgradeTotal: number;
  singleOccupancyTotal: number;
  
  surcharges: {
    weekendTotal: number;
    schoolHolidayTotal: number;
    publicHolidayTotal: number;
    superPeakTotal: number;
    grandSurchargesTotal: number;
  };

  transfersTotal: number;
  gearRental: {
    snorkelingTotal: number;
    scubaTotal: number;
    grandGearTotal: number;
  };

  tourismTaxTotal: number;
  taxableAmount: number;
  sstTotal: number;
  subtotal: number;
  discountTotal: number;
  
  lockPriceDepositTotal: number;
  estimatedFullPackageTotal: number; 
  grandTotal: number; 
}

export function calculateQuotation(input: CalculationInput): CalculationResult {
  // 1. Determine stay duration from the longest package in the selection
  let maxNights = 2;
  input.packageSelections.forEach(item => {
    const pkg = pricing.packages.find(p => p.id === item.packageId);
    if (pkg && pkg.duration === '4D3N') {
      maxNights = 3;
    }
  });

  const nights = maxNights;
  const duration = nights === 3 ? '4D3N' : '3D2N';

  // 2. Sum up Package Base Rates and Surcharges
  let basePackageTotal = 0;
  let roomUpgradeTotal = 0;
  let totalAdults = 0;
  let totalChildren = 0;
  let diverAdultsCount = 0;
  let weekendCourseSurcharge = 0;

  // Selected Room Surcharge value
  const targetRoomCategory = pricing.roomCategories.find(r => r.id === input.roomCategoryId) || pricing.roomCategories[0];
  const targetUpgradeCost = targetRoomCategory.upgradeCostPerPax;

  // Occupancy per room determines the tier selection
  const totalGuests = input.packageSelections.reduce((sum, item) => sum + item.adultCount + item.childCount, 0);
  const occupancyPerRoom = totalGuests > 0 ? Math.ceil(totalGuests / input.roomCount) : 2;

  input.packageSelections.forEach(item => {
    const pkg = pricing.packages.find(p => p.id === item.packageId) || pricing.packages[0];
    let adultRate = 0;
    
    // Baseline Package Cost Parsing based on Categories
    if (pkg.category === 'course') {
      if (input.roomCategoryId === 'dorm') {
        adultRate = pkg.rates.dorm;
      } else {
        // Standard room: twin vs triple/quad
        if (occupancyPerRoom >= 3) {
          adultRate = pkg.rates.triple_quad;
        } else {
          adultRate = pkg.rates.twin;
        }
      }
    } else {
      // Fun Dive or Snorkeling (Weekday vs. Weekend table)
      const touchWeekend = input.travelDatesConfirmed && input.weekendNights > 0;
      const ratesTable = touchWeekend ? pkg.rates.weekend : pkg.rates.weekday;

      if (pkg.category === 'fundive') {
        if (occupancyPerRoom === 3) adultRate = ratesTable.triple;
        else if (occupancyPerRoom >= 4) adultRate = ratesTable.dorm_quad;
        else adultRate = ratesTable.twin; // Default twin/duo
      } else {
        // Snorkeling
        if (occupancyPerRoom === 3) adultRate = ratesTable.triple;
        else if (occupancyPerRoom >= 4) adultRate = ratesTable.quad;
        else adultRate = ratesTable.twin;
      }
    }

    // Child package gets 40% discount (pays 60% of base)
    const childRate = Math.round(adultRate * 0.6);

    basePackageTotal += (item.adultCount * adultRate) + (item.childCount * childRate);
    totalAdults += item.adultCount;
    totalChildren += item.childCount;

    // Room Upgrade Add-on:
    // Snorkeling rates are already based on Bayview Chalet (upgradeCost 100).
    // Courses and Fun Dives are based on Dorm/Standard (upgradeCost 0).
    const baselineUpgradeCost = pkg.category === 'snorkeling' ? 100 : 0;
    const netUpgradeCost = Math.max(0, targetUpgradeCost - baselineUpgradeCost);
    roomUpgradeTotal += netUpgradeCost * (item.adultCount + item.childCount);

    // Course Specific flat Weekend Travel Surcharge (+RM 100/pax)
    if (pkg.category === 'course' && input.travelDatesConfirmed && input.weekendNights > 0) {
      weekendCourseSurcharge += 100 * (item.adultCount + item.childCount);
    }

    if (pkg.type === 'diver') {
      diverAdultsCount += item.adultCount;
    }
  });

  const totalPax = totalAdults + totalChildren;

  // 3. Single Occupancy Surcharge
  const singleOccupancyTotal = input.singleOccupancyRooms * pricing.singleOccupancySurchargePerNight * nights;

  // 4. Flat Peak & Weekend Surcharges
  let weekendTotal = weekendCourseSurcharge; // Courses add RM100 flat. Fun dives/Snorkeling are already built-in.
  let schoolHolidayTotal = 0;
  let publicHolidayTotal = 0;
  let superPeakTotal = 0;

  if (input.travelDatesConfirmed) {
    if (input.schoolHolidayNights > 0) {
      schoolHolidayTotal = totalPax * pricing.surcharges.peakSeasonPerPax;
    }
    if (input.publicHolidayNights > 0) {
      publicHolidayTotal = totalPax * pricing.surcharges.superPeakSeasonPerPax;
    }
    if (input.isSuperPeak) {
      superPeakTotal = totalPax * pricing.surcharges.superPeakSeasonPerPax;
    }
  }

  const grandSurchargesTotal = weekendTotal + schoolHolidayTotal + publicHolidayTotal + superPeakTotal;

  // 5. Boat Transfer (Children below 11 pay RM 79)
  const transfersTotal = input.includeBoatTransfer
    ? (pricing.transfers.boatTransfer.adult * totalAdults) +
      (pricing.transfers.boatTransfer.child * totalChildren)
    : 0;

  // 6. Gear Rental (Unified Full Rental RM 90 / day)
  const snorkelingTotal = input.includeSnorkelingGear
    ? pricing.gearRental.snorkelingGearSet * totalPax
    : 0;
  
  const scubaTotal = input.scubaGearDays * pricing.gearRental.scubaEquipmentPerDay * diverAdultsCount;
  const grandGearTotal = snorkelingTotal + scubaTotal;

  // 7. Tourism Tax (For foreign passport holders: RM 10 per room per night)
  const tourismTaxTotal = input.isForeigner
    ? pricing.tourismTaxPerRoomNight * input.roomCount * nights
    : 0;

  // 8. SST (8% applied to Accommodation base + Room Upgrade Add-on + Surcharges)
  const taxableAmount = basePackageTotal + roomUpgradeTotal + singleOccupancyTotal + grandSurchargesTotal;
  const sstTotal = Math.round(taxableAmount * (pricing.taxSstPercentage / 100) * 100) / 100;

  // 9. Subtotal
  const subtotal = taxableAmount + sstTotal + transfersTotal + grandGearTotal + (input.travelDatesConfirmed ? tourismTaxTotal : 0);

  // 10. Discount
  let discountTotal = 0;
  if (input.discountValue > 0) {
    if (input.discountType === 'percentage') {
      discountTotal = Math.round(subtotal * (input.discountValue / 100) * 100) / 100;
    } else {
      discountTotal = input.discountValue;
    }
  }

  const estimatedFullPackageTotal = Math.max(0, subtotal - discountTotal);

  // 11. Lock-Price Deposit (RM 100 per person)
  const lockPriceDepositTotal = totalPax * pricing.lockPriceDepositPerPax;

  // Final Due Right Now:
  const grandTotal = (!input.travelDatesConfirmed && input.lockPriceSelected)
    ? lockPriceDepositTotal
    : estimatedFullPackageTotal;

  return {
    nights,
    duration,
    totalAdults,
    totalChildren,
    totalPax,
    basePackageTotal,
    roomUpgradeTotal,
    singleOccupancyTotal,
    surcharges: {
      weekendTotal,
      schoolHolidayTotal,
      publicHolidayTotal,
      superPeakTotal,
      grandSurchargesTotal
    },
    transfersTotal,
    gearRental: {
      snorkelingTotal,
      scubaTotal,
      grandGearTotal
    },
    tourismTaxTotal: input.travelDatesConfirmed ? tourismTaxTotal : 0,
    taxableAmount,
    sstTotal,
    subtotal,
    discountTotal,
    lockPriceDepositTotal,
    estimatedFullPackageTotal,
    grandTotal
  };
}

export function formatWhatsAppQuote(input: CalculationInput, result: CalculationResult, roomName: string): string {
  const currency = pricing.currency;
  const citizenship = input.isForeigner ? 'Foreigner' : 'Malaysian';

  let msg = `🌴 *${resortName.toUpperCase()}* 🌴\n`;
  if (input.invoiceNumber) {
    msg += `📄 *Invoice No:* ${input.invoiceNumber}\n`;
  }
  msg += `-------------------------------------------\n`;

  // --- DUAL PATH FORMATTING ---
  if (!input.travelDatesConfirmed && input.lockPriceSelected) {
    msg += `🔒 *MIDE 2026 Expo - Price Lock Guarantee* 🔒\n`;
    msg += `-------------------------------------------\n`;
    msg += `👤 *Client Group:* ${result.totalAdults} Adult(s)`;
    if (result.totalChildren > 0) msg += `, ${result.totalChildren} Child(ren)`;
    msg += `\n`;
    if (input.customerEmail) msg += `📧 *Email:* ${input.customerEmail}\n`;
    if (input.customerPhone) msg += `📞 *Contact:* ${input.customerPhone}\n`;
    msg += `📅 *Travel Dates:* To Be Confirmed (Flexible Stay) 🗓️\n`;
    msg += `🔒 *Lock validity:* 1 Year (Claim by 18-May-2027) ✅\n`;
    msg += `-------------------------------------------\n`;
    msg += `🏠 *Accommodation:* ${roomName}\n`;
    msg += `⏱️ *Max Duration Stay:* ${result.duration} (${result.nights} Nights)\n`;
    msg += `-------------------------------------------\n`;
    msg += `📦 *Locked Custom Packages:* \n`;
    
    input.packageSelections.forEach((item, index) => {
      const pkg = pricing.packages.find(p => p.id === item.packageId);
      if (pkg) {
        msg += `  ${index + 1}. ${pkg.name}\n`;
        msg += `     └ (${item.adultCount}A`;
        if (item.childCount > 0) msg += ` + ${item.childCount}C`;
        msg += `)\n`;
      }
    });

    msg += `-------------------------------------------\n`;
    msg += `• Lock Deposit Rate: ${currency} ${pricing.lockPriceDepositPerPax} per person\n`;
    msg += `🔥 *Deposit Payable Now:* *${currency} ${result.grandTotal.toFixed(2)}* (${result.totalPax} Pax)\n`;
    msg += `-------------------------------------------\n`;
    msg += `💰 *Locked Expo Package Value (Estimated):*\n`;
    msg += `  • Package Standard Base: ${currency} ${result.basePackageTotal.toFixed(2)}\n`;
    if (result.roomUpgradeTotal > 0) msg += `  • Room Upgrade Surcharge: ${currency} ${result.roomUpgradeTotal.toFixed(2)}\n`;
    if (result.transfersTotal > 0) msg += `  • Boat Transfers: ${currency} ${result.transfersTotal.toFixed(2)}\n`;
    if (result.gearRental.grandGearTotal > 0) msg += `  • Gear Rentals: ${currency} ${result.gearRental.grandGearTotal.toFixed(2)}\n`;
    if (result.discountTotal > 0) msg += `  • MIDE Promo Discount: -${currency} ${result.discountTotal.toFixed(2)}\n`;
    msg += `⭐ *Locked Total Value: ${currency} ${result.estimatedFullPackageTotal.toFixed(2)}* (due on booking stay)\n`;
    msg += `-------------------------------------------\n`;
    msg += `🎉 *MIDE 2026 PROMO ENTITLEMENTS* 🎉\n`;
    msg += `🎟️ ${result.totalPax}x Grand Prize Lucky Draw Entries\n`;
    msg += `🎁 ${result.totalPax}x Scratch & Win Chances (Booth Promo)\n`;
    msg += `-------------------------------------------\n`;
    msg += `📲 _Secure your expo rates by returning this lock voucher back to lock!_`;
  } else {
    // Confirmed dynamic multi-package quote
    msg += `⭐ *MIDE 2026 Special Group Quote* ⭐\n`;
    msg += `-------------------------------------------\n`;
    msg += `📅 *Travel Dates:* Confirmed ✅\n`;
    msg += `🏠 *Accommodation:* ${roomName}\n`;
    msg += `⏱️ *Duration stay:* ${result.duration} (${result.nights} Nights)\n`;
    msg += `👤 *Total Guests:* ${result.totalAdults} Adult(s)`;
    if (result.totalChildren > 0) msg += `, ${result.totalChildren} Child(ren)`;
    if (input.infantCount > 0) msg += `, ${input.infantCount} Infant(s) (0-3 yrs)`;
    msg += `\n`;
    if (input.customerEmail) msg += `📧 *Email:* ${input.customerEmail}\n`;
    if (input.customerPhone) msg += `📞 *Contact:* ${input.customerPhone}\n`;
    msg += `🇲🇾 *Citizenship:* ${citizenship}\n`;
    msg += `🔑 *Rooms booked:* ${input.roomCount} room(s)\n`;
    if (input.singleOccupancyRooms > 0) {
      msg += `👤 *Single Occupancy Rooms:* ${input.singleOccupancyRooms} room(s)\n`;
    }
    msg += `-------------------------------------------\n`;
    msg += `📦 *Custom Packages selected:* \n`;
    
    input.packageSelections.forEach((item, index) => {
      const pkg = pricing.packages.find(p => p.id === item.packageId);
      if (pkg) {
        msg += `  ${index + 1}. ${pkg.name}\n`;
        msg += `     └ (${item.adultCount} Adult(s)`;
        if (item.childCount > 0) msg += ` + ${item.childCount} Child(ren)`;
        msg += `)\n`;
      }
    });

    msg += `-------------------------------------------\n`;
    msg += `• Accommodation Base Total: ${currency} ${result.basePackageTotal.toFixed(2)}\n`;
    if (result.roomUpgradeTotal > 0) {
      msg += `• Room Upgrade Add-on: ${currency} ${result.roomUpgradeTotal.toFixed(2)}\n`;
    }

    if (result.singleOccupancyTotal > 0) {
      msg += `• Single Room Surcharge: ${currency} ${result.singleOccupancyTotal.toFixed(2)}\n`;
    }

    if (result.surcharges.grandSurchargesTotal > 0) {
      msg += `• Surcharges (Dates/Holidays): ${currency} ${result.surcharges.grandSurchargesTotal.toFixed(2)} (`;
      const surchargeDetails = [];
      if (result.surcharges.weekendTotal > 0) surchargeDetails.push(`Weekend Courses`);
      if (input.schoolHolidayNights > 0) surchargeDetails.push(`Peak Season`);
      if (input.publicHolidayNights > 0 || input.isSuperPeak) surchargeDetails.push(`Super Peak`);
      msg += surchargeDetails.join(', ') + `)\n`;
    }

    msg += `• SST (${pricing.taxSstPercentage}%): ${currency} ${result.sstTotal.toFixed(2)}\n`;

    if (result.transfersTotal > 0) {
      msg += `• Boat Transfers (RM100/pax): ${currency} ${result.transfersTotal.toFixed(2)}\n`;
    }

    if (result.gearRental.grandGearTotal > 0) {
      msg += `• Gear Rental: ${currency} ${result.gearRental.grandGearTotal.toFixed(2)} (`;
      const gearDetails = [];
      if (input.includeSnorkelingGear) gearDetails.push(`Snorkeling Set`);
      if (input.scubaGearDays > 0) gearDetails.push(`Scuba Gear x${input.scubaGearDays}d`);
      msg += gearDetails.join(', ') + `)\n`;
    }

    if (result.tourismTaxTotal > 0) {
      msg += `• Tourism Tax (RM10/rm/nt): ${currency} ${result.tourismTaxTotal.toFixed(2)}\n`;
    }

    msg += `-------------------------------------------\n`;
    msg += `• Subtotal: ${currency} ${result.subtotal.toFixed(2)}\n`;

    if (result.discountTotal > 0) {
      msg += `🔥 *MIDE Expo Discount:* -${currency} ${result.discountTotal.toFixed(2)} `;
      if (input.discountType === 'percentage') msg += `(${input.discountValue}%)`;
      msg += `\n`;
    }

    msg += `⭐ *GRAND TOTAL: ${currency} ${result.grandTotal.toFixed(2)}* ⭐\n`;
    msg += `-------------------------------------------\n`;
    const deposit50 = result.grandTotal * 0.5;
    msg += `💳 *50% Deposit Required Now:* ${currency} ${deposit50.toFixed(2)}\n`;
    msg += `💳 *Balance Due (30 Days Before):* ${currency} ${deposit50.toFixed(2)}\n`;
    msg += `-------------------------------------------\n`;
    msg += `🎉 *MIDE 2026 PROMO ENTITLEMENTS* 🎉\n`;
    msg += `🎟️ ${result.totalPax}x Grand Prize Lucky Draw Entries\n`;
    msg += `🎁 ${result.totalPax}x Scratch & Win Chances (Booth Promo)\n`;
    msg += `-------------------------------------------\n`;
    msg += `📲 _Quotation generated at MIDE 2026 by ${resortName} Promoter._\n`;
    msg += `👉 Contact us to secure your slots!`;
  }

  return msg;
}
