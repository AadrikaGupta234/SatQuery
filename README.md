# satQuery

> **Natural-language satellite imagery analysis.**

satQuery is a frontend application for exploring and interacting with satellite imagery analysis workflows through a clean, modern interface.

The project is currently focused on the frontend experience and application structure. The previous Convex backend, authentication system, mapping stack, and related dependencies have been removed from the active codebase so the application can be developed from a clean foundation.

---

## Overview

satQuery is designed around a simple idea:

**Ask questions about satellite imagery and make complex geospatial analysis easier to understand.**

The current application contains:

- A polished landing page
- Animated hero section
- Satellite-analysis themed UI
- Feature carousel
- Change-detection showcase carousel
- Responsive layout
- `/app` application route
- Reusable logo dropdown
- Shadcn UI components
- Framer Motion animations
- React Router based navigation

The project is currently a **frontend-first foundation**. Backend services, authentication, satellite-data processing, and interactive geospatial analysis can be integrated as the application evolves.

---

# Tech Stack

| Technology | Purpose |
|---|---|
| **Vite** | Frontend build tool and development server |
| **React 19** | UI framework |
| **TypeScript** | Type-safe development |
| **React Router v7** | Client-side routing |
| **Tailwind CSS v4** | Styling |
| **shadcn/ui** | Reusable UI components |
| **Lucide React** | Icons |
| **Framer Motion** | Animations |
| **Bun** | Package manager and runtime |

---

# Project Structure

```text
SatQuery/
│
├── public/
│   └── logo.svg
│
├── src/
│   │
│   ├── assets/
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   └── shadcn/ui components
│   │   │
│   │   ├── LogoDropdown.tsx
│   │   │
│   │   └── satquery/
│   │       ├── Carousel.tsx
│   │       ├── FeatureCarousel.tsx
│   │       ├── Spotlight.tsx
│   │       ├── TextGenerateEffect.tsx
│   │       └── TextHoverEffect.tsx
│   │
│   ├── hooks/
│   │   └── use-mobile.ts
│   │
│   ├── lib/
│   │   └── utils.ts
│   │
│   ├── pages/
│   │   ├── App.tsx
│   │   ├── Landing.tsx
│   │   └── NotFound.tsx
│   │
│   ├── index.css
│   └── main.tsx
│
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md