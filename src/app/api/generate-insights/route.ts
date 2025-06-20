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
    const prompt = `You are an expert emotional intelligence coach analyzing the alignment between someone's speech and their detected emotions.

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

For each of the top 3 emotions detected, evaluate:
1. **Congruence**: How well does their speech content align with this emotion? Are they expressing what they're feeling?
2. **Incongruence**: Where do their words contradict or mask this emotion? What are they saying vs. what they're feeling?
3. **Blindspots**: What emotional blindspots does this incongruence reveal? What might they be unaware of about their emotional state?

Focus on identifying patterns where their speech doesn't match their emotions, as these gaps often reveal important self-awareness opportunities. Be concise and direct in your analysis.`;

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
