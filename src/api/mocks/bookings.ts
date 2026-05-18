export interface MockBooking {
  id: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  invoiceNumber?: string | null;
  travelDatesConfirmed: boolean;
  roomCategoryId: string;
  roomCount: number;
  adultCount: number;
  childCount: number;
  infantCount: number;
  weekendTravel: boolean;
  peakSeason: boolean;
  superPeakSeason: boolean;
  isForeigner: boolean;
  includeBoatTransfer: boolean;
  includeSnorkelingGear: boolean;
  scubaGearDays: number;
  discountType: string;
  discountValue: number;
  lockPriceSelected: boolean;
  grandTotal: number;
  whatsappQuote: string;
  packageSelections: any;
  createdAt: string;
}

// In-memory mock database store for instant local developer demos
export let mockBookings: MockBooking[] = [
  {
    id: "demo-booking-1",
    customerName: "Jason Ho",
    customerEmail: "jasonho88@gmail.com",
    customerPhone: "+60123456789",
    invoiceNumber: "MIDE-2026-1042",
    travelDatesConfirmed: true,
    roomCategoryId: "beachfront",
    roomCount: 1,
    adultCount: 2,
    childCount: 0,
    infantCount: 0,
    weekendTravel: true,
    peakSeason: false,
    superPeakSeason: false,
    isForeigner: false,
    includeBoatTransfer: true,
    includeSnorkelingGear: false,
    scubaGearDays: 0,
    discountType: "percentage",
    discountValue: 0,
    lockPriceSelected: false,
    grandTotal: 3074.96,
    whatsappQuote: "🌴 *TENGGOL PARADISE RESORT* 🌴\n📋 *EXPO PROPOSAL INVOICE*\nProspect: Jason Ho\nStay Length: 3D2N\nRoom Tier: Beach Front Chalet\nTotal Stays: 1 Rooms\nGuests: 2 Adults, 0 Kids, 0 Infants\n\n-----------------------------\nAccommodation Packages:\n- 3D2N Fun Dive Package (4 Dives) × 2 Adult(s) = RM 2,362.00\nRoom Upgrade Surcharge = RM 300.00\nSST Tax (8.00%) = RM 212.96\nBoat Transfer Add-on = RM 200.00\n-----------------------------\nSUBTOTAL VALUE: RM 3,074.96\n⭐ *GRAND TOTAL: MYR 3,074.96* ⭐\n-----------------------------",
    packageSelections: [
      { id: "1", packageId: "fun_dive_3d2n", adultCount: 2, childCount: 0 }
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
  }
];

export const addMockBooking = (booking: Omit<MockBooking, "id" | "createdAt">): MockBooking => {
  const newBooking: MockBooking = {
    ...booking,
    id: `mock-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString()
  };
  mockBookings = [newBooking, ...mockBookings];
  return newBooking;
};
