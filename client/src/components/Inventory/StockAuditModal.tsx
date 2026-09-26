import React, { useState } from 'react';
import { X, ClipboardCheck, AlertTriangle } from 'lucide-react';
import { StockItem } from '../../types';
import { api } from '../../services/api';

interface StockAuditModalProps {
  item: StockItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAudited: () => void;
}

export const StockAuditModal: React.FC<StockAuditModalProps> = ({
  item,
  isOpen,
  onClose,
  onAudited,
}) => {
  if (!isOpen || !item) return null;

  const [countedStock, setCountedStock] = useState<string>(item.currentStock.toString());
  const [reason, setReason] = useState<string>('RECONCILIATION');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const physicalCount = parseFloat(countedStock) || 0;
  const variance = physicalCount - item.currentStock;

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await api.auditStock({
        stockItemId: item.id,
        countedStock: physicalCount,
        reason,
        notes,
      });
      onAudited();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record audit');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/90">
          <div className="flex items-center space-x-2">
            <ClipboardCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-white text-base">Physical Stock Audit & Count</h3>
              <p className="text-[11px] text-zinc-400">{item.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleAuditSubmit} className="p-4 space-y-3.5">
          {error && (
            <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* System vs Counted comparison */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-zinc-800/60 rounded-2xl border border-zinc-750 text-xs">
              <span className="text-zinc-400 font-semibold">System Expected:</span>
              <div className="text-base font-black text-zinc-200 mt-0.5">
                {item.currentStock} {item.unit}
              </div>
            </div>

            <div className="p-3 bg-zinc-800/60 rounded-2xl border border-zinc-750 text-xs">
              <span className="text-zinc-400 font-semibold">Physical Counted:</span>
              <div className="text-base font-black text-brand-400 mt-0.5">
                {physicalCount} {item.unit}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Actual Physical Count ({item.unit}) *
            </label>
            <input
              type="number"
              step="any"
              value={countedStock}
              onChange={e => setCountedStock(e.target.value)}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-3.5 py-2 text-base text-zinc-100 font-black focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Variance result banner */}
          <div
            className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-bold ${
              variance === 0
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : variance < 0
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
            }`}
          >
            <span>Count Variance:</span>
            <span>
              {variance === 0
                ? '✓ 100% Balanced'
                : `${variance > 0 ? '+' : ''}${variance} ${item.unit} (${
                    variance < 0 ? 'Shrinkage / Loss' : 'Surplus'
                  })`}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Variance Reason / Audit Type
            </label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-3.5 py-2.5 text-xs text-zinc-100 font-semibold focus:outline-none focus:border-brand-500"
            >
              <option value="RECONCILIATION">Routine End-of-Day Count</option>
              <option value="SPOILAGE">Kitchen Spoilage / Expired</option>
              <option value="WASTAGE">Preparation Wastage / Over-portioning</option>
              <option value="THEFT">Unaccounted Shrinkage / Theft</option>
              <option value="RECIPE_ADJUSTMENT">Recipe Usage Calibration</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Audit Notes / Explanation
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. 2kg potatoes had rotted due to humidity"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-3 text-xs text-zinc-100 focus:outline-none focus:border-brand-500"
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
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow-lg shadow-emerald-600/25 transition flex items-center justify-center space-x-1.5"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>{isLoading ? 'Reconciling...' : 'Confirm Audit & Adjust Stock'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
