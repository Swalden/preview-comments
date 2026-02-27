# Releasing To npm

## One-time setup

1. Make sure npm has access to the `@preview-comments` scope.
2. In GitHub (`Swalden/preview-comments`), add repository secret `NPM_TOKEN`.
3. Create an npm automation token (classic or granular) with publish access for the scope.
4. Keep package scope public (already configured via `publishConfig.access = "public"`).

## Versioning workflow

1. Add a changeset on your feature branch:

```bash
pnpm changeset
```

2. Commit the generated file in `.changeset/*.md`.
3. Merge to `main`.

## What happens on main

The `Release` GitHub Action will:

1. Install dependencies
2. Build all packages
3. If there are unpublished changesets:
   - open/update a release PR with bumped versions
4. Once the release PR is merged:
   - publish packages to npm using `NPM_TOKEN`

## Manual release (optional)

If you want to publish manually from your machine:

```bash
npm adduser
pnpm release
```

This runs build + `changeset publish`.
