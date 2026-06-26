# Topher AI — Inbound Receptionist System
## Complete Setup Guide

**Stack:** Vapi · n8n · Supabase · SMS (Twilio / Telnyx)  
**Vapi Number:** +1 (447) 274-9290  
**Vapi Phone Number ID:** `18b63c79-4421-47f4-969a-1283ac6380e2`

---

## 1. SUPABASE TABLES

You need four tables. Run the SQL below in your Supabase SQL Editor.

### Recommended Table Structure

| Table | Purpose |
|---|---|
| `calls` | Every call record from Vapi |
| `contacts` | Upserted lead/contact records |
| `sms_messages` | All outbound SMS log |
| `sms_conversations` | STOP / opt-out tracking |

---

## 2. SQL — Create All Tables

```sql
-- ─────────────────────────────────────────
-- CALLS — every inbound call record
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS calls (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id          TEXT        UNIQUE NOT NULL,
  phone_number_id  TEXT,
  assistant_id     TEXT,
  caller_phone     TEXT,
  caller_name      TEXT,
  duration_seconds INTEGER     DEFAULT 0,
  call_status      TEXT        DEFAULT 'unknown',
    -- answered | missed | voicemail | short | unknown
  call_type        TEXT        DEFAULT 'unknown',
    -- new_lead | existing_client | support_request | partnership | spam | unknown
  urgency          TEXT        DEFAULT 'cold',
    -- hot | warm | cold | spam
  transcript       TEXT,
  summary          TEXT,
  recording_url    TEXT,
  language         TEXT        DEFAULT 'en',
  started_at       TIMESTAMPTZ,
  ended_at         TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_calls_caller_phone ON calls(caller_phone);
CREATE INDEX IF NOT EXISTS idx_calls_urgency      ON calls(urgency);
CREATE INDEX IF NOT EXISTS idx_calls_created_at   ON calls(created_at DESC);


-- ─────────────────────────────────────────
-- CONTACTS — upserted lead/contact records
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  phone            TEXT        UNIQUE NOT NULL,
  name             TEXT,
  email            TEXT,
  business_name    TEXT,
  industry         TEXT,
  service_interest TEXT,
  pain_point       TEXT,
  budget           TEXT,
  timeline         TEXT,
  preferred_contact TEXT,
  language         TEXT        DEFAULT 'en',
  urgency          TEXT        DEFAULT 'cold',
  lead_status      TEXT        DEFAULT 'new',
    -- new | contacted | qualified | proposal | closed | lost
  call_count       INTEGER     DEFAULT 1,
  last_call_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contacts_phone    ON contacts(phone);
CREATE INDEX IF NOT EXISTS idx_contacts_urgency  ON contacts(urgency);
CREATE INDEX IF NOT EXISTS idx_contacts_email    ON contacts(email);


-- ─────────────────────────────────────────
-- SMS_MESSAGES — all outbound SMS log
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sms_messages (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  to_number           TEXT        NOT NULL,
  from_number         TEXT        NOT NULL,
  message             TEXT        NOT NULL,
  direction           TEXT        DEFAULT 'outbound',
    -- outbound | inbound
  message_type        TEXT,
    -- missed_call_textback | admin_lead_alert | follow_up | manual
  call_id             TEXT,
  status              TEXT        DEFAULT 'sent',
  provider            TEXT,
  provider_message_id TEXT,
  created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sms_to_number   ON sms_messages(to_number);
CREATE INDEX IF NOT EXISTS idx_sms_created_at  ON sms_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_type        ON sms_messages(message_type);


-- ─────────────────────────────────────────
-- SMS_CONVERSATIONS — STOP / opt-out tracking
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sms_conversations (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  phone          TEXT        UNIQUE NOT NULL,
  opted_out      BOOLEAN     DEFAULT false,
  opted_out_at   TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sms_conv_phone     ON sms_conversations(phone);
CREATE INDEX IF NOT EXISTS idx_sms_conv_opted_out ON sms_conversations(opted_out);
```

