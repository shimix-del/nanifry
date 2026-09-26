import React, { useState } from 'react';
import { X, ArrowRightLeft, Building2, CheckCircle2 } from 'lucide-react';
import { StockItem, Branch } from '../../types';
import { api } from '../../services/api';

interface StockTransferModalProps {
  item: StockItem | null;
  branches: Branch[];
  isOpen: boolean;
  onClose: () => void;
  onTransferred: () => void;
}

export const StockTransferModal: React.FC<StockTransferModalProps> = ({
  item,
  branches,
  isOpen,
  onClose,
  onTransferred,
}) => {
  if (!isOpen || !item) return null;

  const destBranches = branches.filter(b => b.id !== item.branchId && b.isActive);
  const [destBranchId, setDestBranchId] = useState<string>(destBranches[0]?.id || '');
  const [quantity, setQuantity] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) {
      setError('Please provide a valid transfer quantity');
      return;
    }
    if (qty > item.currentStock) {
      setError(`Cannot transfer ${qty} ${item.unit}. Only ${item.currentStock} ${item.unit} available at source branch.`);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await api.transferStock({
        sourceBranchId: item.branchId,
        destBranchId,
        stockItemId: item.id,
        quantity: qty,
        notes,
      });
      onTransferred();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Transfer failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/90">
          <div className="flex items-center space-x-2">
            <ArrowRightLeft className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-white text-base">Inter-Branch Stock Transfer</h3>
              <p className="text-[11px] text-zinc-400">Move inventory between locations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleTransfer} className="p-4 space-y-3.5">
          {error && (
            <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Item & Source details */}
          <div className="p-3 bg-zinc-800/70 rounded-2xl border border-zinc-750 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">Stock Item:</span>
              <span className="font-bold text-white">{item.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Source Branch:</span>
              <span className="font-semibold text-brand-400">{item.branch?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Available at Source:</span>
              <span className="font-black text-emerald-400">
                {item.currentStock} {item.unit}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Destination Branch *
            </label>
            <select
              value={destBranchId}
              onChange={e => setDestBranchId(e.target.value)}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-3.5 py-2.5 text-xs text-zinc-100 font-semibold focus:outline-none focus:border-brand-500"
            >
              {destBranches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Quantity to Transfer ({item.unit}) *
            </label>
            <input
              type="number"
              step="any"
              max={item.currentStock}
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              placeholder={`Max: ${item.currentStock} ${item.unit}`}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-3.5 py-2 text-sm text-zinc-100 font-black focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Transfer Notes / Driver Name
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Sent via Boda Rider Otieno"
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
              disabled={isLoading || destBranches.length === 0}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow-lg shadow-blue-600/25 transition flex items-center justify-center space-x-1.5"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>{isLoading ? 'Transferring...' : 'Dispatch Transfer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
