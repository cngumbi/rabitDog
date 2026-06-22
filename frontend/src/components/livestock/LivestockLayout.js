import DashboardMenu from '../dashboard/dashboardMenu';
import LivestockNav from './livestockNav';
import { livestockAPI } from '../../connection/livestockAPI';
import { initLivestockNavRefresh } from './livestockNavRefresh';

if (typeof window !== 'undefined') {
  window.livestockAPI = livestockAPI;
  initLivestockNavRefresh();
}

const LivestockLayout = {
  render({
    activePath = window.location.hash.slice(1).toLowerCase() || '/livestock',
    heroHtml = '',
    title = '',
    subtitle = '',
    actions = '',
    stats = '',
    pageTitle = '',
    description = '',
    heroActions = '',
    heroMeta = '',
    contentHtml = ''
  }) {
    const heroTitle = title || pageTitle;
    const heroSubtitle = subtitle || description;
    const heroActionsHtml = actions || heroActions;
    const heroStatsHtml = stats || heroMeta;

    const heroSection = heroHtml || `
      <section class="dashboard-hero">
        <div class="dashboard-hero-copy">
          <span class="dashboard-pill">Livestock Management</span>
          ${heroTitle ? `<h1>${heroTitle}</h1>` : ''}
          ${heroSubtitle ? `<p>${heroSubtitle}</p>` : ''}
          ${heroActionsHtml}
        </div>
        ${heroStatsHtml ? `<div class="dashboard-hero-meta">${heroStatsHtml}</div>` : ''}
      </section>
    `;

    return `
      <div class="wrap livestock-wrap">
        ${DashboardMenu.render({ selected: 'livestock' })}
        <div class="main">
          ${heroSection}
          ${LivestockNav.render(activePath)}
          ${contentHtml}
        </div>
      </div>
    `;
  }
};

export default LivestockLayout;
