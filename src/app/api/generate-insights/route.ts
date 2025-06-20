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

    // Take all emotions (up to 10)
    const allEmotions = topEmotions.slice(0, 10);

    // Create the prompt for Claude
    const prompt = `You are an expert emotional intelligence coach analyzing the alignment between someone's speech and their detected emotions.

I've analyzed someone's voice recording and detected these emotions:
${allEmotions
  .map(
    (emotion, index) =>
      `${index + 1}. ${emotion.name} (${(emotion.score * 100).toFixed(
        1
      )}% intensity)`
  )
  .join("\n")}

Here's what they said:
"${transcript}"

Analyze the alignment between their speech content and their detected emotions. Focus ONLY on the emotions that show clear incongruence - where their words contradict or mask what they're actually feeling.

For each incongruent emotion you identify, explain:
1. **The Incongruence**: How do their words contradict this emotion? What are they saying vs. what they're feeling?
2. **The Blindspot**: What self-awareness opportunity does this reveal?

Only discuss emotions where there's a clear mismatch. If their speech aligns well with certain emotions, skip those entirely. Be concise and direct in your analysis.`;

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
