import React, { useState, useEffect, useMemo } from 'react';
import { Search, Sparkles, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import { MenuCategoryBar } from './MenuCategoryBar';
import { MenuItemCard } from './MenuItemCard';
import { VariantModal } from './VariantModal';
import { CartSidebar } from './CartSidebar';
import { PaymentModal } from './PaymentModal';
import { HeldOrdersModal } from './HeldOrdersModal';
import { ThermalReceipt } from './ThermalReceipt';
import { OfflineBanner } from './OfflineBanner';
import { usePosCart } from '../../context/PosCartContext';
import { useBranch } from '../../context/BranchContext';
import { api } from '../../services/api';
import { Category, MenuItem, MenuItemVariant, Order } from '../../types';

export const PosTerminal: React.FC = () => {
  const { currentBranchId } = useBranch();
  const { addToCart } = usePosCart();

  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [selectedItemForVariant, setSelectedItemForVariant] = useState<MenuItem | null>(null);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState<boolean>(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isHeldOrdersModalOpen, setIsHeldOrdersModalOpen] = useState<boolean>(false);

  // Completed order receipt state
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [stockWarnings, setStockWarnings] = useState<string[]>([]);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);

  const fetchMenuData = async () => {
    setIsLoading(true);
    try {
      const [catsData, menuData] = await Promise.all([
        api.getCategories(),
        api.getMenu(),
      ]);
      setCategories(catsData);
      setMenuItems(menuData);
    } catch (err) {
      console.error('Failed to load menu data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, [currentBranchId]);

  const handleCardClick = (item: MenuItem) => {
    if (item.hasVariants && item.variants && item.variants.length > 0) {
      setSelectedItemForVariant(item);
      setIsVariantModalOpen(true);
    } else {
      addToCart(item, null, 1, '');
    }
  };

  const handleToggleStock = async (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await api.toggleStock(item.id);
      setMenuItems(prev => prev.map(m => (m.id === item.id ? { ...m, isAvailable: updated.isAvailable } : m)));
    } catch (err) {
      console.error('Failed to toggle stock status:', err);
    }
  };

  const handleVariantAddToCart = (
    item: MenuItem,
    variant: MenuItemVariant | null,
    qty: number,
    lineNote: string
  ) => {
    addToCart(item, variant, qty, lineNote);
  };

  const handleOrderCompleted = (order: Order, warnings: string[]) => {
    setCompletedOrder(order);
    setStockWarnings(warnings);
    setIsReceiptOpen(true);
    fetchMenuData(); // Refresh stock/availability
  };

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesCategory =
        selectedCategoryId === 'all' || item.categoryId === selectedCategoryId;
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategoryId, searchQuery]);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-57px)] overflow-hidden bg-zinc-950">
      {/* Offline Status Warning Banner */}
      <OfflineBanner />

      {/* Main Split Layout: Left = Menu Grid, Right = Cart Sidebar */}
      <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">
        {/* Left Side: Category bar, Search, and Food Tiles */}
        <div className="flex-1 flex flex-col h-full overflow-hidden p-3 sm:p-4 space-y-3">
          {/* Top Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            {/* Category Selector Bar */}
            <div className="flex-1 overflow-hidden">
              <MenuCategoryBar
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={setSelectedCategoryId}
              />
            </div>

            {/* Quick Search Input */}
            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search chips, kuku, pilau..."
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-2xl py-2 pl-9 pr-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-brand-500 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-xs text-zinc-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="flex-1 overflow-y-auto pr-1">
            {isLoading ? (
              <div className="h-64 flex flex-col items-center justify-center text-zinc-400 space-y-3">
                <RefreshCw className="w-7 h-7 animate-spin text-brand-500" />
                <span className="text-xs font-semibold">Loading menu dishes...</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-zinc-500 space-y-2 text-center p-6">
                <div className="text-3xl">🍲</div>
                <div className="text-sm font-bold text-zinc-400">No menu items found</div>
                <p className="text-xs text-zinc-500">
                  Try clearing search filters or add items under Menu & Recipes.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 pb-6">
                {filteredItems.map(item => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onClick={handleCardClick}
                    onToggleStock={handleToggleStock}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Active POS Cart Sidebar */}
        <CartSidebar
          onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
          onOpenHeldOrders={() => setIsHeldOrdersModalOpen(true)}
        />
      </div>

      {/* Modals */}
      <VariantModal
        item={selectedItemForVariant}
        isOpen={isVariantModalOpen}
        onClose={() => {
          setIsVariantModalOpen(false);
          setSelectedItemForVariant(null);
        }}
        onAddToCart={handleVariantAddToCart}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onOrderCompleted={handleOrderCompleted}
      />

      <HeldOrdersModal
        isOpen={isHeldOrdersModalOpen}
        onClose={() => setIsHeldOrdersModalOpen(false)}
      />

      <ThermalReceipt
        order={completedOrder}
        warnings={stockWarnings}
        isOpen={isReceiptOpen}
        onClose={() => {
          setIsReceiptOpen(false);
          setCompletedOrder(null);
        }}
      />
    </div>
  );
};
