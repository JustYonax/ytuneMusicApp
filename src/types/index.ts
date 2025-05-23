export interface Video {
  id: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
  source: 'spotify' | 'youtube';
  previewUrl?: string;
  duration?: number;
}

export interface PlaylistItem {
  id: string;
  videoId: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
  source: 'spotify' | 'youtube';
  previewUrl?: string;
  duration?: number;
}

export interface Playlist {
  id: string;
  name: string;
  items: PlaylistItem[];
}

export interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  social_links?: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  preferences?: {
    favorite_genres?: string[];
    language?: string;
    notifications_enabled?: boolean;
    music_source: 'youtube' | 'spotify';
    spotify_client_id?: string;
    youtube_api_key?: string;
  };
  stats?: {
    playlists_created: number;
    songs_liked: number;
    total_playtime: number;
  };
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  autoplay: boolean;
  quality: 'auto' | 'high' | 'medium' | 'low';
}