import React from 'react';
import { Video } from '../types';
import { Play, Plus } from 'lucide-react';

interface VideoCardProps {
  video: Video;
  onPlay: (video: Video) => void;
  onAddToPlaylist: (video: Video) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onPlay, onAddToPlaylist }) => {
  return (
    <div className="relative group overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-lg bg-white dark:bg-gray-800">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => onPlay(video)}
            className="p-3 bg-purple-600 rounded-full mr-3 transform hover:scale-110 transition-transform"
            aria-label="Play video"
          >
            <Play size={20} className="text-white" />
          </button>
          <button
            onClick={() => onAddToPlaylist(video)}
            className="p-3 bg-gray-700 rounded-full transform hover:scale-110 transition-transform"
            aria-label="Add to playlist"
          >
            <Plus size={20} className="text-white" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-sm line-clamp-2 mb-1 dark:text-white">{video.title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">{video.channelTitle}</p>
      </div>
    </div>
  );
};

export default VideoCard;