'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LineChart, Line } from 'recharts';
import { dashboard, budgets, transactions, auth, admin } from '../lib/api';
import BudgetCalendar from '../components/BudgetCalendar';
import CSVReportTips from '../components/CSVReportTips';
import { useDashboardData } from '../hooks/useDashboardData';
import { useAdminData } from '../hooks/useAdminData';
import { useUser } from '../hooks/useUser';
import InputField from '../components/InputField';
import StatsCard from '../components/StatsCard';
import BudgetCard from '../components/BudgetCard';
import TransactionCard from '../components/TransactionCard';
import BudgetForm from '../components/BudgetForm';
import TransactionForm from '../components/TransactionForm';
import PieChartCard from '../components/PieChartCard';
import BarChartCard from '../components/BarChartCard';
import AreaChartCard from '../components/AreaChartCard';
import ActivityLogItem from '../components/ActivityLogItem';
import { SkeletonCard, SkeletonChart, SkeletonList } from '../components/SkeletonLoader';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: userLoading, setUser } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dashboard data hook
  const {
    stats,
    transactionList,
    budgetList,
    activityLogs,
    loading: dataLoading,
    refreshData,
    setTransactionList,
    setBudgetList,
    setStats
  } = useDashboardData();
  
  // Admin data hook
  const {
    systemStats,
    users,
    totalPages,
    loading: adminLoading,
    refreshData: refreshAdminData
  } = useAdminData(userPage, searchTerm);
  
  // UI state
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editingBudget, setEditingBudget] = useState(null);
  const [newBudget, setNewBudget] = useState({ category: '', limit: '', startDate: '', endDate: '' });
  const [newTransaction, setNewTransaction] = useState({ description: '', amount: '', category: '', type: 'expense', date: new Date().toISOString().split('T')[0], budgetId: '' });
  const [snackbar, setSnackbar] = useState({ show: false, message: '' });
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Admin-specific state
  const [selectedUser, setSelectedUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', name: '', role: 'user' });
  const [editUser, setEditUser] = useState({ email: '', name: '', role: 'user', password: '' });
  
  const loading = userLoading || dataLoading || (user?.role === 'admin' && adminLoading);
  
  // Admin-specific functions
  const handleViewUser = async (userId) => {
    try {
      const [userData, statsData] = await Promise.all([
        admin.getUserById(userId),
        admin.getUserStats(userId)
      ]);
      setSelectedUser(userData);
      setUserStats(statsData);
    } catch (error) {
      setSnackbar({ show: true, message: error.message || 'Failed to load user details' });
      setTimeout(() => setSnackbar({ show: false, message: '' }), 3000);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await admin.createUser(newUser);
      setSnackbar({ show: true, message: 'User created successfully' });
      setTimeout(() => setSnackbar({ show: false, message: '' }), 3000);
      setShowCreateModal(false);
      setNewUser({ email: '', password: '', name: '', role: 'user' });
      await refreshAdminData();
    } catch (error) {
      setSnackbar({ show: true, message: error.message || 'Failed to create user' });
      setTimeout(() => setSnackbar({ show: false, message: '' }), 3000);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      const updates = {};
      if (editUser.email) updates.email = editUser.email;
      if (editUser.name) updates.name = editUser.name;
      if (editUser.role) updates.role = editUser.role;
      if (editUser.password) updates.password = editUser.password;

      await admin.updateUser(selectedUser.id, updates);
      setSnackbar({ show: true, message: 'User updated successfully' });
      setTimeout(() => setSnackbar({ show: false, message: '' }), 3000);
      setShowEditModal(false);
      setSelectedUser(null);
      await refreshAdminData();
    } catch (error) {
      setSnackbar({ show: true, message: error.message || 'Failed to update user' });
      setTimeout(() => setSnackbar({ show: false, message: '' }), 3000);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    try {
      await admin.deleteUser(userId);
      setSnackbar({ show: true, message: 'User deleted successfully' });
      setTimeout(() => setSnackbar({ show: false, message: '' }), 3000);
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(null);
        setUserStats(null);
      }
      await refreshAdminData();
    } catch (error) {
      setSnackbar({ show: true, message: error.message || 'Failed to delete user' });
      setTimeout(() => setSnackbar({ show: false, message: '' }), 3000);
    }
  };


  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  // Calculate monthly income vs expenses from transactions
  const getMonthlyIncomeVsExpenses = () => {
    if (!Array.isArray(transactionList) || transactionList.length === 0) {
      return [];
    }

    const monthlyData = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    transactionList.forEach(transaction => {
      const date = new Date(transaction.date);
      const year = date.getFullYear();
      const month = date.getMonth();
      const monthKey = `${year}-${String(month).padStart(2, '0')}`;
      const monthName = monthNames[month];
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          monthKey,
          month: monthName,
          year,
          monthIndex: month,
          income: 0,
          expenses: 0
        };
      }
      
      if (transaction.type === 'income') {
        monthlyData[monthKey].income += parseFloat(transaction.amount) || 0;
      } else if (transaction.type === 'expense') {
        monthlyData[monthKey].expenses += parseFloat(transaction.amount) || 0;
      }
    });

    // Sort by year and month, then get last 6 months
    const sortedData = Object.values(monthlyData)
      .sort((a, b) => {
        if (a.year !== b.year) {
          return a.year - b.year;
        }
        return a.monthIndex - b.monthIndex;
      })
      .slice(-6)
      .map(item => ({
        month: item.month,
        income: item.income,
        expenses: item.expenses
      }));

    return sortedData;
  };

  // Get all unique categories from transactions
  const getAllCategories = () => {
    const categories = new Set();
    if (Array.isArray(transactionList)) {
      transactionList.forEach(transaction => {
        if (transaction.category) {
          categories.add(transaction.category);
        }
      });
    }
    if (Array.isArray(budgetList)) {
      budgetList.forEach(budget => {
        if (budget.category) {
          categories.add(budget.category);
        }
      });
    }
    return Array.from(categories).sort();
  };

  // Calculate filtered stats based on selected category
  const getFilteredStats = () => {
    if (!selectedCategory || !Array.isArray(transactionList)) {
      // If no category selected, show total budget instead of total income
      const totalBudget = stats?.totalBudget || (Array.isArray(budgetList) ? budgetList.reduce((sum, budget) => sum + parseFloat(budget.limit || 0), 0) : 0);
      return {
        ...stats,
        totalIncome: totalBudget, // Use total budget instead of income for display
        totalBudget: totalBudget
      };
    }

    const filteredTransactions = transactionList.filter(t => t.category === selectedCategory);
    
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    // Get budget for this category
    const categoryBudget = budgetList.find(b => b.category === selectedCategory);
    const budgetLimit = categoryBudget ? parseFloat(categoryBudget.limit || 0) : 0;
    const budgetSpent = totalExpenses;
    const budgetRemaining = budgetLimit - budgetSpent;
    const budgetPercentage = budgetLimit > 0 ? (budgetSpent / budgetLimit) * 100 : 0;

    // For category view: Budget = Budget Limit, Balance = Budget Limit - Expenses
    return {
      totalIncome: budgetLimit, // Show budget limit
      totalExpenses,
      balance: budgetRemaining, // Balance = Budget - Expenses
      budgetLimit,
      budgetSpent,
      budgetRemaining,
      budgetPercentage
    };
  };

  // Calculate monthly budget vs expenses
  const getMonthlyBudgetVsExpenses = () => {
    if (!Array.isArray(budgetList) || !Array.isArray(transactionList)) {
      return [];
    }

    const monthlyData = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Calculate budgets per month
    budgetList.forEach(budget => {
      if (budget.startDate && budget.endDate) {
        const startDate = new Date(budget.startDate);
        const endDate = new Date(budget.endDate);
        
        // Get all months this budget covers
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth();
          const monthKey = `${year}-${String(month).padStart(2, '0')}`;
          const monthName = monthNames[month];
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
              monthKey,
              month: monthName,
              year,
              monthIndex: month,
              budget: 0,
              expenses: 0
            };
          }
          
          // Add budget limit to this month (distribute evenly across months)
          const budgetMonths = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24 * 30));
          monthlyData[monthKey].budget += parseFloat(budget.limit || 0) / Math.max(budgetMonths, 1);
          
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
      }
    });
    
    // Calculate expenses per month
    transactionList.forEach(transaction => {
      if (transaction.type === 'expense') {
        const date = new Date(transaction.date);
        const year = date.getFullYear();
        const month = date.getMonth();
        const monthKey = `${year}-${String(month).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            monthKey,
            month: monthNames[month],
            year,
            monthIndex: month,
            budget: 0,
            expenses: 0
          };
        }
        
        monthlyData[monthKey].expenses += parseFloat(transaction.amount || 0);
      }
    });

    // Sort by year and month, then get last 6 months
    const sortedData = Object.values(monthlyData)
      .sort((a, b) => {
        if (a.year !== b.year) {
          return a.year - b.year;
        }
        return a.monthIndex - b.monthIndex;
      })
      .slice(-6)
      .map(item => ({
        month: item.month,
        budget: item.budget,
        expenses: item.expenses
      }));

    return sortedData;
  };

  // Calculate pie chart data: whole pie = total budget, slices = expenses per transaction description + remaining budget
  const getBudgetPieChartData = () => {
    if (!Array.isArray(budgetList) || !Array.isArray(transactionList)) {
      return [];
    }

    // Calculate total budget
    const totalBudget = budgetList.reduce((sum, budget) => sum + parseFloat(budget.limit || 0), 0);
    
    if (totalBudget === 0) {
      return [];
    }

    // Calculate expenses per transaction description (each description is a separate slice)
    const descriptionExpenses = {};
    transactionList.forEach(transaction => {
      if (transaction.type === 'expense' && transaction.description) {
        const description = transaction.description.trim();
        if (description) {
          descriptionExpenses[description] = (descriptionExpenses[description] || 0) + parseFloat(transaction.amount || 0);
        }
      }
    });

    // Build pie chart data: each transaction description expense + remaining budget
    const pieData = [];
    
    // Add expense descriptions (each description is its own slice)
    Object.entries(descriptionExpenses).forEach(([description, amount]) => {
      if (amount > 0) {
        pieData.push({
          name: description,
          value: amount,
          type: 'expense'
        });
      }
    });

    // Calculate total expenses
    const totalExpenses = Object.values(descriptionExpenses).reduce((sum, amount) => sum + amount, 0);
    
    // Add remaining/unused budget as the final slice
    const remainingBudget = totalBudget - totalExpenses;
    if (remainingBudget > 0) {
      pieData.push({
        name: 'Remaining Budget',
        value: remainingBudget,
        type: 'remaining'
      });
    }

    return pieData;
  };

  const handleAddBudget = async (e) => {
    e.preventDefault();
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
    if (isDemoMode) {
      setNewBudget({ category: '', limit: '', startDate: '', endDate: '' });
      setShowAddBudget(false);
      setSnackbar({ show: true, message: 'Budget added successfully!' });
      setTimeout(() => setSnackbar({ show: false, message: '' }), 3000);
      return;
    }

    try {
      await budgets.create(newBudget);
      setNewBudget({ category: '', limit: '', startDate: '', endDate: '' });
      setShowAddBudget(false);
      setSnackbar({ show: true, message: 'Budget added successfully!' });
      setTimeout(() => setSnackbar({ show: false, message: '' }), 3000);
      await refreshData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
    if (isDemoMode) {
      setNewTransaction({ description: '', amount: '', category: '', type: 'expense', date: new Date().toISOString().split('T')[0], budgetId: '' });
      setShowAddTransaction(false);
      setSnackbar({ show: true, message: 'Transaction added successfully!' });
      setTimeout(() => setSnackbar({ show: false, message: '' }), 3000);
      return;
    }

    try {
      await transactions.create(newTransaction);
      setNewTransaction({ description: '', amount: '', category: '', type: 'expense', date: new Date().toISOString().split('T')[0], budgetId: '' });
      setShowAddTransaction(false);
      setSnackbar({ show: true, message: 'Transaction added successfully!' });
      setTimeout(() => setSnackbar({ show: false, message: '' }), 3000);
      await refreshData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEditBudget = async (e) => {
    e.preventDefault();
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
    if (isDemoMode) {
      console.log('Edit budget:', editingBudget);
      setEditingBudget(null);
      return;
    }

    if (!editingBudget) return;

    // Check if budget has already started - if so, don't update startDate
    const budgetData = budgetList.find(b => b.id === editingBudget.id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let updateData = {
      category: editingBudget.category,
      limit: editingBudget.limit,
      endDate: editingBudget.endDate
    };
    
    // Only update startDate if budget hasn't started yet
    if (budgetData && budgetData.startDate) {
      const startDate = new Date(budgetData.startDate);
      startDate.setHours(0, 0, 0, 0);
      
      if (startDate > today) {
        updateData.startDate = editingBudget.startDate;
      }
    } else {
      updateData.startDate = editingBudget.startDate;
    }

    try {
      await budgets.update(editingBudget.id, updateData);
      setEditingBudget(null);
      setSnackbar({ show: true, message: 'Budget updated successfully' });
      await refreshData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteBudget = async (id) => {
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
    if (isDemoMode) {
      console.log('Delete budget:', id);
      return;
    }

    if (!confirm('Delete this budget?')) return;
    try {
      await budgets.delete(id);
      await refreshData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEditTransaction = async (e) => {
    e.preventDefault();
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
    if (isDemoMode) {
      console.log('Edit transaction:', editingTransaction);
      setEditingTransaction(null);
      return;
    }

    if (!editingTransaction) return;

    try {
      await transactions.update(editingTransaction.id, {
        description: editingTransaction.description,
        amount: editingTransaction.amount
      });
      setEditingTransaction(null);
      setSnackbar({ show: true, message: 'Transaction updated successfully' });
      await refreshData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteTransaction = async (id) => {
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
    if (isDemoMode) {
      console.log('Delete transaction:', id);
      return;
    }

    if (!confirm('Delete this transaction?')) return;
    try {
      await transactions.delete(id);
      await refreshData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await auth.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      router.push('/login');
    }
  };

  const handleGenerateReport = () => {
    if (!stats || !Array.isArray(transactionList) || !transactionList.length) {
      alert('No data available to generate report');
      return;
    }

    // Filter data based on selected category
    const filteredStats = selectedCategory ? getFilteredStats() : stats;
    const filteredTransactions = selectedCategory 
      ? transactionList.filter(t => t.category === selectedCategory)
      : transactionList;
    const filteredBudgets = selectedCategory
      ? stats.budgetProgress?.filter(b => b.category === selectedCategory) || []
      : stats.budgetProgress || [];
    const filteredCategoryBreakdown = selectedCategory
      ? { [selectedCategory]: stats.categoryBreakdown?.[selectedCategory] || 0 }
      : stats.categoryBreakdown || {};

    // Calculate total budget (use totalBudget from stats if available, otherwise calculate from budgetList)
    const totalBudget = filteredStats.totalBudget || (Array.isArray(budgetList) 
      ? budgetList.reduce((sum, budget) => sum + parseFloat(budget.limit || 0), 0) 
      : 0);

    // Create CSV content
    const reportTitle = selectedCategory 
      ? `BudgetWise Financial Report - ${selectedCategory}`
      : 'BudgetWise Financial Report';
    let csvContent = `${reportTitle}\n`;
    csvContent += `Generated: ${new Date().toLocaleDateString()}\n`;
    if (selectedCategory) {
      csvContent += `Category Filter: ${selectedCategory}\n`;
    }
    csvContent += '\n';
    
    // Summary
    csvContent += 'SUMMARY\n';
    if (selectedCategory) {
      csvContent += `${selectedCategory} Budget,₱${parseFloat(filteredStats.totalIncome || 0).toFixed(2)}\n`;
      csvContent += `${selectedCategory} Expenses,₱${parseFloat(filteredStats.totalExpenses || 0).toFixed(2)}\n`;
      csvContent += `${selectedCategory} Balance,₱${parseFloat(filteredStats.balance || 0).toFixed(2)}\n`;
    } else {
      csvContent += `Total Budget,₱${totalBudget.toFixed(2)}\n`;
      csvContent += `Total Expenses,₱${parseFloat(filteredStats.totalExpenses || 0).toFixed(2)}\n`;
      csvContent += `Balance,₱${parseFloat(filteredStats.balance || 0).toFixed(2)}\n`;
    }
    csvContent += '\n';
    
    // Budget Progress
    if (filteredBudgets.length > 0) {
      csvContent += 'BUDGET PROGRESS\n';
      csvContent += 'Category,Limit,Spent,Remaining,Percentage\n';
      filteredBudgets.forEach(budget => {
        csvContent += `${budget.category},₱${parseFloat(budget.limit || 0).toFixed(2)},₱${parseFloat(budget.spent || 0).toFixed(2)},₱${parseFloat(budget.remaining || 0).toFixed(2)},${parseFloat(budget.percentage || 0).toFixed(1)}%\n`;
      });
      csvContent += '\n';
    }
    
    // Expense Breakdown by Description
    const expenseBreakdown = {};
    filteredTransactions.forEach(transaction => {
      if (transaction.type === 'expense' && transaction.description) {
        const description = transaction.description.trim();
        if (description) {
          expenseBreakdown[description] = (expenseBreakdown[description] || 0) + parseFloat(transaction.amount || 0);
        }
      }
    });
    
    if (Object.keys(expenseBreakdown).length > 0) {
      csvContent += 'EXPENSE BREAKDOWN\n';
      csvContent += 'Description,Amount\n';
      Object.entries(expenseBreakdown).forEach(([description, amount]) => {
        csvContent += `${description},₱${amount.toFixed(2)}\n`;
      });
      csvContent += '\n';
    }
    
    // Transactions
    csvContent += 'TRANSACTIONS\n';
    csvContent += 'Date,Description,Category,Type,Amount\n';
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date).toLocaleDateString();
      csvContent += `${date},${transaction.description},${transaction.category},${transaction.type},₱${parseFloat(transaction.amount || 0).toFixed(2)}\n`;
    });
    
    // Download CSV with UTF-8 BOM for proper encoding
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const fileName = selectedCategory
      ? `budgetwise-report-${selectedCategory}-${new Date().toISOString().split('T')[0]}.csv`
      : `budgetwise-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Build detailed budget and transaction breakdown for report history (use filtered data)
    const budgetDetails = filteredBudgets.map(budget => ({
      category: budget.category,
      limit: parseFloat(budget.limit || 0),
      spent: parseFloat(budget.spent || 0),
      remaining: parseFloat(budget.remaining || 0),
      percentage: parseFloat(budget.percentage || 0)
    }));

    const transactionDetails = filteredTransactions.map(transaction => {
      // Find related budget if transaction category matches a budget category
      const relatedBudget = budgetList.find(b => b.category === transaction.category);
      const budgetLimit = relatedBudget ? parseFloat(relatedBudget.limit || 0) : null;
      
      // Calculate balance: remaining budget after all expenses in this category
      let balance = null;
      if (budgetLimit !== null) {
        // Sum all expenses in this category (use filtered transactions if category is selected)
        const categoryExpenses = filteredTransactions
          .filter(t => t.category === transaction.category && t.type === 'expense')
          .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
        balance = budgetLimit - categoryExpenses;
      }
      
      return {
        description: transaction.description,
        category: transaction.category,
        type: transaction.type,
        amount: parseFloat(transaction.amount || 0),
        date: transaction.date,
        budgetLimit: budgetLimit,
        balance: balance
      };
    });

    setSnackbar({ show: true, message: 'CSV report generated and downloaded successfully!' });
    setTimeout(() => setSnackbar({ show: false, message: '' }), 3000);
  };

  const handlePrintReport = () => {
    if (!stats || !Array.isArray(transactionList) || !transactionList.length) {
      alert('No data available to generate report');
      return;
    }

    // Filter data based on selected category
    const filteredStats = selectedCategory ? getFilteredStats() : stats;
    const filteredTransactions = selectedCategory 
      ? transactionList.filter(t => t.category === selectedCategory)
      : transactionList;
    const filteredBudgets = selectedCategory
      ? stats.budgetProgress?.filter(b => b.category === selectedCategory) || []
      : stats.budgetProgress || [];

    // Calculate total budget (use totalBudget from stats if available, otherwise calculate from budgetList)
    const totalBudget = filteredStats.totalBudget || (Array.isArray(budgetList) 
      ? budgetList.reduce((sum, budget) => sum + parseFloat(budget.limit || 0), 0) 
      : 0);

    // Create printable HTML content
    const printWindow = window.open('', '_blank');
    const reportTitle = selectedCategory 
      ? `BudgetWise Financial Report - ${selectedCategory}`
      : 'BudgetWise Financial Report';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            @media print {
              @page { margin: 1cm; }
              body { margin: 0; }
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
              padding: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #3b82f6;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              margin: 0;
              color: #1e40af;
              font-size: 28px;
            }
            .header p {
              margin: 5px 0;
              color: #666;
            }
            .section {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #1e40af;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              margin-bottom: 20px;
            }
            .summary-card {
              background: #f9fafb;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #3b82f6;
            }
            .summary-label {
              font-size: 12px;
              color: #666;
              margin-bottom: 5px;
            }
            .summary-value {
              font-size: 24px;
              font-weight: bold;
              color: #1e40af;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #e5e7eb;
            }
            th {
              background: #f3f4f6;
              font-weight: bold;
              color: #374151;
            }
            tr:hover {
              background: #f9fafb;
            }
            .amount {
              text-align: right;
              font-weight: 600;
            }
            .income { color: #10b981; }
            .expense { color: #ef4444; }
            .budget-item {
              background: #eff6ff;
              padding: 12px;
              margin-bottom: 10px;
              border-radius: 6px;
              border-left: 4px solid #3b82f6;
            }
            .budget-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
            }
            .budget-category {
              font-weight: bold;
              font-size: 16px;
            }
            .budget-details {
              font-size: 14px;
              color: #666;
            }
            .progress-bar {
              width: 100%;
              height: 8px;
              background: #e5e7eb;
              border-radius: 4px;
              margin: 8px 0;
              overflow: hidden;
            }
            .progress-fill {
              height: 100%;
              background: #3b82f6;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
            .total-row {
              font-weight: bold;
              background: #f3f4f6;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>BudgetWise</h1>
            <p>${reportTitle}</p>
            <p>Generated: ${new Date().toLocaleString()}</p>
            ${selectedCategory ? `<p>Category: ${selectedCategory}</p>` : ''}
          </div>

          <div class="section">
            <div class="section-title">Financial Summary</div>
            <div class="summary-grid">
              <div class="summary-card">
                <div class="summary-label">${selectedCategory ? `${selectedCategory} Budget` : 'Total Budget'}</div>
                <div class="summary-value income">₱${selectedCategory ? parseFloat(filteredStats.totalIncome || 0).toFixed(2) : totalBudget.toFixed(2)}</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">${selectedCategory ? `${selectedCategory} Expenses` : 'Total Expenses'}</div>
                <div class="summary-value expense">₱${parseFloat(filteredStats.totalExpenses || 0).toFixed(2)}</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">${selectedCategory ? `${selectedCategory} Balance` : 'Balance'}</div>
                <div class="summary-value ${parseFloat(filteredStats.balance || 0) >= 0 ? 'income' : 'expense'}">₱${parseFloat(filteredStats.balance || 0).toFixed(2)}</div>
              </div>
            </div>
          </div>

          ${filteredBudgets.length > 0 ? `
          <div class="section">
            <div class="section-title">Budget Details</div>
            ${filteredBudgets.map(budget => `
              <div class="budget-item">
                <div class="budget-header">
                  <div class="budget-category">${budget.category}</div>
                  <div>Limit: ₱${parseFloat(budget.limit || 0).toFixed(2)}</div>
                </div>
                <div class="budget-details">
                  Spent: ₱${parseFloat(budget.spent || 0).toFixed(2)} | 
                  Remaining: ₱${parseFloat(budget.remaining || 0).toFixed(2)} | 
                  ${parseFloat(budget.percentage || 0).toFixed(1)}% used
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${Math.min(parseFloat(budget.percentage || 0), 100)}%"></div>
                </div>
              </div>
            `).join('')}
          </div>
          ` : ''}

          <div class="section">
            <div class="section-title">Transaction History</div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th class="amount">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${filteredTransactions.map(transaction => `
                  <tr>
                    <td>${new Date(transaction.date).toLocaleDateString()}</td>
                    <td>${transaction.description}</td>
                    <td>${transaction.category}</td>
                    <td>${transaction.type === 'income' ? '<span class="income">Income</span>' : '<span class="expense">Expense</span>'}</td>
                    <td class="amount ${transaction.type === 'income' ? 'income' : 'expense'}">
                      ${transaction.type === 'income' ? '+' : '-'}₱${parseFloat(transaction.amount || 0).toFixed(2)}
                    </td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="4" style="text-align: right;"><strong>Total Budget:</strong></td>
                  <td class="amount income"><strong>₱${selectedCategory ? parseFloat(filteredStats.totalIncome || 0).toFixed(2) : totalBudget.toFixed(2)}</strong></td>
                </tr>
                <tr class="total-row">
                  <td colspan="4" style="text-align: right;"><strong>Total Expenses:</strong></td>
                  <td class="amount expense"><strong>₱${filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0).toFixed(2)}</strong></td>
                </tr>
                <tr class="total-row">
                  <td colspan="4" style="text-align: right;"><strong>Net Balance:</strong></td>
                  <td class="amount ${parseFloat(filteredStats.balance || 0) >= 0 ? 'income' : 'expense'}"><strong>₱${parseFloat(filteredStats.balance || 0).toFixed(2)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          ${(() => {
            // Calculate expense breakdown by description (not category)
            const expenseBreakdown = {};
            filteredTransactions.forEach(transaction => {
              if (transaction.type === 'expense' && transaction.description) {
                const description = transaction.description.trim();
                if (description) {
                  expenseBreakdown[description] = (expenseBreakdown[description] || 0) + parseFloat(transaction.amount || 0);
                }
              }
            });
            
            return Object.keys(expenseBreakdown).length > 0 ? `
          <div class="section">
            <div class="section-title">Expense Breakdown</div>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th class="amount">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(expenseBreakdown).map(([description, amount]) => `
                  <tr>
                    <td>${description}</td>
                    <td class="amount">₱${amount.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : '';
          })()}

          <div class="footer">
            <p>This is a computer-generated report from BudgetWise</p>
            <p>Report generated on ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  // Redirect if not authenticated (unless in demo mode or still loading)
  useEffect(() => {
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
    if (!loading && !isDemoMode && !user) {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        router.push('/login');
      }
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Snackbar Notification */}
      {snackbar.show && (
        <div className="fixed top-4 right-4 z-50 transform transition-all duration-300 ease-out translate-x-0 opacity-100">
          <div className="bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md">
            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium flex-1">{snackbar.message}</span>
            <button
              onClick={() => setSnackbar({ show: false, message: '' })}
              className="ml-2 text-white hover:text-gray-200 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">BudgetWise</h1>
            <div className="flex items-center gap-4">
              {user?.role !== 'admin' && activeTab === 'dashboard' && (
                <>
                  <button
                    onClick={handleGenerateReport}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Generate CSV
                  </button>
                  <button
                    onClick={handlePrintReport}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Report
                  </button>
                </>
              )}
              {user?.role !== 'admin' && activeTab === 'reports' && (
                <button
                  onClick={handlePrintReport}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Report
                </button>
              )}
              {user?.role === 'admin' && activeTab === 'user-management' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium cursor-pointer"
                >
                  Create User
                </button>
              )}
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="flex space-x-8" aria-label="Tabs">
            {user?.role === 'admin' ? (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('user-management')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                    activeTab === 'user-management'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    User Management
                  </div>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('budgets')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                    activeTab === 'budgets'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Budgets
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                    activeTab === 'transactions'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Transactions
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                    activeTab === 'reports'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Reports
                  </div>
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Admin Dashboard Tab Content */}
        {user?.role === 'admin' && activeTab === 'dashboard' && (
          <>
            {/* System Stats Cards */}
            {systemStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="text-sm text-gray-600 mb-1">Total Registered Users</div>
                  <div className="text-2xl font-bold text-gray-900">{systemStats.totalUsers}</div>
                  <div className="text-xs text-gray-500 mt-1">All time (excluding admins)</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="text-sm text-gray-600 mb-1">Active Sessions</div>
                  <div className="text-2xl font-bold text-gray-900">{systemStats.totalActiveSessions || 0}</div>
                  <div className="text-xs text-gray-500 mt-1">Total active sessions (excluding admins)</div>
                  {systemStats.sessionsBreakdown && systemStats.sessionsBreakdown.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-600 font-medium mb-1">Sessions by user:</div>
                      <div className="space-y-1">
                        {systemStats.sessionsBreakdown.map((user) => (
                          <div key={user.userId} className="text-xs text-gray-500 flex justify-between">
                            <span>{user.userName}</span>
                            <span className="font-medium">{user.sessionCount} session{user.sessionCount !== 1 ? 's' : ''}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* User Streaks Table */}
            {systemStats?.usersWithStreaks && (
              <div className="bg-white rounded-xl shadow p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">User Activity Streaks</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Current Streak</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Highest Streak</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        // Filter out admins and find the highest streak
                        const filteredUsers = systemStats.usersWithStreaks.filter((user) => user.role !== 'admin');
                        const maxHighestStreak = filteredUsers.length > 0 
                          ? Math.max(...filteredUsers.map(u => u.highestStreak))
                          : 0;
                        
                        return filteredUsers.map((user) => {
                          const isHighest = user.highestStreak === maxHighestStreak && user.highestStreak > 0;
                          return (
                            <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div className="font-medium text-gray-900">{user.name}</div>
                              </td>
                            <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                            <td className="py-3 px-4 text-center">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                {user.currentStreak} days
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                {user.highestStreak} days
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {isHighest && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  🏆 Highest Streak
                                </span>
                              )}
                              {!isHighest && user.currentStreak > 0 && (
                                <span className="text-xs text-gray-500">Active</span>
                              )}
                              {user.currentStreak === 0 && (
                                <span className="text-xs text-gray-400">Inactive</span>
                              )}
                            </td>
                          </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Charts Section */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Monthly Registrations Chart */}
              {systemStats?.monthlyRegistrations && (
                <div className="bg-white rounded-xl shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Users Registered Per Month</h2>
                  {systemStats.monthlyRegistrations.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={systemStats.monthlyRegistrations}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="month" 
                          angle={-45} 
                          textAnchor="end" 
                          height={80}
                          interval={0}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          name="New Users"
                          dot={{ fill: '#3b82f6', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center text-gray-500 py-12">No registration data available</div>
                  )}
                </div>
              )}

              {/* Expense Category Breakdown Chart */}
              {systemStats?.expenseCategoryBreakdown && (
                <div className="bg-white rounded-xl shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Expense Categories (All Users)</h2>
                  {systemStats.expenseCategoryBreakdown.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={systemStats.expenseCategoryBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="amount"
                        >
                          {systemStats.expenseCategoryBreakdown.map((entry, index) => {
                            const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}
                        </Pie>
                        <Tooltip formatter={(value) => `₱${parseFloat(value).toFixed(2)}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center text-gray-500 py-12">No expense data available</div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* User Management Tab Content */}
        {user?.role === 'admin' && activeTab === 'user-management' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Users List */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Users</h2>
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setUserPage(1);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  />
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewUser(u.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{u.name}</div>
                        <div className="text-sm text-gray-600">{u.email}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          u.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {u.role}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(u);
                            setEditUser({ email: u.email, name: u.name, role: u.role, password: '' });
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-700 text-sm cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUser(u.id);
                          }}
                          className="text-red-600 hover:text-red-700 text-sm cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                  <button
                    onClick={() => setUserPage(p => Math.max(1, p - 1))}
                    disabled={userPage === 1}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-gray-600">Page {userPage} of {totalPages}</span>
                  <button
                    onClick={() => setUserPage(p => Math.min(totalPages, p + 1))}
                    disabled={userPage === totalPages}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* User Details */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
              </div>
              {selectedUser ? (
                <div className="p-4">
                  <div className="mb-4">
                    <div className="text-sm text-gray-600">Name</div>
                    <div className="font-semibold text-gray-900">{selectedUser.name}</div>
                  </div>
                  <div className="mb-4">
                    <div className="text-sm text-gray-600">Email</div>
                    <div className="text-gray-900">{selectedUser.email}</div>
                  </div>
                  <div className="mb-4">
                    <div className="text-sm text-gray-600">Role</div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      selectedUser.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedUser.role}
                    </span>
                  </div>
                  {userStats && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-2">Statistics</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Budgets:</span>
                          <span className="text-gray-900">{userStats.budgetCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Transactions:</span>
                          <span className="text-gray-900">{userStats.transactionCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Income:</span>
                          <span className="text-green-600">₱{userStats.totalIncome.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Expenses:</span>
                          <span className="text-red-600">₱{userStats.totalExpenses.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Balance:</span>
                          <span className={`font-semibold ${userStats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ₱{userStats.balance.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  Select a user to view details
                </div>
              )}
            </div>
          </div>
        )}

        {/* Regular User Dashboard Tab Content */}
        {user?.role !== 'admin' && activeTab === 'dashboard' && (
          <>
        {/* Quick Guide and CSV Report Tips Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Quick Guide Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Guide: How to Add Income</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Click the <strong>"+ Add Transaction"</strong> button in the Recent Transactions section</li>
                  <li>Fill in the description (e.g., "Salary", "Freelance Work")</li>
                  <li>Enter the amount you received</li>
                  <li>Select a category (e.g., "Salary", "Income", "Business")</li>
                  <li>Make sure <strong>"Income"</strong> is selected in the Type dropdown</li>
                  <li>Select the date when you received the income</li>
                  <li>Click <strong>"Save"</strong> to add your income transaction</li>
                </ol>
                <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600">
                    <strong>Tip:</strong> Income transactions will appear in green and will be added to your Total Income. 
                    You can generate a CSV report anytime using the "Generate Report (CSV)" button in the navigation bar.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CSV Report Tips */}
          <CSVReportTips />
        </div>

        {/* Stats Cards */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Financial Overview</h2>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">All Categories</option>
              {getAllCategories().map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : (
            (() => {
              const filteredStats = getFilteredStats();
              return (
                <div className="grid md:grid-cols-3 gap-6">
                  <StatsCard
                    label={selectedCategory ? `${selectedCategory} Budget` : 'Total Budget'}
                    value={filteredStats?.totalIncome || 0}
                    color="green"
                    formatCurrency={true}
                    rounded="xl"
                    subtitle={!selectedCategory ? 'Total budget from all budgets' : undefined}
                  />
                  <StatsCard
                    label={selectedCategory ? `${selectedCategory} Expenses` : 'Total Expenses'}
                    value={filteredStats?.totalExpenses || 0}
                    color="red"
                    formatCurrency={true}
                    rounded="xl"
                    subtitle={selectedCategory && filteredStats?.budgetLimit > 0 ? `Spent: ₱${parseFloat(filteredStats.budgetSpent || 0).toFixed(2)} / ₱${parseFloat(filteredStats.budgetLimit || 0).toFixed(2)}` : undefined}
                  />
                  <StatsCard
                    label={selectedCategory ? `${selectedCategory} Balance` : 'Balance'}
                    value={filteredStats?.balance || 0}
                    color={(parseFloat(filteredStats?.balance || 0)) >= 0 ? 'green' : 'red'}
                    formatCurrency={true}
                    rounded="xl"
                    subtitle={selectedCategory && filteredStats?.budgetLimit > 0 ? `Remaining: ₱${parseFloat(filteredStats.budgetRemaining || 0).toFixed(2)} (${parseFloat(filteredStats.budgetPercentage || 0).toFixed(1)}% used)` : undefined}
                  />
                </div>
              );
            })()
          )}
        </div>

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {loading ? (
            <>
              <SkeletonChart />
              <SkeletonChart />
            </>
          ) : (
            <>
              <PieChartCard
                title="Budget Allocation"
                data={getBudgetPieChartData()}
                totalBudget={budgetList.reduce((sum, budget) => sum + parseFloat(budget.limit || 0), 0)}
                transactionList={transactionList}
              />
              <BarChartCard
                title="Budget Progress"
                data={stats?.budgetProgress?.map(b => ({
                  category: b.category,
                  spent: parseFloat(b.spent || 0),
                  limit: parseFloat(b.limit || 0)
                })) || []}
              />
            </>
          )}
        </div>

        {loading ? (
          <SkeletonChart />
        ) : (
          <AreaChartCard
            title="Budget vs Expenses"
            data={(() => {
              const monthlyData = getMonthlyBudgetVsExpenses();
              const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
              return isDemoMode 
                ? [
                    { month: 'Jan', budget: 1200, expenses: 2800 },
                    { month: 'Feb', budget: 1200, expenses: 3100 },
                    { month: 'Mar', budget: 1200, expenses: 3200 },
                    { month: 'Apr', budget: 1200, expenses: 2900 },
                    { month: 'May', budget: 1200, expenses: 3500 },
                    { month: 'Jun', budget: 1200, expenses: 3200 }
                  ]
                : monthlyData;
            })()}
          />
        )}

        {/* Budget Calendar */}
        <div className="mb-8">
          <BudgetCalendar budgets={budgetList} transactions={transactionList} />
        </div>
          </>
        )}

        {/* Budgets Tab Content */}
        {activeTab === 'budgets' && (
          <>
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">All Budgets</h2>
            <button
              onClick={() => setShowAddBudget(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium cursor-pointer"
            >
              + Add Budget
            </button>
          </div>

          {showAddBudget && (
            <form onSubmit={handleAddBudget} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
              <input
                type="text"
                placeholder="Category"
                required
                value={newBudget.category}
                onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-500"
              />
              <input
                type="number"
                placeholder="Limit"
                required
                step="0.01"
                value={newBudget.limit}
                onChange={(e) => setNewBudget({ ...newBudget, limit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-500"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={newBudget.startDate}
                  onChange={(e) => {
                    const startDate = e.target.value;
                    setNewBudget({ ...newBudget, startDate });
                    // Auto-set end date to 1 month from start if end date is empty
                    if (startDate && !newBudget.endDate) {
                      const endDate = new Date(startDate);
                      endDate.setMonth(endDate.getMonth() + 1);
                      setNewBudget({ ...newBudget, startDate, endDate: endDate.toISOString().split('T')[0] });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  required
                  min={newBudget.startDate || undefined}
                  value={newBudget.endDate}
                  onChange={(e) => setNewBudget({ ...newBudget, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                />
                {newBudget.startDate && newBudget.endDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    Budget period: {new Date(newBudget.startDate).toLocaleDateString()} - {new Date(newBudget.endDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddBudget(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <SkeletonList />
          ) : (
            <div className="space-y-4">
              {stats?.budgetProgress?.map((budget) => {
                const budgetData = budgetList.find(b => b.id === budget.id) || budget;
                return (
                  <div key={budget.id}>
                    {editingBudget?.id === budget.id ? (
                      <BudgetForm
                        budget={editingBudget}
                        budgetList={budgetList}
                        onSubmit={handleEditBudget}
                        onCancel={() => setEditingBudget(null)}
                        onChange={setEditingBudget}
                      />
                    ) : (
                      <BudgetCard
                        budget={budget}
                        budgetData={budgetData}
                        onEdit={() => {
                          const budgetData = budgetList.find(b => b.id === budget.id) || budget;
                          setEditingBudget({ 
                            id: budget.id, 
                            category: budget.category, 
                            limit: budget.limit,
                            startDate: budgetData.startDate || '',
                            endDate: budgetData.endDate || ''
                          });
                        }}
                      />
                    )}
                  </div>
                );
              })}
              {(!stats?.budgetProgress || stats.budgetProgress.length === 0) && (
                <div className="text-center text-gray-500 py-8">No budgets yet. Create one to get started!</div>
              )}
            </div>
          )}
        </div>
          </>
        )}

        {/* Transactions Tab Content */}
        {activeTab === 'transactions' && (
          <>
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">All Transactions</h2>
            <button
              onClick={() => setShowAddTransaction(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium cursor-pointer"
            >
              + Add Transaction
            </button>
          </div>

          {showAddTransaction && (
            <form onSubmit={handleAddTransaction} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
              <input
                type="text"
                placeholder="Description"
                required
                value={newTransaction.description}
                onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-500"
              />
              <input
                type="number"
                placeholder="Amount"
                required
                step="0.01"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-500"
              />
              <select
                value={newTransaction.type}
                onChange={(e) => {
                  const newType = e.target.value;
                  setNewTransaction({ 
                    ...newTransaction, 
                    type: newType,
                    budgetId: newType === 'income' ? '' : newTransaction.budgetId // Clear budget if switching to income
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              {newTransaction.type === 'expense' && budgetList.length > 0 && (
                <div>
                  <select
                    value={newTransaction.budgetId}
                    onChange={(e) => {
                      const selectedBudgetId = e.target.value;
                      const selectedBudget = budgetList.find(b => b.id === selectedBudgetId);
                      setNewTransaction({ 
                        ...newTransaction, 
                        budgetId: selectedBudgetId,
                        category: selectedBudget ? selectedBudget.category : newTransaction.category
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  >
                    <option value="">Select a budget (optional)</option>
                    {budgetList.map((budget) => (
                      <option key={budget.id} value={budget.id}>
                        {budget.category} (₱{parseFloat(budget.limit || 0).toFixed(2)})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Selecting a budget will auto-fill the category. This expense will decrease that budget's remaining amount.
                  </p>
                </div>
              )}
              <input
                type="text"
                placeholder="Category"
                required
                value={newTransaction.category}
                onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder:text-gray-500"
              />
              <input
                type="date"
                value={newTransaction.date}
                onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddTransaction(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <SkeletonList />
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {Array.isArray(transactionList) && transactionList.map((transaction) => (
                <div key={transaction.id}>
                  {editingTransaction?.id === transaction.id ? (
                    <TransactionForm
                      transaction={editingTransaction}
                      onSubmit={handleEditTransaction}
                      onCancel={() => setEditingTransaction(null)}
                      onChange={setEditingTransaction}
                    />
                  ) : (
                    <TransactionCard
                      transaction={transaction}
                      onEdit={() => setEditingTransaction({ id: transaction.id, description: transaction.description, amount: transaction.amount })}
                    />
                  )}
                </div>
              ))}
              {(!Array.isArray(transactionList) || transactionList.length === 0) && (
                <div className="text-center text-gray-500 py-8">No transactions yet. Add one to get started!</div>
              )}
            </div>
          )}
        </div>
          </>
        )}

        {/* Reports Tab Content */}
        {activeTab === 'reports' && (
          <>
        {/* Activity Logs Section */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Activity Logs</h2>
            </div>
          </div>
          
          {loading ? (
            <SkeletonList />
          ) : activityLogs.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activityLogs.map((log) => (
                <ActivityLogItem key={log.id} log={log} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500">No activity logs yet</p>
              <p className="text-sm text-gray-400 mt-1">Your activities will appear here</p>
            </div>
          )}
        </div>
          </>
        )}

      </main>

      {/* Create User Modal (Admin Only) */}
      {user?.role === 'admin' && showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                required
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
              />
              <input
                type="email"
                placeholder="Email"
                required
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
              />
              <input
                type="password"
                placeholder="Password"
                required
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal (Admin Only) */}
      {user?.role === 'admin' && showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit User</h2>
            <form onSubmit={handleEditUser} className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                required
                value={editUser.name}
                onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
              />
              <input
                type="email"
                placeholder="Email"
                required
                value={editUser.email}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
              />
              <input
                type="password"
                placeholder="New Password (leave blank to keep current)"
                value={editUser.password}
                onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
              />
              <select
                value={editUser.role}
                onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
