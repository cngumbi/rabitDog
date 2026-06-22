import { SvgIcons } from '../svgIcons';

const LivestockNav = {
  render(activePath = window.location.hash.slice(1).toLowerCase() || '/livestock') {
    const navItems = [
      { href: '/livestock', key: 'batches', label: 'Batches', metric: '', sub: 'Manage batches', icon: SvgIcons.render('batches') },
      { href: '/livestock/animals', key: 'animals', label: 'Animals', metric: '', sub: 'Individual records', icon: SvgIcons.render('animals') },
      { href: '/livestock/feeding', key: 'feeding', label: 'Feeding', metric: '', sub: 'Feeding logs', icon: SvgIcons.render('feeding') },
      { href: '/livestock/health', key: 'health', label: 'Health', metric: '', sub: 'Medical events', icon: SvgIcons.render('health') },
      { href: '/livestock/production', key: 'production', label: 'Production', metric: '', sub: 'Output & sales', icon: SvgIcons.render('production') },
      { href: '/livestock/types', key: 'types', label: 'Types', metric: '', sub: 'Livestock types', icon: SvgIcons.render('types') }
    ];

    const isActive = (href) => {
      if (href === '/livestock') return activePath === href;
      return activePath === href || activePath.startsWith(`${href}/`);
    };

    // Allow pages to inject simple stats onto window.livestockNavStats = { key: { metric, sub } }
    const stats = (window && window.livestockNavStats) || {};

    return `
      <nav class="livestock-nav cards" role="navigation" aria-label="Livestock navigation">
        ${navItems.map(item => `
          <a href="/#${item.href}" class="stat-card nav-card ${isActive(item.href) ? 'active' : ''}" data-key="${item.key}">
            <div class="stat-card-left">
              <div class="stat-icon">${item.icon}</div>
            </div>
            <div class="stat-card-body">
              <div class="stat-label">${item.label}</div>
              <div class="stat-value">${(stats[item.key] && stats[item.key].metric) || item.metric || '—'}</div>
              <div class="stat-sub">${(stats[item.key] && stats[item.key].sub) || item.sub}</div>
            </div>
          </a>
        `).join('')}
      </nav>
    `;
  }
};

export default LivestockNav;
