
import React, { useState, useEffect } from 'react';
import { CameraModule } from './components/CameraModule';
import { MusicPlayer } from './components/MusicPlayer';
import { ERAS } from './constants';
import { TimeTravelState, HistoricalEra } from './types';
import { analyzePhoto, travelToEra, editPhoto } from './services/geminiService';
import { Sparkles, Clock, Undo2, Wand2, History, ChevronRight, Download, Share2, CheckCircle2, Loader2, Github } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<TimeTravelState>({
    originalPhoto: null,
    processedPhoto: null,
    analysis: null,
    currentEra: null,
    status: 'idle',
    errorMessage: null,
  });

  const [editPrompt, setEditPrompt] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Manifesting History...');

  // Loading messages rotation for better UX
  useEffect(() => {
    let interval: number | undefined;
    if (state.status === 'traveling') {
      const messages = [
        'Calculating temporal vectors...',
        'Warping the space-time continuum...',
        'Bending the light of the past...',
        'Manifesting your history...',
        'Reconstructing visual timeline...'
      ];
      let i = 0;
      interval = window.setInterval(() => {
        i = (i + 1) % messages.length;
        setLoadingMessage(messages[i]);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [state.status]);

  const handleCapture = async (base64: string) => {
    setState(prev => ({ 
      ...prev, 
      originalPhoto: base64, 
      status: 'analyzing', 
      errorMessage: null,
      processedPhoto: null,
      currentEra: null,
      analysis: null
    }));

    try {
      const analysis = await analyzePhoto(base64);
      setState(prev => ({ ...prev, analysis, status: 'idle' }));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setState(prev => ({ 
        ...prev, 
        status: 'error', 
        errorMessage: 'Failed to analyze photo. Let\'s try again.' 
      }));
    }
  };

  const handleTravel = async (era: HistoricalEra) => {
    if (!state.originalPhoto) return;

    setState(prev => ({ ...prev, currentEra: era, status: 'traveling', errorMessage: null }));

    try {
      const result = await travelToEra(state.originalPhoto, era.prompt);
      setState(prev => ({ ...prev, processedPhoto: result, status: 'idle' }));
    } catch (err) {
      console.error(err);
      setState(prev => ({ 
        ...prev, 
        status: 'error', 
        errorMessage: 'The space-time continuum is unstable. Try another era!' 
      }));
    }
  };

  const handleEdit = async () => {
    if (!state.processedPhoto || !editPrompt) return;

    setState(prev => ({ ...prev, status: 'editing', errorMessage: null }));

    try {
      const result = await editPhoto(state.processedPhoto, editPrompt);
      setState(prev => ({ ...prev, processedPhoto: result, status: 'idle' }));
      setEditPrompt('');
    } catch (err) {
      console.error(err);
      setState(prev => ({ 
        ...prev, 
        status: 'error', 
        errorMessage: 'Magic failed. Try a different request!' 
      }));
    }
  };

  const reset = () => {
    setState({
      originalPhoto: null,
      processedPhoto: null,
      analysis: null,
      currentEra: null,
      status: 'idle',
      errorMessage: null,
    });
    setEditPrompt('');
  };

  return (
    <div className="min-h-screen pb-20 px-4 md:px-8 bg-[#0a0a0c] selection:bg-blue-500/30">
      {/* Header */}
      <header className="py-12 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold tracking-widest uppercase mb-6 animate-pulse">
          <Clock className="w-4 h-4" />
          Quantum Photography
        </div>
        <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-zinc-400 to-zinc-600 bg-clip-text text-transparent">
          Chronos Booth
        </h1>
        <p className="text-zinc-400 text-xl max-w-2xl mx-auto leading-relaxed">
          Step into history with the world's most advanced AI-powered time machine. 
          Your journey through the eras begins with a single frame.
        </p>
      </header>

      <main className="max-w-6xl mx-auto">
        {/* Success Confirmation Toast */}
        {showSuccess && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl shadow-emerald-500/20 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-bold tracking-tight">Temporal Signature Captured!</span>
            </div>
          </div>
        )}

        {state.status === 'error' && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl flex items-center justify-between">
            <span>{state.errorMessage}</span>
            <button onClick={() => setState(prev => ({ ...prev, status: 'idle', errorMessage: null }))} className="p-2 hover:bg-red-500/20 rounded-lg">
              <Undo2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {!state.originalPhoto ? (
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <CameraModule onCapture={handleCapture} isLoading={state.status === 'analyzing'} />
          </section>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Result, Music and Controls */}
            <div className="lg:col-span-2 space-y-8">
              <div className="relative rounded-3xl overflow-hidden glass-card aspect-square md:aspect-video flex items-center justify-center bg-black/40 group shadow-2xl">
                {state.status === 'traveling' || state.status === 'editing' ? (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl transition-all duration-500">
                    <div className="relative w-32 h-32 mb-8">
                      <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
                      <div className="absolute inset-4 border-4 border-b-indigo-500 rounded-full animate-spin-slow"></div>
                      <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-blue-400 animate-pulse" />
                    </div>
                    <div className="text-center px-6">
                      <p className="text-2xl font-bold text-white tracking-wider mb-2 animate-pulse">
                        {loadingMessage}
                      </p>
                      <p className="text-zinc-500 text-sm font-medium uppercase tracking-[0.2em]">Quantum Tunneling Active</p>
                    </div>
                  </div>
                ) : null}

                {state.processedPhoto ? (
                  <img 
                    src={state.processedPhoto} 
                    alt="Time travel result" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                ) : (
                  <div className="p-12 text-center animate-in fade-in zoom-in duration-500">
                    <div className="relative inline-block mb-6">
                      <History className="w-16 h-16 text-zinc-700 mx-auto" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-ping" />
                    </div>
                    <p className="text-2xl font-semibold text-zinc-400">Temporal Coordinates Required</p>
                    <p className="text-zinc-600 mt-2">Select a historical destination from the list on the right</p>
                  </div>
                )}

                {/* Overlays */}
                {state.processedPhoto && (
                  <div className="absolute bottom-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-3 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl transition-all" title="Download">
                      <Download className="w-5 h-5 text-white" />
                    </button>
                    <button className="p-3 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl transition-all" title="Share">
                      <Share2 className="w-5 h-5 text-white" />
                    </button>
                  </div>
                )}
              </div>

              {/* Music Player Section */}
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <MusicPlayer era={state.currentEra} />
              </div>

              {/* Editing Controls */}
              {state.processedPhoto && (
                <div className="glass-card p-6 rounded-3xl animate-in fade-in slide-in-from-bottom-4 border-white/5">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-blue-400" />
                    Reality Refiner
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="text"
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      placeholder="e.g., 'Add a vintage sepia filter' or 'Make it snow'"
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-zinc-600 text-white"
                    />
                    <button 
                      onClick={handleEdit}
                      disabled={!editPrompt || state.status !== 'idle'}
                      className="px-8 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                    >
                      {state.status === 'editing' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Refine'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Era Selector and Analysis */}
            <div className="space-y-8">
              {/* Analysis Panel */}
              {state.analysis && (
                <div className="glass-card p-6 rounded-3xl border-l-4 border-blue-500/50 animate-in slide-in-from-right-4 duration-500">
                  <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Subject Profile</h3>
                  <p className="text-lg font-medium text-white mb-4 italic leading-relaxed">
                    "{state.analysis.summary}"
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {state.analysis.detectedFeatures.map((f, i) => (
                      <span key={i} className="px-3 py-1 bg-zinc-800/50 border border-zinc-700 text-zinc-300 text-xs rounded-full">
                        {f}
                      </span>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-zinc-400">
                    <span className="text-xs uppercase tracking-tighter">Temporal Aura</span>
                    <span className="text-sm text-blue-400 font-bold">{state.analysis.vibe}</span>
                  </div>
                </div>
              )}

              {/* Era Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold font-playfair">Destinations</h3>
                  <button onClick={reset} className="text-sm text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
                    <Undo2 className="w-3 h-3" /> New Photo
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {ERAS.map((era) => (
                    <button
                      key={era.id}
                      onClick={() => handleTravel(era)}
                      disabled={state.status !== 'idle'}
                      className={`relative w-full text-left rounded-3xl overflow-hidden transition-all duration-300 group ${
                        state.currentEra?.id === era.id 
                        ? 'ring-2 ring-blue-500 ring-offset-4 ring-offset-[#0a0a0c]' 
                        : 'hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                    >
                      <div className="absolute inset-0">
                        <img src={era.image} className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
                      </div>
                      <div className="relative p-6 flex items-center justify-between">
                        <div className="max-w-[80%]">
                          <h4 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                            {era.name}
                            {state.status === 'traveling' && state.currentEra?.id === era.id && (
                              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                            )}
                          </h4>
                          <p className="text-xs text-zinc-400 line-clamp-1">{era.description}</p>
                        </div>
                        <ChevronRight className="w-6 h-6 text-zinc-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="mt-20 py-12 border-t border-white/5 text-center">
        <div className="flex items-center justify-center gap-6 mb-6">
           <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500 hover:text-blue-400 transition-colors cursor-help" title="Ancient World Access Point">🏛️</div>
           <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500 hover:text-blue-400 transition-colors cursor-help" title="Medieval Gateway">🏰</div>
           <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500 hover:text-blue-400 transition-colors cursor-help" title="Deep Space Terminal">🚀</div>
        </div>
        
        <div className="max-w-xl mx-auto space-y-4">
          <p className="text-zinc-400 font-medium">
            Built at <span className="text-blue-400 font-bold">GDG Stockholm</span> event using <span className="text-white">Google AI Studio</span>
          </p>
          
          <div className="flex flex-col items-center gap-2">
            <a 
              href="https://github.com/Tariqul-Islam-Apu" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all"
            >
              <Github className="w-4 h-4 text-zinc-400 group-hover:text-white" />
              <span className="text-zinc-300 text-sm font-semibold group-hover:text-white">@Tariqul-Islam-Apu</span>
            </a>
            <p className="text-zinc-600 text-[11px] uppercase tracking-widest">Temporal Licensing Protected • Chronos Booth © 2024</p>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
};

export default App;
