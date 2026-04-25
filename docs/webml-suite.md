# WebML-Suite — In-Browser KI-Werkzeuge

Diese Dokumentation beschreibt die Integration von High-Performance Machine Learning Modellen direkt im Browser (WebML) für Konverter.de. Alle Werkzeuge dieser Suite folgen der **Privacy-First-Architektur**: Keine Daten verlassen den Browser, die Inferenz findet zu 100 % lokal statt.

## Kerntechnologien
- **Engine:** [Transformers.js v3](https://huggingface.co/docs/transformers.js/index)
- **Runtime:** ONNX Runtime Web (WASM / WebGPU EP)
- **Modell-Hosting:** Hugging Face Hub (via `onnx-community` oder `Xenova` Hub-Instanzen)
- **UI:** Svelte 5 mit Lazy-Loading (Modelle werden erst bei Benutzung geladen)

## Tool-Inventar & Status

| Tool-ID | Modell-ID (HF) | Beschreibung | Status |
|---|---|---|---|
| `ki-text-detektor` | `onnx-community/roberta-base-openai-detector-ONNX` | Erkennt KI-generierte Texte (z.B. GPT-4, Claude). | ✅ Live |
| `ki-bild-detektor` | `onnx-community/SMOGY-Ai-images-detector-ONNX` | Erkennt KI-generierte Bilder (Stable Diffusion, Midjourney). | ✅ Live |
| `audio-transkription` | `openai/whisper-base` | Audio-zu-Text Transkription (Whisper). | ✅ Live |
| `distil-whisper` | `distil-whisper/distil-medium.en` | Schnelle Audio Transkription (Distil-Whisper). | 📅 Geplant |
| `depth-anything` | `onnx-community/depth-anything-v2-small` | Erzeugt Tiefenkarten aus jedem Foto. | 📅 Geplant |
| `segment-anything` | `onnx-community/segment-anything-model-t` | Segmente Objekte in Bildern via Klick-Maske. | 📅 Geplant |
| `tokenizer-playground` | *Various* | Experimente mit verschiedenen Tokenizern (BPE, WordPiece). | 📅 Geplant |
| `lokaler-ki-chat` | `onnx-community/Phi-3-mini-4k-instruct-onnx` | Privater KI-Chatbot, der komplett offline läuft. | 📅 Geplant |
| `video-objekt-erkennung` | `Xenova/yolov8n` | Echtzeit-Objekterkennung in Video-Streams. | 📅 Geplant |
| `ki-musik-generator` | `facebook/musicgen-small` | Text-zu-Musik Generierung im Browser. | 📅 Geplant |

## Funktionsweise für Agenten

### 1. Lazy-Loading
Modelle sind oft 50MB-200MB groß. Wir laden sie erst, wenn der User den "Analysieren"-Button drückt.
- **Workflow:** UI zeigt Initial-State → User wählt Datei/Text → Klick auf Start → `pipeline()` wird geladen → Progress-Bar zeigt Download-Status.

### 2. Privatsphäre
Jedes Tool in dieser Suite **muss** einen Disclaimer im Footer haben:
> "Alle Berechnungen finden lokal in deinem Browser statt. Keine Daten werden an Server übertragen."

### 3. Pipeline-Integration
Die Integration erfolgt über:
- `src/lib/tools/<id>.ts`: Enthält die Transformers.js Singleton-Logik.
- `src/components/tools/<Id>Tool.svelte`: Die Svelte-UI mit Fortschrittsanzeige.
- `src/lib/tool-registry.ts`: Registrierung für Lazy-Loading.

## Ressourcen & Links
- [Transformers.js Demos Collection](https://huggingface.co/collections/Xenova/transformersjs-demos)
- [ONNX Community Models](https://huggingface.co/onnx-community)
