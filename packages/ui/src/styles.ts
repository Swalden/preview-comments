export const baseStyles = `
  :host {
    --pc-accent: #0070f3;
    --pc-accent-hover: #005bb5;
    --pc-bg: #ffffff;
    --pc-text: #111111;
    --pc-text-muted: #666666;
    --pc-border: #e2e2e2;
    --pc-radius: 8px;
    --pc-font: system-ui, -apple-system, sans-serif;
    --pc-pin-size: 28px;

    font-family: var(--pc-font);
    font-size: 14px;
    line-height: 1.4;
    color: var(--pc-text);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .pc-toolbar {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 999999;
    display: flex;
    align-items: center;
    gap: 8px;
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
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    transition: background 0.15s;
    position: relative;
  }

  .pc-toolbar-btn:hover { background: var(--pc-accent-hover); }
  .pc-toolbar-btn.active { background: var(--pc-accent-hover); outline: 2px solid white; }

  .pc-badge {
    position: absolute;
    top: -4px;
    right: -4px;
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
    width: 300px;
    background: var(--pc-bg);
    border: 1px solid var(--pc-border);
    border-radius: var(--pc-radius);
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
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

  .pc-input {
    flex: 1;
    border: 1px solid var(--pc-border);
    border-radius: 6px;
    padding: 6px 10px;
    font-size: 13px;
    font-family: var(--pc-font);
    outline: none;
    resize: none;
  }

  .pc-input:focus { border-color: var(--pc-accent); }

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
`
