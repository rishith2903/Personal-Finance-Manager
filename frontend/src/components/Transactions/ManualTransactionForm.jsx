import { useState } from 'react';
import { DollarSign, Calendar, Tag, Building2 } from 'lucide-react';
import { apiFetch } from '../../lib/api';

const CATEGORIES = {
    debit: [
        'Groceries',
        'Dining',
        'Transportation',
        'Entertainment',
        'Utilities',
        'Shopping',
        'Electronics',
        'Healthcare',
        'Fitness',
        'Education',
        'Travel',
        'Other'
    ],
    credit: [
        'Salary',
        'Freelance',
        'Investment',
        'Gift',
        'Refund',
        'Bonus',
        'Other'
    ]
};

export function ManualTransactionForm({ onTransactionAdded }) {
    const [formData, setFormData] = useState({
        amount: '',
        merchant: '',
        category: '',
        type: 'debit',
        transactionDate: new Date().toISOString().split('T')[0],
        description: '',
        balance: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };

            // Reset category when type changes
            if (name === 'type') {
                updated.category = '';
            }

            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const payload = {
                amount: parseFloat(formData.amount),
                merchant: formData.merchant,
                category: formData.category,
                type: formData.type,
                transactionDate: formData.transactionDate,
                description: formData.description || null,
                balance: formData.balance ? parseFloat(formData.balance) : null
            };

            await apiFetch('/api/transactions/manual', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            setSuccess(true);

            // Reset form
            setFormData({
                amount: '',
                merchant: '',
                category: '',
                type: 'debit',
                transactionDate: new Date().toISOString().split('T')[0],
                description: '',
                balance: ''
            });

            // Notify parent to reload transactions
            if (onTransactionAdded) {
                onTransactionAdded();
            }

            // Hide success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add transaction');
        } finally {
            setLoading(false);
        }
    };

    const categories = CATEGORIES[formData.type];

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Manual Entry</h2>
                    <p className="text-sm text-gray-600">Add transaction details manually</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">
                        ✓ Transaction added successfully!
                    </div>
                )}

                {/* Type Selection */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Transaction Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => handleChange({ target: { name: 'type', value: 'debit' } })}
                            className={`px-4 py-3 rounded-lg font-medium transition-all ${formData.type === 'debit'
                                    ? 'bg-red-100 text-red-700 ring-2 ring-red-500'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Expense (Debit)
                        </button>
                        <button
                            type="button"
                            onClick={() => handleChange({ target: { name: 'type', value: 'credit' } })}
                            className={`px-4 py-3 rounded-lg font-medium transition-all ${formData.type === 'credit'
                                    ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Income (Credit)
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Amount */}
                    <div>
                        <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">
                            Amount *
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="number"
                                id="amount"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Date */}
                    <div>
                        <label htmlFor="transactionDate" className="block text-sm font-semibold text-gray-700 mb-2">
                            Date *
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="date"
                                id="transactionDate"
                                name="transactionDate"
                                value={formData.transactionDate}
                                onChange={handleChange}
                                max={new Date().toISOString().split('T')[0]}
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Merchant */}
                    <div>
                        <label htmlFor="merchant" className="block text-sm font-semibold text-gray-700 mb-2">
                            {formData.type === 'credit' ? 'Source *' : 'Merchant *'}
                        </label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                id="merchant"
                                name="merchant"
                                value={formData.merchant}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder={formData.type === 'credit' ? 'e.g., Acme Corp' : 'e.g., Walmart'}
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                            Category *
                        </label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                            >
                                <option value="">Select category</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Description (Optional) */}
                <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                        Description (Optional)
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Add any additional notes..."
                    />
                </div>

                {/* Balance (Optional) */}
                <div>
                    <label htmlFor="balance" className="block text-sm font-semibold text-gray-700 mb-2">
                        Account Balance (Optional)
                    </label>
                    <input
                        type="number"
                        id="balance"
                        name="balance"
                        value={formData.balance}
                        onChange={handleChange}
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Current balance after this transaction"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 rounded-lg font-semibold transition-all transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${formData.type === 'credit'
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 focus:ring-emerald-500 text-white'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:ring-blue-500 text-white'
                        }`}
                >
                    {loading ? 'Adding...' : `Add ${formData.type === 'credit' ? 'Income' : 'Expense'}`}
                </button>
            </form>
        </div>
    );
}
