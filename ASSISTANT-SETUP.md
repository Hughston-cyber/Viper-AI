# Viper AI Assistant — Cloudflare setup

The assistant page and navigation are in this repository. To activate AI answers, deploy `assistant-worker.js` as a separate Cloudflare Worker.

## 1. Create the Worker
1. Open the Cloudflare dashboard and select **Workers & Pages**.
2. Choose **Create** → **Worker** and name it exactly `viper-ai-assistant`.
3. Open its code editor and replace the starter code with the complete contents of this repository's `assistant-worker.js`.
4. Save and deploy.

The expected endpoint is:
`https://viper-ai-assistant.hughfletcher.workers.dev/api/assistant`

If Cloudflare assigns a different workers.dev hostname, update the `API` constant in `assistant.html` to match.

## 2. Add the Workers AI binding
1. Open the `viper-ai-assistant` Worker → **Settings** → **Bindings**.
2. Add a **Workers AI** binding.
3. Set the variable name to exactly `AI`.
4. Save the binding and redeploy if prompted.

The code uses the Cloudflare Workers AI model `@cf/meta/llama-3.3-70b-instruct-fp8-fast`. Check your account's Workers AI availability and current usage/pricing before enabling it.

## 3. Test
1. Open `https://hughston-cyber.github.io/Viper-AI/index.html`.
2. Sign in with an approved member account.
3. Click **Viper Assistant** and ask a test question.
4. Confirm an unapproved or signed-out visitor cannot use the assistant.

## Security notes
- The assistant verifies the Supabase session and checks that the profile is approved before loading team records.
- Supabase row-level security still applies to data requests.
- Do not add service-role keys, passwords, or other secrets to this repository.
- The browser page only calls the assistant Worker; AI model calls happen on the server.
