/**
 * Topher AI — Frontend Configuration
 *
 * Fill in your real values before deploying to production.
 * Add this file to .gitignore — do NOT commit real credentials.
 *
 * Where to find your values:
 *   Supabase  → https://app.supabase.com → Project → Settings → API
 *   n8n       → Your n8n instance → Webhook node → Production URL
 */

window.TOPHER_CONFIG = {

  // ─── Supabase ──────────────────────────────────────────────────────────────
  supabase: {
    url:     'https://YOUR_PROJECT_REF.supabase.co',
    anonKey: 'YOUR_SUPABASE_ANON_KEY',
  },

  // ─── n8n Webhooks ──────────────────────────────────────────────────────────
  // Each webhook maps to a distinct automation workflow in n8n.
  n8n: {
    // Fired on every new lead form submission.
    // Workflow: store lead → send internal Slack/email alert → trigger Vapi follow-up
    leadCaptureWebhook: 'https://YOUR_N8N_HOST/webhook/topher-lead-capture',

    // Fired specifically when intent === 'demo' (Book Demo CTA).
    // Workflow: create calendar slot → send confirmation SMS via Twilio → notify sales rep
    demoBookingWebhook: 'https://YOUR_N8N_HOST/webhook/topher-demo-booking',

    // Fired when intent === 'pilot' (Start Free Pilot CTA).
    // Workflow: provision pilot → send onboarding SMS sequence → alert team
    pilotStartWebhook: 'https://YOUR_N8N_HOST/webhook/topher-pilot-start',
  },

  // ─── Feature Flags ─────────────────────────────────────────────────────────
  // Toggle services independently without removing keys. Useful during testing.
  features: {
    supabase: true,  // Insert leads into Supabase `leads` table
    n8n:      true,  // Trigger n8n automation workflows
    // NOTE: Twilio SMS is executed server-side inside n8n — no client key needed.
    // NOTE: Vapi receptionist flows are triggered by n8n — no client key needed.
  },

};
