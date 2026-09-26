import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding NANI FRYS database with restaurant data...');

  // Clean existing data
  await prisma.cashMovement.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.stockTransfer.deleteMany();
  await prisma.stockAudit.deleteMany();
  await prisma.menuItemRecipe.deleteMany();
  await prisma.menuItemVariant.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.stockItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.branch.deleteMany();

  // 1. Create Branches
  console.log('Creating branches...');
  const migadini = await prisma.branch.create({
    data: {
      name: 'Migadini Main Shop',
      code: 'MGD01',
      address: 'Migadini, Mombasa',
      phone: '+254 712 345 678',
      tillNumber: '5428901',
      paybillNumber: '247247',
      isActive: true,
    },
  });

  const branch2 = await prisma.branch.create({
    data: {
      name: 'Branch 2 - Express',
      code: 'EXP02',
      address: 'Express Outlet',
      phone: '+254 722 987 654',
      tillNumber: '5428902',
      paybillNumber: '247247',
      isActive: true,
    },
  });

  // 2. Create Users
  console.log('Creating users...');
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('admin123', salt);
  const managerPasswordHash = await bcrypt.hash('manager123', salt);
  const cashierPasswordHash = await bcrypt.hash('cashier123', salt);

  const owner = await prisma.user.create({
    data: {
      name: 'Robina',
      email: 'admin@nanifrys.co.ke',
      phone: '+254 700 000 001',
      role: 'OWNER',
      pinCode: '9999',
      passwordHash: adminPasswordHash,
      branchId: null, // Owner oversees all branches
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: 'Manager',
      email: 'manager@nanifrys.co.ke',
      phone: '+254 711 111 222',
      role: 'MANAGER',
      pinCode: '1111',
      passwordHash: managerPasswordHash,
      branchId: migadini.id,
    },
  });

  const cashier1 = await prisma.user.create({
    data: {
      name: 'Cashier 1',
      email: 'cashier1@nanifrys.co.ke',
      phone: '+254 722 222 331',
      role: 'CASHIER',
      pinCode: '1234',
      passwordHash: cashierPasswordHash,
      branchId: migadini.id,
    },
  });

  const cashier2 = await prisma.user.create({
    data: {
      name: 'Cashier 2',
      email: 'cashier2@nanifrys.co.ke',
      phone: '+254 722 222 332',
      role: 'CASHIER',
      pinCode: '2345',
      passwordHash: cashierPasswordHash,
      branchId: migadini.id,
    },
  });

  const cashier3 = await prisma.user.create({
    data: {
      name: 'Cashier 3',
      email: 'cashier3@nanifrys.co.ke',
      phone: '+254 722 222 333',
      role: 'CASHIER',
      pinCode: '3456',
      passwordHash: cashierPasswordHash,
      branchId: migadini.id,
    },
  });

  const cashier4 = await prisma.user.create({
    data: {
      name: 'Cashier 4',
      email: 'cashier4@nanifrys.co.ke',
      phone: '+254 722 222 334',
      role: 'CASHIER',
      pinCode: '4567',
      passwordHash: cashierPasswordHash,
      branchId: migadini.id,
    },
  });

  // 3. Create Categories
  console.log('Creating categories...');
  const catFastFood = await prisma.category.create({
    data: { name: 'Fast Foods & Chips', code: 'fast_foods', sortOrder: 1, icon: 'Flame' },
  });
  const catMeat = await prisma.category.create({
    data: { name: 'Kuku & Meat Dishes', code: 'meat_chicken', sortOrder: 2, icon: 'Drumstick' },
  });
  const catRice = await prisma.category.create({
    data: { name: 'Swahili Cooked Meals', code: 'cooked_meals', sortOrder: 3, icon: 'Soup' },
  });
  const catDrinks = await prisma.category.create({
    data: { name: 'Drinks & Juices', code: 'drinks_juices', sortOrder: 4, icon: 'CupSoda' },
  });
  const catSnacks = await prisma.category.create({
    data: { name: 'Snacks & Pasua Sides', code: 'snacks_sides', sortOrder: 5, icon: 'Cookie' },
  });

  // 4. Create Stock Items for each branch
  console.log('Creating stock items...');
  const branches = [migadini, branch2];
  const stockMap: Record<string, Record<string, string>> = {};

  for (const b of branches) {
    stockMap[b.id] = {};

    const items = [
      { name: 'Potatoes (Shangi)', type: 'RAW_INGREDIENT', unit: 'kg', stock: 120, min: 25, cost: 70, supplier: 'Kinangop Farmers Co-op' },
      { name: 'Raw Chicken (Whole/Cut)', type: 'RAW_INGREDIENT', unit: 'kg', stock: 80, min: 20, cost: 380, supplier: 'Kenchic Supplies' },
      { name: 'Basmati Rice (Grade 1)', type: 'RAW_INGREDIENT', unit: 'kg', stock: 95, min: 20, cost: 160, supplier: 'Mwea Rice Millers' },
      { name: 'Fresh Beef (Stew Cut)', type: 'RAW_INGREDIENT', unit: 'kg', stock: 65, min: 15, cost: 520, supplier: 'Dagoretti Slaughterhouse' },
      { name: 'Cooking Oil (Rina/Elianto)', type: 'RAW_INGREDIENT', unit: 'litre', stock: 50, min: 15, cost: 240, supplier: 'Bidco Africa' },
      { name: 'Tomatoes & Onions', type: 'RAW_INGREDIENT', unit: 'kg', stock: 45, min: 10, cost: 90, supplier: 'Wakulima Market' },
      { name: 'Pilau & Biryani Spices', type: 'RAW_INGREDIENT', unit: 'pack', stock: 40, min: 8, cost: 120, supplier: 'Tropical Spices Mombasa' },
      { name: 'Smokies Pack (Farmer\'s Choice)', type: 'PACKAGED_UNIT', unit: 'piece', stock: 150, min: 30, cost: 28, supplier: 'Farmer\'s Choice' },
      { name: 'Beef Sausages', type: 'PACKAGED_UNIT', unit: 'piece', stock: 100, min: 25, cost: 38, supplier: 'Farmer\'s Choice' },
      { name: 'Coca-Cola 300ml Glass', type: 'PACKAGED_UNIT', unit: 'bottle', stock: 144, min: 24, cost: 35, supplier: 'Nairobi Bottlers' },
      { name: 'Sprite 300ml Glass', type: 'PACKAGED_UNIT', unit: 'bottle', stock: 96, min: 24, cost: 35, supplier: 'Nairobi Bottlers' },
      { name: 'Fanta Orange 300ml Glass', type: 'PACKAGED_UNIT', unit: 'bottle', stock: 96, min: 24, cost: 35, supplier: 'Nairobi Bottlers' },
      { name: 'Coca-Cola 500ml PET', type: 'PACKAGED_UNIT', unit: 'bottle', stock: 80, min: 20, cost: 55, supplier: 'Nairobi Bottlers' },
      { name: 'Dasani Mineral Water 500ml', type: 'PACKAGED_UNIT', unit: 'bottle', stock: 120, min: 30, cost: 25, supplier: 'Nairobi Bottlers' },
      { name: 'Keringet Sparkling Water 1L', type: 'PACKAGED_UNIT', unit: 'bottle', stock: 48, min: 12, cost: 50, supplier: 'Crown Beverages' },
      { name: 'Fresh Passion Fruit', type: 'RAW_INGREDIENT', unit: 'kg', stock: 35, min: 8, cost: 110, supplier: 'Wakulima Market' },
      { name: 'Fresh Mangoes', type: 'RAW_INGREDIENT', unit: 'kg', stock: 30, min: 8, cost: 100, supplier: 'Wakulima Market' },
      { name: 'Gas Cylinder (13kg LPG)', type: 'RAW_INGREDIENT', unit: 'piece', stock: 4, min: 1, cost: 2800, supplier: 'TotalEnergies' },
    ];

    for (const item of items) {
      const created = await prisma.stockItem.create({
        data: {
          branchId: b.id,
          name: item.name,
          type: item.type,
          unit: item.unit,
          currentStock: item.stock,
          minStockAlert: item.min,
          unitCost: item.cost,
          supplierName: item.supplier,
        },
      });
      stockMap[b.id][item.name] = created.id;
    }
  }

  // 5. Create Menu Items, Variants, and Recipes
  console.log('Creating menu items & recipes...');

  // A. Fast Foods
  const chipsPlain = await prisma.menuItem.create({
    data: {
      categoryId: catFastFood.id,
      name: 'Chips Plain (French Fries)',
      description: 'Hot crispy potato chips seasoned with salt and fresh tomato sauce',
      basePrice: 150,
      costPrice: 60,
      imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&q=80',
      isAvailable: true,
      hasVariants: false,
    },
  });

  const chipsMasala = await prisma.menuItem.create({
    data: {
      categoryId: catFastFood.id,
      name: 'Chips Masala (Swahili Style)',
      description: 'Chips tossed in spicy tomato masala gravy with coriander and lemon',
      basePrice: 200,
      costPrice: 85,
      imageUrl: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=500&q=80',
      isAvailable: true,
      hasVariants: false,
    },
  });

  const chipsMayai = await prisma.menuItem.create({
    data: {
      categoryId: catFastFood.id,
      name: 'Chips Mayai (Zege)',
      description: 'Crispy chips bound in double-egg omelette served with Kachumbari',
      basePrice: 250,
      costPrice: 100,
      imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&q=80',
      isAvailable: true,
      hasVariants: false,
    },
  });

  const chipsKuku = await prisma.menuItem.create({
    data: {
      categoryId: catFastFood.id,
      name: 'Chips & 1/4 Kuku Combo',
      description: 'Generous plate of chips served with quarter roasted or fried chicken',
      basePrice: 450,
      costPrice: 220,
      imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&q=80',
      isAvailable: true,
      hasVariants: false,
    },
  });

  // B. Kuku / Chicken Items
  const kukuChoma = await prisma.menuItem.create({
    data: {
      categoryId: catMeat.id,
      name: 'Kuku Choma (Roast Chicken)',
      description: 'Marinated and char-grilled tender chicken served with hot chili & kachumbari',
      basePrice: 300,
      costPrice: 130,
      imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=500&q=80',
      isAvailable: true,
      hasVariants: true,
      variants: {
        create: [
          { name: '1/4 Kuku Choma', price: 300, costPrice: 130 },
          { name: '1/2 Kuku Choma', price: 550, costPrice: 250 },
          { name: 'Full Kuku Choma', price: 1000, costPrice: 480 },
        ],
      },
    },
    include: { variants: true },
  });

  const kukuFry = await prisma.menuItem.create({
    data: {
      categoryId: catMeat.id,
      name: 'Kuku Wet Fry (Thick Gravy)',
      description: 'Chicken pieces pan-fried in rich onion, tomato, and garlic reduction',
      basePrice: 320,
      costPrice: 140,
      imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500&q=80',
      isAvailable: true,
      hasVariants: true,
      variants: {
        create: [
          { name: '1/4 Wet Fry', price: 320, costPrice: 140 },
          { name: '1/2 Wet Fry', price: 580, costPrice: 260 },
          { name: 'Full Wet Fry', price: 1050, costPrice: 500 },
        ],
      },
    },
    include: { variants: true },
  });

  // C. Swahili Cooked Meals
  const beefPilau = await prisma.menuItem.create({
    data: {
      categoryId: catRice.id,
      name: 'Swahili Beef Pilau',
      description: 'Fragrant basmati rice slow-cooked with tender beef, cumin, cloves, and cinnamon',
      basePrice: 320,
      costPrice: 140,
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80',
      isAvailable: true,
      hasVariants: true,
      variants: {
        create: [
          { name: 'Pilau Plain (Rice only)', price: 180, costPrice: 70 },
          { name: 'Beef Pilau', price: 320, costPrice: 140 },
          { name: 'Kuku Pilau (with 1/4 Chicken)', price: 380, costPrice: 160 },
        ],
      },
    },
    include: { variants: true },
  });

  const chickenBiryani = await prisma.menuItem.create({
    data: {
      categoryId: catRice.id,
      name: 'Coastal Chicken Biryani',
      description: 'Layered saffron basmati rice with aromatic spiced chicken and potato gravy',
      basePrice: 420,
      costPrice: 180,
      imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500&q=80',
      isAvailable: true,
      hasVariants: true,
      variants: {
        create: [
          { name: 'Chicken Biryani', price: 420, costPrice: 180 },
          { name: 'Beef Biryani', price: 380, costPrice: 160 },
        ],
      },
    },
    include: { variants: true },
  });

  const mukimoBeef = await prisma.menuItem.create({
    data: {
      categoryId: catRice.id,
      name: 'Mukimo & Beef Stew',
      description: 'Mashed potatoes, pumpkin leaves, maize, and beans served with rich beef stew',
      basePrice: 350,
      costPrice: 150,
      imageUrl: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=500&q=80',
      isAvailable: true,
      hasVariants: false,
    },
  });

  // D. Drinks & Refreshments
  const coke300 = await prisma.menuItem.create({
    data: {
      categoryId: catDrinks.id,
      name: 'Coca-Cola 300ml Glass Bottle',
      description: 'Chilled classic Coca-Cola glass bottle',
      basePrice: 60,
      costPrice: 35,
      imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80',
      isAvailable: true,
      hasVariants: false,
    },
  });

  const sprite300 = await prisma.menuItem.create({
    data: {
      categoryId: catDrinks.id,
      name: 'Sprite 300ml Glass Bottle',
      description: 'Chilled lemon-lime Sprite soda',
      basePrice: 60,
      costPrice: 35,
      imageUrl: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=500&q=80',
      isAvailable: true,
      hasVariants: false,
    },
  });

  const fanta300 = await prisma.menuItem.create({
    data: {
      categoryId: catDrinks.id,
      name: 'Fanta Orange 300ml Glass Bottle',
      description: 'Chilled vibrant orange soda',
      basePrice: 60,
      costPrice: 35,
      imageUrl: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=500&q=80',
      isAvailable: true,
      hasVariants: false,
    },
  });

  const dasaniWater = await prisma.menuItem.create({
    data: {
      categoryId: catDrinks.id,
      name: 'Dasani Mineral Water 500ml',
      description: 'Chilled purified drinking water',
      basePrice: 50,
      costPrice: 25,
      imageUrl: 'https://images.unsplash.com/photo-1564419320461-6870880221ad?w=500&q=80',
      isAvailable: true,
      hasVariants: false,
    },
  });

  const freshJuice = await prisma.menuItem.create({
    data: {
      categoryId: catDrinks.id,
      name: 'Freshly Squeezed Juice (500ml)',
      description: '100% pure fresh fruit juice blended daily',
      basePrice: 150,
      costPrice: 60,
      imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&q=80',
      isAvailable: true,
      hasVariants: true,
      variants: {
        create: [
          { name: 'Fresh Passion Juice', price: 150, costPrice: 60 },
          { name: 'Fresh Mango Juice', price: 150, costPrice: 60 },
          { name: 'Passion & Mango Cocktail', price: 170, costPrice: 70 },
        ],
      },
    },
    include: { variants: true },
  });

  // E. Snacks & Sides
  const smokiePasua = await prisma.menuItem.create({
    data: {
      categoryId: catSnacks.id,
      name: 'Smokie Pasua (with Kachumbari)',
      description: 'Grilled Farmer\'s Choice smokie sliced open and stuffed with spicy kachumbari',
      basePrice: 60,
      costPrice: 28,
      imageUrl: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?w=500&q=80',
      isAvailable: true,
      hasVariants: false,
    },
  });

  const sausageBeef = await prisma.menuItem.create({
    data: {
      categoryId: catSnacks.id,
      name: 'Beef Sausage (Deep Fried)',
      description: 'Crispy deep-fried beef sausage served with tomato ketchup',
      basePrice: 80,
      costPrice: 38,
      imageUrl: 'https://images.unsplash.com/photo-1585325701165-351af916e581?w=500&q=80',
      isAvailable: true,
      hasVariants: false,
    },
  });

  const samosaBeef = await prisma.menuItem.create({
    data: {
      categoryId: catSnacks.id,
      name: 'Beef Samosa (2 pcs)',
      description: 'Crispy triangular pastry stuffed with seasoned minced beef and herbs',
      basePrice: 100,
      costPrice: 40,
      imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80',
      isAvailable: true,
      hasVariants: false,
    },
  });

  // 6. Link Recipe Bill of Materials (using Migadini branch stock IDs as template)
  console.log('Linking recipe bill of materials...');
  const migadiniStock = stockMap[migadini.id];

  // Recipe: Chips Plain -> 0.35kg Potatoes + 0.05L Oil
  await prisma.menuItemRecipe.create({
    data: { menuItemId: chipsPlain.id, stockItemId: migadiniStock['Potatoes (Shangi)'], quantityRequired: 0.35 },
  });
  await prisma.menuItemRecipe.create({
    data: { menuItemId: chipsPlain.id, stockItemId: migadiniStock['Cooking Oil (Rina/Elianto)'], quantityRequired: 0.05 },
  });

  // Recipe: Chips Masala -> 0.35kg Potatoes + 0.05L Oil + 0.05kg Tomato/Onion
  await prisma.menuItemRecipe.create({
    data: { menuItemId: chipsMasala.id, stockItemId: migadiniStock['Potatoes (Shangi)'], quantityRequired: 0.35 },
  });
  await prisma.menuItemRecipe.create({
    data: { menuItemId: chipsMasala.id, stockItemId: migadiniStock['Cooking Oil (Rina/Elianto)'], quantityRequired: 0.05 },
  });
  await prisma.menuItemRecipe.create({
    data: { menuItemId: chipsMasala.id, stockItemId: migadiniStock['Tomatoes & Onions'], quantityRequired: 0.05 },
  });

  // Recipe: Kuku Choma variants
  if (kukuChoma.variants) {
    const qChoma = kukuChoma.variants.find(v => v.name.includes('1/4'));
    const hChoma = kukuChoma.variants.find(v => v.name.includes('1/2'));
    const fChoma = kukuChoma.variants.find(v => v.name.includes('Full'));

    if (qChoma) {
      await prisma.menuItemRecipe.create({
        data: { menuItemId: kukuChoma.id, variantId: qChoma.id, stockItemId: migadiniStock['Raw Chicken (Whole/Cut)'], quantityRequired: 0.30 },
      });
    }
    if (hChoma) {
      await prisma.menuItemRecipe.create({
        data: { menuItemId: kukuChoma.id, variantId: hChoma.id, stockItemId: migadiniStock['Raw Chicken (Whole/Cut)'], quantityRequired: 0.60 },
      });
    }
    if (fChoma) {
      await prisma.menuItemRecipe.create({
        data: { menuItemId: kukuChoma.id, variantId: fChoma.id, stockItemId: migadiniStock['Raw Chicken (Whole/Cut)'], quantityRequired: 1.20 },
      });
    }
  }

  // Recipe: Pilau Beef variants
  if (beefPilau.variants) {
    const bPilau = beefPilau.variants.find(v => v.name === 'Beef Pilau');
    if (bPilau) {
      await prisma.menuItemRecipe.create({
        data: { menuItemId: beefPilau.id, variantId: bPilau.id, stockItemId: migadiniStock['Basmati Rice (Grade 1)'], quantityRequired: 0.20 },
      });
      await prisma.menuItemRecipe.create({
        data: { menuItemId: beefPilau.id, variantId: bPilau.id, stockItemId: migadiniStock['Fresh Beef (Stew Cut)'], quantityRequired: 0.15 },
      });
      await prisma.menuItemRecipe.create({
        data: { menuItemId: beefPilau.id, variantId: bPilau.id, stockItemId: migadiniStock['Cooking Oil (Rina/Elianto)'], quantityRequired: 0.03 },
      });
    }
  }

  // Recipe: Smokie Pasua -> 1 piece Smokie + 0.03kg Tomato/Onion
  await prisma.menuItemRecipe.create({
    data: { menuItemId: smokiePasua.id, stockItemId: migadiniStock['Smokies Pack (Farmer\'s Choice)'], quantityRequired: 1 },
  });
  await prisma.menuItemRecipe.create({
    data: { menuItemId: smokiePasua.id, stockItemId: migadiniStock['Tomatoes & Onions'], quantityRequired: 0.03 },
  });

  // 7. Create Active Shift for Migadini
  console.log('Creating initial shifts and expenses...');
  const openShift = await prisma.shift.create({
    data: {
      branchId: migadini.id,
      cashierId: cashier1.id,
      openingFloat: 3000,
      status: 'OPEN',
      openedAt: new Date(new Date().setHours(8, 0, 0, 0)),
      notes: 'Morning shift opening float verified by Manager',
    },
  });

  // 8. Create Sample Daily Expenses for today
  await prisma.expense.create({
    data: {
      branchId: migadini.id,
      shiftId: openShift.id,
      category: 'MARKET_PRODUCE',
      amount: 1400,
      description: 'Morning fresh tomatoes, coriander & red onions from market',
      paidTo: 'Veggies Supplier',
      paymentSource: 'CASH_DRAWER',
      receiptNumber: 'WAK-904',
    },
  });

  await prisma.expense.create({
    data: {
      branchId: migadini.id,
      category: 'GAS_CHARCOAL',
      amount: 2800,
      description: 'TotalEnergies 13kg Gas cylinder refill for main fryers',
      paidTo: 'Gas Station',
      paymentSource: 'BANK_MPESA',
      receiptNumber: 'TOT-4821',
    },
  });

  await prisma.expense.create({
    data: {
      branchId: branch2.id,
      category: 'TRANSPORT_BODA',
      amount: 350,
      description: 'Boda boda delivery of fresh chicken crate from supplier depot',
      paidTo: 'Rider',
      paymentSource: 'CASH_DRAWER',
    },
  });

  // 9. Create Sample Completed Orders with M-Pesa and Cash payments across branches
  console.log('Generating realistic demo orders...');

  // Order 1: Migadini - Dine-in Pilau & Soda (M-Pesa)
  const ord1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-20260822-1001',
      branchId: migadini.id,
      cashierId: cashier1.id,
      shiftId: openShift.id,
      orderType: 'DINE_IN',
      tableNumber: 'T-04',
      customerName: 'Customer',
      customerPhone: '0712345678',
      status: 'COMPLETED',
      subtotal: 380,
      discountAmount: 0,
      totalAmount: 380,
      items: {
        create: [
          {
            menuItemId: beefPilau.id,
            variantId: beefPilau.variants?.find(v => v.name === 'Beef Pilau')?.id,
            itemName: 'Swahili Beef Pilau',
            variantName: 'Beef Pilau',
            quantity: 1,
            unitPrice: 320,
            unitCost: 140,
            totalPrice: 320,
          },
          {
            menuItemId: coke300.id,
            itemName: 'Coca-Cola 300ml Glass Bottle',
            quantity: 1,
            unitPrice: 60,
            unitCost: 35,
            totalPrice: 60,
          },
        ],
      },
      payments: {
        create: [
          {
            branchId: migadini.id,
            amount: 380,
            paymentMethod: 'MPESA',
            mpesaCode: 'QHK8921XLA',
            status: 'COMPLETED',
          },
        ],
      },
    },
  });

  // Order 2: Migadini - Takeaway Chips & 1/4 Kuku + Passion Juice (Split Payment: Cash + M-Pesa)
  const ord2 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-20260822-1002',
      branchId: migadini.id,
      cashierId: cashier2.id,
      shiftId: openShift.id,
      orderType: 'TAKEAWAY',
      customerName: 'Customer',
      status: 'COMPLETED',
      subtotal: 600,
      discountAmount: 0,
      totalAmount: 600,
      items: {
        create: [
          {
            menuItemId: chipsKuku.id,
            itemName: 'Chips & 1/4 Kuku Combo',
            quantity: 1,
            unitPrice: 450,
            unitCost: 220,
            totalPrice: 450,
          },
          {
            menuItemId: freshJuice.id,
            variantId: freshJuice.variants?.find(v => v.name === 'Fresh Passion Juice')?.id,
            itemName: 'Freshly Squeezed Juice (500ml)',
            variantName: 'Fresh Passion Juice',
            quantity: 1,
            unitPrice: 150,
            unitCost: 60,
            totalPrice: 150,
          },
        ],
      },
      payments: {
        create: [
          {
            branchId: migadini.id,
            amount: 400,
            paymentMethod: 'MPESA',
            mpesaCode: 'QHK9942MPB',
            status: 'COMPLETED',
          },
          {
            branchId: migadini.id,
            amount: 200,
            paymentMethod: 'CASH',
            cashTendered: 500,
            changeAmount: 300,
            status: 'COMPLETED',
          },
        ],
      },
    },
  });

  // Order 3: Branch 2 - Biryani & Sprite (Cash)
  await prisma.order.create({
    data: {
      orderNumber: 'ORD-20260822-2001',
      branchId: branch2.id,
      cashierId: cashier3.id,
      orderType: 'DINE_IN',
      tableNumber: 'T-12',
      customerName: 'Customer',
      status: 'COMPLETED',
      subtotal: 480,
      discountAmount: 0,
      totalAmount: 480,
      items: {
        create: [
          {
            menuItemId: chickenBiryani.id,
            variantId: chickenBiryani.variants?.find(v => v.name === 'Chicken Biryani')?.id,
            itemName: 'Coastal Chicken Biryani',
            variantName: 'Chicken Biryani',
            quantity: 1,
            unitPrice: 420,
            unitCost: 180,
            totalPrice: 420,
          },
          {
            menuItemId: sprite300.id,
            itemName: 'Sprite 300ml Glass Bottle',
            quantity: 1,
            unitPrice: 60,
            unitCost: 35,
            totalPrice: 60,
          },
        ],
      },
      payments: {
        create: [
          {
            branchId: branch2.id,
            amount: 480,
            paymentMethod: 'CASH',
            cashTendered: 1000,
            changeAmount: 520,
            status: 'COMPLETED',
          },
        ],
      },
    },
  });

  // Order 4: Migadini - Chips Masala + Smokies + Dasani (M-Pesa)
  await prisma.order.create({
    data: {
      orderNumber: 'ORD-20260822-3001',
      branchId: migadini.id,
      cashierId: cashier4.id,
      orderType: 'TAKEAWAY',
      customerName: 'Customer',
      status: 'COMPLETED',
      subtotal: 370,
      discountAmount: 20,
      discountReason: 'Loyalty regular discount',
      totalAmount: 350,
      items: {
        create: [
          {
            menuItemId: chipsMasala.id,
            itemName: 'Chips Masala (Swahili Style)',
            quantity: 1,
            unitPrice: 200,
            unitCost: 85,
            totalPrice: 200,
          },
          {
            menuItemId: smokiePasua.id,
            itemName: 'Smokie Pasua (with Kachumbari)',
            quantity: 2,
            unitPrice: 60,
            unitCost: 28,
            totalPrice: 120,
          },
          {
            menuItemId: dasaniWater.id,
            itemName: 'Dasani Mineral Water 500ml',
            quantity: 1,
            unitPrice: 50,
            unitCost: 25,
            totalPrice: 50,
          },
        ],
      },
      payments: {
        create: [
          {
            branchId: migadini.id,
            amount: 350,
            paymentMethod: 'MPESA',
            mpesaCode: 'QHL0014KLM',
            status: 'COMPLETED',
          },
        ],
      },
    },
  });

  // Update open shift stats
  await prisma.shift.update({
    where: { id: openShift.id },
    data: {
      totalCashSales: 200,
      totalMpesaSales: 780,
    },
  });

  console.log('✅ Database seeded successfully with realistic Kenyan restaurant data!');
}

main()
  .catch(e => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
