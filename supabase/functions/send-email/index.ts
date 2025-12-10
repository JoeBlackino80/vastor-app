import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";
import { Resend } from "npm:resend@3.4.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});
const resend = new Resend(resendApiKey);

function generateOtp(): string {
  const n = Math.floor(Math.random() * 1_000_000);
  return n.toString().padStart(6, "0");
}

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

    if (!emailRaw || typeof emailRaw !== "string") {
      return new Response(
        JSON.stringify({ ok: false, reason: "missing_email" }),
        { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    const email = emailRaw.trim().toLowerCase();
    const otp = generateOtp();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

    const { error: insertError } = await supabase
      .from("auth_otp_codes")
      .insert({
        email,
        code: otp,
        expires_at: expiresAt.toISOString(),
        used_at: null,
      });

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ ok: false, reason: "db_error", error: insertError }),
        { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    const subject = "VORU – Váš prihlasovací kód";
    const html = `
      <div style="font-family: system-ui, sans-serif; background:#0b0b10; color:#f5f5f5; padding:24px;">
        <div style="max-width:480px; margin:0 auto; background:#141421; border-radius:16px; padding:24px; border:1px solid #29293a;">
          <h1 style="font-size:22px; margin:0 0 16px;">Váš prihlasovací kód</h1>
          <p style="font-size:14px; margin:0 0 16px;">Tento kód použite na prihlásenie do VORU:</p>
          <div style="text-align:center; margin:24px 0;">
            <span style="display:inline-block; font-size:32px; letter-spacing:0.4em; background:#1f1f2e; padding:16px 24px; border-radius:12px; border:1px solid #3c3c55; font-weight:bold;">
              ${otp}
            </span>
          </div>
          <p style="font-size:12px; color:#aaa;">Kód je platný <strong>10 minút</strong>.</p>
          <p style="font-size:12px; color:#666;">Ak ste o prihlásenie nežiadali, ignorujte tento e-mail.</p>
        </div>
      </div>
    `;

    const { error: resendError } = await resend.emails.send({
      from: "VORU <noreply@voru.sk>",
      to: email,
      subject,
      html,
    });

    if (resendError) {
      console.error("Resend error:", resendError);
      return new Response(
        JSON.stringify({ ok: false, reason: "email_error", error: resendError }),
        { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  } catch (e) {
    console.error("Exception:", e);
    return new Response(
      JSON.stringify({ ok: false, reason: "exception", error: String(e) }),
      { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }
});
