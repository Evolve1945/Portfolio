---
tags: [reference, research]
created: 2026-04-26
updated: 2026-04-29
status: active
---

> Features from major AI platforms worth studying and adapting for the Claude Ecosystem. Each entry includes: what it is, how it works in one paragraph, where to find it, and what ecosystem component it maps to.
>
> **How to use with Perplexity:** Copy the feature name + the "Perplexity Query" line into Perplexity for up-to-date documentation, pricing, and implementation examples.

---

## How to Navigate This File

| Section | Companies |
|---|---|
| [Apple Intelligence](#apple-intelligence) | Foundation Models, Semantic Index, Private Cloud Compute, App Intents |
| [Amazon / AWS](#amazon--aws) | Bedrock Agents, Knowledge Bases, Guardrails, Step Functions, Secrets Manager |
| [OpenAI Platform](#openai-platform) | Structured Outputs, Batch API, Code Interpreter, Threads/Runs, Response API |
| [Google / DeepMind](#google--deepmind) | Vertex AI, Grounding, Gemini, Agent2Agent, NotebookLM |
| [Microsoft / Azure](#microsoft--azure) | Semantic Kernel, AutoGen, Azure AI Search, Key Vault, Content Safety |
| [Meta / Open Source](#meta--open-source) | Llama, FAISS, React Flow, PyTorch |
| [AI Infrastructure Tools](#ai-infrastructure-tools) | LangSmith, E2B, Tavily, Langfuse, Pinecone, Modal |
| [Original Repos](#original-repos) | Claude Code orchestration repos |

---

## Apple Intelligence

> **Why study Apple:** Best-in-class on-device ML, privacy-preserving cloud compute, and structured intent routing. The intent classification and private compute patterns are directly relevant to how the ecosystem routes tasks and protects user data.

---

### Foundation Models Framework
**What it is:** Apple's on-device LLM framework for iOS/macOS apps. Ships with a 3B parameter model running fully on-device with no network calls.
**How it works:** The Foundation Models framework exposes a Swift API that lets any app run text generation, summarization, and structured data extraction locally. The model runs in a secure enclave, results never leave the device. Apple's Adapters system lets you fine-tune behavior with small task-specific LoRA adapters without touching the base model.
**Ecosystem use:** Blueprint for the local LLM fallback (Task 32 — Ollama). The "adapter per task type" pattern maps to agent-specific fine-tuning. The on-device / cloud routing decision logic is directly copyable.
**Where to find it:** Apple Developer Documentation Foundation Models | WWDC 2025 Session "Meet Foundation Models framework"
**Perplexity Query:** `Apple Foundation Models framework on-device LLM Swift API 2025`

---

### Semantic Index
**What it is:** Apple's system-wide ML index that understands the meaning and relationships between all content on the device — photos, messages, documents, calendar, mail.
**How it works:** A background daemon continuously embeds all new content into a local vector store. When the user or an app queries with natural language, Semantic Index retrieves relevant items across all sources simultaneously. The index is fully on-device and encrypted. No content is sent to Apple's servers for indexing.
**Ecosystem use:** Exact blueprint for the RAG pipeline's vault watcher and multi-collection retrieval. The "embed everything continuously" + "query all collections simultaneously" pattern is what we want in the Obsidian + code + event collections. The on-device encryption model informs how we should handle the ChromaDB store.
**Where to find it:** WWDC 2025 "What's new in App Intents" | Apple Intelligence overview page
**Perplexity Query:** `Apple Intelligence Semantic Index how it works on-device vector search`

---

### Private Cloud Compute (PCC)
**What it is:** Apple's privacy-preserving server-side LLM execution system. Handles prompts too complex for on-device models without exposing data to Apple's infrastructure teams.
**How it works:** When a request exceeds on-device capabilities, it's routed to Apple Silicon servers running a hardened OS with no persistent storage and no operator access. The server signs each response with an attestation that it ran in a verified environment. Apple publishes PCC source code for independent security researchers to audit. Prompts are encrypted end-to-end and deleted after inference.
**Ecosystem use:** Inspiration for the trust boundary model (Task 91). The "INTERNAL / CLOUD_VERIFIED / EXTERNAL" trust ladder maps directly to our INTERNAL / EXTERNAL / UNKNOWN classification. The attestation pattern is worth studying for the planned remote access setup (Task 19 — Tailscale).
**Where to find it:** security.apple.com/private-cloud-compute | WWDC 2025 session on Apple Intelligence infrastructure
**Perplexity Query:** `Apple Private Cloud Compute architecture security attestation 2025`

---

### App Intents / Structured Intent Routing
**What it is:** Apple's framework for defining structured, type-safe actions that Siri, Shortcuts, and Apple Intelligence can route to the right app capability.
**How it works:** Developers define `AppIntent` structs with typed parameters and natural language phrases. When the user says something, the system classifies the intent (what they want to do) and extracts entities (who/what/when) into the typed struct before passing it to the app. The routing is deterministic once classified — no LLM hallucination on which action to take.
**Ecosystem use:** Direct blueprint for the missing Planner layer. Instead of asking the orchestrator LLM to "figure out" what the user wants, a structured intent classifier maps goals to formal `Intent` types (ResearchTask, CodeTask, MemoryTask, etc.) with typed parameters. The DAG executor already exists — it just needs typed intents feeding it.
**Where to find it:** developer.apple.com/documentation/appintents | WWDC 2023 "Dive into App Intents"
**Perplexity Query:** `Apple App Intents framework architecture structured intent classification`

---

### Writing Tools (Structured Rewriting API)
**What it is:** System-wide text transformation that can rewrite, summarize, proofread, and adjust tone for any selected text in any app.
**How it works:** A small on-device model does fast rewrites; the cloud model handles complex transformations. The result is a diff that the user can accept or reject — the original is always preserved. Apple exposes this via the `WritingToolsCoordinator` API so third-party apps can hook into the same pipeline.
**Ecosystem use:** Pattern for the Corrections view and prompt evolution. When an agent output is wrong, the user submits a correction — we should store both the original and the correction as a diff (not just the correction), so the Evaluation Loop can learn exactly what changed and why.
**Where to find it:** WWDC 2025 "Add Writing Tools to your app" | developer.apple.com/documentation/uikit/uiwritingtoolscoordinator
**Perplexity Query:** `Apple Writing Tools API WritingToolsCoordinator integration 2025`

---

## Amazon / AWS

> **Why study AWS:** The most mature production AI agent infrastructure on the planet. Bedrock Agents, Knowledge Bases, and Guardrails are direct analogs of what we're building — study them as the reference implementation.

---

### Amazon Bedrock Agents
**What it is:** Fully managed multi-agent orchestration service. You define agents with actions, knowledge bases, and guardrails; Bedrock handles the reasoning loop, tool calling, session state, and model selection.
**How it works:** An agent is defined by a system prompt, a set of Action Groups (Lambda functions the agent can call), and optional Knowledge Base connections. When a task arrives, Bedrock runs a ReAct-style loop: reason pick action call Lambda observe result reason again until done or token budget exhausted. Session state persists in DynamoDB. Multi-agent mode adds a supervisor agent that routes sub-tasks to specialist agents.
**Ecosystem use:** The Action Group pattern maps directly to the tool calling loop we need to build in `agent_server._execute()`. The supervisor + specialist routing is the Planner layer. Study the Bedrock Agents API request/response schema for how Amazon structures tool call inputs and outputs.
**Where to find it:** docs.aws.amazon.com/bedrock/latest/userguide/agents.html | AWS re:Invent 2024 "Agentic AI on Amazon Bedrock"
**Perplexity Query:** `Amazon Bedrock Agents architecture Action Groups multi-agent orchestration 2024`

---

### Amazon Bedrock Knowledge Bases
**What it is:** Managed RAG pipeline. Ingest documents (S3, Confluence, SharePoint, web crawl) automatic chunking + embedding vector store retrieval API.
**How it works:** You point a Knowledge Base at a data source; Bedrock handles chunking strategy (fixed, hierarchical, semantic), embedding model selection (Titan, Cohere), and vector store provisioning (OpenSearch, Pinecone, pgvector). At query time it does hybrid search (vector + keyword) and optional reranking before returning chunks. Supports metadata filtering so you can restrict retrieval to specific doc types or date ranges.
**Ecosystem use:** Our RAG pipeline (Task 22) replicates this. Study Bedrock's chunking strategies — especially hierarchical chunking (parent chunk for context, child chunk for precision) — and apply to the ChromaDB setup. The metadata filtering pattern should be added to our collection queries.
**Where to find it:** docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html
**Perplexity Query:** `Amazon Bedrock Knowledge Bases hierarchical chunking hybrid search RAG architecture`

---

### Amazon Bedrock Guardrails
**What it is:** Content safety layer that sits between the user and any Bedrock model. Blocks harmful topics, redacts PII, detects prompt injection, enforces topic restrictions, and filters hallucinated citations.
**How it works:** Guardrails are configured as a policy with multiple independent detectors (topic policy, content filter, word filter, PII redactor, grounding check, prompt attack detector). Each incoming prompt and each outgoing response passes through the full policy stack. Blocked content returns a configurable fallback message. The grounding check compares model responses to retrieved RAG chunks and flags responses that make claims not supported by source material.
**Ecosystem use:** Direct blueprint for our Security Layer (Task 85–91). The "prompt attack detector" is the production version of our `sanitize_external_content()`. The grounding check is the output validation step. The PII redactor is our secret redaction layer. Study the Guardrails API for how to structure these as a middleware pipeline rather than ad-hoc regex checks.
**Where to find it:** docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html | AWS blog "Detect and block prompt attacks with Amazon Bedrock Guardrails"
**Perplexity Query:** `Amazon Bedrock Guardrails prompt injection detection grounding check PII redaction`

---

### AWS Step Functions
**What it is:** Serverless visual workflow orchestrator. Define multi-step pipelines as state machines in JSON/YAML; Step Functions handles retry, error catching, parallel branching, and execution history.
**How it works:** Each state in the machine is a task (Lambda, ECS, Bedrock, etc.), choice (conditional branching), parallel (fan-out), or wait. Transitions are defined as JSON with input/output filtering between states. The execution history is queryable and visualizable. Supports Express Workflows (short, high-volume) and Standard Workflows (long-running, exactly-once).
**Ecosystem use:** The architecture our DAG executor (`orchestrator/dag/`) should eventually look like. Study the state machine JSON schema for pipeline definitions — it's more battle-tested than our YAML spec. The input/output filtering between states (ResultSelector, ResultPath, OutputPath) is missing from our current pipeline model.
**Where to find it:** docs.aws.amazon.com/step-functions/ | AWS Step Functions developer guide
**Perplexity Query:** `AWS Step Functions state machine JSON schema input output filtering parallel execution`

---

### AWS Secrets Manager
**What it is:** Managed secret store with automatic rotation, versioning, cross-account access, and fine-grained IAM permissions.
**How it works:** Secrets are stored encrypted with KMS. Each secret has a version history. Access is via IAM policies — you grant a specific Lambda/ECS role read access to a specific secret ARN. Rotation is automated via Lambda rotation functions. The application never sees the actual key — it requests the secret by ARN and gets the current version.
**Ecosystem use:** The production architecture for Task 88 (Secret Isolation). Our current approach (`.env` file) is fine for solo dev but the architecture should be designed so credentials can be moved to a managed store. The "grant specific service access to specific secret" IAM model maps to our Agent Contracts (researcher gets BRAVE_API_KEY, coder gets GITHUB_TOKEN, etc.).
**Where to find it:** docs.aws.amazon.com/secretsmanager/
**Perplexity Query:** `AWS Secrets Manager automatic rotation application integration best practices`

---

### Amazon SQS (Simple Queue Service)
**What it is:** Managed message queue with guaranteed delivery, visibility timeout, dead letter queue, and FIFO ordering.
**How it works:** Producers push messages; consumers poll and process. Each message has a visibility timeout — if the consumer doesn't delete it within the timeout, it becomes visible again for another consumer. Messages that fail N times automatically move to a Dead Letter Queue. FIFO queues guarantee exactly-once delivery and strict ordering within a message group.
**Ecosystem use:** Our in-memory `PriorityTaskQueue` and `DeadLetterQueue` should eventually be backed by SQS (or a local equivalent like Redis Streams) for persistence across restarts. The visibility timeout pattern should be adopted — when a task is "running", make it invisible to other workers for `timeout_s` seconds so two workers don't pick the same task.
**Where to find it:** docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/
**Perplexity Query:** `Amazon SQS FIFO queue dead letter queue visibility timeout architecture patterns`

---

### Amazon CloudWatch (Metrics, Logs, Alarms)
**What it is:** Full-stack observability platform — structured logs, time-series metrics, distributed traces (via X-Ray), and threshold-based alarms with automated remediation.
**How it works:** Applications emit metrics and structured log events via the CloudWatch SDK. Logs Insights lets you run SQL-like queries across petabytes of structured logs in seconds. CloudWatch Synthetics runs canary scripts to simulate user traffic and detect silent failures. Alarms trigger SNS notifications or automatic remediation actions (restart, scale, rollback) when metrics breach thresholds.
**Ecosystem use:** Our Observability layer (structured JSONL events, per-agent metrics, circuit breaker state) should expose a Prometheus-compatible `/metrics` endpoint. Study CloudWatch's metric math for computing derived metrics (success rate, p99 latency, cost per task) from raw counters.
**Where to find it:** docs.aws.amazon.com/cloudwatch/ | AWS Observability best practices guide
**Perplexity Query:** `Amazon CloudWatch structured logging metrics alarms architecture best practices`

---

### AWS Lambda + Event-Driven Architecture
**What it is:** Serverless compute where functions are triggered by events (HTTP, queue message, S3 upload, scheduled). Pay per invocation.
**How it works:** A Lambda function runs a handler with a fixed memory and timeout. Event sources (API Gateway, SQS, EventBridge, S3) trigger executions. EventBridge provides a central event bus where services publish events and other services subscribe with filter rules. This decouples producers from consumers completely.
**Ecosystem use:** The event-driven pattern from EventBridge is the production version of our `emit_event()` dashboard sync flow. Instead of the orchestrator directly calling the dashboard HTTP API, it should emit structured events to a local event bus; the dashboard, Discord bot, Obsidian writer, and RAG pipeline all subscribe independently. This eliminates the tight coupling between orchestrator and dashboard.
**Where to find it:** docs.aws.amazon.com/lambda/ | docs.aws.amazon.com/eventbridge/
**Perplexity Query:** `AWS EventBridge event-driven architecture decoupling microservices patterns`

---

## OpenAI Platform

> **Why study OpenAI:** The most-used AI API. Their Threads/Runs model, Structured Outputs, and Batch API solve real production problems we'll hit. Their mistakes (deprecated Assistants API Response API) also teach what not to build.

---

### Structured Outputs (JSON Schema Enforcement)
**What it is:** Guaranteed JSON output from any model, conforming exactly to a provided JSON schema. Zero parsing errors, no hallucinated field names.
**How it works:** You pass a `response_format` object containing a JSON Schema. OpenAI's constrained decoding ensures every token generated is valid within the schema. The model cannot produce a response that violates the schema — it's enforced at the token sampling level, not via post-processing. Supports nested objects, enums, arrays, required fields, and recursive schemas.
**Ecosystem use:** Critical for the Planner layer. Instead of asking the orchestrator LLM to "decompose the task" and hoping it returns parseable JSON, use structured outputs to guarantee the plan schema. Also essential for agent contracts — agent outputs should be validated against schemas, not parsed from free text. The Anthropic API has the same feature (`tool_use` or `json_mode`).
**Where to find it:** platform.openai.com/docs/guides/structured-outputs | OpenAI Cookbook examples
**Perplexity Query:** `OpenAI Structured Outputs JSON schema enforcement constrained decoding how it works`

---

### Batch API (Async Bulk Inference)
**What it is:** Submit up to 50,000 requests as a JSONL file, get results back within 24 hours at 50% off standard pricing.
**How it works:** You upload a `.jsonl` file where each line is a complete API request with a custom ID. OpenAI processes the batch asynchronously (using off-peak compute), then uploads a results file you can download. Each result is keyed by your custom ID. Useful for embedding large document sets, running evals across many test cases, or any non-latency-sensitive workload.
**Ecosystem use:** RAG pipeline's vault scanning and code indexing. Instead of embedding Obsidian notes one at a time (current approach), batch them into a single async job and get results back at half cost. Also useful for the Evaluation Loop (Task 89) — run the LLM-as-judge across all historical tasks overnight.
**Where to find it:** platform.openai.com/docs/guides/batch
**Perplexity Query:** `OpenAI Batch API JSONL async inference 50% discount embedding use cases`

---

### Threads and Runs API (Stateful Conversations)
**What it is:** Persistent conversation state stored server-side. A Thread is an ongoing conversation; a Run is a single execution step within that thread.
**How it works:** You create a Thread once and add Messages to it. A Run executes the model on the current thread state and handles tool calls in a `requires_action` pause where your code executes the tool and submits results back. The full conversation history is stored by OpenAI and retrieved at Run time — you don't manage context window yourself. Multiple Runs can execute sequentially in the same Thread.
**Ecosystem use:** Blueprint for persistent agent session state. Our current system loses agent "memory" between tasks. The Thread model should inform how we structure the Memory Agent — each ongoing project gets a Thread-equivalent stored in Obsidian + RAG, and each new task in that project picks up from the last Message in that Thread.
**Where to find it:** platform.openai.com/docs/api-reference/threads
**Perplexity Query:** `OpenAI Threads Runs API stateful agent conversation persistent context`

---

### Code Interpreter (Sandboxed Execution)
**What it is:** A sandboxed Python runtime that LLMs can write and execute code in, with file upload/download support.
**How it works:** The model generates Python code. The code runs in an isolated container with numpy, pandas, matplotlib, and other data science libraries pre-installed. Results (stdout, stderr, generated files, plots) are fed back to the model as tool call results. The container is ephemeral — it resets between sessions. File inputs can be uploaded; outputs can be downloaded.
**Ecosystem use:** The exact architecture for Task 30 (Code Sandbox). Our coder agent needs this — not direct `bash` on the host machine, but code that runs in an ephemeral container. The OpenAI implementation shows that the container needs: Python + common libraries, file I/O to the conversation, stdout/stderr capture, and a timeout. E2B (see Infrastructure section) provides this as a standalone service.
**Where to find it:** platform.openai.com/docs/assistants/tools/code-interpreter
**Perplexity Query:** `OpenAI Code Interpreter sandboxed execution architecture container ephemeral`

---

### Response API with Built-in Tools (Web Search, File Search)
**What it is:** Stateless inference API with optional built-in tools — web search, file/vector search, and computer use — managed by OpenAI.
**How it works:** You pass a `tools` array to the API; the model decides when to call each tool. For web search, OpenAI runs the search internally using Bing and injects results. For file search, OpenAI queries a Vector Store you've pre-populated. The model cites sources in its response. This replaces the older Assistants API for most use cases.
**Ecosystem use:** The built-in web search tool is the research agent's target architecture — instead of the research agent making raw HTTP calls to a search API, the model calls the tool natively in a reasoning loop. Study the citation format (how OpenAI returns source references alongside the response text) for implementing source tracking in our Research Layer.
**Where to find it:** platform.openai.com/docs/api-reference/responses
**Perplexity Query:** `OpenAI Response API built-in tools web search file search 2025`

---

### Realtime API (Streaming Multi-Modal)
**What it is:** Low-latency WebSocket API for streaming voice and text in real-time, enabling sub-200ms voice-to-voice interactions.
**How it works:** A persistent WebSocket connection accepts audio chunks in real-time. The server-side VAD detects when the user stops speaking, transcribes, runs inference, and streams the audio response back — all within the same connection. Supports function calling mid-conversation (e.g., user says "what's the weather?" model calls a tool speaks the result). Text modality also available for streaming text-in/text-out.
**Ecosystem use:** Architecture for Task 28 (Voice Interface). Our Telegram voice Whisper task ElevenLabs pipeline can be replaced with the Realtime API for much lower latency and native tool calling in the audio loop. Also informs the WebSocket architecture between dashboard and orchestrator.
**Where to find it:** platform.openai.com/docs/guides/realtime
**Perplexity Query:** `OpenAI Realtime API WebSocket voice streaming architecture function calling latency`

---

## Google / DeepMind

> **Why study Google:** Agent2Agent (inter-agent standard), Vertex AI grounding, and Gemini's 1M context window solve problems we'll hit in the next phases. Google's approach to multi-agent communication is the most open and interoperable.

---

### Agent2Agent Protocol (A2A)
**What it is:** Open inter-agent communication standard proposed by Google. Lets agents built on different frameworks (LangGraph, CrewAI, Bedrock, custom) communicate with a standard message format.
**How it works:** Each agent exposes an "Agent Card" (a JSON manifest describing capabilities, input/output schemas, and endpoints). Agents discover each other via Agent Cards and communicate via a standard HTTP or gRPC protocol with typed task requests and streaming responses. The task state machine (submitted working completed/failed) is standardized so any agent can be a client or server.
**Ecosystem use:** Directly relevant to the HTTP Agent Mesh. Our agent servers currently have ad-hoc schemas (TaskRequest, TaskResult). A2A provides a battle-tested standard for these schemas. Adopting A2A would make our agents interoperable with external tools and frameworks without custom integration.
**Where to find it:** github.com/google-deepmind/agent2agent | Google Cloud blog "Introducing the Agent2Agent protocol"
**Perplexity Query:** `Google Agent2Agent protocol A2A inter-agent communication standard specification 2025`

---

### Vertex AI Grounding with Google Search
**What it is:** Real-time Google Search integration for Gemini models. The model retrieves current web results before answering, with citations to source URLs.
**How it works:** When grounding is enabled, Vertex AI automatically decides when to issue a Google Search query based on the question. Results are retrieved (not full pages — snippets and metadata), injected into the model's context with source attribution, and the model cites them in its response. The grounding check API validates that model claims are supported by the retrieved sources.
**Ecosystem use:** Production version of the Research Agent's web search flow. Instead of the research agent calling a search API and manually injecting results, Grounding handles retrieval, context injection, and citation automatically. The grounding check (does the response match the sources?) is the production version of our planned output validation.
**Where to find it:** cloud.google.com/vertex-ai/docs/generative-ai/grounding/overview
**Perplexity Query:** `Vertex AI Grounding Google Search Gemini citation grounding check architecture`

---

### Gemini Long Context (1M Token Window)
**What it is:** Gemini 1.5 Pro and 2.0 Pro support context windows up to 1 million tokens — equivalent to ~750,000 words or the full codebase of a large project.
**How it works:** The long context is handled via a modified attention mechanism that scales sub-quadratically. Retrieval happens at inference time — you can pass the entire codebase or document set in a single prompt. The model uses its native attention to find relevant sections rather than a separate retrieval step. Effective for tasks where RAG retrieval is lossy (e.g., cross-file code analysis, full-document contract review).
**Ecosystem use:** For the Code Agent — instead of chunking and embedding the entire Ecosystem codebase and querying RAG, pass the relevant files directly in a long-context prompt for code review or architecture tasks. Reduces retrieval errors at the cost of higher token spend.
**Where to find it:** deepmind.google/technologies/gemini/ | Google Cloud Vertex AI API docs
**Perplexity Query:** `Gemini 1.5 Pro long context 1M tokens use cases code analysis limitations`

---

### Vertex AI Reasoning Engine
**What it is:** Managed serverless runtime for deploying Python-based LLM agents. Handles execution, scaling, session management, and tracing automatically.
**How it works:** You define an agent class with a `query()` method in Python. Reasoning Engine packages it with dependencies and deploys it as a managed endpoint. It integrates with LangChain, LangGraph, LlamaIndex, and AG2 (AutoGen) out of the box. Each session gets isolated state. Execution traces are captured and viewable in Vertex AI Studio.
**Ecosystem use:** Target architecture for deploying the HTTP agent mesh to a managed cloud environment (Phase 7 remote access). The session isolation model maps to our per-task trace IDs. The managed tracing replaces our manual JSONL event logging.
**Where to find it:** cloud.google.com/vertex-ai/docs/reasoning-engine/overview
**Perplexity Query:** `Vertex AI Reasoning Engine managed agent deployment LangChain session state tracing`

---

### NotebookLM (Knowledge Synthesis from Sources)
**What it is:** AI research tool that creates a "personal expert" from your uploaded sources — PDFs, URLs, YouTube videos, Google Docs. Generates summaries, Q&A, and audio overviews from only your sources.
**How it works:** Sources are chunked, embedded, and stored in a private per-notebook vector store. All answers are grounded exclusively in the provided sources and cite specific passages. The model will explicitly say "this is not in your sources" rather than hallucinate. Audio Overview generates a 10-20 minute podcast-style discussion of the source material.
**Ecosystem use:** Pattern for how our Memory Agent should work. The "answers grounded only in vault sources" + "explicit citation of which note the fact came from" + "refuses to answer from parametric knowledge alone" is the correct behavior for a memory agent querying the Obsidian vault. Also study the chunking strategy — NotebookLM uses a combination of semantic and structural chunking that preserves document hierarchy.
**Where to find it:** notebooklm.google.com | Google I/O 2024 NotebookLM session
**Perplexity Query:** `NotebookLM architecture how it works source grounding vector store chunking strategy`

---

### Google Cloud Pub/Sub
**What it is:** Managed async messaging service. Publishers push messages; subscribers receive them independently, at their own pace, with at-least-once delivery guarantees.
**How it works:** Topics decouple producers from consumers. Any number of subscribers can independently consume from a topic. Messages are replicated and retained for up to 7 days. Push subscriptions send messages to an HTTP endpoint (webhook); pull subscriptions let consumers poll at their own rate. Dead letter topics capture messages that fail delivery after N attempts.
**Ecosystem use:** Production version of the event-driven architecture pattern from AWS EventBridge. Apply to the orchestrator dashboard, Discord bot, RAG pipeline, Obsidian writer decoupling. Every task state change publishes to a topic; each subscriber processes it independently without coupling.
**Where to find it:** cloud.google.com/pubsub/docs
**Perplexity Query:** `Google Cloud Pub/Sub architecture pub/sub vs message queue use cases`

---

### Gemini Function Calling
**What it is:** Gemini's tool use API — define functions with JSON Schema, and the model decides when to call them, extracting typed arguments.
**How it works:** You pass a `tools` array of function definitions (name, description, JSON Schema parameters). The model returns either a text response or a `function_call` with extracted arguments. Your code executes the function and passes the result back. The loop continues until the model returns a final text response. Supports `ANY` mode (always call a function) for forced structured extraction.
**Ecosystem use:** The `ANY` mode is valuable for the Planner — force the orchestrator to always return a structured JSON plan (as a function call) rather than free text, guaranteeing the plan is machine-parseable. Also study how Google structures multi-tool parallel function calls (multiple tools called simultaneously in one model turn).
**Where to find it:** cloud.google.com/vertex-ai/docs/generative-ai/multimodal/function-calling
**Perplexity Query:** `Gemini function calling parallel tool calls ANY mode structured extraction`

---

## Microsoft / Azure

> **Why study Microsoft:** Semantic Kernel is the most mature open-source orchestration framework. AutoGen is the most studied multi-agent pattern. Azure Content Safety is the production reference for our security layer.

---

### Semantic Kernel (Open Source Orchestration SDK)
**What it is:** Microsoft's open-source SDK for building LLM-powered applications with plugins, planners, and memory. Works with OpenAI, Azure OpenAI, Anthropic, Hugging Face.
**How it works:** Plugins are collections of functions with semantic descriptions. The Planner takes a goal, reasons about which plugins to call and in what order, and creates an execution plan. The Kernel executes the plan, managing context between steps. Memory abstractions support vector stores (Chroma, Pinecone, Azure AI Search). Supports function calling natively across all supported models.
**Ecosystem use:** Study Semantic Kernel's planner implementations — especially the `FunctionCallingStepwisePlanner` which mirrors the ReAct loop we need. The plugin schema (function name, description, input/output types) maps directly to our Agent Contracts and tool definitions. The project is open source — the source code is the best documentation.
**Where to find it:** github.com/microsoft/semantic-kernel | learn.microsoft.com/semantic-kernel
**Perplexity Query:** `Semantic Kernel FunctionCallingStepwisePlanner plugin architecture ReAct loop`

---

### AutoGen (Multi-Agent Conversation Framework)
**What it is:** Microsoft Research's framework for multi-agent conversations where agents exchange messages to collaboratively solve tasks.
**How it works:** Agents are defined with a system prompt, a list of tools, and a reply function. A conversation is initiated between a UserProxy (represents the human) and one or more AssistantAgents. Agents communicate by sending messages to each other; the GroupChatManager routes messages in multi-agent scenarios. Human input can be requested at any point. All conversation history is logged.
**Ecosystem use:** The two-agent loop (UserProxy AssistantAgent with code execution) is the pattern for our Coder + Reviewer pair. The `ConversableAgent` base class with customizable reply functions maps to our agent_server architecture. Study the GroupChat routing strategies for when to use sequential vs. round-robin vs. selector routing.
**Where to find it:** github.com/microsoft/autogen | microsoft.github.io/autogen
**Perplexity Query:** `AutoGen AG2 multi-agent GroupChat conversation patterns code execution 2025`

---

### Azure AI Content Safety
**What it is:** Managed API for detecting harmful content — hate speech, self-harm, sexual content, violence, prompt injection, and protected material — in both inputs and outputs.
**How it works:** You submit text (or image) to the Content Safety API and get back severity scores (0–7) across 8 harm categories. A separate `ShieldPrompt` endpoint specifically detects prompt injection and jailbreak attempts with high sensitivity. Results are returned in <100ms and can be used as a middleware gate before/after any LLM call. Custom categories let you add domain-specific rules.
**Ecosystem use:** Production reference implementation for Task 85 (Prompt Injection Sanitizer) and the broader security layer. The `ShieldPrompt` API is exactly what we're building — call it before passing any external content to an agent. The severity scoring (0–7) maps to our trust level concept (high severity UNKNOWN, medium EXTERNAL with warnings, low EXTERNAL).
**Where to find it:** learn.microsoft.com/azure/ai-services/content-safety/
**Perplexity Query:** `Azure Content Safety ShieldPrompt prompt injection detection API severity scoring`

---

### Azure AI Search (Hybrid Vector + Keyword Search)
**What it is:** Managed search service combining traditional keyword search (BM25) with vector similarity search, with optional semantic reranking.
**How it works:** Documents are indexed with both keyword inverted indexes and vector embeddings (using your choice of embedding model). At query time, keyword and vector searches run in parallel; results are fused using Reciprocal Rank Fusion (RRF). A semantic reranker (a cross-encoder ML model) then reorders the top-N fused results by relevance. Supports filtering, faceting, and highlighting.
**Ecosystem use:** The hybrid search approach (keyword + vector + reranker) should be adopted in our ChromaDB setup. Currently we only do vector search. Adding BM25 keyword search as a parallel path and fusing results with RRF significantly improves retrieval accuracy, especially for specific named entities (task IDs, agent names, error codes) that pure vector search handles poorly.
**Where to find it:** learn.microsoft.com/azure/search/ | Microsoft paper "Improving RAG with Hybrid Search"
**Perplexity Query:** `Azure AI Search hybrid search BM25 vector RRF Reciprocal Rank Fusion semantic reranker`

---

### Azure Key Vault
**What it is:** Managed secret, key, and certificate store with hardware security module (HSM) backing, access policies, and full audit logging.
**How it works:** Secrets are stored encrypted with keys backed by FIPS 140-2 Level 2 HSMs. Access is controlled by Azure AD identities — a service gets a managed identity and a Key Vault policy grants that identity `get` permission on specific secrets. No human can see the secret value unless they have an authorized identity. All access (read, write, admin) is logged to Azure Monitor.
**Ecosystem use:** The production architecture for Task 88 (Secret Isolation). The "managed identity" pattern — where a service proves its identity cryptographically and receives a secret without any human ever seeing it — is the correct long-term model for how agents access credentials. Compare to AWS Secrets Manager; both solve the same problem with slightly different IAM models.
**Where to find it:** learn.microsoft.com/azure/key-vault/
**Perplexity Query:** `Azure Key Vault managed identity access policy credential rotation Python SDK`

---

### Phi-3 / Phi-4 (Small Language Models)
**What it is:** Microsoft's family of small (3.8B–14B parameter) but highly capable language models, optimized for reasoning tasks despite small size.
**How it works:** Trained on carefully curated "textbook quality" synthetic data rather than raw internet text. The Phi-4 14B model achieves near-GPT-4 performance on reasoning benchmarks despite being 10x smaller. Models can run on consumer GPUs (8GB VRAM for Phi-3-mini). Available via Hugging Face, Azure AI, and Ollama.
**Ecosystem use:** Candidate model for Task 32 (Local LLM Fallback). Phi-3-mini or Phi-4-mini via Ollama for near-zero cost on simple tasks (memory writes, formatting, classification) that don't need Haiku. Test Phi-4 on memory agent tasks — it may perform adequately while costing $0 per call.
**Where to find it:** huggingface.co/microsoft/Phi-4 | ollama.ai (phi3, phi4 models)
**Perplexity Query:** `Microsoft Phi-4 model benchmark performance Ollama local deployment reasoning`

---

### GitHub Copilot Workspace (Agentic Coding)
**What it is:** GitHub's agentic coding environment where the AI plans, writes, and iterates on code across multiple files in response to a task description.
**How it works:** Given a task (e.g., "Fix this bug" or "Implement this feature"), Copilot Workspace creates a plan showing which files will be changed and how. The user reviews the plan before the AI writes any code. Code is generated file by file. The user can iterate on the plan or individual file changes. All edits are applied to a new branch. The AI can run tests and fix failures automatically.
**Ecosystem use:** Blueprint for the Coder Agent's UX and the plan-before-code workflow. The "show the plan, wait for approval, then generate" pattern maps directly to our Approval Gates (Task 21) applied to code tasks. The "AI runs tests and fixes failures" loop is the tester + coder agent interaction pattern.
**Where to find it:** githubnext.com/projects/copilot-workspace | GitHub Blog "Copilot Workspace"
**Perplexity Query:** `GitHub Copilot Workspace agentic coding plan iterate test fix architecture`

---

## Meta / Open Source

---

### Llama 3.1 / 3.2 / 3.3 (Open Weight Models)
**What it is:** Meta's open-weight LLM family. Llama 3.1 70B competes with GPT-4; Llama 3.2 3B runs on a phone. Fully open — can be run locally, fine-tuned, and deployed with no API costs.
**How it works:** Weights are downloadable from Meta's website (license required). Run locally via Ollama, llama.cpp, or vLLM. Ollama makes setup trivial — one command to pull and serve any Llama variant. Tool calling is supported in Llama 3.1+ via a standard format. Context window is 128K tokens.
**Ecosystem use:** Task 32 (Local LLM Fallback). Use Llama 3.2 3B via Ollama for background/simple tasks (text classification, memory formatting, research digest) at zero API cost. Reserve Haiku for medium tasks, Sonnet for complex. The 70B model can replace Sonnet for many coder/architect tasks at the cost of higher local hardware.
**Where to find it:** llama.meta.com | ollama.ai | huggingface.co/meta-llama
**Perplexity Query:** `Llama 3.3 70B Ollama local deployment tool calling performance benchmark 2025`

---

### FAISS (Facebook AI Similarity Search)
**What it is:** Meta's open source library for efficient similarity search over dense vectors. Powers production RAG systems at Meta scale.
**How it works:** FAISS builds specialized index structures (IVF, HNSW, PQ) that allow approximate nearest-neighbor search over millions of vectors in milliseconds. An IVF index partitions the vector space into clusters and searches only the nearest clusters — trading a small accuracy loss for 100x speedup. GPU acceleration available. Flat (exact) index available for small collections.
**Ecosystem use:** Alternative to ChromaDB for the RAG vector store. FAISS is significantly faster than ChromaDB at scale, but has no built-in metadata filtering or collection management — you handle those yourself. Worth benchmarking against ChromaDB once the vault reaches >100K chunks. The HNSW index in FAISS is the same algorithm used internally by pgvector and Weaviate.
**Where to find it:** github.com/facebookresearch/faiss | engineering.fb.com/2017/03/29/data-infrastructure/faiss-a-library-for-efficient-similarity-search/
**Perplexity Query:** `FAISS vs ChromaDB performance comparison IVF HNSW index RAG production`

---

### React Flow (Node Graph Visualization)
**What it is:** JavaScript library for building interactive node-based graph UIs — flowcharts, data flow diagrams, workflow builders, dependency graphs.
**How it works:** You define nodes and edges as React components. Built-in behaviors: drag-to-connect, zoom/pan, minimap, selection, undo/redo. Custom node and edge types let you render any content inside graph nodes. Supports dagre and ELK layout algorithms for automatic arrangement. The graph state is a simple JS object — easy to serialize/restore.
**Ecosystem use:** Dashboard's Pipeline DAG visualizer (currently hand-coded SVG). Replace with React Flow for interactive pipeline visualization — click a stage to see its tasks, drag to reroute connections, live-color-code nodes by status (running/complete/failed). The node-as-component model lets each pipeline stage node show token count, duration, and cost inline.
**Where to find it:** reactflow.dev | github.com/xyflow/xyflow
**Perplexity Query:** `React Flow interactive DAG visualization dynamic status nodes examples`

---

## AI Infrastructure Tools

> **Why these matter:** These are the specialized SaaS tools that solve hard production problems (code sandboxing, LLM observability, web search, evaluation) better than any DIY approach. Each replaces weeks of engineering with a 5-line SDK call.

---

### E2B Code Interpreter (Sandboxed Code Execution as a Service)
**What it is:** Cloud-hosted sandboxed Python/JavaScript execution environments for LLM agents. Start a fresh sandbox in <200ms, execute code, get stdout/stderr/files back.
**How it works:** E2B runs Firecracker microVMs — ultra-lightweight VMs that boot in milliseconds and are fully isolated. Your agent writes Python code; you send it to E2B's API; it runs in the VM and returns stdout, stderr, and any generated files. The sandbox has internet access (configurable), a filesystem, and common Python packages pre-installed. Each sandbox is ephemeral — destroyed after the session.
**Ecosystem use:** The correct implementation for Task 30 (Code Sandbox). Instead of building Docker isolation ourselves, use E2B. The coder agent sends generated code to E2B, gets results back, and the model continues the loop. Cost is ~$0.002/hour per sandbox. Integration is a single Python SDK call.
**Where to find it:** e2b.dev | github.com/e2b-dev/e2b | e2b.dev/docs
**Perplexity Query:** `E2B code interpreter sandbox LLM agent Python integration pricing Firecracker`

---

### Tavily Search API (AI-Optimized Web Search)
**What it is:** Web search API specifically designed for LLM agents — returns structured, cleaned, relevant results rather than raw HTML.
**How it works:** Tavily's search engine crawls and indexes the web with LLM consumption in mind. Results include the page title, URL, cleaned text content (no navigation/ads), and a relevance score. A `search_depth=advanced` mode does additional processing to extract the most relevant paragraphs. Responses are JSON — no HTML parsing required. Rate: 1000 free searches/month, then $0.01/search.
**Ecosystem use:** Drop-in replacement for any raw Google/Bing search API call in the Research Agent. The cleaned JSON output eliminates the web-scraping step. The relevance scoring lets the agent skip low-quality results without a model call. Much better than scraping raw web pages which triggers bot detection and returns navigation garbage.
**Where to find it:** tavily.com | docs.tavily.com | github.com/tavily-ai/tavily-python
**Perplexity Query:** `Tavily search API LLM agent integration vs SerpAPI vs Brave pricing comparison`

---

### LangSmith (LLM Observability and Evaluation)
**What it is:** LangChain's hosted platform for tracing, debugging, and evaluating LLM applications. Every prompt, tool call, and response captured and queryable.
**How it works:** Instrument your code with the LangSmith SDK (one-line setup). Every LLM call creates a "Run" with full input/output, model, latency, tokens, cost, and trace hierarchy. You can replay runs, compare prompt versions side-by-side, annotate outputs with quality scores, and define evaluators (human or LLM-as-judge) that run automatically on new runs. Integrates with LangChain, but also works standalone via the `langsmith` Python SDK.
**Ecosystem use:** Production version of our distributed tracing + evaluation loop (Tasks 89–90). The `trace` decorator wraps any Python function — no LangChain required. Use it to instrument `agent_server._execute()` and get immediate visibility into every agent call with full context, token counts, and cost — replacing our manual JSONL event logging with a queryable UI.
**Where to find it:** smith.langchain.com | docs.smith.langchain.com
**Perplexity Query:** `LangSmith tracing LLM evaluation without LangChain standalone SDK setup`

---

### Langfuse (Open Source LLM Observability)
**What it is:** Open source alternative to LangSmith. Full observability platform — traces, evals, prompt management, datasets, metrics — self-hostable on Docker.
**How it works:** A Python/TypeScript SDK wraps LLM calls with `@observe` decorators or context managers. Every call is sent to the Langfuse server (cloud or self-hosted) with full metadata. The UI shows trace trees, token usage over time, cost by model, latency histograms, and evaluation scores. Prompt management version-controls prompts and A/B tests them with real traffic.
**Ecosystem use:** Preferred over LangSmith for our use case because it's self-hostable (no data leaving the machine), open source, and includes prompt versioning (Task 90) and evaluation (Task 89) in one tool. Deploy on the same machine as the ecosystem. The prompt management feature is exactly Task 90 — version-controlled prompts with rollback.
**Where to find it:** langfuse.com | github.com/langfuse/langfuse | cloud.langfuse.com
**Perplexity Query:** `Langfuse self-hosted LLM observability prompt versioning evaluation setup Docker`

---

### Weights & Biases Weave (LLM Evaluation and Tracking)
**What it is:** W&B's LLM evaluation framework built on top of their experiment tracking platform. Evaluates agent outputs at scale with LLM-as-judge and human annotations.
**How it works:** Define a dataset of (input, expected_output) pairs. Define scorers (LLM-as-judge with a rubric, regex match, embedding similarity, etc.). Run `weave.Evaluation` on any function — it runs all inputs, collects outputs, applies all scorers, and reports aggregate scores. Results are versioned and comparable across runs. Integrates with W&B's experiment tracking for correlating eval scores with model/prompt changes.
**Ecosystem use:** The evaluation framework for Task 89 (Evaluation + Feedback Loop). Build a gold-standard dataset of (task, expected_agent_output) pairs from historical corrections. Run nightly evaluations comparing the current agent prompts against the baseline. Track quality regression automatically.
**Where to find it:** wandb.ai/site/weave | github.com/wandb/weave
**Perplexity Query:** `Weights Biases Weave LLM evaluation LLM-as-judge dataset scoring framework`

---

### Pinecone (Managed Vector Database)
**What it is:** Serverless managed vector database. No infrastructure to manage — push vectors, query, done. Scales from 0 to billions of vectors automatically.
**How it works:** You upsert vectors with an ID and optional metadata. Queries return the top-K nearest vectors with cosine or dot product similarity. Serverless tier charges per query (not per hour) — $0 for the first 100K queries/month. Supports namespace isolation (our 9 collections could each be a namespace). Metadata filtering at query time (filter by date, agent, trust_level, etc.).
**Ecosystem use:** Production replacement for ChromaDB if the local setup proves unstable or too slow. The namespace model maps perfectly to our 9 RAG collections. Serverless pricing means zero cost until the vault grows to production scale. The metadata filtering (query only INTERNAL trust chunks, query only last 7 days, etc.) is better developed than ChromaDB's.
**Where to find it:** pinecone.io | docs.pinecone.io
**Perplexity Query:** `Pinecone serverless vector database vs ChromaDB self-hosted comparison namespace metadata filtering`

---

### Qdrant (Open Source High-Performance Vector DB)
**What it is:** Rust-based open source vector database with built-in payload filtering, sparse vectors, and quantization. Self-hostable or cloud-managed.
**How it works:** Collections store vectors with JSON payloads (metadata). At query time, filters on payload fields are applied before or after vector search using a specialized filtering index — not brute force. Supports named vectors (multiple embedding models per document), sparse vectors (for BM25 keyword hybrid), and product quantization (4-8x memory reduction). REST and gRPC APIs.
**Ecosystem use:** Best self-hosted ChromaDB replacement. The built-in sparse vector support makes hybrid search (vector + BM25 keyword) straightforward — exactly the pattern recommended from Azure AI Search analysis. Run as a Docker container alongside the ecosystem. Significantly faster than ChromaDB for filtered queries (trust_level=INTERNAL + date > X + collection = obsidian_notes).
**Where to find it:** qdrant.tech | github.com/qdrant/qdrant | hub.docker.com/r/qdrant/qdrant
**Perplexity Query:** `Qdrant vs ChromaDB performance hybrid search sparse vector Docker self-hosted benchmark`

---

### Modal (Serverless GPU Compute)
**What it is:** Cloud platform for running Python code on GPUs with zero infrastructure setup. Define a function, decorate it with `@modal.function`, get a GPU endpoint.
**How it works:** You write a Python function decorated with `@modal.function(gpu="A10G")`. Modal builds a container image, provisions the GPU, runs your function, and tears it down. Cold start is ~5 seconds. Billing is per-second of GPU use — ~$0.0015/second for an A10G. Supports Ollama, vLLM, any HuggingFace model. The function can be called from anywhere via the Modal client.
**Ecosystem use:** Running local LLMs (Task 32) on-demand without a dedicated GPU machine. Deploy Llama 3.3 70B on Modal — it's available when needed, costs nothing when idle. A research task that benefits from a 70B model calls Modal, gets the result, done. Better than keeping a GPU machine running 24/7 for occasional use.
**Where to find it:** modal.com | modal.com/docs
**Perplexity Query:** `Modal serverless GPU Ollama vLLM deployment Llama cost per second cold start`

---

### Redis (In-Memory Data Store + Pub/Sub + Vector Search)
**What it is:** In-memory key-value store with persistence, pub/sub messaging, task queuing (via Streams), and vector similarity search (via RedisSearch).
**How it works:** Data structures (strings, hashes, lists, sets, sorted sets, streams) are stored in memory with optional persistence to disk. Redis Streams are append-only log structures with consumer groups — ideal for the task queue. Redis Pub/Sub is a fire-and-forget messaging layer (no persistence, but sub-millisecond latency). Redis Stack includes RedisSearch for full-text and vector search over JSON documents.
**Ecosystem use:** Multi-purpose upgrade candidate. Redis Streams replaces the in-memory `PriorityTaskQueue` with persistence across restarts. Redis Pub/Sub replaces the orchestrator dashboard HTTP sync with event-driven broadcasting. RedisSearch adds full-text search to the event log without a separate service. Single Docker container serves all three needs.
**Where to find it:** redis.io | redis.io/docs | hub.docker.com/_/redis
**Perplexity Query:** `Redis Streams task queue consumer group vs SQS self-hosted Python integration`

---

### Jina AI Reader API
**What it is:** URL-to-clean-text API. Submit any URL, get back structured markdown with main content extracted, tables preserved, images captioned.
**How it works:** Prepend `https://r.jina.ai/` to any URL. Jina's headless browser fetches the page, runs content extraction (removes nav, ads, headers, footers), and returns clean markdown. Handles JavaScript-heavy pages, PDFs, and requires no API key for basic use. Optional API key for higher rate limits and additional features (grounding, segmentation). Returns title, URL, content, and optional image descriptions.
**Ecosystem use:** Drop-in for the Research Agent's `web_fetch()` calls. Instead of fetching raw HTML and trying to extract text, call the Jina Reader — the output is already clean markdown ready for the LLM's context. Dramatically reduces prompt injection surface area (extracted content, not raw HTML with script tags). Free tier is generous.
**Where to find it:** jina.ai/reader | r.jina.ai/[any-url]
**Perplexity Query:** `Jina AI Reader API web scraping clean markdown extraction prompt injection surface`

---

## Original Repos

*(From the original file — kept for reference)*

### baryhuang/claude-code-by-agents
**URL:** https://github.com/baryhuang/claude-code-by-agents
**What it is:** Claude Code controlled by sub-agents. Programmatic orchestration of Claude Code as an agent backend.
**Steal for:** Planner pattern, task decomposition structure, auto-evolution (Task 16)

### 0ldh/claude-code-agents-orchestra
**URL:** https://github.com/0ldh/claude-code-agents-orchestra
**What it is:** Conductor + performer agent model for Claude Code.
**Steal for:** DAG parallel execution, skill library structure, supervisor routing

### OpenAPI Specification 3.0.3
**URL:** https://spec.openapis.org/oas/v3.0.3#schema
**Use for:** Designing the orchestrator REST API formally, NL query interface (Task 34)

### MyClaw AI
**URL:** https://myclaw.ai
**What it is:** Legal AI — NL structured action, domain agent UX patterns.
**Steal for:** NL query interface (Task 34), prompt conversion pipeline (Task 17)

---

## Quick Reference — Feature Ecosystem Task Mapping

| Feature | Company | Ecosystem Task |
|---|---|---|
| Bedrock Agents / Action Groups | AWS | Agentic tool-calling loop (critical gap) |
| Bedrock Guardrails / ShieldPrompt | AWS / Azure | Task 85 — Prompt injection sanitizer |
| Bedrock Knowledge Bases | AWS | Task 22 — RAG pipeline (hierarchical chunking) |
| Secrets Manager / Key Vault | AWS / Azure | Task 88 — Secret isolation |
| Step Functions state machine | AWS | DAG executor schema improvement |
| EventBridge / Pub/Sub | AWS / Google | Orchestrator services event decoupling |
| SQS / Redis Streams | AWS / Redis | Persistent priority queue (replace in-memory) |
| Structured Outputs | OpenAI / Google | Planner layer — guaranteed JSON plan schema |
| Threads / Runs API | OpenAI | Memory Agent — persistent project threads |
| Batch API | OpenAI | RAG embedding — cost reduction on bulk indexing |
| Code Interpreter / E2B | OpenAI / E2B | Task 30 — Code sandbox |
| Realtime API | OpenAI | Task 28 — Voice interface |
| Agent2Agent protocol | Google | HTTP agent mesh schema standardization |
| Vertex AI Grounding | Google | Research Agent — citation and output validation |
| Long Context (1M) | Google | Code Agent — full codebase analysis |
| NotebookLM patterns | Google | Memory Agent — source-grounded answers only |
| Semantic Kernel Planner | Microsoft | Planner module implementation reference |
| AutoGen conversation loop | Microsoft | Coder + Reviewer agent pair |
| Content Safety / ShieldPrompt | Azure | Task 85 — Prompt injection in production |
| Azure AI Search (hybrid) | Azure | RAG improvement — BM25 + vector + reranker |
| App Intents / Intent Routing | Apple | Planner — typed intent classification before dispatch |
| Semantic Index patterns | Apple | RAG — continuous background embedding |
| Private Cloud Compute | Apple | Trust boundary model reference |
| Foundation Models (local) | Apple | Task 32 — Local LLM architecture |
| Llama 3.x | Meta | Task 32 — Local LLM (via Ollama) |
| Phi-4 | Microsoft | Task 32 — Local LLM (small, fast) |
| React Flow | Meta/OSS | Dashboard — Pipeline DAG visualizer |
| FAISS | Meta | RAG — Vector store at scale |
| E2B | Startup | Task 30 — Code sandbox (use this first) |
| Tavily | Startup | Research Agent — web search API |
| LangSmith / Langfuse | LangChain / OSS | Tasks 89–90 — Eval loop + prompt versioning |
| W&B Weave | Weights & Biases | Task 89 — Evaluation framework |
| Pinecone / Qdrant | Vector DB SaaS | RAG — ChromaDB replacement candidates |
| Modal | Startup | Task 32 — On-demand GPU for local LLMs |
| Redis | OSS | Queue + pub/sub + search in one service |
| Jina Reader | Startup | Research Agent — clean web content extraction |

---

*Competitor frameworks (LangGraph, CrewAI, AutoGen) are in [Orchestrator Comparison](/notes/orchestrator-comparison)*
*Security architecture references are in Claude Team Review — Full System Audit*
