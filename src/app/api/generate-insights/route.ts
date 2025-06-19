import { NextRequest, NextResponse } from "next/server";

interface EmotionScore {
  name: string;
  score: number;
}

interface InsightRequest {
  transcript: string;
  topEmotions: EmotionScore[];
}

export async function POST(request: NextRequest) {
  try {
    const { transcript, topEmotions }: InsightRequest = await request.json();

    if (!transcript || !topEmotions || topEmotions.length === 0) {
      return NextResponse.json(
        { error: "Transcript and emotions are required" },
        { status: 400 }
      );
    }

    const openrouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openrouterApiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
        { status: 500 }
      );
    }

    // Take top 3 emotions
    const top3Emotions = topEmotions.slice(0, 3);

    // Create the prompt for Claude
    const prompt = `You are an expert emotional intelligence coach helping people understand the subtle ways emotions influence their thoughts and communication.

I've analyzed someone's voice recording and detected these top emotions:
${top3Emotions
  .map(
    (emotion, index) =>
      `${index + 1}. ${emotion.name} (${(emotion.score * 100).toFixed(
        1
      )}% intensity)`
  )
  .join("\n")}

Here's what they said:
"${transcript}"

For each of the top 3 emotions detected, please explain:
1. How this emotion might be subtly manifesting in their speech patterns, word choices, or tone
2. What this emotion could reveal about their underlying thoughts, concerns, or mental state

The goal is to help them recognize emotional patterns they might not be consciously aware of, so they can develop better emotional self-awareness. Be insightful but gentle, focusing on growth and understanding rather than judgment.

Please structure your response with clear sections for each emotion, and keep the tone supportive and educational.`;

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
          model: "anthropic/claude-3.5-sonnet-20241022",
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
