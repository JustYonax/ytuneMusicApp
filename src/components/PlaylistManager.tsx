import React, { useState } from 'react';
import { usePlaylists } from '../hooks/usePlaylists';
import { Video } from '../types';

interface PlaylistManagerProps {
  onSelectVideo: (video: Video) => void;
}

export function PlaylistManager({ onSelectVideo }: PlaylistManagerProps) {
  const { playlists, createPlaylist, deletePlaylist, addVideoToPlaylist, removeVideoFromPlaylist, updatePlaylist } = usePlaylists();
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      createPlaylist({ name: newPlaylistName.trim() });
      setNewPlaylistName('');
    }
  };

  const handleStartEdit = (playlistId: string, currentName: string) => {
    setEditingPlaylistId(playlistId);
    setEditingName(currentName);
  };

  const handleSaveEdit = (playlistId: string) => {
    if (editingName.trim()) {
      updatePlaylist(playlistId, { name: editingName.trim() });
      setEditingPlaylistId(null);
      setEditingName('');
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Mis Playlists</h2>
      
      {/* Create new playlist form */}
      <form onSubmit={handleCreatePlaylist} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            placeholder="Nombre de la nueva playlist"
            className="flex-1 p-2 border rounded"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Crear
          </button>
        </div>
      </form>

      {/* Playlists list */}
      <div className="space-y-4">
        {playlists.map((playlist) => (
          <div key={playlist.id} className="bg-white p-4 rounded shadow">
            <div className="flex items-center justify-between mb-2">
              {editingPlaylistId === playlist.id ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1 p-1 border rounded"
                    placeholder="Nuevo nombre de la playlist"
                    aria-label="Editar nombre de la playlist"
                  />
                  <button
                    onClick={() => handleSaveEdit(playlist.id)}
                    className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Guardar
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-semibold">{playlist.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStartEdit(playlist.id, playlist.name)}
                      className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deletePlaylist(playlist.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
            
            {/* Videos in playlist */}
            <div className="space-y-2">
              {playlist.videos.map((video) => (
                <div key={video.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-16 h-12 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">{video.title}</p>
                      <p className="text-sm text-gray-600">{video.channelTitle}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onSelectVideo(video)}
                      className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Reproducir
                    </button>
                    <button
                      onClick={() => removeVideoFromPlaylist(playlist.id, video.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
              {playlist.videos.length === 0 && (
                <p className="text-gray-500 text-center py-2">
                  No hay videos en esta playlist
                </p>
              )}
            </div>
          </div>
        ))}
        {playlists.length === 0 && (
          <p className="text-gray-500 text-center py-4">
            No tienes playlists. ¡Crea una nueva!
          </p>
        )}
      </div>
    </div>
  );
} 