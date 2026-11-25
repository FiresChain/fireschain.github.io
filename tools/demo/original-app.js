import {button, icon} from './ui.js';

const definitions = {
  flow: {label: 'Flow', path: '/onmyoji-flow/'},
  yuhun: {label: 'Yuhun', path: '/onmyoji-yuhun/'},
  team: {label: 'Team', path: '/onmyoji-team/'}
};
let original = false;
let activePreview = null;

export function syncTheme() {
  if (!activePreview?.frame.isConnected) return;
  const {frame, path} = activePreview;
  const page = frame.contentDocument;
  if (!page?.location?.pathname.startsWith(path)) return;
  page.documentElement.dataset.toolsTheme = original ? 'original' : document.documentElement.dataset.theme;
}

export function createOriginalApp(id) {
  const {label, path} = definitions[id];
  const url = `https://fireschain.org${path}`;

  return {
    render() {
      const comparison = original ? '显示统一主题' : '对比原主题';
      return `<section class="original-app-preview"><div class="theme-preview-bar">
        <span class="row"><strong>${label}</strong><small class="theme-preview-status" role="status">正在加载主题预览…</small></span>
        <div class="row">${button('original-theme', comparison, 'eye', 'small', `disabled aria-pressed="${original}"`)}
          <a href="${url}" target="_blank" rel="noopener" class="notice-small">在新标签页打开 ↗</a>
        </div></div>
        <iframe class="original-tool-frame" title="${label} 主题预览" allow="clipboard-read; clipboard-write"></iframe>
      </section>`;
    },
    mount({root}) {
      const frame = root.querySelector('.original-tool-frame');
      const compare = root.querySelector('[data-action="original-theme"]');
      const status = root.querySelector('.theme-preview-status');
      activePreview = {frame, path};
      frame.addEventListener('load', () => {
        if (activePreview?.frame !== frame) return;
        const page = frame.contentDocument;
        const appRoot = page?.documentElement;
        const isAppPage = page?.location?.pathname.startsWith(path);
        const palette = isAppPage && page.defaultView.getComputedStyle(appRoot).getPropertyValue('--fc-accent');
        compare.disabled = !(palette || (isAppPage && appRoot.dataset.toolsTheme === 'original'));
        status.textContent = compare.disabled ? '主题预览暂不可用' : '主题预览';
        if (!compare.disabled) syncTheme();
      });
      frame.src = url;
    },
    action(action, control) {
      if (action !== 'original-theme') return;
      original = !original;
      control.innerHTML = icon('eye') + (original ? '显示统一主题' : '对比原主题');
      control.setAttribute('aria-pressed', String(original));
      syncTheme();
    },
    leave() {
      activePreview = null;
    }
  };
}
