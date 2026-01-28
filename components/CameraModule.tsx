
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

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, 
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Play manually to ensure it starts
        videoRef.current.play().catch(e => console.warn("Auto-play prevented", e));
      }
      setError(null);
    } catch (err) {
      setError("Camera access denied or not available. Please upload a photo instead.");
      console.error(err);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takePhoto = () => {
    if (!videoRef.current || !stream) return;
    
    // Trigger Flash Effect
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 150);

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Mirror the capture to match the preview
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    
    ctx.drawImage(videoRef.current, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg', 0.9);
    onCapture(base64);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onCapture(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      <div className="relative w-full aspect-video rounded-3xl overflow-hidden glass-card shadow-2xl group bg-zinc-950">
        {!error ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            className="w-full h-full object-cover mirror"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 p-8 text-center gap-4">
            <AlertCircle className="w-12 h-12 text-red-500/50" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Shutter Flash */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white z-50 animate-out fade-out duration-150" />
        )}
        
        {isLoading && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10 backdrop-blur-md">
            <div className="relative w-16 h-16 mb-6">
               <RefreshCw className="w-full h-full text-blue-500 animate-spin" />
            </div>
            <p className="text-xl font-medium tracking-wide text-white">Capturing Temporal Signature...</p>
            <p className="text-blue-400/60 text-sm mt-2 font-mono uppercase tracking-widest">Quantum Link Active</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button 
              onClick={takePhoto}
              className="p-6 bg-white/10 hover:bg-blue-600 backdrop-blur-xl border border-white/20 rounded-full transition-all hover:scale-110 active:scale-90 shadow-2xl shadow-blue-500/20"
              title="Capture Image"
            >
              <Camera className="w-10 h-10 text-white" />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 w-full px-4">
        <label className="flex-1 flex items-center justify-center gap-3 py-4 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-2xl cursor-pointer transition-all hover:border-blue-500/30 group">
          <Upload className="w-5 h-5 text-zinc-500 group-hover:text-blue-400" />
          <span className="text-zinc-400 font-medium group-hover:text-zinc-200">Import from Archives</span>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
        </label>
        
        {error && (
          <button 
            onClick={startCamera}
            className="p-4 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 rounded-2xl transition-all"
            title="Retry Camera"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};