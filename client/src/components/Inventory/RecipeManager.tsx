import React, { useState, useEffect } from 'react';
import { Utensils, Plus, Trash2, Layers, AlertCircle, Save } from 'lucide-react';
import { MenuItem, StockItem, MenuItemRecipe } from '../../types';
import { api } from '../../services/api';

interface RecipeManagerProps {
  menuItems: MenuItem[];
  stockItems: StockItem[];
}

export const RecipeManager: React.FC<RecipeManagerProps> = ({ menuItems, stockItems }) => {
  const [recipes, setRecipes] = useState<MenuItemRecipe[]>([]);
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<string>(menuItems[0]?.id || '');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [selectedStockItemId, setSelectedStockItemId] = useState<string>(stockItems[0]?.id || '');
  const [quantityRequired, setQuantityRequired] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = async () => {
    setIsLoading(true);
    try {
      const data = await api.getRecipes();
      setRecipes(data);
    } catch (err) {
      console.error('Failed to fetch recipes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const selectedItem = menuItems.find(m => m.id === selectedMenuItemId);
  const rawStockItems = stockItems.filter(s => s.type === 'RAW_INGREDIENT' || s.type === 'PACKAGED_UNIT');

  const handleAddRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantityRequired);
    if (!qty || qty <= 0) {
      setError('Please provide a valid quantity required');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await api.createRecipe({
        menuItemId: selectedMenuItemId,
        variantId: selectedVariantId || null,
        stockItemId: selectedStockItemId,
        quantityRequired: qty,
      });
      setQuantityRequired('');
      await fetchRecipes();
    } catch (err: any) {
      setError(err.message || 'Failed to add recipe ingredient');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    try {
      await api.deleteRecipe(id);
      setRecipes(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Failed to delete recipe requirement:', err);
    }
  };

  const currentItemRecipes = recipes.filter(r => r.menuItemId === selectedMenuItemId);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
            <Utensils className="w-5 h-5 text-brand-500" />
            <span>Recipe & Bill of Materials (BOM) Auto-Deduction</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Link dishes and variants to raw ingredients (e.g. 1 Plate Chips = 0.35kg Potatoes + 0.05L Oil)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Menu Items Selector */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-zinc-300">
            Select Menu Dish to Configure:
          </label>
          <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
            {menuItems.map(item => {
              const isSelected = selectedMenuItemId === item.id;
              const hasRules = recipes.some(r => r.menuItemId === item.id);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedMenuItemId(item.id);
                    setSelectedVariantId('');
                    setError(null);
                  }}
                  className={`w-full p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-brand-500/15 border-brand-500 text-white shadow-md'
                      : 'bg-zinc-800/70 border-zinc-700/60 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-zinc-100">{item.name}</div>
                    <div className="text-[10px] text-zinc-400">{item.category?.name}</div>
                  </div>
                  {hasRules ? (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                      Linked
                    </span>
                  ) : (
                    <span className="text-[10px] bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">
                      No Recipe
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Add Ingredient Form & Active Mappings */}
        <div className="lg:col-span-2 space-y-5">
          {selectedItem && (
            <div className="bg-zinc-800/60 border border-zinc-750 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-zinc-100">
                  Ingredients for: <span className="text-brand-400">{selectedItem.name}</span>
                </h4>
                {selectedItem.hasVariants && (
                  <span className="text-[11px] bg-brand-500/20 text-brand-300 px-2.5 py-0.5 rounded-full font-bold">
                    Has Variants
                  </span>
                )}
              </div>

              {/* Add Ingredient Form */}
              <form onSubmit={handleAddRecipe} className="space-y-3 pt-2 border-t border-zinc-700/60">
                {error && (
                  <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Variant option (if applicable) */}
                  {selectedItem.hasVariants && selectedItem.variants && (
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                        Portion / Variant
                      </label>
                      <select
                        value={selectedVariantId}
                        onChange={e => setSelectedVariantId(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl py-2 px-3 text-xs text-zinc-200 focus:outline-none focus:border-brand-500 font-semibold"
                      >
                        <option value="">All Variants (Default)</option>
                        {selectedItem.variants.map(v => (
                          <option key={v.id} value={v.id}>
                            {v.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Stock Item */}
                  <div className={selectedItem.hasVariants ? '' : 'sm:col-span-2'}>
                    <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                      Raw Ingredient to Deduct *
                    </label>
                    <select
                      value={selectedStockItemId}
                      onChange={e => setSelectedStockItemId(e.target.value)}
                      required
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl py-2 px-3 text-xs text-zinc-200 focus:outline-none focus:border-brand-500 font-semibold"
                    >
                      {rawStockItems.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity Required */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                      Usage per Order *
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={quantityRequired}
                      onChange={e => setQuantityRequired(e.target.value)}
                      placeholder="e.g. 0.35"
                      required
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl py-2 px-3 text-xs text-zinc-100 font-bold focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 bg-brand-500 hover:bg-brand-600 active:scale-95 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-brand-500/20 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isSaving ? 'Adding...' : 'Add Ingredient Rule'}</span>
                  </button>
                </div>
              </form>

              {/* Active Linked Ingredients Table */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-zinc-300 mb-2">
                  Active Stock Deduction Rules:
                </label>
                {currentItemRecipes.length === 0 ? (
                  <div className="p-4 bg-zinc-900/60 rounded-xl text-center text-zinc-500 text-xs">
                    No recipe rules set for this item yet. (Direct unit deduction fallback will apply).
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentItemRecipes.map(r => (
                      <div
                        key={r.id}
                        className="bg-zinc-900 border border-zinc-750 rounded-xl p-3 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-bold text-zinc-200">
                            {r.stockItem?.name || 'Ingredient'}
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            {r.variant ? `Variant: ${r.variant.name}` : 'Applies to all variants'}
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <span className="font-mono font-bold text-xs text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-lg border border-brand-500/20">
                            {r.quantityRequired} {r.stockItem?.unit || 'units'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteRecipe(r.id)}
                            className="p-1 text-zinc-500 hover:text-red-400 transition"
                            title="Delete rule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
