'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { DollarSign, TrendingUp, Receipt, Calculator, Plus, ArrowRight, Cloud } from 'lucide-react';
import { useExpenseContext } from '@/context/ExpenseContext';
import SummaryCard from '@/components/SummaryCard';
import CategoryPieChart from '@/components/CategoryPieChart';
import MonthlyBarChart from '@/components/MonthlyBarChart';
import RecentExpenses from '@/components/RecentExpenses';
import CloudExportHub from '@/components/CloudExportHub';
import {
  formatCurrency,
  getMonthlySpending,
  getSpendingByCategory,
  getMonthlyData,
  getTopCategory,
} from '@/lib/utils';

export default function DashboardPage() {
  const { expenses, loading, openDrawer } = useExpenseContext();
  const [hubOpen, setHubOpen] = useState(false);

  const stats = useMemo(() => {
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const monthly = getMonthlySpending(expenses);
    const count = expenses.length;
    const avg = count > 0 ? total / count : 0;
    const topCat = getTopCategory(expenses);
    const pieData = getSpendingByCategory(expenses);
    const barData = getMonthlyData(expenses, 6);
    return { total, monthly, count, avg, topCat, pieData, barData };
  }, [expenses]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading your expenses…</p>
        </div>
      </div>
    );
  }

  const currentMonth = new Date().toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Your personal finance overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHubOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            <Cloud className="w-4 h-4" />
            Export Hub
          </button>
          <button
            onClick={() => openDrawer()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Spent"
          value={formatCurrency(stats.total)}
          subtitle="All time"
          icon={DollarSign}
          color="blue"
        />
        <SummaryCard
          title="This Month"
          value={formatCurrency(stats.monthly)}
          subtitle={currentMonth}
          icon={TrendingUp}
          color="green"
        />
        <SummaryCard
          title="Transactions"
          value={stats.count.toLocaleString()}
          subtitle="Total expenses logged"
          icon={Receipt}
          color="purple"
        />
        <SummaryCard
          title="Average"
          value={formatCurrency(stats.avg)}
          subtitle="Per transaction"
          icon={Calculator}
          color="amber"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-bold text-slate-800">
              Spending by Category
            </h2>
            <span className="text-xs text-slate-400">All time</span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Top: <span className="font-semibold text-slate-600">{stats.topCat}</span>
          </p>
          <CategoryPieChart data={stats.pieData} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-bold text-slate-800">
              Monthly Spending
            </h2>
            <span className="text-xs text-slate-400">Last 6 months</span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Darker bar = highest month
          </p>
          <MonthlyBarChart data={stats.barData} />
        </div>
      </div>

      {/* Category breakdown strip */}
      {stats.pieData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-base font-bold text-slate-800 mb-4">
            Category Breakdown
          </h2>
          <div className="space-y-3">
            {stats.pieData.map((item) => {
              const pct =
                stats.total > 0
                  ? Math.round((item.value / stats.total) * 100)
                  : 0;
              return (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-600 w-28 flex-shrink-0">
                    {item.name}
                  </span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor:
                          stats.pieData.find((d) => d.name === item.name)
                            ? `hsl(${(stats.pieData.findIndex((d) => d.name === item.name) * 60) % 360}, 70%, 55%)`
                            : '#3B82F6',
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-bold text-slate-700">
                      {formatCurrency(item.value)}
                    </span>
                    <span className="text-xs text-slate-400 w-8 text-right">
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-800">
            Recent Transactions
          </h2>
          <Link
            href="/expenses"
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-semibold"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <RecentExpenses expenses={expenses.slice(0, 8)} />
      </div>
    </div>

    <CloudExportHub
      expenses={expenses}
      isOpen={hubOpen}
      onClose={() => setHubOpen(false)}
    />
    </>
  );
}
