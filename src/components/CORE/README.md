# CORE Section Documentation

## Overview

The **CORE** section is a component-based implementation of the Fabrich System sequential stages template. It provides an immersive onboarding experience with four stages: VOID, SIGNAL, AWAKENING, and GATE.

### Auto-Continue Feature

The CORE section implements **automatic stage progression** with configurable delays for each stage. This creates a seamless, choreographed experience without requiring user interaction until the final Gate stage.

**Stage Timing:**
- **VOID**: 2 seconds
- **SIGNAL**: 2.5 seconds  
- **AWAKENING**: 4.5 seconds
- **GATE**: Manual (final destination)

## Architecture

### Component Structure

```
src/components/CORE/
├── CORE.tsx                 # Main orchestrator component
├── types.ts                 # TypeScript type definitions
├── index.ts                 # Barrel export file
├── StageNavigation.tsx      # Navigation dots and progress indicators
├── StageHeader.tsx          # Header with stage info and title
├── CosmosCanvas.tsx         # Animated canvas background
└── stages/
    ├── VoidStage.tsx        # Stage 1: The Void
    ├── SignalStage.tsx      # Stage 2: Signal
    ├── AwakeningStage.tsx   # Stage 3: Awakening
    └── GateStage.tsx        # Stage 4: Gate (Entry Point)
```

## Components

### CORE (Main Component)
The orchestrator component that manages:
- Current stage state
- Completed stages tracking
- Stage transitions with auto-continue
- Auto-play state management

**Features:**
- Automatic progression between stages
- Configurable delays per stage
- Can be toggled on/off via `autoPlay` state
- Cleanup of timers on unmount

**Key Props:** None (self-contained)

**State:**
- `currentStage: number` - Current active stage (1-4)
- `completedStages: number[]` - Array of completed stage IDs
- `autoPlay: boolean` - Enable/disable automatic progression

### StageNavigation
Displays the progress indicator with:
- Dots for each stage
- Lines connecting stages
- Visual feedback for completed/active stages

**Props:**
- `currentStage: number` - Current stage number (1-4)
- `totalStages: number` - Total number of stages
- `completedStages: number[]` - Array of completed stage numbers

### StageHeader
Renders the stage information header with:
- Navigation progress
- Stage label and number
- Stage title
- Stage description

**Props:**
- `label: string` - Stage label (e.g., "1. VOID")
- `title: string` - Stage title
- `description: string` - Stage description
- `currentStage: number` - Current stage
- `totalStages: number` - Total stages
- `completedStages: number[]` - Completed stages

### CosmosCanvas
Animated canvas background with particles and connecting nodes (used in Awakening stage).

**Features:**
- Particle system with random motion
- Node network with distance-based connections
- Responsive sizing
- Configurable particle and node counts

**Props:**
- `config?: Partial<CosmosConfig>` - Optional configuration

### Stage Components

#### VoidStage (Stage 1)
A minimalist void space representing the initial rupture.
- Empty visual space
- Continue button with pulse animation

#### SignalStage (Stage 2)
Shows terminal-style initialization message.
- Typewriter animation for system messages
- Delayed continue button activation

#### AwakeningStage (Stage 3)
Displays system awakening with animated cosmos.
- CosmosCanvas background
- Terminal output with animated text
- Delayed button appearance

#### GateStage (Stage 4)
The entry point to the Fabrich System.
- Centered title and description
- Call-to-action button
- Finalized system status

## Types

```typescript
interface Stage {
  id: number;
  label: string;
  title: string;
  description: string;
  content: React.ReactNode;
}

interface NavigationState {
  currentStage: number;
  completedStages: number[];
}

interface CosmosConfig {
  particleCount: number;
  nodeCount: number;
  connectionDistance: number;
}
```

## Styling

