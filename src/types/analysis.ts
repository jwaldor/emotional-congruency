export interface EmotionScore {
  name: string;
  score: number;
}

export interface SentenceEmotion {
  sentence: string;
  emotions: EmotionScore[];
  startTime?: number;
  endTime?: number;
}

export type AnalysisType = "original" | "sentence-level" | "actions";

export interface AnalysisSettings {
  emotionThreshold: number; // Minimum score (0-1) to include an emotion
  maxEmotions: number; // Maximum number of emotions to include (1-10)
  analysisType: AnalysisType; // Type of analysis to perform
}

export interface AnalysisData {
  transcript: string;
  emotions: EmotionScore[];
  analyzedEmotions: EmotionScore[];
  sentenceEmotions?: SentenceEmotion[]; // For sentence-level analysis
  insights: string;
  analysisType: AnalysisType;
}

export interface FeedbackData {
  resultId?: string;
  email?: string;
  feedback: string;
}

// Analysis configuration interfaces
export interface HumeModelConfig {
  prosody?: {
    granularity?: "utterance" | "sentence";
  };
  burst?: Record<string, unknown>;
}

export interface AnalysisConfig {
  id: AnalysisType;
  name: string;
  description: string;
  promptTemplate: string;
  humeConfig?: HumeModelConfig; // Hume API specific configuration
}

export interface InsightGenerationConfig {
  systemPrompt: string;
  includeActions?: boolean;
  useSentenceLevel?: boolean;
}
