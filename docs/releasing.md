# Releasing To npm

Publishing is local/manual only. There is no CI publish workflow.

## One-time setup

1. Ensure you can publish to the `@preview-comments` npm scope.
2. Authenticate locally:

```bash
npm adduser
```

## Versioning

Create a changeset for package version bumps:

```bash
pnpm changeset
```

Commit the generated file in `.changeset/*.md`.

## Publish locally

Run:

```bash
pnpm release
```

This runs build + `changeset publish`.

## Verify packages

Check published versions:

```bash
npm view @preview-comments/core version
npm view @preview-comments/ui version
npm view @preview-comments/local version
npm view @preview-comments/github version
```
