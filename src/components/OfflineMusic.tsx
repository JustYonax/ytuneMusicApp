import React, { useState, useEffect } from 'react';
import { Download, Play, Trash2, Trash, Search, ArrowUpDown } from 'lucide-react';
import { Playlist } from '../types';
import { cacheManager } from '../utils/cacheManager';

interface OfflineMusicProps {
  playlist: Playlist;
  onPlay: (videoId: string, title: string, channelTitle: string, thumbnailUrl: string) => void;
  onRemove: (playlistId: string, itemId: string) => void;
}

type SortOption = 'date' | 'title' | 'artist';
type SortOrder = 'asc' | 'desc';

const OfflineMusic: React.FC<OfflineMusicProps> = ({ playlist, onPlay, onRemove }) => {
  const [cacheInfo, setCacheInfo] = useState<{ size: number; items: number; itemsList: any[] }>({ 
    size: 0, 
    items: 0,
    itemsList: []
  });
  const [isClearing, setIsClearing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    updateCacheInfo();
  }, [playlist.items.length]);

  const updateCacheInfo = async () => {
    const info = await cacheManager.getCacheInfo();
    setCacheInfo(info);
  };

  const handleClearCache = async () => {
    if (window.confirm('Are you sure you want to clear all cached music? This cannot be undone.')) {
      setIsClearing(true);
      try {
        await cacheManager.clearCache();
        // Remove all items from the offline playlist
        for (const item of playlist.items) {
          onRemove(playlist.id, item.id);
        }
        await updateCacheInfo();
      } catch (err) {
        console.error('Error clearing cache:', err);
      } finally {
        setIsClearing(false);
      }
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const filteredAndSortedItems = cacheInfo.itemsList
    .filter(item => {
      const searchLower = searchQuery.toLowerCase();
      return (
        item.video.title.toLowerCase().includes(searchLower) ||
        item.video.channelTitle.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = a.timestamp - b.timestamp;
          break;
        case 'title':
          comparison = a.video.title.localeCompare(b.video.title);
          break;
        case 'artist':
          comparison = a.video.channelTitle.localeCompare(b.video.channelTitle);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const toggleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortOrder('asc');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Download size={24} className="text-purple-600 dark:text-purple-400" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Cached Music</h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {cacheInfo.items} songs • {formatSize(cacheInfo.size)}
          </div>
          <button
            onClick={handleClearCache}
            disabled={isClearing || cacheInfo.items === 0}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm text-red-500 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Trash size={16} />
            <span>{isClearing ? 'Clearing...' : 'Clear Cache'}</span>
          </button>
        </div>
      </div>

      {/* Search and Sort Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cached songs..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
          />
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => toggleSort('date')}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              sortBy === 'date'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Date
          </button>
          <button
            onClick={() => toggleSort('title')}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              sortBy === 'title'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Title
          </button>
          <button
            onClick={() => toggleSort('artist')}
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              sortBy === 'artist'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Artist
          </button>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowUpDown size={18} className={sortOrder === 'asc' ? 'rotate-180' : ''} />
          </button>
        </div>
      </div>

      {filteredAndSortedItems.length === 0 ? (
        <div className="text-center py-12">
          <Download size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            {searchQuery ? 'No matching songs found' : 'No cached songs yet'}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {searchQuery ? 'Try a different search term' : 'Click the download button while playing a song to cache it'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAndSortedItems.map((item) => (
            <div
              key={item.video.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex items-center gap-4"
            >
              <div 
                className="w-16 h-16 relative rounded overflow-hidden cursor-pointer"
                onClick={() => onPlay(
                  item.video.id,
                  item.video.title,
                  item.video.channelTitle,
                  item.video.thumbnailUrl
                )}
              >
                <img 
                  src={item.video.thumbnailUrl} 
                  alt={item.video.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Play size={20} className="text-white" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                  {item.video.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {item.video.channelTitle}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Cached {new Date(item.timestamp).toLocaleDateString()}
                </p>
              </div>
              
              <button
                onClick={() => onRemove(playlist.id, item.video.id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Remove from cache"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OfflineMusic;