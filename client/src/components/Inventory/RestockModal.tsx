import React, { useState } from 'react';
import { X, PlusCircle, PackageCheck, Building2 } from 'lucide-react';
import { StockItem } from '../../types';
import { api } from '../../services/api';
import { formatKES } from '../../utils/currency';

interface RestockModalProps {
  item: StockItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRestocked: () => void;
}

export const RestockModal: React.FC<RestockModalProps> = ({
  item,
  isOpen,
  onClose,
  onRestocked,
}) => {
  if (!isOpen || !item) return null;

  const [quantityAdded, setQuantityAdded] = useState<string>('');
  const [unitCost, setUnitCost] = useState<string>(item.unitCost ? item.unitCost.toString() : '');
  const [supplierName, setSupplierName] = useState<string>(item.supplierName || '');
  const [invoiceRef, setInvoiceRef] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantityAdded);
    if (!qty || qty <= 0) {
      setError('Please provide a valid positive quantity');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await api.restock({
        stockItemId: item.id,
        quantityAdded: qty,
        unitCost: unitCost ? parseFloat(unitCost) : undefined,
        supplierName: supplierName || undefined,
        notes: notes || invoiceRef ? `Invoice #${invoiceRef}. ${notes}` : undefined,
      });
      onRestocked();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to restock item');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/90">
          <div className="flex items-center space-x-2">
            <PackageCheck className="w-5 h-5 text-brand-500" />
            <div>
              <h3 className="font-bold text-white text-base">Restock Intake</h3>
              <p className="text-[11px] text-zinc-400">
                {item.name} ({item.branch?.name})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          {error && (
            <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Current Stock Banner */}
          <div className="p-3 bg-zinc-800/60 rounded-2xl border border-zinc-750 flex items-center justify-between text-xs">
            <span className="text-zinc-400">Current Stock Level:</span>
            <span className="font-black text-brand-400 text-sm">
              {item.currentStock} {item.unit}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Quantity to Add ({item.unit}) *
            </label>
            <input
              type="number"
              step="any"
              value={quantityAdded}
              onChange={e => setQuantityAdded(e.target.value)}
              placeholder={`e.g. 50 ${item.unit}`}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-3.5 py-2 text-sm text-zinc-100 font-black focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Unit Purchase Cost (KES per {item.unit})
            </label>
            <input
              type="number"
              step="any"
              value={unitCost}
              onChange={e => setUnitCost(e.target.value)}
              placeholder="e.g. 150"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-brand-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Supplier / Farmer Co-op
            </label>
            <input
              type="text"
              value={supplierName}
              onChange={e => setSupplierName(e.target.value)}
              placeholder="e.g. Wakulima Market, Kenchic, Farmer's Choice"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Invoice / Delivery Note Ref
            </label>
            <input
              type="text"
              value={invoiceRef}
              onChange={e => setInvoiceRef(e.target.value)}
              placeholder="e.g. INV-8921"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="pt-2 flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-2xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow-lg shadow-brand-500/25 transition flex items-center justify-center space-x-1.5"
            >
              <PackageCheck className="w-4 h-4" />
              <span>{isLoading ? 'Saving...' : 'Confirm Restock'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
