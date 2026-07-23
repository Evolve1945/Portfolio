> OAuth app credentials for dashboard authentication and coder-agent git operations.

---

## Purpose

GitHub serves two roles in the ecosystem:

1. **Dashboard authentication** — OAuth 2.0 login so the dashboard is not open to anyone on the network. Users authenticate via GitHub and are granted access if their username matches the allowlist in `dashboard/auth.py`.

2. **Coder agent git operations** — the coder agent can commit, branch, and push code changes to the Ecosystem repository as part of task completion. Credentials are stored in the credential vault and never appear in prompts.

---

## Configuration

| Variable | Purpose |
|---|---|
| `GITHUB_CLIENT_ID` | OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | OAuth app client secret |
| `GITHUB_REDIRECT_URI` | Callback URL — must match the app settings in GitHub |
| `GITHUB_ALLOWED_USERS` | Comma-separated GitHub usernames that can log in |

Set in `.env` at the project root. The dashboard reads them via `os.getenv()` at startup.

---

## OAuth Flow

1. User visits dashboard redirected to `https://github.com/login/oauth/authorize`
2. GitHub authenticates user and redirects to `GITHUB_REDIRECT_URI` with a `code`
3. Dashboard exchanges `code` for an access token at `https://github.com/login/oauth/access_token`
4. Dashboard fetches `/user` from the GitHub API to get the username
5. If username is in `GITHUB_ALLOWED_USERS`, a session cookie is issued

---

## What Breaks If Unavailable

- Dashboard login fails — users cannot authenticate. The dashboard becomes inaccessible from the browser.
- Coder agent git operations fail silently — tasks complete but code is not committed.

GitHub OAuth is not required for orchestrator or agent mesh operation — only the dashboard login path depends on it.

---

## Related Nodes

- [Claude-Ecosystem/Components/Interface/Dashboard](/notes/dashboard) — dashboard that uses GitHub auth
- [Anthropic API](/notes/anthropic-api) — primary LLM provider credentials
- Claude-Ecosystem/Components/Security/Credential Manager — where credentials are stored
