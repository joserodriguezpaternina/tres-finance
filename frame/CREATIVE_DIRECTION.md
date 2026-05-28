# FRAME — Creative Direction

## A. CREATIVE DIRECTION

**Product Vision**
FRAME is a cinematic prompt generation tool for directors, cinematographers, and AI artists. It occupies the intersection of a professional color suite (DaVinci Resolve), a creative briefing tool, and an editorial workspace. The experience should feel like working at the light table of a film production design studio.

**What FRAME is NOT:**
- It is not a SaaS dashboard
- It is not a chatbot interface
- It is not an image generator
- It is not a consumer app

**What FRAME IS:**
A precision instrument. Silent, warm, exact. Every interaction should carry the weight of a considered directorial choice.

---

## B. VISUAL SYSTEM

### Color Palette

```
Background:   #080807   Warm near-black (not pure black — has subtle warmth)
Surface:      #111110   Panel backgrounds
Surface-2:    #181816   Hover states, selected items
Border:       #2A2926   Primary dividers — barely visible

Text Primary:   #F0EDE6   Warm white (not pure white)
Text Secondary: #9A9790   Mid warm gray
Text Tertiary:  #585650   Muted elements
Text Ghost:     #2C2B28   Barely visible metadata

Accent Gold:    #C4B892   Used sparingly — active states, highlights, key values
Accent Blue:    #8BB4C8   Director references, style names
Accent Green:   #7AB89A   Success states, confirmed analysis
```

**Rule:** Gold appears on less than 8% of the interface at any moment. Its scarcity is what makes it feel precious.

### Typography

**Display / Headlines:** Cormorant (Google Fonts)
- Weight 300 (Light) for most display usage
- Weight 300 Italic for em-phrases — adds cinematographic poetry
- Usage: Landing page hero, section titles, manifesto, CTA
- Never use bold weight in display type

**UI / Body:** Inter
- Weight 300 for all body copy
- Weight 400 for labels, buttons, navigation
- Weight 500 only for logo mark
- Letter-spacing: 0.02–0.04em for readability at small sizes

**Technical / Code / Prompts:** JetBrains Mono
- Weight 300 for metadata, secondary info
- Weight 400 for prompt text, values
- Letter-spacing: 0.04–0.14em depending on context (more for labels, less for code)

### Scale

```
Display hero:    clamp(112px, 18vw, 288px)
Section title:   clamp(40px, 5vw, 68px)
Feature name:    clamp(44px, 4.5vw, 62px)
Manifesto:       clamp(38px, 5.5vw, 76px)
CTA:             clamp(72px, 11vw, 176px)

UI base:         13–15px
Labels (mono):   10–11px (always uppercase, tracked at 0.14–0.22em)
Micro/metadata:  9–10px
```

### Spacing & Grid

- Base unit: 8px
- Section padding: 128–200px vertical
- Content max-width: none (full bleed by design)
- Edge padding: 48px horizontal
- Grid: 12-column CSS Grid with 1px gap lines (not gutters)

**Key spacing principle:** Sections breathe. Empty space is not a mistake — it is the design.

### Grain Texture

Applied via animated SVG fractalNoise pseudo-element at 2.2–3.2% opacity. Animates position every 0.9s at opacity that varies by context (landing: 2.8%, workspace: 2.2%). This is the "film" quality of the interface. Do not remove it.

### Motion Language

```
Primary ease:    cubic-bezier(0.16, 1, 0.3, 1)   — Smooth deceleration, cinematic
Duration short:  200–300ms   Hover, micro-interactions
Duration medium: 600–1000ms  Reveals, page transitions
Duration long:   1200–1400ms Hero entrances
```

**Animation philosophy:** Everything enters. Nothing bounces. Transitions should feel like a camera cutting to a new frame — deliberate, considered, precise.

---

## C. UX FLOW

### Primary User Journey

1. **Land on homepage** → Immediate editorial impact. Hero typography overwhelms. User scrolls.
2. **Reel strip** → Visual mood established. Film frames without context suggest quality.
3. **Three-step features** → Process crystallizes in three words: Analyze / Translate / Generate.
4. **Workspace preview** → User sees the actual tool without clicking. Confidence builds.
5. **Manifesto** → Emotional alignment. The philosophy speaks to the director in them.
6. **Platforms** → Practical confirmation. "Yes, it works with my tools."
7. **CTA** → Emotional + practical resolve. Click to workspace.

### Workspace Flow

1. **Upload references** (drag/drop or click) — up to 12 images
2. **Select active reference** → analysis panel activates
3. **Click ANALYZE** → cinematic progress sequence
4. **Review generated prompt** → platform tabs to switch output format
5. **Edit tags** in right panel to refine
6. **Select variation** → compare A/B/C prompts
7. **Export** → one click per platform, copies to clipboard

