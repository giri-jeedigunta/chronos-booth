
import React, { useState, useEffect } from 'react';
import { CameraModule } from './components/CameraModule';
import { MusicPlayer } from './components/MusicPlayer';
import { ERAS } from './constants';
import { TimeTravelState, HistoricalEra } from './types';
import { analyzePhoto, travelToEra, editPhoto } from './services/geminiService';
import { Sparkles, Clock, Undo2, Wand2, History, ChevronRight, Download, Share2, CheckCircle2, Loader2, Github, Info, User, Target, Map, Key, AlertTriangle, CreditCard } from 'lucide-react';

const App: React.FC = () => {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
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

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        setHasKey(true);
      }
    };
    checkKey();
  }, []);

  const handleOpenSelectKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  useEffect(() => {
    let interval: number | undefined;
    if (state.status === 'traveling' || state.status === 'editing') {
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

  const handleError = (err: any) => {
    console.error("Temporal Error:", err);
    const msg = err.message || String(err);
    
    if (msg.toLowerCase().includes('permission denied') || msg.toLowerCase().includes('403') || msg.toLowerCase().includes('api key')) {
      setHasKey(false);
      setState(prev => ({ 
        ...prev, 
        status: 'error', 
        errorMessage: 'Authorization Required. Please use a billing-enabled API key (Google Cloud $300 credits are valid!).' 
      }));
    } else {
      setState(prev => ({ 
        ...prev, 
        status: 'error', 
        errorMessage: 'Temporal link failed: ' + (msg.length > 50 ? msg.substring(0, 47) + '...' : msg)
      }));
    }
  };

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
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleTravel = async (era: HistoricalEra) => {
    if (!state.originalPhoto) return;

    setState(prev => ({ ...prev, currentEra: era, status: 'traveling', errorMessage: null }));

    try {
      const result = await travelToEra(state.originalPhoto, era.prompt);
      setState(prev => ({ ...prev, processedPhoto: result, status: 'idle' }));
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleEdit = async () => {
    if (!state.processedPhoto || !editPrompt) return;

    setState(prev => ({ ...prev, status: 'editing', errorMessage: null }));

    try {
      const result = await editPhoto(state.processedPhoto, editPrompt);
      setState(prev => ({ ...prev, processedPhoto: result, status: 'idle' }));
      setEditPrompt('');
    } catch (err: any) {
      handleError(err);
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

  if (hasKey === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] p-6 text-center">
        <div className="max-w-md w-full glass-card p-10 rounded-[2.5rem] border-blue-500/20 shadow-2xl animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-400 mx-auto mb-8 shadow-inner border border-blue-500/20">
            <Key className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4 font-playfair tracking-tight">Authorization Required</h2>
          <p className="text-zinc-400 mb-8 leading-relaxed">
            This app uses advanced image generation that requires a <strong>billing-enabled API key</strong>. 
          </p>
          <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 mb-8 flex items-start gap-3 text-left">
            <CreditCard className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-400 leading-normal">
              <strong>Tip:</strong> You can use your <span className="text-blue-400 font-bold">$300 Google Cloud free trial credits</span>. Just link your billing account to your project in Google Cloud Console, then select that project's key here.
            </p>
          </div>
          <button 
            onClick={handleOpenSelectKey}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 group active:scale-95"
          >
            Select API Key
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="mt-6 text-xs text-zinc-500">
            Need help setting up credits? <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Read Billing Guide</a>
          </p>
        </div>
      </div>
    );
  }

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
        {showSuccess && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl shadow-emerald-500/20 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-bold tracking-tight">Temporal Signature Captured!</span>
            </div>
          </div>
        )}

        {state.status === 'error' && (
          <div className="mb-8 p-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-3xl flex items-center justify-between animate-in slide-in-from-top-2 shadow-xl shadow-red-500/5">
            <span className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <span className="font-medium">{state.errorMessage}</span>
            </span>
            <div className="flex gap-2">
               <button onClick={handleOpenSelectKey} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors">
                 Update Key
               </button>
               <button onClick={() => setState(prev => ({ ...prev, status: 'idle', errorMessage: null }))} className="p-2 hover:bg-red-500/20 rounded-xl transition-colors">
                <Undo2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {!state.originalPhoto ? (
          <div className="space-y-12">
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="glass-card p-8 rounded-[2rem] border-white/5 flex flex-col items-center text-center gap-4 group hover:bg-white/5 transition-colors">
                <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 shadow-inner group-hover:scale-110 transition-transform">
                  <User className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold">1. Capture Subject</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">Look into the temporal lens and capture your current self or upload an archive photo.</p>
              </div>
              <div className="glass-card p-8 rounded-[2rem] border-white/5 flex flex-col items-center text-center gap-4 group hover:bg-white/5 transition-colors">
                <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 shadow-inner group-hover:scale-110 transition-transform">
                  <Target className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold">2. Analyze Aura</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">Wait as Gemini 3 Flash analyzes your unique facial geometry and temporal signature.</p>
              </div>
              <div className="glass-card p-8 rounded-[2rem] border-white/5 flex flex-col items-center text-center gap-4 group hover:bg-white/5 transition-colors">
                <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 shadow-inner group-hover:scale-110 transition-transform">
                  <Map className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold">3. Choose Era</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">Select a destination era from the list to reconstruct reality around your portrait.</p>
              </div>
            </section>

            <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <CameraModule onCapture={handleCapture} isLoading={state.status === 'analyzing'} />
            </section>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="relative rounded-[2.5rem] overflow-hidden glass-card aspect-square md:aspect-video flex items-center justify-center bg-black/40 group shadow-2xl">
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

                {state.processedPhoto && (
                  <div className="absolute bottom-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-4 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl transition-all active:scale-90" title="Download">
                      <Download className="w-5 h-5 text-white" />
                    </button>
                    <button className="p-4 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl transition-all active:scale-90" title="Share">
                      <Share2 className="w-5 h-5 text-white" />
                    </button>
                  </div>
                )}
              </div>

              <div className="animate-in fade-in slide-in-from-bottom-4">
                <MusicPlayer era={state.currentEra} />
              </div>

              {state.processedPhoto && (
                <div className="glass-card p-8 rounded-[2rem] animate-in fade-in slide-in-from-bottom-4 border-white/5">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Wand2 className="w-6 h-6 text-blue-400" />
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
                      className="px-8 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 min-w-[140px]"
                    >
                      {state.status === 'editing' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Refine Reality'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-8">
              {state.analysis && (
                <div className="glass-card p-8 rounded-[2rem] border-l-4 border-blue-500/50 animate-in slide-in-from-right-4 duration-500">
                  <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Subject Profile</h3>
                  <p className="text-lg font-medium text-white mb-6 italic leading-relaxed">
                    "{state.analysis.summary}"
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {state.analysis.detectedFeatures.map((f, i) => (
                      <span key={i} className="px-4 py-1.5 bg-zinc-800/50 border border-zinc-700 text-zinc-300 text-xs font-semibold rounded-full">
                        {f}
                      </span>
                    ))}
                  </div>
                  <div className="pt-6 border-t border-white/5 flex items-center justify-between text-zinc-400">
                    <span className="text-xs uppercase tracking-widest font-bold">Temporal Aura</span>
                    <span className="text-sm text-blue-400 font-bold tracking-tight">{state.analysis.vibe}</span>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-2xl font-bold font-playfair">Destinations</h3>
                  <button onClick={reset} className="text-sm text-zinc-500 hover:text-white transition-colors flex items-center gap-1.5">
                    <Undo2 className="w-3.5 h-3.5" /> Start Over
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {ERAS.map((era) => (
                    <button
                      key={era.id}
                      onClick={() => handleTravel(era)}
                      disabled={state.status !== 'idle'}
                      className={`relative w-full text-left rounded-[1.75rem] overflow-hidden transition-all duration-300 group ${
                        state.currentEra?.id === era.id 
                        ? 'ring-2 ring-blue-500 ring-offset-4 ring-offset-[#0a0a0c]' 
                        : 'hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                    >
                      <div className="absolute inset-0">
                        <img src={era.image} className="w-full h-full object-cover opacity-30 group-hover:opacity-60 transition-all duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
                      </div>
                      <div className="relative p-6 flex items-center justify-between">
                        <div className="max-w-[80%]">
                          <h4 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                            {era.name}
                            {state.status === 'traveling' && state.currentEra?.id === era.id && (
                              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                            )}
                          </h4>
                          <p className="text-xs text-zinc-400 line-clamp-1 group-hover:text-zinc-300 transition-colors">{era.description}</p>
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

      <footer className="mt-24 py-16 border-t border-white/5 text-center">
        <div className="flex items-center justify-center gap-6 mb-10">
           <div className="w-14 h-14 bg-zinc-900/50 border border-white/5 rounded-2xl flex items-center justify-center text-zinc-500 hover:text-blue-400 transition-all" title="Ancient World">🏛️</div>
           <div className="w-14 h-14 bg-zinc-900/50 border border-white/5 rounded-2xl flex items-center justify-center text-zinc-500 hover:text-blue-400 transition-all" title="Medieval">🏰</div>
           <div className="w-14 h-14 bg-zinc-900/50 border border-white/5 rounded-2xl flex items-center justify-center text-zinc-500 hover:text-blue-400 transition-all" title="Deep Space">🚀</div>
        </div>
        
        <div className="max-w-xl mx-auto space-y-6">
          <p className="text-zinc-400 font-medium text-lg">
            Built at <span className="text-blue-400 font-bold tracking-tight">GDG Stockholm</span> using <span className="text-white">Google AI Studio</span>
          </p>
          <div className="flex flex-col items-center gap-4">
            <a href="https://github.com/giri-jeedigunta" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-full transition-all hover:bg-white/10">
              <Github className="w-5 h-5 text-zinc-400 group-hover:text-white" />
              <span className="text-zinc-300 font-bold group-hover:text-white">@giri-jeedigunta</span>
            </a>
            <p className="text-zinc-700 text-[10px] uppercase tracking-[0.4em] mt-8">Chronos Booth © 2024</p>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .animate-spin-slow { animation: spin 3s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.08); border-radius: 10px; }
      `}} />
    </div>
  );
};

export default App;
