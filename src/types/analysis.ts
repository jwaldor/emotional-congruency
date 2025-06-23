export interface EmotionScore {
  name: string;
  score: number;
}

export interface AnalysisSettings {
  emotionThreshold: number; // Minimum score (0-1) to include an emotion
  maxEmotions: number; // Maximum number of emotions to include (1-10)
}

export interface AnalysisData {
  transcript: string;
  emotions: EmotionScore[];
  analyzedEmotions: EmotionScore[];
  insights: string;
}

export interface FeedbackData {
  resultId?: string;
  email?: string;
  feedback: string;
}
