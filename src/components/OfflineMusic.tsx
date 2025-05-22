import React from 'react';
import { Download, Play, Trash2 } from 'lucide-react';
import { Playlist } from '../types';

interface OfflineMusicProps {
  playlist: Playlist;
  onPlay: (videoId: string, title: string, channelTitle: string, thumbnailUrl: string) => void;
  onRemove: (playlistId: string, itemId: string) => void;
}

const OfflineMusic: React.FC<OfflineMusicProps> = ({ playlist, onPlay, onRemove }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Download size={24} className="text-purple-600 dark:text-purple-400" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Downloaded Music</h2>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {playlist.items.length} songs available offline
        </span>
      </div>

      {playlist.items.length === 0 ? (
        <div className="text-center py-12">
          <Download size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 dark:text-gray-400 mb-2">No downloaded songs yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Click the download button while playing a song to make it available offline
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {playlist.items.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex items-center gap-4"
            >
              <div 
                className="w-16 h-16 relative rounded overflow-hidden cursor-pointer"
                onClick={() => onPlay(item.videoId, item.title, item.channelTitle, item.thumbnailUrl)}
              >
                <img 
                  src={item.thumbnailUrl} 
                  alt={item.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Play size={20} className="text-white" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">{item.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{item.channelTitle}</p>
              </div>
              
              <button
                onClick={() => onRemove(playlist.id, item.id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Remove from downloads"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OfflineMusic;