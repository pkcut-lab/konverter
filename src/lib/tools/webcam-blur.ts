import type { InteractiveConfig } from './schemas';

/**
 * Webcam-Hintergrund-Unschärfe — Live-Kamera-Tool (§7a-Ausnahme).
 *
 * Greift per getUserMedia() auf die Kamera zu und verarbeitet jeden Frame
 * im Browser lokal via Canvas 2D + CSS backdrop-filter.
 * Progressive Enhancement: W3C Background Blur API (Chrome 114+) wenn verfügbar,
 * sonst Canvas-Compositing-Fallback.
 *
 * D1 WebCodecs/Safari-Fallback: BrowserCompatibilityNotice via Support-Check in Component.
 * D2 EU-AI-Act: kein ML-Modell — reine Filter-Verarbeitung, kein Disclaimer nötig.
 * D3 4K-Cap: getUserMedia cap auf 1280×720 ideal — kein 4K-Claim.
 *
 * Kein Server-Upload. Kein Tracking. Kamera-Stream bleibt lokal.
 */
export const webcamHintergrundUnschaerfe: InteractiveConfig = {
  id: 'webcam-blur',
  type: 'interactive',
  categoryId: 'video',
  canvasKind: 'canvas',
  exportFormats: ['png'],
};
