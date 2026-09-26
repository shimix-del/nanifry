import React from 'react';
import {
  LayoutGrid,
  Boxes,
  Utensils,
  WalletCards,
  TrendingDown,
  BarChart3,
  Users,
  Building2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type NavTab = 'pos' | 'inventory' | 'menu' | 'shifts' | 'expenses' | 'analytics' | 'staff';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const { user } = useAuth();
  const isOwnerOrManager = user?.role === 'OWNER' || user?.role === 'MANAGER';

  const navItems = [
    {
      id: 'pos' as NavTab,
      label: 'Touch POS',
      icon: LayoutGrid,
      desc: 'Cashier Checkout',
      roles: ['OWNER', 'MANAGER', 'CASHIER'],
    },
    {
      id: 'shifts' as NavTab,
      label: 'Shift & Cash',
      icon: WalletCards,
      desc: 'Float & Z-Reports',
      roles: ['OWNER', 'MANAGER', 'CASHIER'],
    },
    {
      id: 'inventory' as NavTab,
      label: 'Stock & Inventory',
      icon: Boxes,
      desc: 'Raw Goods & Units',
      roles: ['OWNER', 'MANAGER'],
    },
    {
      id: 'menu' as NavTab,
      label: 'Menu & Recipes',
      icon: Utensils,
      desc: 'BOM & Dishes',
      roles: ['OWNER', 'MANAGER'],
    },
    {
      id: 'expenses' as NavTab,
      label: 'Daily Expenses',
      icon: TrendingDown,
      desc: 'Gas, Veggies & Wages',
      roles: ['OWNER', 'MANAGER'],
    },
    {
      id: 'analytics' as NavTab,
      label: 'Sales Analytics',
      icon: BarChart3,
      desc: 'Net Profit & Multi-Branch',
      roles: ['OWNER', 'MANAGER'],
    },
    {
      id: 'staff' as NavTab,
      label: 'Staff & Branches',
      icon: Users,
      desc: 'Roles, PINs & Till #',
      roles: ['OWNER', 'MANAGER'],
    },
  ];

  return (
    <aside className="w-16 sm:w-60 bg-zinc-900 border-r border-zinc-800 flex flex-col justify-between shrink-0 select-none py-3">
      <nav className="space-y-1 px-2">
        {navItems
          .filter(item => item.roles.includes(user?.role || 'CASHIER'))
          .map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all font-medium text-left ${
                  isActive
                    ? 'bg-brand-500 text-white font-bold shadow-lg shadow-brand-500/25'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                <div className="hidden sm:block truncate">
                  <div className="text-xs leading-tight">{item.label}</div>
                  <div
                    className={`text-[10px] truncate ${
                      isActive ? 'text-orange-100' : 'text-zinc-500'
                    }`}
                  >
                    {item.desc}
                  </div>
                </div>
              </button>
            );
          })}
      </nav>

      {/* Bottom info banner */}
      <div className="hidden sm:block px-4 py-3 mx-2 bg-zinc-800/60 rounded-xl border border-zinc-800/80 text-[11px] text-zinc-400">
        <div className="font-semibold text-zinc-300">🍟 NANI FRYS v1.0</div>
        <div className="text-[10px] text-zinc-500">Hotel & Fast Food POS</div>
      </div>
    </aside>
  );
};
