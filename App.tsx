
import React, { useState, useCallback } from 'react';
import { CameraModule } from './components/CameraModule';
import { ERAS } from './constants';
import { TimeTravelState, HistoricalEra } from './types';
import { analyzePhoto, travelToEra, editPhoto } from './services/geminiService';
import { Sparkles, Clock, Undo2, Wand2, History, ChevronRight, Download, Share2 } from 'lucide-react';

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
            {/* Left Column: Result and Controls */}
            <div className="lg:col-span-2 space-y-8">
              <div className="relative rounded-3xl overflow-hidden glass-card aspect-square md:aspect-video flex items-center justify-center bg-black/40 group shadow-2xl">
                {state.status === 'traveling' || state.status === 'editing' ? (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md">
                    <div className="relative w-32 h-32 mb-6">
                      <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
                      <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-blue-400 animate-pulse" />
                    </div>
                    <p className="text-2xl font-medium text-blue-400 tracking-wider">
                      {state.status === 'traveling' ? 'Manifesting History...' : 'Rewriting Reality...'}
                    </p>
                  </div>
                ) : null}

                {state.processedPhoto ? (
                  <img 
                    src={state.processedPhoto} 
                    alt="Time travel result" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="p-12 text-center">
                    <History className="w-16 h-16 text-zinc-700 mx-auto mb-6" />
                    <p className="text-2xl font-semibold text-zinc-500">Pick a Destination</p>
                    <p className="text-zinc-600 mt-2">Where would you like to travel today?</p>
                  </div>
                )}

                {/* Overlays */}
                {state.processedPhoto && (
                  <div className="absolute bottom-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-3 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl transition-all">
                      <Download className="w-5 h-5 text-white" />
                    </button>
                    <button className="p-3 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl transition-all">
                      <Share2 className="w-5 h-5 text-white" />
                    </button>
                  </div>
                )}
              </div>

              {/* Editing Controls */}
              {state.processedPhoto && (
                <div className="glass-card p-6 rounded-3xl animate-in fade-in slide-in-from-bottom-4">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-blue-400" />
                    Reality Refiner
                  </h3>
                  <div className="flex gap-3">
                    <input 
                      type="text"
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      placeholder="e.g., 'Add a vintage sepia filter' or 'Make it snow'"
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-zinc-600"
                    />
                    <button 
                      onClick={handleEdit}
                      disabled={!editPrompt || state.status !== 'idle'}
                      className="px-8 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/20"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Era Selector and Analysis */}
            <div className="space-y-8">
              {/* Analysis Panel */}
              {state.analysis && (
                <div className="glass-card p-6 rounded-3xl border-l-4 border-blue-500/50">
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
                  <button onClick={reset} className="text-sm text-zinc-500 hover:text-white transition-colors">Change Photo</button>
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
                        : 'hover:scale-[1.02] active:scale-95'
                      }`}
                    >
                      <div className="absolute inset-0">
                        <img src={era.image} className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
                      </div>
                      <div className="relative p-6 flex items-center justify-between">
                        <div className="max-w-[80%]">
                          <h4 className="text-lg font-bold text-white mb-1">{era.name}</h4>
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
        <div className="flex items-center justify-center gap-6 mb-8">
           <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500">🏛️</div>
           <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500">🏰</div>
           <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500">🚀</div>
        </div>
        <p className="text-zinc-500 text-sm">
          Chronos Booth © 2024 • Powered by Gemini AI • Temporal Licensing Protected
        </p>
      </footer>
    </div>
  );
};

export default App;
