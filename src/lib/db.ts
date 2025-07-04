import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./db/schema";
import { createClient } from "@supabase/supabase-js";

// Supabase client for auth (client-side)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server-side Supabase client with service role key for admin operations
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// For now, we'll use the Supabase client directly for database operations
// This ensures RLS is properly enforced through Supabase's auth system
export const db = supabase;

// Helper function to get authenticated Supabase client for API routes
export async function getDbForRequest(request?: Request) {
  if (!request) {
    return supabase;
  }

  try {
    // Extract the Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return supabase;
    }

    const token = authHeader.substring(7);

    // Create a Supabase client with the user's session token
    const authenticatedSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    return authenticatedSupabase;
  } catch (error) {
    console.error("Error creating authenticated Supabase client:", error);
    return supabase;
  }
}

// Direct Drizzle client for when we need raw SQL operations
const connectionString = process.env.DATABASE_URL!;
const postgresClient = postgres(connectionString, { prepare: false });
export const drizzleDb = drizzle(postgresClient, { schema });
