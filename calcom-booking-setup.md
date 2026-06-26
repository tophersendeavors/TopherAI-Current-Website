# Cal.com Live Booking — Full Setup Guide

Topher AI books directly into Cal.com during the call.  
No booking links. No follow-up texts. The appointment is locked in before the caller hangs up.

---

## How It Works

```
Caller agrees to book
  → Topher calls checkAvailability (Vapi tool)
    → n8n fetches real-time slots from Cal.com
    → Topher reads 2-3 slots to the caller naturally
  → Caller picks a slot
    → Topher asks for their email
    → Topher calls createBooking (Vapi tool)
      → n8n creates the appointment in Cal.com
      → Caller and business owner get a confirmation email
  → Topher confirms: "You're booked for Thursday at 2pm. Confirmation is on its way."
```

---

## Step 1 — Cal.com Setup

### 1a. Create your Event Type
1. Log into Cal.com
2. Go to **Event Types → New Event Type**
3. Set:
   - **Title**: Free Consultation (or whatever your appointment is called)
   - **Duration**: 30 minutes (or your actual length)
   - **Location**: Phone call
   - **Availability**: Set your working hours schedule
4. Save and note the **Event Type ID** from the URL: `cal.com/event-types/XXXXXX`

### 1b. Get your API Key
1. Go to **Settings → Developer → API Keys**
2. Create a new key with a clear label: `topher-ai-booking`
3. Copy the key — you'll add it to n8n in Step 3

---

## Step 2 — Import the n8n Workflow

1. In n8n, go to **Workflows → Import**
2. Upload `calcom-booking-workflow.json`
3. The workflow will appear as **"Vapi — Cal.com Live Booking"**
4. **Activate** the workflow (toggle top right)
5. Copy the **Webhook URL** — it will look like:
   ```
   https://your-n8n-instance.com/webhook/vapi-calcom-booking
   ```
   You'll need this URL in Step 4.

---

## Step 3 — Set n8n Variables

In n8n, go to **Settings → Variables** and create these:

| Variable Name          | Value                              | Example                        |
|------------------------|------------------------------------|--------------------------------|
| `CALCOM_API_KEY`       | Your Cal.com API key               | `cal_live_xxxxxxxxxxxxxxxx`    |
| `CALCOM_EVENT_TYPE_ID` | Your event type numeric ID         | `123456`                       |
| `CALCOM_TIMEZONE`      | Your business timezone             | `America/Los_Angeles`          |
| `CALCOM_DURATION_MIN`  | Appointment length in minutes      | `30`                           |

> **Note:** `CALCOM_TIMEZONE` must match the timezone set in your Cal.com availability schedule, or slots will be offset.

---

## Step 4 — Add Tools to Your Vapi Assistant

In the Vapi dashboard, open your assistant (Riley or any industry demo) and add **two tools**.

### Tool 1 — checkAvailability

```json
{
  "type": "function",
  "messages": [
    {
      "type": "request-start",
      "content": "Let me check what's available."
    }
  ],
  "function": {
    "name": "checkAvailability",
    "description": "Check real-time available appointment slots on the calendar. Call this when a caller wants to book and you need to offer specific time options. Do not guess at availability — always call this tool first.",
    "parameters": {
      "type": "object",
      "properties": {
        "preference": {
          "type": "string",
          "description": "The caller's stated preference — e.g. 'mornings', 'afternoons', 'this week', 'Tuesday', or 'flexible'"
        }
      },
      "required": []
    }
  },
  "server": {
    "url": "YOUR_N8N_WEBHOOK_URL_HERE"
  }
}
```

### Tool 2 — createBooking

