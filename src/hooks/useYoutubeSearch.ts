import { useState, useEffect } from 'react';
import { Video } from '../types';

const API_KEYS = [
  {
    key: 'AIzaSyBxy-z9m96ravBRNwlGDH0Rh0tT8J4TjAM',
    domain: 'localhost',
    quotaUsed: 0,
    maxQuota: 10000,
    lastReset: Date.now()
  },
  {
    key: 'AIzaSyBxy-z9m96ravBRNwlGDH0Rh0tT8J4TjAM',
    domain: 'localhost',
    quotaUsed: 0,
    maxQuota: 10000,
    lastReset: Date.now()
  }
];

const CACHE_NAME = 'youtube-search-cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const SEARCH_COOLDOWN = 2000; // 2 seconds between searches
const MAX_RESULTS = 10; // Reduce number of results to save quota

// Quota management
const QUOTA_PER_REQUEST = 100; // Standard quota cost per request
const QUOTA_RESET_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const getNextAvailableKey = () => {
  const currentDomain = window.location.hostname;
  const now = Date.now();

  // Reset quotas if 24 hours have passed
  API_KEYS.forEach(key => {
    if (now - key.lastReset >= QUOTA_RESET_INTERVAL) {
      key.quotaUsed = 0;
      key.lastReset = now;
    }
  });

  // Filter keys by domain and available quota
  const availableKeys = API_KEYS.filter(key => 
    key.domain === currentDomain && 
    key.quotaUsed + QUOTA_PER_REQUEST <= key.maxQuota
  );

  if (availableKeys.length === 0) {
    throw new Error('No API keys available for this domain or quota exceeded');
  }

  // Sort by least used quota
  availableKeys.sort((a, b) => a.quotaUsed - b.quotaUsed);
  return availableKeys[0];
};

const updateKeyQuota = (key: string) => {
  const keyData = API_KEYS.find(k => k.key === key);
  if (keyData) {
    keyData.quotaUsed += QUOTA_PER_REQUEST;
  }
};

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      medium: { url: string };
    };
  };
}

const GENRES = [
  'Pop Music',
  'Rock Music',
  'Hip Hop',
  'Jazz',
  'Classical',
  'Electronic',
  'Latin Music',
  'R&B',
  'Country Music',
  'Indie Music'
];

// Mock data for demonstration purposes
function getMockVideos(): Video[] {
  return [
    {
      id: 'dQw4w9WgXcQ',
      title: 'Rick Astley - Never Gonna Give You Up',
      channelTitle: 'Rick Astley',
      thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    },
    {
      id: 'EE-xtCF3T94',
      title: 'The Weeknd - Blinding Lights',
      channelTitle: 'The Weeknd',
      thumbnailUrl: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/mqdefault.jpg',
    },
    {
      id: 'JGwWNGJdvx8',
      title: 'Ed Sheeran - Shape of You',
      channelTitle: 'Ed Sheeran',
      thumbnailUrl: 'https://i.ytimg.com/vi/JGwWNGJdvx8/mqdefault.jpg',
    },
    {
      id: 'kJQP7kiw5Fk',
      title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
      channelTitle: 'Luis Fonsi',
      thumbnailUrl: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/mqdefault.jpg',
    },
    {
      id: 'RgKAFK5djSk',
      title: 'Wiz Khalifa - See You Again ft. Charlie Puth',
      channelTitle: 'Wiz Khalifa',
      thumbnailUrl: 'https://i.ytimg.com/vi/RgKAFK5djSk/mqdefault.jpg',
    },
  ];
}

export function useYoutubeSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Video[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [lastSearchTime, setLastSearchTime] = useState(0);

  // Initialize with a random genre on mount
  useEffect(() => {
    const randomGenre = GENRES[Math.floor(Math.random() * GENRES.length)];
    searchVideos(randomGenre);
  }, []);

  const getCachedResults = async (query: string): Promise<Video[] | null> => {
    if (!('caches' in window)) return null;

    try {
      const cache = await caches.open(CACHE_NAME);
      const response = await cache.match(`youtube-cache-${query.toLowerCase()}`);
      
      if (!response) return null;
      
      const data = await response.json();
      const now = Date.now();
      
      if (now - data.timestamp > CACHE_DURATION) {
        await cache.delete(`youtube-cache-${query.toLowerCase()}`);
        return null;
      }
      
      return data.videos;
    } catch (err) {
      console.error('Error reading cache:', err);
      return null;
    }
  };

  const setCachedResults = async (query: string, videos: Video[]) => {
    if (!('caches' in window)) return;

    try {
      const cache = await caches.open(CACHE_NAME);
      const data = {
        videos,
        timestamp: Date.now()
      };
      
      await cache.put(
        `youtube-cache-${query.toLowerCase()}`,
        new Response(JSON.stringify(data))
      );
    } catch (err) {
      console.error('Error writing to cache:', err);
    }
  };

  const searchVideos = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    // Check cooldown
    const now = Date.now();
    if (now - lastSearchTime < SEARCH_COOLDOWN) {
      return;
    }
    setLastSearchTime(now);

    setIsLoading(true);
    setError(null);
    setSelectedGenre(query);

    try {
      // Check cache first
      const cachedResults = await getCachedResults(query);
      if (cachedResults) {
        setResults(cachedResults);
        setIsLoading(false);
        return;
      }

      // Get available API key
      const apiKeyData = getNextAvailableKey();
      const API_KEY = apiKeyData.key;

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${MAX_RESULTS}&q=${encodeURIComponent(
          query + ' music'
        )}&type=video&videoCategoryId=10&key=${API_KEY}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        
        if (errorData.error?.code === 403) {
          if (errorData.error?.errors?.[0]?.reason === 'quotaExceeded') {
            // Update quota usage
            updateKeyQuota(API_KEY);
            
            // Try to get cached results
            const cachedResults = await getCachedResults(query);
            if (cachedResults) {
              setResults(cachedResults);
              setError('Using cached results due to API quota limit');
            } else {
              setError('API quota exceeded. Please try again later.');
            }
          } else if (errorData.error?.errors?.[0]?.domain === 'youtube.quota') {
            setError('API quota exceeded for this domain. Please try again later.');
          } else {
            setError('Error accessing YouTube API. Please try again later.');
          }
        } else {
          setError('Error searching videos. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      
      // Update quota usage for successful request
      updateKeyQuota(API_KEY);

      const videos: Video[] = data.items.map((item: YouTubeSearchItem) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnailUrl: item.snippet.thumbnails.medium.url,
      }));

      // Cache results
      setCachedResults(query, videos);
      
      setResults(videos);
    } catch (err) {
      console.error('Error searching YouTube:', err);
      
      // Try to get any cached results, even if they're not exact matches
      const mockResults = getMockVideos().filter(video => 
        video.title.toLowerCase().includes(query.toLowerCase()) ||
        video.channelTitle.toLowerCase().includes(query.toLowerCase())
      );
      
      if (mockResults.length > 0) {
        setResults(mockResults);
      } else {
        setResults(getMockVideos()); // Fallback to all mock videos
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    isLoading, 
    error, 
    results, 
    searchVideos,
    genres: GENRES,
    selectedGenre,
    setSelectedGenre 
  };
}

