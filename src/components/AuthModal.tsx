import React, { useState } from 'react';
import { X, Mail, Lock, User, Github, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string, username: string) => Promise<void>;
  onSignInWithProvider: (provider: 'google' | 'github') => Promise<void>;
  onResetPassword: (email: string) => Promise<void>;
  verificationSent?: boolean;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSignIn,
  onSignUp,
  onSignInWithProvider,
  onResetPassword,
  verificationSent = false
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const validateForm = () => {
    if (!email) {
      setError('Please enter your email address');
      return false;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!isResetPassword) {
      if (!password) {
        setError('Please enter your password');
        return false;
      }

      if (isSignUp && !username) {
        setError('Please choose a username');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isResetPassword) {
        await onResetPassword(email);
        setSuccess('Password reset instructions have been sent to your email');
        setIsResetPassword(false);
      } else if (isSignUp) {
        await onSignUp(email, password, username);
        if (verificationSent) {
          setSuccess('Please check your email to verify your account');
        }
      } else {
        await onSignIn(email, password);
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'github') => {
    setError(null);
    setLoading(true);
    try {
      await onSignInWithProvider(provider);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    setIsResetPassword(false);
    setError(null);
    setSuccess(null);
  };

  const handleResetPassword = () => {
    setIsResetPassword(true);
    setError(null);
    setSuccess(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isResetPassword 
                ? 'Reset Password'
                : isSignUp 
                  ? 'Create Account' 
                  : 'Welcome Back'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {(error || success) && (
            <div className={`p-3 rounded-md text-sm mb-4 ${
              error 
                ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                : 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            }`}>
              {error || success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && !isResetPassword && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                    placeholder="Choose a username"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {!isResetPassword && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                    placeholder={isSignUp ? 'Create a password' : 'Enter your password'}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 size={20} className="animate-spin mr-2" />
                  Please wait...
                </div>
              ) : isResetPassword 
                ? 'Send Reset Instructions'
                : isSignUp 
                  ? 'Create Account' 
                  : 'Sign In'}
            </button>

            {!isResetPassword && (
              <div className="flex flex-col space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSocialSignIn('google')}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="ml-2">Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSocialSignIn('github')}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <Github size={20} />
                    <span className="ml-2">GitHub</span>
                  </button>
                </div>
              </div>
            )}

            <div className="text-center space-y-2">
              {!isResetPassword ? (
                <>
                  <button
                    type="button"
                    onClick={switchMode}
                    className="text-sm text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                  >
                    {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                  </button>
                  <div>
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      className="text-sm text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                    >
                      Forgot your password?
                    </button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsResetPassword(false);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="text-sm text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                >
                  Back to sign in
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;