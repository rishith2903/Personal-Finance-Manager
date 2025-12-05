import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Lightbulb, TrendingUp, Calendar, RefreshCw } from 'lucide-react';
import { SpendingCharts } from '../components/Dashboard/SpendingCharts';

export function InsightsPage() {
  const { user } = useAuth();
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');

  useEffect(() => {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(month);
  }, []);

  useEffect(() => {
    if (user && selectedMonth) {
      loadInsight();
    }
  }, [user, selectedMonth]);

  const loadInsight = async () => {
    setLoading(true);

    try {
      const data = await apiFetch(`/api/insights?month=${selectedMonth}`);
      setInsight(data);
    } catch {
      setInsight(null);
    }
    setLoading(false);
  };

  const generateInsight = async () => {
    setGenerating(true);

    try {
      await apiFetch(`/api/insights?month=${selectedMonth}`, { method: 'GET' });
      await loadInsight();
    } catch (error) {
      console.error('Failed to generate insights:', error);
    } finally {
      setGenerating(false);
    }
  };

  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    return options;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Insights</h1>
          <p className="text-gray-600 mt-1">Personalized financial recommendations and analysis</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white cursor-pointer"
            >
              {generateMonthOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={generateInsight}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Generating...' : 'Generate Insights'}
          </button>
        </div>
      </div>

      {!insight ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Insights Available</h3>
          <p className="text-gray-600 mb-6">
            Generate AI-powered insights for {generateMonthOptions().find(o => o.value === selectedMonth)?.label}
          </p>
          <button
            onClick={generateInsight}
            disabled={generating}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <TrendingUp className="w-5 h-5" />
            {generating ? 'Generating...' : 'Generate Insights'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-sm p-6 text-white">
              <h3 className="text-sm font-medium opacity-90 mb-2">Total Income</h3>
              <p className="text-3xl font-bold">₹{insight.total_income.toFixed(2)}</p>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-sm p-6 text-white">
              <h3 className="text-sm font-medium opacity-90 mb-2">Total Spending</h3>
              <p className="text-3xl font-bold">₹{insight.total_spend.toFixed(2)}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-sm p-6 text-white">
              <h3 className="text-sm font-medium opacity-90 mb-2">Net Savings</h3>
              <p className="text-3xl font-bold">
                ₹{(insight.total_income - insight.total_spend).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Spending Charts */}
          <SpendingCharts />

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Lightbulb className="w-6 h-6 text-amber-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">AI Recommendations</h2>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {insight.recommendations}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Top Merchants</h2>

            <div className="space-y-4">
              {insight.top_merchants.map((merchant, index) => {
                const percentage = (merchant.amount / insight.total_spend) * 100;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-900">{merchant.merchant}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">₹{merchant.amount.toFixed(2)}</div>
                        <div className="text-sm text-gray-500">{percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Category Breakdown</h2>

            <div className="space-y-4">
              {Object.entries(insight.category_summary)
                .filter(([cat]) => cat !== 'Income')
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount], index) => {
                  const percentage = (amount / insight.total_spend) * 100;
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{category}</span>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">₹{amount.toFixed(2)}</div>
                          <div className="text-sm text-gray-500">{percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-cyan-600 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
