import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface SaveResultRequest {
  inputText: string;
  analysisText: string;
}

export async function POST(request: NextRequest) {
  try {
    const { inputText, analysisText }: SaveResultRequest = await request.json();

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
