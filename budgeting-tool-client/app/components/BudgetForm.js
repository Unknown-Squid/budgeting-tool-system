import InputField from './InputField';

export default function BudgetForm({ 
  budget, 
  budgetList, 
  onSubmit, 
  onCancel, 
  onChange 
}) {
  const budgetData = budgetList?.find(b => b.id === budget?.id) || budget;
  const startDate = budgetData?.startDate ? new Date(budgetData.startDate) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const hasStarted = startDate && startDate <= today;

  return (
    <form onSubmit={onSubmit} className="p-4 bg-gray-50 rounded-lg space-y-3 border border-blue-200">
      <InputField
        label="Budget Title (Category)"
        type="text"
        placeholder="Budget Title (Category)"
        required
        value={budget?.category || ''}
        onChange={(e) => onChange({ ...budget, category: e.target.value })}
      />
      <InputField
        label="Amount (Limit)"
        type="number"
        placeholder="Amount (Limit)"
        required
        step="0.01"
        value={budget?.limit || ''}
        onChange={(e) => onChange({ ...budget, limit: e.target.value })}
      />
      <InputField
        label="Start Date"
        type="date"
        required
        value={budget?.startDate || ''}
        onChange={(e) => onChange({ ...budget, startDate: e.target.value })}
        disabled={hasStarted}
        title={hasStarted ? 'Start date cannot be changed after budget has started' : ''}
      />
      <InputField
        label="End Date"
        type="date"
        required
        min={budget?.startDate || undefined}
        value={budget?.endDate || ''}
        onChange={(e) => onChange({ ...budget, endDate: e.target.value })}
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
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
