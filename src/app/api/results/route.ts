import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { EmotionScore, AnalysisType } from "@/types/analysis";

interface SaveResultRequest {
  inputText: string;
  analysisText: string;
  analyzedEmotions?: EmotionScore[];
  analysisType?: AnalysisType;
}

export async function POST(request: NextRequest) {
  try {
    const {
      inputText,
      analysisText,
      analyzedEmotions,
      analysisType = "original",
    }: SaveResultRequest = await request.json();

    if (!inputText || !analysisText) {
      return NextResponse.json(
        { error: "inputText and analysisText are required" },
        { status: 400 }
      );
    }

    // Save the result to the database
    const result = await prisma.result.create({
      data: {
        inputText,
        analysisText,
        analyzedEmotions: analyzedEmotions
          ? JSON.stringify(analyzedEmotions)
          : null,
        analysisType,
      },
    });

    return NextResponse.json({
      id: result.id,
      message: "Result saved successfully",
    });
  } catch (error) {
    console.error("Error saving result:", error);
    return NextResponse.json(
      { error: "Internal server error while saving result" },
      { status: 500 }
    );
  }
}