> **Enable Row Level Security (RLS) recommended for production.** For n8n access, use the `service_role` key which bypasses RLS.

---

## 3. N8N WORKFLOW IMPORT

### File to import
`topher-ai-receptionist.json`

### Import Steps

1. Open your n8n instance
2. Click **Workflows** in the left sidebar
3. Click **Add Workflow** → **Import from File**
4. Select `topher-ai-receptionist.json`
5. Click **Import**
6. The workflow will open in editor — do NOT activate yet

### Set Workflow Variables

Go to **Variables** (top-right of the workflow editor) and create these:

| Variable Name | Value | Notes |
|---|---|---|
| `SUPABASE_URL` | `https://xxxx.supabase.co` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | `eyJ...` | Service role key (Settings → API) |
| `OPENAI_API_KEY` | `sk-...` | Your OpenAI API key |
| `SMS_API_KEY` | `...` | Twilio: account SID:auth token base64, or Telnyx key |
| `SMS_API_URL` | See below | SMS provider endpoint |
| `SMS_FROM_NUMBER` | `+14472749290` | Your Vapi/Telnyx/Twilio number |
| `ADMIN_PHONE` | `+1XXXXXXXXXX` | Christopher's phone for alerts |
| `TOPHER_AI_PHONE_NUMBER` | `+14472749290` | For text-back messages |
| `VAPI_ASSISTANT_ID` | `...` | Your Vapi assistant ID |

### SMS Provider Configuration

**If using Twilio:**
- `SMS_API_URL` = `https://api.twilio.com/2010-04-01/Accounts/{ACCOUNT_SID}/Messages.json`
- `SMS_API_KEY` = `{ACCOUNT_SID}:{AUTH_TOKEN}` (base64 encoded)
- Change Authorization header to `Basic {{ $vars.SMS_API_KEY }}`
- Body format: `From=+1xxx&To=+1xxx&Body=message` (form-encoded, not JSON)

**If using Telnyx:**
- `SMS_API_URL` = `https://api.telnyx.com/v2/messages`
- `SMS_API_KEY` = Your Telnyx API key
- Body format stays as JSON: `{ from, to, text }`

**If using a generic provider:** Adjust the `Send Missed-Call Text-Back` and `Send Admin SMS Alert` nodes to match your provider's format.

### Get Your Webhook URL

1. Click the **Vapi Webhook** node
2. Copy the **Test URL** (for testing) or **Production URL** (after activation)
https://topherai.app.n8n.cloud/webhook/vapi-topher
3. It will look like: `https://your-n8n.com/webhook/vapi-topher`
4. **Save this URL** — you will put it in Vapi

### Activate the Workflow

1. Click **Save** (top right)
2. Toggle **Active** to ON
3. Use the **Production URL** from the Webhook node in Vapi

---

## 4. VAPI ASSISTANT SETUP

### Manual Setup Instructions

