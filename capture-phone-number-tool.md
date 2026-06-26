# Capture Confirmed Phone Number — Vapi Tool + n8n Implementation

## The Problem

The n8n end-of-call webhook uses `customer.number` (the caller's calling-from number) for the contact record. When a caller gives a *different* number mid-call, that number only exists in the transcript text — n8n never sees it as structured data.

## The Fix: A Vapi Tool Called `capture_contact_number`

Riley fires this tool the moment she gets explicit verbal confirmation on a number. Vapi sends it to a dedicated n8n webhook in real time — before the call even ends. n8n stores it keyed to the call ID. When the end-of-call webhook fires, it checks for a stored confirmed number and uses that instead of `customer.number`.

---

## Step 1 — Add the Tool to Riley in Vapi

In Vapi dashboard → Riley assistant → Tools → Add Tool → Server Tool

Paste this JSON:

```json
{
  "type": "function",
  "function": {
    "name": "capture_contact_number",
    "description": "Call this ONLY after you have read the phone number back digit by digit AND received explicit verbal confirmation from the caller (e.g. 'yes', 'correct', 'that's right'). Do NOT call this if there is any ambiguity. Parameters: phone_number is the confirmed digits exactly as the caller stated them.",
    "parameters": {
      "type": "object",
      "properties": {
        "phone_number": {
          "type": "string",
          "description": "The confirmed phone number as spoken by the caller — digits only, no formatting (e.g. '7253325105')"
        },
        "caller_name": {
          "type": "string",
          "description": "The caller's name if collected during the call"
        }
      },
      "required": ["phone_number"]
    }
  },
  "server": {
    "url": "YOUR_N8N_CONFIRMED_NUMBER_WEBHOOK_URL"
  }
}
```

**Important:** Set the server URL to a NEW n8n webhook (separate from the end-of-call webhook). You'll create this in Step 2.

---

## Step 2 — Create a New n8n Webhook for the Tool Call

In n8n, create a new workflow:

**Node 1: Webhook**
- Method: POST
- Path: `/vapi-confirmed-number` (or whatever you prefer)
- Copy the full webhook URL — paste it into the Vapi tool server URL above

**Node 2: Set Fields**
Extract from the incoming payload:
```
call_id     → {{ $json.call.id }}
phone       → {{ $json.message.toolCallList[0].function.arguments.phone_number }}
name        → {{ $json.message.toolCallList[0].function.arguments.caller_name }}
```

**Node 3: Supabase — Upsert to a `confirmed_numbers` table**

Create this table in Supabase first:
```sql
CREATE TABLE confirmed_numbers (
  call_id     TEXT PRIMARY KEY,
  phone       TEXT NOT NULL,
  name        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

Upsert with:
- URL: `{{ $vars.SUPABASE_URL }}/rest/v1/confirmed_numbers?on_conflict=call_id`
- Method: POST
- Header: `Prefer: resolution=merge-duplicates`
- Body:
```json
{
  "call_id": "{{ $node['Set Fields'].json.call_id }}",
  "phone":   "{{ $node['Set Fields'].json.phone }}",
  "name":    "{{ $node['Set Fields'].json.name }}"
}
```

**Node 4: Respond to Vapi**
Return 200 with:
```json
{ "result": "Phone number captured successfully." }
```
Vapi requires a response or it will retry.

---

## Step 3 — Update the End-of-Call Workflow

In your existing Vapi Call Writeback workflow, before the "Insert/Update Contact" node, add:

**New Node: Supabase — Look Up Confirmed Number**
- URL: `{{ $vars.SUPABASE_URL }}/rest/v1/confirmed_numbers?call_id=eq.{{ $json.call.id }}&select=phone,name`
- Method: GET

**New Node: Set — Resolve Phone Number**
```
resolved_phone → {{ $json[0]?.phone || $node['Webhook'].json.call.customer.number }}
resolved_name  → {{ $json[0]?.name || $node['Webhook'].json.call.customer.name }}
```

This logic: use the confirmed number if Riley captured one, otherwise fall back to the calling-from number.

Then pass `resolved_phone` into your existing contact upsert instead of `customer.number`.

---

## How It Flows End-to-End

```
Caller gives number mid-call
        ↓
Riley reads it back digit by digit
        ↓
Caller confirms verbally ("yes, correct")
        ↓
Riley fires capture_contact_number tool
        ↓
Vapi POSTs to n8n confirmed-number webhook
        ↓
n8n stores { call_id, phone, name } in Supabase
        ↓
Call ends → end-of-call webhook fires
        ↓
n8n looks up confirmed_numbers by call_id
        ↓
Finds confirmed number → uses it for contact record
        ↓
SMS / booking link goes to the RIGHT number
```

---

## Also Add to Riley's Prompt

After the tool is live, add this line to the PHONE NUMBER CAPTURE section:

```
After confirming the number, Riley fires the capture_contact_number 
tool automatically. This is what sends the number to the system — 
it must be called immediately after confirmation, before saying 
"I'll text that over now."
```

This keeps Riley's behavior in sync with what the tool expects.

---

## Cleanup (Optional)

Add a scheduled job or trigger in n8n to delete rows from `confirmed_numbers` older than 24 hours — keeps the table lean.

```sql
DELETE FROM confirmed_numbers WHERE created_at < NOW() - INTERVAL '24 hours';
```
