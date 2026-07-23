> Automatically keeps the Obsidian vault's `status:` frontmatter fields in sync with the actual codebase — without touching human-written documentation.

---

## What It Does

The vault contains `.md` files with a `status:` field (planned / partial / built). Without automation, these fields drift — a component gets built but its vault entry still says "planned". `vault_sync.py` scans the codebase, checks which components actually exist, and updates the vault accordingly.

It is not a full documentation generator. It only touches `status:` frontmatter fields and appends a brief status summary table. Human-written content is never overwritten.

---

## How It Works

1. Reads the `NODE_REGISTRY` — a list of vault `.md` files paired with their "proof paths" (codebase files that prove the component was built)
2. For each node: checks whether the proof paths exist on disk
 - **All proof paths exist** `status: built`
 - **Some exist** `status: partial`
 - **None exist** `status: planned`
3. Compares derived status to the current frontmatter value; if different, rewrites only the `status:` and `updated:` frontmatter fields — never touching the document body
4. Appends or updates a "Last vault_sync" summary table to `00 - Claude Ecosystem.md`

The scan runs in under a second. It is safe to run repeatedly — idempotent by design.

### Path Resolution

Vault path is resolved in this order:
1. `CLAUDE_VAULT_PATH` environment variable
2. `{script_location}/../../Evolve/Claude-Ecosystem` (relative from project root)
3. `~/Documents/Evolve/Claude-Ecosystem`
4. Hardcoded fallback for the original dev machine

---

## Usage

```
python vault_sync.py # live sync
python vault_sync.py --dry-run # preview changes without writing
python vault_sync.py --status-only # read-only status table, no writes
```

**When to run**: after any session that changes a component from planned to built, or after adding a new component.

---

## Key File

`{ECOSYSTEM_ROOT}/vault_sync.py`

---

## Known Limitation

The `NODE_REGISTRY` is a static list in the script itself. When a new component is added to the codebase, the registry must be updated manually to include the new vault file and its proof paths. If the registry is not updated, the new component's vault file will remain at its old status even after the component is built.

---

## Related Nodes

- [Session to Vault](/notes/session-to-vault) — the companion tool that writes session notes; calls vault_sync automatically
- 00 - Claude Ecosystem — hub file that gets its status table updated
- _AGENT_RULES — constitution governing vault writes
- Components/Core/Environment Configuration — CLAUDE_VAULT_PATH env var
