import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SkeletonChart } from './SkeletonLoader';

export default function PieChartCard({ title, data, totalBudget, transactionList }) {
  if (!data || data.length === 0 || !totalBudget || totalBudget === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">{title}</h2>
        <div className="text-center text-gray-500 py-12">No budget data available</div>
      </div>
    );
  }

  const expenseColors = ['#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6', '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#6366f1', '#f43f5e', '#0ea5e9', '#a855f7', '#22c55e', '#eab308', '#06b6d4'];
  const pieDataWithColors = data.map((entry, index) => {
    const color = entry.type === 'remaining' 
      ? '#10b981'
      : expenseColors[index % expenseColors.length];
    return { ...entry, color };
  });

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">{title}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieDataWithColors}
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {pieDataWithColors.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                const percentage = ((data.value / totalBudget) * 100).toFixed(1);
                const isRemaining = data.type === 'remaining';
                
                let transactionCount = 0;
                let category = '';
                if (!isRemaining) {
                  const matchingTransactions = transactionList?.filter(
                    t => t.type === 'expense' && t.description && t.description.trim() === data.name
                  ) || [];
                  transactionCount = matchingTransactions.length;
                  if (matchingTransactions.length > 0) {
                    category = matchingTransactions[0].category || '';
                  }
                }
                
                return (
                  <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                    <div className="font-semibold text-gray-900 mb-2">{data.name}</div>
                    <div className="space-y-1 text-sm">
                      {category && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium text-gray-900">{category}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium text-gray-900">₱{data.value.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Percentage:</span>
                        <span className="font-medium text-gray-900">{percentage}%</span>
                      </div>
                      {!isRemaining && transactionCount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Transactions:</span>
                          <span className="font-medium text-gray-900">{transactionCount}</span>
                        </div>
                      )}
                      {isRemaining && (
                        <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                          Unused budget remaining
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => value}
            iconType="square"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
