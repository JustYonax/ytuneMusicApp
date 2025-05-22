import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { Video } from '../types';
import { 
  Volume2, VolumeX, Minimize, 
  SkipBack, SkipForward, Pause, Play, 
  X, Heart, ListPlus, Download
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
    <div className={`bg-gray-900 rounded-lg overflow-hidden transition-all duration-300 ${
      miniMode ? 'w-80 shadow-lg' : 'w-full max-w-xl mx-auto'
    }`}>
      <div className="hidden">
        <YouTube
          videoId={video.id}
          opts={playerOptions}
          onReady={handleReady}
          onStateChange={(e) => setIsPlaying(e.data === 1)}
        />
      </div>
      
      <div className="p-4 bg-gray-800 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 min-w-0 mr-4">
            <h3 className="font-medium text-sm truncate">{video.title}</h3>
            <p className="text-xs text-gray-400">{video.channelTitle}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleDownload}
              className={`p-1.5 rounded-full transition-colors ${
                isDownloaded 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'hover:bg-gray-700'
              }`}
              title={isDownloaded ? 'Downloaded for offline playback' : 'Download for offline playback'}
            >
              <Download size={16} />
            </button>
            <button 
              onClick={onToggleMiniMode} 
              className="p-1.5 hover:bg-gray-700 rounded-full transition-colors"
            >
              <Minimize size={16} />
            </button>
            <button 
              onClick={onClose} 
              className="p-1.5 hover:bg-gray-700 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">{formatTime(elapsed)}</span>
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max={duration}
                value={elapsed}
                onChange={handleSeek}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
            <span className="text-xs text-gray-400">{formatTime(duration)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {onPrevious && (
                <button onClick={onPrevious} className="p-2 hover:bg-gray-700 rounded-full transition-colors">
                  <SkipBack size={20} />
                </button>
              )}
              
              <button 
                onClick={togglePlay} 
                className="p-3 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              
              {onNext && (
                <button onClick={onNext} className="p-2 hover:bg-gray-700 rounded-full transition-colors">
                  <SkipForward size={20} />
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button onClick={toggleMute} className="p-2 hover:bg-gray-700 rounded-full transition-colors">
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
              
              <button 
                onClick={() => video && onAddToFavorites(video)} 
                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
              >
                <Heart size={20} />
              </button>
              
              <button 
                onClick={() => video && onAddToPlaylist(video)} 
                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
              >
                <ListPlus size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;