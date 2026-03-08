import InputField from './InputField';

export default function TransactionForm({ 
  transaction, 
  onSubmit, 
  onCancel, 
  onChange 
}) {
  return (
    <form onSubmit={onSubmit} className="p-4 bg-gray-50 rounded-lg space-y-3 border border-blue-200">
      <InputField
        label="Description"
        type="text"
        placeholder="Description"
        required
        value={transaction?.description || ''}
        onChange={(e) => onChange({ ...transaction, description: e.target.value })}
      />
      <InputField
        label="Amount"
        type="number"
        placeholder="Amount"
        required
        step="0.01"
        value={transaction?.amount || ''}
        onChange={(e) => onChange({ ...transaction, amount: e.target.value })}
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