### Keyboard-First Interactions

```
⌘K          Command palette
⌘A          Analyze current references
⌘E          Open export panel
⌘G          Generate new variation
⌘U          Add reference image
⌘M          Open moodboard
⌘↵          Copy active prompt
Esc         Close modal / palette
```

---

## D. LANDING PAGE STRUCTURE

| Section | Visual Language | Purpose |
|---|---|---|
| **Hero** | Dark fullscreen, enormous "Frame" in Cormorant, subtle column grid behind | Establish authority, declare product in one word |
| **Reel Strip** | Horizontal film strip of reference images, auto-drifts, mixed aspect ratios | Show the visual world the tool operates in |
| **Features (3-grid)** | 1px gap grid, each cell has giant Cormorant verb: Analyze / Translate / Generate | Process clarity without being a step diagram |
| **Workspace Preview** | App UI at 16:9, fully functional-looking, embedded in page | Builds confidence before signup |
| **Manifesto** | Two-column, quote in giant italic Cormorant | Emotional connection |
| **How it works** | Four steps, numbered in mono, light type | Practical reassurance |
| **Platforms** | Six platform names in Cormorant, 1px bordered grid | Universal compatibility proof |
| **CTA** | Full-bleed, "Build the invisible frame." in enormous type | Cinematic close |

---

## E. UI COMPONENTS

### Prompt Text Block
Dark surface, 1px border, monospace prompt with color-coded semantic tokens:
- Gold: primary visual descriptors
- Blue: director / cinematographer references  
- Green: technical quality modifiers
- Dim: platform-specific parameters

### Reference Item
44×30px color-block thumbnail, filename in mono, metadata in smaller mono, colored status dot (gold = active analysis, green = complete, dim = idle).

### Tag (Analysis)
Minimal pill. Default: dark surface, muted border, warm gray text. Active (`on`): gold tint background, gold border, gold text. Toggle on click.

### Score Bar
2px height, warm gray track, gold fill. Represents AI confidence per dimension.

### Command Palette
Frosted overlay, contained panel, monospace input, arrow-key navigable list. Closes on Escape or outside click. Keyboard shortcut displayed per item.

### Variation Card
Full-width card with meta row (variation label + badge), prompt text beneath. Selected state: gold border + gold-dim background.

---

## F. MOTION SYSTEM

### Hero Entrance
```
0ms:    Page loads, all hero elements at opacity:0
80ms:   Begin sequence
100ms:  Title fades up (1300ms, ease-out)
400ms:  Eyebrow fades in (900ms)
600ms:  Bottom row (copy + meta) fades up (1000ms)
1400ms: Scroll indicator fades in (800ms)
```

### Scroll Reveals
All `.reveal` elements start at `opacity:0, translateY(28px)`. IntersectionObserver triggers `.in` class at 10% visibility with 48px bottom margin offset. Stagger classes `.d1–.d4` add 80ms delay increments.

### Reel Auto-Drift
Continuous `requestAnimationFrame` loop at 0.35px/frame. Reverses direction at ends. Pauses on hover, resumes on leave. Supports mouse drag scrubbing.

### Grain Animation
`steps(1)` keyframe animation at 0.9s interval. No easing — instant position jumps simulate actual film grain behavior.

### Analyzing Sequence (Workspace)
Progress steps fire every 380ms. Fill bar transitions with ease. Overlay fades out 600ms after completion. Status text cycles through 9 cinematographic analysis stages.

---

## G. TECH STACK

### Production Recommendation

**Frontend**
```
Next.js 15          App Router, RSC for static sections
TypeScript          Full type safety across services
Tailwind CSS 4      With custom design token config (replaces CSS vars)
Framer Motion 11    Page transitions, stagger reveals, parallax
GSAP 3 + ScrollTrigger  Hero text animations, scroll-scrubbed sequences
```

**AI Infrastructure**
```
OpenAI Vision API   GPT-4o for image analysis (color, mood, composition)
Anthropic API       Claude for cinematic language generation + prompt refinement
Replicate / FAL     Image style transfer and AI preview generation
```

**Image Processing**
```
Sharp (Node)        Server-side resize, color extraction, format normalization
Colorthief          Dominant palette extraction from uploads
Cloudinary / R2     Reference image storage and CDN delivery
```

**Backend + Data**
```
Supabase            Auth (magic link / Google OAuth), project storage, user history
PostgreSQL          Projects, references, generated prompts, export history
Edge Functions      Supabase Edge for AI orchestration calls
```

**Realtime**
```
Supabase Realtime   Collaborative workspace (multiple users on same project)
```

**Extras**
```
Three.js / R3F      Optional: hero particle/grain WebGL effect
Lenis               Smooth scrolling with inertia
```

