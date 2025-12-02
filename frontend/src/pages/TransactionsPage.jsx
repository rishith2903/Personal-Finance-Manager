import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { TransactionUpload } from '../components/Transactions/TransactionUpload';
import { TransactionList } from '../components/Transactions/TransactionList';

export function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

  const loadTransactions = async () => {
    setLoading(true);

    try {
      const data = await apiFetch('/api/transactions');
      setTransactions(data);
    } catch (e) {
      // optionally show error toast
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-600 mt-1">Manage and track all your financial transactions</p>
      </div>

      <TransactionUpload onUploadComplete={loadTransactions} />

      <TransactionList transactions={transactions} />
    </div>
  );
}
