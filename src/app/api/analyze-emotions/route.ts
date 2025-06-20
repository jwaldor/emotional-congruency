import { NextRequest, NextResponse } from "next/server";
import { HumeClient } from "hume";

interface EmotionScore {
  name: string;
  score: number;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    const humeApiKey = process.env.HUME_API_KEY;
    if (!humeApiKey) {
      return NextResponse.json(
        { error: "Hume API key not configured" },
        { status: 500 }
      );
    }

    // Initialize Hume client
    const hume = new HumeClient({
      apiKey: humeApiKey,
    });

    // Step 1: Submit job using Hume SDK with local file and transcription
    const jobResponse =
      await hume.expressionMeasurement.batch.startInferenceJobFromLocalFile(
        [audioFile], // Pass the File object directly
        {
          json: {
            models: {
              prosody: {},
              burst: {},
            },
            transcription: {
              language: "en", // English language for transcription
            },
          },
        }
      );

    const jobId = jobResponse.jobId;

    // Step 2: Wait for job completion by polling
    let jobCompleted = false;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout

    while (!jobCompleted && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second

      const jobDetails = await hume.expressionMeasurement.batch.getJobDetails(
        jobId
      );

      if (jobDetails.state.status === "COMPLETED") {
        jobCompleted = true;
      } else if (jobDetails.state.status === "FAILED") {
        return NextResponse.json(
          { error: "Emotion analysis job failed" },
          { status: 500 }
        );
      }

      attempts++;
    }

    if (!jobCompleted) {
      return NextResponse.json(
        { error: "Emotion analysis timed out" },
        { status: 408 }
      );
    }

    // Step 3: Get predictions using SDK
    const predictions =
      await hume.expressionMeasurement.batch.getJobPredictions(jobId);

    // Extract emotion scores and transcript
    const emotions: EmotionScore[] = [];
    let transcript = "";

    if (predictions && predictions.length > 0) {
      const firstResult = predictions[0];

      // Extract transcript from prosody predictions
      if (
        firstResult.results?.predictions &&
        firstResult.results.predictions.length > 0
      ) {
        const prosodyPredictions = firstResult.results.predictions[0];
        if (prosodyPredictions.models?.prosody?.groupedPredictions) {
          // Collect all text segments from prosody predictions
          const textSegments: string[] = [];
          prosodyPredictions.models.prosody.groupedPredictions.forEach(
            (group) => {
              group.predictions.forEach((prediction) => {
                if (prediction.text) {
                  textSegments.push(prediction.text);
                }
              });
            }
          );
          transcript = textSegments.join(" ");
        }
      }

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
            (group) => {
              group.predictions.forEach((prediction) => {
                prediction.emotions.forEach((emotion) => {
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
            (group) => {
              group.predictions.forEach((prediction) => {
                prediction.emotions.forEach((emotion) => {
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

    return NextResponse.json({
      emotions: emotions.slice(0, 10), // Return top 10 emotions for display
      transcript: transcript.trim(), // Return the transcript from Hume
    });
  } catch (error) {
    console.error("Emotion analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error during emotion analysis" },
      { status: 500 }
    );
  }
}
