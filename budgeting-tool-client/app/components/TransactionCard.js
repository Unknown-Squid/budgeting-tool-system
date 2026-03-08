export default function TransactionCard({ transaction, onEdit }) {
  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
      <div className="flex-1">
        <div className="font-medium text-gray-900">{transaction.description}</div>
        <div className="text-sm text-gray-600">
          {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
          {transaction.type === 'income' ? '+' : '-'}₱{parseFloat(transaction.amount || 0).toFixed(2)}
        </div>
        <button
          onClick={onEdit}
          className="text-blue-600 hover:text-blue-700 text-sm cursor-pointer"
        >
          Edit
        </button>
      </div>
    </div>
  );
}
