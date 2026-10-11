export default {
async fetch(request, env) {
const url = new URL(request.url);
const path = url.pathname;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json; charset=utf-8",
};
const respond = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders,
  });
if (request.method === "OPTIONS") {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
try {
  // Check API and database connection
  if (path === "/api/health" && request.method === "GET") {
    await env.DB.prepare("SELECT 1 AS connected").first();
    return respond({
      success: true,
      application: "JUNAID ABBASI",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  }
  // Read saved panel settings
  if (path === "/api/settings" && request.method === "GET") {
    const result = await env.DB.prepare(
      "SELECT setting_key, setting_value FROM panel_settings"
    ).all();
    return respond({
      success: true,
      settings: result.results,
    });
  }
  return respond({
    success: false,
    message: "API endpoint not found",
  }, 404);
} catch (error) {
  console.error("API error:", error);
  return respond({
    success: false,
    message: "Server or database error",
  }, 500);
}

},
};