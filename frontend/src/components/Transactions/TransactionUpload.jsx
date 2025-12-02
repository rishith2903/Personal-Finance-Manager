import { useState } from 'react';
import { Upload, Plus } from 'lucide-react';
import { apiFetch } from '../../lib/api';


export function TransactionUpload({ onUploadComplete }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError('');

    try {
      await apiFetch('/api/transactions/process', {
        method: 'POST',
        body: JSON.stringify({ rawMessage: message }),
      });

      setMessage('');
      onUploadComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-100 rounded-lg">
          <Upload className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Add Transaction</h2>
          <p className="text-sm text-gray-600">Paste your bank SMS or transaction message</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
            Transaction Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
            placeholder="Example: Rs. 850 debited from your account at Swiggy on 22-10-2025. Available balance: Rs. 15,430"
            required
          />
          <p className="mt-2 text-xs text-gray-500">
            The AI will automatically extract amount, merchant, date, and categorize the transaction.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {loading ? 'Processing...' : 'Add Transaction'}
        </button>
      </form>
    </div>
  );
}
