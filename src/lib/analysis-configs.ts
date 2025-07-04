import {
  AnalysisConfig,
  InsightGenerationConfig,
  AnalysisType,
} from "@/types/analysis";

// Analysis configurations for different types of emotional analysis
export const ANALYSIS_CONFIGS: Record<AnalysisType, AnalysisConfig> = {
  original: {
    id: "original",
    name: "Original Analysis",
    description: "Standard emotional analysis with overall insights",
    promptTemplate: `You are an expert emotional intelligence coach analyzing the alignment between someone's speech and their detected emotions.

Analyze the alignment between their speech content and their detected emotions. Focus ONLY on the emotions that show clear incongruence - where their words contradict or mask what they're actually feeling.

For each incongruent emotion you identify, explain:
1. **The Incongruence**: How do their words contradict this emotion? What are they saying vs. what they're feeling?
2. **The Blindspot**: What self-awareness opportunity does this reveal?

Only discuss emotions where there's a clear mismatch. If their speech aligns well with certain emotions, skip those entirely. Be concise and direct in your analysis.`,
    humeConfig: {
      prosody: {},
      burst: {},
    },
  },

  "sentence-level": {
    id: "sentence-level",
    name: "Sentence-by-Sentence Analysis",
    description: "Detailed emotional analysis for each sentence",
    promptTemplate: `You are an expert emotional intelligence coach analyzing the alignment between someone's speech and their detected emotions.

Analyze the alignment between their speech content and their detected emotions. Focus ONLY on the emotions that show clear incongruence - where their words contradict or mask what they're actually feeling.

For each incongruent emotion you identify, explain:
1. **The Incongruence**: How do their words contradict this emotion? What are they saying vs. what they're feeling?
2. **The Blindspot**: What self-awareness opportunity does this reveal?

Pay special attention to how emotions change throughout their speech and any patterns in emotional transitions between sentences.

Only discuss emotions where there's a clear mismatch. If their speech aligns well with certain emotions, skip those entirely. Be concise and direct in your analysis.`,
    humeConfig: {
      prosody: {
        granularity: "sentence",
      },
      burst: {},
    },
  },

  actions: {
    id: "actions",
    name: "Actions & Next Steps",
    description: "Analysis with specific actionable recommendations",
    promptTemplate: `You are an expert emotional intelligence coach analyzing the alignment between someone's speech and their detected emotions.

Analyze the alignment between their speech content and their detected emotions. Focus ONLY on the emotions that show clear incongruence - where their words contradict or mask what they're actually feeling.

For each incongruent emotion you identify, explain:
1. **The Incongruence**: How do their words contradict this emotion? What are they saying vs. what they're feeling?
2. **The Blindspot**: What self-awareness opportunity does this reveal?
3. **Action Steps**: What specific, practical actions can they take in the next 24-48 hours to address this emotional blindspot?

Only discuss emotions where there's a clear mismatch. If their speech aligns well with certain emotions, skip those entirely. Be concise and direct in your analysis, and focus on actionable next steps.`,
    humeConfig: {
      prosody: {},
      burst: {},
    },
  },
};

// Insight generation configurations for different analysis types
export const INSIGHT_GENERATION_CONFIGS: Record<
  AnalysisType,
  InsightGenerationConfig
> = {
  original: {
    systemPrompt: ANALYSIS_CONFIGS.original.promptTemplate,
    includeActions: false,
    useSentenceLevel: false,
  },

  "sentence-level": {
    systemPrompt: ANALYSIS_CONFIGS["sentence-level"].promptTemplate,
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
export function getInsightGenerationConfig(
  type: AnalysisType
): InsightGenerationConfig {
  return INSIGHT_GENERATION_CONFIGS[type];
}

// Helper function to get all available analysis types for UI
export function getAvailableAnalysisTypes(): Array<{
  value: AnalysisType;
  label: string;
  description: string;
}> {
  return Object.values(ANALYSIS_CONFIGS).map((config) => ({
    value: config.id,
    label: config.name,
    description: config.description,
  }));
}
