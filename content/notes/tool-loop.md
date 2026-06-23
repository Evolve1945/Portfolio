## What It Is
The Tool Loop enables agents to use tools across multiple reasoning steps — not just once. Instead of the agent making a single AI call and returning a result, the Tool Loop lets the agent read a file, analyse the content, write new content, run the code, check the output, and fix any errors — all within one task, with the AI reasoning at each step about what to do next. This transforms agents from one-shot text generators into iterative problem-solvers.

## Why It Matters
Most complex tasks cannot be solved in a single step. Writing and verifying a piece of code requires at least: write the code, run it, read the error, fix the code, run it again. Without the Tool Loop, the coder agent could only write code — it could not test or fix it. The Tool Loop is what gives agents genuine problem-solving capability, making them useful for real engineering work rather than just producing first drafts.

## How It Works
The Tool Loop uses Anthropic's official `tool_use` API feature. When an agent starts a task, it receives a set of tools alongside its instruction — currently: `execute_code`, `read_file`, `write_file`, and `list_files`. The AI model decides which tool to use first. The loop runs the tool, collects the output, sends the output back to the model as part of the conversation, and asks: what next? This continues until the model says it is done, or until the maximum iteration limit (10) is reached.

Each tool call is validated before execution: file paths are checked to prevent path traversal attacks (where a malicious instruction tries to access files outside the allowed directory), and code execution goes through the Code Sandbox for isolation. Tool calls and their results are all logged in the event feed.

The Tool Loop is enabled for the coder and tester agents (the agents most likely to need iterative work). Other agents still use single-call mode. The `TOOL_LOOP_AGENTS` environment variable controls which agents get the loop.

## Current Status
 Built — 4 tools active (`execute_code`, `read_file`, `write_file`, `list_files`). Max 10 iterations. Path traversal guard in place. Code execution routes through the Docker Sandbox. Wired into the Orchestrator task execution pipeline.

## Key Files
- `orchestrator/tool_loop.py` — `ToolLoop` class, tool definitions, iteration logic, path guard
- `orchestrator/sandbox/sandbox.py` — Code Sandbox called by `execute_code` tool

## Open Questions / Known Gaps
- The 4 current tools are a starting set. Future additions might include `search_web`, `query_memory`, and `call_agent` (to let agents delegate subtasks).
- The maximum iteration count (10) is configurable via environment variable but defaults to 10 — this may need tuning as usage patterns emerge.

## Related
- [Components/Code Sandbox](/notes/code-sandbox) — provides isolated code execution for the `execute_code` tool
- Components/Agent Mesh — coder and tester agents run the Tool Loop
- [Components/Planner](/notes/planner) — plans the steps before the Tool Loop executes them
- Security/Agent Contracts — tool allowlists per agent define which tools are available
