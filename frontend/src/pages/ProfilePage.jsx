import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Calendar, Shield, LogOut } from 'lucide-react';

export function ProfilePage() {
    const { user, signOut } = useAuth();

    const handleLogout = async () => {
        if (confirm('Are you sure you want to logout?')) {
            await signOut();
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                <p className="text-gray-600 mt-1">Manage your account settings</p>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Header Banner */}
                <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-600" />

                {/* Profile Info */}
                <div className="relative px-6 pb-6">
                    {/* Avatar */}
                    <div className="absolute -top-12 left-6">
                        <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                            <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                                <span className="text-3xl font-bold text-white">
                                    {user?.username?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* User Details */}
                    <div className="pt-16">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {user?.username || 'User'}
                        </h2>
                        <p className="text-gray-500">{user?.email || 'No email'}</p>
                    </div>
                </div>
            </div>

            {/* Account Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Details</h3>

                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="p-3 bg-emerald-100 rounded-lg">
                            <User className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Username</p>
                            <p className="font-medium text-gray-900">{user?.username || 'Not set'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium text-gray-900">{user?.email || 'Not set'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Shield className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Account Type</p>
                            <p className="font-medium text-gray-900">
                                {user?.email === 'demo@example.com' ? 'Demo Account' : 'Standard Account'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="p-3 bg-amber-100 rounded-lg">
                            <Calendar className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Session</p>
                            <p className="font-medium text-gray-900">Auto-logout after 10 min of inactivity</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Actions</h3>

                <div className="space-y-3">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6">
                <h4 className="font-semibold text-emerald-800 mb-2">💡 Tip</h4>
                <p className="text-emerald-700 text-sm">
                    Your session will automatically end after 10 minutes of inactivity to keep your account secure.
                    Any activity like clicking, scrolling, or typing will reset the timer.
                </p>
            </div>
        </div>
    );
}
