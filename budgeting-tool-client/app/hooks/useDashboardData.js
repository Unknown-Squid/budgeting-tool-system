import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { dashboard, budgets, transactions, logs } from '../lib/api';

export function useDashboardData() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [transactionList, setTransactionList] = useState([]);
  const [budgetList, setBudgetList] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        router.push('/login');
        return;
      }

      const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
      
      if (isDemoMode) {
        // Demo mode data
        setStats({
          totalIncome: 5000.00,
          totalExpenses: 3200.50,
          balance: 1799.50,
          budgetProgress: [
            { id: '1', category: 'Groceries', limit: 500, spent: 320.50, remaining: 179.50, percentage: 64.1 },
            { id: '2', category: 'Entertainment', limit: 300, spent: 245.00, remaining: 55.00, percentage: 81.7 },
            { id: '3', category: 'Transportation', limit: 400, spent: 180.00, remaining: 220.00, percentage: 45.0 }
          ],
          categoryBreakdown: {
            'Groceries': 320.50,
            'Entertainment': 245.00,
            'Transportation': 180.00
          }
        });
        setBudgetList([
          { id: '1', category: 'Groceries', limit: 500 },
          { id: '2', category: 'Entertainment', limit: 300 },
          { id: '3', category: 'Transportation', limit: 400 }
        ]);
        setTransactionList([
          { id: '1', description: 'Grocery Shopping', amount: 85.50, category: 'Groceries', type: 'expense', date: new Date().toISOString() },
          { id: '2', description: 'Salary', amount: 5000.00, category: 'Income', type: 'income', date: new Date(Date.now() - 86400000).toISOString() }
        ]);
        setActivityLogs([
          { id: '1', action: 'budget_created', category: 'Groceries', amount: 500, description: 'Budget created', created_at: new Date(Date.now() - 86400000).toISOString() }
        ]);
        setLoading(false);
        return;
      }

      try {
        const [statsData, budgetsData, transactionsData, logsData] = await Promise.all([
          dashboard.getStats(),
          budgets.getAll(),
          transactions.getAll(),
          logs.getAll({ limit: 50 })
        ]);
        
        setStats(statsData);
        setBudgetList(Array.isArray(budgetsData) ? budgetsData : []);
        setTransactionList(Array.isArray(transactionsData) ? transactionsData : []);
        setActivityLogs(Array.isArray(logsData) ? logsData : []);
        setError(null);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError(err);
        const authErrorMessages = ['Unauthorized', 'Session expired', 'Invalid', 'token', 'expired'];
        const isAuthError = authErrorMessages.some(msg => 
          err.message?.toLowerCase().includes(msg.toLowerCase())
        );
        
        if (isAuthError || err.message === 'Unauthorized') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const refreshData = async () => {
    try {
      const [statsData, budgetsData, transactionsData] = await Promise.all([
        dashboard.getStats(),
        budgets.getAll(),
        transactions.getAll()
      ]);
      setStats(statsData);
      setBudgetList(Array.isArray(budgetsData) ? budgetsData : []);
      setTransactionList(Array.isArray(transactionsData) ? transactionsData : []);
    } catch (err) {
      setError(err);
    }
  };

  return {
    stats,
    transactionList,
    budgetList,
    activityLogs,
    loading,
    error,
    refreshData,
    setStats,
    setTransactionList,
    setBudgetList,
    setActivityLogs
  };
}
