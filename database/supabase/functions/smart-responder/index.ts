import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Retired by decision: Viper no longer provides an AI chat assistant.
Deno.serve((_req: Request) => {
  return new Response(
    JSON.stringify({ error: "The Viper AI assistant has been retired." }),
    {
      status: 410,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    },
  );
});
