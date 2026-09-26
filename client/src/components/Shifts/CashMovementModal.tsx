import React, { useState } from 'react';
import { X, ArrowDownCircle, ArrowUpCircle, Shield } from 'lucide-react';
import { Shift } from '../../types';
import { api } from '../../services/api';
import { formatKES } from '../../utils/currency';

interface CashMovementModalProps {
  shift: Shift | null;
  isOpen: boolean;
  onClose: () => void;
  onMovementAdded: () => void;
}

export const CashMovementModal: React.FC<CashMovementModalProps> = ({
  shift,
  isOpen,
  onClose,
  onMovementAdded,
}) => {
  if (!isOpen || !shift) return null;

  const [type, setType] = useState<'CASH_DROP' | 'PAYOUT' | 'FLOAT_IN'>('CASH_DROP');
  const [amount, setAmount] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError('Please provide a positive amount');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await api.addCashMovement({
        shiftId: shift.id,
        type,
        amount: amt,
        reason: reason || `${type.replace('_', ' ')} recorded by cashier`,
      });
      onMovementAdded();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record cash movement');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/90">
          <div className="flex items-center space-x-2">
            <ArrowDownCircle className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-white text-base">Cash Drop / Drawer Movement</h3>
              <p className="text-[11px] text-zinc-400">Shift #{shift.id.slice(-4)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Movement Type */}
          <div className="grid grid-cols-3 gap-2 bg-zinc-800 p-1 rounded-2xl border border-zinc-700">
            <button
              type="button"
              onClick={() => setType('CASH_DROP')}
              className={`py-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center ${
                type === 'CASH_DROP'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>Cash Drop</span>
              <span className="text-[9px] opacity-80">(To Safe)</span>
            </button>

            <button
              type="button"
              onClick={() => setType('PAYOUT')}
              className={`py-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center ${
                type === 'PAYOUT'
                  ? 'bg-red-500 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>Payout</span>
              <span className="text-[9px] opacity-80">(Drawer Out)</span>
            </button>

            <button
              type="button"
              onClick={() => setType('FLOAT_IN')}
              className={`py-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center ${
                type === 'FLOAT_IN'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>Add Float</span>
              <span className="text-[9px] opacity-80">(Drawer In)</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Amount (KES) *
            </label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="e.g. 5000"
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl py-2.5 px-4 text-lg font-black text-amber-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Reason / Purpose *
            </label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder={
                type === 'CASH_DROP'
                  ? 'e.g. Mid-day excess cash drop to manager safe'
                  : type === 'PAYOUT'
                  ? 'e.g. Emergency ice purchase from shop'
                  : 'e.g. Extra change float addition'
              }
              required
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
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 disabled:opacity-50 text-black text-xs font-black rounded-2xl shadow-lg shadow-amber-500/25 transition"
            >
              {isLoading ? 'Recording...' : 'Save Cash Movement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
