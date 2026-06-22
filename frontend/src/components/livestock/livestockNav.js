import { SvgIcons } from '../svgIcons';

const LivestockNav = {
  render(activePath = window.location.hash.slice(1).toLowerCase() || '/livestock') {
    const navItems = [
      { href: '/livestock', label: 'Batches', icon: SvgIcons.render('batches') },
      { href: '/livestock/add', label: 'New Batch', icon: SvgIcons.render('add') },
      { href: '/livestock/animals', label: 'Animals', icon: SvgIcons.render('animals') },
      { href: '/livestock/types', label: 'Types', icon: SvgIcons.render('types') },
      { href: '/livestock/health', label: 'Health', icon: SvgIcons.render('health') },
      { href: '/livestock/feeding', label: 'Feeding', icon: SvgIcons.render('feeding') },
      { href: '/livestock/production', label: 'Production', icon: SvgIcons.render('production') }
    ];

    const isActive = (href) => {
      if (href === '/livestock') {
        return activePath === href;
      }
      return activePath === href || activePath.startsWith(`${href}/`);
    };

    return `
      <nav class="livestock-nav pills" role="navigation" aria-label="Livestock navigation">
        ${navItems.map(item => `
          <a href="/#${item.href}" class="nav-item ${isActive(item.href) ? 'active' : ''}">
            <span class="nav-icon" aria-hidden="true">${item.icon}</span>
            <span class="nav-label">${item.label}</span>
          </a>
        `).join('')}
      </nav>
    `;
  }
};

export default LivestockNav;
