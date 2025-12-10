import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ ok: false, reason: "method_not_allowed" }),
      { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }

  try {
    const body = await req.json().catch(() => null);
    const emailRaw = body?.email;
    const codeRaw = body?.code;

    if (!emailRaw || !codeRaw) {
      return new Response(
        JSON.stringify({ ok: false, reason: "missing_email_or_code" }),
        { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    const email = String(emailRaw).trim().toLowerCase();
    const code = String(codeRaw).trim();

    const { data, error } = await supabase
      .from("auth_otp_codes")
      .select("*")
      .eq("email", email)
      .eq("code", code)
      .is("used_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return new Response(
        JSON.stringify({ ok: false, reason: "db_error", error }),
        { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    if (!data) {
      return new Response(
        JSON.stringify({ ok: false, reason: "invalid_code" }),
        { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    const now = new Date();
    const expiresAt = new Date(data.expires_at);

    if (expiresAt < now) {
      return new Response(
        JSON.stringify({ ok: false, reason: "expired" }),
        { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    await supabase
      .from("auth_otp_codes")
      .update({ used_at: now.toISOString() })
      .eq("id", data.id);

    return new Response(
      JSON.stringify({ ok: true, email }),
      { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, reason: "exception", error: String(e) }),
      { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }
});
