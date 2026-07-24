# @preview-comments/ui

## 0.3.1

### Patch Changes

- Update thread state locally after resolve/reply instead of refetching.
  GitHub's list API serves stale comment bodies for a few seconds after a
  write, so the post-write refetch showed the old state and toggles appeared
  to do nothing.

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

## 0.2.0

### Minor Changes

- [`fc7750c`](https://github.com/Swalden/preview-comments/commit/fc7750c76f8d2b0d26256270e9990c61da0916da) Thanks [@Swalden](https://github.com/Swalden)! - Add optional logout button to toolbar via `onLogout` callback

## 0.1.0

### Minor Changes

- [`e3f4b99`](https://github.com/Swalden/preview-comments/commit/e3f4b9985aa229d02ed629da274aba3d1f112be1) Thanks [@Swalden](https://github.com/Swalden)! - First public npm release for the preview comments packages.

### Patch Changes

- Updated dependencies [[`e3f4b99`](https://github.com/Swalden/preview-comments/commit/e3f4b9985aa229d02ed629da274aba3d1f112be1)]:
  - @preview-comments/core@0.1.0
