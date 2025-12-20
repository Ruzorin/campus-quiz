# Frontend Development Guide

## 🎨 Design Philosophy
- **Mobile-First**: All layouts must be designed for 360px width first, then expand.
- **Premium Feel**: Use subtle gradients, glassmorphism, and smooth transitions.
- **Focus**: The actual "Study Card" should be the center of attention.

## 📂 Project Structure
```text
src/
  components/
    common/       # Buttons, Inputs, Cards
    layout/       # Navbar, Sidebar, PageWrappers
    features/     # Complex business components (StudyModes, ClassDash)
  hooks/          # Custom Hooks (useAuth, useStudySession)
  pages/          # Route Views
  services/       # API integration layers
  styles/         # Global styles & Tailwind config
```

## 🧩 Key Components

### 1. `StudyCard.tsx`
The core component for Flashcards.
- **Props**: `term`, `definition`, `isFlipped`, `onFlip`
- **Animation**: CSS 3D Transform (`rotateY`)
- **Interaction**: Tap to flip, Swipe to next (optional advanced feature).

### 2. `GameCanvas.tsx` (Match Mode)
A dedicated matching game component.
- **Logic**: Grid layout. Selection state handling.
- **Timer**: High-precision stopwatch.
- **Feedback**: Visual shaking for wrong matches, green glow for correct.

### 3. `ClassDash.tsx` (Social)
Dashboard for class stats.
- **Tabs**: "Leaderboard", "Members", "Sets".
- **Real-time**: Poll active users every 30s.

## 🌍 PWA Configuration
We utilize `vite-plugin-pwa`.
- **Strategy**: GenerateSW (simplest for catching static assets).
- **Runtime Caching**:
  - `/api/sets/*`: NetworkFirst (We want fresh data, but allow reading last cached if offline).
  - Images: CacheFirst (Aggressive caching).
