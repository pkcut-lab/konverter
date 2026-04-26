---
toolId: audio-transkription
language: en
title: "Audio Transcription — Speech to Text"
headingHtml: "Audio Transcription — <em>Speech to Text</em>"
metaDescription: "Transcribe audio files to text instantly in your browser. No uploads, no account needed. Powered by on-device ML — 100% private, fast, and free."
tagline: "Turn spoken words into editable text — entirely in your browser, no server uploads, no account required."
intro: "Paste or drop an audio file and get a text transcript in seconds. The transcription engine runs on-device using WebAssembly-powered ML, so your audio never leaves your computer."
howToUse:
  - "Click the upload area or drag and drop an audio file (MP3, WAV, M4A, OGG, WebM supported)."
  - "Select the spoken language if auto-detection isn't accurate enough."
  - "Click Transcribe and wait while the model processes your file locally."
  - "Review the transcript in the output panel — edit inline if needed."
  - "Copy the text or download it as a .txt file."
faq:
  - q: "Does my audio get sent to a server?"
    a: "No. The transcription model runs entirely inside your browser using WebAssembly. Your audio file never leaves your device."
  - q: "Which audio formats are supported?"
    a: "MP3, WAV, M4A, OGG, and WebM. If your file is in a different format, convert it to MP3 or WAV first using a free audio converter."
  - q: "How long does transcription take?"
    a: "Typical speech at standard quality transcribes at roughly 2–4× real-time speed in a modern browser. A 5-minute recording usually completes in under 2 minutes."
  - q: "How accurate is the transcription?"
    a: "Accuracy depends on audio quality, accent, and background noise. Clear, close-mic speech typically reaches 90–95% word accuracy. Noisy recordings will score lower."
  - q: "Can I transcribe multiple speakers?"
    a: "Speaker diarization (labeling who said what) is not currently supported. The output is a single continuous transcript. You can manually add speaker labels after copying."
  - q: "Is there a file size limit?"
    a: "Processing happens in-browser, so very large files (over 200 MB) may slow down or crash older devices. For long recordings, splitting into 30-minute chunks is recommended."
relatedTools:
  - image-to-text
  - ai-text-detector
  - character-counter
category: audio
contentVersion: 1
---

## What This Tool Does

This tool converts the spoken content of an audio file into a plain-text transcript — without uploading anything to a server. It uses a compact speech-recognition model compiled to WebAssembly, which runs directly inside your browser tab. You get the full transcript in a scrollable, editable text panel that you can copy or download.

Supported input formats include MP3, WAV, M4A (AAC), OGG Vorbis, and WebM Opus — the most common formats produced by phones, voice recorders, video editors, and meeting apps.

## Formula / How It Works

The engine is based on a Whisper-architecture model distilled for browser inference:

```
Audio file → decode to PCM → chunk into 30-second windows
  → mel-spectrogram → encoder (transformer) → decoder (beam search)
  → token sequence → detokenize → plain text
```

Each 30-second window is processed sequentially. Timestamps are computed relative to the chunk boundary, so the output order matches the original recording timeline. No cloud API is involved at any stage.

## Language Detection

The model auto-detects the spoken language from the first 30 seconds of audio. If detection is wrong — common with short clips or heavy accents — use the language dropdown to force a specific language before transcribing.

| Setting | When to Use |
|---|---|
| Auto-detect | Monolingual recordings ≥ 30 sec |
| Force language | Short clips, strong regional accents |
| English (US) | Podcasts, meetings, dictation |
| English (UK/AU) | British/Australian accented content |

## Common Use Cases

**Meeting notes.** Drop in a recorded Zoom or Teams call and get a rough transcript to clean up into meeting minutes. Most 1-hour meetings produce a 5,000–8,000 word transcript.

**Podcast show notes.** Transcribe an episode to pull quotes, create timestamps, or generate an SEO-friendly episode description.

**Video captions.** Extract dialogue from a video's audio track, then format it as SRT subtitle entries. Combine with a free video editor to add closed captions.

**Dictation clean-up.** Voice memos recorded on iPhone or Android can be transcribed and then edited without retyping.

**Academic research.** Qualitative researchers can transcribe interview recordings without sending sensitive data to a third-party transcription service.

## Frequently Asked Questions

**Does my audio get sent to a server?**
No. The transcription model runs entirely inside your browser using WebAssembly. Your audio file never leaves your device. There is no backend, no API key, and no logging. This makes it suitable for confidential recordings — medical, legal, or personal.

**Which audio formats are supported?**
MP3, WAV, M4A, OGG, and WebM. These cover the output of virtually every phone voice recorder, desktop DAW, and video conferencing app. If you have an exotic format (FLAC, AIFF, WMA), convert it to MP3 at 128 kbps first — audio quality above 192 kbps doesn't improve transcription accuracy.

**How long does transcription take?**
Transcription speed depends on your device's CPU (and GPU if WebGPU is available). On a modern laptop, a 5-minute recording typically finishes in 1–2 minutes. On a phone or older hardware, expect 4–6 minutes for the same file.

**How accurate is the transcription?**
For clear, close-mic English speech in a quiet environment, word error rates typically fall between 5–10%. Background music, strong accents, technical jargon, and overlapping speakers all increase error rates. Always proofread before publishing.

**Can I transcribe multiple speakers?**
The current engine outputs a single continuous transcript without speaker labels. After copying the text, you can manually insert speaker names based on context or use a separate diarization tool.

**Is there a file size limit?**
There's no hard cap, but in-browser processing of very large files (over 200 MB) can exhaust browser memory on older devices. For recordings over 2 hours, splitting into 30-minute segments before uploading is strongly recommended.
