T7 — JSON-LD per Tool — Worker-Output
Status: ready-for-review

Dateien:
- src/lib/seo/tool-jsonld.ts (implementiert)
- src/pages/[lang]/[slug].astro (nutzt buildToolJsonLd)

Coverage: alle Tools × {SoftwareApplication, BreadcrumbList} + FAQPage (wenn faq vorhanden) + HowTo (wenn steps vorhanden)

Schema-Mapping:
- SoftwareApplication mit applicationCategory nach Tool-Kategorie (dev→DeveloperApplication, image/video/audio→MultimediaApplication, color→DesignApplication, rest→UtilitiesApplication)
- BreadcrumbList: Home → Tool (2 Items)
- FAQPage: aus frontmatter.faq (wenn nicht leer)
- HowTo: aus aside.steps oder howToUse (wenn nicht leer)

Organization/WebSite-Blocks aus BaseLayout (T3) bleiben unangetastet.

Verifikation:
- Build: 154 pages — exit 0
- Spot-Check 3 Tools (meter-zu-fuss, webp-konverter, passwort-generator):
  - je 6 JSON-LD-Blöcke (Organization, WebSite, SoftwareApplication, BreadcrumbList, FAQPage, HowTo)
- npm run check: 0 errors / 0 warnings / 0 hints (126 Astro-Dateien)

Übergabe: quality-reviewer
