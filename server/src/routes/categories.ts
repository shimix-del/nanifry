import { Router, Response } from 'express';
import prisma from '../prisma.js';
import { authenticateToken, AuthenticatedRequest, requireManagerOrOwner } from '../middleware/auth.js';

const router = Router();

// List categories
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { menuItems: true },
        },
      },
    });

    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create category
router.post('/', authenticateToken, requireManagerOrOwner, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, code, sortOrder, icon } = req.body;

    if (!name || !code) {
      res.status(400).json({ error: 'Category name and code are required' });
      return;
    }

    const category = await prisma.category.create({
      data: {
        name,
        code: code.toLowerCase().trim(),
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder, 10) : 0,
        icon: icon || 'Utensils',
      },
    });

    res.status(201).json(category);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
