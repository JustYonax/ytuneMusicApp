import { Video } from '../types';

const CACHE_NAME = 'music-cache';
const MAX_CACHE_ITEMS = 50; // Maximum number of items to store

interface CacheItem {
  video: Video;
  timestamp: number;
  size: number;
  status: 'cached' | 'caching' | 'error';
}

export const cacheManager = {
  async addToCache(video: Video): Promise<boolean> {
    try {
      const cache = await caches.open(CACHE_NAME);
      const cacheItem: CacheItem = {
        video,
        timestamp: Date.now(),
        size: JSON.stringify(video).length,
        status: 'caching'
      };

      // Add new item to cache with initial status
      await cache.put(
        `music-${video.id}`,
        new Response(JSON.stringify(cacheItem))
      );

      // Check if we need to clean up old items
      await this.cleanupCache();

      // Update status to cached
      cacheItem.status = 'cached';
      await cache.put(
        `music-${video.id}`,
        new Response(JSON.stringify(cacheItem))
      );

      return true;
    } catch (err) {
      console.error('Error adding to cache:', err);
      // Update status to error
      try {
        const cache = await caches.open(CACHE_NAME);
        const cacheItem: CacheItem = {
          video,
          timestamp: Date.now(),
          size: JSON.stringify(video).length,
          status: 'error'
        };
        await cache.put(
          `music-${video.id}`,
          new Response(JSON.stringify(cacheItem))
        );
      } catch (updateErr) {
        console.error('Error updating cache status:', updateErr);
      }
      return false;
    }
  },

  async getFromCache(videoId: string): Promise<Video | null> {
    try {
      const cache = await caches.open(CACHE_NAME);
      const response = await cache.match(`music-${videoId}`);
      
      if (!response) return null;
      
      const data: CacheItem = await response.json();
      return data.video;
    } catch (err) {
      console.error('Error reading from cache:', err);
      return null;
    }
  },

  async getCacheStatus(videoId: string): Promise<'cached' | 'caching' | 'error' | null> {
    try {
      const cache = await caches.open(CACHE_NAME);
      const response = await cache.match(`music-${videoId}`);
      
      if (!response) return null;
      
      const data: CacheItem = await response.json();
      return data.status;
    } catch (err) {
      console.error('Error getting cache status:', err);
      return null;
    }
  },

  async removeFromCache(videoId: string): Promise<boolean> {
    try {
      const cache = await caches.open(CACHE_NAME);
      return await cache.delete(`music-${videoId}`);
    } catch (err) {
      console.error('Error removing from cache:', err);
      return false;
    }
  },

  async clearCache(): Promise<boolean> {
    try {
      await caches.delete(CACHE_NAME);
      return true;
    } catch (err) {
      console.error('Error clearing cache:', err);
      return false;
    }
  },

  async getCacheInfo(): Promise<{ size: number; items: number; itemsList: CacheItem[] }> {
    try {
      const cache = await caches.open(CACHE_NAME);
      const keys = await cache.keys();
      let totalSize = 0;
      const itemsList: CacheItem[] = [];

      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const data: CacheItem = await response.json();
          totalSize += data.size;
          itemsList.push(data);
        }
      }

      return {
        size: totalSize,
        items: keys.length,
        itemsList
      };
    } catch (err) {
      console.error('Error getting cache info:', err);
      return { size: 0, items: 0, itemsList: [] };
    }
  },

  async cleanupCache(): Promise<void> {
    try {
      const cache = await caches.open(CACHE_NAME);
      const keys = await cache.keys();
      
      if (keys.length >= MAX_CACHE_ITEMS) {
        // Get all items and sort by timestamp
        const items: { key: string; timestamp: number }[] = [];
        
        for (const request of keys) {
          const response = await cache.match(request);
          if (response) {
            const data: CacheItem = await response.json();
            items.push({
              key: request.url,
              timestamp: data.timestamp
            });
          }
        }

        // Sort by timestamp (oldest first)
        items.sort((a, b) => a.timestamp - b.timestamp);

        // Remove oldest items until we're under the limit
        const itemsToRemove = items.slice(0, items.length - MAX_CACHE_ITEMS + 1);
        for (const item of itemsToRemove) {
          await cache.delete(item.key);
        }
      }
    } catch (err) {
      console.error('Error cleaning up cache:', err);
    }
  }
}; 