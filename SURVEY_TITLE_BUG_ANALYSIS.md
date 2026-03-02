# Survey Title Reset Bug - Detailed Problem Description

## Executive Summary
The Survey Title feature resets to "Untitled survey" when users switch between tabs (Build ↔ Flow ↔ Blueprint) or enter Preview mode, despite the user having edited it. This occurs even though the edit appears to save initially.

---

## Problem Reproduction Steps

1. **Initial State**: Survey has title "Untitled survey"
2. **User Action**: Click on Survey Title, edit to "My Custom Survey"
3. **Expected**: Title persists as "My Custom Survey"
4. **Actual**: Title shows "My Custom Survey" initially
5. **Bug Trigger**: User switches to Flow tab or clicks Preview
6. **Result**: Title reverts to "Untitled survey"
7. **Persistence**: Switching back to Build still shows "Untitled survey"

---

## Architecture Overview

### Component Hierarchy
```
App.tsx
  └─ SurveyCanvas.tsx
      └─ SurveyTitleEditor.tsx
          └─ EditableText.tsx (contentEditable div)
```

### Data Flow
```
User Edit → EditableText.onBlur → SurveyTitleEditor.handleChange → 
onUpdateDisplayTitle → dispatch(UPDATE_DISPLAY_TITLE) → metaReducer → 
survey.displayTitle updated → localStorage saved → Component re-renders
```

---

## Key Code Locations

### 1. EditableText Component (`components/EditableText.tsx`)

**Lines 16-20: Initial Mount Effect**
```typescript
useEffect(() => {
    if (elementRef.current && elementRef.current.innerHTML === '') {
        elementRef.current.innerHTML = html;
    }
}, []); // Empty deps - runs ONLY on mount
```

**Lines 22-30: Prop Sync Effect**
```typescript
useEffect(() => {
    // Only update innerHTML if the element is NOT focused
    if (elementRef.current &&
        html !== elementRef.current.innerHTML &&
        document.activeElement !== elementRef.current) {
        elementRef.current.innerHTML = html;
    }
    lastHtml.current = html;  // ALWAYS updates to prop value
}, [html]);
```

**Lines 32-38: Blur Handler**
```typescript
const handleBlur = () => {
    if (readOnly) return;
    const currentHtml = elementRef.current?.innerHTML || '';
    if (lastHtml.current !== currentHtml) {
        onChange(currentHtml);
    }
};
```

**Critical Behaviors:**
- Uses `contentEditable` for inline editing
- Maintains `lastHtml` ref to track last known prop value
- Only updates DOM when element is NOT focused
- Compares `lastHtml.current` vs actual DOM content on blur

### 2. SurveyTitleEditor Component (`components/SurveyTitleEditor.tsx`)

**Line 40: Prop Passed to EditableText**
```typescript
<EditableText
    html={displayTitle || 'Add survey title...'}
    onChange={handleChange}
    // ...
/>
```

**Lines 23-33: Change Handler**
```typescript
const handleChange = (newTitle: string) => {
    const truncated = newTitle.slice(0, maxLength);
    const trimmed = truncated.trim();
    
    if (trimmed) {
        onUpdateDisplayTitle(trimmed);
        setCharCount(trimmed.length);
    }
};
```

### 3. SurveyCanvas Component (`components/SurveyCanvas.tsx`)

**Line 269: CRITICAL FALLBACK**
```typescript
<SurveyTitleEditor
    displayTitle={survey.displayTitle || survey.title}
    onUpdateDisplayTitle={onUpdateDisplayTitle}
    // ...
/>
```

**This fallback `|| survey.title` is central to the bug.**

### 4. App.tsx Tab Switching Logic

**Lines 802-868: Conditional Rendering**
```typescript
{activeMainTab === 'Blueprint' ? (
    <div>...</div>
) : isDiagramView ? (
    <DiagramCanvas ... />
) : (
    <SurveyCanvas survey={displaySurvey} ... />
)}
```

**Line 349: displaySurvey Definition**
```typescript
const displaySurvey = survey;
```

