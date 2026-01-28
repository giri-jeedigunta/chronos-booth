
export interface HistoricalEra {
  id: string;
  name: string;
  description: string;
  prompt: string;
  image: string;
}

export interface PhotoAnalysis {
  summary: string;
  detectedFeatures: string[];
  vibe: string;
}

export interface TimeTravelState {
  originalPhoto: string | null;
  processedPhoto: string | null;
  analysis: PhotoAnalysis | null;
  currentEra: HistoricalEra | null;
  status: 'idle' | 'analyzing' | 'traveling' | 'editing' | 'error';
  errorMessage: string | null;
}
