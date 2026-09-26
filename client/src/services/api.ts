import { mockStore } from './mockStore';

const API_BASE = '/api';

// Check if we are in a pure static environment (e.g. GitHub Pages)
const isStaticHost = typeof window !== 'undefined' && 
  (window.location.hostname.includes('github.io') || window.location.hostname.includes('netlify.app') || window.location.hostname.includes('vercel.app'));

function getAuthToken(): string | null {
  return localStorage.getItem('nanifrys_pos_token') || localStorage.getItem('simba_pos_token');
}

function getSelectedBranch(): string | null {
  return localStorage.getItem('nanifrys_pos_branch_id') || localStorage.getItem('simba_pos_branch_id');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const branchId = getSelectedBranch();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (branchId) {
    headers['x-branch-id'] = branchId;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  login: async (credentials: { email?: string; password?: string; pinCode?: string; branchId?: string }) => {
    if (isStaticHost) return mockStore.login(credentials);
    try {
      return await request<{ token: string; user: any; message: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    } catch (e: any) {
      if (e.message?.includes('Failed to fetch') || e.message?.includes('404')) {
        return mockStore.login(credentials);
      }
      throw e;
    }
  },
  getMe: async () => {
    if (isStaticHost) return mockStore.getMe();
    try {
      return await request<any>('/auth/me');
    } catch {
      return mockStore.getMe();
    }
  },
  getUsers: async () => {
    if (isStaticHost) return mockStore.getUsers();
    try {
      return await request<any[]>('/auth/users');
    } catch {
      return mockStore.getUsers();
    }
  },
  createUser: async (userData: any) => {
    if (isStaticHost) return mockStore.createUser(userData);
    try {
      return await request<any>('/auth/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    } catch {
      return mockStore.createUser(userData);
    }
  },

  // Branches
  getBranches: async () => {
    if (isStaticHost) return mockStore.getBranches();
    try {
      return await request<any[]>('/branches');
    } catch {
      return mockStore.getBranches();
    }
  },
  getBranch: async (id: string) => {
    if (isStaticHost) return mockStore.getBranch(id);
    try {
      return await request<any>(`/branches/${id}`);
    } catch {
      return mockStore.getBranch(id);
    }
  },
  createBranch: async (branchData: any) => {
    if (isStaticHost) return mockStore.createBranch(branchData);
    try {
      return await request<any>('/branches', {
        method: 'POST',
        body: JSON.stringify(branchData),
      });
    } catch {
      return mockStore.createBranch(branchData);
    }
  },
  updateBranch: async (id: string, branchData: any) => {
    if (isStaticHost) return mockStore.updateBranch(id, branchData);
    try {
      return await request<any>(`/branches/${id}`, {
        method: 'PUT',
        body: JSON.stringify(branchData),
      });
    } catch {
      return mockStore.updateBranch(id, branchData);
    }
  },

  // Categories
  getCategories: async () => {
    if (isStaticHost) return mockStore.getCategories();
    try {
      return await request<any[]>('/categories');
    } catch {
      return mockStore.getCategories();
    }
  },
  createCategory: async (catData: any) => {
    if (isStaticHost) return mockStore.createCategory(catData);
    try {
      return await request<any>('/categories', {
        method: 'POST',
        body: JSON.stringify(catData),
      });
    } catch {
      return mockStore.createCategory(catData);
    }
  },

  // Menu & Variants
  getMenu: async (params?: { categoryId?: string; search?: string; availableOnly?: boolean }) => {
    if (isStaticHost) return mockStore.getMenu(params);
    try {
      const q = new URLSearchParams();
      if (params?.categoryId) q.append('categoryId', params.categoryId);
      if (params?.search) q.append('search', params.search);
      if (params?.availableOnly) q.append('availableOnly', 'true');
      return await request<any[]>(`/menu?${q.toString()}`);
    } catch {
      return mockStore.getMenu(params);
    }
  },
  createMenuItem: async (itemData: any) => {
    if (isStaticHost) return mockStore.createMenuItem(itemData);
    try {
      return await request<any>('/menu', {
        method: 'POST',
        body: JSON.stringify(itemData),
      });
    } catch {
      return mockStore.createMenuItem(itemData);
    }
  },
  updateMenuItem: async (id: string, itemData: any) => {
    if (isStaticHost) return mockStore.updateMenuItem(id, itemData);
    try {
      return await request<any>(`/menu/${id}`, {
        method: 'PUT',
        body: JSON.stringify(itemData),
      });
    } catch {
      return mockStore.updateMenuItem(id, itemData);
    }
  },
  toggleStock: async (id: string) => {
    if (isStaticHost) return mockStore.toggleStock(id);
    try {
      return await request<any>(`/menu/${id}/toggle-stock`, {
        method: 'PATCH',
      });
    } catch {
      return mockStore.toggleStock(id);
    }
  },
  deleteMenuItem: async (id: string) => {
    if (isStaticHost) return mockStore.deleteMenuItem(id);
    try {
      return await request<any>(`/menu/${id}`, {
        method: 'DELETE',
      });
    } catch {
      return mockStore.deleteMenuItem(id);
    }
  },

  // Inventory & Stock Management
  getInventory: async (params?: { branchId?: string; type?: string; lowStockOnly?: boolean; search?: string }) => {
    if (isStaticHost) return mockStore.getInventory(params);
    try {
      const q = new URLSearchParams();
      if (params?.branchId) q.append('branchId', params.branchId);
      if (params?.type) q.append('type', params.type);
      if (params?.lowStockOnly) q.append('lowStockOnly', 'true');
      if (params?.search) q.append('search', params.search);
      return await request<any[]>(`/inventory?${q.toString()}`);
    } catch {
      return mockStore.getInventory(params);
    }
  },
  createStockItem: async (itemData: any) => {
    if (isStaticHost) return mockStore.createStockItem(itemData);
    try {
      return await request<any>('/inventory', {
        method: 'POST',
        body: JSON.stringify(itemData),
      });
    } catch {
      return mockStore.createStockItem(itemData);
    }
  },
  restock: async (data: { stockItemId: string; quantityAdded: number; unitCost?: number; supplierName?: string; notes?: string }) => {
    if (isStaticHost) return mockStore.restock(data);
    try {
      return await request<any>('/inventory/restock', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return mockStore.restock(data);
    }
  },
  transferStock: async (data: { sourceBranchId: string; destBranchId: string; stockItemId: string; quantity: number; notes?: string }) => {
    if (isStaticHost) return mockStore.transferStock(data);
    try {
      return await request<any>('/inventory/transfer', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return mockStore.transferStock(data);
    }
  },
  auditStock: async (data: { stockItemId: string; countedStock: number; reason?: string; notes?: string }) => {
    if (isStaticHost) return mockStore.auditStock(data);
    try {
      return await request<any>('/inventory/audit', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return mockStore.auditStock(data);
    }
  },
  getStockTransfers: async (params?: { branchId?: string }) => {
    if (isStaticHost) return mockStore.getStockTransfers();
    try {
      const q = new URLSearchParams();
      if (params?.branchId) q.append('branchId', params.branchId);
      return await request<any[]>(`/inventory/transfers?${q.toString()}`);
    } catch {
      return mockStore.getStockTransfers();
    }
  },
  getStockAudits: async (params?: { branchId?: string }) => {
    if (isStaticHost) return mockStore.getStockAudits();
    try {
      const q = new URLSearchParams();
      if (params?.branchId) q.append('branchId', params.branchId);
      return await request<any[]>(`/inventory/audits?${q.toString()}`);
    } catch {
      return mockStore.getStockAudits();
    }
  },

  // Recipes / BOM
  getRecipes: async (params?: { menuItemId?: string }) => {
    if (isStaticHost) return mockStore.getRecipes();
    try {
      const q = new URLSearchParams();
      if (params?.menuItemId) q.append('menuItemId', params.menuItemId);
      return await request<any[]>(`/recipes?${q.toString()}`);
    } catch {
      return mockStore.getRecipes();
    }
  },
  createRecipe: async (data: { menuItemId: string; variantId?: string | null; stockItemId: string; quantityRequired: number }) => {
    if (isStaticHost) return mockStore.createRecipe(data);
    try {
      return await request<any>('/recipes', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return mockStore.createRecipe(data);
    }
  },
  deleteRecipe: async (id: string) => {
    if (isStaticHost) return mockStore.deleteRecipe(id);
    try {
      return await request<any>(`/recipes/${id}`, {
        method: 'DELETE',
      });
    } catch {
      return mockStore.deleteRecipe(id);
    }
  },

  // Orders & POS Checkout
  getOrders: async (params?: { branchId?: string; status?: string; search?: string; limit?: number; date?: string }) => {
    if (isStaticHost) return mockStore.getOrders(params);
    try {
      const q = new URLSearchParams();
      if (params?.branchId) q.append('branchId', params.branchId);
      if (params?.status) q.append('status', params.status);
      if (params?.search) q.append('search', params.search);
      if (params?.limit) q.append('limit', params.limit.toString());
      if (params?.date) q.append('date', params.date);
      return await request<any[]>(`/orders?${q.toString()}`);
    } catch {
      return mockStore.getOrders(params);
    }
  },
  getHeldOrders: async (params?: { branchId?: string }) => {
    if (isStaticHost) return mockStore.getHeldOrders(params);
    try {
      const q = new URLSearchParams();
      if (params?.branchId) q.append('branchId', params.branchId);
      return await request<any[]>(`/orders/held?${q.toString()}`);
    } catch {
      return mockStore.getHeldOrders(params);
    }
  },
  createOrder: async (orderData: any) => {
    if (isStaticHost) return mockStore.createOrder(orderData);
    try {
      return await request<{ order: any; warnings: string[]; message: string }>('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
    } catch (e: any) {
      if (e.message?.includes('Failed to fetch') || e.message?.includes('404')) {
        return mockStore.createOrder(orderData);
      }
      throw e;
    }
  },
  resumeOrder: async (id: string, paymentData: any) => {
    if (isStaticHost) return mockStore.resumeOrder(id, paymentData);
    try {
      return await request<any>(`/orders/${id}/resume`, {
        method: 'PATCH',
        body: JSON.stringify(paymentData),
      });
    } catch {
      return mockStore.resumeOrder(id, paymentData);
    }
  },
  cancelOrder: async (id: string) => {
    if (isStaticHost) return mockStore.cancelOrder(id);
    try {
      return await request<any>(`/orders/${id}/cancel`, {
        method: 'DELETE',
      });
    } catch {
      return mockStore.cancelOrder(id);
    }
  },

  // Shifts & Cash Float
  getCurrentShift: async (params?: { branchId?: string }) => {
    if (isStaticHost) return mockStore.getCurrentShift(params);
    try {
      const q = new URLSearchParams();
      if (params?.branchId) q.append('branchId', params.branchId);
      return await request<{ activeShift: any }>(`/shifts/current?${q.toString()}`);
    } catch {
      return mockStore.getCurrentShift(params);
    }
  },
  openShift: async (data: { branchId?: string; openingFloat: number; notes?: string }) => {
    if (isStaticHost) return mockStore.openShift(data);
    try {
      return await request<any>('/shifts/open', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return mockStore.openShift(data);
    }
  },
  closeShift: async (data: { shiftId: string; closingCashActual: number; notes?: string }) => {
    if (isStaticHost) return mockStore.closeShift(data);
    try {
      return await request<{ message: string; shift: any; zReport: any }>('/shifts/close', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return mockStore.closeShift(data);
    }
  },
  addCashMovement: async (data: { shiftId: string; type: 'FLOAT_IN' | 'CASH_DROP' | 'PAYOUT'; amount: number; reason: string }) => {
    if (isStaticHost) return mockStore.addCashMovement();
    try {
      return await request<any>('/shifts/cash-movement', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return mockStore.addCashMovement();
    }
  },
  getShiftHistory: async (params?: { branchId?: string; limit?: number }) => {
    if (isStaticHost) return mockStore.getShiftHistory();
    try {
      const q = new URLSearchParams();
      if (params?.branchId) q.append('branchId', params.branchId);
      if (params?.limit) q.append('limit', params.limit.toString());
      return await request<any[]>(`/shifts/history?${q.toString()}`);
    } catch {
      return mockStore.getShiftHistory();
    }
  },

  // Daily Expenses
  getExpenses: async (params?: { branchId?: string; category?: string; date?: string; startDate?: string; endDate?: string }) => {
    if (isStaticHost) return mockStore.getExpenses(params);
    try {
      const q = new URLSearchParams();
      if (params?.branchId) q.append('branchId', params.branchId);
      if (params?.category) q.append('category', params.category);
      if (params?.date) q.append('date', params.date);
      if (params?.startDate) q.append('startDate', params.startDate);
      if (params?.endDate) q.append('endDate', params.endDate);
      return await request<{ totalAmount: number; count: number; expenses: any[] }>(`/expenses?${q.toString()}`);
    } catch {
      return mockStore.getExpenses(params);
    }
  },
  createExpense: async (data: any) => {
    if (isStaticHost) return mockStore.createExpense(data);
    try {
      return await request<any>('/expenses', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return mockStore.createExpense(data);
    }
  },
  deleteExpense: async (id: string) => {
    if (isStaticHost) return mockStore.deleteExpense(id);
    try {
      return await request<any>(`/expenses/${id}`, {
        method: 'DELETE',
      });
    } catch {
      return mockStore.deleteExpense(id);
    }
  },

  // Reporting & Analytics
  getDashboardSummary: async (params?: { branchId?: string; date?: string }) => {
    if (isStaticHost) return mockStore.getDashboardSummary(params);
    try {
      const q = new URLSearchParams();
      if (params?.branchId) q.append('branchId', params.branchId);
      if (params?.date) q.append('date', params.date);
      return await request<any>(`/reports/summary?${q.toString()}`);
    } catch {
      return mockStore.getDashboardSummary(params);
    }
  },
  getSalesByCategory: async (params?: { branchId?: string; days?: number }) => {
    if (isStaticHost) return mockStore.getSalesByCategory();
    try {
      const q = new URLSearchParams();
      if (params?.branchId) q.append('branchId', params.branchId);
      if (params?.days) q.append('days', params.days.toString());
      return await request<any[]>(`/reports/sales-by-category?${q.toString()}`);
    } catch {
      return mockStore.getSalesByCategory();
    }
  },
  getTopItems: async (params?: { branchId?: string; limit?: number; days?: number }) => {
    if (isStaticHost) return mockStore.getTopItems();
    try {
      const q = new URLSearchParams();
      if (params?.branchId) q.append('branchId', params.branchId);
      if (params?.limit) q.append('limit', params.limit.toString());
      if (params?.days) q.append('days', params.days.toString());
      return await request<any[]>(`/reports/top-items?${q.toString()}`);
    } catch {
      return mockStore.getTopItems();
    }
  },
  getHourlySales: async (params?: { branchId?: string }) => {
    if (isStaticHost) return mockStore.getHourlySales();
    try {
      const q = new URLSearchParams();
      if (params?.branchId) q.append('branchId', params.branchId);
      return await request<any[]>(`/reports/hourly?${q.toString()}`);
    } catch {
      return mockStore.getHourlySales();
    }
  },
  getBranchComparison: async () => {
    if (isStaticHost) return mockStore.getBranchComparison();
    try {
      return await request<any[]>('/reports/branch-comparison');
    } catch {
      return mockStore.getBranchComparison();
    }
  },
  getCashierPerformance: async (params?: { branchId?: string; days?: number }) => {
    if (isStaticHost) return mockStore.getCashierPerformance();
    try {
      const q = new URLSearchParams();
      if (params?.branchId) q.append('branchId', params.branchId);
      if (params?.days) q.append('days', params.days.toString());
      return await request<any[]>(`/reports/cashier-performance?${q.toString()}`);
    } catch {
      return mockStore.getCashierPerformance();
    }
  },
  getProfitLoss: async (params?: { branchId?: string; startDate?: string; endDate?: string }) => {
    if (isStaticHost) return mockStore.getProfitLoss();
    try {
      const q = new URLSearchParams();
      if (params?.branchId) q.append('branchId', params.branchId);
      if (params?.startDate) q.append('startDate', params.startDate);
      if (params?.endDate) q.append('endDate', params.endDate);
      return await request<any>(`/reports/profit-loss?${q.toString()}`);
    } catch {
      return mockStore.getProfitLoss();
    }
  },
};
