import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { StatCard } from '../components/Dashboard/StatCard';
import { CategoryChart } from '../components/Dashboard/CategoryChart';
import { RecentTransactions } from '../components/Dashboard/RecentTransactions';
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);

    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const startDate = `${month}-01`;
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split('T')[0];

    try {
      const txData = await apiFetch(`/api/transactions?from=${startDate}&to=${endDate}`);
      setTransactions(txData || []);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    }

    try {
      const insightData = await apiFetch(`/api/insights?month=${month}`);
      setInsight(insightData || null);
    } catch (err) {
      console.error("Failed to fetch insights:", err);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const totalSpend = insight?.total_spend || 0;
  const totalIncome = insight?.total_income || 0;
  const savings = totalIncome - totalSpend;
  const savingsRate = totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your financial activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Income"
          value={`₹${totalIncome.toFixed(2)}`}
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
        />
        <StatCard
          title="Total Spending"
          value={`₹${totalSpend.toFixed(2)}`}
          icon={TrendingDown}
          gradient="bg-gradient-to-br from-red-500 to-pink-600"
        />
        <StatCard
          title="Net Savings"
          value={`₹${savings.toFixed(2)}`}
          icon={PiggyBank}
          gradient="bg-gradient-to-br from-blue-500 to-cyan-600"
          trend={{
            value: `${savingsRate}%`,
            positive: savings >= 0,
          }}
        />
        <StatCard
          title="Transactions"
          value={transactions.length.toString()}
          icon={Wallet}
          gradient="bg-gradient-to-br from-orange-500 to-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart data={insight?.category_summary || {}} />
        <RecentTransactions transactions={transactions} />
      </div>
    </div>
  );
}
