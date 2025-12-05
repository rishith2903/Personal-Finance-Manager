import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { BarChart3, TrendingUp } from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function SpendingCharts() {
    const [monthlyData, setMonthlyData] = useState([]);
    const [yearlyData, setYearlyData] = useState({ current: 0, previous: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSpendingData();
    }, []);

    const loadSpendingData = async () => {
        setLoading(true);
        try {
            // Get all transactions (no date filter)
            const transactions = await apiFetch('/api/transactions');

            // Process monthly spending data (last 6 months)
            const now = new Date();
            const monthlySpending = [];

            for (let i = 5; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                const monthLabel = MONTHS[date.getMonth()];

                const monthSpend = transactions
                    .filter(t => {
                        const txDate = new Date(t.transactionDate);
                        return txDate.getFullYear() === date.getFullYear() &&
                            txDate.getMonth() === date.getMonth() &&
                            t.type === 'debit';
                    })
                    .reduce((sum, t) => sum + t.amount, 0);

                monthlySpending.push({ month: monthLabel, amount: monthSpend, key: monthKey });
            }

            setMonthlyData(monthlySpending);

            // Process yearly spending data
            const currentYear = now.getFullYear();
            const previousYear = currentYear - 1;

            const currentYearSpend = transactions
                .filter(t => new Date(t.transactionDate).getFullYear() === currentYear && t.type === 'debit')
                .reduce((sum, t) => sum + t.amount, 0);

            const previousYearSpend = transactions
                .filter(t => new Date(t.transactionDate).getFullYear() === previousYear && t.type === 'debit')
                .reduce((sum, t) => sum + t.amount, 0);

            setYearlyData({
                current: currentYearSpend,
                previous: previousYearSpend,
                currentYear,
                previousYear
            });

        } catch (err) {
            console.error('Failed to load spending data:', err);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 h-80 animate-pulse bg-gray-100" />
                <div className="bg-white rounded-xl shadow-sm p-6 h-80 animate-pulse bg-gray-100" />
            </div>
        );
    }

    const maxMonthlySpend = Math.max(...monthlyData.map(d => d.amount), 1);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Spending Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Monthly Spending</h3>
                </div>

                <div className="h-56">
                    <div className="flex items-end justify-between h-48 gap-2">
                        {monthlyData.map((data, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                <div
                                    className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg transition-all duration-500 hover:from-blue-600 hover:to-cyan-500 cursor-pointer relative group min-h-[4px]"
                                    style={{ height: `${Math.max((data.amount / maxMonthlySpend) * 100, 2)}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        ₹{data.amount.toFixed(0)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-3">
                        {monthlyData.map((data, index) => (
                            <div key={index} className="flex-1 text-center text-xs text-gray-500 font-medium">
                                {data.month}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Yearly Comparison */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Yearly Comparison</h3>
                </div>

                <div className="space-y-6">
                    {/* Current Year */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">{yearlyData.currentYear}</span>
                            <span className="text-lg font-bold text-gray-900">₹{yearlyData.current.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                                className="bg-gradient-to-r from-emerald-500 to-teal-600 h-4 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min((yearlyData.current / Math.max(yearlyData.current, yearlyData.previous, 1)) * 100, 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Previous Year */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">{yearlyData.previousYear}</span>
                            <span className="text-lg font-bold text-gray-900">₹{yearlyData.previous.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                                className="bg-gradient-to-r from-gray-400 to-gray-500 h-4 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min((yearlyData.previous / Math.max(yearlyData.current, yearlyData.previous, 1)) * 100, 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Comparison */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Year-over-Year Change</span>
                            {yearlyData.previous > 0 ? (
                                <span className={`text-sm font-semibold ${yearlyData.current > yearlyData.previous ? 'text-red-600' : 'text-emerald-600'
                                    }`}>
                                    {yearlyData.current > yearlyData.previous ? '+' : ''}
                                    {(((yearlyData.current - yearlyData.previous) / yearlyData.previous) * 100).toFixed(1)}%
                                </span>
                            ) : (
                                <span className="text-sm text-gray-500">No previous data</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
