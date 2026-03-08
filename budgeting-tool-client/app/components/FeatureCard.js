export default function FeatureCard({ icon, title, description, iconBgColor, iconColor, graph }) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 group">
      <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <div className={`w-6 h-6 ${iconColor} animate-pulse`}>
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      {graph && (
        <div className="mt-4 h-24 flex items-end justify-center gap-2">
          {graph}
        </div>
      )}
    </div>
  );
}
