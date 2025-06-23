import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

    // Save the feedback to the database
    const feedbackRecord = await prisma.feedback.create({
      data: {
        resultId: resultId || null,
        email: email || null,
        feedback: feedback.trim(),
      },
    });

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
