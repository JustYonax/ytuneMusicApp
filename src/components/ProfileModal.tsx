import React, { useState } from 'react';
import { X, Mail, User, Key, Settings, LogOut, Moon, Sun, Monitor } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  username: string | null;
  theme: 'light' | 'dark' | 'system';
  onUpdateProfile: (updates: { username: string }) => Promise<void>;
  onUpdatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  onUpdateTheme: (theme: 'light' | 'dark' | 'system') => void;
  onSignOut: () => Promise<void>;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  email,
  username,
  theme,
  onUpdateProfile,
  onUpdatePassword,
  onUpdateTheme,
  onSignOut
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'appearance'>('profile');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(username || '');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUpdateUsername = async () => {
    try {
      setError(null);
      await onUpdateProfile({ username: newUsername });
      setIsEditingUsername(false);
      setSuccess('Username updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update username');
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    try {
      setError(null);
      await onUpdatePassword(currentPassword, newPassword);
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setSuccess('Password updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
    }
  };

  const handleSignOut = async () => {
    try {
      await onSignOut();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign out');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Account Settings
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

          <div className="flex border-b dark:border-gray-700 mb-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 -mb-px text-sm font-medium ${
                activeTab === 'profile'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 -mb-px text-sm font-medium ${
                activeTab === 'security'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab('appearance')}
              className={`px-4 py-2 -mb-px text-sm font-medium ${
                activeTab === 'appearance'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Appearance
            </button>
          </div>

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Mail size={18} className="text-gray-400" />
                  <span className="text-gray-900 dark:text-white">{email}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username
                </label>
                {isEditingUsername ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleUpdateUsername}
                        className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingUsername(false);
                          setNewUsername(username || '');
                        }}
                        className="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <User size={18} className="text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{username}</span>
                    </div>
                    <button
                      onClick={() => setIsEditingUsername(true)}
                      className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                {isChangingPassword ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Current password"
                        className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password"
                        className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleUpdatePassword}
                        className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Update Password
                      </button>
                      <button
                        onClick={() => {
                          setIsChangingPassword(false);
                          setCurrentPassword('');
                          setNewPassword('');
                        }}
                        className="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Key size={18} className="text-gray-400" />
                      <span className="text-gray-900 dark:text-white">••••••••</span>
                    </div>
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => onUpdateTheme('light')}
                    className={`flex flex-col items-center p-3 rounded-lg border ${
                      theme === 'light'
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Sun size={24} className={theme === 'light' ? 'text-purple-600' : 'text-gray-400'} />
                    <span className={`mt-2 text-sm ${
                      theme === 'light'
                        ? 'text-purple-600 font-medium'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      Light
                    </span>
                  </button>
                  <button
                    onClick={() => onUpdateTheme('dark')}
                    className={`flex flex-col items-center p-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Moon size={24} className={theme === 'dark' ? 'text-purple-600' : 'text-gray-400'} />
                    <span className={`mt-2 text-sm ${
                      theme === 'dark'
                        ? 'text-purple-600 font-medium'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      Dark
                    </span>
                  </button>
                  <button
                    onClick={() => onUpdateTheme('system')}
                    className={`flex flex-col items-center p-3 rounded-lg border ${
                      theme === 'system'
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Monitor size={24} className={theme === 'system' ? 'text-purple-600' : 'text-gray-400'} />
                    <span className={`mt-2 text-sm ${
                      theme === 'system'
                        ? 'text-purple-600 font-medium'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      System
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t dark:border-gray-700">
            <button
              onClick={handleSignOut}
              className="w-full py-2 px-4 flex items-center justify-center space-x-2 text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 transition-colors"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;