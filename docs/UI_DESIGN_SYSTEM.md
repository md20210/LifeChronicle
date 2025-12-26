# LifeChronicle - UI Design System

## Übersicht

Dieses Dokument beschreibt das vollständige Design-System von LifeChronicle, einschließlich Farben, Typografie, Komponenten und Layouts.

**Design-Prinzip:** Konsistenz mit CV_Matcher (gemeinsames Design-System)

## Farbpalette

### Brand Colors

```css
/* Primary Brand Color (Teal) */
--color-teal-50: #f0fdfa;
--color-teal-100: #ccfbf1;
--color-teal-400: #2dd4bf;
--color-teal-600: #14b8a6;  /* Primary */
--color-teal-700: #0f766e;
--color-teal-800: #115e59;

/* Secondary Brand Color (Emerald) */
--color-emerald-50: #ecfdf5;
--color-emerald-500: #10b981;
--color-emerald-600: #059669;
```

### Timeline-Farben (6er-Palette)

**1. Purple (Lila)**
```css
--timeline-purple-bg: #e9d5ff;      /* bg-purple-100 */
--timeline-purple-border: #c084fc;  /* border-purple-400 */
--timeline-purple-text: #581c87;    /* text-purple-800 */
--timeline-purple-dot: #9333ea;     /* bg-purple-600 */
```

**2. Teal (Türkis)**
```css
--timeline-teal-bg: #ccfbf1;        /* bg-teal-100 */
--timeline-teal-border: #5eead4;    /* border-teal-400 */
--timeline-teal-text: #134e4a;      /* text-teal-800 */
--timeline-teal-dot: #14b8a6;       /* bg-teal-600 */
```

**3. Green (Grün)**
```css
--timeline-green-bg: #d1fae5;       /* bg-green-100 */
--timeline-green-border: #6ee7b7;   /* border-green-400 */
--timeline-green-text: #065f46;     /* text-green-800 */
--timeline-green-dot: #10b981;      /* bg-green-600 */
```

**4. Yellow (Gelb)**
```css
--timeline-yellow-bg: #fef3c7;      /* bg-yellow-100 */
--timeline-yellow-border: #fcd34d;  /* border-yellow-400 */
--timeline-yellow-text: #78350f;    /* text-yellow-800 */
--timeline-yellow-dot: #eab308;     /* bg-yellow-600 */
```

**5. Orange (Orange)**
```css
--timeline-orange-bg: #fed7aa;      /* bg-orange-100 */
--timeline-orange-border: #fdba74;  /* border-orange-400 */
--timeline-orange-text: #7c2d12;    /* text-orange-800 */
--timeline-orange-dot: #ea580c;     /* bg-orange-600 */
```

**6. Pink (Rosa)**
```css
--timeline-pink-bg: #fce7f3;        /* bg-pink-100 */
--timeline-pink-border: #f9a8d4;    /* border-pink-400 */
--timeline-pink-text: #831843;      /* text-pink-800 */
--timeline-pink-dot: #db2777;       /* bg-pink-600 */
```

### Neutral Colors

```css
/* Backgrounds */
--color-gray-50: #f9fafb;   /* Page background */
--color-white: #ffffff;     /* Card backgrounds */

/* Borders */
--color-gray-200: #e5e7eb;  /* Light borders */
--color-gray-300: #d1d5db;  /* Medium borders */

/* Text */
--color-gray-600: #4b5563;  /* Secondary text */
--color-gray-700: #374151;  /* Body text */
--color-gray-800: #1f2937;  /* Headings */
```

## Typografie

### Font Stack

```css
font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
```

**Fallback-Strategie:**
1. Inter (Google Fonts, modern sans-serif)
2. system-ui (native system font)
3. Avenir (macOS fallback)
4. Helvetica (classic fallback)
5. Arial (universal fallback)
6. sans-serif (generic fallback)

### Font Sizes (Tailwind)

```css
/* Headers */
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }  /* 30px - H1 (Header) */
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }    /* 36px - Timeline Title */
.text-2xl { font-size: 1.5rem; line-height: 2rem; }       /* 24px - Section Titles */
.text-xl  { font-size: 1.25rem; line-height: 1.75rem; }   /* 20px - Entry Titles */

/* Body */
.text-base { font-size: 1rem; line-height: 1.5rem; }      /* 16px - Body Text */
.text-lg   { font-size: 1.125rem; line-height: 1.75rem; } /* 18px - Subtitle */
.text-sm   { font-size: 0.875rem; line-height: 1.25rem; } /* 14px - Small Text */
```

### Font Weights

```css
.font-bold     { font-weight: 700; }  /* Headings, Buttons */
.font-semibold { font-weight: 600; }  /* Subheadings */
.font-medium   { font-weight: 500; }  /* Toggle Buttons, Labels */
.font-normal   { font-weight: 400; }  /* Body Text */
```

### Line Heights

```css
line-height: 1.5;   /* Default body text */
line-height: 1.2;   /* Headings */
line-height: 1.75;  /* Subtitles */
```