Go to [dashboard.vapi.ai](https://dashboard.vapi.ai) → **Assistants** → **Create Assistant**

#### Basic Settings

| Setting | Value |
|---|---|
| **Assistant Name** | Topher AI Concierge |
| **First Message** | See below |
| **Voice Provider** | ElevenLabs or PlayHT |
| **Voice** | ElevenLabs: `Adam` or `Rachel` · PlayHT: `Jennifer` |
| **Model** | OpenAI `gpt-4o` |
| **Language** | English (auto-detect Spanish recommended) |

#### First Message
```
Hi, thanks for calling Topher AI — I'm the AI assistant here. How can I help you today?
```

#### End Call Phrases
```
Thanks so much for calling. We'll be in touch very soon.
Have a great day — talk soon!
We'll follow up shortly. Take care!
```

#### Voicemail Detection
Enable voicemail detection: **Yes**
Voicemail message:
```
Hi, you've reached Topher AI. We help businesses automate their operations with AI. Leave a brief message and Christopher will get back to you, or visit topherai.com to learn more. Talk soon!
```

#### Silence Timeout
Set to: **30 seconds**

#### Max Call Duration
Set to: **8 minutes**

---

## 5. VAPI SYSTEM PROMPT

Paste this exactly into the **System Prompt** field of your Vapi assistant:

```
You are the AI Concierge for Topher AI, an AI automation agency run by Christopher. Your job is to warmly greet callers, understand why they're calling, and gather enough information for Christopher to follow up intelligently.

---

WHO TOPHER AI SERVES:
- Business owners who want to automate their phone and lead intake
- Service businesses (contractors, medical, legal, real estate, insurance, etc.)
- Companies that are losing leads because they can't answer every call
- Anyone who needs AI automation, CRM integration, or custom AI workflows

WHAT TOPHER AI BUILDS:
- AI receptionists (voice AI that answers every call)
- Missed-call text-back systems
- SMS lead alert pipelines
- n8n automation workflows
- CRM and calendar integrations
- AI lead capture systems
- Custom AI agents
- Business process automation

---

YOUR PERSONALITY:
- Calm, warm, and confident
- Professional but conversational — never stiff or robotic
- Concise — get to the point without being rushed
- You listen more than you talk
- You never pitch or upsell — just understand and capture

---

YOUR PRIMARY JOB:
1. Greet the caller warmly
2. Understand why they're calling in 1-2 exchanges
3. Collect their name naturally in conversation
4. Understand their business and what they need help with
5. Find out their main pain point (what's not working for them right now)
6. Ask about timeline and urgency if it makes sense
7. Let them know Christopher will follow up personally
8. End the call cleanly

---

WHAT TO COLLECT (naturally, not as a checklist):
- Their name
- Business name and industry
- What service or solution they're looking for
- Their main frustration or problem
- Budget if it comes up naturally
- Timeline / urgency
- Best way to reach them (call, text, email)
- Email if they offer it

---

RULES:
- Never make up information about Topher AI's pricing or availability
- Never promise specific timelines — always say "Christopher will be in touch soon"
- If they ask a technical question you can't answer, say: "That's a great question for Christopher — I want to make sure you get accurate details. He'll cover that when he follows up."
- If they seem frustrated or in a rush, acknowledge it: "I hear you — let me make sure Christopher has everything he needs to reach out quickly."
- If they speak Spanish, switch fully to Spanish and continue in Spanish
- Keep responses under 3 sentences per turn
- Never ask more than one question at a time
- If it's clearly a wrong number or spam, politely end the call

---

EXAMPLE OPENING FLOW:
Caller: "Hi yeah, I run a roofing company and I'm missing like 30% of my calls."
You: "That's a really common problem — and it's costing you jobs. So you're looking for something that would answer those calls and capture those leads for you?"
Caller: "Yeah exactly."
You: "Got it. What's your name and the name of your company? I want to make sure Christopher has the full picture when he reaches out."

---

END OF CALL:
Always close with something warm and specific:
- "Thanks [Name] — Christopher will reach out to you at [number] very soon."
- "You're in good hands. We'll be in touch shortly."
Never leave the caller hanging — confirm they'll hear back.
```

---

## 6. WEBHOOK URL

After activating your n8n workflow, your webhook URL will be:

```
https://YOUR-N8N-DOMAIN/webhook/vapi-topher
```

**Where to put it in Vapi:**

1. Go to your assistant in Vapi dashboard
2. Click **Advanced** → **Server URL**
3. Paste your webhook URL
4. Set **Server URL Secret** (optional but recommended — store it as an n8n variable and validate in the webhook node)
5. Under **Messages to Send**, enable: `end-of-call-report`
6. Save the assistant

**Important:** Use the **Production webhook URL**, not the test URL.

---

## 7. PHONE NUMBER ASSIGNMENT (VAPI)

1. Go to Vapi dashboard → **Phone Numbers**
2. Find your number: `+1 (447) 274-9290`  
   (ID: `18b63c79-4421-47f4-969a-1283ac6380e2`)
3. Click the number → **Assistant**
4. Select **Topher AI Concierge**
5. Save

---

## 8. TEST CURL PAYLOADS

Replace `YOUR-WEBHOOK-URL` with your actual n8n webhook URL.

### Test 1 — Answered Call (Hot Lead)
```bash
curl -X POST YOUR-WEBHOOK-URL \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "type": "end-of-call-report",
      "call": {
        "id": "test-call-001",
        "phoneNumberId": "18b63c79-4421-47f4-969a-1283ac6380e2",
        "assistantId": "YOUR-ASSISTANT-ID",
        "customer": { "number": "+12135000001" },
        "startedAt": "2025-05-16T14:00:00Z",
        "endedAt": "2025-05-16T14:03:45Z",
        "endedReason": "customer-ended-call"
      },
      "transcript": "AI: Hi, thanks for calling Topher AI. How can I help you today?\nCaller: Hi, I run a dental office in Los Angeles and we are missing a lot of calls. I need something to answer them automatically.\nAI: Got it — how many calls are you missing roughly?\nCaller: Probably 20 or 30 a day. It is really bad.\nAI: That is definitely costing you patients. Are you looking to start something like this pretty quickly?\nCaller: Yes, like this month. Budget is not really an issue, I just need it working.\nAI: Perfect. What is your name and the practice name?\nCaller: Dr. Sarah Chen, Bright Smile Dental.\nAI: Great Dr. Chen. Christopher will reach out to you today.",
      "summary": "Dr. Sarah Chen from Bright Smile Dental in Los Angeles. Dental office missing 20-30 calls per day. Wants an AI receptionist to answer calls automatically. Ready to start this month, budget not a concern. Hot lead."
    }
  }'
```

### Test 2 — Warm Lead (Support / Existing Client Feel)
```bash
curl -X POST YOUR-WEBHOOK-URL \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "type": "end-of-call-report",
      "call": {
        "id": "test-call-002",
        "phoneNumberId": "18b63c79-4421-47f4-969a-1283ac6380e2",
        "assistantId": "YOUR-ASSISTANT-ID",
        "customer": { "number": "+12135000002" },
        "startedAt": "2025-05-16T15:00:00Z",
        "endedAt": "2025-05-16T15:02:10Z",
        "endedReason": "assistant-ended-call"
      },
      "transcript": "AI: Hi, thanks for calling Topher AI. How can I help?\nCaller: Hey yeah I was just curious about what you guys do. I have a small HVAC company.\nAI: Of course. Are you looking for help with anything specific, like answering calls or following up with leads?\nCaller: Maybe both. I am not sure yet. Just exploring.\nAI: Totally makes sense. What is your name?\nCaller: Mike Rodriguez, Rodriguez HVAC.\nAI: Got it Mike. Christopher can walk you through what makes sense for an HVAC operation. Best number to reach you?",
      "summary": "Mike Rodriguez, Rodriguez HVAC. Exploring AI receptionist and lead follow-up options. Not sure exactly what he needs yet. Warm lead — no urgency, just exploring."
    }
  }'
```

### Test 3 — Support Request
```bash
curl -X POST YOUR-WEBHOOK-URL \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "type": "end-of-call-report",
      "call": {
        "id": "test-call-003",
        "phoneNumberId": "18b63c79-4421-47f4-969a-1283ac6380e2",
        "assistantId": "YOUR-ASSISTANT-ID",
        "customer": { "number": "+12135000003" },
        "startedAt": "2025-05-16T16:00:00Z",
        "endedAt": "2025-05-16T16:01:30Z",
        "endedReason": "customer-ended-call"
      },
      "transcript": "AI: Hi, thanks for calling Topher AI. How can I help?\nCaller: Hi yes I am an existing client. My missed call texts stopped working yesterday. Is there an outage or something?\nAI: I am sorry to hear that. I want to make sure Christopher looks into this right away. Can I get your name?\nCaller: Jennifer Hale. Hale Law Group.\nAI: Got it Jennifer. I am flagging this as urgent for Christopher. He will reach out to you within the hour.",
      "summary": "Jennifer Hale, Hale Law Group. Existing client. Missed-call text-back system stopped working yesterday. Support request — urgent."
    }
  }'
```

### Test 4 — Missed Call (No Answer)
```bash
curl -X POST YOUR-WEBHOOK-URL \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "type": "end-of-call-report",
      "call": {
        "id": "test-call-004",
        "phoneNumberId": "18b63c79-4421-47f4-969a-1283ac6380e2",
        "assistantId": "YOUR-ASSISTANT-ID",
        "customer": { "number": "+12135000004" },
        "startedAt": "2025-05-16T17:00:00Z",
        "endedAt": "2025-05-16T17:00:12Z",
        "endedReason": "no-answer"
      },
      "transcript": "",
      "summary": ""
    }
  }'
```

### Test 5 — Spam / Wrong Number
```bash
curl -X POST YOUR-WEBHOOK-URL \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "type": "end-of-call-report",
      "call": {
        "id": "test-call-005",
        "phoneNumberId": "18b63c79-4421-47f4-969a-1283ac6380e2",
        "assistantId": "YOUR-ASSISTANT-ID",
        "customer": { "number": "+12135000005" },
        "startedAt": "2025-05-16T18:00:00Z",
        "endedAt": "2025-05-16T18:00:28Z",
        "endedReason": "customer-ended-call"
      },
      "transcript": "AI: Hi, thanks for calling Topher AI. How can I help?\nCaller: Is this Pizza Palace? I want to order a large pepperoni.\nAI: I think you may have the wrong number — this is Topher AI. No worries though! Have a great day.\nCaller: Oh sorry.",
      "summary": "Wrong number. Caller was looking for Pizza Palace. No business relevance."
    }
  }'
```

---

## 9. WORKFLOW VARIABLES QUICK REFERENCE

Set all of these in your n8n workflow under **Variables**:

```
SUPABASE_URL          = https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_KEY  = eyJhbGci...  (service_role key)
OPENAI_API_KEY        = sk-...
SMS_API_KEY           = your-sms-provider-key
SMS_API_URL           = your-sms-provider-endpoint
SMS_FROM_NUMBER       = +14472749290
ADMIN_PHONE           = +1XXXXXXXXXX  (Christopher's number)
TOPHER_AI_PHONE_NUMBER = +14472749290
VAPI_ASSISTANT_ID     = your-vapi-assistant-id
```

---

## 10. WORKFLOW LOGIC SUMMARY

```
Vapi POST → Extract Call Data
  │
  ├─ isMissed = true ──→ Check Dup SMS (24hr window)
  │                         │
  │                         ├─ Already texted? → STOP (no duplicate)
  │                         └─ Not texted → Check STOP/Opt-Out
  │                                           │
  │                                           ├─ Opted out? → STOP
  │                                           └─ Not opted out → Send Text-Back → Log SMS
  │
  └─ wasAnswered = true → Classify with OpenAI (gpt-4o-mini)
                            → Parse AI Response
                            → Save Call to Supabase
                            → Upsert Contact in Supabase
                            → Is Hot or Warm?
                                ├─ YES → Build Admin SMS → Send Alert → Log SMS
                                └─ NO  → End (cold/spam not alerted)
```

---

## 11. NOTES & NEXT STEPS

- **Cold leads** are saved to Supabase but do not trigger an SMS alert. You can build a daily digest instead.
- **Spam calls** are classified and saved but no alert is sent and no text-back is triggered.
- **The missed-call text-back** fires even if the caller hung up in 1 second — by design (missed is missed).
- **Duplicate protection** is 24 hours per phone number per message type.
- **STOP handling** requires you to build an inbound SMS handler that writes `opted_out: true` to `sms_conversations` when a caller replies STOP.
- **Recording URLs** are saved but transcription is handled by Vapi — make sure transcription is enabled in your Vapi assistant settings.
- To add **email notifications**, add an n8n Send Email node after `Build Admin Alert Message`.
- To add **Slack alerts**, add an HTTP Request to the Slack webhook in parallel with the SMS alert.
