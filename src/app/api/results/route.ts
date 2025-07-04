import { NextRequest, NextResponse } from "next/server";
import { supabase, getDbForRequest } from "@/lib/db";
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

    // Get the authenticated Supabase client
    const db = await getDbForRequest(request);

    // Get the current user session to link the analysis
    const {
      data: { session },
    } = await db.auth.getSession();

    // Save the analysis to the database
    const { data: result, error } = await db
      .from("analyses")
      .insert({
        input_text: inputText,
        analysis_text: analysisText,
        analyzed_emotions: analyzedEmotions
          ? JSON.stringify(analyzedEmotions)
          : null,
        analysis_type: analysisType,
        user_id: session?.user?.id || null, // Link to user if authenticated
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to save result" },
        { status: 500 }
      );
    }

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
