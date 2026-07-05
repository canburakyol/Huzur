---
name: Serene Equilibrium
colors:
  surface: '#fbf9f8'
  surface-dim: '#dbdad9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#eae8e7'
  surface-container-highest: '#e4e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#434843'
  inverse-surface: '#303030'
  inverse-on-surface: '#f2f0f0'
  outline: '#737973'
  outline-variant: '#c3c8c1'
  surface-tint: '#4d6453'
  primary: '#061b0e'
  on-primary: '#ffffff'
  primary-container: '#1b3022'
  on-primary-container: '#819986'
  inverse-primary: '#b4cdb8'
  secondary: '#4a654f'
  on-secondary: '#ffffff'
  secondary-container: '#c9e7cc'
  on-secondary-container: '#4e6953'
  tertiary: '#171812'
  on-tertiary: '#ffffff'
  tertiary-container: '#2c2c26'
  on-tertiary-container: '#95938b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d0e9d4'
  primary-fixed-dim: '#b4cdb8'
  on-primary-fixed: '#0b2013'
  on-primary-fixed-variant: '#364c3c'
  secondary-fixed: '#cceacf'
  secondary-fixed-dim: '#b0ceb4'
  on-secondary-fixed: '#062010'
  on-secondary-fixed-variant: '#334d38'
  tertiary-fixed: '#e5e2da'
  tertiary-fixed-dim: '#c9c6be'
  on-tertiary-fixed: '#1c1c17'
  on-tertiary-fixed-variant: '#474741'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e2'
typography:
  headline-xl:
    fontFamily: Literata
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Literata
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Literata
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Literata
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  safe-area-bottom: 116px
  nav-height: 56px
  ad-height: 60px
  margin-main: 24px
  gutter-card: 16px
---

## Brand & Style

The design system is centered on the concept of "Digital Sanctuary." It targets a sophisticated audience seeking mental clarity and spiritual grounding. The brand personality is quiet, intentional, and premium, evoking the feeling of high-quality tactile stationery or a secluded forest clearing.

The visual style is **Minimalist** with a focus on **Tonal Harmony**. It rejects the chaotic depth of traditional UI in favor of flat, rhythmic surfaces and precise, ultra-thin linework. Every interface element is designed to reduce cognitive load and foster a sense of peace through generous negative space and a restrained color palette.

## Colors

The palette is derived from natural elements—paper, moss, and deep timber. 

**Light Mode:**
The foundation is a warm ivory (#F5F2E9) resembling premium textured paper. The Primary color (Deep Forest Green, #1B3022) is used for maximum contrast in titles and critical iconography. Secondary Sage Green (#8DAA91) denotes interactivity and progress.

**Dark Mode:**
The system transitions to a "Night Forest" theme. Pure black is strictly avoided. The background uses a deep, desaturated green (#0D1A12) to reduce eye strain during evening reflection. Text shifts to a soft cream for legibility and muted sage for secondary information.

## Typography

This design system utilizes a sophisticated serif-sans pairing. **Literata** provides an authoritative yet warm editorial feel for titles, facilitating a rhythmic reading experience for spiritual texts. **Manrope** is used for all functional and body elements, chosen for its modern, balanced, and highly legible proportions.

For mobile layouts, headline sizes scale down to prevent awkward word breaks while maintaining their distinctive weight. Use uppercase styling for labels and small metadata to create clear architectural hierarchy without increasing font weight excessively.

## Layout & Spacing

The layout is strictly mobile-first, adhering to a 4-column fluid grid for mobile and 8-column for tablet. 

**Vertical Stack:**
A persistent 60px Ad Container is fixed at the absolute bottom (z-index: 1000). Immediately above this sits the 3-tab Bottom Navigation Bar (56px). Consequently, all scrollable content views must implement a `padding-bottom` of at least 116px to ensure the final elements are fully visible and reachable above the navigation stack.

**Rhythm:**
- Main horizontal margins are fixed at 24px to provide a generous "frame" for content.
- Vertical spacing between distinct sections should be 40px to maintain the minimalist breathability.
- Internal card padding is 20px.

## Elevation & Depth

Depth in this design system is expressed through **Tonal Layering** rather than shadows. 
- **Level 0 (Base):** Ivory/Beige (Light) or Night Green (Dark).
- **Level 1 (Cards/Containers):** A slightly lighter or darker shade of the base color to create a subtle "lift."
- **Borders:** To define shapes, use 0.5px or 1px ultra-thin borders. In light mode, use the primary green at 10% opacity. In dark mode, use the cream text color at 15% opacity.

The interface should feel flat and structural, resembling a well-organized physical journal.

## Shapes

The shape language is defined by unified, generous curves. All primary containers and cards must use a **2xl border-radius** (1.5rem/24px). This softness counteracts the precision of the typography and thin borders, making the app feel approachable and welcoming. Small UI elements like chips or buttons may scale down to 12px, but should never be sharp.

## Components

**Buttons:**
Primary buttons are solid Sage Green with Primary Forest Green text. They should be "rounded-xl" and contain centered, medium-weight labels. No drop shadows.

**Cards:**
Cards are the primary vehicle for content. Titles within cards must always utilize the high-contrast Deep Forest Green (Light Mode) or Soft Cream (Dark Mode). Borders are mandatory for cards to distinguish them from the background without using shadows.

**Input Fields:**
Minimalist design with only a bottom border of 1px. When focused, the border color shifts to Sage Green. Labels float above the input in the "label-sm" style.

**Bottom Navigation:**
A flat, blur-free bar. Active states are indicated by a small Sage Green dot below the icon rather than a background highlight.

**Lists:**
List items are separated by full-width 0.5px dividers. Use generous vertical padding (16px) for each row to maintain the serene spacing.

**Spiritual Specifics:**
- **Quote Blocks:** Use an italicized "Literata" font with a 2px left-accent border in Sage Green.
- **Audio Players:** Minimalist progress bars with a circular thumb in Sage Green, utilizing "rounded-xl" for the album art containers.