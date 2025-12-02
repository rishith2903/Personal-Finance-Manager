import { useState } from 'react';
import { LoginForm } from '../components/Auth/LoginForm';
import { RegisterForm } from '../components/Auth/RegisterForm';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex items-center gap-12">
        <div className="hidden lg:flex flex-1 flex-col">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI-Powered<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
              Finance Manager
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Automatically track expenses, categorize transactions, and gain intelligent insights into your spending patterns.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Smart Transaction Parsing</h3>
                <p className="text-gray-600">Upload bank messages and let AI extract details automatically</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Automated Categorization</h3>
                <p className="text-gray-600">Transactions are intelligently sorted into spending categories</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Personalized Insights</h3>
                <p className="text-gray-600">Get AI-powered recommendations to optimize your spending</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          {isLogin ? (
            <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
}
