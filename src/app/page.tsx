'use client';

import { useState } from 'react';
import { useYoutubeSearch } from '../hooks/useYoutubeSearch';
import { SearchResults } from '../components/SearchResults';
import { PlaylistManager } from '../components/PlaylistManager';
import { Video } from '../types';

export default function Home() {
  const [query, setQuery] = useState('');
  const { isLoading, error, results, searchVideos } = useYoutubeSearch();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchVideos(query);
  };

  const handleSelectVideo = (video: Video) => {
    setSelectedVideo(video);
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">YTune Music</h1>
        
        {/* Search form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar música..."
              className="flex-1 p-2 border rounded"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Buscar
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search results */}
          <div className="lg:col-span-2">
            {error && (
              <div className="p-4 bg-red-100 text-red-700 rounded mb-4">
                {error}
              </div>
            )}
            {isLoading ? (
              <div className="text-center py-8">Cargando...</div>
            ) : (
              <SearchResults videos={results} onSelectVideo={handleSelectVideo} />
            )}
          </div>

          {/* Playlist manager */}
          <div className="lg:col-span-1">
            <PlaylistManager onSelectVideo={handleSelectVideo} />
          </div>
        </div>

        {/* Video player */}
        {selectedVideo && (
          <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedVideo.thumbnailUrl}
                    alt={selectedVideo.title}
                    className="w-20 h-15 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-semibold">{selectedVideo.title}</h3>
                    <p className="text-gray-600">{selectedVideo.channelTitle}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cerrar
                </button>
              </div>
              <div className="mt-4">
                <iframe
                  width="100%"
                  height="80"
                  src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 