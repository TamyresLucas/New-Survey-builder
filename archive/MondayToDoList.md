# Monday To-Do List - Questionnaire Editor Redesign

## Phase 7: Questionnaire Editor Redesign Feedback

**Objective:** Refactor the application code to align with the agreed-upon feedback, ensuring consistency with the Notion documentation and industry best practices.

**Date:** January 9, 2026

---

### Prerequisites

- Ensure you have the `New-Survey-builder` repository cloned locally.
- All dependencies should be installed (`npm install`).
- You are on the main development branch.

---

### Step-by-Step Implementation Guide

#### Step 1: Rename `BehaviorTab` to `LogicTab` (T-01)

Standardizes the naming of the logic configuration tab to align with industry terminology.

**1.1. Rename the File:**
```bash
cd components/question-editor/
mv BehaviorTab.tsx LogicTab.tsx
```

**1.2. Update Import Statements:**
- **File:** `QuestionEditor.tsx`
- **Find:** `import BehaviorTab from './BehaviorTab';`
- **Replace:** `import LogicTab from './LogicTab';`

**1.3. Update Component Usage:**
- **Find:** `<Tab title="Behavior">...<BehaviorTab .../></Tab>`
- **Replace:** `<Tab title="Logic">...<LogicTab .../></Tab>`

---

#### Step 2: Refactor `SettingsTab` to Hybrid Approach (T-02 & S-01)

Reorganize the existing `SettingsTab` into a more structured and scalable format.

**2.1. Create New Section Components:**
```bash
cd components/question-editor/
mkdir settings-sections
touch settings-sections/QuestionConfigurationSection.tsx
touch settings-sections/ResponseOptionsSection.tsx
touch settings-sections/RandomizationSection.tsx
touch settings-sections/DisplayLayoutSection.tsx
touch settings-sections/NavigationSection.tsx
```

**2.2. Migrate Logic to New Sections:**

| Section | Contents |
|---------|----------|
| `QuestionConfigurationSection` | Question Type Selector, Activate Question toggle, Force Response toggle |
| `ResponseOptionsSection` | Answer Format Selector, Link Choices, Min/Max validation |
| `RandomizationSection` (S-01) | Randomize Choices toggle, Statement Randomization placeholder |
| `DisplayLayoutSection` | Choice Layout Editor |
| `NavigationSection` | Hide Back Button toggle |

**2.3. Update Main `SettingsTab` Component:**

```tsx
import QuestionConfigurationSection from './settings-sections/QuestionConfigurationSection';
import ResponseOptionsSection from './settings-sections/ResponseOptionsSection';
import RandomizationSection from './settings-sections/RandomizationSection';
import DisplayLayoutSection from './settings-sections/DisplayLayoutSection';
import NavigationSection from './settings-sections/NavigationSection';

const SettingsTab = ({ question }) => {
  const isChoiceBased = ['Radio', 'Checkbox', 'Dropdown'].includes(question.type);

  return (
    <div>
      <QuestionConfigurationSection question={question} />
      {isChoiceBased && <ResponseOptionsSection question={question} />}
      <RandomizationSection question={question} />
      <DisplayLayoutSection question={question} />
      <NavigationSection question={question} />
    </div>
  );
};

export default SettingsTab;
```

---

### Verification Checklist

- [ ] Run the application - compiles without errors
- [ ] Check Tab Renaming - "Behavior" tab is now "Logic"
- [ ] Check Settings Organization - SettingsTab organized into new sections
- [ ] Test Functionality - Toggle settings in each section

---

### Out of Scope (Post-Validation)

- **Question Type Renaming (QT-01 to QT-12):** Renaming question type identifiers will be handled in a separate task after stakeholder validation.
