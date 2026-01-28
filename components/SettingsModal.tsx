import React from 'react';
import { X, ShieldCheck, ExternalLink, Cpu } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  onOpenSelectKey: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onOpenSelectKey }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="neubrutalism-card max-w-lg w-full bg-white dark:bg-retro-black p-10 relative border-4 shadow-flat-lg">
        <button onClick={onClose} className="absolute top-6 right-6 neubrutalism-button p-2 bg-retro-pink text-white hover:bg-black transition-all">
          <X className="w-8 h-8" />
        </button>
        <h2 className="text-4xl font-black uppercase italic mb-10 border-b-8 border-retro-yellow pb-2">CORE CONFIG</h2>
        <div className="space-y-8 text-black dark:text-white">
          <section className="space-y-4">
            <h3 className="font-black uppercase text-2xl text-retro-blue flex items-center gap-2">
              <ShieldCheck className="w-8 h-8" /> AUTH
            </h3>
            <p className="text-sm font-black opacity-80 leading-relaxed uppercase">
              IMAGE GENERATION REQUIRES A BILLING-ENABLED API KEY FROM GOOGLE CLOUD CONSOLE.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={onOpenSelectKey} 
                className="neubrutalism-button flex-1 py-4 bg-retro-yellow text-black font-black uppercase italic text-lg hover:bg-white transition-all"
              >
                AUTHORIZE PORTAL
              </button>
              <a 
                href="https://aistudio.google.com/" 
                target="_blank" 
                className="neubrutalism-button p-4 bg-white text-black hover:bg-retro-blue transition-all" 
                title="Get API Key from Google AI Studio"
              >
                <ExternalLink className="w-8 h-8" />
              </a>
            </div>
          </section>
          <section className="space-y-4 pt-6 border-t-4 border-black/10 dark:border-white/10">
            <h3 className="font-black uppercase text-2xl text-retro-green flex items-center gap-2">
              <Cpu className="w-8 h-8" /> QUANTUM ENGINE
            </h3>
            <div className="grid grid-cols-2 gap-5">
              <div className="p-4 bg-zinc-100 dark:bg-zinc-800 border-4 border-black dark:border-white shadow-flat">
                <p className="text-[10px] font-black uppercase opacity-60 mb-1">ANALYSIS CORE</p>
                <p className="font-black text-sm uppercase italic">gemini-3-flash-preview</p>
              </div>
              <div className="p-4 bg-zinc-100 dark:bg-zinc-800 border-4 border-black dark:border-white shadow-flat">
                <p className="text-[10px] font-black uppercase opacity-60 mb-1">VISUAL CORE</p>
                <p className="font-black text-sm uppercase italic">gemini-3-pro-image-preview</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};