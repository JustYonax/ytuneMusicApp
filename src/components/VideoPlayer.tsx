import React, { useState, useEffect } from 'react';
import YouTube, { YouTubeEvent, YouTubePlayer } from 'react-youtube';
import { Video } from '../types';
import { 
  Volume2, VolumeX, Maximize2,
  SkipBack, SkipForward, Pause, Play, 
  Heart, ListPlus, Download,
  Shuffle, Repeat, X
} from 'lucide-react';
import { cacheManager } from '../utils/cacheManager';

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

type RepeatMode = 'none' | 'one' | 'all';

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  video, 
  onClose, 
  onNext, 
  onPrevious, 
  onAddToFavorites,
  onAddToPlaylist,
  miniMode = true,
  onToggleMiniMode
}) => {
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [cacheStatus, setCacheStatus] = useState<'cached' | 'caching' | 'error' | null>(null);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');

  useEffect(() => {
    setIsPlaying(true);
    setElapsed(0);
    checkCacheStatus();
  }, [video]);

  const checkCacheStatus = async () => {
    if (!video) return;
    const status = await cacheManager.getCacheStatus(video.id);
    setCacheStatus(status);
  };

  const handleDownload = async () => {
    if (!video) return;
    try {
      setCacheStatus('caching');
      const success = await cacheManager.addToCache(video);
      setCacheStatus(success ? 'cached' : 'error');
    } catch (err) {
      console.error('Error caching music:', err);
      setCacheStatus('error');
    }
  };

  const toggleShuffle = () => {
    setIsShuffleOn(!isShuffleOn);
  };

  const toggleRepeat = () => {
    setRepeatMode(current => {
      switch (current) {
        case 'none': return 'all';
        case 'all': return 'one';
        case 'one': return 'none';
      }
    });
  };

  const handleVideoEnd = () => {
    if (repeatMode === 'one' && player) {
      player.seekTo(0);
      player.playVideo();
    } else if (repeatMode === 'all' && onNext) {
      onNext();
    } else if (onNext) {
      onNext();
    }
  };

  if (!video) return null;

  const handleReady = (event: YouTubeEvent) => {
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
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (player && !isMuted) {
      player.setVolume(newVolume);
    }
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
      className={`fixed bottom-0 left-0 right-0 bg-gray-900 shadow-lg z-50 transition-all duration-300 ${
        !miniMode ? 'h-96' : ''
      }`}
    >
      <div className="hidden">
        <YouTube
          videoId={video.id}
          opts={playerOptions}
          onReady={handleReady}
          onStateChange={(e: YouTubeEvent) => setIsPlaying(e.data === 1)}
          onEnd={handleVideoEnd}
        />
      </div>
      
      <div className={`flex items-center ${miniMode ? 'p-2' : 'p-4'} text-white`}>
        {/* Video Info */}
        <div className="flex items-center space-x-4 flex-1">
          <img 
            src={video.thumbnailUrl} 
            alt={video.title}
            className="w-16 h-16 object-cover rounded"
          />
          <div>
            <h3 className="font-medium">{video.title}</h3>
            <p className="text-sm text-gray-400">{video.channelTitle}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleShuffle}
            className={`p-2 rounded-full transition-colors ${
              isShuffleOn ? 'text-purple-500 hover:bg-purple-900/20' : 'hover:bg-gray-800'
            }`}
            title={isShuffleOn ? 'Shuffle On' : 'Shuffle Off'}
            aria-label={isShuffleOn ? 'Disable shuffle' : 'Enable shuffle'}
          >
            <Shuffle size={miniMode ? 18 : 20} />
          </button>

          {onPrevious && (
            <button 
              onClick={onPrevious}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              title="Previous"
              aria-label="Play previous track"
            >
              <SkipBack size={miniMode ? 18 : 20} />
            </button>
          )}
          
          <button 
            onClick={togglePlay}
            className="p-3 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
            aria-label={isPlaying ? 'Pause playback' : 'Start playback'}
          >
            {isPlaying ? <Pause size={miniMode ? 18 : 20} /> : <Play size={miniMode ? 18 : 20} />}
          </button>
          
          {onNext && (
            <button 
              onClick={onNext}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              title="Next"
              aria-label="Play next track"
            >
              <SkipForward size={miniMode ? 18 : 20} />
            </button>
          )}

          <button
            onClick={toggleRepeat}
            className={`p-2 rounded-full transition-colors ${
              repeatMode !== 'none' ? 'text-purple-500 hover:bg-purple-900/20' : 'hover:bg-gray-800'
            }`}
            title={
              repeatMode === 'none' ? 'Repeat Off' :
              repeatMode === 'all' ? 'Repeat All' :
              'Repeat One'
            }
            aria-label={
              repeatMode === 'none' ? 'Enable repeat' :
              repeatMode === 'all' ? 'Enable repeat one' :
              'Disable repeat'
            }
          >
            <Repeat size={miniMode ? 18 : 20} />
            {repeatMode === 'one' && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full" />
            )}
          </button>

          {/* Volume Control */}
          <div 
            className="relative"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            <button
              onClick={toggleMute}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
              aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
            >
              {isMuted ? <VolumeX size={miniMode ? 18 : 20} /> : <Volume2 size={miniMode ? 18 : 20} />}
            </button>
            
            {showVolumeSlider && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 p-2 rounded-lg">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  title="Volume"
                  aria-label="Adjust volume"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onAddToFavorites(video)}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              title="Add to Favorites"
              aria-label="Add to favorites"
            >
              <Heart size={miniMode ? 18 : 20} />
            </button>

            <button
              onClick={() => onAddToPlaylist(video)}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              title="Add to Playlist"
              aria-label="Add to playlist"
            >
              <ListPlus size={miniMode ? 18 : 20} />
            </button>

            <button
              onClick={handleDownload}
              className={`p-2 rounded-full transition-colors ${
                cacheStatus === 'cached' ? 'text-purple-500' : 'hover:bg-gray-800'
              }`}
              title={
                cacheStatus === 'cached' ? 'Cached' :
                cacheStatus === 'caching' ? 'Caching...' :
                cacheStatus === 'error' ? 'Error caching' :
                'Cache for offline'
              }
              aria-label={
                cacheStatus === 'cached' ? 'Remove from cache' :
                cacheStatus === 'caching' ? 'Caching in progress' :
                cacheStatus === 'error' ? 'Retry caching' :
                'Cache for offline'
              }
            >
              <Download size={miniMode ? 18 : 20} />
            </button>

            <button
              onClick={onToggleMiniMode}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              title={miniMode ? 'Maximize' : 'Minimize'}
              aria-label={miniMode ? 'Maximize player' : 'Minimize player'}
            >
              <Maximize2 size={miniMode ? 18 : 20} />
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              title="Close player"
              aria-label="Close player"
            >
              <X size={miniMode ? 18 : 20} />
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-gray-700">
        <div 
          className="h-full bg-purple-600 transition-all duration-200"
          style={{ width: `${(elapsed / duration) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default VideoPlayer;