**Critical Behavior:**
- SurveyCanvas **completely unmounts** when switching to Flow/Blueprint
- SurveyCanvas **remounts from scratch** when switching back to Build
- All child components (SurveyTitleEditor, EditableText) are new instances

### 5. State Management

**metaReducer.ts (Lines 15-19): UPDATE_DISPLAY_TITLE Handler**
```typescript
case SurveyActionType.UPDATE_DISPLAY_TITLE: {
    const newState = JSON.parse(JSON.stringify(state));
    newState.displayTitle = action.payload.displayTitle;
    return newState;
}
```

**useSurveyState.ts (Lines 16-18): Migration Logic**
```typescript
if (!savedState.displayTitle) {
    savedState.displayTitle = savedState.title;
}
```

**useSurveyState.ts (Line 69): Auto-save**
```typescript
window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(survey));
```

---

## Root Cause Analysis

### Primary Suspect: Component Unmount/Remount Cycle

**The Sequence:**

1. **User edits title to "My Custom Survey"**
   - EditableText.handleBlur fires
   - Calls `onChange("My Custom Survey")`
   - SurveyTitleEditor.handleChange calls `onUpdateDisplayTitle("My Custom Survey")`
   - Action dispatched: `UPDATE_DISPLAY_TITLE` with payload `{ displayTitle: "My Custom Survey" }`
   - metaReducer updates state: `survey.displayTitle = "My Custom Survey"`
   - localStorage saves the updated survey

2. **User switches to Flow tab**
   - `activeMainTab` changes from 'Build' to 'Flow'
   - SurveyCanvas **unmounts completely** (replaced by DiagramCanvas)
   - All child components destroyed

3. **User switches back to Build tab**
   - `activeMainTab` changes from 'Flow' to 'Build'
   - SurveyCanvas **remounts as new instance**
   - SurveyTitleEditor **remounts as new instance**
   - EditableText **remounts as new instance**

4. **Critical Moment: What prop value does SurveyTitleEditor receive?**
   - SurveyCanvas passes: `displayTitle={survey.displayTitle || survey.title}`
   - **Question**: What is `survey.displayTitle` at this moment?
   - **Expected**: "My Custom Survey" (from state)
   - **Actual**: Likely `undefined` or not yet propagated
   - **Result**: Fallback `|| survey.title` returns "Untitled survey"

5. **EditableText receives "Untitled survey"**
   - First useEffect (line 16-20) runs on mount
   - Sets `innerHTML = "Untitled survey"`
   - User sees the reset

### Secondary Suspects

**Suspect 2: localStorage Timing**
- Possible race condition where localStorage.setItem hasn't completed before tab switch
- However, localStorage.setItem is synchronous, so this is unlikely

**Suspect 3: State Initialization**
- useSurveyState might be re-initializing when App.tsx re-renders
- Migration logic might not be running correctly
- Survey state might be reset during tab switches

**Suspect 4: EditableText lastHtml Ref Desync**
- The `lastHtml.current` ref might get out of sync with actual state
- When component remounts, ref is reset to initial value
- Subsequent updates might not trigger properly

---

## Diagnostic Questions

### Critical Questions to Answer:

1. **Is the UPDATE_DISPLAY_TITLE action actually being dispatched?**
   - Add logging to `handleUpdateDisplayTitle` in useSurveyActions.ts
   - Verify action reaches the reducer

2. **Is the reducer updating the state correctly?**
   - Add logging to metaReducer UPDATE_DISPLAY_TITLE case
   - Check if `newState.displayTitle` is set correctly

3. **Is localStorage being updated with displayTitle?**
   - After editing, check: `localStorage.getItem('surveyBuilderAppState_v4')`
   - Parse JSON and verify `displayTitle` property exists

4. **What value does survey.displayTitle have after tab switch?**
   - Add logging to SurveyCanvas to track `survey.displayTitle` value
   - Check if it's undefined, null, or has the correct value

5. **Is useSurveyState re-initializing on tab switch?**
   - Add logging to `getInitialSurveyState` function
   - Check if it's loading from localStorage or using initialSurveyData

6. **Does the migration logic actually run?**
   - Add logging to the migration block (lines 16-18)
   - Verify it's being executed

---

## Testing Recommendations

