export default function UserDetails({ user, stats }) {
  if (!user) {
    return (
      <div className="p-4 text-center text-gray-500">
        Select a user to view details
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <div className="text-sm text-gray-600">Name</div>
        <div className="font-semibold text-gray-900">{user.name}</div>
      </div>
      <div className="mb-4">
        <div className="text-sm text-gray-600">Email</div>
        <div className="text-gray-900">{user.email}</div>
      </div>
      <div className="mb-4">
        <div className="text-sm text-gray-600">Role</div>
        <span className={`px-2 py-1 text-xs rounded ${
          user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {user.role}
        </span>
      </div>
      {stats && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Statistics</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Budgets:</span>
              <span className="text-gray-900">{stats.budgetCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Transactions:</span>
              <span className="text-gray-900">{stats.transactionCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Income:</span>
              <span className="text-green-600">₱{stats.totalIncome.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Expenses:</span>
              <span className="text-red-600">₱{stats.totalExpenses.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Balance:</span>
              <span className={`font-semibold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₱{stats.balance.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
