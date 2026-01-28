
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
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.addEventListener('error', () => {
        setLoadError(true);
        setIsPlaying(false);
      });
    }
  }, []);

  useEffect(() => {
    if (era && audioRef.current) {
      setLoadError(false);
      audioRef.current.src = era.musicUrl;
      audioRef.current.volume = volume;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [era]);

  const togglePlay = () => {
    if (!audioRef.current || loadError) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play().catch(() => setLoadError(true));
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  if (!era) return null;

  return (
    <div className="neubrutalism-card p-8 bg-retro-green text-black flex flex-col md:flex-row items-center gap-10 border-black border-4 shadow-flat">
      <div className="flex items-center gap-5 flex-1 w-full">
        <div className="w-20 h-20 bg-white border-4 border-black flex items-center justify-center shadow-flat shrink-0">
          {loadError ? (
            <AlertTriangle className="w-10 h-10 text-retro-pink" />
          ) : (
            <Music className={`w-10 h-10 ${isPlaying ? 'animate-bounce' : ''}`} strokeWidth={3} />
          )}
        </div>
        <div className="space-y-1">
          <h4 className="font-black uppercase text-2xl leading-none tracking-tighter italic border-b-4 border-black inline-block">
            {loadError ? "CONNECTION_LOST" : `${era.name.replace(' ', '_').toUpperCase()}_THEME`}
          </h4>
          <p className="font-black text-xs uppercase tracking-[0.2em] bg-black text-white px-3 py-1 mt-2 inline-block shadow-flat">
            Soundtrack.Archive_Active
          </p>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button 
          onClick={togglePlay} 
          className="neubrutalism-button p-5 bg-white text-black border-4 hover:bg-retro-yellow transition-colors" 
          title={isPlaying ? "Pause Stream" : "Initiate Playback"}
        >
          {isPlaying ? <Pause className="w-10 h-10" strokeWidth={3} /> : <Play className="w-10 h-10 fill-current" strokeWidth={3} />}
        </button>
        <button 
          onClick={() => { if(audioRef.current){audioRef.current.currentTime = 0; audioRef.current.pause(); setIsPlaying(false);}}} 
          className="neubrutalism-button p-5 bg-black text-white border-4 hover:bg-retro-pink transition-colors" 
          title="Kill Stream"
        >
          <Square className="w-10 h-10 fill-current" />
        </button>
      </div>

      <div className="flex items-center gap-5 w-full md:w-64 bg-black/10 p-4 border-4 border-black shadow-flat">
        <button 
          onClick={() => {if(audioRef.current) audioRef.current.muted = !isMuted; setIsMuted(!isMuted)}} 
          className="p-1 hover:scale-110 transition-transform" 
          title="Toggle Mute"
        >
          {isMuted || volume === 0 ? <VolumeX className="w-8 h-8" strokeWidth={3} /> : <Volume2 className="w-8 h-8" strokeWidth={3} />}
        </button>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={volume} 
          onChange={handleVolumeChange} 
          className="flex-1 accent-black" 
        />
      </div>
    </div>
  );
};
