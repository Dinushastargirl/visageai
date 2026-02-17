
export type FaceShape = 'Oval' | 'Round' | 'Square' | 'Heart' | 'Diamond' | 'Oblong';

export interface Landmark {
  label: string;
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
}

export interface AnalysisResult {
  shape: FaceShape;
  confidence: number;
  description: string;
  landmarks: Landmark[];
  inspirationImage?: string; // Base64 generated image
  tips: {
    glasses: string;
    hair: string;
    makeup: string;
  };
}

export interface AppState {
  image: string | null;
  isAnalyzing: boolean;
  result: AnalysisResult | null;
  error: string | null;
}
