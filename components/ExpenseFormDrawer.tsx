'use client';

import { useState, useEffect } from 'react';
import {
  X,
  DollarSign,
  Calendar,
  FileText,
  Save,
  Plus,
} from 'lucide-react';
import { useExpenseContext } from '@/context/ExpenseContext';
import { CATEGORIES, CATEGORY_CONFIG } from '@/lib/constants';
import { Category } from '@/lib/types';

interface FormState {
  amount: string;
  category: Category;
  description: string;
  date: string;
}

interface Errors {
  amount?: string;
  description?: string;
  date?: string;
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

export default function ExpenseFormDrawer() {
  const { drawerOpen, editingExpense, closeDrawer, addExpense, updateExpense } =
    useExpenseContext();

  const [form, setForm] = useState<FormState>({
    amount: '',
    category: 'Food',
    description: '',
    date: today(),
  });
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (drawerOpen) {
      if (editingExpense) {
        setForm({
          amount: editingExpense.amount.toString(),
          category: editingExpense.category,
          description: editingExpense.description,
          date: editingExpense.date,
        });
      } else {
        setForm({ amount: '', category: 'Food', description: '', date: today() });
      }
      setErrors({});
    }
  }, [drawerOpen, editingExpense]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof Errors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function validate(): boolean {
    const next: Errors = {};
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0) {
      next.amount = 'Enter a valid amount greater than $0';
    }
    if (amt > 999999) {
      next.amount = 'Amount cannot exceed $999,999';
    }
    if (!form.description.trim()) {
      next.description = 'Description is required';
    }
    if (!form.date) {
      next.date = 'Date is required';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        amount: Math.round(parseFloat(form.amount) * 100) / 100,
        category: form.category,
        description: form.description.trim(),
        date: form.date,
      };
      if (editingExpense) {
        updateExpense({ ...editingExpense, ...payload });
      } else {
        addExpense(payload);
      }
      closeDrawer();
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeDrawer}
      />

      {/* Drawer panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-[460px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
              {editingExpense ? (
                <Save className="w-4 h-4 text-blue-600" />
              ) : (
                <Plus className="w-4 h-4 text-blue-600" />
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </h2>
          </div>
          <button
            onClick={closeDrawer}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-y-auto px-6 py-5 gap-5"
        >
          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Amount <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="999999"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => set('amount', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-lg font-semibold ${
                  errors.amount
                    ? 'border-red-300 bg-red-50'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                }`}
              />
            </div>
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1.5">{errors.amount}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Date <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={form.date}
                max={today()}
                onChange={(e) => set('date', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.date
                    ? 'border-red-300 bg-red-50'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                }`}
              />
            </div>
            {errors.date && (
              <p className="text-red-500 text-xs mt-1.5">{errors.date}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const cfg = CATEGORY_CONFIG[cat];
                const selected = form.category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => set('category', cat)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                      selected
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-2xl leading-none">{cfg.emoji}</span>
                    <span
                      className={`text-xs font-semibold ${
                        selected ? 'text-blue-700' : 'text-slate-600'
                      }`}
                    >
                      {cat}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Description <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <textarea
                placeholder="What was this expense for?"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={3}
                maxLength={200}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors ${
                  errors.description
                    ? 'border-red-300 bg-red-50'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                }`}
              />
            </div>
            <div className="flex justify-between items-center mt-1.5">
              {errors.description ? (
                <p className="text-red-500 text-xs">{errors.description}</p>
              ) : (
                <span />
              )}
              <p className="text-xs text-slate-400">{form.description.length}/200</p>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={closeDrawer}
              className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {editingExpense ? 'Save Changes' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
