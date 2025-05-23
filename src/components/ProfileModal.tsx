import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  User, 
  Key, 
  MapPin, 
  Globe, 
  Twitter, 
  Instagram, 
  Youtube,
  Bell,
  Globe as Language,
  Clock,
  Heart,
  ListMusic,
  Camera,
  Upload,
  Save
} from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  profile: UserProfile | null;
  onUpdateProfile: (data: any) => Promise<void>;
  onUpdatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  email,
  profile,
  onUpdateProfile,
  onUpdatePassword
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>(profile || {});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile');
  const [musicSource, setMusicSource] = useState(profile?.preferences?.music_source || 'youtube');
  const [spotifyClientId, setSpotifyClientId] = useState(profile?.preferences?.spotify_client_id || '');
  const [youtubeApiKey, setYoutubeApiKey] = useState(profile?.preferences?.youtube_api_key || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(profile?.preferences?.notifications_enabled || true);
  const [language, setLanguage] = useState(profile?.preferences?.language || 'en');

  const handleUpdateProfile = async () => {
    try {
      setError(null);
      await onUpdateProfile(editedProfile);
      setIsEditing(false);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      setError(null);
      await onUpdatePassword(currentPassword, newPassword);
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Password updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditedProfile(prev => ({
        ...prev,
        avatar_url: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      if (editedProfile.avatar_url) {
        formData.append('avatar', new Blob([JSON.stringify(editedProfile.avatar_url)]), 'avatar.json');
      }

      const profileData = {
        ...editedProfile,
        preferences: {
          ...editedProfile.preferences,
          music_source: musicSource,
          spotify_client_id: spotifyClientId,
          youtube_api_key: youtubeApiKey,
          notifications_enabled: notificationsEnabled,
          language
        }
      };

      await onUpdateProfile(profileData);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Profile Settings
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
              title="Close modal"
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

          {/* Tabs */}
          <div className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-2 px-1 ${
                activeTab === 'profile'
                  ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`pb-2 px-1 ${
                activeTab === 'preferences'
                  ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Preferences
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`pb-2 px-1 ${
                activeTab === 'security'
                  ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Security
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                      {editedProfile.avatar_url ? (
                        <img
                          src={editedProfile.avatar_url}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <User size={40} />
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700">
                        <Camera size={16} />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                          title="Upload profile picture"
                          aria-label="Upload profile picture"
                        />
                      </label>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {profile?.username || 'User'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Member since {new Date(profile?.created_at || '').toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="space-y-4">
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
                    {isEditing ? (
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User size={18} className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={editedProfile.username || ''}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, username: e.target.value }))}
                          className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                          placeholder="Enter username"
                          title="Username"
                          aria-label="Username"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <User size={18} className="text-gray-400" />
                          <span className="text-gray-900 dark:text-white">
                            {profile?.username}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Location
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin size={18} className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={editedProfile.location || ''}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, location: e.target.value }))}
                          className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                          placeholder="Add your location"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <MapPin size={18} className="text-gray-400" />
                          <span className="text-gray-900 dark:text-white">
                            {profile?.location || 'Not specified'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Website
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Globe size={18} className="text-gray-400" />
                        </div>
                        <input
                          type="url"
                          value={editedProfile.website || ''}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, website: e.target.value }))}
                          className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                          placeholder="Add your website"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Globe size={18} className="text-gray-400" />
                          <span className="text-gray-900 dark:text-white">
                            {profile?.website || 'Not specified'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editedProfile.bio || ''}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                      rows={4}
                      placeholder="Tell us about yourself"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-gray-900 dark:text-white">
                        {profile?.bio || 'No bio yet'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Social Links
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {isEditing ? (
                      <>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Twitter size={18} className="text-gray-400" />
                          </div>
                          <input
                            type="text"
                            value={editedProfile.social_links?.twitter || ''}
                            onChange={(e) => setEditedProfile(prev => ({
                              ...prev,
                              social_links: { ...prev.social_links, twitter: e.target.value }
                            }))}
                            className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                            placeholder="Twitter username"
                          />
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Instagram size={18} className="text-gray-400" />
                          </div>
                          <input
                            type="text"
                            value={editedProfile.social_links?.instagram || ''}
                            onChange={(e) => setEditedProfile(prev => ({
                              ...prev,
                              social_links: { ...prev.social_links, instagram: e.target.value }
                            }))}
                            className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                            placeholder="Instagram username"
                          />
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Youtube size={18} className="text-gray-400" />
                          </div>
                          <input
                            type="text"
                            value={editedProfile.social_links?.youtube || ''}
                            onChange={(e) => setEditedProfile(prev => ({
                              ...prev,
                              social_links: { ...prev.social_links, youtube: e.target.value }
                            }))}
                            className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                            placeholder="YouTube channel"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <Twitter size={18} className="text-gray-400" />
                          <span className="text-gray-900 dark:text-white">
                            {profile?.social_links?.twitter || 'Not specified'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <Instagram size={18} className="text-gray-400" />
                          <span className="text-gray-900 dark:text-white">
                            {profile?.social_links?.instagram || 'Not specified'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <Youtube size={18} className="text-gray-400" />
                          <span className="text-gray-900 dark:text-white">
                            {profile?.social_links?.youtube || 'Not specified'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Stats
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <ListMusic size={18} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Playlists</p>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {profile?.stats?.playlists_created || 0}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Heart size={18} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Liked Songs</p>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {profile?.stats?.songs_liked || 0}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Clock size={18} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Playtime</p>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {profile?.stats?.total_playtime || 0} min
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit/Save Buttons */}
                <div className="flex justify-end space-x-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditedProfile(profile || {});
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Save Changes
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Music Source */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Music Source
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="youtube"
                        checked={musicSource === 'youtube'}
                        onChange={(e) => setMusicSource(e.target.value as 'youtube' | 'spotify')}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                      />
                      <span className="ml-2 text-gray-700 dark:text-gray-300">YouTube</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="spotify"
                        checked={musicSource === 'spotify'}
                        onChange={(e) => setMusicSource(e.target.value as 'youtube' | 'spotify')}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                      />
                      <span className="ml-2 text-gray-700 dark:text-gray-300">Spotify</span>
                    </label>
                  </div>
                </div>

                {musicSource === 'spotify' && (
                  <div>
                    <label htmlFor="spotify-client-id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Spotify Client ID
                    </label>
                    <input
                      type="text"
                      id="spotify-client-id"
                      value={spotifyClientId}
                      onChange={(e) => setSpotifyClientId(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Enter your Spotify Client ID"
                    />
                  </div>
                )}

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notificationsEnabled}
                      onChange={(e) => setNotificationsEnabled(e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Enable Notifications</span>
                  </label>
                </div>

                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Language
                  </label>
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordChange}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Update Password
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;