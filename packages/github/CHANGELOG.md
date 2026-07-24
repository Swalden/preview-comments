# @preview-comments/github

## 0.3.1

### Patch Changes

- Bypass the browser HTTP cache on GitHub API requests (`cache: 'no-store'`).
  GitHub responses carry `Cache-Control: max-age=60`, so reads right after a
  write returned stale data and resolve/reply changes didn't appear in the UI
  for up to a minute.

## 0.3.0

### Minor Changes

- Security and UX fixes:

  - core: OAuth popup now sends the app origin as the `state` param and only
    accepts token messages whose `event.origin` matches the callback worker and
    whose `event.source` is the popup window (requires a callback page that
    posts to the validated `state` origin instead of `'*'`).
  - github: `resolveThread` now toggles the resolved state (Reopen previously
    re-resolved), and API errors carry a `status` property.
  - ui: comment author, body, and pathname are rendered with `textContent`
    instead of `innerHTML` (XSS fix); pins re-anchor on scroll/resize and the
    open popover follows its pin; resolve/delete/reply surface errors inline
    instead of failing silently; a 401 clears the stored token so the sign-in
    flow reappears.

### Patch Changes

- Updated dependencies []:
  - @preview-comments/core@0.2.0

## 0.2.1

### Patch Changes

- [`28ce5ca`](https://github.com/Swalden/preview-comments/commit/28ce5ca448d46065371fd9ba3be1016cacbc0bc5) Thanks [@Swalden](https://github.com/Swalden)! - Fix /user API endpoint to use absolute GitHub API URL instead of repo-relative path

## 0.2.0

### Minor Changes

- [`ff7f4fa`](https://github.com/Swalden/preview-comments/commit/ff7f4faf079a43f7a906e4f7f7e4261bdc94c9d7) Thanks [@Swalden](https://github.com/Swalden)! - Replace `repo` + `pr` config with `issuesPath` for a generic GitHub issues path

## 0.1.0

### Minor Changes

- [`e3f4b99`](https://github.com/Swalden/preview-comments/commit/e3f4b9985aa229d02ed629da274aba3d1f112be1) Thanks [@Swalden](https://github.com/Swalden)! - First public npm release for the preview comments packages.

### Patch Changes

- Updated dependencies [[`e3f4b99`](https://github.com/Swalden/preview-comments/commit/e3f4b9985aa229d02ed629da274aba3d1f112be1)]:
  - @preview-comments/core@0.1.0
