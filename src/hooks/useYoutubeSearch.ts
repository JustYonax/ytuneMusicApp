import { useState, useEffect } from 'react';
import { Video } from '../types';

const API_KEY: string = 'AIzaSyByxwG0HJLFWsrDxIe9cepm6SKX0_yvyOE';
const CACHE_NAME = 'youtube-search-cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

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

export function useYoutubeSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Video[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

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

    setIsLoading(true);
    setError(null);
    setSelectedGenre(query);

    const cachedResults = await getCachedResults(query);
    if (cachedResults) {
      setResults(cachedResults);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(
          query + ' music'
        )}&type=video&videoCategoryId=10&key=${API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }

      const data = await response.json();
      
      const videos: Video[] = data.items.map((item: YouTubeSearchItem) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnailUrl: item.snippet.thumbnails.medium.url,
      }));

      setResults(videos);
      setCachedResults(query, videos);
    } catch (err) {
      console.error('Error searching YouTube:', err);
      setError('Failed to search YouTube. Please try again later.');
      // Use mock data as fallback
      const mockResults = getMockVideos().filter(video => 
        video.title.toLowerCase().includes(query.toLowerCase()) ||
        video.channelTitle.toLowerCase().includes(query.toLowerCase())
      );
      setResults(mockResults);
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