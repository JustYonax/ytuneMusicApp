import { useState, useEffect } from 'react';
import { Playlist, PlaylistItem, Video } from '../types';

export function usePlaylist() {
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem('yt-music-playlists');
    return saved ? JSON.parse(saved) : [
      {
        id: 'favorites',
        name: 'Favorites',
        items: []
      },
      {
        id: 'recently-played',
        name: 'Recently Played',
        items: []
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('yt-music-playlists', JSON.stringify(playlists));
  }, [playlists]);

  const createPlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      items: []
    };
    setPlaylists([...playlists, newPlaylist]);
    return newPlaylist.id;
  };

  const deletePlaylist = (playlistId: string) => {
    // Don't allow deleting the special playlists
    if (playlistId === 'favorites' || playlistId === 'recently-played') {
      return false;
    }
    setPlaylists(playlists.filter(p => p.id !== playlistId));
    return true;
  };

  const addToPlaylist = (playlistId: string, video: Video) => {
    setPlaylists(playlists.map(playlist => {
      if (playlist.id === playlistId) {
        // Check if video already exists in playlist
        const exists = playlist.items.some(item => item.videoId === video.id);
        if (!exists) {
          const newItem: PlaylistItem = {
            id: Date.now().toString(),
            videoId: video.id,
            title: video.title,
            channelTitle: video.channelTitle,
            thumbnailUrl: video.thumbnailUrl
          };
          return {
            ...playlist,
            items: [...playlist.items, newItem]
          };
        }
      }
      return playlist;
    }));
  };

  const removeFromPlaylist = (playlistId: string, itemId: string) => {
    setPlaylists(playlists.map(playlist => {
      if (playlist.id === playlistId) {
        return {
          ...playlist,
          items: playlist.items.filter(item => item.id !== itemId)
        };
      }
      return playlist;
    }));
  };

  const addToRecentlyPlayed = (video: Video) => {
    setPlaylists(playlists.map(playlist => {
      if (playlist.id === 'recently-played') {
        // Check if video already exists in recently played
        const existingIndex = playlist.items.findIndex(item => item.videoId === video.id);
        
        // Create a new array for the updated items
        let updatedItems;
        
        if (existingIndex !== -1) {
          // Remove the existing entry
          updatedItems = playlist.items.filter(item => item.videoId !== video.id);
        } else {
          updatedItems = [...playlist.items];
        }
        
        // Add the video to the beginning of the list
        const newItem: PlaylistItem = {
          id: Date.now().toString(),
          videoId: video.id,
          title: video.title,
          channelTitle: video.channelTitle,
          thumbnailUrl: video.thumbnailUrl
        };
        
        // Limit to 20 most recent
        updatedItems = [newItem, ...updatedItems].slice(0, 20);
        
        return {
          ...playlist,
          items: updatedItems
        };
      }
      return playlist;
    }));
  };

  return {
    playlists,
    createPlaylist,
    deletePlaylist,
    addToPlaylist,
    removeFromPlaylist,
    addToRecentlyPlayed
  };
}