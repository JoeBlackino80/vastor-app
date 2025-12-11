import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID")!;
const twilioToken = Deno.env.get("TWILIO_AUTH_TOKEN")!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

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
    const phoneRaw = body?.phone;

    if (!phoneRaw || typeof phoneRaw !== "string") {
      return new Response(
        JSON.stringify({ ok: false, reason: "missing_phone" }),
        { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    // Normalize phone number
    let phone = phoneRaw.trim().replace(/\s/g, "");
    if (!phone.startsWith("+")) {
      if (phone.startsWith("00")) {
        phone = "+" + phone.slice(2);
      } else if (phone.startsWith("0")) {
        phone = "+421" + phone.slice(1); // Default to Slovakia
      } else {
        phone = "+" + phone;
      }
    }

    const otp = generateOtp();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

    // Store OTP in database (using phone as identifier)
    const { error: insertError } = await supabase
      .from("auth_otp_codes")
      .insert({
        email: phone, // Reusing email column for phone
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

    // Send SMS via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
    const authHeader = btoa(`${twilioSid}:${twilioToken}`);

    const smsBody = new URLSearchParams({
      To: phone,
      From: "VORU",
      Body: `VORU: Váš overovací kód je ${otp}. Platný 10 minút.`,
    });

    const twilioRes = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: smsBody.toString(),
    });

    const twilioData = await twilioRes.json();

    if (!twilioRes.ok) {
      console.error("Twilio error:", twilioData);
      return new Response(
        JSON.stringify({ ok: false, reason: "sms_error", error: twilioData }),
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