## Layout-System

### Container & Spacing

**Max Width:**
```css
.max-w-7xl { max-width: 1280px; }  /* Main content container */
.max-w-6xl { max-width: 1152px; }  /* Unused (was earlier version) */
```

**Horizontal Padding:**
```css
.px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }  /* 24px */
```

**Vertical Padding:**
```css
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }      /* 16px - Header */
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }      /* 32px - Main Content */
```

**Margins:**
```css
.mb-8  { margin-bottom: 2rem; }    /* 32px - Section spacing */
.mb-4  { margin-bottom: 1rem; }    /* 16px - Component spacing */
.gap-4 { gap: 1rem; }              /* 16px - Flex gap (toggles) */
.gap-2 { gap: 0.5rem; }            /* 8px - Toggle buttons */
```

### Grid System

**Responsive Breakpoints:**
```css
/* Mobile First */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

**Grid Layout (Weiterführend Section):**
```css
.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }  /* Mobile */
.md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }  /* Desktop */
.gap-6 { gap: 1.5rem; }  /* 24px */
```

## Komponenten

### Header (Sticky Top)

**Klassen:**
```css
.bg-white             /* White background */
.border-b             /* Bottom border */
.border-gray-200      /* Light gray border color */
.shadow-sm            /* Subtle shadow */
.sticky               /* Sticky positioning */
.top-0                /* Stick to top */
.z-50                 /* High z-index */
```

**Struktur:**
```tsx
<header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
  <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
    <h1 className="text-3xl font-bold text-teal-600">LifeChronicle</h1>

    <div className="flex items-center gap-4">
      {/* Language Toggle */}
      {/* LLM Toggle */}
    </div>
  </div>
</header>
```

### Toggle Buttons (CV_Matcher-Style)

**Container:**
```css
.flex                 /* Flexbox layout */
.gap-2                /* 8px gap between buttons */
.bg-gray-100          /* Light gray background */
.p-1                  /* 4px padding */
.rounded-lg           /* Large border radius */
```

**Buttons:**
```css
/* Base */
.px-4                 /* 16px horizontal padding */
.py-2                 /* 8px vertical padding */
.rounded-md           /* Medium border radius */
.font-medium          /* 500 font weight */
.transition-all       /* Smooth transitions */

/* Active State */
.bg-white             /* White background */
.text-teal-600        /* Teal text color */
.shadow-sm            /* Subtle shadow */

/* Inactive State */
.text-gray-600        /* Gray text color */
.hover\\:text-gray-900  /* Dark gray on hover */
```

**Code-Beispiel:**
```tsx
<div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
  <button
    onClick={() => setLlmType('ollama')}
    className={`px-4 py-2 rounded-md font-medium transition-all ${
      llmType === 'ollama'
        ? 'bg-white text-teal-600 shadow-sm'
        : 'text-gray-600 hover:text-gray-900'
    }`}
  >
    Lokal (Ollama)
  </button>
  <button
    onClick={() => setLlmType('grok')}
    className={`px-4 py-2 rounded-md font-medium transition-all ${
      llmType === 'grok'
        ? 'bg-white text-teal-600 shadow-sm'
        : 'text-gray-600 hover:text-gray-900'
    }`}
  >
    GROK
  </button>
</div>
```

### Timeline Entry Card

**Container:**
```css
.bg-{color}-100       /* Timeline color background */
.border-l-4           /* 4px left border */
.border-{color}-400   /* Timeline color border */
.rounded-xl           /* Extra large border radius */
.shadow-md            /* Medium shadow */
.p-6                  /* 24px padding */
```

**Structure:**
```tsx
<div className={`
  ${color.bgColor}        /* bg-purple-100 */
  border-l-4
  ${color.borderColor}    /* border-purple-400 */
  rounded-xl
  shadow-md
  p-6
`}>
  <h3 className="text-xl font-bold">{entry.title}</h3>
  <p className="text-sm text-gray-600">{formattedDate}</p>
  <p className="text-gray-700">{entry.text}</p>

  <div className="flex gap-2">
    {/* Action buttons */}
  </div>
