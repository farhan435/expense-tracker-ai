import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ExpenseProvider } from '@/context/ExpenseContext';
import Navbar from '@/components/Navbar';
import ExpenseFormDrawer from '@/components/ExpenseFormDrawer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ExpenseTracker — Manage Your Finances',
  description:
    'A modern, professional expense tracking application to help you manage personal finances.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans bg-gradient-to-br from-slate-50 via-white to-blue-50/40 min-h-screen">
        <ExpenseProvider>
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <ExpenseFormDrawer />
        </ExpenseProvider>
      </body>
    </html>
  );
}
