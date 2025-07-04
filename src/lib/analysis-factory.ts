import {
  AnalysisType,
  EmotionScore,
  SentenceEmotion,
  AnalysisData,
} from "@/types/analysis";
import {
  getAnalysisConfig,
  getInsightGenerationConfig,
} from "./analysis-configs";

// Factory class for creating different types of analysis
export class AnalysisFactory {
  /**
   * Process Hume API response based on analysis type
   */
  static processHumeResponse(
    humeResponse: any,
    analysisType: AnalysisType,
    emotionThreshold: number,
    maxEmotions: number
  ): {
    emotions: EmotionScore[];
    analyzedEmotions: EmotionScore[];
    sentenceEmotions?: SentenceEmotion[];
    transcript: string;
  } {
    console.log("Processing Hume response for analysis type:", analysisType);
    const config = getAnalysisConfig(analysisType);

    // Extract transcript
    const transcript = this.extractTranscript(humeResponse);
    console.log("Extracted transcript:", transcript);

    // Process emotions based on analysis type
    if (analysisType === "sentence-level") {
      return this.processSentenceLevelResponse(
        humeResponse,
        emotionThreshold,
        maxEmotions,
        transcript
      );
    } else {
      return this.processStandardResponse(
        humeResponse,
        emotionThreshold,
        maxEmotions,
        transcript
      );
    }
  }

  /**
   * Extract transcript from Hume response
   */
  private static extractTranscript(humeResponse: any): string {
    // Handle the current SDK response structure
    if (humeResponse.results && humeResponse.results.length > 0) {
      const firstResult = humeResponse.results[0];

      if (
        firstResult.results?.predictions &&
        firstResult.results.predictions.length > 0
      ) {
        const prosodyPredictions = firstResult.results.predictions[0];
        if (prosodyPredictions.models?.prosody?.groupedPredictions) {
          // Collect all text segments from prosody predictions
          const textSegments: string[] = [];
          prosodyPredictions.models.prosody.groupedPredictions.forEach(
            (group: any) => {
              group.predictions.forEach((prediction: any) => {
                if (prediction.text) {
                  textSegments.push(prediction.text);
                }
              });
            }
          );
          return textSegments.join(" ");
        }
      }
    }

    // Fallback for other structures
    return humeResponse.transcript || "";
  }

  /**
   * Process standard (utterance-level) emotion response
   */
  private static processStandardResponse(
    humeResponse: any,
    emotionThreshold: number,
    maxEmotions: number,
    transcript: string
  ): {
    emotions: EmotionScore[];
    analyzedEmotions: EmotionScore[];
    transcript: string;
  } {
    const emotions: EmotionScore[] = [];

    if (humeResponse.results && humeResponse.results.length > 0) {
      const firstResult = humeResponse.results[0];

      // Combine prosody and burst emotions
      const allEmotions = new Map<string, number>();

      // Process prosody emotions
      if (
        firstResult.results?.predictions &&
        firstResult.results.predictions.length > 0
      ) {
        const prosodyPredictions = firstResult.results.predictions[0];
        if (prosodyPredictions.models?.prosody?.groupedPredictions) {
          // Get all prosody predictions and extract emotions
          prosodyPredictions.models.prosody.groupedPredictions.forEach(
            (group: any) => {
              group.predictions.forEach((prediction: any) => {
                prediction.emotions.forEach((emotion: any) => {
                  allEmotions.set(
                    emotion.name,
                    Math.max(allEmotions.get(emotion.name) || 0, emotion.score)
                  );
                });
              });
            }
          );
        }

        // Process burst emotions
        if (prosodyPredictions.models?.burst?.groupedPredictions) {
          prosodyPredictions.models.burst.groupedPredictions.forEach(
            (group: any) => {
              group.predictions.forEach((prediction: any) => {
                prediction.emotions.forEach((emotion: any) => {
                  allEmotions.set(
                    emotion.name,
                    Math.max(allEmotions.get(emotion.name) || 0, emotion.score)
                  );
                });
              });
            }
          );
        }
      }

      // Convert to array and sort by score
      for (const [name, score] of allEmotions.entries()) {
        emotions.push({ name, score });
      }

      emotions.sort((a, b) => b.score - a.score);
    }

    // Get top 10 emotions for display
    const top10Emotions = emotions.slice(0, 10);

    // Get analyzed emotions based on user settings (threshold + max count)
    const analyzedEmotions = emotions
      .filter((emotion) => emotion.score >= emotionThreshold)
      .slice(0, maxEmotions);

    return {
      emotions: top10Emotions,
      analyzedEmotions,
      transcript,
    };
  }

