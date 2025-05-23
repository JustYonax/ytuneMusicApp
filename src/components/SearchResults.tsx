import React, { useState } from 'react';
import { Video } from '../types';
import { usePlaylists } from '../hooks/usePlaylists';

interface SearchResultsProps {
  videos: Video[];
  onSelectVideo: (video: Video) => void;
}

export function SearchResults({ videos, onSelectVideo }: SearchResultsProps) {
  const { playlists, addVideoToPlaylist } = usePlaylists();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const handleAddToPlaylist = (playlistId: string, video: Video) => {
    addVideoToPlaylist({ playlistId, video });
    setSelectedVideo(null);
  };

  return (
    <div className="space-y-4">
      {videos.map((video) => (
        <div key={video.id} className="flex items-center justify-between p-4 bg-white rounded shadow">
          <div className="flex items-center gap-4">
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-32 h-24 object-cover rounded"
            />
            <div>
              <h3 className="font-semibold">{video.title}</h3>
              <p className="text-gray-600">{video.channelTitle}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onSelectVideo(video)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Reproducir
            </button>
            <button
              onClick={() => setSelectedVideo(video)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Agregar a Playlist
            </button>
          </div>
        </div>
      ))}

      {/* Playlist selection modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Agregar a Playlist</h3>
            <p className="mb-4">{selectedVideo.title}</p>
            <div className="space-y-2">
              {playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => handleAddToPlaylist(playlist.id, selectedVideo)}
                  className="w-full p-2 text-left hover:bg-gray-100 rounded"
                >
                  {playlist.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => setSelectedVideo(null)}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 