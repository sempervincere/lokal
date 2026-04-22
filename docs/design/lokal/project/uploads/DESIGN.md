# LOKAL Design System

## 1. Design Principles

1. **Warm Minimalism:** Clean layouts with earthy warmth. No cold corporate blues.
2. **Crypto-Invisible:** Payment flows look like GoPay/OVO. No wallet jargon, no chain explorers in user-facing UI.
3. **Local-First Visual Language:** Rounded, organic shapes echoing the location pin. Soft shadows suggesting depth without heaviness.
4. **Data Confidence:** Reports use clear visual hierarchy, progress indicators, and explicit confidence badges—not raw numbers.
5. **Mobile-First:** 70% of Indonesian F&B entrepreneurs research on mobile. All components work thumb-first.

## 2. Color Palette

### Primary Colors

| Token                 | Hex       | Usage                                                         |
| --------------------- | --------- | ------------------------------------------------------------- |
| `--color-primary-600` | `#1B7A65` | Primary actions, logo pin, active states, key data highlights |
| `--color-primary-500` | `#2A9D82` | Hover states, secondary buttons                               |
| `--color-primary-400` | `#5FB8A3` | Icons, decorative elements, chart accents                     |
| `--color-primary-100` | `#E6F3EF` | Light backgrounds, success tints, badges                      |

### Secondary / Earth Accents

| Token               | Hex       | Usage                                                     |
| ------------------- | --------- | --------------------------------------------------------- |
| `--color-earth-600` | `#C17A5F` | CTAs on dark backgrounds, accent badges, urgency elements |
| `--color-earth-500` | `#D4917A` | Hover for earth accents                                   |
| `--color-earth-100` | `#F5E9E3` | Light warning/attention backgrounds                       |

### Neutral Scale (Warm)

| Token                  | Hex       | Usage                                     |
| ---------------------- | --------- | ----------------------------------------- |
| `--color-cream-50`     | `#FDFBF7` | Page background (main canvas)             |
| `--color-cream-100`    | `#FAF6ED` | Card backgrounds, logo bg, input fields   |
| `--color-cream-200`    | `#F5F1EC` | Section alternates, subtle borders        |
| `--color-warmgray-500` | `#6B6560` | Secondary text, captions, disabled states |
| `--color-warmgray-700` | `#4A4540` | Body text, headings                       |
| `--color-warmgray-900` | `#1A1A1A` | Primary text, logos, high emphasis        |

### Semantic Colors

| Token                 | Hex       | Usage                                                |
| --------------------- | --------- | ---------------------------------------------------- |
| `--color-success-500` | `#2A9D82` | Validated data, successful payment, trust score high |
| `--color-warning-500` | `#D4A03D` | Trust score medium, data needs refresh               |
| `--color-danger-500`  | `#C45B4A` | Price risk flags, errors, trust score low            |
| `--color-info-500`    | `#5B8BA0` | Free chat indicators, neutral info                   |

### Usage Rules

