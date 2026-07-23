> Send a voice message on Telegram the ecosystem transcribes it, converts it to a structured task, dispatches it, and optionally speaks the result back. Fully hands-free.

**Status**: [built] 2026-05-25 (session 47). Files: `orchestrator/notifier/voice.py` (VoiceHandler), `orchestrator/notifier/telegram_commands.py` (on_voice, _handle_voice, /task command), `orchestrator/orchestrator.py` (_tg_submit shared helper).

**Requires for live use**: OPENAI_API_KEY (Whisper transcription) — already set. ELEVENLABS_KEY optional (TTS reply). Send a voice message to the Telegram bot to test.

---

## Pipeline

```
Evo sends Telegram voice message
 │
 ▼
Telegram Bot receives audio file
 │
 ▼
Whisper API transcribes to text
 │
 ▼
Prompt Converter structures the request
 │
 ▼
[Orchestration](/notes/orchestration) dispatches to correct agent(s)
 │
 ▼
Task completes result text
 │
 ▼
ElevenLabs TTS converts result to audio
 │
 ▼
Telegram Bot sends voice reply to Evo
```

---

## Components

| Component | Tool | Purpose |
|---|---|---|
| Voice input | Telegram Bot API | Receive audio file from Evo |
| Transcription | OpenAI Whisper | Audio text |
| Task structuring | Prompt Converter | Text structured .md task |
| Dispatch | [Orchestration](/notes/orchestration) | Route to correct agent |
| TTS output | ElevenLabs API | Text natural speech |
| Voice delivery | Telegram Bot API | Send audio reply |

---

## Credentials Required

- `ELEVENLABS_KEY` — already in Credential Manager
- `OPENAI_API_KEY` — for Whisper transcription
- Telegram Bot Token — new, created via @BotFather

---

## Use Cases

- "Hey, research the top 3 competitors of Notion and send me a summary"
- "Start a code review on the auth module"
- "What did the coder agent do today?"
- "Approve the pending deployment"

---

## Technical Notes

- Whisper API is available via `OPENAI_API_KEY` — no additional setup needed once the key is configured
- ElevenLabs requires a separate `ELEVENLABS_KEY` — the cheapest tier (free) has 10,000 characters/month
- The Telegram bot's `getUpdates` polling loop in `telegram_commands.py` already receives voice messages — they arrive as `voice` objects with a `file_id` that can be downloaded via the Files API
- Voice replies from ElevenLabs should be sent using the Telegram `sendAudio` endpoint

## Implementation Plan

1. Extend `telegram_commands.py` to detect `voice` message type in updates
2. Download the audio file using Telegram's `getFile` endpoint `urllib.request`
3. Pass the audio to OpenAI Whisper (`audio/transcriptions` endpoint) transcript text
4. Feed transcript to the Planner or directly to Orchestrator's `/task` endpoint
5. When task completes, POST result text to ElevenLabs `/v1/text-to-speech/{voice_id}`
6. Send the returned MP3 bytes via Telegram `sendAudio`

## Related Nodes

- [Components/Core/Notification System](/notes/notification-system) — Telegram bot infrastructure (already live)
- Features/Planned/Tailscale VPN — secure remote access needed before enabling audio replies
- Components/Security/Approval Gates — voice approve/reject for pending actions
