import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SkeletonChart } from './SkeletonLoader';

export default function AreaChartCard({ title, data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">{title}</h2>
        <div className="text-center text-gray-500 py-12">No data available</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">{title}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => `₱${value.toFixed(2)}`} />
          <Legend />
          <Area type="monotone" dataKey="budget" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Budget" />
          <Area type="monotone" dataKey="expenses" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Expenses" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
