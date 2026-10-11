const SUPABASE_URL = "https://kzazuetxlklmyyrcvgif.supabase.co";
const SUPABASE_KEY = "sb_publishable_sqN8XOmc9fzf0YJ1Xx0Vhw_38cmCyKR";
const ALLOWED_ORIGIN = "https://hughston-cyber.github.io";
const MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Vary": "Origin"
  }});
}
async function sbGet(path, token) {
  const r = await fetch(SUPABASE_URL + path, { headers: {
    apikey: SUPABASE_KEY, Authorization: "Bearer " + token
  }, cache: "no-store" });
  const d = await r.json().catch(() => null);
  if (!r.ok) throw new Error("Team data unavailable.");
  return d;
}
export default {
  async fetch(request, env) {
    if ((request.headers.get("Origin") || "") !== ALLOWED_ORIGIN)
      return json({ error: "Origin not allowed." }, 403);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      "Access-Control-Max-Age": "86400", Vary: "Origin"
    }});
    if (request.method !== "POST" || new URL(request.url).pathname !== "/api/assistant")
      return json({ error: "Not found." }, 404);
    const auth = request.headers.get("Authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token || token.length > 5000) return json({ error: "Please sign in again." }, 401);
    let body;
    try { body = await request.json(); } catch { return json({ error: "Enter a question." }, 400); }
    const question = typeof body?.question === "string" ? body.question.trim() : "";
    if (!question || question.length > 1500)
      return json({ error: "Questions must be between 1 and 1500 characters." }, 400);
    try {
      const authRes = await fetch(SUPABASE_URL + "/auth/v1/user", { headers: {
        apikey: SUPABASE_KEY, Authorization: "Bearer " + token
      }, cache: "no-store" });
      if (!authRes.ok) return json({ error: "Your session has expired. Please sign in again." }, 401);
      const user = await authRes.json();
      const profiles = await sbGet("/rest/v1/profiles?select=status,role&id=eq." + encodeURIComponent(user.id) + "&limit=1", token);
      if (!profiles?.[0] || profiles[0].status !== "approved")
        return json({ error: "Approved team membership is required." }, 403);
      const [races, stats, days] = await Promise.all([
        sbGet("/rest/v1/race_records?select=event,race_date,result,laps,notes&order=race_date.desc&limit=100", token),
        sbGet("/rest/v1/rider_stats?select=rider_name,event,laps,notes&order=event.asc&limit=200", token),
        sbGet("/rest/v1/race_days?select=title,race_date,venue,start_time,info&order=race_date.desc&limit=50", token)
      ]);
      const context = JSON.stringify({ race_records: races || [], rider_statistics: stats || [], race_days: days || [] }).slice(0, 24000);
      const system = "You are Viper AI, Team Venom HPR's friendly assistant. Answer both team-specific and general questions. Use the supplied records for team facts; never invent missing results, riders, statistics or schedules. If records do not answer a team question, say you cannot verify it and suggest asking the Captain. Never reveal credentials, access tokens or private account data. Team data JSON:\n" + context;
      const result = await env.AI.run(MODEL, { messages: [
        { role: "system", content: system },
        { role: "user", content: question }
      ], max_tokens: 500, temperature: 0.3 });
      const answer = typeof result?.response === "string" ? result.response.trim() : "";
      if (!answer) return json({ error: "Viper AI could not generate an answer. Please try again." }, 502);
      return json({ answer });
    } catch (err) {
      return json({ error: "Viper AI could not complete that request. Please try again shortly." }, 500);
    }
  }
};