  /**
   * Process sentence-level emotion response
   */
  private static processSentenceLevelResponse(
    humeResponse: any,
    emotionThreshold: number,
    maxEmotions: number,
    transcript: string
  ): {
    emotions: EmotionScore[];
    analyzedEmotions: EmotionScore[];
    sentenceEmotions: SentenceEmotion[];
    transcript: string;
  } {
    const prosodyPredictions =
      humeResponse.results?.[0]?.results?.predictions?.[0]?.models?.prosody
        ?.groupedPredictions?.[0]?.predictions || [];

    // Process sentence-level emotions
    const sentenceEmotions: SentenceEmotion[] = prosodyPredictions.map(
      (prediction: any) => {
        const emotions: EmotionScore[] = prediction.emotions
          .map((emotion: any) => ({
            name: emotion.name,
            score: emotion.score,
          }))
          .sort((a: EmotionScore, b: EmotionScore) => b.score - a.score);

        return {
          sentence: prediction.text || "",
          emotions: emotions.slice(0, 10), // Top 10 emotions per sentence
          startTime: prediction.time?.begin,
          endTime: prediction.time?.end,
        };
      }
    );

    // Aggregate emotions across all sentences for overall analysis
    const emotionAggregates: Record<string, number[]> = {};

    sentenceEmotions.forEach((sentenceEmotion) => {
      sentenceEmotion.emotions.forEach((emotion) => {
        if (!emotionAggregates[emotion.name]) {
          emotionAggregates[emotion.name] = [];
        }
        emotionAggregates[emotion.name].push(emotion.score);
      });
    });

    // Calculate average scores for overall emotions
    const overallEmotions: EmotionScore[] = Object.entries(emotionAggregates)
      .map(([name, scores]) => ({
        name,
        score: scores.reduce((sum, score) => sum + score, 0) / scores.length,
      }))
      .sort((a, b) => b.score - a.score);

    // Get top 10 emotions for display
    const top10Emotions = overallEmotions.slice(0, 10);

    // Get analyzed emotions based on user settings
    const analyzedEmotions = overallEmotions
      .filter((emotion) => emotion.score >= emotionThreshold)
      .slice(0, maxEmotions);

    return {
      emotions: top10Emotions,
      analyzedEmotions,
      sentenceEmotions,
      transcript,
    };
  }

  /**
   * Generate insights based on analysis type
   */
  static async generateInsights(
    analysisData: Partial<AnalysisData>,
    analysisType: AnalysisType
  ): Promise<string> {
    const config = getInsightGenerationConfig(analysisType);

    // Prepare the request payload based on analysis type
    const payload = {
      transcript: analysisData.transcript,
      topEmotions: analysisData.analyzedEmotions,
      analysisType,
      sentenceEmotions: config.useSentenceLevel
        ? analysisData.sentenceEmotions
        : undefined,
    };

    const response = await fetch("/api/generate-insights", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to generate insights");
    }

    const { insights } = await response.json();
    return insights;
  }

  /**
   * Create complete analysis data object
   */
  static createAnalysisData(
    processedResponse: {
      emotions: EmotionScore[];
      analyzedEmotions: EmotionScore[];
      sentenceEmotions?: SentenceEmotion[];
      transcript: string;
    },
    insights: string,
    analysisType: AnalysisType
  ): AnalysisData {
    return {
      transcript: processedResponse.transcript,
      emotions: processedResponse.emotions,
      analyzedEmotions: processedResponse.analyzedEmotions,
      sentenceEmotions: processedResponse.sentenceEmotions,
      insights,
      analysisType,
    };
  }
}
