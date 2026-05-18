import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';
import { mockBookings, addMockBooking } from '../../../api/mocks/bookings';

// Conditionally route requests to local mock in-memory database if no database environment is supplied
const shouldUseMock = process.env.USE_MOCK === 'true' || !process.env.DATABASE_URL;

export async function GET() {
  if (shouldUseMock) {
    return NextResponse.json(mockBookings);
  }

  try {
    const bookings = await prisma.booking.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(bookings);
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Destructure and validate input parameters
    const {
      customerName,
      customerEmail,
      customerPhone,
      invoiceNumber,
      travelDatesConfirmed,
      roomCategoryId,
      roomCount,
      adultCount,
      childCount,
      infantCount,
      weekendTravel,
      peakSeason,
      superPeakSeason,
      isForeigner,
      includeBoatTransfer,
      includeSnorkelingGear,
      scubaGearDays,
      discountType,
      discountValue,
      lockPriceSelected,
      grandTotal,
      whatsappQuote,
      packageSelections,
    } = body;

    if (!customerName || customerName.trim() === '') {
      return NextResponse.json(
        { error: 'Prospect Name is required to save booking' },
        { status: 400 }
      );
    }

    const bookingData = {
      customerName: customerName.trim(),
      customerEmail: customerEmail ? customerEmail.trim() : null,
      customerPhone: customerPhone ? customerPhone.trim() : null,
      invoiceNumber: invoiceNumber ? invoiceNumber.trim() : null,
      travelDatesConfirmed: !!travelDatesConfirmed,
      roomCategoryId: roomCategoryId || 'standard',
      roomCount: Number(roomCount) || 1,
      adultCount: Number(adultCount) || 0,
      childCount: Number(childCount) || 0,
      infantCount: Number(infantCount) || 0,
      weekendTravel: !!weekendTravel,
      peakSeason: !!peakSeason,
      superPeakSeason: !!superPeakSeason,
      isForeigner: !!isForeigner,
      includeBoatTransfer: !!includeBoatTransfer,
      includeSnorkelingGear: !!includeSnorkelingGear,
      scubaGearDays: Number(scubaGearDays) || 0,
      discountType: discountType || 'percentage',
      discountValue: Number(discountValue) || 0,
      lockPriceSelected: !!lockPriceSelected,
      grandTotal: Number(grandTotal) || 0,
      whatsappQuote: whatsappQuote || '',
      packageSelections: packageSelections || [],
    };

    if (shouldUseMock) {
      const saved = addMockBooking(bookingData);
      return NextResponse.json(saved, { status: 201 });
    }

    const booking = await prisma.booking.create({
      data: bookingData,
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to save booking', details: error.message },
      { status: 500 }
    );
  }
}
