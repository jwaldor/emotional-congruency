import { NextRequest, NextResponse } from "next/server";
import { HumeClient } from "hume";
import { AnalysisFactory } from "@/lib/analysis-factory";
import { getAnalysisConfig } from "@/lib/analysis-configs";
import { AnalysisType } from "@/types/analysis";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const emotionThreshold =
      parseFloat(formData.get("emotionThreshold") as string) || 0.0;
    const maxEmotions = parseInt(formData.get("maxEmotions") as string) || 3;
    const analysisType =
      (formData.get("analysisType") as AnalysisType) || "original";

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

    // Get analysis configuration
    const analysisConfig = getAnalysisConfig(analysisType);

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
            models: analysisConfig.humeConfig || {
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

    // Process the response using AnalysisFactory
    const processedResponse = AnalysisFactory.processHumeResponse(
      { results: predictions },
      analysisType,
      emotionThreshold,
      maxEmotions
    );

    return NextResponse.json({
      emotions: processedResponse.emotions, // Always return top 10 for display
      analyzedEmotions: processedResponse.analyzedEmotions, // Return the subset that was analyzed
      sentenceEmotions: processedResponse.sentenceEmotions, // For sentence-level analysis
      transcript: processedResponse.transcript.trim(), // Return the transcript from Hume
      analysisType, // Return the analysis type used
      displayType:
        analysisType === "sentence-level" && processedResponse.sentenceEmotions
          ? "sentence-level"
          : "standard", // How to display emotions
    });
  } catch (error) {
    console.error("Emotion analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error during emotion analysis" },
      { status: 500 }
    );
  }
}
