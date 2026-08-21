import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    siteUrl: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
    vercelUrl: Boolean(process.env.NEXT_PUBLIC_VERCEL_URL),
    nodeEnv: process.env.NODE_ENV,
  });
}
