import DashboardMenu from '../dashboard/dashboardMenu';
import LivestockNav from './livestockNav';
import { livestockAPI } from '../../connection/livestockAPI';

if (typeof window !== 'undefined') {
  window.livestockAPI = livestockAPI;
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
          <script>(function(){
            async function refreshLivestockNav(){
              try{
                var results = await Promise.all([
                  window.livestockAPI.getAllBatches(),
                  window.livestockAPI.getAllRecords(),
                  window.livestockAPI.getAllFeedingRecords(),
                  window.livestockAPI.getAllHealthRecords(),
                  window.livestockAPI.getAllProductionRecords(),
                  window.livestockAPI.getAllTypes()
                ].map(function(p){ return p.catch(function(){ return { data: [] }; }); }));
                var stats = {
                  batches: { metric: (results[0].data && results[0].data.length) || 0, sub: 'Batches' },
                  animals: { metric: (results[1].data && results[1].data.length) || 0, sub: 'Animals' },
                  feeding: { metric: (results[2].data && results[2].data.length) || 0, sub: 'Feeding events' },
                  health: { metric: (results[3].data && results[3].data.length) || 0, sub: 'Health events' },
                  production: { metric: (results[4].data && results[4].data.length) || 0, sub: 'Production records' },
                  types: { metric: (results[5].data && results[5].data.length) || 0, sub: 'Livestock types' }
                };
                window.livestockNavStats = stats;
                Object.keys(stats).forEach(function(k){
                  var card = document.querySelector('.livestock-nav.cards [data-key="'+k+'"]');
                  if(card){ var v = card.querySelector('.stat-value'); var s = card.querySelector('.stat-sub'); if(v) v.textContent = stats[k].metric; if(s) s.textContent = stats[k].sub; }
                });
              }catch(e){ }
            }
            function scheduleRefresh(){
              refreshLivestockNav();
              setInterval(refreshLivestockNav, 30000);
            }
            if(window && window.livestockAPI){ scheduleRefresh(); }
            else {
              var check = setInterval(function(){ if(window && window.livestockAPI){ clearInterval(check); scheduleRefresh(); } }, 250);
            }
          })();</script>
          ${contentHtml}
        </div>
      </div>
    `;
  }
};

export default LivestockLayout;
