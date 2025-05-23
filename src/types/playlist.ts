import { Video } from './index';

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  videos: Video[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePlaylistInput {
  name: string;
  description?: string;
}

export interface AddVideoToPlaylistInput {
  playlistId: string;
  video: Video;
} 