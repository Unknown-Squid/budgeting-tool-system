export default function BudgetCard({ budget, budgetData, onEdit }) {
  const startDate = budgetData?.startDate ? new Date(budgetData.startDate).toLocaleDateString() : null;
  const endDate = budgetData?.endDate ? new Date(budgetData.endDate).toLocaleDateString() : null;
  const percentage = parseFloat(budget.percentage || 0);
  
  const progressColor = percentage > 100 ? 'bg-red-600' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="font-semibold text-gray-900">{budget.category}</div>
          <div className="text-sm text-gray-600">
            ₱{parseFloat(budget.spent || 0).toFixed(2)} / ₱{parseFloat(budget.limit || 0).toFixed(2)}
          </div>
          {startDate && endDate && (
            <div className="text-xs text-gray-500 mt-1">
              {startDate} - {endDate}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-700 text-sm cursor-pointer"
          >
            Edit
          </button>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${progressColor}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {percentage.toFixed(1)}% used
      </div>
    </div>
  );
}
