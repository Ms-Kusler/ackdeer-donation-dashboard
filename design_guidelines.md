# AckDeer Project - Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from professional nonprofit dashboards and impact visualization platforms, emphasizing trust, transparency, and data clarity to create a compelling donor experience.

## Core Design Elements

### A. Color Palette
**Primary Colors:**
- Deep Green: #21563F (hero background, primary accents)
- White: #FFFFFF (text on dark backgrounds, card backgrounds)
- Charcoal: #0f172a (primary text color)

**Supporting Colors:**
- Light Green: #eef6f0 (badges, subtle highlights)
- Muted Gray: #6b7280 (secondary text, icons)
- Success Green: #2e7d32 (charts, progress indicators)
- Background: #f6f8f6 (page background with subtle green tint)

### B. Typography
**Primary Font:** Georgia serif family across entire application
- Hero Title: Bold, large scale (clamp 26px-40px)
- Section Headers: Bold, medium scale with tight letter spacing
- Body Text: Regular weight, readable sizes
- UI Elements: System-ui sans-serif for data-heavy components (KPI numbers, form labels)

### C. Layout System
**Spacing:** Tailwind units of 4, 6, 8, 12, 16, 20 for consistent rhythm
- Container: Maximum 1200px width with 20px padding
- Card spacing: 16-18px gaps between major sections
- Component spacing: 8-12px for related elements

### D. Component Library

**Hero Section:**
- 32px border radius for modern, friendly appearance
- Deep green background with white text overlay
- Logo positioned top-left with proper scaling
- Generous padding with responsive flex layout

**KPI Cards:**
- Glass morphism effect with backdrop blur
- Subtle drop shadows (0 8px 28px rgba)
- 20px border radius matching hero
- Hover animations with slight lift effect
- 4-column grid on desktop, 2-column on tablet, stacked on mobile

**Charts & Data Visualization:**
- Clean, minimal styling in AckDeer green palette
- Canvas-based charts with responsive sizing
- Progress bars with rounded pill design
- Subtle animations for data reveals

**Forms:**
- Floating label design for modern UX
- 14px border radius for consistency
- Focus states with green accent colors
- Grid layout for efficient space usage
- Clear validation states and feedback

### E. Visual Hierarchy
- Large, bold hero messaging for immediate impact
- Progressive information disclosure through card-based layout
- Strategic use of white space for breathing room
- Color-coded data categories for quick scanning

## Images
**Hero Logo:** AckDeer transparent PNG logo positioned in top-left of hero section, sized approximately 92px width with responsive scaling. Logo should have subtle drop shadow for depth against the green background.

**No large hero image** - the design focuses on the green hero section with logo and typography as the primary visual element.

## Accessibility & Responsiveness
- Light theme only implementation as specified
- Mobile-first responsive design with breakpoints at 520px, 720px, 1024px
- High contrast ratios maintained throughout
- Form validation with clear error states
- Semantic HTML structure for screen readers

## Brand Personality
Professional yet approachable nonprofit aesthetic that conveys:
- Trustworthiness through clean design and clear data presentation
- Environmental consciousness through green color palette
- Community impact through prominent metrics and progress tracking
- Transparency through detailed donation tracking and fund allocation