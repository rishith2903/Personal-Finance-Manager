import { useState } from 'react';

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

export function CategoryChart({ data, totalIncome = 0 }) {
  const [hoveredSegment, setHoveredSegment] = useState(null);

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
        <div className="flex flex-col items-center">
          <div className="w-64 h-64 relative">
            <svg viewBox="0 0 100 100" className="transform -rotate-0">
              {segments.map((segment, index) => (
                <g
                  key={index}
                  className="transition-all cursor-pointer"
                  onMouseEnter={() => setHoveredSegment(index)}
                  onMouseLeave={() => setHoveredSegment(null)}
                  style={{
                    opacity: hoveredSegment === null || hoveredSegment === index ? 1 : 0.5,
                    transform: hoveredSegment === index ? 'scale(1.02)' : 'scale(1)',
                    transformOrigin: '50px 50px'
                  }}
                >
                  <path
                    d={segment.path}
                    fill={segment.color}
                    stroke="white"
                    strokeWidth="0.5"
                  />
                </g>
              ))}
              <circle cx="50" cy="50" r="20" fill="white" />
              {/* Center text showing hovered category or total */}
              <text x="50" y="48" textAnchor="middle" className="text-[6px] font-bold fill-gray-700">
                {hoveredSegment !== null ? segments[hoveredSegment].category : 'Total'}
              </text>
              <text x="50" y="55" textAnchor="middle" className="text-[5px] fill-gray-500">
                ₹{hoveredSegment !== null ? segments[hoveredSegment].amount.toFixed(0) : spendingTotal.toFixed(0)}
              </text>
            </svg>

            {/* Tooltip on hover */}
            {hoveredSegment !== null && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 bg-gray-900 text-white text-xs py-2 px-3 rounded-lg shadow-lg z-10 whitespace-nowrap">
                <div className="font-semibold">{segments[hoveredSegment].category}</div>
                <div>₹{segments[hoveredSegment].amount.toFixed(2)} ({segments[hoveredSegment].percentage.toFixed(1)}%)</div>
              </div>
            )}
          </div>

          {/* Summary Display: Income, Spending, Savings */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <p className="text-xs text-gray-500">Income</p>
              <p className="text-sm font-bold text-emerald-600">₹{totalIncome.toFixed(0)}</p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <p className="text-xs text-gray-500">Spending</p>
              <p className="text-sm font-bold text-red-500">₹{spendingTotal.toFixed(0)}</p>
            </div>
            <div className={`p-2 rounded-lg ${totalIncome - spendingTotal >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
              <p className="text-xs text-gray-500">Savings</p>
              <p className={`text-sm font-bold ${totalIncome - spendingTotal >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                ₹{(totalIncome - spendingTotal).toFixed(0)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {segments.map((segment, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-2 rounded-lg transition-all cursor-pointer ${hoveredSegment === index ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
              onMouseEnter={() => setHoveredSegment(index)}
              onMouseLeave={() => setHoveredSegment(null)}
            >
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