### Test 1: Verify State Persistence
```javascript
// In browser console after editing title:
const saved = localStorage.getItem('surveyBuilderAppState_v4');
const parsed = JSON.parse(saved);
console.log('displayTitle:', parsed.displayTitle);
console.log('title:', parsed.title);
```

### Test 2: Add Debug Logging

**In SurveyCanvas.tsx (before line 269):**
```typescript
console.log('SurveyCanvas render - survey.displayTitle:', survey.displayTitle);
console.log('SurveyCanvas render - survey.title:', survey.title);
```

**In SurveyTitleEditor.tsx (line 17):**
```typescript
useEffect(() => {
    console.log('SurveyTitleEditor received displayTitle:', displayTitle);
}, [displayTitle]);
```

**In EditableText.tsx (line 23):**
```typescript
useEffect(() => {
    console.log('EditableText html prop:', html);
    console.log('EditableText innerHTML:', elementRef.current?.innerHTML);
    // ... existing code
}, [html]);
```

**In metaReducer.ts (line 16):**
```typescript
case SurveyActionType.UPDATE_DISPLAY_TITLE: {
    console.log('UPDATE_DISPLAY_TITLE action:', action.payload);
    const newState = JSON.parse(JSON.stringify(state));
    newState.displayTitle = action.payload.displayTitle;
    console.log('Updated displayTitle to:', newState.displayTitle);
    return newState;
}
```

### Test 3: Verify Migration Logic
**In useSurveyState.ts (line 16):**
```typescript
if (!savedState.displayTitle) {
    console.log('Migration: Setting displayTitle from title:', savedState.title);
    savedState.displayTitle = savedState.title;
}
```

---

## Hypothesized Fix Strategies (Not Implemented)

### Strategy 1: Remove Fallback in SurveyCanvas
Change line 269 from:
```typescript
displayTitle={survey.displayTitle || survey.title}
```
To:
```typescript
displayTitle={survey.displayTitle ?? survey.title}
```
Or ensure `displayTitle` is always initialized.

### Strategy 2: Ensure displayTitle is Always Set
Modify the reducer to ensure `displayTitle` is never undefined:
```typescript
case SurveyActionType.UPDATE_SURVEY_TITLE: {
    const newState = JSON.parse(JSON.stringify(state));
    newState.title = action.payload.title;
    // Keep displayTitle in sync if not explicitly set
    if (!newState.displayTitle) {
        newState.displayTitle = action.payload.title;
    }
    return newState;
}
```

### Strategy 3: Fix EditableText Sync Logic
Modify EditableText to better handle prop changes during remount.

### Strategy 4: Prevent Unnecessary Unmounting
Render SurveyCanvas even when not visible, just hide it with CSS.

---

## Additional Context

### Files Modified in Implementation
1. `types.ts` - Added `displayTitle?: string` to Survey interface
2. `state/actions.ts` - Added `UPDATE_DISPLAY_TITLE` action type
3. `state/reducers/metaReducer.ts` - Added UPDATE_DISPLAY_TITLE case
4. `components/SurveyTitleEditor.tsx` - New component created
5. `hooks/useSurveyActions.ts` - Added `handleUpdateDisplayTitle`
6. `components/SurveyCanvas.tsx` - Integrated SurveyTitleEditor
7. `App.tsx` - Wired up the handler
8. `data/default-survey.ts` - Added `displayTitle: 'Untitled survey'`
9. `hooks/useSurveyState.ts` - Added migration logic

### Current Implementation Status
- ✅ Data model updated
- ✅ State management implemented
- ✅ Component created and integrated
- ✅ Migration logic added
- ❌ **BUG**: Title resets on tab switch/preview

---

## Conclusion

The bug appears to be related to the component unmount/remount cycle when switching tabs, combined with the fallback logic in SurveyCanvas (`survey.displayTitle || survey.title`). The exact point of failure needs to be identified through systematic logging of:

1. State values at each step
2. localStorage contents
3. Prop values received by components
4. Reducer execution

The most likely culprit is that `survey.displayTitle` is `undefined` when SurveyCanvas remounts, causing the fallback to kick in and pass "Untitled survey" to the child components.