</div>
```

### Buttons

**Primary Button (Teal):**
```css
.px-6                 /* 24px horizontal padding */
.py-3                 /* 12px vertical padding */
.bg-teal-600          /* Teal background */
.text-white           /* White text */
.rounded-lg           /* Large border radius */
.hover\\:bg-teal-700    /* Darker teal on hover */
.font-medium          /* 500 font weight */
.transition-all       /* Smooth transitions */
.shadow-sm            /* Subtle shadow */
```

**Secondary Button (Gray):**
```css
.px-6                 /* 24px horizontal padding */
.py-3                 /* 12px vertical padding */
.bg-gray-200          /* Light gray background */
.text-gray-700        /* Dark gray text */
.rounded-lg           /* Large border radius */
.hover\\:bg-gray-300    /* Darker gray on hover */
.font-medium          /* 500 font weight */
.transition-all       /* Smooth transitions */
```

**Icon Button (Small):**
```css
.p-1                  /* 4px padding */
.text-sm              /* Small text */
.transition-all       /* Smooth transitions */
```

### Input Fields

**Text Input:**
```css
.w-full               /* Full width */
.px-4                 /* 16px horizontal padding */
.py-2                 /* 8px vertical padding */
.border               /* Border */
.border-gray-300      /* Medium gray border */
.rounded-lg           /* Large border radius */
.focus\\:ring-2         /* 2px ring on focus */
.focus\\:ring-teal-500  /* Teal ring color */
.focus\\:outline-none   /* Remove default outline */
```

**Textarea:**
```css
.w-full               /* Full width */
.px-4                 /* 16px horizontal padding */
.py-3                 /* 12px vertical padding */
.border               /* Border */
.border-gray-300      /* Medium gray border */
.rounded-lg           /* Large border radius */
.resize-none          /* Prevent resizing */
.focus\\:ring-2         /* 2px ring on focus */
.focus\\:ring-teal-500  /* Teal ring color */
.focus\\:outline-none   /* Remove default outline */
```

### Timeline Visualization

**Vertical Line:**
```css
.absolute             /* Absolute positioning */
.left-6               /* 24px from left */
.top-0                /* Top aligned */
.bottom-0             /* Bottom aligned */
.w-0\\.5              /* 2px width */
.bg-gray-300          /* Gray color */
```

**Date Circle (Dot):**
```css
.absolute             /* Absolute positioning */
.left-2               /* 8px from left */
.w-8                  /* 32px width */
.h-8                  /* 32px height */
.rounded-full         /* Perfect circle */
.bg-{color}-600       /* Timeline color */
.border-4             /* 4px border */
.border-white         /* White border */
.shadow-md            /* Medium shadow */
.flex                 /* Flexbox for centering */
.items-center         /* Vertical center */
.justify-center       /* Horizontal center */
```

## Transitions & Animations

### Hover Effects

```css
/* Button Hover */
.transition-all { transition-property: all; }
.hover\\:bg-teal-700 { background-color: #0f766e; }
.hover\\:scale-105 { transform: scale(1.05); }

/* Shadow Hover */
.hover\\:shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
```

### Processing Spinner

```css
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

**Usage:**
```tsx
<span className="inline-block animate-spin">⏳</span>
```

### Fade In

```css
.transition-opacity { transition-property: opacity; }
.opacity-0 { opacity: 0; }
.opacity-100 { opacity: 1; }
```

## Responsive Design

### Mobile (<640px)

```css
/* Stack vertically */
.flex-col
/* Full width buttons */
.w-full
/* Smaller padding */
.px-4
/* Hide unnecessary elements */
.hidden
```

### Tablet (640px - 1024px)

```css
/* 2-column grid */
.sm\\:grid-cols-2
/* Medium padding */
.sm\\:px-6
/* Show elements */
.sm\\:block
```

### Desktop (>1024px)

```css
/* 3-column grid */
.lg\\:grid-cols-3
/* Full padding */
.lg\\:px-8
/* Horizontal layout */
.lg\\:flex-row
```

## Dark Mode (Future)

**Planned Support:**
```css
.dark\\:bg-gray-900
.dark\\:text-gray-100
.dark\\:border-gray-700
```

## Accessibility

### Focus States

```css
.focus\\:outline-none     /* Remove default outline */
.focus\\:ring-2           /* Custom ring */
.focus\\:ring-teal-500    /* Teal ring color */
.focus\\:ring-offset-2    /* Offset for visibility */
```

### Color Contrast

**WCAG AA Compliant:**
- Text on Background: 4.5:1 minimum
- Large Text: 3:1 minimum
- Interactive Elements: 3:1 minimum

**Examples:**
- `text-teal-600` on `bg-white`: 5.1:1 ✅
- `text-gray-700` on `bg-white`: 10.7:1 ✅
- `text-purple-800` on `bg-purple-100`: 8.2:1 ✅

### Screen Reader Support

```tsx
<button aria-label="Mit KI veredeln" title="Mit KI veredeln">
  ✨
</button>

<button aria-label="Löschen" title="Löschen">
  🗑️
</button>
```

## Icons & Emojis

**Icon Set (Emojis):**
- ➕ Add Entry
- ✨ Process with LLM
- ⏳ Processing (animated)
- 🗑️ Delete
- 📖 PDF Export
- 🇩🇪 German
- 🇺🇸 English
- 🇪🇸 Spanish

**Why Emojis:**
- No external icon library needed
- Consistent across platforms
- Smaller bundle size
- Native rendering

## Design Tokens (Future)

**Planned CSS Variables:**
```css
:root {
  --color-primary: #14b8a6;
  --color-secondary: #10b981;
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

---

**Letzte Aktualisierung:** 2024-12-25
**Version:** 1.0.0
**Design Lead:** Michael Dabrock
