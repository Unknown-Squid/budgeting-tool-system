export default function CSVReportTips() {
  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">How to Generate CSV Report</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Click the <strong>"Generate Report (CSV)"</strong> button in the navigation bar</li>
            <li>The report will automatically download as a CSV file</li>
            <li>Open in Excel, Google Sheets, or any spreadsheet app</li>
            <li>Use for tax purposes, financial planning, or sharing</li>
          </ol>
          <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
            <p className="text-sm text-gray-600">
              <strong>Includes:</strong> Financial Summary, Budget Progress, Category Breakdown, and Complete Transaction History
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
