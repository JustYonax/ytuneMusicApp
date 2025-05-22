import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { Video } from '../types';
import { 
  Volume2, VolumeX, Maximize, Minimize, 
  SkipBack, SkipForward, Pause, Play, 
  X, Heart, ListPlus
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

  useEffect(() => {
    // Reset player state when video changes
    setIsPlaying(true);
    setElapsed(0);
  }, [video]);

  if (!video) return null;

  const handleReady = (event: any) => {
    setPlayer(event.target);
    setDuration(event.target.getDuration());
    
    // Start a timer to update elapsed time
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
    height: miniMode ? '180' : '390',
    width: '100%',
    playerVars: {
      autoplay: 1,
      controls: 0,
      modestbranding: 1,
      rel: 0,
      fs: 0,
    },
  };

  return (
    <div className={`bg-gray-900 rounded-lg overflow-hidden transition-all duration-300 ${
      miniMode ? 'fixed bottom-4 right-4 w-80 shadow-lg z-50' : 'w-full'
    }`}>
      <div className="relative">
        <YouTube
          videoId={video.id}
          opts={playerOptions}
          onReady={handleReady}
          onStateChange={(e) => setIsPlaying(e.data === 1)}
          className="w-full"
        />
        
        {/* Overlay controls */}
        <div className="absolute top-2 right-2 flex space-x-2">
          <button 
            onClick={onToggleMiniMode} 
            className="p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
          >
            {miniMode ? <Maximize size={16} /> : <Minimize size={16} />}
          </button>
          <button 
            onClick={onClose} 
            className="p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      
      <div className="p-3 bg-gray-800 text-white">
        {!miniMode && (
          <div className="mb-2">
            <h3 className="font-medium text-sm truncate">{video.title}</h3>
            <p className="text-xs text-gray-400">{video.channelTitle}</p>
          </div>
        )}
        
        <div className="flex items-center mb-2">
          <input
            type="range"
            min="0"
            max={duration}
            value={elapsed}
            onChange={handleSeek}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-xs text-gray-400">
            <span>{formatTime(elapsed)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {!miniMode && onPrevious && (
              <button onClick={onPrevious} className="p-1 hover:text-purple-400 transition-colors">
                <SkipBack size={18} />
              </button>
            )}
            
            <button onClick={togglePlay} className="p-1.5 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors">
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            
            {!miniMode && onNext && (
              <button onClick={onNext} className="p-1 hover:text-purple-400 transition-colors">
                <SkipForward size={18} />
              </button>
            )}
            
            <div className="flex items-center ml-2">
              <button onClick={toggleMute} className="p-1 hover:text-purple-400 transition-colors">
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              
              {!miniMode && (
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 ml-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              )}
            </div>
            
            {!miniMode && (
              <>
                <button 
                  onClick={() => video && onAddToFavorites(video)} 
                  className="p-1 hover:text-purple-400 transition-colors ml-2"
                >
                  <Heart size={18} />
                </button>
                <button 
                  onClick={() => video && onAddToPlaylist(video)} 
                  className="p-1 hover:text-purple-400 transition-colors"
                >
                  <ListPlus size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;