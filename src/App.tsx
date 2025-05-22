import React, { useState, useEffect } from 'react';
import { Music, List, Download } from 'lucide-react';

// Components
import SearchBar from './components/SearchBar';
import VideoCard from './components/VideoCard';
import VideoPlayer from './components/VideoPlayer';
import PlaylistDrawer from './components/PlaylistDrawer';
import ThemeToggle from './components/ThemeToggle';
import GenreMenu from './components/GenreMenu';
import OfflineMusic from './components/OfflineMusic';

// Hooks
import { useYoutubeSearch } from './hooks/useYoutubeSearch';
import { usePlaylist } from './hooks/usePlaylist';

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
  
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [miniPlayerMode, setMiniPlayerMode] = useState(false);
  const [showOfflineMusic, setShowOfflineMusic] = useState(false);

  const handlePlayVideo = (video: Video) => {
    setCurrentVideo(video);
    addToRecentlyPlayed(video);
    setMiniPlayerMode(false);
  };

  const handleAddToFavorites = (video: Video) => {
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
    setMiniPlayerMode(false);
  };

  const handleTogglePlaylistDrawer = () => {
    setIsPlaylistOpen(!isPlaylistOpen);
  };

  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre);
    searchVideos(genre);
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
              onClick={() => setShowOfflineMusic(!showOfflineMusic)}
              className={`p-2 rounded-full transition-colors ${
                showOfflineMusic 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
              }`}
              title="Downloaded Music"
            >
              <Download size={18} />
            </button>
            <ThemeToggle />
            <button 
              onClick={handleTogglePlaylistDrawer}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 transition-colors relative"
            >
              <List size={18} />
              {playlists.some(p => p.items.length > 0) && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-purple-600 rounded-full"></span>
              )}
            </button>
          </div>
        </div>
      </header>
      
      {/* Search Section */}
      {!showOfflineMusic && (
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
      <main className="container mx-auto px-4 py-8">
        {showOfflineMusic ? (
          offlinePlaylist && (
            <OfflineMusic
              playlist={offlinePlaylist}
              onPlay={handlePlayFromPlaylist}
              onRemove={removeFromPlaylist}
            />
          )
        ) : (
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
                    onAddToPlaylist={() => setIsPlaylistOpen(true) || setCurrentVideo(video)}
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
        <div className={`fixed inset-0 ${miniPlayerMode ? 'pointer-events-none' : 'bg-black bg-opacity-75'} z-50`}>
          <div className={`${
            miniPlayerMode 
              ? 'fixed bottom-4 right-4 w-80 pointer-events-auto' 
              : 'absolute inset-0 flex items-center justify-center p-4'
          }`}>
            <VideoPlayer
              video={currentVideo}
              onClose={() => setCurrentVideo(null)}
              onAddToFavorites={handleAddToFavorites}
              onAddToPlaylist={() => setIsPlaylistOpen(true)}
              miniMode={miniPlayerMode}
              onToggleMiniMode={() => setMiniPlayerMode(!miniPlayerMode)}
            />
          </div>
        </div>
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
    </div>
  );
}

export default App;