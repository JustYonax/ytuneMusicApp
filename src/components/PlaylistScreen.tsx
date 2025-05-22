import React, { useState } from 'react';
import { List, Plus, Trash2, Play } from 'lucide-react';
import { Playlist } from '../types';

interface PlaylistScreenProps {
  playlists: Playlist[];
  onCreatePlaylist: (name: string) => string;
  onDeletePlaylist: (id: string) => boolean;
  onRemoveFromPlaylist: (playlistId: string, itemId: string) => void;
  onPlayItem: (videoId: string, title: string, channelTitle: string, thumbnailUrl: string) => void;
}

const PlaylistScreen: React.FC<PlaylistScreenProps> = ({
  playlists,
  onCreatePlaylist,
  onDeletePlaylist,
  onRemoveFromPlaylist,
  onPlayItem,
}) => {
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      const id = onCreatePlaylist(newPlaylistName);
      setNewPlaylistName('');
      const playlist = playlists.find(p => p.id === id);
      if (playlist) {
        setSelectedPlaylist(playlist);
      }
    }
  };

  const regularPlaylists = playlists.filter(p => !['offline', 'recently-played'].includes(p.id));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-3 mb-8">
        <List size={24} className="text-purple-600 dark:text-purple-400" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Your Playlists</h2>
      </div>

      <div className="mb-8">
        <form onSubmit={handleCreatePlaylist} className="flex gap-2 max-w-md">
          <input
            type="text"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            placeholder="New playlist name"
            className="flex-1 px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
          />
          <button
            type="submit"
            disabled={!newPlaylistName.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50 hover:bg-purple-700 transition-colors"
          >
            <Plus size={20} />
          </button>
        </form>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {regularPlaylists.map(playlist => (
          <div
            key={playlist.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
          >
            <div className="p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{playlist.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {playlist.items.length} songs
              </p>
            </div>

            <div className="p-4">
              {playlist.items.length > 0 ? (
                <div className="space-y-3">
                  {playlist.items.slice(0, 3).map(item => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3"
                    >
                      <div 
                        className="w-10 h-10 relative rounded overflow-hidden cursor-pointer"
                        onClick={() => onPlayItem(item.videoId, item.title, item.channelTitle, item.thumbnailUrl)}
                      >
                        <img 
                          src={item.thumbnailUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Play size={16} className="text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {item.title}
                        </p>
                      </div>
                    </div>
                  ))}
                  {playlist.items.length > 3 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      +{playlist.items.length - 3} more songs
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No songs in this playlist
                </p>
              )}
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
              <button
                onClick={() => onDeletePlaylist(playlist.id)}
                className="w-full py-2 text-sm text-red-500 hover:text-red-600 flex items-center justify-center gap-1"
              >
                <Trash2 size={16} />
                <span>Delete Playlist</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaylistScreen;