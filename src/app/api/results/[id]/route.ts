import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Result ID is required" },
        { status: 400 }
      );
    }

    // Get the result from the database
    const result = await prisma.result.findUnique({
      where: {
        id: id,
      },
    });

    if (!result) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    // Parse analyzed emotions if they exist
    let analyzedEmotions = null;
    if (result.analyzedEmotions) {
      try {
        analyzedEmotions = JSON.parse(result.analyzedEmotions);
      } catch (error) {
        console.error("Error parsing analyzed emotions:", error);
      }
    }

    return NextResponse.json({
      id: result.id,
      inputText: result.inputText,
      analysisText: result.analysisText,
      analyzedEmotions,
      analysisType: result.analysisType,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching result:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching result" },
      { status: 500 }
    );
  }
}
