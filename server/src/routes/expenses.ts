import { Router, Response } from 'express';
import prisma from '../prisma.js';
import { authenticateToken, AuthenticatedRequest, requireManagerOrOwner } from '../middleware/auth.js';

const router = Router();

// List daily expenses
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { branchId, category, date, startDate, endDate } = req.query;

    const targetBranchId = req.user?.role === 'OWNER' && branchId && branchId !== 'all'
      ? (branchId as string)
      : (req.user?.role === 'OWNER' && (!branchId || branchId === 'all') ? undefined : req.user?.branchId || undefined);

    const where: any = {};
    if (targetBranchId) where.branchId = targetBranchId;
    if (category && category !== 'all') where.category = category as string;

    if (date) {
      const d = new Date(date as string);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end = new Date(d.setHours(23, 59, 59, 999));
      where.createdAt = { gte: start, lte: end };
    } else if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        branch: { select: { id: true, name: true, code: true } },
        shift: { select: { id: true, cashier: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.json({
      totalAmount,
      count: expenses.length,
      expenses,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create new expense
router.post('/', authenticateToken, requireManagerOrOwner, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      branchId,
      shiftId,
      category,
      amount,
      description,
      paidTo,
      paymentSource,
      receiptNumber,
    } = req.body;

    const targetBranchId = branchId || req.user?.branchId;
    if (!targetBranchId || !category || !amount || !description) {
      res.status(400).json({ error: 'Branch, category, amount, and description are required' });
      return;
    }

    const expense = await prisma.expense.create({
      data: {
        branchId: targetBranchId,
        shiftId: shiftId || null,
        category,
        amount: parseFloat(amount),
        description,
        paidTo: paidTo || null,
        paymentSource: paymentSource || 'CASH_DRAWER',
        receiptNumber: receiptNumber || null,
      },
      include: {
        branch: true,
      },
    });

    // If paid from cash drawer and linked to open shift, record payout movement
    if (shiftId && paymentSource === 'CASH_DRAWER') {
      await prisma.cashMovement.create({
        data: {
          shiftId,
          branchId: targetBranchId,
          type: 'PAYOUT',
          amount: parseFloat(amount),
          reason: `Expense: ${category} - ${description}`,
          authorizedBy: req.user?.name,
        },
      });

      await prisma.shift.update({
        where: { id: shiftId },
        data: {
          totalExpensesPaid: { increment: parseFloat(amount) },
        },
      });
    }

    res.status(201).json(expense);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete expense
router.delete('/:id', authenticateToken, requireManagerOrOwner, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.expense.delete({ where: { id } });
    res.json({ message: 'Expense record deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
