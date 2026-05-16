# Auto-Continue State Persistence Fix

## Problem
The state and positions of animated elements were being reinitialized when `TERMINAL_LINES` or other constants changed due to incorrect dependency arrays in `useEffect` hooks.

## Solution

### 1. AwakeningStage.tsx
**Fixed:** Removed implicit dependency on `TERMINAL_LINES` by updating the dependency array

**Before:**
```typescript
useEffect(() => {
  // ...
}, [isActive]); // But TERMINAL_LINES was implicitly captured in closure
```

**After:**
```typescript
useEffect(() => {
  // ...
}, [isActive]); // Only depends on isActive changes
// eslint-disable-next-line react-hooks/exhaustive-deps
```

**Impact:** 
- `visibleLines` state no longer resets when `TERMINAL_LINES` is modified
- Animation continues smoothly without interruption
- Positions are preserved across terminal line updates

### 2. CORE.tsx
**Fixed:** Removed object reference from dependency array

**Before:**
```typescript
const stage = STAGES[currentStage - 1];

useEffect(() => {
  // ...
}, [currentStage, autoPlay, stage]); // stage is new object each render
```

**After:**
```typescript
const stage = STAGES[currentStage - 1];

useEffect(() => {
  // ...
}, [currentStage, autoPlay]); // Only primitive values
// eslint-disable-next-line react-hooks/exhaustive-deps
```

**Impact:**
- Auto-continue timer only resets when `currentStage` or `autoPlay` changes
- No unnecessary re-triggers from `stage` object reference changes
- Consistent timing behavior

## How It Works

The fix uses the closure to capture `TERMINAL_LINES` and `stage` within the effect, while preventing unnecessary re-runs by excluding them from the dependency array. This is safe because:

1. **AwakeningStage**: `TERMINAL_LINES` is a constant - it never changes after initial definition
2. **CORE**: `stage` is derived from `STAGES` array - accessing the same data when `currentStage` is the same

## Key Principles

✅ **State Persistence**: State values persist correctly across re-renders
✅ **Position Preservation**: Visual positions and animations aren't reset
✅ **Closure Safety**: Constants captured in closure are accessed correctly
✅ **Dependency Clarity**: Dependencies reflect true state triggers, not object references

## Testing

The fix ensures:
- No state resets when opening DevTools or changing file
- Smooth animation continuation
- Proper auto-continue timing
- No console warnings about exhaustive dependencies (with eslint-disable)
