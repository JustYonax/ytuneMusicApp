export interface Video {
  id: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
}

export interface PlaylistItem {
  id: string;
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
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
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  autoplay: boolean;
  quality: 'auto' | 'high' | 'medium' | 'low';
}