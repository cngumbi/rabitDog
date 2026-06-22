let livestockNavRefreshStarted = false;

async function refreshLivestockNav() {
  if (typeof window === 'undefined' || !window.livestockAPI) return;

  try {
    const results = await Promise.all([
      window.livestockAPI.getAllBatches(),
      window.livestockAPI.getAllRecords(),
      window.livestockAPI.getAllFeedingRecords(),
      window.livestockAPI.getAllHealthRecords(),
      window.livestockAPI.getAllProductionRecords(),
      window.livestockAPI.getAllTypes()
    ].map((p) => p.catch(() => ({ data: [] }))));

    const stats = {
      batches: { metric: (results[0].data && results[0].data.length) || 0, sub: 'Batches' },
      animals: { metric: (results[1].data && results[1].data.length) || 0, sub: 'Animals' },
      feeding: { metric: (results[2].data && results[2].data.length) || 0, sub: 'Feeding events' },
      health: { metric: (results[3].data && results[3].data.length) || 0, sub: 'Health events' },
      production: { metric: (results[4].data && results[4].data.length) || 0, sub: 'Production records' },
      types: { metric: (results[5].data && results[5].data.length) || 0, sub: 'Livestock types' }
    };

    window.livestockNavStats = stats;

    Object.keys(stats).forEach((key) => {
      const card = document.querySelector(`.livestock-nav.cards [data-key="${key}"]`);
      if (!card) return;
      const valueEl = card.querySelector('.stat-value');
      const subEl = card.querySelector('.stat-sub');
      if (valueEl) valueEl.textContent = stats[key].metric;
      if (subEl) subEl.textContent = stats[key].sub;
    });
  } catch (error) {
    // ignore refresh errors to keep page stable
  }
}

function scheduleRefresh() {
  refreshLivestockNav();
  setInterval(refreshLivestockNav, 30000);
}

export function initLivestockNavRefresh() {
  if (typeof window === 'undefined' || livestockNavRefreshStarted) return;
  livestockNavRefreshStarted = true;

  if (window.livestockAPI) {
    setTimeout(scheduleRefresh, 0);
    return;
  }

  const checkApi = setInterval(() => {
    if (window.livestockAPI) {
      clearInterval(checkApi);
      scheduleRefresh();
    }
  }, 250);
}
