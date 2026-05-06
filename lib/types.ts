export type Category =
  | 'Food'
  | 'Transportation'
  | 'Entertainment'
  | 'Shopping'
  | 'Bills'
  | 'Other';

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  description: string;
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO string
}

export interface ExpenseFilters {
  search: string;
  category: Category | 'All';
  startDate: string;
  endDate: string;
}
