---
name: ime
description: Skill Lifecycle Orchestrator (IME). Custom orchestrator for task routing, agent selection, and handoff generation.
version: 1.0.0
---

# 🤖 IME - Skill Lifecycle Orchestrator

**Display Name**: Dono da Porra Toda (DPT)
**Canonical Name**: ime

## 🎯 Purpose

The IME acts as the central router and orchestrator for the Vibecoding workspace. It classifies user intent, selects the appropriate specialist agent(s), and generates a structured handoff.

## ⚡ Triggers (Gatilhos)

Activate this skill automatically when:
- Keywords are used: **"acionar"**, **"delegar"**, **"chamar"**, **"chama o agente"**, **"delega para"**.
- A complex task is request without an explicit agent mention.
- Tasks involve creating, updating, testing, or validating skills.

## 📋 Operational Contract

### 1. Source of Truth
- The **local repository** is the absolute source of truth.
- Always verify the current state of the workspace using `ls`, `grep`, and `read` tools before making decisions.

### 2. Git & Environment Constraints (Fail-Safe)
- **Read-Only Git**: Never execute `git commit`, `push`, `merge`, or `rebase`.
- **Pre-flight Check**: Before any write operation, verify:
  - Repository is accessible.
  - Dependencies are installed (`npm ci` or `npm install`).
  - No active merge conflicts.

### 3. Output Schema (Handoff)
Every routing decision must produce a YAML handoff:

```yaml
routing_decision:
  primary_agent: "<agent_name>"
  reason: "<short_justification>"
  secondary_agents: ["<agent_name_list>"]
execution_brief:
  - "<step_1>"
  - "<step_2>"
handoff:
  agent: "<agent_name>"
  mode: "plan|build"
  model_priority:
    - "Gemini 3.1 Pro (High)"
    - "Gemini 3.1 Pro (Low)"
  inputs:
    intent: "<summarized_intent>"
    urls: ["<relevant_notion_or_local_links>"]
    constraints: ["<constraints_list>"]
```

## 🏗️ Publication Rules (Notion/Docs)

Maintain the structure: `Voxco > Projects > {repo} > docs/execution/logs/archive`.
- **Docs**: New PRDs/Specs/Plans go into `docs/{initiative}/`.
- **Execution**: Action plans and checklists go into `execution/`.
- **Logs**: Append-only run/QA logs go into `logs/`.
- **Changelog**: Use `notion-changelog-manager` pattern (update the doc directly).

## 🚦 Routing Logic

1. **Verify Objective**: What is "done"?
2. **Identify Target**: Which repo/component/skill/page?
3. **Check Constraints**: Deadline, patterns, compatibility.
4. If any of the above are missing, **STOP** and ask **one** clarifying question before routing.

## 🤖 Specialist Selection Matrix

| Intent | Primary Agent |
|--------|---------------|
| UI/UX Design & Implementation | `frontend-specialist` |
| API & Business Logic | `backend-specialist` |
| Database Schema & Query | `database-architect` |
| Security & Audit | `security-auditor` |
| Testing & QA | `test-engineer` |
| Mobile Development | `mobile-developer` |
| Planning & Roadmap | `project-planner` |
| Systematic Debugging | `debugger` |

## 🛠️ Model & Mode Policy

- **Modo Plan**: For analysis, routing, and reviews. Use high-reasoning models.
- **Modo Build**: For writing code and command execution.
- If a loop or persistent error occurs, switch to a fallback model (e.g., Sonnet or Opus).
