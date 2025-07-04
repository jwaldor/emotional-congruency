import { NextRequest, NextResponse } from "next/server";
import { getDbForRequest } from "@/lib/db";

interface FeedbackRequest {
  resultId?: string;
  email?: string;
  feedback: string;
}

export async function POST(request: NextRequest) {
  try {
    const { resultId, email, feedback }: FeedbackRequest = await request.json();

    if (!feedback || feedback.trim().length === 0) {
      return NextResponse.json(
        { error: "Feedback text is required" },
        { status: 400 }
      );
    }

    // Get the authenticated Supabase client
    const db = await getDbForRequest(request);

    // Save the feedback to the database
    const { data: feedbackRecord, error } = await db
      .from("feedback")
      .insert({
        analysis_id: resultId || null,
        email: email || null,
        feedback_text: feedback.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to save feedback" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: feedbackRecord.id,
      message: "Feedback saved successfully",
    });
  } catch (error) {
    console.error("Error saving feedback:", error);
    return NextResponse.json(
      { error: "Internal server error while saving feedback" },
      { status: 500 }
    );
  }
}