### Architecture Pattern
```
pages/
  index.tsx           Landing page (static + ISR)
  workspace/[id].tsx  Dynamic workspace (client-heavy)
  
components/
  landing/  Hero, Reel, Features, Manifesto, Platforms, CTA
  workspace/ Sidebar, PromptCanvas, RightPanel, CommandPalette, AnalyzingOverlay
  ui/        Button, Tag, ScoreBar, VariationCard, PlatformTabs

services/
  analyze.ts   Vision API → structured analysis object
  generate.ts  Analysis → platform-specific prompt strings
  export.ts    Format prompt per platform syntax rules
```

---

## H. DESIGN REFERENCES — WHAT MAKES THEM SPECIAL

### Studio Koto
Mastery of the "concept as identity" — every project communicates a singular, ownable idea. Avoid: their willingness to use color explosively. Keep: the conceptual precision, the fact that every visual choice serves a concept.

### Basement Studio
The world's best use of photography as interface. Not illustrations, not vectors — real images that feel curated from a director's archive. For FRAME: import this approach to the reference image system. Images should feel like editorial selections, not screenshots.

### Instrument
They build digital tools that feel like products, not websites. The workspace interaction model directly takes from Instrument's approach to functional UX within premium visual containers. Keep: their "app inside editorial" philosophy.

### Linear
The gold standard for dark-mode precision tools. Everything is readable, everything has purpose, keyboard shortcuts are first-class citizens. For FRAME: Linear proves that a monochrome palette + great typography + tight component system can look as premium as anything with color. The command palette pattern comes from here.

### Studio Dize / Porto Rocha
Masters of the "editorial website as canvas" — large type, deliberate whitespace, asymmetric grid. For FRAME landing page: these studios prove that typography alone, at sufficient scale, is more powerful than any hero image.

### Reinterpretation Rule
Copy the *feeling*, never the *form*. Take the editorial confidence of Koto, the functional clarity of Linear, the visual gravity of Instrument, and synthesize into something that can only be FRAME — warm, cinematic, dark, precise.

---

## I. CREATIVE BRAND LANGUAGE

### Product Name
**FRAME** — universally understood across film, photography, and composition. Five letters. Both noun and verb.

### Taglines
- *Primary:* "Build the invisible frame."
- *Functional:* "From reference to vision."
- *Philosophical:* "The language of a single frame."
- *Campaign:* "Directors don't describe what they see. They describe what they feel."

### Verbal Tone

**Do say:**
- "FRAME reads..." (active, intelligent)
- "Precise cinematic language"
- "Upload any reference"
- "Build your visual universe"
- "Exact, exportable, yours"

**Don't say:**
- "AI-powered" (obvious, meaningless)
- "Revolutionary" 
- "Generate amazing" (vague)
- "Easy to use" (patronizing)
- "Your creative journey" (cliché)

### Microcopy Examples

| Context | Copy |
|---|---|
| Upload zone | "Drop images here" |
| Analyzing | "Reading color temperature" |
| Empty state | "Upload references to begin" |
| Copy success | "Copied ✓" |
| Export | "Prompt ready for Midjourney" |
| Variation label | "VARIATION A · SELECTED" |
| Footer | "Auto-saved 2m ago" |

### Typography as Brand Identity

FRAME's brand voice lives in the tension between two typefaces:
- **Cormorant** = the director's eye (emotional, editorial, analog)
- **JetBrains Mono** = the technical precision (exact, digital, functional)

Every screen maintains this tension. Headline in serif. Data in mono. Never mixed within the same element.

---

## EXPERIMENTAL CONCEPTS

### 1. Cinematic Cursor
Custom cursor: 8px filled dot + 36px lagged ring, mix-blend-mode: difference. Creates an X-ray effect over dark images that reveals hidden detail — a metaphor for what the product does.

### 2. Frame Counter
Hero background shows an enormous, near-invisible "01" in outlined serif — referencing the film frame counter visible in raw footage. Pure atmosphere, zero function.

### 3. Analyzing Sequence as Ritual
The analysis loading state is not a spinner. It's a sequence of cinematic stages: "READING COLOR TEMPERATURE" → "MAPPING CINEMATIC LANGUAGE" → "COMPLETE." Transforms waiting into participation.

### 4. Reference as Film Strip
The reference library renders items as mixed-aspect-ratio film strips (16:9, 4:3, 2.39:1, 1:1) — mimicking the actual contact sheets a cinematographer would create.

### 5. Prompt Token Coloring
Semantic color-coding of generated prompts: gold for visual descriptors, blue for directorial references, green for quality markers, dim for parameters. The prompt becomes a visual object, not just text.

### 6. Platform-Specific Syntax
Each AI platform has different prompt grammar. FRAME knows them all and auto-formats. The platform tab switch doesn't just change text — it restructures the entire prompt architecture.
