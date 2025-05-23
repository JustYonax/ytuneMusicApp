import { useState, useEffect } from 'react';
import { Playlist, CreatePlaylistInput, AddVideoToPlaylistInput } from '../types/playlist';

const PLAYLISTS_STORAGE_KEY = 'ytune-playlists';

export function usePlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load playlists from localStorage on mount
  useEffect(() => {
    const loadPlaylists = () => {
      try {
        const storedPlaylists = localStorage.getItem(PLAYLISTS_STORAGE_KEY);
        if (storedPlaylists) {
          const parsedPlaylists = JSON.parse(storedPlaylists);
          // Convert string dates back to Date objects
          const playlistsWithDates = parsedPlaylists.map((playlist: any) => ({
            ...playlist,
            createdAt: new Date(playlist.createdAt),
            updatedAt: new Date(playlist.updatedAt)
          }));
          setPlaylists(playlistsWithDates);
        }
      } catch (error) {
        console.error('Error loading playlists:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlaylists();
  }, []);

  // Save playlists to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists));
    }
  }, [playlists, isLoading]);

  const createPlaylist = (input: CreatePlaylistInput) => {
    const newPlaylist: Playlist = {
      id: crypto.randomUUID(),
      name: input.name,
      description: input.description,
      videos: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setPlaylists(prev => [...prev, newPlaylist]);
    return newPlaylist;
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists(prev => prev.filter(playlist => playlist.id !== playlistId));
  };

  const addVideoToPlaylist = ({ playlistId, video }: AddVideoToPlaylistInput) => {
    setPlaylists(prev => prev.map(playlist => {
      if (playlist.id === playlistId) {
        // Check if video already exists in playlist
        if (!playlist.videos.some(v => v.id === video.id)) {
          return {
            ...playlist,
            videos: [...playlist.videos, video],
            updatedAt: new Date()
          };
        }
      }
      return playlist;
    }));
  };

  const removeVideoFromPlaylist = (playlistId: string, videoId: string) => {
    setPlaylists(prev => prev.map(playlist => {
      if (playlist.id === playlistId) {
        return {
          ...playlist,
          videos: playlist.videos.filter(video => video.id !== videoId),
          updatedAt: new Date()
        };
      }
      return playlist;
    }));
  };

  const updatePlaylist = (playlistId: string, updates: Partial<CreatePlaylistInput>) => {
    setPlaylists(prev => prev.map(playlist => {
      if (playlist.id === playlistId) {
        return {
          ...playlist,
          ...updates,
          updatedAt: new Date()
        };
      }
      return playlist;
    }));
  };

  return {
    playlists,
    isLoading,
    createPlaylist,
    deletePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    updatePlaylist
  };
} 