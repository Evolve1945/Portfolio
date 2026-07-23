---
tags: [layer, research, built]
created: 2026-04-26
updated: 2026-04-28
status: partial
---


> Gives Claude **live access to the web** — search, read, extract, and store findings in memory.

---

## Components

### Orion Browser
- WebKit-based browser by Kagi
- Extensions support (Chrome + Firefox extensions work)
- Built-in ad/tracker blocking (cleaner pages = fewer tokens to parse)
- Future: Orion API / MCP integration for headless browsing

### Chrome MCP (`mcp__Claude_in_Chrome__*`)
- DOM-aware page reading (no screenshot needed)
- JavaScript execution in page context
- Form filling and navigation
- Element finding by text/selector

### Web Search (`WebSearch` tool)
- Bing-powered search via built-in tool
- Returns titles + URLs + snippets
- Feeds into fetch pipeline

### Web Fetch (`mcp__workspace__web_fetch`)
- Fetches full page content
- Returns cleaned markdown text
- Used after search to get full article

---

## Research Workflow

```
Research Agent receives query
 │
 ▼
1. web_search(query) top 10 results (titles + snippets)
 │
 ▼
2. Filter: pick 3 most relevant URLs
 │
 ▼
3. web_fetch(url) × 3 full article content
 │
 ▼
4. Extract key facts structured JSON
 │
 ▼
5. Dedup + compress 300 token summary
 │
 ▼
6. Write to [Memory Layer](/notes/memory-layer) stored for future sessions
 │
 ▼
7. Return to Orchestrator typed JSON result
```

---

## Token Budget for Research

| Step | Tokens |
|---|---|
| Search results (10 results) | ~800 |
| 3 page fetches (avg 2000 tokens each) | ~6,000 |
| Extraction + compression | ~500 |
| **Total per research task** | **~7,300** |

With caching and dedup, repeated queries on same topic: ~500 tokens.

---

## Orion Integration Roadmap

1. **Phase 1 (now):** Use Chrome MCP for browser automation
2. **Phase 2:** Build Orion extension that exposes MCP endpoint
3. **Phase 3:** Orion profile dedicated to Claude (no history, clean cookies)

---

## Related Nodes

- [Memory Layer](/notes/memory-layer) — research findings stored here
- [Token Optimization](/notes/token-optimization) — page content compression
- [Orchestration](/notes/orchestration) — research agent dispatched here
- Prompt Injection Sanitizer — all web content is sanitized before entering agent context
- Trust Boundary Classifier — web data tagged EXTERNAL before any agent processing
- Google Gemini Features — grounding pattern inspiration

### Echo test
- **Time:** 2026-04-28 16:11:27
- **Agent:** `researcher` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 1,663 **Cost:** $0.01299
- **Output:** # Claude Ecosystem Architecture — Summary Based on documentation retrieved from memory, here is a structured overview: --- ## Overview The **Claude Ecosystem** is a **multi-layered, modular AI orchestration system** designed to coordinate intelligent agents, manage memory, and execute tasks in a …

### Echo test
- **Time:** 2026-04-28 22:09:07
- **Agent:** `researcher` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 1,571 **Cost:** $0.01161
- **Output:** # Claude Ecosystem Architecture — Summary Based on documentation retrieved from memory, here is a structured overview: --- ## Overview The **Claude Ecosystem** is a **multi-layered, modular AI orchestration system** designed to coordinate intelligent agents, manage memory, and execute tasks in a …

### Echo test
- **Time:** 2026-04-28 22:23:05
- **Agent:** `researcher` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 1,589 **Cost:** $0.01182
- **Output:** # Claude Ecosystem Architecture — Summary Based on documentation retrieved from memory, here is a structured overview: --- ## Overview The **Claude Ecosystem** is a **multi-layered, modular AI orchestration system** designed to coordinate intelligent agents, manage memory, and execute tasks in a …

### Search for the latest developments, key facts, and expert op
- **Time:** 2026-05-27 19:01:44
- **Agent:** `researcher` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 994 **Cost:** $0.00659
- **Output:** I notice you haven't specified a **topic** to research. Additionally, I should be transparent about an important system limitation I can see in the context: --- ## System Status Notice The web research circuit is currently **OPEN** (failed state), meaning live web search tools are unavailable …

### Search for the latest developments, key facts, and expert op
- **Time:** 2026-05-27 19:01:57
- **Agent:** `researcher` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 1,049 **Cost:** $0.00742
- **Output:** I notice you haven't specified a **topic** to research, and the context shows that the web research circuit is currently experiencing failures (Circuit OPEN). Here's a transparent status report: --- ## System Status Notice **No topic was provided**, and **live web research is currently unavail …

### Search for the latest developments, key facts, and expert op
- **Time:** 2026-05-27 19:02:10
- **Agent:** `researcher` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 1,054 **Cost:** $0.00729
- **Output:** I notice **no specific topic was provided** in your request. Additionally, I must be transparent about a system limitation: --- ## System Status Notice The web research circuit is currently showing **OPEN/failed state** in the system context, meaning **live web search is unavailable** at this …

### Search for the latest developments, key facts, and expert op
- **Time:** 2026-05-27 19:02:14
- **Agent:** `researcher` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 1,014 **Cost:** $0.00669
- **Output:** I notice **no specific topic has been provided** in your request. Additionally, I must be transparent about a current system limitation. --- ## System Status & Limitations Based on the context available, the **web research circuit is currently in a failed/open state**, meaning live web searche …

