'use client';

import { useState } from 'react';

export default function BudgetCalendar({ budgets, transactions }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  // Get previous month days to fill the calendar
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  
  // Helper to check if a date has a budget (using startDate and endDate)
  const getBudgetForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    return budgets?.find(budget => {
      if (budget.startDate && budget.endDate) {
        const start = new Date(budget.startDate);
        const end = new Date(budget.endDate);
        const checkDate = new Date(dateStr);
        
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        checkDate.setHours(0, 0, 0, 0);
        
        return checkDate >= start && checkDate <= end;
      }
      return false;
    });
  };
  
  // Get expenses for a specific date based on budget timeline
  const getExpensesForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const checkDate = new Date(dateStr);
    checkDate.setHours(0, 0, 0, 0);
    
    return transactions?.filter(t => {
      if (t.type !== 'expense') return false;
      
      // Find matching budget by category
      const matchingBudget = budgets?.find(budget => budget.category === t.category);
      
      if (matchingBudget && matchingBudget.startDate && matchingBudget.endDate) {
        const budgetStart = new Date(matchingBudget.startDate);
        const budgetEnd = new Date(matchingBudget.endDate);
        const transactionDate = new Date(t.date);
        
        budgetStart.setHours(0, 0, 0, 0);
        budgetEnd.setHours(23, 59, 59, 999);
        transactionDate.setHours(0, 0, 0, 0);
        
        // If transaction date is within budget timeline, show on transaction date
        if (transactionDate >= budgetStart && transactionDate <= budgetEnd) {
          return transactionDate.getTime() === checkDate.getTime();
        } else {
          // If transaction date is outside budget timeline, show on budget start date
          return budgetStart.getTime() === checkDate.getTime();
        }
      } else {
        // No matching budget, show on original transaction date
        const tDate = new Date(t.date);
        tDate.setHours(0, 0, 0, 0);
        return tDate.getTime() === checkDate.getTime();
      }
    }) || [];
  };
  
  // Get income for a specific date
  const getIncomeForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return transactions?.filter(t => {
      const tDate = new Date(t.date).toISOString().split('T')[0];
      return tDate === dateStr && t.type === 'income';
    }) || [];
  };
  
  // Calculate total for date
  const getTotalForDate = (date) => {
    const expenses = getExpensesForDate(date);
    const income = getIncomeForDate(date);
    const expenseTotal = expenses.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    const incomeTotal = income.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    return { expenses: expenseTotal, income: incomeTotal, net: incomeTotal - expenseTotal };
  };

  // Calculate expenses for a specific date (day by day)
  const getExpensesForDateAmount = (date, budget) => {
    if (!budget) return 0;
    const expenses = getExpensesForDate(date);
    return expenses.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  };

  // Calculate budget usage percentage for a specific date
  const getBudgetUsagePercentageForDate = (date, budget) => {
    if (!budget || !budget.limit) return 0;
    const dayExpenses = getExpensesForDateAmount(date, budget);
    const budgetLimit = parseFloat(budget.limit || 0);
    if (budgetLimit === 0) return 0;
    return Math.min((dayExpenses / budgetLimit) * 100, 100);
  };
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Build calendar days
  const calendarDays = [];
  
  // Previous month days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay - i);
    calendarDays.push({ date, isCurrentMonth: false });
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    calendarDays.push({ date, isCurrentMonth: true });
  }
  
  // Next month days to fill the grid
  const remainingDays = 42 - calendarDays.length; // 6 rows * 7 days
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    calendarDays.push({ date, isCurrentMonth: false });
  }
  
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Budget Calendar</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-900 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-900 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {monthNames[month]} {year}
        </h3>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-xs text-gray-900">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 border-2 border-blue-500 rounded"></div>
          <span>Budget</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-500 rounded"></div>
          <span>Expense</span>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {dayNames.map((day) => (
          <div key={day} className="p-2 text-center text-sm font-semibold text-gray-900">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {calendarDays.map(({ date, isCurrentMonth }, index) => {
          const budget = getBudgetForDate(date);
          const totals = getTotalForDate(date);
          const expenses = getExpensesForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          
          // Calculate expenses and percentage for this specific day
          const dayExpenses = budget ? getExpensesForDateAmount(date, budget) : totals.expenses;
          const dayPercentage = budget ? getBudgetUsagePercentageForDate(date, budget) : 0;
          
          return (
            <div
              key={index}
              className={`min-h-[80px] p-2 border rounded-lg relative overflow-hidden ${
                isCurrentMonth ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200'
              } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className={`text-sm font-medium mb-1 relative z-10 ${isCurrentMonth ? 'text-gray-900' : 'text-gray-500'}`}>
                {date.getDate()}
              </div>
              
              {/* Budget rectangle - full background (100%) */}
              {budget && (
                <>
                  {/* Full budget rectangle (blue background) */}
                  <div className="absolute inset-0 bg-blue-100 border-2 border-blue-500 rounded-lg z-0"></div>
                  
                  {/* Expense overlay rectangle (red fill based on day's percentage) */}
                  {dayPercentage > 0 && (
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-red-500 opacity-70 rounded-b-lg z-0 transition-all"
                      style={{ height: `${Math.max(dayPercentage, 1)}%` }} // Minimum 1% height for visibility
                    ></div>
                  )}
                  
                  {/* Budget category label */}
                  <div className="mb-1 relative z-10">
                    <div className="text-xs px-1 py-0.5 bg-blue-200 border border-blue-500 rounded text-gray-900 font-medium truncate">
                      {budget.category}
                    </div>
                  </div>
                  
                  {/* Expense amount and percentage for this day */}
                  {dayExpenses > 0 && (
                    <div className="mb-1 relative z-10">
                      <div className="text-xs px-1 py-0.5 bg-red-100 border border-red-500 rounded text-gray-900 font-medium">
                        -₱{dayExpenses.toFixed(0)} {dayPercentage > 0 && `(${dayPercentage.toFixed(0)}%)`}
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {/* Expenses for dates without budget */}
              {!budget && expenses.length > 0 && (
                <div className="mb-1">
                  <div className="text-xs px-1 py-0.5 bg-red-100 border border-red-500 rounded text-gray-900 font-medium">
                    -₱{dayExpenses.toFixed(0)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Active Budgets Summary */}
      {(() => {
        const currentMonthStart = new Date(year, month, 1);
        const currentMonthEnd = new Date(year, month + 1, 0);
        const activeBudgets = budgets?.filter(budget => {
          if (!budget.startDate || !budget.endDate) return false;
          const budgetStart = new Date(budget.startDate);
          const budgetEnd = new Date(budget.endDate);
          // Check if budget overlaps with current month
          return (budgetStart <= currentMonthEnd && budgetEnd >= currentMonthStart);
        }) || [];
        
        return activeBudgets.length > 0 ? (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Active Budgets This Month</h4>
            <div className="space-y-2">
              {activeBudgets.map((budget) => {
                const startDate = new Date(budget.startDate).toLocaleDateString();
                const endDate = new Date(budget.endDate).toLocaleDateString();
                return (
                  <div key={budget.id} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <span className="text-sm font-medium text-gray-900">{budget.category}</span>
                      <span className="text-xs text-gray-600 ml-2">₱{parseFloat(budget.limit || 0).toFixed(2)}</span>
                    </div>
                    <span className="text-xs text-gray-600">{startDate} - {endDate}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null;
      })()}
    </div>
  );
}
