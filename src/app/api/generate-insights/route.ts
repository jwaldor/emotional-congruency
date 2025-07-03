import { NextRequest, NextResponse } from "next/server";
import { getInsightGenerationConfig } from "@/lib/analysis-configs";
import { AnalysisType, EmotionScore, SentenceEmotion } from "@/types/analysis";

interface InsightRequest {
  transcript: string;
  topEmotions: EmotionScore[];
  analysisType?: AnalysisType;
  sentenceEmotions?: SentenceEmotion[];
}

export async function POST(request: NextRequest) {
  try {
    const {
      transcript,
      topEmotions,
      analysisType = "original",
      sentenceEmotions,
    }: InsightRequest = await request.json();

    if (!transcript || !topEmotions || topEmotions.length === 0) {
      return NextResponse.json(
        { error: "Transcript and emotions are required" },
        { status: 400 }
      );
    }

    // Get the appropriate insight generation configuration
    const insightConfig = getInsightGenerationConfig(analysisType);

    const openrouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openrouterApiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
        { status: 500 }
      );
    }

    // Take all emotions (up to 10)
    const allEmotions = topEmotions.slice(0, 10);

    // Create the prompt based on analysis type
    let prompt = insightConfig.systemPrompt;

    // Add transcript and emotions data
    prompt += `

TRANSCRIPT:
"${transcript}"

DETECTED EMOTIONS (with confidence scores):
${allEmotions
  .map((emotion) => `${emotion.name}: ${(emotion.score * 100).toFixed(1)}%`)
  .join("\n")}`;

    // Add sentence-level data if available
    if (
      insightConfig.useSentenceLevel &&
      sentenceEmotions &&
      sentenceEmotions.length > 0
    ) {
      prompt += `

SENTENCE-BY-SENTENCE EMOTIONAL ANALYSIS:
${sentenceEmotions
  .map((sentenceEmotion, index) => {
    const topSentenceEmotions = sentenceEmotion.emotions.slice(0, 3);
    return `${index + 1}. "${sentenceEmotion.sentence}"
   Top emotions: ${topSentenceEmotions
     .map((e) => `${e.name} (${(e.score * 100).toFixed(1)}%)`)
     .join(", ")}`;
  })
  .join("\n\n")}`;
    }

    prompt += `

Please provide thoughtful, personalized insights based on this emotional analysis:`;

    // Call Claude via OpenRouter
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openrouterApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Voice Emotion Analysis App",
        },
        body: JSON.stringify({
          model: "anthropic/claude-sonnet-4",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 1500,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", errorText);
      return NextResponse.json(
        { error: "Failed to generate insights" },
        { status: response.status }
      );
    }

    const result = await response.json();
    const insights =
      result.choices?.[0]?.message?.content || "No insights generated";

    return NextResponse.json({
      insights,
    });
  } catch (error) {
    console.error("Insight generation error:", error);
    return NextResponse.json(
      { error: "Internal server error during insight generation" },
      { status: 500 }
    );
  }
}
