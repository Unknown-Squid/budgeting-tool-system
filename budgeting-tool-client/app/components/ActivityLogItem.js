export default function ActivityLogItem({ log }) {
  const getActionIcon = (action) => {
    const icons = {
      budget_created: { bg: 'bg-blue-100', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6', color: 'text-blue-600' },
      budget_updated: { bg: 'bg-blue-100', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', color: 'text-blue-600' },
      budget_deleted: { bg: 'bg-red-100', icon: 'M6 18L18 6M6 6l12 12', color: 'text-red-600' },
      transaction_created: { bg: 'bg-green-100', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6', color: 'text-green-600' },
      transaction_updated: { bg: 'bg-green-100', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', color: 'text-green-600' },
      transaction_deleted: { bg: 'bg-orange-100', icon: 'M6 18L18 6M6 6l12 12', color: 'text-orange-600' },
      report_generated: { bg: 'bg-purple-100', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'text-purple-600' }
    };
    
    const iconData = icons[action] || { bg: 'bg-gray-100', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-gray-600' };
    
    return (
      <div className={`w-8 h-8 ${iconData.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
        <svg className={`w-5 h-5 ${iconData.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconData.icon} />
        </svg>
      </div>
    );
  };

  const getActionLabel = (action) => {
    const labels = {
      budget_created: 'Budget Created',
      budget_updated: 'Budget Updated',
      budget_deleted: 'Budget Deleted',
      transaction_created: 'Transaction Created',
      transaction_updated: 'Transaction Updated',
      transaction_deleted: 'Transaction Deleted',
      report_generated: 'Report Generated'
    };
    return labels[action] || action;
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-3">
        {getActionIcon(log.action)}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="font-semibold text-gray-900">{getActionLabel(log.action)}</div>
            <div className="text-xs text-gray-500">
              {formatDate(log.created_at || log.createdAt)}
            </div>
          </div>
          {log.description && (
            <div className="text-sm text-gray-700 mb-2">{log.description}</div>
          )}
          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
            {log.category && (
              <div>
                <span className="font-medium">Category:</span> {log.category}
              </div>
            )}
            {log.amount && (
              <div>
                <span className="font-medium">Amount:</span> ₱{parseFloat(log.amount || 0).toFixed(2)}
              </div>
            )}
            {log.metadata && log.metadata.type && (
              <div>
                <span className="font-medium">Type:</span> {log.metadata.type}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
