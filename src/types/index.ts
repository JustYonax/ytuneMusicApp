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