All components use **Tailwind CSS** for styling with custom color palette:
- Primary: `#5b9cf6` (Blue)
- Success: `#00e5c0` (Cyan)
- Background: `#000000` (Black)
- Accent: `#1a1a1a` (Dark Gray)

### Custom Animations
- `@keyframes typewrite` - Text typing effect
- `@keyframes blink` - Cursor blinking
- `@keyframes pulse-border` - Pulsing border effect

## Usage

### Basic Implementation

```typescript
import { CORE } from './components/CORE';

function App() {
  return <CORE />;
}

export default App;
```

### Using Individual Components

```typescript
import {
  CORE,
  VoidStage,
  SignalStage,
  AwakeningStage,
  GateStage,
  StageNavigation,
  CosmosCanvas,
} from './components/CORE';

// Use individual components as needed
```

## State Management

The CORE component manages:
- **currentStage**: Current stage (1-4)
- **completedStages**: Array of completed stage IDs

State is updated via:
- `handleNext()` - Advances to next stage
- `handleEnter()` - Handles entry action in Gate stage

## Animation Timing

| Stage | Key Events | Timing | Auto-Continue |
|-------|-----------|--------|---|
| Void | Display ready | 0s | 2s |
| Signal | Show message, Enable button | 0s, 2.5s | 2.5s |
| Awakening | Animate text lines, Enable button | Various, 4.5s | 4.5s |
| Gate | Display static content | 0s | Manual |

### Auto-Continue Mechanism

The auto-continue feature uses `useEffect` with `setTimeout` to automatically advance stages:

```typescript
useEffect(() => {
  if (!autoPlay || !stage.autoContinueDelay || currentStage === STAGES.length) {
    return;
  }

  const timer = setTimeout(() => {
    handleNext();
  }, stage.autoContinueDelay);

  return () => clearTimeout(timer);
}, [currentStage, autoPlay, stage]);
```

**How it works:**
1. Each stage has an optional `autoContinueDelay` property
2. When a stage becomes active, the effect triggers
3. After the specified delay, `handleNext()` is called
4. The stage advances automatically
5. Timers are cleaned up on unmount or when autoPlay is disabled

## Customization

### Auto-Continue Timing

Modify delays in `CORE.tsx`:

```typescript
const STAGES: Stage[] = [
  {
    id: 1,
    label: '1. VOID',
    title: 'VOID',
    description: 'Your description...',
    autoContinueDelay: 2000, // 2 seconds
  },
  // ...
];
```

### Disable Auto-Continue

Modify the initialization state:

```typescript
const [autoPlay, setAutoPlay] = useState(false); // Start disabled
```

Or implement a toggle:

```typescript
<button onClick={() => setAutoPlay(!autoPlay)}>
  {autoPlay ? 'Pause' : 'Play'}
</button>
```

### Colors
Modify color values in Tailwind classes:
- Update `text-[#5b9cf6]` for primary color
- Update `text-[#00e5c0]` for accent color

### Animations
Adjust animation timing in:
- `App.css` - Animation durations
- Individual stage components - Event timings

### Content
Update stage content in `CORE.tsx`:
```typescript
const STAGES: Stage[] = [
  {
    id: 1,
    label: '1. VOID',
    title: 'VOID',
    description: 'Your custom description...',
    autoContinueDelay: 2000,
  },
  // ...
];
```

## Performance Considerations

- **Canvas Animation**: Uses `requestAnimationFrame` for smooth performance
- **Memory**: Canvas animation is cleaned up on unmount
- **Responsive**: Canvas automatically resizes on window resize

## Browser Compatibility

- Modern browsers with ES6+ support
- Canvas API support required for CosmosCanvas
- CSS Grid and Flexbox support required

## Future Enhancements

- [ ] Keyboard navigation between stages
- [ ] Gesture-based navigation on mobile
- [ ] Custom stage plugins
- [ ] Analytics tracking for stage transitions
- [ ] Audio effects for stage transitions
- [ ] Mobile responsive improvements
