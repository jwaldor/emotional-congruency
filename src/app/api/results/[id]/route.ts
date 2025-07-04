import { NextRequest, NextResponse } from "next/server";
import { getDbForRequest } from "@/lib/db";

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

    // Get the authenticated Supabase client
    const db = await getDbForRequest(request);

    // Get the analysis from the database
    const { data: result, error } = await db
      .from("analyses")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !result) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    // Parse analyzed emotions if they exist
    let analyzedEmotions = null;
    if (result.analyzed_emotions) {
      try {
        analyzedEmotions = JSON.parse(result.analyzed_emotions);
      } catch (error) {
        console.error("Error parsing analyzed emotions:", error);
      }
    }

    return NextResponse.json({
      id: result.id,
      inputText: result.input_text,
      analysisText: result.analysis_text,
      analyzedEmotions,
      analysisType: result.analysis_type,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    });
  } catch (error) {
    console.error("Error fetching result:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching result" },
      { status: 500 }
    );
  }
}
