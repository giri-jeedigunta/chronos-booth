
import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Play, Pause, Square, Music, AlertTriangle } from 'lucide-react';
import { HistoricalEra } from '../types';

interface MusicPlayerProps {
  era: HistoricalEra | null;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ era }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      
      const handleAudioError = (e: any) => {
        console.warn("Audio source failed to load:", e);
        setLoadError(true);
        setIsPlaying(false);
      };

      audioRef.current.addEventListener('error', handleAudioError);
      return () => {
        audioRef.current?.removeEventListener('error', handleAudioError);
      };
    }
  }, []);

  useEffect(() => {
    if (era && audioRef.current) {
      setLoadError(false);
      audioRef.current.src = era.musicUrl;
      audioRef.current.volume = volume;
      audioRef.current.load(); // Explicitly load the new source
      
      if (hasInteracted) {
        audioRef.current.play().catch(err => {
          console.warn("Playback failed", err);
          setIsPlaying(false);
        });
        setIsPlaying(true);
      }
    } else if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [era]);

  const togglePlay = () => {
    if (!audioRef.current || loadError) return;
    setHasInteracted(true);
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.warn("Playback failed", err);
        setLoadError(true);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      if (newVolume > 0 && isMuted) {
        setIsMuted(false);
        audioRef.current.muted = false;
      }
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMuteState = !isMuted;
    audioRef.current.muted = newMuteState;
    setIsMuted(newMuteState);
  };

  if (!era) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      <div className="glass-card p-4 md:p-6 rounded-3xl border-blue-500/20 shadow-lg flex flex-col md:flex-row items-center gap-6">
        {/* Track Info */}
        <div className="flex items-center gap-4 flex-1 w-full">
          <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/20">
            {loadError ? (
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            ) : (
              <Music className={`w-6 h-6 ${isPlaying ? 'animate-pulse' : ''}`} />
            )}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-white font-bold leading-tight truncate">
              {loadError ? "Soundtrack Unavailable" : `${era.name} Theme`}
            </h4>
            <p className="text-zinc-500 text-xs tracking-wider uppercase font-medium">
              {loadError ? "Source connection lost" : "Temporal Soundtrack"}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button 
            onClick={togglePlay}
            disabled={loadError}
            className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:bg-zinc-800 disabled:shadow-none"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
          </button>
          <button 
            onClick={handleStop}
            className="p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl transition-all active:scale-95"
            title="Stop"
          >
            <Square className="w-6 h-6 fill-current" />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3 w-full md:w-48">
          <button 
            onClick={toggleMute}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
          >
            {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <input 
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>
    </div>
  );
};