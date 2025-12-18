---
description: Workflow for updating the Gemini Assistant's capabilities when new features are added.
---

# Update Gemini Assistant Capabilities

Trigger this workflow **immediately after implementing a new user-facing feature** that allows users to build, modify, or analyze the survey.

## 1. Analyze Feature Capabilities
Identify what the user can do with the new feature.
*   **Action**: Can they perform a new action? (e.g., "Duplicate Block", "Add Page Break")
*   **Knowledge**: Do they need to ask about a new concept? (e.g., "What is a 'carry forward'?")

## 2. Update Tools (`services/geminiTools.ts`)
If the feature requires the AI to perform an action (edit the state), you likely need to expose a new tool or update an existing one.

1.  Open `services/geminiTools.ts`.
2.  **Check existing tools**: Can `update_question` or `add_question` already handle this?
    *   *Example*: If you added a new Question Type, you just need to update the `enum` in `add_question`.
3.  **Create new tool**: If no existing tool fits, create a new `FunctionDeclaration`.
    *   Keep descriptions **concise** but descriptive enough for the model to understand *when* to use it.
    *   Use strict typing for parameters.
4.  **Register the tool**:
    *   Import the new tool in `hooks/useGeminiChat.ts`.
    *   Add it to the `tools` array in the `ai.chats.create` config.
    *   Add the handler logic in the `sendMessage` function (search for `result = await ...`).

## 3. Update System Instruction (`services/geminiSystemInstruction.ts`)
Update the core prompt to inform the AI about the new capability or constraint.

1.  Open `services/geminiSystemInstruction.ts`.
2.  **Add minimal instructions**:
    *   **Do not** allow the prompt to grow indefinitely.
    *   **Token Efficiency**: Use concise language. Avoid "You should", "Please", "I would like you to". Use imperatives: "Use X for Y." "When Z, do W."
    *   **Context**: If the feature relies on specific data structure (e.g., `logic` object), ensure the `generateSurveyContext` function in `useGeminiChat.ts` includes that data.
3.  **Example Update**:
    *   *Bad*: "Now you can also delete blocks if the user asks you to. You should look for the block ID and then call the delete block tool."
    *   *Good*: "To delete blocks, use `delete_block(bid)`."

## 4. Update Survey Context (`hooks/useGeminiChat.ts`)
The AI only knows what it "sees" in the context string.

1.  Check `generateSurveyContext` function.
2.  Ensure the new feature's data is textually represented in the summary.
    *   *Example*: If you added "Page Titles", ensure `generateSurveyContext` iterates over pages and output their titles.
    *   **Keep it brief**: Use markdown structure. Avoid JSON dumps.

## 5. Verification
1.  Run the app locally.
2.  Open the Chat Assistant.
3.  Ask it to perform the new action or explain the new feature.
4.  Verify it calls the correct tool with the correct arguments.
