export default function StatsCard({ label, value, color = 'gray', subtitle, formatCurrency = false, className = '', rounded = 'lg' }) {
  const colorClasses = {
    green: 'text-green-600',
    red: 'text-red-600',
    blue: 'text-blue-600',
    gray: 'text-gray-900'
  };

  const roundedClass = rounded === 'xl' ? 'rounded-xl' : 'rounded-lg';
  const textSize = formatCurrency ? 'text-3xl' : 'text-2xl';

  const displayValue = formatCurrency 
    ? `₱${parseFloat(value || 0).toFixed(2)}`
    : value;

  return (
    <div className={`bg-white ${roundedClass} shadow p-4 ${className}`}>
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className={`${textSize} font-bold ${colorClasses[color]}`}>
        {displayValue}
      </div>
      {subtitle && (
        <div className="text-xs text-gray-500 mt-2">{subtitle}</div>
      )}
    </div>
  );
}
