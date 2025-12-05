import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { BarChart3, TrendingUp, ArrowDownRight, ArrowUpRight } from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function SpendingCharts() {
    const [monthlyData, setMonthlyData] = useState([]);
    const [incomeVsExpense, setIncomeVsExpense] = useState({ income: 0, expense: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSpendingData();
    }, []);

    const loadSpendingData = async () => {
        setLoading(true);
        try {
            // Get all transactions (no date filter)
            const transactions = await apiFetch('/api/transactions');

            // Process monthly spending data (last 6 months) - showing both income and expense
            const now = new Date();
            const monthlyStats = [];

            for (let i = 5; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthLabel = MONTHS[date.getMonth()];

                const monthTransactions = transactions.filter(t => {
                    const txDate = new Date(t.transactionDate);
                    return txDate.getFullYear() === date.getFullYear() &&
                        txDate.getMonth() === date.getMonth();
                });

                const monthIncome = monthTransactions
                    .filter(t => t.type === 'credit')
                    .reduce((sum, t) => sum + t.amount, 0);

                const monthExpense = monthTransactions
                    .filter(t => t.type === 'debit')
                    .reduce((sum, t) => sum + t.amount, 0);

                monthlyStats.push({
                    month: monthLabel,
                    income: monthIncome,
                    expense: monthExpense,
                    hasData: monthIncome > 0 || monthExpense > 0
                });
            }

            setMonthlyData(monthlyStats);

            // Calculate total income vs expense for current month
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            const currentMonthTransactions = transactions.filter(t => {
                const txDate = new Date(t.transactionDate);
                return txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth;
            });

            const totalIncome = currentMonthTransactions
                .filter(t => t.type === 'credit')
                .reduce((sum, t) => sum + t.amount, 0);

            const totalExpense = currentMonthTransactions
                .filter(t => t.type === 'debit')
                .reduce((sum, t) => sum + t.amount, 0);

            setIncomeVsExpense({ income: totalIncome, expense: totalExpense });

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

    const maxAmount = Math.max(
        ...monthlyData.map(d => Math.max(d.income, d.expense)),
        1
    );

    const total = incomeVsExpense.income + incomeVsExpense.expense;
    const incomePercent = total > 0 ? (incomeVsExpense.income / total) * 100 : 50;
    const expensePercent = total > 0 ? (incomeVsExpense.expense / total) * 100 : 50;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Income vs Expense Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Monthly Overview</h3>
                </div>

                {/* Legend */}
                <div className="flex gap-4 mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded" />
                        <span className="text-xs text-gray-600">Income</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-400 rounded" />
                        <span className="text-xs text-gray-600">Expense</span>
                    </div>
                </div>

                <div className="h-48">
                    <div className="flex items-end justify-between h-40 gap-1">
                        {monthlyData.map((data, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full flex gap-0.5 items-end h-full">
                                    {/* Income Bar */}
                                    <div
                                        className="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t transition-all duration-500 hover:from-emerald-600 hover:to-emerald-500 cursor-pointer relative group"
                                        style={{ height: data.income > 0 ? `${Math.max((data.income / maxAmount) * 100, 5)}%` : '4px' }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            +₹{data.income.toFixed(0)}
                                        </div>
                                    </div>
                                    {/* Expense Bar */}
                                    <div
                                        className="flex-1 bg-gradient-to-t from-red-400 to-red-300 rounded-t transition-all duration-500 hover:from-red-500 hover:to-red-400 cursor-pointer relative group"
                                        style={{ height: data.expense > 0 ? `${Math.max((data.expense / maxAmount) * 100, 5)}%` : '4px' }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            -₹{data.expense.toFixed(0)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2">
                        {monthlyData.map((data, index) => (
                            <div key={index} className="flex-1 text-center text-xs text-gray-500 font-medium">
                                {data.month}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Income vs Expense This Month */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">This Month's Balance</h3>
                </div>

                <div className="space-y-6">
                    {/* Income */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm font-medium text-gray-700">Income</span>
                            </div>
                            <span className="text-lg font-bold text-emerald-600">+₹{incomeVsExpense.income.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${incomePercent}%` }}
                            />
                        </div>
                    </div>

                    {/* Expense */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ArrowDownRight className="w-4 h-4 text-red-500" />
                                <span className="text-sm font-medium text-gray-700">Expense</span>
                            </div>
                            <span className="text-lg font-bold text-red-500">-₹{incomeVsExpense.expense.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-gradient-to-r from-red-400 to-pink-500 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${expensePercent}%` }}
                            />
                        </div>
                    </div>

                    {/* Net Savings */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Net Savings</span>
                            <span className={`text-xl font-bold ${incomeVsExpense.income - incomeVsExpense.expense >= 0
                                    ? 'text-emerald-600'
                                    : 'text-red-600'
                                }`}>
                                {incomeVsExpense.income - incomeVsExpense.expense >= 0 ? '+' : ''}
                                ₹{(incomeVsExpense.income - incomeVsExpense.expense).toFixed(2)}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {incomeVsExpense.income - incomeVsExpense.expense >= 0
                                ? "Great! You're saving money this month."
                                : "You're spending more than you earn this month."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
