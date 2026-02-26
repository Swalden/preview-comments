export const baseStyles = `
  :host {
    --pc-accent: #4f6ff7;
    --pc-accent-hover: #3f5be6;
    --pc-bg: #0f1014;
    --pc-bg-soft: #1a1c23;
    --pc-text: #f3f4f8;
    --pc-text-muted: #b9bdc9;
    --pc-border: #2a2d38;
    --pc-radius: 12px;
    --pc-font: "Inter", "SF Pro Text", "Segoe UI", sans-serif;
    --pc-pin-size: 28px;

    font-family: var(--pc-font);
    font-size: 14px;
    line-height: 1.4;
    color: var(--pc-text);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .pc-toolbar {
    position: fixed;
    bottom: 22px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 999999;
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(17, 19, 25, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 999px;
    padding: 10px 12px;
    backdrop-filter: blur(8px);
    box-shadow: 0 14px 34px rgba(0, 0, 0, 0.35);
  }

  .pc-toolbar-segment {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .pc-toolbar-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: none;
    background: var(--pc-accent);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08), 0 4px 10px rgba(0,0,0,0.32);
    transition: background 0.15s, transform 0.12s;
    position: relative;
  }

  .pc-toolbar-btn:active { transform: scale(0.98); }
  .pc-toolbar-btn:hover { background: var(--pc-accent-hover); }
  .pc-toolbar-btn.active { background: var(--pc-accent-hover); outline: 2px solid rgba(255,255,255,0.35); }

  .pc-people {
    display: none;
    align-items: center;
    margin-left: 2px;
  }

  .pc-avatar {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    color: #0f1014;
    background: linear-gradient(135deg, #f7c948, #f59e0b);
    border: 2px solid #1a1c23;
    margin-left: -7px;
  }

  .pc-avatar:first-child { margin-left: 0; }

  .pc-badge {
    position: absolute;
    top: -2px;
    right: -2px;
    background: #ef4444;
    color: white;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    font-size: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
  }

  .pc-pin {
    position: fixed;
    width: var(--pc-pin-size);
    height: var(--pc-pin-size);
    border-radius: 50% 50% 50% 0;
    background: var(--pc-accent);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transform: rotate(-45deg) translate(-50%, -50%);
    transform-origin: top left;
    box-shadow: 0 2px 6px rgba(0,0,0,0.25);
    z-index: 999998;
    transition: transform 0.1s;
  }

  .pc-pin span { transform: rotate(45deg); }
  .pc-pin:hover { transform: rotate(-45deg) translate(-50%, -50%) scale(1.15); }
  .pc-pin.resolved { background: #9ca3af; }

  .pc-popover {
    position: fixed;
    width: min(360px, calc(100vw - 20px));
    background: var(--pc-bg);
    border: 1px solid var(--pc-border);
    border-radius: var(--pc-radius);
    box-shadow: 0 20px 40px rgba(0,0,0,0.35);
    z-index: 999999;
    overflow: hidden;
  }

  .pc-popover-header {
    padding: 10px 12px;
    border-bottom: 1px solid var(--pc-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: var(--pc-text-muted);
  }

  .pc-comment {
    padding: 10px 12px;
    border-bottom: 1px solid var(--pc-border);
  }

  .pc-comment-author {
    font-weight: 600;
    font-size: 13px;
    margin-bottom: 4px;
  }

  .pc-comment-body { font-size: 13px; }

  .pc-comment-time { font-size: 11px; color: var(--pc-text-muted); margin-top: 4px; }

  .pc-input-area {
    padding: 10px 12px;
    display: flex;
    gap: 8px;
  }

  .pc-inline-status {
    padding: 0 12px 10px;
    font-size: 12px;
    color: #fda4af;
  }

  .pc-input {
    flex: 1;
    border: 1px solid var(--pc-border);
    background: var(--pc-bg-soft);
    color: var(--pc-text);
    border-radius: 6px;
    padding: 6px 10px;
    font-size: 13px;
    font-family: var(--pc-font);
    outline: none;
    resize: none;
  }

  .pc-input:focus { border-color: var(--pc-accent); }
  .pc-input::placeholder { color: var(--pc-text-muted); }

  .pc-btn {
    padding: 6px 12px;
    border: none;
    border-radius: 6px;
    background: var(--pc-accent);
    color: white;
    font-size: 13px;
    cursor: pointer;
    font-family: var(--pc-font);
  }

  .pc-btn:hover { background: var(--pc-accent-hover); }

  .pc-btn-ghost {
    background: transparent;
    color: var(--pc-text-muted);
    border: none;
    cursor: pointer;
    font-size: 12px;
    padding: 4px 8px;
  }

  .pc-btn-ghost:hover { color: var(--pc-text); }

  .pc-login {
    padding: 20px;
    text-align: center;
  }

  .pc-login p {
    margin-bottom: 12px;
    color: var(--pc-text-muted);
    font-size: 13px;
  }

  @media (max-width: 720px) {
    .pc-toolbar {
      left: 50%;
      bottom: 12px;
      width: calc(100vw - 20px);
      max-width: 520px;
      justify-content: center;
    }
  }
`
