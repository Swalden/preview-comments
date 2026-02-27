# preview-comments

Monorepo for the `@preview-comments/*` packages.

## Packages

- `@preview-comments/core`
- `@preview-comments/ui`
- `@preview-comments/local`
- `@preview-comments/github`

## Install

```bash
pnpm install
```

## Build

```bash
pnpm build
```

## Test

```bash
pnpm test
```

## Publish

Publishing is manual from a local machine (no CI release workflow).

1. Log in to npm:

```bash
npm adduser
```

2. Add a changeset:

```bash
pnpm changeset
```

3. Publish:

```bash
pnpm release
```

For more details, see [`docs/releasing.md`](./docs/releasing.md).
