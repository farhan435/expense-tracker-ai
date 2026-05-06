import { Expense, Category } from './types';
import { generateId } from './utils';
import { saveExpenses } from './storage';

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

const RAW: Array<{
  amount: number;
  category: Category;
  description: string;
  daysAgo: number;
}> = [
  { amount: 92.5, category: 'Food', description: 'Weekly grocery shopping at Whole Foods', daysAgo: 1 },
  { amount: 14.99, category: 'Entertainment', description: 'Netflix monthly subscription', daysAgo: 2 },
  { amount: 34.5, category: 'Transportation', description: 'Uber to airport', daysAgo: 3 },
  { amount: 156.0, category: 'Shopping', description: 'New running shoes', daysAgo: 4 },
  { amount: 89.0, category: 'Bills', description: 'Electricity bill', daysAgo: 5 },
  { amount: 23.75, category: 'Food', description: 'Lunch at Italian restaurant', daysAgo: 6 },
  { amount: 45.0, category: 'Other', description: 'Gym membership monthly fee', daysAgo: 8 },
  { amount: 67.2, category: 'Shopping', description: 'Amazon household items order', daysAgo: 9 },
  { amount: 12.5, category: 'Food', description: 'Coffee and pastry at Blue Bottle', daysAgo: 10 },
  { amount: 125.0, category: 'Bills', description: 'Internet and cable bill', daysAgo: 11 },
  { amount: 28.0, category: 'Transportation', description: 'Gas station fill-up', daysAgo: 12 },
  { amount: 85.0, category: 'Entertainment', description: 'Concert tickets — indie band', daysAgo: 14 },
  { amount: 43.0, category: 'Food', description: 'Dinner with friends at Thai Kitchen', daysAgo: 15 },
  { amount: 19.99, category: 'Entertainment', description: 'Spotify Premium subscription', daysAgo: 16 },
  { amount: 210.0, category: 'Shopping', description: 'New winter jacket from Patagonia', daysAgo: 18 },
  { amount: 55.0, category: 'Other', description: 'Medical copay — annual checkup', daysAgo: 20 },
  { amount: 33.0, category: 'Food', description: 'Grocery run at Trader Joes', daysAgo: 21 },
  { amount: 15.0, category: 'Transportation', description: 'Monthly metro card top-up', daysAgo: 22 },
  { amount: 78.5, category: 'Bills', description: 'Phone bill — unlimited plan', daysAgo: 25 },
  { amount: 42.0, category: 'Food', description: 'Sushi dinner for two', daysAgo: 26 },
  { amount: 8.99, category: 'Entertainment', description: 'Amazon Prime video rental', daysAgo: 28 },
  { amount: 95.0, category: 'Shopping', description: 'Clothing at H&M seasonal sale', daysAgo: 30 },
  { amount: 62.0, category: 'Other', description: 'Haircut and styling', daysAgo: 32 },
  { amount: 180.0, category: 'Bills', description: 'Water and sewage utility bill', daysAgo: 35 },
  { amount: 29.5, category: 'Food', description: 'Thai takeout delivery', daysAgo: 36 },
  { amount: 50.0, category: 'Transportation', description: 'Weekly parking fees downtown', daysAgo: 38 },
  { amount: 120.0, category: 'Entertainment', description: 'Theater tickets — Hamilton', daysAgo: 42 },
  { amount: 88.0, category: 'Food', description: 'Weekly groceries and produce', daysAgo: 44 },
  { amount: 65.0, category: 'Other', description: 'Pet grooming and nail trim', daysAgo: 48 },
  { amount: 145.0, category: 'Shopping', description: 'Electronics accessories bundle', daysAgo: 52 },
  { amount: 37.0, category: 'Food', description: 'Brunch with family', daysAgo: 55 },
  { amount: 200.0, category: 'Bills', description: 'Renters insurance 6-month premium', daysAgo: 58 },
  { amount: 18.0, category: 'Transportation', description: 'Bus day passes', daysAgo: 60 },
  { amount: 76.0, category: 'Food', description: 'Weekly grocery haul', daysAgo: 65 },
  { amount: 49.99, category: 'Entertainment', description: 'Board game — Catan expansion', daysAgo: 68 },
  { amount: 95.5, category: 'Shopping', description: 'Home office supplies and desk mat', daysAgo: 72 },
  { amount: 22.0, category: 'Transportation', description: 'Lyft rides over the weekend', daysAgo: 75 },
  { amount: 110.0, category: 'Bills', description: 'Gas heating bill', daysAgo: 80 },
  { amount: 58.0, category: 'Food', description: 'Farmers market — fresh produce', daysAgo: 85 },
  { amount: 35.0, category: 'Other', description: 'Office supplies for home desk', daysAgo: 88 },
];

export function seedSampleData(): Expense[] {
  const expenses: Expense[] = RAW.map((item) => ({
    id: generateId(),
    amount: item.amount,
    category: item.category,
    description: item.description,
    date: daysAgo(item.daysAgo),
    createdAt: new Date().toISOString(),
  }));
  saveExpenses(expenses);
  return expenses;
}
