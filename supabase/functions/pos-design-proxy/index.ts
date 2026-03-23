import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const WEBHOOK_URL =
  "https://n8n.srv1141999.hstgr.cloud/webhook/pos-display-design";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    let body: BodyInit;
    const headers: Record<string, string> = {};

    if (contentType.includes("multipart/form-data")) {
      // Forward FormData as-is
      body = await req.arrayBuffer();
      headers["content-type"] = contentType;
    } else {
      body = await req.text();
      headers["content-type"] = "application/json";
    }

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers,
      body,
    });

    const data = await response.text();

    if (response.status === 413) {
      return new Response(
        JSON.stringify({
          status: "error",
          error: "payload_too_large",
          message:
            "Artwork file is too large for processing. Please upload a smaller file (recommended under 700KB).",
        }),
        {
          status: 413,
          headers: { ...corsHeaders, "content-type": "application/json" },
        }
      );
    }

    return new Response(data, {
      status: response.status,
      headers: {
        ...corsHeaders,
        "content-type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ status: "error", error: message }),
      { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  }
});
