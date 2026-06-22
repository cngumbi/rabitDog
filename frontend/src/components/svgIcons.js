export const SvgIcons = {
  icons: {
    batches: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2" fill="currentColor" opacity="0.15"/><path d="M7 6h10M7 18h10M7 12h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
    add: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
    animals: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16c-1.333 0-4 1.333-4 4 0 0 1.333-3.333 4-3.333S13 20 13 20c0-2.667-2.667-4-4-4zM18 16c-1.333 0-4 1.333-4 4 0 0 1.333-3.333 4-3.333S22 20 22 20c0-2.667-2.667-4-4-4z" fill="currentColor"/><path d="M6 14c1.5-3 5-6 9-6s7.5 3 9 6" stroke="currentColor" stroke-width="2" fill="none"/></svg>`,
    types: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
    health: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><rect x="6" y="6" width="12" height="12" rx="3" stroke="currentColor" stroke-width="2" fill="none"/></svg>`,
    feeding: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19c1.333-3 3.667-4 6-4s4.667 1 6 4" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 3c1.657 0 3 1.343 3 3H9c0-1.657 1.343-3 3-3z" fill="currentColor"/><path d="M12 6v8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
    production: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 17l6-6 4 4 6-6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
  },

  render(iconKey) {
    return this.icons[iconKey] || this.icons.add;
  }
};