- **Backgrounds:** Always cream-50 or cream-100. Never pure white (#FFFFFF) or cold gray.
- **Primary Actions:** primary-600 for main buttons. earth-600 only for high-attention moments (payment CTA).
- **Text on Dark:** cream-50. Text on Light: warmgray-900.
- **Data Visualization:** primary scale for positive/growth, earth for attention, danger for risk flags.

## 3. Typography

### Font Stack

- **Primary (UI/Text):** `"Plus Jakarta Sans", "Inter", system-ui, -apple-system, sans-serif`
  - Rationale: Geometric, modern, excellent Bahasa Indonesia support (full Latin Extended), warm character.
- **Mono (Data/Reports):** `"JetBrains Mono", "Fira Code", monospace`
  - Rationale: Clean data presentation, price tables, code-like reports.

### Type Scale

| Token          | Size            | Weight | Line Height | Letter Spacing | Usage                        |
| -------------- | --------------- | ------ | ----------- | -------------- | ---------------------------- |
| `text-display` | 48px / 3rem     | 700    | 1.1         | -0.02em        | Hero headlines               |
| `text-h1`      | 36px / 2.25rem  | 700    | 1.2         | -0.01em        | Page titles                  |
| `text-h2`      | 28px / 1.75rem  | 600    | 1.3         | -0.01em        | Section headers              |
| `text-h3`      | 22px / 1.375rem | 600    | 1.4         | 0              | Card titles, report sections |
| `text-h4`      | 18px / 1.125rem | 600    | 1.4         | 0              | Subsection, form labels      |
| `text-body-lg` | 18px / 1.125rem | 400    | 1.6         | 0              | Lead paragraphs              |
| `text-body`    | 16px / 1rem     | 400    | 1.6         | 0              | Body copy, chat messages     |
| `text-body-sm` | 14px / 0.875rem | 400    | 1.5         | 0              | Captions, metadata           |
| `text-caption` | 12px / 0.75rem  | 500    | 1.4         | 0.01em         | Tags, badges, timestamps     |

### Typography Rules

- **Headings:** warmgray-900. Display uses tight tracking for impact.
- **Body:** warmgray-700 on cream-50. Max-width 65ch for readability.
- **Price Display:** Mono font, primary-600, tabular nums (`font-variant-numeric: tabular-nums`).
- **Indonesian Copy:** Avoid ALL CAPS (reads as shouting in BI). Use sentence case or title case.

## 4. Spacing System

Base unit: **4px**

| Token      | Value | Usage                                   |
| ---------- | ----- | --------------------------------------- |
| `space-1`  | 4px   | Tight padding, icon gaps                |
| `space-2`  | 8px   | Inline spacing, small gaps              |
| `space-3`  | 12px  | Button padding-y, tight component gaps  |
| `space-4`  | 16px  | Standard padding, card internal spacing |
| `space-5`  | 20px  | Form field gaps                         |
| `space-6`  | 24px  | Section internal padding                |
| `space-8`  | 32px  | Card padding, modal internal spacing    |
| `space-10` | 40px  | Section gaps                            |
| `space-12` | 48px  | Large section spacing                   |
| `space-16` | 64px  | Page section breaks                     |
| `space-20` | 80px  | Hero spacing                            |

### Layout Grid

- **Mobile:** 4-column, 16px gutters, 16px margins
- **Tablet:** 8-column, 24px gutters, 24px margins
- **Desktop:** 12-column, 32px gutters, max-width 1200px, centered

### Border Radius

| Token         | Value  | Usage                         |
| ------------- | ------ | ----------------------------- |
| `radius-sm`   | 8px    | Small buttons, badges, inputs |
| `radius-md`   | 12px   | Cards, modals, images         |
| `radius-lg`   | 16px   | Large cards, feature sections |
| `radius-xl`   | 24px   | Hero containers, map overlays |
| `radius-full` | 9999px | Pills, avatars, primary CTAs  |

## 5. Shadows & Elevation

| Token       | Value                             | Usage                             |
| ----------- | --------------------------------- | --------------------------------- |
| `shadow-sm` | `0 1px 2px rgba(26,26,26,0.05)`   | Subtle elevation, inputs          |
| `shadow-md` | `0 4px 12px rgba(26,26,26,0.08)`  | Cards, dropdowns                  |
| `shadow-lg` | `0 8px 24px rgba(26,26,26,0.10)`  | Modals, floating panels           |
| `shadow-xl` | `0 16px 48px rgba(26,26,26,0.12)` | Payment modal, conversion moments |

**Shadow Rules:**

- Always warm-tinted shadows (use warmgray-900 base, not pure black).
- Never use colored shadows (no green/blue glows).
- Elevation increases with user attention: free chat &lt; report view &lt; payment modal.

## 6. Component Primitives

### Buttons

**Primary Button**

- Background: primary-600
- Text: cream-50
- Padding: 12px 24px (space-3 space-6)
- Border-radius: radius-full
- Font: text-body, weight 600
- Hover: primary-500, shadow-md
- Active: primary-600 (scale 0.98)
- Disabled: warmgray-500/30, cursor not-allowed

**Secondary Button**

- Background: transparent
- Border: 1.5px solid primary-600
- Text: primary-600
- Padding: 12px 24px
- Border-radius: radius-full
- Hover: primary-100

**Accent Button (High Attention / Payment)**

- Background: earth-600
- Text: cream-50
- Padding: 14px 32px (slightly larger)
- Border-radius: radius-full
- Font: text-body, weight 700
- Hover: earth-500, shadow-lg
- Icon: Lock or Shield (left side) to signal security

**Ghost Button**

- Background: transparent
- Text: warmgray-700
- Hover: cream-200
- Padding: 8px 16px
- Border-radius: radius-md

### Cards

**Standard Card**

- Background: cream-100
- Border: 1px solid cream-200
- Border-radius: radius-lg
- Padding: space-8 (32px)
- Shadow: shadow-md (on hover: shadow-lg, translateY -2px)

**Data Card (Report Sections)**

- Background: cream-50
- Border-left: 4px solid primary-400
- Border-radius: radius-md (left side only: 0 radius on left if needed, or full)
- Padding: space-6
- Icon: 24px, primary-600, top-left

**Cluster Card (Browse)**

- Background: cream-100
- Border-radius: radius-lg
- Overflow: hidden
- Image: 16:9 aspect ratio, radius-lg on top
- Content padding: space-6
- Map thumbnail: 120px height, rounded radius-md
- Badge position: top-right, inside image area

### Inputs

**Text Input**

- Background: cream-50
- Border: 1.5px solid cream-200
- Border-radius: radius-md
- Padding: 12px 16px
- Font: text-body
- Focus: border-primary-500, shadow-sm (ring-2 ring-primary-100)
- Placeholder: warmgray-500
- Error: border-danger-500, bg-danger-50

**Menu Builder Input (Concept Form)**

- Background: cream-50
- Border: 2px dashed cream-200
- Border-radius: radius-lg
- Padding: space-8
- Empty state: Icon + "Tambah menu pertama" text, warmgray-500
- Filled state: solid border cream-200, white bg

### Badges

**Status Badge**

- Padding: 4px 12px
- Border-radius: radius-full
- Font: text-caption, weight 600

### Variants:

- Active: bg-primary-100, text-primary-600
- Seeding: bg-warning-100, text-warning-600
- Validated: bg-success-100, text-success-600
- Needs Refresh: bg-danger-100, text-danger-600

**ZK Badge (Data Density)**

- Background: warmgray-900
- Text: cream-50
- Padding: 6px 14px
- Border-radius: radius-full
- Icon: ShieldCheck (16px)
- Font: text-caption, weight 700

## 7. Icons & Imagery

### Iconography

- **Library:** Lucide React (consistent, geometric, professional)
- **Size scale:** 16px (inline), 20px (buttons), 24px (features), 32px (empty states)
- **Stroke width:** 1.5px (clean, not heavy)
- **Color rules:** warmgray-500 (inactive), primary-600 (active), danger-500 (warnings)

### Key Icons by Context

| Context           | Icon          | Rationale                         |
| ----------------- | ------------- | --------------------------------- |
| Cluster location  | MapPin        | Literal + recognizable            |
| Data validated    | ShieldCheck   | Trust without saying "blockchain" |
| Price ceiling     | TrendingDown  | Clear visual metaphor             |
| Price risk        | AlertTriangle | Immediate recognition             |
| Report            | FileText      | Document metaphor                 |
| Chat/Consultation | MessageCircle | Conversational                    |
| Payment           | Lock          | Security, not "crypto"            |
| Time/Expiry       | Clock         | Universal                         |

### Imagery Style

- **Photography:** Real Indonesian street scenes, warm natural lighting, shallow depth of field. Show actual F&B environments (warung, kaki lima, café interiors).
- **Treatment:** Slight warmth boost (+10% saturation, +5% warmth). No heavy filters.
- **Avoid:** Stock photos of non-Indonesian settings, overly polished studio food shots, crypto imagery.
- **Illustrations:** Use sparingly. If needed, simple line-art with primary-600 strokes on cream backgrounds.

## 8. Motion & Animation

### Principles

- **Purposeful:** Motion guides attention, never decorates.
- **Fast:** Indonesian mobile networks vary. Animations under 300ms.
- **Subtle:** Ease-out curves, no bounces or elastic effects.

### Standard Transitions

| Name            | Duration | Easing                       | Usage                        |
| --------------- | -------- | ---------------------------- | ---------------------------- |
| `ease-fast`     | 150ms    | ease-out                     | Button hovers, color changes |
| `ease-standard` | 250ms    | cubic-bezier(0.4, 0, 0.2, 1) | Card hovers, dropdowns       |
| `ease-emphasis` | 300ms    | cubic-bezier(0, 0, 0.2, 1)   | Modal open, page transitions |

### Specific Patterns

- **Report Generation:** Skeleton loader with pulsing primary-100 bars. Progress steps: "Menganalisis harga..." → "Membandingkan kompetitor..." → "Menyusun strategi..."
- **Message Entry (Chat):** Fade-in + slight translateY(8px→0), 200ms.
- **Payment Success:** Checkmark draw animation (SVG stroke-dashoffset), 400ms, then confetti burst (subtle, 20 particles, primary + earth colors).
- **Free Message Counter:** Scale pulse (1→1.1→1) when hitting message 5, 6, 7.

## 9. Responsive Breakpoints

| Name      | Width      | Key Changes                                                           |
| --------- | ---------- | --------------------------------------------------------------------- |
| `mobile`  | < 640px    | Single column, stacked cards, full-width buttons, bottom sheet modals |
| `tablet`  | 640–1024px | 2-column grids, side-by-side chat + report                            |
| `desktop` | > 1024px   | Full layout, persistent sidebar nav, multi-column reports             |

### Mobile-Specific Rules

- Touch targets minimum 44px height.
- Payment button fixed to bottom with safe-area-inset padding.
- Chat input fixed above keyboard.
- Horizontal scroll for report section tabs (not stacked accordion).