### Search for the latest developments, key facts, and expert op
- **Time:** 2026-05-27 19:02:19
- **Agent:** `researcher` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 1,100 **Cost:** $0.00798
- **Output:** ## No Topic Specified + System Limitation Notice **Direct Answer:** No research topic was provided in your request, and live web search capability is currently unavailable due to a circuit failure in the researcher system. --- ## System Status | Component | Status | |-----------|--------| | W …

### Return a summary of the Claude Ecosystem architecture.
- **Time:** 2026-05-27 19:03:09
- **Agent:** `researcher` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 1,424 **Cost:** $0.00894
- **Output:** # Claude Ecosystem Architecture — Summary The **Claude Ecosystem** is a multi-layered, modular AI orchestration system designed to coordinate intelligent agents, manage memory, and execute tasks in a structured, scalable way. --- ## Core Architectural Layers | Layer | Purpose | |---|---| | **Vis …

### Return a summary of the Claude Ecosystem architecture.
- **Time:** 2026-05-27 19:03:35
- **Agent:** `researcher` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 1,390 **Cost:** $0.00855
- **Output:** # Claude Ecosystem Architecture — Summary The **Claude Ecosystem** is a multi-layered, modular AI orchestration system designed to coordinate intelligent agents, manage memory, and execute tasks in a structured, scalable way. --- ## Core Architectural Layers | Layer | Purpose | |---|---| | **Vis …

### Search for the latest developments, key facts, and expert op
- **Time:** 2026-05-27 21:35:24
- **Agent:** `researcher` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 1,070 **Cost:** $0.00676
- **Output:** # Research Request — Topic Not Specified ## Direct Answer No specific topic was provided in your request, and I cannot conduct live web research at this time due to a system limitation currently preventing external searches. --- ## System Status Notice | Component | Status | |-----------|---- …

### Search for the latest developments, key facts, and expert op
- **Time:** 2026-05-27 21:35:26
- **Agent:** `researcher` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 1,137 **Cost:** $0.00777
- **Output:** # Research Request — Topic Not Specified ## Direct Answer No specific topic was provided in your request, and I cannot conduct a meaningful search without one. Additionally, live web search capabilities are currently unavailable based on system context. --- ## System Status | Component | Stat …

### Search for the latest developments, key facts, and expert op
- **Time:** 2026-05-27 21:35:39
- **Agent:** `researcher` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 1,251 **Cost:** $0.00871
- **Output:** # Research Request — Topic Not Specified + System Limitation ## Direct Answer No specific topic was provided in your request, and live web search capability is currently unavailable due to a circuit-open (failed) state in the research system. --- ## Two Issues to Address ### 1. Missing Topi …

### Search for the latest developments, key facts, and expert op
- **Time:** 2026-05-27 21:35:51
- **Agent:** `researcher` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 1,182 **Cost:** $0.00765
- **Output:** ## System Limitation Notice I need to be transparent before proceeding: based on the system context, the **web research circuit is currently in a failed/open state**, meaning **live web search is unavailable**. I cannot retrieve real-time information or verify current sources. Additionally, **n …

### Search for the latest developments, key facts, and expert op
- **Time:** 2026-05-27 21:36:00
- **Agent:** `researcher` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 1,175 **Cost:** $0.00754
- **Output:** ## System Limitation Notice I need to be transparent upfront: **no specific topic was provided** in your request, and the system context indicates that **live web search capabilities are currently unavailable** (the web research circuit is in an open/failed state). --- ## What I Can Still Do …

### Return a summary of the Claude Ecosystem architecture.
- **Time:** 2026-05-27 21:36:46
- **Agent:** `researcher` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 1,422 **Cost:** $0.00903
- **Output:** # Claude Ecosystem Architecture — Summary The **Claude Ecosystem** is a multi-layered, modular AI orchestration system designed to coordinate intelligent agents, manage memory, and execute tasks in a structured, scalable way. --- ## Core Architectural Layers | Layer | Purpose | |---|---| | **Vis …

### Return a summary of the Claude Ecosystem architecture.
- **Time:** 2026-05-27 21:37:23
- **Agent:** `researcher` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 1,387 **Cost:** $0.00865
- **Output:** # Claude Ecosystem Architecture — Summary The **Claude Ecosystem** is a multi-layered, modular AI orchestration system designed to coordinate intelligent agents, manage memory, and execute tasks in a structured, scalable way. --- ## Core Architectural Layers | Layer | Purpose | |---|---| | **Vis …

### [OK] auto-trigger: repo_scout
- **Time:** 2026-06-25 17:11:15
- **Agent:** `repo-scout` `gpt-4o`
- **Status:** completed
- **Tokens:** 2,873 **Cost:** $0.00832
- **Output:** Assumptions: 1. The requested task involves scanning GitHub repositories for new patterns and API changes relevant to the Claude Ecosystem. 2. The output should be written to the VAULT/Knowledge/ as a findings summary. 3. The task involves evaluating each repository on stars, recent activity, licens …

### [OK] auto-trigger: repo_scout
- **Time:** 2026-07-12 17:52:46
- **Agent:** `repo-scout` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 0 **Cost:** $0.00000
- **Output:** Tool loop error: Error code: 400 - {'type': 'error', 'error': {'type': 'invalid_request_error', 'message': 'Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade or purchase credits.'}, 'request_id': 'req_011CcxS1yhE2gSy1eHjgPsQa'}

### [OK] Skills Scan
- **Time:** 2026-07-20 14:39:05
- **Agent:** `researcher` `claude-haiku-4-5-20251001`
- **Status:** completed
- **Tokens:** 0 **Cost:** $0.00000
- **Output:** Tool loop error: Error code: 400 - {'type': 'error', 'error': {'type': 'invalid_request_error', 'message': 'Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade or purchase credits.'}, 'request_id': 'req_011CdDKjP7GfeaoUHXVJCz3T'}
