
const COLORS = [
  'rgb(16, 185, 129)',
  'rgb(59, 130, 246)',
  'rgb(249, 115, 22)',
  'rgb(236, 72, 153)',
  'rgb(139, 92, 246)',
  'rgb(245, 158, 11)',
  'rgb(20, 184, 166)',
  'rgb(239, 68, 68)',
];

// Categories that represent income, not spending
const INCOME_CATEGORIES = ['Income', 'Salary', 'Freelance', 'Bonus', 'Refund', 'Cashback'];

export function CategoryChart({ data }) {
  // Filter out income categories to show only spending
  const spendingEntries = Object.entries(data)
    .filter(([cat]) => !INCOME_CATEGORIES.includes(cat))
    .sort(([, a], [, b]) => b - a);

  const spendingTotal = spendingEntries.reduce((sum, [, val]) => sum + val, 0);

  if (spendingEntries.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
        <div className="flex items-center justify-center h-64 text-gray-400">
          No spending data available
        </div>
      </div>
    );
  }

  let currentAngle = -90;
  const segments = spendingEntries.map(([category, amount], index) => {
    const percentage = (amount / spendingTotal) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (currentAngle * Math.PI) / 180;

    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    const path = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return {
      category,
      amount,
      percentage,
      path,
      color: COLORS[index % COLORS.length],
    };
  });

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Spending by Category</h3>

      <div className="flex flex-col lg:flex-row items-center gap-8">
        <div className="w-64 h-64 relative">
          <svg viewBox="0 0 100 100" className="transform -rotate-0">
            {segments.map((segment, index) => (
              <g key={index} className="hover:opacity-80 transition-opacity cursor-pointer">
                <path
                  d={segment.path}
                  fill={segment.color}
                  stroke="white"
                  strokeWidth="0.5"
                />
              </g>
            ))}
            <circle cx="50" cy="50" r="20" fill="white" />
          </svg>
        </div>

        <div className="flex-1 space-y-3">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-sm font-medium text-gray-700">{segment.category}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">
                  ₹{segment.amount.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">
                  {segment.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
