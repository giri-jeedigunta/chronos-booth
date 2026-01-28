
export interface HistoricalEra {
  id: string;
  name: string;
  description: string;
  prompt: string;
  image: string;
  musicUrl: string;
}

export interface PhotoAnalysis {
  summary: string;
  detectedFeatures: string[];
  vibe: string;
}

export type AppStatus = 'idle' | 'analyzing' | 'traveling' | 'editing' | 'error';

export interface TimeTravelState {
  originalPhoto: string | null;
  baseTravelPhoto: string | null;
  processedPhoto: string | null;
  analysis: PhotoAnalysis | null;
  currentEra: HistoricalEra | null;
  status: AppStatus;
  errorMessage: string | null;
}

export interface Diagnostics {
  activeModel: string;
  lastTokenCount: number;
  totalEstimatedTokens: number;
}

declare global {
  // Define AIStudio globally to match execution context expectations and avoid type mismatch errors
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}
