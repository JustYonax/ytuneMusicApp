import React, { useState } from 'react';
import { PlaylistItem, Playlist, Video } from '../types';
import { X, Plus, Trash2, Play } from 'lucide-react';

interface PlaylistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  playlists: Playlist[];
  onCreatePlaylist: (name: string) => string;
  onDeletePlaylist: (id: string) => boolean;
  onRemoveFromPlaylist: (playlistId: string, itemId: string) => void;
  onPlayItem: (videoId: string, title: string, channelTitle: string, thumbnailUrl: string) => void;
  currentVideo: Video | null;
  onAddToPlaylist: (playlistId: string, video: Video) => void;
}

const PlaylistDrawer: React.FC<PlaylistDrawerProps> = ({
  isOpen,
  onClose,
  playlists,
  onCreatePlaylist,
  onDeletePlaylist,
  onRemoveFromPlaylist,
  onPlayItem,
  currentVideo,
  onAddToPlaylist,
}) => {
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>('recently-played');

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      const id = onCreatePlaylist(newPlaylistName);
      setNewPlaylistName('');
      setActivePlaylistId(id);
    }
  };

  const handlePlayItem = (item: PlaylistItem) => {
    onPlayItem(
      item.videoId, 
      item.title, 
      item.channelTitle, 
      item.thumbnailUrl
    );
  };

  const handleAddCurrentToPlaylist = (playlistId: string) => {
    if (currentVideo) {
      onAddToPlaylist(playlistId, currentVideo);
    }
  };

  const activePlaylist = playlists.find(p => p.id === activePlaylistId) || playlists[0];

  return (
    <div className={`fixed inset-y-0 right-0 z-40 w-80 bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className="flex flex-col h-full">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold dark:text-white">Playlists</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        <div className="p-4 border-b dark:border-gray-700">
          <form onSubmit={handleCreatePlaylist} className="flex gap-2">
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="New playlist name"
              className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-md dark:text-white"
            />
            <button
              type="submit"
              disabled={!newPlaylistName.trim()}
              className="p-2 bg-purple-600 text-white rounded-md disabled:opacity-50"
            >
              <Plus size={18} />
            </button>
          </form>
        </div>
        
        <div className="overflow-hidden flex flex-col flex-1">
          <div className="p-2 border-b dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              {playlists.map(playlist => (
                <button
                  key={playlist.id}
                  onClick={() => setActivePlaylistId(playlist.id)}
                  className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                    activePlaylistId === playlist.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  {playlist.name}
                  {currentVideo && (
                    <span 
                      className="ml-1 cursor-pointer" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddCurrentToPlaylist(playlist.id);
                      }}
                      title={`Add current song to ${playlist.name}`}
                    >
                      +
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1 p-2">
            {activePlaylist?.items.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 my-8">
                No tracks in this playlist
              </p>
            ) : (
              <ul className="space-y-2">
                {activePlaylist?.items.map(item => (
                  <li 
                    key={item.id} 
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <div 
                      className="w-12 h-12 relative rounded overflow-hidden cursor-pointer"
                      onClick={() => handlePlayItem(item)}
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
                      <p className="text-sm font-medium truncate dark:text-white">{item.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.channelTitle}</p>
                    </div>
                    <button 
                      onClick={() => onRemoveFromPlaylist(activePlaylist.id, item.id)}
                      className="p-1.5 text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {activePlaylistId !== 'favorites' && activePlaylistId !== 'recently-played' && (
          <div className="p-3 border-t dark:border-gray-700">
            <button
              onClick={() => onDeletePlaylist(activePlaylistId!)}
              className="w-full py-2 text-sm text-red-500 hover:text-red-600 flex items-center justify-center gap-1"
            >
              <Trash2 size={16} />
              <span>Delete Playlist</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistDrawer;