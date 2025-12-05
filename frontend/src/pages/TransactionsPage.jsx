import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { TransactionUpload } from '../components/Transactions/TransactionUpload';
import { ManualTransactionForm } from '../components/Transactions/ManualTransactionForm';
import { TransactionList } from '../components/Transactions/TransactionList';

export function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'ai'

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

      {/* Tab Switcher */}
      <div className="bg-gray-100 p-1 rounded-lg inline-flex">
        <button
          onClick={() => setActiveTab('manual')}
          className={`px-6 py-2 rounded-md font-medium transition-all ${activeTab === 'manual'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Manual Entry
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-6 py-2 rounded-md font-medium transition-all ${activeTab === 'ai'
            ? 'bg-white text-emerald-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          AI Upload
        </button>
      </div>

      {/* Conditional Rendering */}
      {activeTab === 'manual' ? (
        <ManualTransactionForm onTransactionAdded={loadTransactions} />
      ) : (
        <TransactionUpload onUploadComplete={loadTransactions} />
      )}

      <TransactionList
        transactions={transactions}
        onDelete={(id) => setTransactions(prev => prev.filter(t => t.id !== id))}
      />
    </div>
  );
}
