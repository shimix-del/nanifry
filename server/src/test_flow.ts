import prisma from './prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { deductStockForOrder } from './services/stockDeductionService.js';
import { getDashboardSummary, getProfitLoss } from './services/reportService.js';

async function runEndToEndVerification() {
  console.log('🧪 Starting Full System Automated Verification Test...');

  // 1. Check Branches & Staff
  const branches = await prisma.branch.findMany();
  console.log(`✓ Found ${branches.length} branches: ${branches.map(b => b.name).join(', ')}`);
  if (branches.length < 3) throw new Error('Expected at least 3 branches');

  const cbdBranch = branches.find(b => b.code === 'CBD01')!;

  // 2. Verify User Auth & PIN lookup
  const cashier = await prisma.user.findFirst({
    where: { pinCode: '1234', branchId: cbdBranch.id },
  });
  console.log(`✓ Cashier found: ${cashier?.name} (Role: ${cashier?.role})`);
  if (!cashier) throw new Error('Cashier PIN 1234 not found');

  // 3. Verify Menu Items & Recipes
  const chipsPlain = await prisma.menuItem.findFirst({
    where: { name: { contains: 'Chips Plain' } },
    include: { recipes: { include: { stockItem: true } } },
  });
  console.log(`✓ Menu item found: ${chipsPlain?.name} with ${chipsPlain?.recipes.length} recipe ingredient rules`);
  if (!chipsPlain || chipsPlain.recipes.length === 0) throw new Error('Chips Plain recipe not found');

  // 4. Test Stock Auto-Deduction Engine
  const potatoStockBefore = await prisma.stockItem.findFirst({
    where: { branchId: cbdBranch.id, name: { contains: 'Potatoes' } },
  });
  const initialPotatoes = potatoStockBefore!.currentStock;

  console.log(`✓ Initial Potato Stock at CBD: ${initialPotatoes} kg`);

  // Order: 2x Chips Plain (each uses 0.35kg potatoes -> total 0.70kg)
  const deductionResult = await deductStockForOrder(cbdBranch.id, [
    {
      menuItemId: chipsPlain.id,
      quantity: 2,
      itemName: chipsPlain.name,
    },
  ]);

  const potatoStockAfter = await prisma.stockItem.findFirst({
    where: { branchId: cbdBranch.id, name: { contains: 'Potatoes' } },
  });

  console.log(`✓ Stock after 2x Chips Plain order: ${potatoStockAfter!.currentStock} kg (Deducted: 0.70 kg)`);
  if (Math.abs(potatoStockAfter!.currentStock - (initialPotatoes - 0.70)) > 0.001) {
    throw new Error('Stock deduction calculation mismatch!');
  }

  // 5. Test Split Payment Order Creation
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const testOrder = await prisma.order.create({
    data: {
      orderNumber: `ORD-TEST-${Date.now()}`,
      branchId: cbdBranch.id,
      cashierId: cashier.id,
      orderType: 'DINE_IN',
      tableNumber: 'T-02',
      customerName: 'Test Customer',
      status: 'COMPLETED',
      subtotal: 500,
      discountAmount: 50,
      discountReason: 'Test VIP Discount',
      totalAmount: 450,
      items: {
        create: [
          {
            menuItemId: chipsPlain.id,
            itemName: chipsPlain.name,
            quantity: 2,
            unitPrice: 150,
            unitCost: 60,
            totalPrice: 300,
          },
        ],
      },
      payments: {
        create: [
          {
            branchId: cbdBranch.id,
            amount: 250,
            paymentMethod: 'CASH',
            cashTendered: 300,
            changeAmount: 50,
          },
          {
            branchId: cbdBranch.id,
            amount: 200,
            paymentMethod: 'MPESA',
            mpesaCode: 'QHK99TEST12',
          },
        ],
      },
    },
    include: { items: true, payments: true },
  });

  console.log(`✓ Created test order #${testOrder.orderNumber} with split Cash + M-Pesa payment`);

  // 6. Test Reports & P&L Calculation
  const summary = await getDashboardSummary(cbdBranch.id);
  console.log(`✓ Dashboard Summary - Today Gross Sales: KES ${summary.todayGrossSales}, Today Net Profit: KES ${summary.todayNetProfit}`);

  const pl = await getProfitLoss(cbdBranch.id);
  console.log(`✓ P&L Statement - Gross Profit: KES ${pl.grossProfit}, Operating Margin: ${pl.netMargin}%`);

  console.log('\n🎉 ALL AUTOMATED SYSTEM TESTS PASSED SUCCESSFULLY! 🚀');
}

runEndToEndVerification()
  .catch(err => {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
