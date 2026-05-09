---
name: write-agent-rule
description: Generates or updates Google Antigravity Agent Rules and Workflows according to official specs. Use when the user wants to create a new persistent rule or a multi-step workflow.
---

# Write Agent Rule Skill

This skill allows you to generate robust, standard-compliant Agent Rules and Workflows for Google Antigravity.

## When to use this skill
- Creating a persistent system prompt constraint (a Rule).
- Creating a multi-step trajectory task (a Workflow).
- When the user asks to "make a rule" or "create a workflow" for a given process.

## Rules vs Workflows Overview

- **Rules**: Provide models with guidance by providing persistent, reusable context at the prompt level. They are manually defined constraints.
- **Workflows**: Provide a structured sequence of steps or prompts at the trajectory level, guiding the model through a series of interconnected tasks or actions. 

## How to create a Rule

1. **Location**: Write the rule to `.agents/rules/<rule-name>.md`
2. **Format**: Create a Markdown file. 
3. **Activation**: Specify in the text how you intend the rule to be activated. The platform supports:
   - `Manual`: Activated via @ mention.
   - `Always On`: Always applied.
   - `Model Decision`: Applied if model deems it relevant.
   - `Glob`: Matches specific file extensions.
4. **References**: You MUST use the `@filename` syntax to reference other files inside a Rule. (e.g., `@src/utils.ts` or `@/absolute/path.md`).

## How to create a Workflow

1. **Location**: Write the workflow to `.agents/rules/<workflow-name>.md`
2. **Format**: A Markdown file with a title, a description, and a series of concrete steps with specific instructions.
3. **Execution Commands**: Agent can execute other workflows from within a workflow by including “Call /workflow-2”.
4. **Limits**: A Workflow Markdown file is STRICTLY limited to 12,000 characters.

## Best Practices
- Never exceed 12,000 characters for Rules or Workflows.
- Clearly describe the "Trigger" conditions at the top of the Markdown file.
