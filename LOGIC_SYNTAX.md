# Advanced Logic Syntax Documentation

Voxco Survey Platform’s Advanced Logic Editor uses a simple, formula‑like expression language that lets you write conditions (for skip/display logic, validation, etc.) directly as text instead of only using the point‑and‑click builder.

Below is a practical breakdown of how the logic format/grammar works in the Advanced mode of the logic editor.

## Basic structure
In Advanced mode, logic is written as a single expression that evaluates to true or false.
If the expression is true, the action (e.g., show question, skip to, validate) is triggered.

A typical expression looks like:

```text
Q1.A1 = 1
```
This means:
“If answer A1 of question Q1 equals 1, then do the action”.

## How to reference questions and answers
Voxco uses a standard notation to refer to questions and their answers:

*   **Qx** → refers to question with ID x (e.g., Q1, Q5, Q10).
*   **Qx.Ay** → refers to answer option Ay of question Qx (e.g., Q1.A1, Q2.A3).
*   **Qx.Ay.Cz** → for matrix/rating questions, Cz refers to column z of that answer.

**Examples:**

*   `Q1.A1 = 1` → “If answer A1 of Q1 is selected (value 1)”.
*   `Q2.A3 = 0` → “If answer A3 of Q2 is not selected (value 0)”.
*   `Q3.A1.C2 = 5` → “If in matrix Q3, answer A1, column C2 has value 5”.

## Common operators
The Advanced Logic Editor supports standard comparison and logical operators.

### Comparison operators
| Operator | Meaning | Example |
| :--- | :--- | :--- |
| `=` | Equal to | `Q1.A1 = 1` |
| `<>` | Not equal to | `Q1.A1 <> 1` |
| `>` | Greater than | `Q1.A1 > 3` |
| `>=` | Greater than or equal to | `Q1.A1 >= 3` |
| `<` | Less than | `Q1.A1 < 5` |
| `<=` | Less than or equal to | `Q1.A1 <= 5` |
| `LIKE` | Contains (text) | `Q1.A1 LIKE "yes"` |
| `RLIKE` | Regular expression match | `Q1.A1 RLIKE "^yes.*"` |

**Notes:**
*   `LIKE` is case‑insensitive by default in many Voxco setups.
*   `RLIKE` lets you use regex patterns (e.g., `^yes` for “starts with yes”).

### Logical operators
| Operator | Meaning | Example |
| :--- | :--- | :--- |
| `AND` | Both true | `Q1.A1 = 1 AND Q2.A2 = 1` |
| `OR` | Either true | `Q1.A1 = 1 OR Q1.A2 = 1` |
| `NOT` | Negation | `NOT Q1.A1 = 1` |

**Order of evaluation:**
1.  `NOT` is evaluated first.
2.  Then `AND`.
3.  Then `OR`.

Use parentheses to control order: `(Q1.A1 = 1 OR Q1.A2 = 1) AND Q3.A1 = 1`.

## Working with different question types
The exact syntax depends on the question type.

### Single‑choice / radio questions
For a radio question Q1 with options A1, A2, A3:

*   `Q1.A1 = 1` → A1 is selected.
*   `Q1.A1 = 0` → A1 is not selected.
*   `Q1 = 1` → Q1 has any answer selected (not empty).
*   `Q1 = 0` → Q1 is unanswered (empty).

### Multiple‑choice / checkbox questions
For a checkbox question Q2 with options A1, A2, A3:

*   `Q2.A1 = 1` → A1 is checked.
*   `Q2.A1 = 0` → A1 is unchecked.
*   `Q2 = 1` → at least one option is checked.
*   `Q2 = 0` → no options are checked (empty).

### Text / numeric / open‑ended questions
For a text/numeric question Q3:

*   `Q3 = "yes"` → text equals “yes” (exact match).
*   `Q3 LIKE "yes"` → text contains “yes”.
*   `Q3 > 18` → numeric value greater than 18.
*   `Q3 <> ""` → not empty (has some text).
*   `Q3 = ""` → empty (no text).

## Using parentheses and grouping
Parentheses `()` are used to group conditions and control evaluation order.

**Examples:**

*   `(Q1.A1 = 1 OR Q1.A2 = 1) AND Q2.A1 = 1`
    *   → “If Q1 is A1 or A2, and Q2 is A1”.
*   `NOT (Q1.A1 = 1 AND Q2.A1 = 1)`
    *   → “If it is not true that both Q1.A1 and Q2.A1 are selected”.

## Practical examples
Here are some common patterns you can write in the Advanced Logic Editor.

### 1. Skip if “No” is selected
```text
Q1.A2 = 1
```
**Meaning:** “If answer A2 (e.g., ‘No’) of Q1 is selected, skip to the next relevant question”.

### 2. Show follow‑up only if “Yes” and age > 18
```text
Q1.A1 = 1 AND Q2 > 18
```
**Meaning:** “Show this question only if Q1.A1 (‘Yes’) is selected and age (Q2) is over 18”.

### 3. Validate: must select at least one option
```text
Q1 = 1
```
**Meaning:** “Q1 must not be empty; at least one option must be selected”.

### 4. Complex condition with text and multiple choices
```text
(Q1.A1 = 1 OR Q1.A2 = 1) AND Q3 LIKE "premium"
```
**Meaning:** “If Q1 is A1 or A2, and Q3 contains the word ‘premium’”.

## Tips for using Advanced mode
*   **Use autocomplete:** When you type Q, the editor usually shows a list of questions; when you type Qx.A, it shows available answers.
*   **Test thoroughly:** Always preview the survey and test all answer paths to make sure the logic behaves as expected.
*   **Keep it readable:** Use parentheses and line breaks (if the editor allows) to make complex logic easier to read and debug.
*   **Check case sensitivity:** For `LIKE`, confirm whether it’s case‑sensitive in your Voxco setup; if unsure, use `RLIKE` with a case‑insensitive flag if supported.
