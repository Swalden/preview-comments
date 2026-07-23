# @preview-comments/github

GitHub adapter for [preview-comments](https://github.com/Swalden/preview-comments). Stores each comment thread as a single issue comment on a PR, so preview feedback lives on the pull request itself — no separate backend.

## Usage

```ts
import { mount } from '@preview-comments/ui'
import { createGitHubAdapter } from '@preview-comments/github'

const adapter = createGitHubAdapter({
  issuesPath: 'my-org/my-repo/issues/123', // the PR number
  getToken: () => localStorage.getItem('preview-comments:github-token'),
})

mount({ adapter, githubClientId: '...', githubCallbackUrl: '...' })
```

The token needs Issues read/write on the repo. When using a GitHub App for OAuth, scope the app to **Issues: Read and write only** and install it on just the target repo — user tokens inherit the installation's permissions, so a widget token should not be able to do anything beyond posting comments.

## Comment format

Each thread is one issue comment:

```
📌 **Preview comment** on `/some/path`

**alice:**
Looks off on mobile

---

**bob:**
Fixed in abc123

<!-- preview-comments:{"anchor":{...},"resolved":false} -->
```

The trailing HTML comment holds machine-readable metadata: the pin anchor and the thread's `resolved` state. Resolving a thread edits the comment in place (it never deletes discussion).

## Blocking merges on unresolved comments

GitHub can't require issue comments to be resolved natively, but the metadata marker makes it easy to gate merges with a required status check — the same pattern Vercel uses for its preview comments check.

Add a workflow that recomputes the status whenever comments change or the PR gets new commits:

```yaml
name: Preview Comments Gate
on:
  issue_comment:
    types: [created, edited, deleted]
  pull_request:
    types: [opened, synchronize, reopened]
permissions:
  statuses: write
  pull-requests: read
  issues: read
jobs:
  gate:
    if: github.event_name == 'pull_request' || github.event.issue.pull_request
    runs-on: ubuntu-latest
    steps:
      - uses: actions/github-script@v7
        with:
          script: |
            const prNumber =
              context.payload.pull_request?.number ?? context.payload.issue.number
            const { data: pr } = await github.rest.pulls.get({
              ...context.repo, pull_number: prNumber,
            })
            const comments = await github.paginate(github.rest.issues.listComments, {
              ...context.repo, issue_number: prNumber, per_page: 100,
            })
            const MARKER = '<!-- preview-comments:'
            let unresolved = 0, total = 0
            for (const { body = '' } of comments) {
              const start = body.indexOf(MARKER)
              if (start === -1) continue
              const end = body.indexOf(' -->', start)
              if (end === -1) continue
              total += 1
              try {
                if (!JSON.parse(body.slice(start + MARKER.length, end)).resolved) unresolved += 1
              } catch { unresolved += 1 }
            }
            await github.rest.repos.createCommitStatus({
              ...context.repo,
              sha: pr.head.sha,
              context: 'preview-comments',
              state: unresolved === 0 ? 'success' : 'failure',
              description: total === 0
                ? 'No preview comments'
                : `${unresolved} unresolved of ${total} preview comment(s)`,
            })
```

The check is informational by default. To make it block merges, add `preview-comments` to the required status checks in the branch protection (or ruleset) for your default branch:

```bash
gh api repos/{owner}/{repo}/branches/main/protection/required_status_checks/contexts \
  -X POST -f "contexts[]=preview-comments"
```

Resolving the last open pin in the preview UI flips the check green within seconds — the widget's Resolve button edits the comment, which re-fires the workflow.
