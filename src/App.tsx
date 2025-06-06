import React, { useState, useEffect } from 'react';
import { Music, List, Download, Home, UserCircle } from 'lucide-react';

// Components
import SearchBar from './components/SearchBar';
import VideoCard from './components/VideoCard';
import VideoPlayer from './components/VideoPlayer';
import PlaylistDrawer from './components/PlaylistDrawer';
import ThemeToggle from './components/ThemeToggle';
import GenreMenu from './components/GenreMenu';
import OfflineMusic from './components/OfflineMusic';
import PlaylistScreen from './components/PlaylistScreen';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import SubscriptionButton from './components/SubscriptionButton';

// Hooks
import { useYoutubeSearch } from './hooks/useYoutubeSearch';
import { usePlaylist } from './hooks/usePlaylist';
import { useAuth } from './hooks/useAuth';

// Types
import { Video } from './types';

function App() {
  const { 
    isLoading, 
    error, 
    results, 
    searchVideos, 
    genres, 
    selectedGenre, 
    setSelectedGenre 
  } = useYoutubeSearch();
  
  const { 
    playlists, 
    createPlaylist, 
    deletePlaylist, 
    addToPlaylist, 
    removeFromPlaylist,
    addToRecentlyPlayed
  } = usePlaylist();

  const {
    user,
    profile,
    settings,
    loading: authLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updatePassword,
    updateSettings
  } = useAuth();
  
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(-1);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [miniPlayerMode, setMiniPlayerMode] = useState(true);
  const [showOfflineMusic, setShowOfflineMusic] = useState(false);
  const [showPlaylistScreen, setShowPlaylistScreen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'home' | 'offline' | 'playlists'>('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handlePlayVideo = (video: Video) => {
    setCurrentVideo(video);
    const index = results.findIndex(v => v.id === video.id);
    setCurrentVideoIndex(index);
    addToRecentlyPlayed(video);
    setMiniPlayerMode(true);
  };

  const handleNextVideo = () => {
    if (currentVideoIndex < results.length - 1) {
      const nextVideo = results[currentVideoIndex + 1];
      setCurrentVideo(nextVideo);
      setCurrentVideoIndex(currentVideoIndex + 1);
      addToRecentlyPlayed(nextVideo);
    }
  };

  const handlePreviousVideo = () => {
    if (currentVideoIndex > 0) {
      const previousVideo = results[currentVideoIndex - 1];
      setCurrentVideo(previousVideo);
      setCurrentVideoIndex(currentVideoIndex - 1);
      addToRecentlyPlayed(previousVideo);
    }
  };

  const handleAddToFavorites = (video: Video) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    addToPlaylist('favorites', video);
  };

  const handlePlayFromPlaylist = (videoId: string, title: string, channelTitle: string, thumbnailUrl: string) => {
    const videoFromPlaylist: Video = {
      id: videoId,
      title,
      channelTitle,
      thumbnailUrl
    };
    setCurrentVideo(videoFromPlaylist);
    addToRecentlyPlayed(videoFromPlaylist);
    setMiniPlayerMode(true);
  };

  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre);
    searchVideos(genre);
  };

  const navigateTo = (screen: 'home' | 'offline' | 'playlists') => {
    if ((screen === 'playlists' || screen === 'offline') && !user) {
      setShowAuthModal(true);
      return;
    }
    setCurrentScreen(screen);
    setShowOfflineMusic(screen === 'offline');
    setShowPlaylistScreen(screen === 'playlists');
  };

  const handleAuthAction = (action: 'playlist' | 'download' | 'favorite') => {
    if (!user) {
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  const offlinePlaylist = playlists.find(p => p.id === 'offline');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 shadow-sm dark:shadow-gray-800/10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center text-purple-600 dark:text-purple-400">
              <Music size={24} />
              <h1 className="text-xl font-bold ml-2">YTune</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigateTo('home')}
              className={`p-2 rounded-full transition-colors ${
                currentScreen === 'home'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
              }`}
              title="Home"
            >
              <Home size={18} />
            </button>
            <button
              onClick={() => navigateTo('offline')}
              className={`p-2 rounded-full transition-colors ${
                currentScreen === 'offline'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
              }`}
              title="Downloaded Music"
            >
              <Download size={18} />
            </button>
            <button
              onClick={() => navigateTo('playlists')}
              className={`p-2 rounded-full transition-colors ${
                currentScreen === 'playlists'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
              }`}
              title="Playlists"
            >
              <List size={18} />
            </button>
            <ThemeToggle
              theme={settings.theme}
              onUpdateTheme={(theme) => updateSettings({ theme })}
            />
            <SubscriptionButton onAuthRequired={() => setShowAuthModal(true)} />
            {user ? (
              <button
                onClick={() => setShowProfileModal(true)}
                className="flex items-center space-x-2 px-3 py-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 transition-colors hover:bg-gray-300 dark:hover:bg-gray-700"
              >
                <UserCircle size={18} />
                <span className="text-sm font-medium">{profile?.username || 'Profile'}</span>
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-full hover:bg-purple-700 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>
      
      {/* Search Section */}
      {currentScreen === 'home' && (
        <section className="py-8 bg-gradient-to-b from-purple-600 to-indigo-700 dark:from-purple-900 dark:to-indigo-900">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-white mb-6">Find Your Favorite Music</h2>
            <div className="mx-auto max-w-xl mb-6">
              <SearchBar onSearch={searchVideos} isLoading={isLoading} />
            </div>
            <GenreMenu 
              genres={genres}
              selectedGenre={selectedGenre}
              onGenreSelect={handleGenreSelect}
            />
          </div>
        </section>
      )}
      
      {/* Main Content */}
      <main className={`container mx-auto px-4 py-8 ${currentVideo ? 'mb-24' : ''}`}>
        {currentScreen === 'offline' && offlinePlaylist && (
          <OfflineMusic
            playlist={offlinePlaylist}
            onPlay={handlePlayFromPlaylist}
            onRemove={removeFromPlaylist}
          />
        )}
        
        {currentScreen === 'playlists' && (
          <PlaylistScreen
            playlists={playlists}
            onCreatePlaylist={createPlaylist}
            onDeletePlaylist={deletePlaylist}
            onRemoveFromPlaylist={removeFromPlaylist}
            onPlayItem={handlePlayFromPlaylist}
          />
        )}
        
        {currentScreen === 'home' && (
          <>
            {error && (
              <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-lg dark:bg-red-900/30 dark:text-red-300">
                {error}
              </div>
            )}
            
            {selectedGenre && (
              <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
                {selectedGenre} Tracks
              </h2>
            )}
            
            {/* Video Grid */}
            {results.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {results.map(video => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onPlay={handlePlayVideo}
                    onAddToPlaylist={() => {
                      if (handleAuthAction('playlist')) {
                        setIsPlaylistOpen(true);
                        setCurrentVideo(video);
                      }
                    }}
                  />
                ))}
              </div>
            ) : !isLoading && !error && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No results found. Try searching for something else.
                </p>
              </div>
            )}
          </>
        )}
      </main>
      
      {/* Video Player */}
      {currentVideo && (
        <VideoPlayer
          video={currentVideo}
          onClose={() => setCurrentVideo(null)}
          onNext={currentVideoIndex < results.length - 1 ? handleNextVideo : undefined}
          onPrevious={currentVideoIndex > 0 ? handlePreviousVideo : undefined}
          onAddToFavorites={handleAddToFavorites}
          onAddToPlaylist={() => {
            if (handleAuthAction('playlist')) {
              setIsPlaylistOpen(true);
            }
          }}
          miniMode={miniPlayerMode}
          onToggleMiniMode={() => setMiniPlayerMode(!miniPlayerMode)}
        />
      )}
      
      {/* Playlist Drawer */}
      <PlaylistDrawer
        isOpen={isPlaylistOpen}
        onClose={() => setIsPlaylistOpen(false)}
        playlists={playlists}
        onCreatePlaylist={createPlaylist}
        onDeletePlaylist={deletePlaylist}
        onRemoveFromPlaylist={removeFromPlaylist}
        onPlayItem={handlePlayFromPlaylist}
        currentVideo={currentVideo}
        onAddToPlaylist={addToPlaylist}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSignIn={signIn}
        onSignUp={signUp}
      />

      {/* Profile Modal */}
      {user && (
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          email={user.email!}
          username={profile?.username || ''}
          theme={settings.theme}
          onUpdateProfile={updateProfile}
          onUpdatePassword={updatePassword}
          onUpdateTheme={(theme) => updateSettings({ theme })}
          onSignOut={signOut}
        />
      )}
    </div>
  );
}

export default App;