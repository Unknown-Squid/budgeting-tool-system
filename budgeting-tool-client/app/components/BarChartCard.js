import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SkeletonChart } from './SkeletonLoader';

export default function BarChartCard({ title, data }) {
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
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip formatter={(value) => `₱${value.toFixed(2)}`} />
          <Legend />
          <Bar dataKey="spent" fill="#ef4444" name="Spent" />
          <Bar dataKey="limit" fill="#e5e7eb" name="Budget Limit" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
