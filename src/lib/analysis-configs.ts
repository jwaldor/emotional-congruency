import { AnalysisConfig, InsightGenerationConfig, AnalysisType } from '@/types/analysis';

// Analysis configurations for different types of emotional analysis
export const ANALYSIS_CONFIGS: Record<AnalysisType, AnalysisConfig> = {
  original: {
    id: 'original',
    name: 'Original Analysis',
    description: 'Standard emotional analysis with overall insights',
    promptTemplate: `You are an expert emotional intelligence coach analyzing the alignment between someone's speech and their detected emotions.

Based on the transcript and detected emotions, provide insights about:
1. What the emotions reveal about their current state
2. Patterns in their emotional expression
3. Potential emotional blindspots or misalignments
4. Suggestions for emotional awareness and growth

Be empathetic, constructive, and focus on actionable insights.`,
    humeConfig: {
      prosody: {},
      burst: {},
    },
  },

  'sentence-level': {
    id: 'sentence-level',
    name: 'Sentence-by-Sentence Analysis',
    description: 'Detailed emotional analysis for each sentence',
    promptTemplate: `You are an expert emotional intelligence coach analyzing sentence-level emotional patterns in speech.

Based on the transcript and sentence-by-sentence emotion detection, provide insights about:
1. How emotions change throughout the conversation
2. Specific moments of emotional intensity or shifts
3. Patterns in emotional transitions
4. What these micro-expressions reveal about underlying thoughts and feelings
5. Suggestions for emotional awareness based on these patterns

Focus on the emotional journey and transitions between sentences.`,
    humeConfig: {
      prosody: {
        granularity: 'sentence',
      },
      burst: {},
    },
  },

  actions: {
    id: 'actions',
    name: 'Actions & Next Steps',
    description: 'Analysis with specific actionable recommendations',
    promptTemplate: `You are an expert emotional intelligence coach and life strategist analyzing emotional patterns to provide actionable guidance.

Based on the transcript and detected emotions, provide:
1. Emotional insights about their current state
2. Specific, actionable next steps they can take
3. Practical strategies for emotional growth
4. Concrete recommendations for addressing any emotional challenges
5. Suggested actions for the next 24-48 hours

Focus on practical, implementable actions they can take immediately.`,
    humeConfig: {
      prosody: {},
      burst: {},
    },
  },
};

// Insight generation configurations for different analysis types
export const INSIGHT_GENERATION_CONFIGS: Record<AnalysisType, InsightGenerationConfig> = {
  original: {
    systemPrompt: ANALYSIS_CONFIGS.original.promptTemplate,
    includeActions: false,
    useSentenceLevel: false,
  },

  'sentence-level': {
    systemPrompt: ANALYSIS_CONFIGS['sentence-level'].promptTemplate,
    includeActions: false,
    useSentenceLevel: true,
  },

  actions: {
    systemPrompt: ANALYSIS_CONFIGS.actions.promptTemplate,
    includeActions: true,
    useSentenceLevel: false,
  },
};

// Helper function to get analysis config by type
export function getAnalysisConfig(type: AnalysisType): AnalysisConfig {
  return ANALYSIS_CONFIGS[type];
}

// Helper function to get insight generation config by type
export function getInsightGenerationConfig(type: AnalysisType): InsightGenerationConfig {
  return INSIGHT_GENERATION_CONFIGS[type];
}

// Helper function to get all available analysis types for UI
export function getAvailableAnalysisTypes(): Array<{ value: AnalysisType; label: string; description: string }> {
  return Object.values(ANALYSIS_CONFIGS).map(config => ({
    value: config.id,
    label: config.name,
    description: config.description,
  }));
}
