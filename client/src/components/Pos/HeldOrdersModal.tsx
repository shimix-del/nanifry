import React from 'react';
import { X, Play, Trash2, Clock, Utensils, User, Phone, PauseCircle } from 'lucide-react';
import { usePosCart } from '../../context/PosCartContext';
import { formatKES, formatKenyaDateTime } from '../../utils/currency';
import { Order } from '../../types';

interface HeldOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HeldOrdersModal: React.FC<HeldOrdersModalProps> = ({ isOpen, onClose }) => {
  const { heldOrders, resumeHeldOrder, isLoadingHeld } = usePosCart();

  if (!isOpen) return null;

  const handleResume = async (order: Order) => {
    await resumeHeldOrder(order);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/90">
          <div className="flex items-center space-x-2">
            <PauseCircle className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">
              Parked / Held Orders ({heldOrders.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {heldOrders.length === 0 ? (
            <div className="text-center py-10 text-zinc-500">
              <p className="text-xs font-bold text-zinc-400">No orders currently parked</p>
              <p className="text-[11px] text-zinc-600 mt-1">
                You can park an order in the cart to attend to another customer and resume later.
              </p>
            </div>
          ) : (
            heldOrders.map(order => (
              <div
                key={order.id}
                className="bg-zinc-800/80 border border-zinc-700/70 rounded-2xl p-3.5 space-y-2 hover:border-amber-500/50 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs font-bold text-zinc-200 capitalize">
                      {order.orderType.toLowerCase()}{' '}
                      {order.tableNumber ? `(${order.tableNumber})` : ''}
                    </span>
                  </div>
                  <span className="text-xs font-black text-brand-400">
                    {formatKES(order.totalAmount)}
                  </span>
                </div>

                {/* Items summary */}
                <div className="text-xs text-zinc-300 space-y-0.5 bg-zinc-900/60 p-2 rounded-xl">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-[11px]">
                      <span>
                        {it.quantity}x {it.itemName}{' '}
                        {it.variantName ? `(${it.variantName})` : ''}
                      </span>
                      <span className="text-zinc-400">{formatKES(it.totalPrice)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-400">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    <span>{formatKenyaDateTime(order.createdAt)}</span>
                  </div>

                  <button
                    onClick={() => handleResume(order)}
                    className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-brand-500/20"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Resume Order</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
