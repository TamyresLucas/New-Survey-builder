---
description: How to update the changelog
---

1. Open `changelogs/changelogData.ts`.
2. Create a new entry at the top of the `changelogs` array.
3. Generate a unique ID (e.g., `YYYY-MM-DD-X`).
4. Increment the version number if applicable.
5. **CRITICAL**: Set the `date` to the current date and `time` to the current local time (e.g., "5:38 PM").
6. Fill in the `request`, `improvements`, and `technicalChanges` fields.
7. Save the file.
