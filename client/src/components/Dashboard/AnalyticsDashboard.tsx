import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Building2,
  Calendar,
  Download,
  RefreshCw,
  PieChart as PieIcon,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { api } from '../../services/api';
import { useBranch } from '../../context/BranchContext';
import { DashboardSummary } from '../../types';
import { formatKES } from '../../utils/currency';

export const AnalyticsDashboard: React.FC = () => {
  const { currentBranchId, branches } = useBranch();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [categorySales, setCategorySales] = useState<any[]>([]);
  const [topItems, setTopItems] = useState<any[]>([]);
  const [hourlySales, setHourlySales] = useState<any[]>([]);
  const [branchComparison, setBranchComparison] = useState<any[]>([]);
  const [cashierStats, setCashierStats] = useState<any[]>([]);
  const [profitLoss, setProfitLoss] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [
        sumData,
        catData,
        topData,
        hourData,
        compData,
        cashierData,
        plData,
      ] = await Promise.all([
        api.getDashboardSummary({ branchId: currentBranchId || undefined }),
        api.getSalesByCategory({ branchId: currentBranchId || undefined, days: 7 }),
        api.getTopItems({ branchId: currentBranchId || undefined, limit: 7, days: 7 }),
        api.getHourlySales({ branchId: currentBranchId || undefined }),
        api.getBranchComparison(),
        api.getCashierPerformance({ branchId: currentBranchId || undefined }),
        api.getProfitLoss({ branchId: currentBranchId || undefined }),
      ]);

      setSummary(sumData);
      setCategorySales(catData);
      setTopItems(topData);
      setHourlySales(hourData);
      setBranchComparison(compData);
      setCashierStats(cashierData);
      setProfitLoss(plData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentBranchId]);

  const COLORS = ['#ea580c', '#00a859', '#3b82f6', '#eab308', '#a855f7', '#ec4899'];

  const exportCSV = () => {
    if (!topItems || topItems.length === 0) return;
    const headers = ['Dish Name', 'Variant', 'Quantity Sold', 'Total Revenue (KES)'];
    const rows = topItems.map(i => [
      `"${i.name}"`,
      `"${i.variant || 'Standard'}"`,
      i.quantity,
      i.revenue,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nani_frys_sales_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 bg-zinc-950">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center space-x-2.5">
            <BarChart3 className="w-6 h-6 text-brand-500" />
            <span>Owner Executive Analytics & Multi-Branch P&L</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time revenues, profit margins, peak sales hours, and multi-branch rollups
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-2xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
          >
            <Download className="w-4 h-4 text-brand-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={fetchDashboardData}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-2xl border border-zinc-800 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-5 space-y-2">
            <span className="text-xs font-bold text-zinc-400">Today Gross Sales</span>
            <div className="text-xl sm:text-2xl font-black text-white">
              {formatKES(summary.todayGrossSales)}
            </div>
            <div className="text-[11px] text-zinc-500 flex items-center space-x-1">
              <ShoppingBag className="w-3.5 h-3.5 text-brand-400" />
              <span>{summary.todayOrderCount} orders processed</span>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-5 space-y-2">
            <span className="text-xs font-bold text-zinc-400">Today Net Profit</span>
            <div
              className={`text-xl sm:text-2xl font-black ${
                summary.todayNetProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {formatKES(summary.todayNetProfit)}
            </div>
            <div className="text-[11px] text-zinc-500">
              Gross - COGS ({formatKES(summary.todayCOGS)}) - Exp ({formatKES(summary.totalTodayExpenses)})
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-5 space-y-2">
            <span className="text-xs font-bold text-zinc-400">M-Pesa vs Cash Ratio</span>
            <div className="text-xl sm:text-2xl font-black text-safari-mpesa">
              {formatKES(summary.mpesaSales)}
            </div>
            <div className="text-[11px] text-zinc-400">
              Cash: <span className="font-bold text-amber-400">{formatKES(summary.cashSales)}</span>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-5 space-y-2">
            <span className="text-xs font-bold text-zinc-400">Average Order Value</span>
            <div className="text-xl sm:text-2xl font-black text-brand-400">
              {formatKES(summary.averageTicket)}
            </div>
            <div className="text-[11px] text-zinc-500">
              Per ticket / customer spend
            </div>
          </div>
        </div>
      )}

      {/* Multi-Branch Side-by-Side Comparison */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-brand-500" />
            <span>Multi-Branch Performance Comparison</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {branchComparison.map(b => (
            <div
              key={b.branchId}
              className="bg-zinc-850 border border-zinc-750 rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-zinc-700/80 pb-2">
                <span className="font-extrabold text-sm text-white">{b.branchName}</span>
                <span className="font-mono text-[10px] bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded-md font-bold">
                  {b.branchCode}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Sales:</span>
                  <span className="font-black text-white">{formatKES(b.totalSales)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Orders Completed:</span>
                  <span className="font-bold text-zinc-200">{b.totalOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Expenses Logged:</span>
                  <span className="font-bold text-red-400">- {formatKES(b.totalExpenses)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-zinc-750 font-black">
                  <span className="text-zinc-300">Net Estimated Profit:</span>
                  <span className={b.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                    {formatKES(b.netProfit)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Peak Distribution Chart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <Clock className="w-5 h-5 text-brand-500" />
                <span>Peak Sales Hours (Lunch & Dinner Waves)</span>
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">Revenue curve throughout the day</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlySales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="hour" stroke="#71717a" textAnchor="end" tick={{ fontSize: 10 }} />
                <YAxis stroke="#71717a" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#3f3f46',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [formatKES(value), 'Revenue']}
                />
                <Area type="monotone" dataKey="sales" stroke="#ea580c" fillOpacity={1} fill="url(#salesGrad)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Sales Pie Chart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <PieIcon className="w-5 h-5 text-safari-mpesa" />
                <span>Sales by Food & Drink Category</span>
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">Fast foods vs Swahili meals vs Drinks</p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {categorySales.length === 0 ? (
              <div className="text-zinc-500 text-xs">No category sales recorded yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySales}
                    dataKey="revenue"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {categorySales.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#3f3f46',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    formatter={(value: any) => [formatKES(value), 'Revenue']}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Top Dishes Leaderboard & Cashier League */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Menu Items */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6 space-y-4">
          <h3 className="font-bold text-white text-base flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Best-Selling Dishes & Combos</span>
          </h3>

          <div className="space-y-2">
            {topItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-zinc-850 border border-zinc-750 rounded-2xl p-3 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-lg bg-zinc-800 text-brand-400 font-extrabold flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-zinc-100">{item.name}</div>
                    {item.variant && <div className="text-[10px] text-zinc-400">{item.variant}</div>}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-black text-zinc-100">{formatKES(item.revenue)}</div>
                  <div className="text-[10px] text-zinc-400 font-semibold">{item.quantity} sold</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cashier Accountability Leaderboard */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6 space-y-4">
          <h3 className="font-bold text-white text-base flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span>Staff Sales & Cashier Accountability</span>
          </h3>

          <div className="space-y-2">
            {cashierStats.map((c, idx) => (
              <div
                key={c.cashierId}
                className="bg-zinc-850 border border-zinc-750 rounded-2xl p-3 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 font-black flex items-center justify-center text-xs">
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-zinc-100">{c.name}</div>
                    <div className="text-[10px] text-zinc-400">{c.branchName} • {c.role}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-black text-emerald-400">{formatKES(c.totalSales)}</div>
                  <div className="text-[10px] text-zinc-400">{c.orderCount} orders (Avg: {formatKES(c.avgTicket)})</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
