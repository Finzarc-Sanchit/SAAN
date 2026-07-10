---
name: Modern Couture System
colors:
  surface: '#faf9f6'
  surface-dim: '#dbdad7'
  surface-bright: '#faf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f1'
  surface-container: '#efeeeb'
  surface-container-high: '#e9e8e5'
  surface-container-highest: '#e3e2e0'
  on-surface: '#1a1c1a'
  on-surface-variant: '#564240'
  inverse-surface: '#2f312f'
  inverse-on-surface: '#f2f1ee'
  outline: '#897270'
  outline-variant: '#dcc0be'
  surface-tint: '#9f3f3c'
  primary: '#1f0001'
  on-primary: '#ffffff'
  primary-container: '#4b0006'
  on-primary-container: '#d56762'
  inverse-primary: '#ffb3ae'
  secondary: '#755a25'
  on-secondary: '#ffffff'
  secondary-container: '#fdd897'
  on-secondary-container: '#775d28'
  tertiary: '#000627'
  on-tertiary: '#ffffff'
  tertiary-container: '#001a5b'
  on-tertiary-container: '#7385c9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad7'
  primary-fixed-dim: '#ffb3ae'
  on-primary-fixed: '#410004'
  on-primary-fixed-variant: '#802827'
  secondary-fixed: '#ffdea5'
  secondary-fixed-dim: '#e5c282'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5b430f'
  tertiary-fixed: '#dce1ff'
  tertiary-fixed-dim: '#b6c4ff'
  on-tertiary-fixed: '#00164f'
  on-tertiary-fixed-variant: '#304383'
  background: '#faf9f6'
  on-background: '#1a1c1a'
  surface-variant: '#e3e2e0'
  accent-crimson: '#EA0F61'
  accent-amber: '#FA9926'
  surface-charcoal: '#1A1A1A'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Karla
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Karla
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Karla
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 1440px
  gutter-desktop: 32px
  margin-desktop: 64px
  gutter-mobile: 16px
  margin-mobile: 20px
  parallax-offset-sm: 20px
  parallax-offset-md: 50px
---

## Brand & Style

This design system is engineered for a high-end fashion experience that balances heritage with contemporary minimalism. The brand personality is **sophisticated, exclusive, and editorial**, targeting a discerning audience that appreciates craftsmanship and quiet luxury.

The visual direction follows a **Minimalist-Modern** aesthetic. It prioritizes generous whitespace (negative space) to allow high-quality photography to breathe. Unlike standard e-commerce platforms, this design system treats the digital interface as a curated gallery, utilizing architectural alignment and refined motion to guide the user journey.

**Key Principles:**
- **Editorial Layout:** Utilizing asymmetrical grids and overlapping elements to mimic high-fashion print magazines.
- **Cinematic Motion:** Smooth, GSAP-driven transitions and parallax effects that create a sense of effortless fluidly.
- **Intentional Restraint:** Every element serves a purpose; unnecessary borders and heavy shadows are discarded in favor of structural clarity.

## Colors

The palette is rooted in a "Modern Earth" philosophy. The primary **Deep Burgundy (#4B0006)** serves as the anchor, providing a regal, high-contrast weight to the UI. The **Antique Gold (#AB8C52)** is used as a secondary accent for highlights, subtle borders, and micro-interactions, evoking a sense of luxury.

The background is strictly **Off-White (#FAF9F6)**, which is softer on the eyes than pure white and provides a premium, paper-like texture. 

**Usage Guidance:**
- **Primary:** Headlines, primary buttons, and critical navigational icons.
- **Secondary:** Delicate dividers, secondary UI elements, and price labels.
- **Neutral:** All page backgrounds and container surfaces.
- **Named Accents:** The magenta and orange should be reserved exclusively for "New In" badges or promotional alerts, used sparingly to maintain the minimalist integrity.

## Typography

Typography is the cornerstone of this design system. We utilize a high-contrast pairing:
1. **Playfair Display (Serif):** Used for headlines and large display quotes. Its high stroke contrast conveys elegance and an editorial tone.
2. **Karla (Sans-Serif):** Used for body copy and labels. Its slightly quirky but clean metrics provide excellent readability and a modern edge.

**Editorial Rules:**
- **Display Text:** Large titles should use negative letter-spacing (-0.02em) to appear tighter and more professional.
- **Labels:** Small navigational labels or category tags must always be uppercase with generous letter-spacing (0.1em) to ensure clarity.
- **Hierarchy:** Use the Primary Burgundy for headlines and a slightly desaturated charcoal for body text to reduce visual strain.

## Layout & Spacing

This design system employs a **12-column fixed grid** for desktop and a **4-column fluid grid** for mobile. The layout philosophy is centered around "The Breathing Canvas"—ensuring no page feels cluttered.

**Motion & Parallax:**
- **Parallax Containers:** Apply a `y-axis` offset of 20px to 50px using GSAP for image containers. As the user scrolls, images should move at a slightly different speed than the text overlays.
- **Reveal States:** Content should fade and slide upward (`y: 30`, `opacity: 0` to `opacity: 1`) as it enters the viewport.
- **Whitespace:** Vertical spacing between major sections (e.g., Hero to Featured Collection) should be significant (minimum 120px on desktop) to enforce a high-end feel.

## Elevation & Depth

To maintain a clean, high-end aesthetic, this design system avoids heavy shadows. Depth is achieved through:
1. **Tonal Layering:** Using the neutral cream as the base and slightly darker tones for secondary cards or drawers.
2. **Glassmorphism (Subtle):** Navigation bars and filters utilize a 10px backdrop blur with 80% opacity to maintain context while scrolling through high-saturation imagery.
3. **Overlapping Elements:** Using z-index to overlap serif typography onto image containers creates a 3D "layered paper" effect without needing dropshadows.

## Shapes

The shape language is **architectural and structured**. We use a `Soft` (0.25rem) radius for most UI elements. This provides a hint of approachability while maintaining the sharp, clean lines expected in luxury fashion.

- **Primary Buttons:** Rectangular with a 2px radius.
- **Image Containers:** Strictly sharp edges (0px radius) to maintain the editorial look of a photo frame.
- **Input Fields:** Bottom-border only (0px radius) for a minimalist "signature" feel.

## Components

### Buttons
- **Primary:** Solid Deep Burgundy background, White text, no border. On hover, the background transitions to Antique Gold using a CSS `ease-out`.
- **Secondary:** Ghost button with an Antique Gold 1px border.
- **Label:** All-caps Karla with an underline that animates from left to right on hover.

### Cards (Product)
- No borders or shadows.
- Image takes up 85% of the card height.
- Product titles in Karla 14px, Price in Playfair Display 16px.
- Quick-add button appears only on hover with a fade-in animation.

### Input Fields
- Underline-only style using Antique Gold (1px). 
- Floating labels in Karla (Label-caps style) that shrink when the input is active.

### Motion States (GSAP Ready)
- **Image Hover:** Images should subtly scale (1.05x) over a 0.8s duration when hovered.
- **Page Transitions:** Implement a "curtain" reveal using the primary burgundy color when navigating between product categories.