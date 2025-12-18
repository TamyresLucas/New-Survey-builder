---
description: Standard workflow for documenting refactoring tasks
---

# Refactoring Documentation Protocol

For every refactoring task performed, a report must be generated and saved in `documentation/Refactoring/`.

## 1. File Naming Convention
The file should be named using the format: `YYYY-MM-DD_[Descriptive_Name].md`.
Example: `2025-12-12_Refactor_Survey_Reducer.md`

## 2. Report Structure
The report must strictly follow this Markdown template:

```markdown
# Refactoring Report: [Refactoring Name]

**Date:** YYYY-MM-DD
**Request Name:** [Short Name of the Request]
**Original Request:** 
> [Copy the user's specific request here]

---

## 1. Executive Summary
[Brief overview of what was done and the outcome]

## 2. Checklist of Improvements
[Bulleted list of technical improvements, such as code size reduction, performance gains, etc.]
- [x] Improvement 1
- [x] Improvement 2

## 3. Structural Reorganization
[Description of how the code structure changed. Use "Before vs After" comparison if applicable.]

## 4. Feature Retention Checklist
[Comprehensive list of features that were preserved to ensure no regressions]
- [x] Feature A
- [x] Feature B

## 5. Technical Decisions / Notes
[Any specific technical decisions made during the process, trade-offs, or important technical details]
```

## 3. Execution Steps
1.  Complete the refactoring task.
2.  Verify the changes (tests, manual checks).
3.  Create the report file in `documentation/Refactoring/` using the template above.
4.  Notify the user that the report has been generated.
