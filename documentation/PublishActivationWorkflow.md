# Publish & Activate Workflow

This document outlines the consolidated workflow for Activating and Updating surveys using a single "Publish" button.

## Overview

The separate "Activate" toggle and "Publish" button are being replaced by a single, unified action button labeled **"Publish"**. This button handles both the initial activation of a survey and the pushing of updates to a live survey.

## Workflow Logic

The behavior of the "Publish" button depends on the current status of the survey:

### 1. Status: Draft
- **Action**: Clicking "Publish" changes the survey status from **Draft** to **Active**.
- **Result**: The survey becomes live and accessible to respondents.

### 2. Status: Active (Published)
- **Scenario**: The survey is already active, but changes have been made in the editor (e.g., modified questions, added logic).
- **Action**: Clicking "Publish" pushes these pending changes to the live version.
- **Result**: The live survey is updated with the latest changes from the editor.

## Summary

| Current Status | Button Label | Action on Click | New Status |
| :--- | :--- | :--- | :--- |
| **Draft** | Publish | Activate Survey | Active |
| **Active** (with changes) | Publish | Update Live Survey | Active |

This simplified workflow removes the need for a separate activation step and unifies the "go live" action under a single, clear command.
