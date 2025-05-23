import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { Video } from '../types';
import { 
  Volume2, VolumeX, Minimize2, Maximize2,
  SkipBack, SkipForward, Pause, Play, 
  Heart, ListPlus, Download
} from 'lucide-react';

interface VideoPlayerProps {
  video: Video | null;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onAddToFavorites: (video: Video) => void;
  onAddToPlaylist: (video: Video) => void;
  miniMode?: boolean;
  onToggleMiniMode: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  video, 
  onClose, 
  onNext, 
  onPrevious, 
  onAddToFavorites,
  onAddToPlaylist,
  miniMode = false,
  onToggleMiniMode
}) => {
  const [player, setPlayer] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  useEffect(() => {
    setIsPlaying(true);
    setElapsed(0);
    checkIfDownloaded();
  }, [video]);

  const checkIfDownloaded = async () => {
    if (!video) return;
    const cache = await caches.open('music-cache');
    const response = await cache.match(`music-${video.id}`);
    setIsDownloaded(!!response);
  };

  const handleDownload = async () => {
    if (!video) return;
    try {
      const cache = await caches.open('music-cache');
      await cache.put(`music-${video.id}`, new Response(JSON.stringify({
        ...video,
        timestamp: Date.now()
      })));
      setIsDownloaded(true);
    } catch (err) {
      console.error('Error caching music:', err);
    }
  };

  if (!video) return null;

  const handleReady = (event: any) => {
    setPlayer(event.target);
    setDuration(event.target.getDuration());
    
    const timer = setInterval(() => {
      if (event.target.getCurrentTime) {
        setElapsed(event.target.getCurrentTime());
      }
    }, 1000);

    return () => clearInterval(timer);
  };

  const togglePlay = () => {
    if (player) {
      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (player) {
      if (isMuted) {
        player.unMute();
        player.setVolume(volume);
      } else {
        player.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (player) {
      player.setVolume(newVolume);
      if (newVolume === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        player.unMute();
        setIsMuted(false);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTo = parseInt(e.target.value);
    setElapsed(seekTo);
    if (player) {
      player.seekTo(seekTo);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const playerOptions = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 1,
      controls: 0,
      modestbranding: 1,
      rel: 0,
      fs: 0,
    },
  };

  return (
    <div 
      className={`${
        miniMode 
          ? 'fixed bottom-0 left-0 right-0 bg-gray-900 shadow-lg z-50'
          : 'w-full max-w-xl mx-auto bg-gray-900 rounded-lg overflow-hidden'
      } transition-all duration-300`}
    >
      <div className="hidden">
        <YouTube
          videoId={video.id}
          opts={playerOptions}
          onReady={handleReady}
          onStateChange={(e) => setIsPlaying(e.data === 1)}
        />
      </div>
      
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
              {video.channelTitle}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          {onPrevious && (
            <button 
              onClick={onPrevious}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <SkipBack size={miniMode ? 18 : 20} />
            </button>
          )}
          
          <button 
            onClick={togglePlay}
            className="p-3 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors"
          >
            {isPlaying ? <Pause size={miniMode ? 18 : 20} /> : <Play size={miniMode ? 18 : 20} />}
          </button>
          
          {onNext && (
            <button 
              onClick={onNext}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <SkipForward size={miniMode ? 18 : 20} />
            </button>
          )}

          {/* Volume Control */}
          <div 
            className="relative"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            <button 
              onClick={toggleMute}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              {isMuted ? <VolumeX size={miniMode ? 18 : 20} /> : <Volume2 size={miniMode ? 18 : 20} />}
            </button>
            {showVolumeSlider && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-gray-800 rounded-lg shadow-lg">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            )}
          </div>

          {/* Additional Controls */}
          <button 
            onClick={() => video && onAddToFavorites(video)}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <Heart size={miniMode ? 18 : 20} />
          </button>
          
          <button 
            onClick={() => video && onAddToPlaylist(video)}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <ListPlus size={miniMode ? 18 : 20} />
          </button>

          <button
            onClick={handleDownload}
            className={`p-2 rounded-full transition-colors ${
              isDownloaded 
                ? 'text-green-500 hover:bg-green-900/20' 
                : 'hover:bg-gray-800'
            }`}
          >
            <Download size={miniMode ? 18 : 20} />
          </button>

          <button 
            onClick={onToggleMiniMode}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            {miniMode ? <Maximize2 size={18} /> : <Minimize2 size={20} />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 pb-2">
        <div className="relative group">
          <input
            type="range"
            min="0"
            max={duration}
            value={elapsed}
            onChange={handleSeek}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400"
          />
          <div 
            className="absolute left-0 bottom-0 h-1 bg-purple-500 rounded-lg pointer-events-none"
            style={{ width: `${(elapsed / duration) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-400">
          <span>{formatTime(elapsed)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;