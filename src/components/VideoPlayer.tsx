import React, { useState, useEffect, useRef } from 'react';
import { Video } from '../types';
import { 
  Volume2, VolumeX, Maximize2,
  SkipBack, SkipForward, Pause, Play, 
  Heart, ListPlus
} from 'lucide-react';

interface VideoPlayerProps {
  video: Video | null;
  onNext?: () => void;
  onPrevious?: () => void;
  onAddToFavorites: (video: Video) => void;
  onAddToPlaylist: () => void;
  miniMode?: boolean;
  onToggleMiniMode: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  video,
  onNext,
  onPrevious,
  onAddToFavorites,
  onAddToPlaylist,
  miniMode = false,
  onToggleMiniMode
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (video) {
      setIsPlaying(false);
      setCurrentTime(0);
      setIsLoading(true);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    }
  }, [video]);

  const handlePlayPause = async () => {
    if (!video?.previewUrl) return;

    try {
      if (isPlaying) {
        await audioRef.current?.pause();
      } else {
        setIsLoading(true);
        await audioRef.current?.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Error playing audio:', error);
      setError('Failed to play audio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const handleMuteToggle = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleLoadedData = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Failed to load audio');
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!video) return null;

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 bg-gray-900 shadow-lg z-50 transition-all duration-300 ${
        !miniMode ? 'h-96' : ''
      }`}
    >
      <audio
        ref={audioRef}
        src={video.previewUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          setIsPlaying(false);
          if (onNext) onNext();
        }}
        onLoadedData={handleLoadedData}
        onError={handleError}
        preload="auto"
      />
      
      <div className={`flex items-center ${miniMode ? 'p-2' : 'p-4'} text-white`}>
        {/* Thumbnail and Title */}
        <div className="flex items-center flex-1 min-w-0">
          <img 
            src={video.thumbnailUrl} 
            alt={video.title}
            className={`${miniMode ? 'w-12 h-12' : 'w-16 h-16'} object-cover rounded`}
          />
          <div className="ml-3 flex-1 min-w-0">
            <h3 className={`font-medium ${miniMode ? 'text-sm' : 'text-base'} truncate`}>
              {video.title}
            </h3>
            <p className={`${miniMode ? 'text-xs' : 'text-sm'} text-gray-400 truncate`}>
              {video.artist}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onPrevious}
            disabled={!onPrevious}
            className={`p-2 rounded-full hover:bg-gray-800 ${!onPrevious ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Previous track"
          >
            <SkipBack size={20} />
          </button>

          <button
            onClick={handlePlayPause}
            disabled={!video.previewUrl || isLoading}
            className={`p-3 rounded-full bg-purple-600 hover:bg-purple-700 ${
              !video.previewUrl || isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause size={24} />
            ) : (
              <Play size={24} />
            )}
          </button>

          <button
            onClick={onNext}
            disabled={!onNext}
            className={`p-2 rounded-full hover:bg-gray-800 ${!onNext ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Next track"
          >
            <SkipForward size={20} />
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleMuteToggle}
              className="p-2 rounded-full hover:bg-gray-800"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20"
              title="Volume"
            />
          </div>

          <button
            onClick={() => onAddToFavorites(video)}
            className="p-2 rounded-full hover:bg-gray-800"
            title="Add to favorites"
          >
            <Heart size={20} />
          </button>

          <button
            onClick={onAddToPlaylist}
            className="p-2 rounded-full hover:bg-gray-800"
            title="Add to playlist"
          >
            <ListPlus size={20} />
          </button>

          <button
            onClick={onToggleMiniMode}
            className="p-2 rounded-full hover:bg-gray-800"
            title={miniMode ? 'Maximize' : 'Minimize'}
          >
            <Maximize2 size={20} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {!miniMode && (
        <div className="px-4 pb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={video.duration || 30}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1"
              title="Seek"
            />
            <span className="text-xs text-gray-400">{formatTime(video.duration || 30)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;