```json
{
  "type": "function",
  "messages": [
    {
      "type": "request-start",
      "content": "One moment while I lock that in."
    }
  ],
  "function": {
    "name": "createBooking",
    "description": "Book an appointment directly on the calendar. Call this after the caller has confirmed a specific slot from checkAvailability. You must have the caller's name, email, and the ISO datetime of their chosen slot before calling this.",
    "parameters": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "description": "The caller's full name"
        },
        "email": {
          "type": "string",
          "description": "The caller's email address — needed to send the booking confirmation"
        },
        "phone": {
          "type": "string",
          "description": "The caller's phone number (optional but preferred)"
        },
        "slot_iso": {
          "type": "string",
          "description": "The ISO 8601 datetime of the confirmed slot, exactly as returned in brackets from checkAvailability. Example: 2026-05-29T14:00:00.000Z"
        }
      },
      "required": ["name", "email", "slot_iso"]
    }
  },
  "server": {
    "url": "YOUR_N8N_WEBHOOK_URL_HERE"
  }
}
```

> Replace `YOUR_N8N_WEBHOOK_URL_HERE` in both tools with the Webhook URL from Step 2.

---

## Step 5 — Update the Assistant's System Prompt

Replace the **BOOKING LOGIC** section in Riley's (or Jordan's) system prompt with the following:

---

### BOOKING LOGIC — DIRECT CALENDAR INTEGRATION

You have live access to the calendar. Book appointments directly during the call.
**Never send a booking link. Never say you'll follow up with a link.**

#### STEP 1 — Get preference
Ask naturally:
"Do you prefer mornings or afternoons? And is there a day this week that works best?"

#### STEP 2 — Check availability
Call `checkAvailability` with their preference.
The result will list available slots — read 2 or 3 aloud, naturally.
Do NOT read the ISO datetimes in brackets — those are for system use only.

Example phrasing:
"I've got Thursday at 9am, Thursday at 2pm, or Friday at 11. Any of those work?"

#### STEP 3 — Get email
Once the caller picks a slot, ask for their email:
"What email should I send the confirmation to?"

#### STEP 4 — Create the booking
Call `createBooking` with:
- `name` — caller's name (already collected)
- `email` — just confirmed
- `phone` — caller's phone (if captured)
- `slot_iso` — the ISO datetime in brackets from the checkAvailability result

#### STEP 5 — Confirm to the caller
"You're booked for [day] at [time]. Confirmation is heading to [email] right now.
The whole thing takes about [duration] — see you then."

#### FALLBACK — if both tools fail
Only if the tools are unavailable:
"I'm having a brief issue on my end — let me take your info and our team will confirm
the appointment within the next hour."
Collect name, phone, email, and preferred time. Then end the call.

#### RULES
- Never say "I'll send you a link to book."
- Never say "You can schedule on our website."
- Never offer to text a booking link.
- If you do not have the caller's email, ask before calling createBooking.
- If checkAvailability returns no slots, apologize and take their info for a callback.

---

## Step 6 — Test the Flow

1. Call your Vapi number
2. Express interest in booking an appointment
3. The assistant should:
   - Ask for your day/time preference
   - Pause briefly ("Let me check what's available")
   - Read back 2-3 real time slots from your Cal.com calendar
   - Ask for your email
   - Create the actual booking
   - Confirm with the appointment time
4. Check your Cal.com dashboard — the booking should appear immediately

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| No slots returned | Event type ID wrong, or no availability set | Double-check `CALCOM_EVENT_TYPE_ID` and Cal.com schedule |
| Booking fails with auth error | API key incorrect or expired | Regenerate key in Cal.com → Settings → API Keys |
| Wrong timezone on slots | Timezone mismatch | Ensure `CALCOM_TIMEZONE` matches your Cal.com availability timezone |
| Assistant reads ISO datetimes aloud | Prompt not updated | Make sure the "do NOT read brackets" instruction is in the system prompt |
| Booking created but wrong duration | `CALCOM_DURATION_MIN` mismatch | Set variable to match your Cal.com event type duration exactly |

---

## Files Reference

| File | Purpose |
|------|---------|
| `calcom-booking-workflow.json` | n8n workflow — import this |
| `calcom-booking-setup.md` | This guide |
| `riley-system-prompt.md` | Update BOOKING LOGIC section with Step 5 above |
| `demos/roofing-demo-system-prompt.md` | Same booking update applies to Jordan |
