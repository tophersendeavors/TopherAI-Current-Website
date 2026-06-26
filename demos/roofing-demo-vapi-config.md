# Roofing Demo — Vapi Assistant Setup

## What This Is
Jordan is the demo receptionist for the Roofing / Contractor vertical.  
Riley transfers roofing prospects to Jordan so they hear exactly what  
their callers would experience when Topher AI is deployed for their business.

---

## Vapi Dashboard Settings

### Basic Info
| Field | Value |
|---|---|
| Name | Jordan — Roofing Demo |
| First Message | `Thanks for calling Summit Roofing — this is Jordan. This call may be recorded. What can I do for you today?` |

### Model
| Field | Value |
|---|---|
| Provider | OpenAI |
| Model | gpt-4o |
| Temperature | 0.6 |
| System Prompt | *(paste full contents of `roofing-demo-system-prompt.md`)* |

### Voice
| Field | Value |
|---|---|
| Provider | 11Labs |
| Voice | Recommended: **Jessica** or **Matilda** (warm, professional, American female) |
| Stability | 0.45 |
| Similarity Boost | 0.80 |

> Note: Pick a voice that sounds distinctly different from Riley  
> so the prospect notices the switch to a specialized demo.

### Transcriber
| Field | Value |
|---|---|
| Provider | Deepgram |
| Model | nova-2 |
| Language | en-US |

### Call Settings
| Field | Value |
|---|---|
| Max Duration | 600 seconds (10 min) |
| Background Sound | office |
| Background Denoising | enabled |
| End Call Silence | 30 seconds |

### Server URL
Set this to your **n8n webhook URL** that receives Vapi transcript events  
(same as the stress-test transcript webhook, or a new one for production).

---

## Tools to Add (Optional — for live booking capability)
If Cal.com or Google Calendar is connected via n8n:
- `checkAvailability` — returns open inspection slots
- `createBooking` — locks in the appointment and triggers SMS confirmation

Without these tools, Jordan falls back to sending the booking link  
(already scripted in the prompt).

---

## After Creating the Assistant

1. Copy the **Assistant ID** from Vapi dashboard
2. Open `riley-system-prompt.md`
3. Find this line:
   ```
   - Contractor / roofing / home services → transfer to Contractor Demo
     [VAPI TRANSFER: assistant ID to be configured]
   ```
4. Replace with:
   ```
   - Contractor / roofing / home services → transfer to Jordan (Roofing Demo)
     [VAPI TRANSFER: YOUR_JORDAN_ASSISTANT_ID]
   ```
5. Update Riley's assistant in Vapi with the revised prompt

---

## Vapi Transfer Block (for Riley's assistant)
When adding the transfer, use a **Transfer Call** tool in Vapi:

```json
{
  "type": "transferCall",
  "destinations": [
    {
      "type": "assistant",
      "assistantId": "YOUR_JORDAN_ASSISTANT_ID",
      "message": "Give me one moment — I'm connecting you to the roofing version now. You'll hear exactly what your clients would hear when they call."
    }
  ]
}
```

---

## Demo Company Details (Pre-loaded in Prompt)
| Detail | Value |
|---|---|
| Company | Summit Roofing |
| Persona | Jordan |
| Services | Residential + commercial roofing, storm/insurance, gutters |
| Inspection Cost | Free |
| Avg Job Timeline | 1–2 days (residential) |
| Avg Replacement Cost | $8,000–$14,000 (2,000 sq ft, shingles) |
| Languages | English (+ Sofía Spanish handoff) |

These are baked into the prompt so Jordan can answer pricing, insurance,  
and service questions without hesitation — just like a trained team member would.
