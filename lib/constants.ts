import { Category } from './types';

export const CATEGORIES: Category[] = [
  'Food',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills',
  'Other',
];

export const CATEGORY_CONFIG: Record<
  Category,
  { color: string; bgColor: string; textColor: string; emoji: string; label: string }
> = {
  Food: {
    color: '#F59E0B',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    emoji: '🍕',
    label: 'Food & Dining',
  },
  Transportation: {
    color: '#3B82F6',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    emoji: '🚗',
    label: 'Transportation',
  },
  Entertainment: {
    color: '#8B5CF6',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    emoji: '🎬',
    label: 'Entertainment',
  },
  Shopping: {
    color: '#EC4899',
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-700',
    emoji: '🛍️',
    label: 'Shopping',
  },
  Bills: {
    color: '#EF4444',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    emoji: '📄',
    label: 'Bills & Utilities',
  },
  Other: {
    color: '#6B7280',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    emoji: '📦',
    label: 'Other',
  },
};
