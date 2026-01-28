import React, { useState, useEffect, useCallback } from 'react';
import { CameraModule } from './components/CameraModule';
import { MusicPlayer } from './components/MusicPlayer';
import { SettingsModal } from './components/SettingsModal';
import { Footer } from './components/Footer';
import { ERAS } from './eras'; // Updated to use unique filename and no extension
import { 
  TimeTravelState, 
  HistoricalEra, 
  Diagnostics
} from './types';
import { analyzePhoto, travelToEra, editPhoto } from './services/geminiService';
import { 
  Clock, Wand2, History, Download, 
  Loader2, Settings, Moon, Sun, Zap, AlertTriangle, RefreshCw, User
} from 'lucide-react';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [showSettings, setShowSettings] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  
  const [state, setState] = useState<TimeTravelState>({
    originalPhoto: null,
    baseTravelPhoto: null,
    processedPhoto: null,
    analysis: null,
    currentEra: null,
    status: 'idle',
    errorMessage: null,
  });

  const [editPrompt, setEditPrompt] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('SYNCING TIMELINE...');
  
  const [diagnostics, setDiagnostics] = useState<Diagnostics>({
    activeModel: 'Standby',
    lastTokenCount: 0,
    totalEstimatedTokens: 0
  });

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  const checkKeyStatus = useCallback(async () => {
    const aistudio = window.aistudio;
    if (aistudio && typeof aistudio.hasSelectedApiKey === 'function') {
      try {
        const selected = await aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } catch (e) {
        console.warn("AIStudio check failed", e);
        setHasKey(!!process.env.API_KEY);
      }
    } else {
      setHasKey(!!process.env.API_KEY);
    }
  }, []);

  useEffect(() => {
    checkKeyStatus().catch(console.error);
  }, [checkKeyStatus]);

  const handleOpenSelectKey = useCallback(async () => {
    const aistudio = window.aistudio;
    if (aistudio && typeof aistudio.openSelectKey === 'function') {
      await aistudio.openSelectKey();
      setHasKey(true);
    } else {
      setShowSettings(true);
    }
  }, []);

  const handleError = useCallback((err: any) => {
    const msg = err.message || String(err);
    if (msg.includes("Requested entity was not found.") || msg.toLowerCase().includes('permission denied') || msg.toLowerCase().includes('403')) {
      setHasKey(false);
      setState(prev => ({ ...prev, status: 'error', errorMessage: 'Temporal Permission Denied. Billing key required.' }));
    } else {
      setState(prev => ({ ...prev, status: 'error', errorMessage: 'Temporal link failed: ' + msg.substring(0, 50) }));
    }
  }, []);

  const handleCapture = async (base64: string) => {
    setState(prev => ({ ...prev, originalPhoto: base64, status: 'analyzing', errorMessage: null }));
    setDiagnostics(d => ({ ...d, activeModel: 'gemini-3-flash-preview' }));
    setLoadingMessage('ANALYZING BIO-SIGNATURE...');

    try {
      const analysis = await analyzePhoto(base64);
      setState(prev => ({ ...prev, analysis, status: 'idle' }));
      setDiagnostics(d => ({ 
        ...d, 
        lastTokenCount: 1200,
        totalEstimatedTokens: d.totalEstimatedTokens + 1200 
      }));
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleTravel = async (era: HistoricalEra) => {
    if (!state.originalPhoto) return;
    setState(prev => ({ ...prev, currentEra: era, status: 'traveling', errorMessage: null }));
    setDiagnostics(d => ({ ...d, activeModel: 'gemini-3-pro-image-preview' }));
    setLoadingMessage(`MANIFESTING ${era.name.toUpperCase()}...`);

    try {
      const result = await travelToEra(state.originalPhoto, era.prompt);
      setState(prev => ({ 
        ...prev, 
        baseTravelPhoto: result, 
        processedPhoto: result, 
        status: 'idle' 
      }));
      setDiagnostics(d => ({ 
        ...d, 
        lastTokenCount: 2500,
        totalEstimatedTokens: d.totalEstimatedTokens + 2500 
      }));
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleEdit = async () => {
    if (!state.processedPhoto || !editPrompt) return;
    setState(prev => ({ ...prev, status: 'editing', errorMessage: null }));
    setDiagnostics(d => ({ ...d, activeModel: 'gemini-3-pro-image-preview' }));
    setLoadingMessage('REFINING QUANTUM REALITY...');

    try {
      const result = await editPhoto(state.processedPhoto, editPrompt);
      setState(prev => ({ ...prev, processedPhoto: result, status: 'idle' }));
      setDiagnostics(d => ({ 
        ...d, 
        lastTokenCount: 2200,
        totalEstimatedTokens: d.totalEstimatedTokens + 2200 
      }));
      setEditPrompt('');
    } catch (err: any) {
      handleError(err);
    }
  };

  const resetRefiner = () => {
    if (state.baseTravelPhoto) {
      setState(prev => ({ ...prev, processedPhoto: prev.baseTravelPhoto }));
      setEditPrompt('');
    }
  };

  const handleDownload = () => {
    if (!state.processedPhoto) return;
    const link = document.createElement('a');
    link.href = state.processedPhoto;
    link.download = `chronos-${state.currentEra?.id || 'history'}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen p-4 md:p-8 selection:bg-retro-yellow selection:text-black font-['Space_Grotesk'] bg-white dark:bg-retro-black text-black dark:text-white transition-colors duration-300">
      {hasKey === false && (
        <div className="max-w-7xl mx-auto mb-8 neubrutalism-card bg-retro-pink text-white p-5 flex flex-col md:flex-row items-center justify-between border-black dark:border-white border-4 shadow-flat dark:shadow-flat-white">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="bg-black p-2 border-2 border-white">
              <AlertTriangle className="w-8 h-8 text-retro-yellow" />
            </div>
            <div>
              <p className="font-black uppercase text-lg italic tracking-tight">API AUTHORIZATION REQUIRED</p>
              <p className="text-xs font-bold opacity-80 uppercase">High-quality manifestation requires a billed Gemini API key.</p>
            </div>
          </div>
          <button 
            onClick={handleOpenSelectKey} 
            className="neubrutalism-button px-6 py-2 bg-retro-yellow text-black font-black uppercase italic hover:bg-white transition-colors"
          >
            Authorize Portal
          </button>
        </div>
      )}

      <nav className="max-w-7xl mx-auto flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="neubrutalism-card p-2 bg-retro-yellow text-black rotate-[-2deg] border-4 border-black dark:border-white">
             <Clock className="w-8 h-8" strokeWidth={3} />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">CHRONOS BOOTH</h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            className="neubrutalism-button p-3 bg-white dark:bg-zinc-800 hover:bg-retro-yellow dark:hover:bg-retro-yellow transition-all"
            title="Switch Theme"
          >
            {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="neubrutalism-button p-3 bg-retro-blue text-white hover:bg-retro-blue/90"
            title="Portal Config"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto">
        {state.status === 'error' && (
          <div className="neubrutalism-card bg-retro-pink text-white p-6 mb-8 flex items-center justify-between border-black dark:border-white border-4 shadow-flat dark:shadow-flat-white">
            <div className="flex items-center gap-4">
              <Zap className="w-8 h-8 fill-current text-retro-yellow" />
              <span className="font-bold text-xl uppercase italic">{state.errorMessage}</span>
            </div>
            <button 
              onClick={() => setState(s => ({...s, status: 'idle', errorMessage: null}))} 
              className="font-black hover:underline underline-offset-8"
            >
              DISMISS
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-8">
            {!state.originalPhoto ? (
              <div className="neubrutalism-card p-2 bg-white dark:bg-zinc-900 border-4 border-black dark:border-white shadow-flat dark:shadow-flat-white">
                <CameraModule onCapture={handleCapture} isLoading={state.status === 'analyzing'} />
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="neubrutalism-card p-2 bg-white dark:bg-zinc-900 overflow-hidden relative group border-4 border-black dark:border-white shadow-flat dark:shadow-flat-white">
                  {(state.status === 'traveling' || state.status === 'editing') && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-retro-blue/90 text-white border-4 border-black dark:border-white">
                      <Loader2 className="w-20 h-20 animate-spin mb-4 text-white" strokeWidth={5} />
                      <h2 className="text-4xl font-black uppercase italic tracking-widest animate-pulse text-center px-4">{loadingMessage}</h2>
                    </div>
                  )}
                  
                  {state.processedPhoto ? (
                    <img src={state.processedPhoto} className="w-full aspect-square object-cover" alt="Manifestation" />
                  ) : (
                    <div className="aspect-square flex items-center justify-center bg-retro-yellow/10">
                       <div className="text-center p-12 space-y-4">
                          <History className="w-24 h-24 mx-auto text-retro-yellow opacity-40" />
                          <h3 className="text-3xl font-black uppercase">Portal Standby</h3>
                          <p className="font-bold opacity-60">SELECT A DESTINATION ON THE RIGHT</p>
                       </div>
                    </div>
                  )}

                  {state.processedPhoto && (
                    <div className="absolute bottom-6 right-6 flex gap-4">
                      <button onClick={handleDownload} className="neubrutalism-button p-4 bg-retro-green text-black border-4 border-black" title="Download">
                        <Download className="w-6 h-6" strokeWidth={3} />
                      </button>
                    </div>
                  )}
                </div>

                {state.processedPhoto && (
                  <div className="neubrutalism-card p-6 bg-retro-yellow text-black border-4 border-black shadow-flat">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-black uppercase flex items-center gap-2 italic">
                        <Wand2 className="w-7 h-7" strokeWidth={3} /> REALITY REFINER
                      </h3>
                      <button 
                        onClick={resetRefiner} 
                        className="neubrutalism-button px-4 py-2 bg-retro-pink text-white text-xs font-black uppercase flex items-center gap-2 hover:bg-black transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" /> Reset Portal
                      </button>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4">
                      <input 
                        type="text" 
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        placeholder="ADD DETAILS (e.g. 'Add a gold crown')..."
                        className="flex-1 p-5 border-4 border-black font-black focus:outline-none placeholder:text-black/50 text-lg uppercase italic bg-white"
                      />
                      <button 
                        onClick={handleEdit}
                        disabled={state.status !== 'idle' || !editPrompt}
                        className="neubrutalism-button px-10 py-5 bg-black text-white font-black uppercase italic text-xl disabled:opacity-50 hover:bg-retro-blue transition-colors"
                      >
                        REBUILD
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <MusicPlayer era={state.currentEra} />
          </div>

          <div className="lg:col-span-4 space-y-8">
            {state.analysis && (
              <div className="neubrutalism-card p-6 bg-retro-blue text-white rotate-[1deg] border-4 border-black dark:border-white shadow-flat dark:shadow-flat-white">
                <h3 className="font-black uppercase tracking-widest text-sm mb-4 border-b-4 border-black/20 pb-2 flex items-center gap-2">
                  <User className="w-4 h-4" /> BIO-SCANNER REPORT
                </h3>
                <p className="text-xl font-black italic mb-4 leading-tight">"{state.analysis.summary}"</p>
                <div className="flex flex-wrap gap-2">
                  {state.analysis.detectedFeatures.map((f, i) => (
                    <span key={i} className="px-3 py-1 bg-black text-retro-yellow text-xs font-black uppercase border-2 border-white">{f}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-2xl font-black uppercase italic">ERA ARCHIVES</h3>
                <button 
                  onClick={() => setState({ originalPhoto: null, baseTravelPhoto: null, processedPhoto: null, analysis: null, currentEra: null, status: 'idle', errorMessage: null })}
                  className="text-xs font-black uppercase underline decoration-4 underline-offset-4 hover:text-retro-pink transition-colors"
                >
                  NEW SESSION
                </button>
              </div>
              
              {!state.originalPhoto && (
                <div className="p-6 neubrutalism-card bg-retro-pink/20 border-retro-pink border-4 text-retro-pink font-black text-center text-sm uppercase italic shadow-flat">
                  CAPTURE PORTRAIT TO UNLOCK TRAVEL
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 max-h-[550px] overflow-y-auto pr-3 custom-scrollbar">
                {ERAS.map((era) => (
                  <button
                    key={era.id}
                    onClick={() => handleTravel(era)}
                    disabled={!state.originalPhoto || state.status !== 'idle'}
                    className={`neubrutalism-button group relative w-full overflow-hidden p-0 h-28 border-4 border-black dark:border-white ${
                      state.currentEra?.id === era.id ? 'bg-retro-yellow ring-8 ring-retro-blue text-black' : 'bg-white dark:bg-zinc-800'
                    } disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed`}
                    title={!state.originalPhoto ? "Capture signature first" : `Travel to ${era.name}`}
                  >
                    <div className="flex items-center h-full">
                      <div className="w-32 h-full overflow-hidden border-r-4 border-black dark:border-white">
                        <img src={era.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500" alt={era.name} />
                      </div>
                      <div className="p-4 text-left flex-1 h-full flex flex-col justify-center">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black uppercase text-xl leading-tight tracking-tighter italic">{era.name}</h4>
                          {state.status === 'traveling' && state.currentEra?.id === era.id && <Loader2 className="w-5 h-5 animate-spin text-retro-blue" />}
                        </div>
                        <p className="text-[10px] font-black opacity-70 uppercase tracking-widest mt-1 line-clamp-1">{era.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="neubrutalism-card p-6 bg-retro-green text-black border-black border-4 rotate-[-1.5deg] shadow-flat">
              <h3 className="font-black uppercase text-lg mb-4 border-b-4 border-black pb-1 italic">TEMPORAL TELEMETRY</h3>
              <div className="space-y-3 font-['JetBrains_Mono'] text-[11px] font-black">
                <div className="flex justify-between items-center bg-white p-2 border-2 border-black shadow-flat">
                  <span className="opacity-60 uppercase">CORE:</span> 
                  <span className="bg-black text-retro-green px-2 py-0.5">{diagnostics.activeModel}</span>
                </div>
                <div className="flex justify-between items-center bg-white p-2 border-2 border-black shadow-flat">
                  <span className="opacity-60 uppercase">LOAD:</span> 
                  <span>~{diagnostics.totalEstimatedTokens} TKN</span>
                </div>
                <div className="pt-2 border-t-2 border-black flex justify-between items-center">
                  <span className="text-xs font-black uppercase">SYNC:</span> 
                  <span className="text-black font-black animate-pulse flex items-center gap-2">
                    <div className="w-2 h-2 bg-black rounded-full" /> OPERATIONAL
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showSettings && (
        <SettingsModal 
          onClose={() => setShowSettings(false)} 
          onOpenSelectKey={handleOpenSelectKey} 
        />
      )}
      <Footer />
    </div>
  );
};

export default App;