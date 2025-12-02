import { ArrowDownRight, ArrowUpRight } from 'lucide-react';


export function RecentTransactions({ transactions }) {
  const recent = transactions.slice(0, 5);

  if (recent.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
        <div className="flex items-center justify-center h-32 text-gray-400">
          No transactions yet
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>

      <div className="space-y-4">
        {recent.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                transaction.type === 'credit'
                  ? 'bg-emerald-100'
                  : 'bg-red-100'
              }`}>
                {transaction.type === 'credit' ? (
                  <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                ) : (
                  <ArrowDownRight className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">{transaction.merchant}</p>
                <p className="text-sm text-gray-500">
                  {new Date(transaction.transactionDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className={`font-semibold ${
                transaction.type === 'credit'
                  ? 'text-emerald-600'
                  : 'text-gray-900'
              }`}>
                {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">{transaction.category}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
