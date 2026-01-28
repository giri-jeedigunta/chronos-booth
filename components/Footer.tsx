
import React from 'react';
import { Github, ExternalLink, Zap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-24 py-16 border-t-8 border-black/10 dark:border-white/10 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <span className="text-3xl font-black uppercase italic tracking-tighter text-retro-blue bg-black text-white px-4 py-2 border-4 border-retro-blue rotate-[-1deg]">
              Built at GDG Stockholm
            </span>
            <a 
              href="https://gdg.community.dev/events/details/google-gdg-web-stockholm-presents-code-at-the-speed-of-thought-architecting-creative-ai-with-gemini-amp-antigravity/" 
              target="_blank" 
              className="neubrutalism-button px-4 py-2 bg-retro-yellow text-black font-black uppercase text-xs flex items-center gap-2 hover:bg-white transition-all"
              title="Visit the GDG Stockholm Event Page: Architecting Creative AI"
            >
              <ExternalLink className="w-4 h-4" /> Event Details
            </a>
          </div>
          <div className="relative">
            <p className="text-[11px] font-black opacity-70 max-w-lg leading-relaxed border-l-8 border-retro-blue pl-6 italic uppercase dark:text-white">
              "Build a 'time-travel' photo booth app that takes my photo and inserts my face into various historical scenes."
            </p>
            <div className="absolute -left-3 -top-3 text-4xl text-retro-blue font-black opacity-20">"</div>
          </div>
          <div className="flex items-center gap-4 font-black uppercase text-lg border-b-4 border-black dark:border-white pb-1 inline-block dark:text-white">
            <span className="opacity-40 italic text-sm">Architect:</span>
            <span className="text-retro-pink">Giri Jeedigunta</span>
          </div>
        </div>
        
        <div className="flex flex-col items-center lg:items-end gap-8">
          <div className="flex gap-5">
            <a 
              href="https://ai.google.dev/" 
              target="_blank" 
              className="neubrutalism-button px-6 py-3 bg-black text-white font-black uppercase italic text-sm flex items-center gap-3 hover:bg-retro-yellow hover:text-black transition-all" 
              title="Google AI for Developers: Gemini API Hub"
            >
              <Zap className="w-5 h-5 fill-retro-yellow" /> ai.google.dev
            </a>
            <a 
              href="https://github.com/giri-jeedigunta" 
              target="_blank" 
              className="neubrutalism-button p-4 bg-white dark:bg-retro-black dark:text-white hover:bg-retro-pink hover:text-white transition-all" 
              title="Follow Giri Jeedigunta on GitHub"
            >
              <Github className="w-8 h-8" />
            </a>
          </div>
          <div className="text-center lg:text-right space-y-1">
            <p className="font-['JetBrains_Mono'] text-[11px] uppercase font-black opacity-50 tracking-[0.2em] dark:text-white">
              CHRONOS BOOTH // V2.0 NEUBRUTALISM // REDEPLOYED_ON_GCP
            </p>
            <p className="font-black text-[10px] uppercase opacity-30 dark:text-white">© 2026 GDG Stockholm AI Workshop</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
