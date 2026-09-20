export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'cash';
  balance: number;
  currency: string;
  institution: string;
  last4?: string;
  color: string;
}

export interface Transaction {
  id: string;
  merchant: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  account: string;
}

export interface Budget {
  id: string;
  category: string;
  icon: string;
  budgeted: number;
  spent: number;
}

export interface Goal {
  id: string;
  name: string;
  icon: string;
  current: number;
  target: number;
  color: string;
  targetDate: string;
  monthlyContrib: number;
}

export const accounts: Account[] = [
  { id: 'acc_1', name: 'Chase Checking', type: 'checking', balance: 12840.50, currency: 'USD', institution: 'Chase', last4: '4829', color: '#3B82F6' },
  { id: 'acc_2', name: 'Vanguard High-Yield Savings', type: 'savings', balance: 28500.00, currency: 'USD', institution: 'Vanguard', last4: '9102', color: '#10B981' },
  { id: 'acc_3', name: 'Amex Gold Card', type: 'credit', balance: -1240.12, currency: 'USD', institution: 'American Express', last4: '1004', color: '#F59E0B' },
  { id: 'acc_4', name: 'Fidelity Brokerage', type: 'investment', balance: 84320.24, currency: 'USD', institution: 'Fidelity', color: '#6366F1' },
  { id: 'acc_5', name: 'Cash Reserve', type: 'cash', balance: 340.00, currency: 'USD', institution: 'Physical Cash', color: '#64748B' },
];

export const transactions: Transaction[] = [
  { id: 'tx_1', merchant: 'Acme Corp Payout', description: 'Bi-weekly salary deposit', amount: 5400.00, type: 'income', category: 'Income', date: '2026-09-18', account: 'Chase Checking' },
  { id: 'tx_2', merchant: 'Chase Mortgage', description: 'Monthly home mortgage payment', amount: -2100.00, type: 'expense', category: 'Housing', date: '2026-09-15', account: 'Chase Checking' },
  { id: 'tx_3', merchant: 'Whole Foods Market', description: 'Weekly groceries checkout', amount: -127.45, type: 'expense', category: 'Groceries', date: '2026-09-14', account: 'Amex Gold Card' },
  { id: 'tx_4', merchant: 'Stripe Freelance', description: 'Client project milestone payment', amount: 1920.00, type: 'income', category: 'Income', date: '2026-09-12', account: 'Chase Checking' },
  { id: 'tx_5', merchant: 'Airbnb weekend stay', description: 'Cabin booking in Maine', amount: -312.00, type: 'expense', category: 'Travel', date: '2026-09-10', account: 'Amex Gold Card' },
  { id: 'tx_6', merchant: 'Amazon Prime', description: 'Electronics and home supplies', amount: -139.00, type: 'expense', category: 'Shopping', date: '2026-09-08', account: 'Amex Gold Card' },
  { id: 'tx_7', merchant: 'Uber Trip', description: 'Ride to airport', amount: -42.50, type: 'expense', category: 'Transportation', date: '2026-09-07', account: 'Amex Gold Card' },
  { id: 'tx_8', merchant: 'Equinox Fitness', description: 'Monthly gym membership', amount: -85.00, type: 'expense', category: 'Health', date: '2026-09-05', account: 'Chase Checking' },
  { id: 'tx_9', merchant: 'Starbucks Coffee', description: 'Espresso & breakfast', amount: -14.25, type: 'expense', category: 'Dining', date: '2026-09-04', account: 'Amex Gold Card' },
  { id: 'tx_10', merchant: 'GitHub Subscription', description: 'Developer plan annual charge', amount: -48.00, type: 'expense', category: 'Software', date: '2026-09-01', account: 'Chase Checking' },
];

export const aiMessages = [
  {
    id: 1,
    role: 'assistant' as const,
    content: "Hello Alex! I'm **FinSight AI**, your personal financial assistant. I've analyzed your financial data for September 2026.\n\nYour net worth has reached **$124,760**, up **0.53%** this month with an impressive **50.2% savings rate**. How can I help you optimize your finances today?",
    timestamp: '09:00 AM',
  },
];

export const suggestedQuestions = [
  "Where did most of my money go this month?",
  "Am I on track with my budget?",
  "How much am I saving each month?",
  "What is my highest category of spending?",
];

export const cashFlowData = [
  { month: 'Apr', income: 9800, expenses: 6100 },
  { month: 'May', income: 10200, expenses: 5900 },
  { month: 'Jun', income: 11500, expenses: 6800 },
  { month: 'Jul', income: 10400, expenses: 5700 },
  { month: 'Aug', income: 11200, expenses: 6500 },
  { month: 'Sep', income: 12720, expenses: 6334 },
];

export const spendingByCategory = [
  { name: 'Housing', value: 2100, color: '#6366F1' },
  { name: 'Groceries', value: 491, color: '#3B82F6' },
  { name: 'Shopping', value: 319, color: '#EC4899' },
  { name: 'Dining', value: 284, color: '#F59E0B' },
  { name: 'Utilities', value: 233, color: '#64748B' },
];

export const monthlySpendingTrend = [
  { month: 'Apr', amount: 6100 },
  { month: 'May', amount: 5900 },
  { month: 'Jun', amount: 6800 },
  { month: 'Jul', amount: 5700 },
  { month: 'Aug', amount: 6500 },
  { month: 'Sep', amount: 6334 },
];

export const netWorthHistory = [
  { month: 'Apr', netWorth: 116200 },
  { month: 'May', netWorth: 118400 },
  { month: 'Jun', netWorth: 120100 },
  { month: 'Jul', netWorth: 121900 },
  { month: 'Aug', netWorth: 124100 },
  { month: 'Sep', netWorth: 124760 },
];

export const budgets: Budget[] = [
  { id: 'b_1', category: 'Housing', icon: '🏠', budgeted: 2100, spent: 2100 },
  { id: 'b_2', category: 'Groceries', icon: '🛒', budgeted: 600, spent: 491 },
  { id: 'b_3', category: 'Dining', icon: '🍽️', budgeted: 350, spent: 284 },
  { id: 'b_4', category: 'Shopping', icon: '🛍️', budgeted: 200, spent: 319 },
  { id: 'b_5', category: 'Transport', icon: '🚗', budgeted: 250, spent: 148 },
  { id: 'b_6', category: 'Utilities', icon: '⚡', budgeted: 250, spent: 233 },
  { id: 'b_7', category: 'Entertainment', icon: '🎬', budgeted: 200, spent: 120 },
  { id: 'b_8', category: 'Health & Fitness', icon: '💪', budgeted: 150, spent: 85 },
];

export const goals: Goal[] = [
  { id: 'g_1', name: 'Emergency Fund', icon: '🛡️', current: 28500, target: 30000, color: '#10B981', targetDate: '2026-12-31', monthlyContrib: 500 },
  { id: 'g_2', name: 'Trip to Japan', icon: '✈️', current: 4800, target: 7500, color: '#3B82F6', targetDate: '2027-06-30', monthlyContrib: 300 },
  { id: 'g_3', name: 'New Car Down Payment', icon: '🚗', current: 12000, target: 15000, color: '#F59E0B', targetDate: '2027-03-31', monthlyContrib: 500 },
  { id: 'g_4', name: 'Investment Portfolio', icon: '📈', current: 84320, target: 100000, color: '#6366F1', targetDate: '2027-12-31', monthlyContrib: 1200 },
];
