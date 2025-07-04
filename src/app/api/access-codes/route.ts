import { NextRequest, NextResponse } from "next/server";
import { getDbForRequest, supabaseAdmin } from "@/lib/db";

interface CreateAccessCodeRequest {
  code?: string;
  maxUses?: number;
  expiresAt?: string;
  isGeneral?: boolean;
}

interface ValidateAccessCodeRequest {
  code: string;
}

// GET - Validate an access code
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: "Access code is required" },
        { status: 400 }
      );
    }

    // Use admin client for validation to bypass RLS
    const { data: accessCode, error } = await supabaseAdmin
      .from('access_codes')
      .select('*')
      .eq('code', code)
      .single();

    if (error || !accessCode) {
      return NextResponse.json(
        { valid: false, error: "Invalid access code" },
        { status: 404 }
      );
    }

    // Check if code is expired
    if (accessCode.expires_at && new Date(accessCode.expires_at) < new Date()) {
      return NextResponse.json(
        { valid: false, error: "Access code has expired" },
        { status: 400 }
      );
    }

    // Check if code has reached max uses
    if (accessCode.current_uses >= accessCode.max_uses) {
      return NextResponse.json(
        { valid: false, error: "Access code has reached maximum uses" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      accessCode: {
        id: accessCode.id,
        code: accessCode.code,
        maxUses: accessCode.max_uses,
        currentUses: accessCode.current_uses,
        expiresAt: accessCode.expires_at,
        isGeneral: accessCode.is_general,
      }
    });
  } catch (error) {
    console.error("Error validating access code:", error);
    return NextResponse.json(
      { error: "Internal server error while validating access code" },
      { status: 500 }
    );
  }
}

// POST - Create a new access code (requires authentication)
export async function POST(request: NextRequest) {
  try {
    const {
      code,
      maxUses = 1,
      expiresAt,
      isGeneral = false,
    }: CreateAccessCodeRequest = await request.json();

    // Get the authenticated Supabase client
    const db = await getDbForRequest(request);
    
    // Get the current user session
    const { data: { session } } = await db.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Generate a random code if not provided
    const accessCodeValue = code || Math.random().toString(36).substring(2, 15);

    // Create the access code
    const { data: newAccessCode, error } = await db
      .from('access_codes')
      .insert({
        code: accessCodeValue,
        created_by_id: session.user.id,
        max_uses: maxUses,
        expires_at: expiresAt || null,
        is_general: isGeneral,
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to create access code" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: newAccessCode.id,
      code: newAccessCode.code,
      message: "Access code created successfully",
    });
  } catch (error) {
    console.error("Error creating access code:", error);
    return NextResponse.json(
      { error: "Internal server error while creating access code" },
      { status: 500 }
    );
  }
}

// PUT - Use an access code (increment usage count)
export async function PUT(request: NextRequest) {
  try {
    const { code }: ValidateAccessCodeRequest = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "Access code is required" },
        { status: 400 }
      );
    }

    // Use admin client to update usage count
    const { data: accessCode, error: fetchError } = await supabaseAdmin
      .from('access_codes')
      .select('*')
      .eq('code', code)
      .single();

    if (fetchError || !accessCode) {
      return NextResponse.json(
        { error: "Invalid access code" },
        { status: 404 }
      );
    }

    // Check if code is still valid
    if (accessCode.expires_at && new Date(accessCode.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Access code has expired" },
        { status: 400 }
      );
    }

    if (accessCode.current_uses >= accessCode.max_uses) {
      return NextResponse.json(
        { error: "Access code has reached maximum uses" },
        { status: 400 }
      );
    }

    // Increment usage count
    const { error: updateError } = await supabaseAdmin
      .from('access_codes')
      .update({ current_uses: accessCode.current_uses + 1 })
      .eq('id', accessCode.id);

    if (updateError) {
      console.error("Database error:", updateError);
      return NextResponse.json(
        { error: "Failed to update access code usage" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Access code used successfully",
      remainingUses: accessCode.max_uses - (accessCode.current_uses + 1),
    });
  } catch (error) {
    console.error("Error using access code:", error);
    return NextResponse.json(
      { error: "Internal server error while using access code" },
      { status: 500 }
    );
  }
}
