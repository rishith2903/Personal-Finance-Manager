import PropTypes from 'prop-types';

export function StatCard({ title, value, icon: Icon, trend, gradient }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${gradient}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`text-sm font-semibold ${trend.positive ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend.positive ? '+' : ''}{trend.value}
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  trend: PropTypes.shape({
    value: PropTypes.string.isRequired,
    positive: PropTypes.bool.isRequired,
  }),
  gradient: PropTypes.string.isRequired,
};
