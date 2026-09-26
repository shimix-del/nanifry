# 🍟 NANI FRYS - Multi-Branch Hotel, Fast Food & Restaurant Management POS

A responsive, ultra-fast, multi-branch web Point of Sale (POS) and inventory management system designed specifically for Kenyan food eateries/restaurants ("hotels" selling Chips, Kuku, Sausages, Pilau, Biryani, Sodas, and fresh Juices).

---

## 🌟 Key Capabilities & Merged Business Features

1. **Multi-Branch Architecture & Scoping**
   - **Central Owner Roll-Up Dashboard**: Real-time sales, profitability, and stock levels aggregated across all branches (e.g. Migadini Main Shop, Branch 2) with single-branch filtering.
   - **Inter-Branch Stock Transfers**: Track inventory dispatched, in transit, and received between branches with full audit trails.
   - **Branch Isolation**: Cashiers and Branch Managers operate scoped to their assigned `branch_id`.

2. **Dual Access Roles & Rapid Cashier PIN Switch**
   - **Owner / Admin**: Full financial P&L access, all branches, menu creation, recipe Bill of Materials (BOM), staff management.
   - **Branch Manager**: Branch reports, stock intake, daily expense logging, discounts approval, and cashier shift audits.
   - **Cashier / Waiter**: Touchscreen-optimized POS terminal, order parking/holding, M-Pesa / Cash payments, split payments, and 4-digit PIN fast login.

3. **Touch POS Cashier Screen**
   - **Kenyan Food Categorization**: Fast Foods (Chips, Sausages), Kuku & Meat (Choma, Fry, Kienyeji), Swahili Meals (Pilau, Biryani, Mukimo), Drinks (Sodas, Water, Fresh Juices), Pasua Snacks (Smokie Pasua, Mayai).
   - **Portion & Variant Sizing**: 1/4 Kuku, 1/2 Kuku, Full Kuku; Plain Pilau vs Beef Pilau vs Kuku Pilau.
   - **Order Types**: Dine-In (with Table #), Takeaway, and Delivery.
   - **Park / Hold Orders**: 1-click park current cart to attend to next customer, and resume later.
   - **Discounts**: KES fixed amount or percentage discount with mandatory reason logging.
   - **Multi-Payment Checkout**:
     - Cash with quick bill buttons (+100, +200, +500, +1000, +2000, exact) and automatic change computation.
     - M-Pesa Buy Goods Till & Paybill reference, customer phone, transaction code verification, and STK push prompt simulator.
     - Split Payment (e.g. KES 400 M-Pesa + KES 150 Cash).
     - Card / Bank slip.
   - **Thermal Receipt Engine**: Standard 58mm & 80mm ESC/POS layout with instant thermal print and 1-click WhatsApp receipt sharing.

4. **Dual-Tier Inventory Engine & Automated Stock Deduction**
   - **Direct Unit Counting**: Packaged beverages (Coca-Cola, Sprite, Fanta, Dasani Water) auto-deducted per unit.
   - **Recipe Bill of Materials (BOM) Auto-Deduction**: Raw stock auto-deducted on each sale (e.g. 1 Plate Chips = 0.35kg Potatoes + 0.05L Oil; 1 Plate Pilau = 0.2kg Rice + 0.15kg Beef + 0.03L Oil).
   - **Restock Intake**: Record supplier name, delivery invoice, unit purchase cost, and quantity added.
   - **Stock Reconciliation & Audit Tool**: Compare physical counted stock against system expected stock, calculate shrinkage variance, and log reasons (Theft, Spoilage, Wastage).

5. **Shift & Cash Float Management (Z-Reports)**
   - Opening cash float input.
   - Mid-shift cash drops to safe and emergency payouts.
   - Shift closing with cash drawer count verification -> Cash Over/Short variance calculation -> printable Z-Report.

6. **Daily Expense Tracker & Real Net Profit (P&L)**
   - Log market produce (Wakulima tomatoes/onions), gas cylinder refills, cooking oil jerrycans, casual wages, boda boda transport.
   - Real Net Operating Profit calculation: `Net Profit = Gross Sales - COGS (Recipe costs) - Total Expenses`.

7. **Offline Reliability & Local Storage Queue**
   - LocalStorage / IndexedDB queue allows order processing during internet dips with automatic central synchronization upon reconnection.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)

### Installation & Database Setup
```bash
# 1. Install server dependencies & seed database
cd "d:/pos sys/server"
npm install
npx prisma db push
npm run db:seed

# 2. Install client dependencies
cd "d:/pos sys/client"
npm install
```

### Running the Application

In terminal 1 (Backend Server):
```bash
cd "d:/pos sys/server"
npm run dev
# Server running at http://localhost:5000
```

In terminal 2 (Frontend Client):
```bash
cd "d:/pos sys/client"
npm run dev
# Web POS running at http://localhost:3000
```

---

## 🔑 Demo Logins & Fast 4-Digit PINs

| Role | Name | Email | Password | 4-Digit PIN | Branch Scope |
|---|---|---|---|---|---|
| **Owner** | Robina | `admin@nanifrys.co.ke` | `admin123` | `9999` | All Branches (Central HQ) |
| **Manager** | Manager | `manager@nanifrys.co.ke` | `manager123` | `1111` | Migadini Main Shop |
| **Cashier** | Cashier 1 | `cashier1@nanifrys.co.ke` | `cashier123` | `1234` | Migadini Main Shop |
| **Cashier** | Cashier 2 | `cashier2@nanifrys.co.ke` | `cashier123` | `2345` | Migadini Main Shop |
| **Cashier** | Cashier 3 | `cashier3@nanifrys.co.ke` | `cashier123` | `3456` | Migadini Main Shop |
| **Cashier** | Cashier 4 | `cashier4@nanifrys.co.ke` | `cashier123` | `4567` | Migadini Main Shop |

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, Custom Thermal Print CSS, Offline Sync Queue.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, JWT, bcryptjs.
- **Database**: SQLite (default local zero-config) with 1-line connection switch to PostgreSQL / Supabase for cloud production.
- **Localization**: Kenyan Shillings (KES / Ksh), M-Pesa integration points, 58mm/80mm receipt templates, WhatsApp web share.

---

## 📦 Deployment Options

### Option A: Local Restaurant POS Appliance (Zero Hosting Cost)
Run the server and client locally on a touchscreen PC, mini-PC, or laptop behind the counter. Other cashier tablets/phones connect via the restaurant's local Wi-Fi router IP (e.g. `http://192.168.1.100:3000`).

### Option B: Cloud Deployment (Multi-Branch Rollup)
1. **Database**: Create a free PostgreSQL database on [Supabase](https://supabase.com) or [Neon](https://neon.tech). Set `DATABASE_URL="postgresql://..."` in server `.env`.
2. **Backend**: Deploy `server/` to [Railway](https://railway.app) or [Render](https://render.com).
3. **Frontend**: Deploy `client/` to [Vercel](https://vercel.com) or [Netlify](https://netlify.com) pointing API requests to your backend URL.
