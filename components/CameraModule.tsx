
import React, { useRef, useState, useEffect } from 'react';
import { Camera, Upload, RefreshCw, AlertCircle } from 'lucide-react';

interface CameraModuleProps {
  onCapture: (base64: string) => void;
  isLoading: boolean;
}

export const CameraModule: React.FC<CameraModuleProps> = ({ onCapture, isLoading }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);

  const stopTracks = (s: MediaStream | null) => {
    if (s) {
      s.getTracks().forEach(track => track.stop());
    }
  };

  const startCamera = async () => {
    // Stop any existing tracks before trying to start a new one
    stopTracks(stream);
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, 
        audio: false 
      });
      setStream(mediaStream);
      setError(null);
    } catch (err) {
      console.error("Camera Error:", err);
      setError("Camera access denied. Please allow camera access or upload an archive photo.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      // Cleanup: stop all tracks when component unmounts
      setStream(prevStream => {
        stopTracks(prevStream);
        return null;
      });
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch(e => console.warn("Auto-play prevented", e));
      };
    }
  }, [stream]);

  const takePhoto = () => {
    if (!videoRef.current || !stream) return;
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 150);

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Reverse mirror effect for the final saved image
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(videoRef.current, 0, 0);
    onCapture(canvas.toDataURL('image/jpeg', 0.9));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onCapture(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full p-4">
      <div className="relative w-full aspect-video border-3 border-black dark:border-white overflow-hidden bg-zinc-950 shadow-flat dark:shadow-flat-white">
        {!error ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover mirror" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center gap-4 text-white">
            <AlertCircle className="w-16 h-16 text-retro-pink" />
            <p className="text-xl font-black uppercase italic">{error}</p>
            <button 
              onClick={startCamera} 
              className="neubrutalism-button px-6 py-2 bg-retro-blue text-white font-black uppercase"
            >
              Retry Camera
            </button>
          </div>
        )}

        {isFlashing && <div className="absolute inset-0 bg-white z-50 animate-out fade-out duration-150" />}
        
        {isLoading && (
          <div className="absolute inset-0 bg-retro-yellow/90 flex flex-col items-center justify-center z-10 text-black">
            <RefreshCw className="w-16 h-16 animate-spin mb-4" strokeWidth={3} />
            <p className="text-2xl font-black uppercase italic">ANALYZING SIGNATURE...</p>
          </div>
        )}

        {!isLoading && !error && stream && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
            <button 
              onClick={takePhoto}
              className="neubrutalism-button p-6 bg-retro-pink text-white rounded-full hover:bg-retro-pink/90 active:scale-95 transition-transform"
              title="Capture Image"
            >
              <Camera className="w-10 h-10" />
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-4 w-full">
        <label className="neubrutalism-button flex-1 py-4 bg-retro-yellow dark:bg-retro-yellow text-black flex items-center justify-center gap-3 cursor-pointer group font-black uppercase italic hover:bg-white transition-colors">
          <Upload className="w-6 h-6" />
          IMPORT ARCHIVE
          <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
        </label>
      </div>
    </div>
  );
};
