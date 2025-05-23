import { useState } from 'react';
import { useAuth } from './useAuth';

// API Keys configuration
const YOUTUBE_API_KEY = 'AIzaSyBxy-z9m96ravBRNwlGDH0Rh0tT8J4TjAM';

// Cache configuration
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const SEARCH_COOLDOWN = 2000; // 2 seconds between searches

interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
  source: 'spotify' | 'youtube';
  previewUrl?: string;
  duration?: number;
}

interface SpotifyToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    images: Array<{ url: string }>;
  };
  preview_url: string;
  duration_ms: number;
}

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
  };
}

interface YoutubeSearchItem {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
  };
}

interface YoutubeSearchResponse {
  items: YoutubeSearchItem[];
}

const searchYoutube = async (query: string): Promise<MusicTrack[]> => {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=10&key=${YOUTUBE_API_KEY}`
  );

  if (!response.ok) {
    throw new Error('Failed to search YouTube');
  }

  const data: YoutubeSearchResponse = await response.json();
  return data.items.map(item => ({
    id: item.id.videoId,
    title: item.snippet.title,
    artist: item.snippet.channelTitle,
    thumbnailUrl: item.snippet.thumbnails.high.url,
    source: 'youtube' as const
  }));
};

const searchSpotify = async (query: string, clientId: string): Promise<MusicTrack[]> => {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${clientId}:`)}`
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    throw new Error('Failed to authenticate with Spotify');
  }

  const tokenData: SpotifyToken = await response.json();
  const token = tokenData.access_token;

  const searchResponse = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (!searchResponse.ok) {
    throw new Error('Failed to search Spotify');
  }

  const data: SpotifySearchResponse = await searchResponse.json();
  return data.tracks.items.map(track => ({
    id: track.id,
    title: track.name,
    artist: track.artists[0].name,
    thumbnailUrl: track.album.images[0]?.url || '',
    source: 'spotify' as const,
    previewUrl: track.preview_url,
    duration: track.duration_ms / 1000
  }));
};

export const useMusicSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<MusicTrack[]>([]);
  const [lastSearchTime, setLastSearchTime] = useState(0);
  const { profile } = useAuth();

  const searchMusic = async (query: string) => {
    if (!query.trim()) return;

    // Check cooldown
    const now = Date.now();
    if (now - lastSearchTime < SEARCH_COOLDOWN) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setLastSearchTime(now);

    try {
      // Check cache first
      const cacheKey = `search-${query}`;
      const cachedResults = localStorage.getItem(cacheKey);
      if (cachedResults) {
        const { results: cached, timestamp } = JSON.parse(cachedResults);
        if (now - timestamp < CACHE_DURATION) {
          setResults(cached);
          setIsLoading(false);
          return;
        }
      }

      let searchResults: MusicTrack[];

      // Only use Spotify if user is logged in, has chosen Spotify, and has provided a client ID
      if (profile?.preferences?.music_source === 'spotify' && profile?.preferences?.spotify_client_id) {
        try {
          searchResults = await searchSpotify(query, profile.preferences.spotify_client_id);
        } catch (spotifyError) {
          console.error('Spotify search failed, falling back to YouTube:', spotifyError);
          searchResults = await searchYoutube(query);
        }
      } else {
        // Default to YouTube
        searchResults = await searchYoutube(query);
      }

      // Cache results
      localStorage.setItem(cacheKey, JSON.stringify({
        results: searchResults,
        timestamp: now
      }));

      setResults(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search music');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    results,
    searchMusic
  };
}; 