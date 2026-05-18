# 🌴 MIDE 2026 Smart Promoter Calculator & CRM Ledger

A highly optimized, production-grade group pricing engine and sales tracking ledger designed for promoter personnel at the **MIDE 2026 Scuba Expo**. 

This system allows promoters to customize complex multi-package group stay quotas (PADI Courses, Fun Dives, Snorkeling, room category upgrades, tax regimes, and surcharges), generate print-ready invoice proposals, and log transactions directly to a CRM tracking dashboard.

---

## 🚀 Key CRM Features

*   **👥 Unified Prospect Details Grid:** Captures complete customer profiles (Prospect Name, Email Address, Contact Number, and carbon-copy Invoice Number) at the point of sale.
*   **⚖️ Double-SST & Holiday Surcharge Matrix:** Automatically tracks weekend courses, peak school holidays, super-peak national holidays, single room surcharges, foreign tourist levies, and 8% SST.
*   **🔒 Flexible Price Lock Guarantee:** Allows unconfirmed-date guests to lock expo package prices for **1 year** by paying a flat RM 100/pax deposit.
*   **📊 Transaction CRM Ledger:** Dedicated dashboard at `/transactions` summarizing key metrics (cumulative booking value, deposits locked, total groups processed).
*   **🔍 Multi-Field Instant Search:** Promoters can filter transactions instantaneously by **Name, Email, Phone, or Invoice Code**.
*   **📲 Instant Sharing Hub:** Generates styled WhatsApp receipt copy text, pre-formatted emails, print invoice capabilities, and PDF downloads.

---

## 🛠️ Stack & Architecture

*   **Frontend:** React 19 (Hooks, Memoization) & Next.js 16 (App Router)
*   **Styles:** PostCSS & Tailwind CSS (v4) with tailwind variable custom theme configurations
*   **Database Schema:** Prisma ORM connecting to **Supabase (PostgreSQL)**
*   **Icons:** Lucide React

---

## ⚙️ How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment variables
Create a `.env` file in the root directory:
```env
# Optional Supabase Database URLs
DATABASE_URL="postgresql://postgres:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Mock Switch - Set to true to bypass database during local dry runs
USE_MOCK="true"

# Dynamic Resort Custom Parameter
NEXT_PUBLIC_RESORT_NAME="Tenggol Paradise Resort"
```

### 3. Generate Staged Database Client
```bash
npx prisma generate
```

### 4. Run Developer Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) inside your web browser.

---

## 🎛️ Dual Mock-to-Live Database Toggle

The application supports a zero-downtime database hot-swap. This allows the system to operate fully in **Mock Mode** during staging or before Supabase credentials are wired.

```
                  ┌───────────────────────────────┐
                  │   API Call (GET/POST Bookings)│
                  └───────────────┬───────────────┘
                                  │
                   Is USE_MOCK=true OR no DATABASE_URL?
                                 / \
                                /   \
                        YES   /       \   NO
                            /           \
                          ▼               ▼
             ┌─────────────────────┐    ┌───────────────────────────┐
             │ In-Memory Mock Store│    │ Supabase PostgreSQL DB    │
             │ (Volatile Sandbox)  │    │ (Prisma Client Persistent)│
             └─────────────────────┘    └───────────────────────────┘
```

*   **Mock Mode (Active by default):** If `USE_MOCK="true"` OR if `DATABASE_URL` is omitted, all booked groups will read/write from a virtual mock database array (`src/api/mocks/bookings.ts`).
*   **Live Mode (Active in production):** Once you input your Supabase connection strings inside Vercel, the engine instantly maps all transactions to the secure PostgreSQL relational schema.

---

## 🗄️ Relational Database Schema Model (`Prisma`)

```prisma
model Booking {
  id                   String   @id @default(uuid())
  customerName         String
  customerEmail        String?
  customerPhone        String?
  invoiceNumber        String?
  travelDatesConfirmed Boolean
  roomCategoryId       String
  roomCount            Int
  adultCount           Int
  childCount           Int
  infantCount          Int
  weekendTravel        Boolean
  peakSeason           Boolean
  superPeakSeason      Boolean
  isForeigner          Boolean
  includeBoatTransfer  Boolean
  includeSnorkelingGear Boolean
  scubaGearDays        Int
  discountType         String
  discountValue        Float
  lockPriceSelected    Boolean
  grandTotal           Float
  whatsappQuote        String
  packageSelections    Json
  createdAt            DateTime @default(now())
}
```
